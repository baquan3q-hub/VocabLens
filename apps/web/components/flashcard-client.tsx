"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReviewOutcome, VocabularyItem } from "@vocablens/shared";
import { scheduleReview } from "@vocablens/shared";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Volume2, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { demoWords } from "@/lib/demo-data";

export function FlashcardClient() {
  const [queue, setQueue] = useState<VocabularyItem[]>(demoWords.slice(0, 4));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [finished, setFinished] = useState(false);
  useEffect(() => { fetch("/api/review/queue").then(r => r.json()).then(body => body.data?.length && setQueue(body.data)).catch(() => undefined); }, []);
  const word = queue[index];

  const rate = useCallback(async (outcome: ReviewOutcome) => {
    if (!word || !flipped) return;
    const response = await fetch("/api/review", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ wordId: word.id, outcome }) });
    if (!response.ok) { toast.error("Chưa thể lưu kết quả ôn tập."); return; }
    const result = scheduleReview(word.reviewScore, outcome);
    toast.success(outcome === "remembered" ? `Hẹn gặp lại sau ${result.intervalDays} ngày.` : "Từ này sẽ quay lại trong hôm nay.");
    if (index >= queue.length - 1) { setFinished(true); return; }
    setFlipped(false); window.setTimeout(() => setIndex(value => value + 1), 120);
  }, [flipped, index, queue.length, word]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Space") { event.preventDefault(); setFlipped(value => !value); }
      if (event.key === "ArrowLeft") rate("forgotten");
      if (event.key === "ArrowRight") rate("remembered");
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [rate]);

  if (!word || finished) return <div className="page review-page"><div className="panel quiz-result"><Check size={48} color="var(--success)" /><h1>Hoàn thành phiên ôn!</h1><p className="muted">Bạn vừa ôn {queue.length} từ. Một vòng nhỏ, một bước nhớ lâu hơn.</p><div style={{ display: "flex", justifyContent: "center", gap: 10 }}><button className="button button-secondary" onClick={() => { setIndex(0); setFlipped(false); setFinished(false); }}><RotateCcw size={16} /> Ôn lại</button><Link className="button button-primary" href="/review/quiz">Làm quiz</Link></div></div></div>;

  const play = (event: React.MouseEvent) => { event.stopPropagation(); word.audioUrl ? new Audio(word.audioUrl).play() : speechSynthesis.speak(new SpeechSynthesisUtterance(word.term)); };
  return <div className="page review-page"><header className="page-header"><div><p className="eyebrow">Spaced repetition</p><h1>Flashcards</h1><p className="muted">Space để lật · ← Không nhớ · → Nhớ rồi</p></div><Link className="button button-secondary" href="/dashboard"><ArrowLeft size={16} /> Dashboard</Link></header>
    <div className="review-progress"><span className="muted small">{index + 1}/{queue.length}</span><div className="progress-track" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={queue.length}><div className="progress-bar" style={{ width: `${(index + 1) / queue.length * 100}%` }} /></div></div>
    <div className="flashcard-scene"><div className={`flashcard ${flipped ? "flipped" : ""}`} role="button" tabIndex={0} onClick={() => setFlipped(value => !value)} onKeyDown={event => { if (event.key === "Enter") setFlipped(value => !value); }} aria-label={flipped ? `Mặt sau: ${word.translationVi}` : `Mặt trước: ${word.term}. Nhấn để lật`}>
      <span className="card-face front"><button className="button button-ghost button-icon" onClick={play} aria-label={`Nghe ${word.term}`}><Volume2 /></button><span className="flash-word">{word.term}</span><span className="phonetic" style={{ fontSize: 15 }}>{word.phonetic}</span><span className="card-hint">Nhấn để xem nghĩa</span></span>
      <span className="card-face back"><span className="eyebrow">{word.definitions[0]?.partOfSpeech}</span><strong style={{ fontSize: 20 }}>{word.term}</strong><span className="translation-box">{word.translationVi}</span><span>{word.definitions[0]?.text}</span><span className="context-quote" style={{ marginTop: 18 }}>{word.occurrences[0]?.contextSentence ?? word.examples[0]}</span></span>
    </div></div>
    {flipped && <div className="review-actions"><button className="button button-forgot" onClick={() => rate("forgotten")}><X size={18} /> Không nhớ <ArrowLeft size={14} /></button><button className="button button-remember" onClick={() => rate("remembered")}><Check size={18} /> Nhớ rồi <ArrowRight size={14} /></button></div>}
  </div>;
}
