import { generateQuizQuestions, quizGenerateSchema } from "@vocablens/shared";
import { getDemoWords } from "@/lib/demo-server-store";
import { dbRowToWord, getRequestContext, unauthorized } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const input = quizGenerateSchema.parse(await request.json());
    const context = await getRequestContext(request);
    let words = getDemoWords();
    if (!context.demo) {
      if (!context.user || !context.supabase) return unauthorized();
      const { data, error } = await context.supabase.from("vocabulary_items").select("*, word_occurrences(*)")
        .eq("user_id", context.user.id).limit(100);
      if (error) return Response.json({ error: error.message }, { status: 500 });
      words = (data ?? []).map(row => dbRowToWord(row));
    }
    if (words.length < 4) return Response.json({ error: "Cần ít nhất 4 từ để tạo quiz." }, { status: 400 });
    return Response.json({ data: generateQuizQuestions(words, input.count, input.direction), demo: context.demo });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Không thể tạo quiz." }, { status: 400 });
  }
}
