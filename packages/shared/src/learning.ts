import type { Proficiency, ReviewOutcome, ReviewResult, VocabularyItem, QuizQuestion } from "./types.js";

const INTERVALS = [0, 1, 3, 7, 14, 30] as const;

export function normalizeTerm(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .replace(/^[^a-zA-Z'-]+|[^a-zA-Z'-]+$/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function isLookupTerm(value: string): boolean {
  const normalized = normalizeTerm(value);
  return normalized.length > 0 && normalized.length <= 64 && /^[a-z]+(?:['-][a-z]+)?$/i.test(normalized);
}

export function proficiencyFromScore(score: number): Proficiency {
  if (score <= 1) return "new";
  if (score <= 3) return "learning";
  if (score === 4) return "familiar";
  return "mastered";
}

export function scheduleReview(
  currentScore: number,
  outcome: ReviewOutcome,
  now = new Date()
): ReviewResult {
  const previousScore = Math.max(0, Math.min(5, currentScore));
  const score = outcome === "remembered"
    ? Math.min(5, previousScore + 1)
    : Math.max(0, previousScore - 1);
  const intervalDays = outcome === "forgotten" ? 0 : INTERVALS[score];
  const next = new Date(now);
  if (outcome === "forgotten") next.setHours(next.getHours() + 8);
  else next.setDate(next.getDate() + intervalDays);
  return { previousScore, score, intervalDays, nextReviewAt: next.toISOString() };
}

function shuffled<T>(items: T[]): T[] {
  return items.map(value => ({ value, rank: Math.random() }))
    .sort((a, b) => a.rank - b.rank)
    .map(({ value }) => value);
}

export function generateQuizQuestions(
  words: VocabularyItem[],
  count: number,
  direction: "word-to-meaning" | "meaning-to-word" | "mixed" = "mixed"
): QuizQuestion[] {
  const usable = words.filter(word => word.translationVi && word.normalizedTerm);
  return shuffled(usable).slice(0, Math.min(count, usable.length)).map((word, index) => {
    const resolvedDirection = direction === "mixed"
      ? (index % 2 === 0 ? "word-to-meaning" : "meaning-to-word")
      : direction;
    const samePartOfSpeech = usable.filter(candidate =>
      candidate.id !== word.id &&
      candidate.definitions[0]?.partOfSpeech === word.definitions[0]?.partOfSpeech
    );
    const pool = samePartOfSpeech.length >= 3 ? samePartOfSpeech : usable.filter(candidate => candidate.id !== word.id);
    const distractors = shuffled(pool).slice(0, 3);
    const correctAnswer = resolvedDirection === "word-to-meaning" ? word.translationVi : word.term;
    const options = shuffled([
      correctAnswer,
      ...distractors.map(item => resolvedDirection === "word-to-meaning" ? item.translationVi : item.term)
    ].filter((item, itemIndex, all) => all.indexOf(item) === itemIndex));
    return {
      wordId: word.id,
      prompt: resolvedDirection === "word-to-meaning" ? word.term : word.translationVi,
      correctAnswer,
      options,
      direction: resolvedDirection,
      explanation: word.definitions[0]?.text ?? word.translationVi
    };
  });
}
