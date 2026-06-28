import { deleteDemoWord, getDemoWords } from "@/lib/demo-server-store";
import { dbRowToWord, getRequestContext, unauthorized } from "@/lib/api";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getRequestContext(request);
  if (context.demo) {
    const word = getDemoWords().find(item => item.id === id);
    return word ? Response.json({ data: word, demo: true }) : Response.json({ error: "Không tìm thấy từ." }, { status: 404 });
  }
  if (!context.user || !context.supabase) return unauthorized();
  const { data, error } = await context.supabase.from("vocabulary_items").select("*, word_occurrences(*)").eq("id", id).eq("user_id", context.user.id).single();
  if (error) return Response.json({ error: "Không tìm thấy từ." }, { status: 404 });
  return Response.json({ data: dbRowToWord(data) });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json() as { translationVi?: string; reviewScore?: number };
  const context = await getRequestContext(request);
  if (context.demo) return Response.json({ data: { id, ...body }, demo: true });
  if (!context.user || !context.supabase) return unauthorized();
  const updates: Record<string, unknown> = {};
  if (typeof body.translationVi === "string") updates.translation_vi = body.translationVi.slice(0, 1000);
  if (typeof body.reviewScore === "number") updates.review_score = Math.max(0, Math.min(5, body.reviewScore));
  const { data, error } = await context.supabase.from("vocabulary_items").update(updates).eq("id", id).eq("user_id", context.user.id).select("id").single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ data });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getRequestContext(request);
  if (context.demo) return deleteDemoWord(id) ? new Response(null, { status: 204 }) : Response.json({ error: "Không tìm thấy từ." }, { status: 404 });
  if (!context.user || !context.supabase) return unauthorized();
  const { error } = await context.supabase.from("vocabulary_items").delete().eq("id", id).eq("user_id", context.user.id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return new Response(null, { status: 204 });
}
