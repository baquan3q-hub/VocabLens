import type { LexicalEntry, VocabularyItem, WordOccurrence } from "@vocablens/shared";
import { demoWords } from "./demo-data";

declare global {
  var __vocablensDemoWords: VocabularyItem[] | undefined;
}

export function getDemoWords(): VocabularyItem[] {
  globalThis.__vocablensDemoWords ??= structuredClone(demoWords);
  return globalThis.__vocablensDemoWords;
}

export function saveDemoWord(entry: LexicalEntry, occurrence: Omit<WordOccurrence, "id" | "createdAt">): { word: VocabularyItem; duplicate: boolean } {
  const words = getDemoWords();
  const existing = words.find(word => word.normalizedTerm === entry.normalizedTerm);
  const savedOccurrence: WordOccurrence = { id: crypto.randomUUID(), ...occurrence, createdAt: new Date().toISOString() };
  if (existing) {
    existing.occurrences.unshift(savedOccurrence);
    existing.updatedAt = new Date().toISOString();
    return { word: existing, duplicate: true };
  }
  const now = new Date().toISOString();
  const word: VocabularyItem = { ...entry, id: crypto.randomUUID(), userId: "demo-user", reviewScore: 0, lastReviewedAt: null, nextReviewAt: now, createdAt: now, updatedAt: now, occurrences: [savedOccurrence] };
  words.unshift(word);
  return { word, duplicate: false };
}

export function deleteDemoWord(id: string): boolean {
  const words = getDemoWords();
  const index = words.findIndex(word => word.id === id);
  if (index < 0) return false;
  words.splice(index, 1); return true;
}
