import { getDemoWords } from "@/lib/demo-server-store";
import { dbRowToWord, getRequestContext, unauthorized } from "@/lib/api";

export async function GET(request: Request) {
  const context = await getRequestContext(request);
  const now = new Date().toISOString();
  if (context.demo) {
    const words = getDemoWords();
    const due = words.filter(word => word.nextReviewAt <= now).sort((a, b) => a.reviewScore - b.reviewScore);
    return Response.json({ data: due.length ? due : words.slice(0, 4), demo: true });
  }
  if (!context.user || !context.supabase) return unauthorized();
  const { data, error } = await context.supabase.from("vocabulary_items").select("*, word_occurrences(*)")
    .eq("user_id", context.user.id).lte("next_review_at", now).order("review_score").order("next_review_at").limit(50);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data: (data ?? []).map(row => dbRowToWord(row)) });
}
