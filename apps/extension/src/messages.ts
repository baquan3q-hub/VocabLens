import type { LexicalEntry } from "@vocablens/shared";

export type ExtensionRequest =
  | { type: "LOOKUP"; term: string; context: string }
  | { type: "SAVE_WORD"; entry: LexicalEntry; occurrence: { contextSentence: string; sourceUrl: string; sourceTitle: string } }
  | { type: "SIGN_IN" }
  | { type: "GET_SESSION" };

export type ExtensionResponse = { ok: true; data?: unknown; demo?: boolean } | { ok: false; error: string; code?: string };
