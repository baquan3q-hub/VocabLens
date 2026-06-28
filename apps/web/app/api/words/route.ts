import { saveWordSchema } from "@vocablens/shared";
import { getDemoWords, saveDemoWord } from "@/lib/demo-server-store";
import { dbRowToWord, getRequestContext, unauthorized } from "@/lib/api";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim().toLowerCase() ?? "";
  const score = url.searchParams.get("score");
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? 20)));
  const context = await getRequestContext(request);
  if (context.demo) {
    const filtered = getDemoWords().filter(word => (!search || word.normalizedTerm.includes(search) || word.translationVi.toLowerCase().includes(search)) && (!score || word.reviewScore === Number(score)));
    return Response.json({ data: filtered.slice((page - 1) * limit, page * limit), meta: { page, limit, total: filtered.length, demo: true } });
  }
  if (!context.user || !context.supabase) return unauthorized();
  let query = context.supabase.from("vocabulary_items")
    .select("*, word_occurrences(*)", { count: "exact" }).eq("user_id", context.user.id)
    .order("created_at", { ascending: false }).range((page - 1) * limit, page * limit - 1);
  if (search) query = query.or(`normalized_term.ilike.%${search}%,translation_vi.ilike.%${search}%`);
  if (score) query = query.eq("review_score", Number(score));
  const { data, count, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data: (data ?? []).map(row => dbRowToWord(row)), meta: { page, limit, total: count ?? 0 } });
}

export async function POST(request: Request) {
  try {
    const input = saveWordSchema.parse(await request.json());
    const context = await getRequestContext(request);
    if (context.demo) {
      const result = saveDemoWord(input.entry, input.occurrence);
      return Response.json({ data: result.word, duplicate: result.duplicate, demo: true }, { status: result.duplicate ? 200 : 201 });
    }
    if (!context.user || !context.supabase) return unauthorized();
    const entry = input.entry;
    const { data: item, error: itemError } = await context.supabase.from("vocabulary_items").upsert({
      user_id: context.user.id, term: entry.term, normalized_term: entry.normalizedTerm, phonetic: entry.phonetic,
      audio_url: entry.audioUrl, definitions: entry.definitions, translation_vi: entry.translationVi,
      synonyms: entry.synonyms, antonyms: entry.antonyms, examples: entry.examples
    }, { onConflict: "user_id,normalized_term", ignoreDuplicates: true }).select("id").maybeSingle();
    let itemId = item?.id;
    if (!itemId) {
      const { data: existing } = await context.supabase.from("vocabulary_items").select("id").eq("user_id", context.user.id).eq("normalized_term", entry.normalizedTerm).single();
      itemId = existing?.id;
    }
    if (itemError || !itemId) return Response.json({ error: itemError?.message ?? "Không thể lưu từ." }, { status: 500 });
    const { error: occurrenceError } = await context.supabase.from("word_occurrences").insert({
      user_id: context.user.id, vocabulary_item_id: itemId, context_sentence: input.occurrence.contextSentence,
      source_url: input.occurrence.sourceUrl, source_title: input.occurrence.sourceTitle
    });
    if (occurrenceError) return Response.json({ error: occurrenceError.message }, { status: 500 });
    return Response.json({ data: { id: itemId }, duplicate: !item }, { status: item ? 201 : 200 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Dữ liệu không hợp lệ." }, { status: 400 });
  }
}
