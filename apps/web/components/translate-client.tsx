"use client";

import { useState } from "react";
import { Languages, Loader2, Save, Check, AlertCircle, BookOpen, Volume2 } from "lucide-react";
import { toast } from "sonner";
import type { PassageTranslation, DifficultWord } from "@vocablens/shared";

export function TranslateClient() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PassageTranslation | null>(null);
  const [selectedWords, setSelectedWords] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0 });

  const maxChars = 5000;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  async function handleTranslate(e: React.FormEvent) {
    e.preventDefault();
    if (wordCount < 2) {
      toast.error("Vui lòng nhập đoạn văn dài từ 2 từ trở lên.");
      return;
    }
    if (text.length > maxChars) {
      toast.error(`Đoạn văn vượt quá giới hạn ${maxChars} ký tự.`);
      return;
    }

    setLoading(true);
    setResult(null);
    setSelectedWords(new Set());

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, sourceUrl: window.location.href }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Không thể dịch đoạn văn lúc này.");
      }

      const body = await response.json();
      if (body.data) {
        setResult(body.data);
        // Pre-select all words by default
        setSelectedWords(new Set((body.data as PassageTranslation).difficultWords.map((_, i) => i)));
        toast.success("Dịch đoạn văn thành công!");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  }

  function toggleWord(index: number) {
    const next = new Set(selectedWords);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedWords(next);
  }

  function handleSelectAll() {
    if (!result) return;
    setSelectedWords(new Set(result.difficultWords.map((_, i) => i)));
  }

  function handleDeselectAll() {
    setSelectedWords(new Set());
  }

  async function handleSaveWords() {
    if (!result || selectedWords.size === 0) return;

    setSaving(true);
    setSaveProgress({ current: 0, total: selectedWords.size });

    const indexes = Array.from(selectedWords).sort();
    const wordsToSave = indexes.map((i) => result.difficultWords[i]);
    const contextSentence = result.originalText.slice(0, 2000);

    let savedCount = 0;

    for (let index = 0; index < wordsToSave.length; index++) {
      const word = wordsToSave[index];
      setSaveProgress((prev) => ({ ...prev, current: index + 1 }));

      try {
        // Try looking up first
        const lookupResponse = await fetch("/api/lookup", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ term: word.word, context: contextSentence }),
        });

        let entry;
        if (lookupResponse.ok) {
          const body = await lookupResponse.json();
          entry = body.data;
        }

        if (entry) {
          // If translation is empty or same, use meaning returned by translator
          entry.translationVi = word.meaning || entry.translationVi;
        } else {
          // Fallback entry structure
          entry = {
            term: word.word,
            normalizedTerm: word.word.toLowerCase(),
            phonetic: word.phonetic || "",
            definitions: [{ partOfSpeech: word.partOfSpeech || "word", text: word.meaning }],
            translationVi: word.meaning,
            synonyms: [],
            antonyms: [],
            examples: [],
            source: "fallback",
          };
        }

        // Save word
        const saveResponse = await fetch("/api/words", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            entry,
            occurrence: {
              contextSentence,
              sourceUrl: window.location.href,
              sourceTitle: document.title || "VocabLens Web Application",
            },
          }),
        });

        if (saveResponse.ok) {
          savedCount++;
        }
      } catch (err) {
        console.error(`Error saving word "${word.word}":`, err);
      }
    }

    setSaving(false);
    if (savedCount > 0) {
      toast.success(`Đã lưu thành công ${savedCount}/${wordsToSave.length} từ vào thư viện ôn tập.`);
      // Clear saved selections
      setSelectedWords(new Set());
    } else {
      toast.error("Không thể lưu các từ đã chọn. Vui lòng kiểm tra đăng nhập.");
    }
  }

  function handlePlayAudio(word: string) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Passage Translation</p>
          <h1>Dịch đoạn văn</h1>
          <p className="muted">
            Dịch văn bản dài bằng AI, tự phân tích bối cảnh và trích xuất từ vựng khó để ôn tập.
          </p>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: "24px", alignItems: "start" }}>
        {/* Left column: input text */}
        <section className="panel panel-pad" style={{ padding: "24px" }}>
          <h2>Đoạn văn cần dịch</h2>
          <form onSubmit={handleTranslate} style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ position: "relative" }}>
              <textarea
                className="input"
                style={{
                  width: "100%",
                  minHeight: "260px",
                  padding: "16px",
                  borderRadius: "10px",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  border: "1.5px solid var(--border)",
                  resize: "vertical",
                }}
                placeholder="Nhập hoặc dán đoạn văn tiếng Anh ở đây (tối đa 5000 ký tự)..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={maxChars}
                disabled={loading}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  right: "12px",
                  fontSize: "12px",
                  color: "var(--color-text-muted)",
                }}
              >
                {text.length} / {maxChars} ký tự ({wordCount} từ)
              </div>
            </div>

            <button
              type="submit"
              className="button button-primary button-lg"
              disabled={loading || wordCount < 2}
              style={{ alignSelf: "flex-end", gap: "8px" }}
            >
              {loading ? (
                <>
                  <Loader2 className="spin" size={17} />
                  Đang dịch bằng AI...
                </>
              ) : (
                <>
                  <Languages size={17} />
                  Dịch đoạn văn
                </>
              )}
            </button>
          </form>
        </section>

        {/* Right column: Results (if any) */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Translated text */}
            <section className="panel panel-pad" style={{ padding: "24px" }}>
              <h2>Bản dịch tiếng Việt</h2>
              <div
                style={{
                  marginTop: "16px",
                  background: "linear-gradient(135deg, var(--color-primary-50) 0%, #ede9fe 100%)",
                  borderLeft: "3.5px solid var(--color-primary-500)",
                  borderRadius: "0 10px 10px 0",
                  padding: "16px",
                  color: "var(--color-primary-900)",
                  fontSize: "14.5px",
                  lineHeight: "1.7",
                  whiteSpace: "pre-wrap",
                }}
              >
                {result.translatedText}
              </div>

              {result.contextNote && (
                <div style={{ marginTop: "16px" }}>
                  <span
                    style={{
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--color-text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    Bối cảnh
                  </span>
                  <div
                    style={{
                      marginTop: "6px",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: "8px",
                      padding: "12px 14px",
                      color: "#166534",
                      fontSize: "13px",
                      display: "flex",
                      gap: "8px",
                      alignItems: "flex-start",
                      lineHeight: "1.5",
                    }}
                  >
                    <span aria-hidden="true">💡</span>
                    <span>{result.contextNote}</span>
                  </div>
                </div>
              )}
            </section>

            {/* Difficult words */}
            <section className="panel panel-pad" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
                <h2 style={{ fontSize: "16px", margin: 0 }}>Từ vựng khó ({result.difficultWords.length})</h2>
                {result.difficultWords.length > 1 && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="button button-ghost button-sm" onClick={handleSelectAll}>
                      Chọn tất cả
                    </button>
                    <button className="button button-ghost button-sm" onClick={handleDeselectAll}>
                      Bỏ chọn
                    </button>
                  </div>
                )}
              </div>

              {result.difficultWords.length === 0 ? (
                <p style={{ color: "var(--color-text-secondary)", fontSize: "13px", padding: "16px 0", textAlign: "center" }}>
                  Không tìm thấy từ vựng khó nào trong đoạn văn.
                </p>
              ) : (
                <>
                  <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0 0" }}>
                    {result.difficultWords.map((word, index) => {
                      const isSelected = selectedWords.has(index);
                      return (
                        <li
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "12px",
                            padding: "10px 12px",
                            borderRadius: "10px",
                            marginBottom: "6px",
                            transition: "background 150ms",
                            cursor: "pointer",
                            background: isSelected ? "var(--color-primary-50)" : "transparent",
                            border: `1px solid ${isSelected ? "var(--color-primary-200)" : "transparent"}`,
                          }}
                          onClick={() => toggleWord(index)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // toggled by list item click
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              width: "16px",
                              height: "16px",
                              marginTop: "3px",
                              accentColor: "var(--color-primary-500)",
                              cursor: "pointer",
                            }}
                            aria-label={`Chọn từ ${word.word}`}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <strong style={{ color: "var(--color-text-primary)", fontSize: "14px" }}>
                                {word.word}
                              </strong>
                              {word.phonetic && (
                                <span className="phonetic" style={{ fontSize: "11.5px" }}>
                                  {word.phonetic}
                                </span>
                              )}
                              <button
                                className="button button-ghost button-sm"
                                style={{ height: "20px", padding: "0 4px", minWidth: 0 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayAudio(word.word);
                                }}
                                aria-label="Nghe phát âm"
                              >
                                <Volume2 size={12} />
                              </button>
                              {word.partOfSpeech && (
                                <span className={`badge`} style={{ fontSize: "10px", padding: "1px 5px", borderRadius: "4px", background: "var(--color-primary-100)", color: "var(--color-primary-700)" }}>
                                  {word.partOfSpeech}
                                </span>
                              )}
                            </div>
                            <div style={{ color: "var(--color-primary-700)", fontSize: "12.5px", marginTop: "2px", fontWeight: 500 }}>
                              {word.meaning}
                            </div>
                          </div>
                          <span
                            className={`badge ${word.difficulty === "advanced" ? "badge-danger" : "badge-learning"}`}
                            style={{
                              fontSize: "9px",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              padding: "2px 6px",
                              borderRadius: "999px",
                              marginLeft: "auto",
                              flexShrink: 0,
                              background: word.difficulty === "advanced" ? "#fce7f3" : "#dbeafe",
                              color: word.difficulty === "advanced" ? "#9d174d" : "#1e40af",
                              border: "none"
                            }}
                          >
                            {word.difficulty === "advanced" ? "Nâng cao" : "Trung cấp"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <button
                    className="button button-primary"
                    style={{ width: "100%", marginTop: "16px", gap: "8px" }}
                    onClick={handleSaveWords}
                    disabled={selectedWords.size === 0 || saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="spin" size={17} />
                        Đang lưu {saveProgress.current}/{saveProgress.total} từ...
                      </>
                    ) : (
                      <>
                        <Save size={17} />
                        Lưu {selectedWords.size} từ đã chọn
                      </>
                    )}
                  </button>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
