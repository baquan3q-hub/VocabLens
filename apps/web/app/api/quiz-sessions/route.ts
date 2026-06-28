import { quizSessionSchema } from "@vocablens/shared";
import { getRequestContext, unauthorized } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const input = quizSessionSchema.parse(await request.json());
    const score = input.answers.filter(answer => answer.isCorrect).length;
    const context = await getRequestContext(request);
    if (context.demo) return Response.json({ data: { id: crypto.randomUUID(), score, total: input.answers.length }, demo: true }, { status: 201 });
    if (!context.user || !context.supabase) return unauthorized();
    const { data: session, error } = await context.supabase.from("quiz_sessions").insert({
      user_id: context.user.id, mode: "mixed", score, total: input.answers.length
    }).select("id").single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    const { error: answersError } = await context.supabase.from("quiz_answers").insert(input.answers.map(answer => ({
      user_id: context.user!.id, quiz_session_id: session.id, vocabulary_item_id: answer.wordId,
      prompt: answer.prompt, selected_answer: answer.selectedAnswer, correct_answer: answer.correctAnswer,
      is_correct: answer.isCorrect, response_ms: answer.responseMs
    })));
    if (answersError) return Response.json({ error: answersError.message }, { status: 500 });
    return Response.json({ data: { id: session.id, score, total: input.answers.length } }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Không thể lưu kết quả." }, { status: 400 });
  }
}
