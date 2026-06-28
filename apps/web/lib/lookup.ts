import type { LexicalEntry } from "@vocablens/shared";
import { normalizeTerm } from "@vocablens/shared";
import { createAdminClient } from "./supabase/server";

type DictionaryMeaning = {
  partOfSpeech?: string;
  definitions?: Array<{ definition?: string; example?: string; synonyms?: string[]; antonyms?: string[] }>;
  synonyms?: string[];
  antonyms?: string[];
};

type DictionaryResult = {
  word?: string;
  phonetic?: string;
  phonetics?: Array<{ text?: string; audio?: string }>;
  meanings?: DictionaryMeaning[];
};

const FALLBACKS: Record<string, { translation: string; definition: string; partOfSpeech: string }> = {
  paradigm: { translation: "mô hình, khuôn mẫu tư duy", definition: "A typical example or pattern of something.", partOfSpeech: "noun" },
  serendipity: { translation: "sự tình cờ may mắn", definition: "The occurrence of useful discoveries by chance.", partOfSpeech: "noun" },
  ubiquitous: { translation: "có mặt ở khắp mọi nơi", definition: "Present, appearing, or found everywhere.", partOfSpeech: "adjective" }
};

async function fromCache(term: string): Promise<LexicalEntry | null> {
  const admin = createAdminClient();
  if (!admin) return null;
  const { data } = await admin.from("lookup_cache").select("payload, expires_at").eq("normalized_term", term).maybeSingle();
  if (!data || new Date(data.expires_at) <= new Date()) return null;
  return { ...(data.payload as LexicalEntry), source: "cache" };
}

async function saveCache(term: string, payload: LexicalEntry): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;
  const expires = new Date(); expires.setDate(expires.getDate() + 30);
  await admin.from("lookup_cache").upsert({ normalized_term: term, payload, expires_at: expires.toISOString(), updated_at: new Date().toISOString() });
}

async function translateWithGemini(term: string, definition: string, context?: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) { console.error("[VocabLens] No GEMINI_API_KEY found"); return null; }
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  console.log(`[VocabLens] Translating "${term}" with model ${model}`);
  const prompt = `Bạn là chuyên gia dịch thuật Anh-Việt. Hãy dịch nghĩa của từ tiếng Anh sang tiếng Việt.

Yêu cầu:
- Dịch ngắn gọn, chính xác theo nghĩa trong ngữ cảnh
- Chỉ trả về nghĩa tiếng Việt, KHÔNG giải thích thêm
- Nếu có nhiều nghĩa, liệt kê bằng dấu phẩy (tối đa 3 nghĩa)
- Dịch theo bối cảnh câu nếu có

Từ: ${term}
Định nghĩa tiếng Anh: ${definition}
Ngữ cảnh sử dụng: ${context || "không có"}`;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const response = await fetch(url, {
      method: "POST", headers: { "content-type": "application/json" }, signal: AbortSignal.timeout(15_000),
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.15, maxOutputTokens: 200 } })
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[VocabLens] Gemini API error: ${response.status} - ${errorBody}`);
      return null;
    }
    const body = await response.json();
    const result = body.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    console.log(`[VocabLens] Gemini result for "${term}": ${result}`);
    if (result && result.length > 500) return result.slice(0, 500);
    return result;
  } catch (error) { console.error("[VocabLens] Gemini translate error:", error); return null; }
}

export async function lookupTerm(rawTerm: string, context?: string): Promise<LexicalEntry> {
  const term = normalizeTerm(rawTerm);
  const cached = await fromCache(term);
  if (cached) return cached;

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(term)}`, {
      headers: { accept: "application/json" }, signal: AbortSignal.timeout(7_000), next: { revalidate: 2_592_000 }
    });
    if (!response.ok) throw new Error("Dictionary lookup failed");
    const rows = await response.json() as DictionaryResult[];
    const row = rows[0];
    const definitions = (row.meanings ?? []).flatMap(meaning => (meaning.definitions ?? []).slice(0, 2).map(item => ({
      partOfSpeech: meaning.partOfSpeech ?? "word", text: item.definition ?? "", example: item.example
    }))).filter(item => item.text).slice(0, 6);
    if (!definitions.length) throw new Error("No definitions");
    const firstAudio = row.phonetics?.find(item => item.audio)?.audio;
    const synonyms = [...new Set((row.meanings ?? []).flatMap(meaning => [
      ...(meaning.synonyms ?? []), ...(meaning.definitions ?? []).flatMap(item => item.synonyms ?? [])
    ]))].slice(0, 10);
    const antonyms = [...new Set((row.meanings ?? []).flatMap(meaning => [
      ...(meaning.antonyms ?? []), ...(meaning.definitions ?? []).flatMap(item => item.antonyms ?? [])
    ]))].slice(0, 10);
    const examples = definitions.map(item => item.example).filter(Boolean) as string[];
    const geminiTranslation = await translateWithGemini(term, definitions[0].text, context);
    const translation = geminiTranslation
      ?? FALLBACKS[term]?.translation
      ?? definitions[0].text;
    const hasRealTranslation = Boolean(geminiTranslation || FALLBACKS[term]?.translation);
    const result: LexicalEntry = {
      term: row.word ?? term, normalizedTerm: term, phonetic: row.phonetic ?? row.phonetics?.find(item => item.text)?.text ?? "",
      audioUrl: firstAudio, definitions, translationVi: translation, synonyms, antonyms, examples, source: "dictionaryapi"
    };
    if (hasRealTranslation) await saveCache(term, result);
    return result;
  } catch {
    const fallback = FALLBACKS[term];
    if (!fallback) throw new Error(`Không tìm thấy từ “${term}”.`);
    return {
      term, normalizedTerm: term, phonetic: "", definitions: [{ partOfSpeech: fallback.partOfSpeech, text: fallback.definition }],
      translationVi: fallback.translation, synonyms: [], antonyms: [], examples: context ? [context] : [], source: "fallback"
    };
  }
}
