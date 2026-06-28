import { translatePassageSchema } from "@vocablens/shared";
import type { PassageTranslation } from "@vocablens/shared";

async function translatePassageWithGemini(text: string): Promise<PassageTranslation | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const prompt = `Bạn là chuyên gia dịch thuật Anh-Việt chuyên nghiệp. Hãy thực hiện các nhiệm vụ sau:

1. **Dịch đoạn văn** sang tiếng Việt một cách tự nhiên, chính xác, hiểu bối cảnh.
2. **Liệt kê từ vựng khó** (tối đa 10 từ) cho người học tiếng Anh trình độ trung cấp.
3. **Ghi chú ngắn về bối cảnh** của đoạn văn (1-2 câu).

Đoạn văn gốc:
"""
${text}
"""

Trả về **CHỈ** JSON hợp lệ theo format sau, KHÔNG thêm bất kỳ text nào khác:
{
  "translatedText": "bản dịch tiếng Việt tự nhiên của toàn bộ đoạn văn",
  "difficultWords": [
    {
      "word": "từ tiếng Anh",
      "meaning": "nghĩa tiếng Việt ngắn gọn",
      "partOfSpeech": "noun/verb/adj/adv",
      "phonetic": "phiên âm IPA của từ, ví dụ: /jʊˈbɪkwɪtəs/",
      "difficulty": "intermediate hoặc advanced"
    }
  ],
  "contextNote": "ghi chú ngắn về bối cảnh, chủ đề đoạn văn"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: AbortSignal.timeout(20_000),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      console.error(`[VocabLens] Gemini passage translate error: ${response.status}`);
      return null;
    }

    const body = await response.json();
    const rawText = body.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!rawText) return null;

    const firstOpenBrace = rawText.indexOf("{");
    const lastCloseBrace = rawText.lastIndexOf("}");
    if (firstOpenBrace === -1 || lastCloseBrace === -1 || lastCloseBrace < firstOpenBrace) {
      console.error("[VocabLens] Could not find JSON block in Gemini response:", rawText);
      return null;
    }
    const cleanedJson = rawText.slice(firstOpenBrace, lastCloseBrace + 1);
    const parsed = JSON.parse(cleanedJson);
    return {
      originalText: text,
      translatedText: parsed.translatedText || "",
      difficultWords: (parsed.difficultWords || []).map((w: Record<string, unknown>) => ({
        word: String(w.word || ""),
        meaning: String(w.meaning || ""),
        partOfSpeech: typeof w.partOfSpeech === "string" ? w.partOfSpeech : undefined,
        phonetic: typeof w.phonetic === "string" ? w.phonetic : undefined,
        difficulty: w.difficulty === "advanced" ? "advanced" as const : "intermediate" as const
      })).filter((w: { word: string }) => w.word),
      contextNote: parsed.contextNote || undefined
    };
  } catch (error) {
    console.error("[VocabLens] Gemini passage translate error:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const input = translatePassageSchema.parse(await request.json());

    const result = await translatePassageWithGemini(input.text);
    if (!result) {
      return Response.json(
        { error: "Không thể dịch đoạn văn lúc này. Vui lòng thử lại sau." },
        { status: 502 }
      );
    }

    return Response.json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Dữ liệu không hợp lệ.";
    return Response.json({ error: message }, { status: 400 });
  }
}
