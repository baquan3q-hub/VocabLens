const base = process.env.API_BASE_URL || "http://localhost:3000";

async function request(path, init) {
  const response = await fetch(`${base}${path}`, init);
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(`${init?.method || "GET"} ${path}: ${response.status} ${JSON.stringify(body)}`);
  return body;
}

const lookup = await request("/api/lookup", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ term: "paradigm", context: "This requires a paradigm shift in our thinking." })
});
if (!lookup.data?.normalizedTerm || !lookup.data?.definitions?.length) throw new Error("Lookup response is incomplete");

const saved = await request("/api/words", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    entry: lookup.data,
    occurrence: {
      contextSentence: "This requires a paradigm shift in our thinking.",
      sourceUrl: "https://example.com/vocablens-smoke-test",
      sourceTitle: "VocabLens smoke test"
    }
  })
});
if (!saved.data?.id) throw new Error("Saved word has no id");

const words = await request("/api/words?search=paradigm&limit=10");
const stored = words.data?.find(word => word.normalizedTerm === "paradigm");
if (!stored?.occurrences?.some(item => item.sourceTitle === "VocabLens smoke test")) throw new Error("Saved occurrence was not returned");

const review = await request("/api/review", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ wordId: stored.id, outcome: "remembered" })
});
if (typeof review.data?.score !== "number") throw new Error("Review scheduling failed");

const quiz = await request("/api/quiz/generate", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ count: 5, direction: "mixed" })
});
if (!quiz.data?.length || quiz.data.some(question => question.options.length < 4)) throw new Error("Quiz generation failed");

const question = quiz.data[0];
const session = await request("/api/quiz-sessions", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ answers: [{
    wordId: question.wordId,
    prompt: question.prompt,
    selectedAnswer: question.correctAnswer,
    correctAnswer: question.correctAnswer,
    isCorrect: true,
    responseMs: 750
  }] })
});
if (session.data?.score !== 1) throw new Error("Quiz session persistence failed");

console.log(`Smoke test passed against ${base}: lookup -> save -> list -> review -> quiz`);
