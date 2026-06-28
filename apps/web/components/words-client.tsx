"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { VocabularyItem } from "@vocablens/shared";
import { BookOpen, Search } from "lucide-react";
import { toast } from "sonner";
import { demoWords } from "@/lib/demo-data";
import { WordTable } from "./word-table";

export function WordsClient() {
  const [words, setWords] = useState<VocabularyItem[]>(demoWords);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { fetch("/api/words?limit=50").then(r => r.json()).then(body => body.data && setWords(body.data)).catch(() => undefined); }, []);
  const filtered = useMemo(() => words.filter(word => {
    const matchesSearch = !search || word.normalizedTerm.includes(search.toLowerCase()) || word.translationVi.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = level === "all" || (level === "new" && word.reviewScore <= 1) || (level === "learning" && word.reviewScore >= 2 && word.reviewScore <= 3) || (level === "familiar" && word.reviewScore === 4) || (level === "mastered" && word.reviewScore === 5);
    return matchesSearch && matchesLevel;
  }), [words, search, level]);

  async function deleteSelected() {
    if (!selected) return;
    const response = await fetch(`/api/words/${selected}`, { method: "DELETE" });
    if (response.ok) { setWords(current => current.filter(word => word.id !== selected)); toast.success("Đã xóa từ khỏi bộ sưu tập."); }
    else toast.error("Chưa thể xóa từ. Vui lòng thử lại.");
    dialog.current?.close(); setSelected(null);
  }

  return <div className="page">
    <header className="page-header"><div><p className="eyebrow">Vocabulary library</p><h1>My Words</h1><p className="muted">Toàn bộ từ bạn đã lưu cùng ngữ cảnh gốc.</p></div><span className="badge badge-learning">{filtered.length} từ</span></header>
    <div className="toolbar">
      <label className="input-wrap"><Search aria-hidden="true" /><span className="sr-only">Tìm từ vựng</span><input className="input" value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm từ hoặc nghĩa tiếng Việt..." /></label>
      <select className="select" value={level} onChange={event => setLevel(event.target.value)} aria-label="Lọc theo trình độ">
        <option value="all">Tất cả trình độ</option><option value="new">Mới học</option><option value="learning">Đang tiến bộ</option><option value="familiar">Quen thuộc</option><option value="mastered">Thành thạo</option>
      </select>
    </div>
    <section className="panel table-panel">
      {filtered.length ? <WordTable words={filtered} onDelete={id => { setSelected(id); dialog.current?.showModal(); }} /> : <div className="empty"><BookOpen /><h2>Chưa tìm thấy từ phù hợp</h2><p>Thử từ khóa khác hoặc bỏ bớt bộ lọc.</p></div>}
    </section>
    <dialog ref={dialog} style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 24, maxWidth: 420, boxShadow: "var(--shadow-popup)" }}>
      <h2>Xóa từ này?</h2><p className="muted">Tất cả ngữ cảnh và lịch sử ôn của từ cũng sẽ bị xóa.</p><div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}><button className="button button-secondary" onClick={() => dialog.current?.close()}>Hủy</button><button className="button button-danger" onClick={deleteSelected}>Xóa</button></div>
    </dialog>
  </div>;
}
