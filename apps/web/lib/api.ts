import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { VocabularyItem } from "@vocablens/shared";
import { createRequestClient, hasSupabaseConfig } from "./supabase/server";

export type RequestContext = { supabase: SupabaseClient | null; user: User | null; demo: boolean };

export async function getRequestContext(request: Request): Promise<RequestContext> {
  const supabase = createRequestClient(request);
  if (!supabase || (!hasSupabaseConfig() && process.env.NODE_ENV !== "production")) {
    return { supabase: null, user: null, demo: true };
  }
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user, demo: false };
}

export function unauthorized() {
  return Response.json({ error: "Bạn cần đăng nhập để thực hiện thao tác này.", code: "AUTH_REQUIRED" }, { status: 401 });
}

export function dbRowToWord(row: Record<string, unknown>): VocabularyItem {
  const occurrences = Array.isArray(row.word_occurrences) ? row.word_occurrences : [];
  return {
    id: String(row.id), userId: String(row.user_id), term: String(row.term), normalizedTerm: String(row.normalized_term),
    phonetic: String(row.phonetic ?? ""), audioUrl: row.audio_url ? String(row.audio_url) : undefined,
    definitions: (row.definitions ?? []) as VocabularyItem["definitions"], translationVi: String(row.translation_vi),
    synonyms: (row.synonyms ?? []) as string[], antonyms: (row.antonyms ?? []) as string[], examples: (row.examples ?? []) as string[],
    source: "cache", reviewScore: Number(row.review_score), lastReviewedAt: row.last_reviewed_at ? String(row.last_reviewed_at) : null,
    nextReviewAt: String(row.next_review_at), createdAt: String(row.created_at), updatedAt: String(row.updated_at),
    occurrences: occurrences.map((occurrence: Record<string, unknown>) => ({
      id: String(occurrence.id), contextSentence: String(occurrence.context_sentence ?? ""), sourceUrl: String(occurrence.source_url),
      sourceTitle: String(occurrence.source_title ?? ""), createdAt: String(occurrence.created_at)
    }))
  };
}
