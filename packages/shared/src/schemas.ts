import { z } from "zod";

export const lookupRequestSchema = z.object({
  term: z.string().trim().min(1).max(64),
  context: z.string().trim().max(1000).optional()
});

export const saveWordSchema = z.object({
  entry: z.object({
    term: z.string().min(1).max(64),
    normalizedTerm: z.string().min(1).max(64),
    phonetic: z.string().max(128).default(""),
    audioUrl: z.string().url().optional(),
    definitions: z.array(z.object({
      partOfSpeech: z.string().max(40),
      text: z.string().min(1).max(1000),
      example: z.string().max(1000).optional()
    })).min(1),
    translationVi: z.string().min(1).max(1000),
    synonyms: z.array(z.string().max(80)).max(20).default([]),
    antonyms: z.array(z.string().max(80)).max(20).default([]),
    examples: z.array(z.string().max(1000)).max(10).default([]),
    source: z.enum(["dictionaryapi", "cache", "fallback"])
  }),
  occurrence: z.object({
    contextSentence: z.string().trim().max(2000).default(""),
    sourceUrl: z.string().url().max(2048),
    sourceTitle: z.string().trim().max(300).default("")
  })
});

export const reviewRequestSchema = z.object({
  wordId: z.string().uuid(),
  outcome: z.enum(["remembered", "forgotten"])
});

export const quizGenerateSchema = z.object({
  count: z.number().int().min(1).max(50).default(10),
  direction: z.enum(["word-to-meaning", "meaning-to-word", "mixed"]).default("mixed")
});

export const quizSessionSchema = z.object({
  answers: z.array(z.object({
    wordId: z.string().uuid(),
    prompt: z.string().max(1000),
    selectedAnswer: z.string().max(1000),
    correctAnswer: z.string().max(1000),
    isCorrect: z.boolean(),
    responseMs: z.number().int().nonnegative().optional()
  })).min(1).max(50)
});

export const translatePassageSchema = z.object({
  text: z.string().trim().min(2).max(5000),
  sourceUrl: z.string().max(2048).optional()
});
