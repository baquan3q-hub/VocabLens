"use client";

import { useEffect, useState } from "react";
import type { VocabularyItem } from "@vocablens/shared";
import { ArrowLeft, ExternalLink, Layers3, Volume2 } from "lucide-react";
import Link from "next/link";
import { demoWords } from "@/lib/demo-data";
import { ProficiencyBadge } from "./proficiency-badge";

export function WordDetailClient({ id }: { id: string }) {
  const [word, setWord] = useState<VocabularyItem | null>(demoWords.find(item => item.id === id) ?? null);
  const [loading, setLoading] = useState(!word);
  useEffect(() => { fetch(`/api/words/${id}`).then(r => r.json()).then(body => setWord(body.data ?? null)).finally(() => setLoading(false)); }, [id]);
  if (loading) return <div className="page"><div className="skeleton" style={{ height: 160 }} /></div>;
  if (!word) return <div className="page"><div className="empty"><h1>Không tìm thấy từ</h1><Link className="button button-primary" href="/words">Về My Words</Link></div></div>;
  const play = () => word.audioUrl ? new Audio(word.audioUrl).play() : speechSynthesis.speak(new SpeechSynthesisUtterance(word.term));
  return <div className="page"><header className="page-header"><div><Link href="/words" className="button button-ghost" style={{ paddingLeft: 0 }}><ArrowLeft size={17} /> My Words</Link><h1 style={{ fontSize: 40 }}>{word.term}</h1><p className="phonetic" style={{ fontSize: 14 }}>{word.phonetic}</p></div>
    <div style={{ display: "flex", gap: 8 }}><button className="button button-secondary button-icon" onClick={play} aria-label={`Nghe ${word.term}`}><Volume2 size={18} /></button><Link href="/review/flashcard" className="button button-primary"><Layers3 size={17} /> Ôn từ này</Link></div></header>
    <div className="detail-grid">
      <section className="panel panel-pad"><div className="panel-header"><h2>Ý nghĩa</h2><ProficiencyBadge score={word.reviewScore} /></div><div className="translation-box">{word.translationVi}</div>
        <ol className="definition-list">{word.definitions.map((definition, index) => <li key={index}><span className="badge badge-new">{definition.partOfSpeech}</span><p style={{ margin: "7px 0 0" }}>{definition.text}</p>{definition.example && <p className="context-quote">{definition.example}</p>}</li>)}</ol>
        {word.synonyms.length > 0 && <><h3 style={{ marginTop: 22 }}>Từ đồng nghĩa</h3><div className="chips">{word.synonyms.map(item => <span className="chip" key={item}>{item}</span>)}</div></>}
      </section>
      <section className="panel panel-pad"><h2>Ngữ cảnh đã lưu</h2>{word.occurrences.map(occurrence => <article className="occurrence" key={occurrence.id}><p className="context-quote">{occurrence.contextSentence || "Không có câu ngữ cảnh."}</p><a className="muted small" href={occurrence.sourceUrl} target="_blank" rel="noreferrer">{occurrence.sourceTitle || occurrence.sourceUrl} <ExternalLink size={12} style={{ display: "inline" }} /></a><p className="muted small" style={{ marginTop: 6, marginBottom: 0 }}>{new Date(occurrence.createdAt).toLocaleString("vi-VN")}</p></article>)}</section>
    </div>
  </div>;
}
