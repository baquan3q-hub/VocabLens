"use client";

import { useEffect, useMemo, useState } from "react";
import type { QuizQuestion } from "@vocablens/shared";
import { Check, CircleHelp, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type Answer = { wordId: string; prompt: string; selectedAnswer: string; correctAnswer: string; isCorrect: boolean; responseMs: number };

export function QuizClient() {
  const [setup, setSetup] = useState(true);
  const [count, setCount] = useState(10);
  const [direction, setDirection] = useState<"mixed" | "word-to-meaning" | "meaning-to-word">("mixed");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [startedAt, setStartedAt] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = questions[index];
  const score = useMemo(() => answers.filter(answer => answer.isCorrect).length, [answers]);

  async function start() {
    const response = await fetch("/api/quiz/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ count, direction }) });
    const body = await response.json();
    if (!response.ok) { toast.error(body.error ?? "Không thể tạo quiz."); return; }
    setQuestions(body.data); setSetup(false); setIndex(0); setAnswers([]); setSelected(null); setFinished(false); setStartedAt(Date.now());
  }

  function choose(option: string) {
    if (selected || !question) return;
    setSelected(option);
    setAnswers(current => [...current, { wordId: question.wordId, prompt: question.prompt, selectedAnswer: option, correctAnswer: question.correctAnswer, isCorrect: option === question.correctAnswer, responseMs: Date.now() - startedAt }]);
  }

  async function next() {
    if (index < questions.length - 1) { setIndex(value => value + 1); setSelected(null); setStartedAt(Date.now()); return; }
    setFinished(true);
    const response = await fetch("/api/quiz-sessions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers }) });
    if (!response.ok) toast.error("Kết quả chưa được đồng bộ, nhưng điểm của bạn vẫn hiển thị.");
  }

  useEffect(() => {
    if (!question || selected) return;
    const onKey = (event: KeyboardEvent) => { const optionIndex = Number(event.key) - 1; if (optionIndex >= 0 && optionIndex < question.options.length) choose(question.options[optionIndex]); };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  });

  if (setup) return <div className="page quiz-shell"><header className="page-header"><div><p className="eyebrow">Knowledge check</p><h1>Quiz</h1><p className="muted">Một bài kiểm tra ngắn để củng cố những gì vừa học.</p></div></header><section className="panel panel-pad"><h2>Thiết lập phiên quiz</h2><div className="toolbar"><label>Số câu<br /><select className="select" value={count} onChange={event => setCount(Number(event.target.value))}><option value={5}>5 câu</option><option value={10}>10 câu</option><option value={20}>20 câu</option></select></label><label>Chiều câu hỏi<br /><select className="select" value={direction} onChange={event => setDirection(event.target.value as typeof direction)}><option value="mixed">Trộn hai chiều</option><option value="word-to-meaning">Từ → Nghĩa</option><option value="meaning-to-word">Nghĩa → Từ</option></select></label></div><button className="button button-primary button-lg" onClick={start}><CircleHelp size={18} /> Bắt đầu quiz</button></section></div>;

  if (finished) { const percent = Math.round(score / questions.length * 100); return <div className="page quiz-shell"><section className="panel quiz-result"><p className="eyebrow">Kết quả phiên</p><h1>{percent >= 80 ? "Rất chắc tay!" : percent >= 50 ? "Đang tiến bộ tốt" : "Cùng ôn thêm một vòng"}</h1><div className="score-ring" aria-label={`${score} trên ${questions.length} câu đúng`}>{score}/{questions.length}</div><p className="muted">Bạn trả lời đúng {percent}% câu hỏi.</p><div style={{ display: "flex", justifyContent: "center", gap: 10 }}><button className="button button-secondary" onClick={() => setSetup(true)}><RotateCcw size={16} /> Làm lại</button><Link href="/review/flashcard" className="button button-primary">Ôn Flashcards</Link></div></section></div>; }

  return <div className="page quiz-shell"><header className="page-header"><div><p className="eyebrow">Câu {index + 1} / {questions.length}</p><h1>Chọn đáp án đúng</h1></div><span className="badge badge-learning">Điểm: {score}</span></header><div className="review-progress"><div className="progress-track"><div className="progress-bar" style={{ width: `${(index + 1) / questions.length * 100}%` }} /></div></div>
    <section className="panel quiz-card"><p className="muted" style={{ textAlign: "center" }}>{question.direction === "word-to-meaning" ? "Nghĩa tiếng Việt của từ này là gì?" : "Từ tiếng Anh phù hợp là gì?"}</p><h2 className="quiz-prompt">{question.prompt}</h2><div className="option-list">{question.options.map((option, optionIndex) => {
      const state = selected ? (option === question.correctAnswer ? "correct" : option === selected ? "wrong" : "") : "";
      return <button key={option} className={`option ${state}`} onClick={() => choose(option)} disabled={Boolean(selected)}><strong style={{ marginRight: 8 }}>{optionIndex + 1}.</strong>{option}{selected && option === question.correctAnswer && <Check size={17} style={{ float: "right" }} />}{selected === option && option !== question.correctAnswer && <X size={17} style={{ float: "right" }} />}</button>;
    })}</div><div className="quiz-feedback" aria-live="polite">{selected && <><strong style={{ color: selected === question.correctAnswer ? "var(--success-dark)" : "var(--error)" }}>{selected === question.correctAnswer ? "Chính xác!" : `Đáp án đúng: ${question.correctAnswer}`}</strong><p>{question.explanation}</p></>}</div>{selected && <button className="button button-primary" style={{ marginLeft: "auto", display: "flex" }} onClick={next}>{index === questions.length - 1 ? "Xem kết quả" : "Câu tiếp theo"}</button>}</section>
  </div>;
}
