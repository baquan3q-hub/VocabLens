import type { LexicalEntry, DifficultWord } from "@vocablens/shared";

export type ExtensionRequest =
  | { type: "LOOKUP"; term: string; context: string }
  | { type: "TRANSLATE_PASSAGE"; text: string; sourceUrl: string }
  | { type: "SAVE_WORD"; entry: LexicalEntry; occurrence: { contextSentence: string; sourceUrl: string; sourceTitle: string } }
  | { type: "SAVE_DIFFICULT_WORDS"; words: DifficultWord[]; sourceUrl: string; sourceTitle: string; contextSentence: string }
  | { type: "SIGN_IN" }
  | { type: "GET_SESSION" };

export type ExtensionResponse = { ok: true; data?: unknown; demo?: boolean } | { ok: false; error: string; code?: string };

