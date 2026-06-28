"use client";

import type { VocabularyItem } from "@vocablens/shared";
import { demoWords } from "./demo-data";

const STORE_KEY = "vocablens-demo-words";

export function getStoredWords(): VocabularyItem[] {
  if (typeof window === "undefined") return demoWords;
  const saved = window.localStorage.getItem(STORE_KEY);
  if (!saved) {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(demoWords));
    return demoWords;
  }
  try { return JSON.parse(saved) as VocabularyItem[]; }
  catch { return demoWords; }
}

export function setStoredWords(words: VocabularyItem[]): void {
  window.localStorage.setItem(STORE_KEY, JSON.stringify(words));
  window.dispatchEvent(new CustomEvent("vocablens:words-updated"));
}
