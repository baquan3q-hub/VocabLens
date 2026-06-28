import { reviewRequestSchema, scheduleReview } from "@vocablens/shared";
import { getDemoWords } from "@/lib/demo-server-store";
import { getRequestContext, unauthorized } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const input = reviewRequestSchema.parse(await request.json());
    const context = await getRequestContext(request);
    if (context.demo) {
      const word = getDemoWords().find(item => item.id === input.wordId);
      if (!word) return Response.json({ error: "Không tìm thấy từ." }, { status: 404 });
      const result = scheduleReview(word.reviewScore, input.outcome);
      word.reviewScore = result.score; word.lastReviewedAt = new Date().toISOString(); word.nextReviewAt = result.nextReviewAt; word.updatedAt = new Date().toISOString();
      return Response.json({ data: result, demo: true });
    }
    if (!context.user || !context.supabase) return unauthorized();
    const { data: item, error: readError } = await context.supabase.from("vocabulary_items")
      .select("review_score").eq("id", input.wordId).eq("user_id", context.user.id).single();
    if (readError || !item) return Response.json({ error: "Không tìm thấy từ." }, { status: 404 });
    const result = scheduleReview(item.review_score, input.outcome);
    const { error: updateError } = await context.supabase.from("vocabulary_items").update({
      review_score: result.score, last_reviewed_at: new Date().toISOString(), next_review_at: result.nextReviewAt
    }).eq("id", input.wordId).eq("user_id", context.user.id);
    if (updateError) return Response.json({ error: updateError.message }, { status: 500 });
    const { error: eventError } = await context.supabase.from("review_events").insert({
      user_id: context.user.id, vocabulary_item_id: input.wordId, outcome: input.outcome,
      previous_score: result.previousScore, new_score: result.score, interval_days: result.intervalDays
    });
    if (eventError) return Response.json({ error: eventError.message }, { status: 500 });
    return Response.json({ data: result });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Dữ liệu không hợp lệ." }, { status: 400 });
  }
}
