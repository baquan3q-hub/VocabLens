export type Proficiency = "new" | "learning" | "familiar" | "mastered";
export type ReviewOutcome = "remembered" | "forgotten";

export interface Definition {
  partOfSpeech: string;
  text: string;
  example?: string;
}

export interface LexicalEntry {
  term: string;
  normalizedTerm: string;
  phonetic: string;
  audioUrl?: string;
  definitions: Definition[];
  translationVi: string;
  synonyms: string[];
  antonyms: string[];
  examples: string[];
  source: "dictionaryapi" | "cache" | "fallback";
}

export interface WordOccurrence {
  id: string;
  contextSentence: string;
  sourceUrl: string;
  sourceTitle: string;
  createdAt: string;
}

export interface VocabularyItem extends LexicalEntry {
  id: string;
  userId: string;
  reviewScore: number;
  lastReviewedAt: string | null;
  nextReviewAt: string;
  createdAt: string;
  updatedAt: string;
  occurrences: WordOccurrence[];
}

export interface ReviewResult {
  previousScore: number;
  score: number;
  nextReviewAt: string;
  intervalDays: number;
}

export interface QuizQuestion {
  wordId: string;
  prompt: string;
  correctAnswer: string;
  options: string[];
  direction: "word-to-meaning" | "meaning-to-word";
  explanation: string;
}

export interface DifficultWord {
  word: string;
  meaning: string;
  phonetic?: string;
  partOfSpeech?: string;
  difficulty: "intermediate" | "advanced";
}

export interface PassageTranslation {
  originalText: string;
  translatedText: string;
  difficultWords: DifficultWord[];
  contextNote?: string;
}
