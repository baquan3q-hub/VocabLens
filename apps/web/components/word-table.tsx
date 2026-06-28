"use client";

import type { VocabularyItem } from "@vocablens/shared";
import { ExternalLink, Trash2, Volume2 } from "lucide-react";
import Link from "next/link";
import { ProficiencyBadge } from "./proficiency-badge";

function relativeDate(value: string) {
  const days = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 86_400_000));
  if (days === 0) return "Hôm nay";
  if (days === 1) return "Hôm qua";
  return `${days} ngày trước`;
}

export function WordTable({ words, compact = false, onDelete }: { words: VocabularyItem[]; compact?: boolean; onDelete?: (id: string) => void }) {
  function play(word: VocabularyItem) {
    if (word.audioUrl) new Audio(word.audioUrl).play().catch(() => undefined);
    else if ("speechSynthesis" in window) speechSynthesis.speak(new SpeechSynthesisUtterance(word.term));
  }
  return <div className="table-scroll"><table className="data-table">
    <thead><tr><th>Từ vựng</th><th>Nghĩa tiếng Việt</th>{!compact && <th>Ngữ cảnh</th>}<th>Nguồn</th><th>Đã lưu</th><th>Trình độ</th>{onDelete && <th>Thao tác</th>}</tr></thead>
    <tbody>{words.map(word => {
      const occurrence = word.occurrences[0];
      return <tr key={word.id}>
        <td><div className="word-cell">
          <button className="button button-ghost button-icon" style={{ width: 30, minHeight: 30 }} onClick={() => play(word)} aria-label={`Nghe phát âm ${word.term}`}><Volume2 size={15} /></button>
          <div><Link href={`/words/${word.id}`} className="word-main">{word.term}</Link><span className="phonetic">{word.phonetic}</span></div>
        </div></td>
        <td>{word.translationVi}</td>
        {!compact && <td className="context-cell" title={occurrence?.contextSentence}>{occurrence?.contextSentence || "—"}</td>}
        <td>{occurrence ? <a href={occurrence.sourceUrl} target="_blank" rel="noreferrer" className="muted" aria-label={`Mở ${occurrence.sourceTitle}`}>
          {occurrence.sourceTitle || "Trang nguồn"} <ExternalLink size={12} style={{ display: "inline" }} />
        </a> : "—"}</td>
        <td className="muted">{relativeDate(word.createdAt)}</td>
        <td><ProficiencyBadge score={word.reviewScore} /></td>{onDelete && <td><button className="button button-ghost button-icon" onClick={() => onDelete(word.id)} aria-label={`Xóa ${word.term}`}><Trash2 size={16} /></button></td>}
      </tr>;
    })}</tbody>
  </table></div>;
}
