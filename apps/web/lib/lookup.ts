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
  if (!key) return null;
  const model = process.env.GEMINI_MODEL || "gemini-3-flash";
  const prompt = `Dịch ngắn gọn từ tiếng Anh sang tiếng Việt. Chỉ trả về nghĩa tiếng Việt, không giải thích.\nTừ: ${term}\nĐịnh nghĩa: ${definition}\nNgữ cảnh: ${context ?? "không có"}`;
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: "POST", headers: { "content-type": "application/json" }, signal: AbortSignal.timeout(8_000),
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, maxOutputTokens: 80 } })
    });
    if (!response.ok) return null;
    const body = await response.json();
    return body.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch { return null; }
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
    const translation = await translateWithGemini(term, definitions[0].text, context)
      ?? FALLBACKS[term]?.translation
      ?? `Nghĩa của “${term}” trong ngữ cảnh`;
    const result: LexicalEntry = {
      term: row.word ?? term, normalizedTerm: term, phonetic: row.phonetic ?? row.phonetics?.find(item => item.text)?.text ?? "",
      audioUrl: firstAudio, definitions, translationVi: translation, synonyms, antonyms, examples, source: "dictionaryapi"
    };
    await saveCache(term, result);
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
