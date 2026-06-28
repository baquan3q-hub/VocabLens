import { Bookmark, BookOpen, Check, createIcons, Languages, LoaderCircle, LogIn, Save, Volume2, X } from "lucide";
import { isLookupTerm, isTranslatablePassage, type LexicalEntry, type PassageTranslation, type DifficultWord } from "@vocablens/shared";
import type { ExtensionRequest, ExtensionResponse } from "./messages";
import { computePopupPosition, extractSentenceFromText } from "./selection";

const HOST_ID = "vocablens-shadow-host";
let currentEntry: LexicalEntry | null = null;
let currentContext = "";
let currentPassage: PassageTranslation | null = null;
let selectedDifficultWords: Set<number> = new Set();
let currentSelectionRect: DOMRect | null = null;
let hasBeenDragged = false;

const styles = `
  :host { all: initial; color-scheme: light; }
  * { box-sizing: border-box; }
  .popup { width: 360px; max-height: min(520px, calc(100vh - 24px)); overflow: auto; background: #fff; color: #111827; border: 1px solid #e5e7eb; border-radius: 18px; box-shadow: 0 12px 36px rgba(15,23,42,.18); padding: 18px; font-family: Inter, ui-sans-serif, system-ui, sans-serif; font-size: 14px; line-height: 1.55; animation: enter 180ms ease-out; }
  .popup.passage-popup { width: 440px; max-height: min(600px, calc(100vh - 24px)); }
  @keyframes enter { from { opacity: 0; transform: translateY(7px); } }
  .header { display: flex; align-items: flex-start; gap: 8px; cursor: grab; user-select: none; }
  .header:active { cursor: grabbing; }
  .title { flex: 1; min-width: 0; }
  h2 { margin: 0; font-size: 23px; line-height: 1.25; letter-spacing: -.02em; }
  h2.passage-title { font-size: 18px; display: flex; align-items: center; gap: 8px; }
  .phonetic { color: #6b7280; font-family: ui-monospace, monospace; font-size: 12px; }
  button { min-height: 40px; border: 1px solid transparent; border-radius: 9px; padding: 8px 12px; font: 600 13px/1.2 Inter, ui-sans-serif, system-ui, sans-serif; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 7px; }
  button:focus-visible { outline: 3px solid rgba(139,92,246,.28); outline-offset: 2px; }
  .icon { width: 36px; min-height: 36px; padding: 0; color: #7c3aed; background: #f5f3ff; }
  .icon.close { color: #6b7280; background: transparent; }
  .label { margin: 14px 0 4px; color: #9ca3af; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .09em; }
  p { margin: 0; }
  .translation { background: #f5f3ff; border-left: 3px solid #a78bfa; border-radius: 0 7px 7px 0; padding: 9px 11px; color: #6d28d9; font-weight: 600; }
  .passage-translation { background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border-left: 3px solid #8b5cf6; border-radius: 0 10px 10px 0; padding: 12px 14px; color: #4c1d95; font-weight: 500; line-height: 1.7; font-size: 13.5px; }
  .context { background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 9px 11px; color: #6b7280; font-size: 12px; font-style: italic; }
  .context-note { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 9px 11px; color: #166534; font-size: 12px; display: flex; align-items: flex-start; gap: 6px; }
  .context-note::before { content: "💡"; flex-shrink: 0; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip { background: #f3f4f6; color: #15803d; border-radius: 999px; padding: 3px 8px; font-size: 11px; }
  .primary { width: 100%; margin-top: 15px; background: #7c3aed; color: white; }
  .primary:hover { background: #6d28d9; }
  .primary.saved { background: #22c55e; }
  .primary:disabled { opacity: .6; cursor: not-allowed; }
  .error { color: #b91c1c; background: #fee2e2; border-radius: 8px; padding: 10px 12px; }
  .loading { min-height: 150px; display: grid; place-items: center; color: #7c3aed; text-align: center; }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .word-list { margin: 6px 0 0; padding: 0; list-style: none; }
  .word-item { display: flex; align-items: flex-start; gap: 8px; padding: 8px 10px; border-radius: 10px; margin-bottom: 4px; transition: background 150ms; cursor: pointer; user-select: none; }
  .word-item:hover { background: #f9fafb; }
  .word-item.selected { background: #f5f3ff; }
  .word-checkbox { width: 18px; height: 18px; border-radius: 5px; border: 2px solid #d1d5db; background: #fff; flex-shrink: 0; margin-top: 2px; display: grid; place-items: center; transition: all 150ms; }
  .word-item.selected .word-checkbox { border-color: #7c3aed; background: #7c3aed; }
  .word-check-icon { color: white; width: 12px; height: 12px; display: none; }
  .word-item.selected .word-check-icon { display: block; }
  .word-info { flex: 1; min-width: 0; }
  .word-term { font-weight: 700; color: #1f2937; font-size: 13px; }
  .word-pos { color: #9ca3af; font-size: 10px; font-style: italic; margin-left: 4px; }
  .word-meaning { color: #6d28d9; font-size: 12px; margin-top: 1px; }
  .word-badge { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; padding: 2px 6px; border-radius: 999px; flex-shrink: 0; margin-top: 3px; }
  .word-badge.intermediate { background: #dbeafe; color: #1e40af; }
  .word-badge.advanced { background: #fce7f3; color: #9d174d; }
  .select-btn { min-height: 28px; padding: 4px 10px; font-size: 11px; background: #f3f4f6; color: #6b7280; border-radius: 6px; border: 1px solid #e5e7eb; }
  .select-btn:hover { background: #e5e7eb; }
  .save-count { font-size: 12px; opacity: .8; }

  .trigger-btn { position: fixed; z-index: 2147483647; background: #7c3aed; color: white; border: none; border-radius: 9px; padding: 6px 12px; font-family: Inter, sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(124,58,237,0.35); transition: background 150ms, transform 150ms; }
  .trigger-btn:hover { background: #6d28d9; transform: scale(1.03); }

  @media (prefers-reduced-motion: reduce) { * { animation-duration: .01ms !important; } }
`;

function escapeHtml(value: string) { const div = document.createElement("div"); div.textContent = value; return div.innerHTML; }

function getContextSentence(selection: Selection): string {
  const node = selection.anchorNode;
  const container = node?.parentElement?.closest("p, li, article, blockquote, td, div") ?? node?.parentElement;
  const text = (((container as HTMLElement | null)?.innerText) || node?.textContent || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return extractSentenceFromText(text, selection.toString());
}

function getRoot(): ShadowRoot {
  let host = document.getElementById(HOST_ID);
  if (!host) {
    host = document.createElement("div"); host.id = HOST_ID; host.style.cssText = "position:fixed;z-index:2147483647;left:0;top:0";
    document.documentElement.appendChild(host); const root = host.attachShadow({ mode: "open" }); const style = document.createElement("style"); style.textContent = styles; root.appendChild(style); root.addEventListener("click", event => event.stopPropagation());
    setupDraggable(root, host);
  }
  return host.shadowRoot!;
}

function positionPopup(rect: DOMRect, isPassage = false) {
  if (hasBeenDragged) return;
  const host = document.getElementById(HOST_ID)!;
  const popupWidth = isPassage ? 440 : 360;
  const { left, top } = computePopupPosition(rect, { width: window.innerWidth, height: window.innerHeight }, { width: popupWidth, estimatedHeight: isPassage ? 500 : 420, gap: 10, margin: 12 });
  host.style.left = `${left}px`; host.style.top = `${top}px`;
}

function setupDraggable(root: ShadowRoot, host: HTMLElement) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;

  root.addEventListener("mousedown", (e) => {
    const event = e as MouseEvent;
    const target = event.target as HTMLElement;
    const header = target.closest(".header");
    const isButton = target.closest("button");

    if (header && !isButton) {
      isDragging = true;
      startX = event.clientX;
      startY = event.clientY;

      const rect = host.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      // Prevent text selection during drag
      event.preventDefault();

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!isDragging) return;
        hasBeenDragged = true;

        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const popupEl = root.querySelector(".popup");

        if (popupEl) {
          const popupRect = popupEl.getBoundingClientRect();
          const margin = 10;

          // Clamp left
          if (popupRect.width < viewportWidth) {
            newLeft = Math.max(margin, Math.min(viewportWidth - popupRect.width - margin, newLeft));
          } else {
            newLeft = Math.max(0, newLeft);
          }

          // Clamp top
          if (popupRect.height < viewportHeight) {
            newTop = Math.max(margin, Math.min(viewportHeight - popupRect.height - margin, newTop));
          } else {
            newTop = Math.max(0, newTop);
          }
        }

        host.style.left = `${newLeft}px`;
        host.style.top = `${newTop}px`;
      };

      const onMouseUp = () => {
        isDragging = false;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
  });
}

function iconize(root: ShadowRoot) { createIcons({ icons: { Bookmark, BookOpen, Check, Languages, LoaderCircle, LogIn, Save, Volume2, X }, attrs: { width: "17", height: "17", "stroke-width": "1.8" }, nameAttr: "data-icon", root }); }

function render(html: string, isPassage = false) {
  const root = getRoot(); root.querySelector(".popup")?.remove(); const popup = document.createElement("section"); popup.className = isPassage ? "popup passage-popup" : "popup"; popup.setAttribute("role", "dialog"); popup.setAttribute("aria-label", isPassage ? "VocabLens dịch đoạn" : "VocabLens tra từ"); popup.innerHTML = html; root.appendChild(popup); iconize(root);
  root.getElementById("close")?.addEventListener("click", closePopup);
}

function closePopup() { document.getElementById(HOST_ID)?.remove(); currentEntry = null; currentPassage = null; selectedDifficultWords = new Set(); currentSelectionRect = null; hasBeenDragged = false; removeTrigger(); }

async function send(message: ExtensionRequest): Promise<ExtensionResponse> {
  try { return await chrome.runtime.sendMessage(message); }
  catch { return { ok: false, error: "Extension vừa được cập nhật. Hãy tải lại trang và thử lại." }; }
}

// ─── Single word lookup ───

async function lookup(term: string, context: string) {
  render(`<div class="loading"><div><i data-icon="LoaderCircle" class="spin"></i><p style="margin-top:10px">Đang tra "${escapeHtml(term)}"...</p></div></div>`);
  const response = await send({ type: "LOOKUP", term, context });
  if (!response.ok) { render(`<div class="header"><div class="title"><h2>Chưa tra được từ</h2></div><button class="icon close" id="close" aria-label="Đóng"><i data-icon="X"></i></button></div><p class="error">${escapeHtml(response.error)}</p>`); return; }
  currentEntry = response.data as LexicalEntry;
  const entry = currentEntry;
  render(`<div class="header"><div class="title"><h2>${escapeHtml(entry.term)}</h2><span class="phonetic">${escapeHtml(entry.phonetic)}</span></div><button class="icon" id="speak" aria-label="Nghe phát âm"><i data-icon="Volume2"></i></button><button class="icon close" id="close" aria-label="Đóng"><i data-icon="X"></i></button></div>
    <div class="label">Definition · ${escapeHtml(entry.definitions[0]?.partOfSpeech ?? "word")}</div><p>${escapeHtml(entry.definitions[0]?.text ?? "")}</p>
    <div class="label">Tiếng Việt</div><div class="translation">${escapeHtml(entry.translationVi)}</div>
    ${entry.synonyms.length ? `<div class="label">Từ đồng nghĩa</div><div class="chips">${entry.synonyms.slice(0, 6).map(item => `<span class="chip">${escapeHtml(item)}</span>`).join("")}</div>` : ""}
    ${entry.examples[0] ? `<div class="label">Ví dụ</div><p style="color:#6b7280;font-style:italic">${escapeHtml(entry.examples[0])}</p>` : ""}
    <div class="label">Ngữ cảnh đang đọc</div><div class="context">${escapeHtml(context || "Không tìm thấy câu ngữ cảnh.")}</div>
    <button class="primary" id="save"><i data-icon="Bookmark"></i> Lưu từ và ngữ cảnh</button>`);
  const root = getRoot();
  root.getElementById("speak")?.addEventListener("click", () => { if (entry.audioUrl) new Audio(entry.audioUrl).play(); else speechSynthesis.speak(new SpeechSynthesisUtterance(entry.term)); });
  root.getElementById("save")?.addEventListener("click", saveWord);
}

async function saveWord() {
  if (!currentEntry) return;
  const button = getRoot().getElementById("save") as HTMLButtonElement; button.disabled = true; button.textContent = "Đang lưu...";
  const response = await send({ type: "SAVE_WORD", entry: currentEntry, occurrence: { contextSentence: currentContext, sourceUrl: location.href, sourceTitle: document.title } });
  if (!response.ok && response.code === "AUTH_REQUIRED") {
    button.disabled = false; button.innerHTML = `<i data-icon="LogIn"></i> Đăng nhập để lưu`; iconize(getRoot());
    button.onclick = async () => {
      button.disabled = true; button.textContent = "Đang mở đăng nhập...";
      const result = await send({ type: "SIGN_IN" });
      if (result.ok) saveWord();
      else { button.disabled = false; button.textContent = result.error; }
    };
    return;
  }
  if (!response.ok) { button.disabled = false; button.textContent = response.error; return; }
  button.classList.add("saved"); button.innerHTML = `<i data-icon="Check"></i> Đã lưu!`; iconize(getRoot()); window.setTimeout(closePopup, 1200);
}

// ─── Passage translation ───

async function translatePassage(text: string) {
  render(`<div class="loading"><div><i data-icon="LoaderCircle" class="spin"></i><p style="margin-top:10px">Đang dịch đoạn văn...</p><p style="font-size:11px;color:#9ca3af;margin-top:4px">${text.length} ký tự</p></div></div>`, true);

  const response = await send({ type: "TRANSLATE_PASSAGE", text, sourceUrl: location.href });

  if (!response.ok) {
    render(`<div class="header"><div class="title"><h2 class="passage-title"><i data-icon="Languages"></i>Không thể dịch</h2></div><button class="icon close" id="close" aria-label="Đóng"><i data-icon="X"></i></button></div><p class="error">${escapeHtml(response.error)}</p>`, true);
    return;
  }

  currentPassage = response.data as PassageTranslation;
  selectedDifficultWords = new Set(currentPassage.difficultWords.map((_, i) => i));
  renderPassageResult();
}

function renderPassageResult() {
  if (!currentPassage) return;
  const passage = currentPassage;

  const root = getRoot();
  const oldPopup = root.querySelector(".popup");
  const scrollTop = oldPopup ? oldPopup.scrollTop : 0;

  if (currentSelectionRect) {
    positionPopup(currentSelectionRect, true);
  }

  const wordsHtml = passage.difficultWords.length > 0
    ? passage.difficultWords.map((word, index) => {
      const isSelected = selectedDifficultWords.has(index);
      return `<li class="word-item${isSelected ? " selected" : ""}" data-word-index="${index}">
        <div class="word-checkbox"><svg class="word-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
        <div class="word-info">
          <span class="word-term">
            ${escapeHtml(word.word)}
            <span class="word-pos">${escapeHtml(word.partOfSpeech || "")}</span>
            ${word.phonetic ? `<span class="word-phonetic" style="color: #6b7280; font-family: ui-monospace, monospace; font-size: 11.5px; margin-left: 6px;">${escapeHtml(word.phonetic)}</span>` : ""}
          </span>
          <div class="word-meaning">${escapeHtml(word.meaning)}</div>
        </div>
        <span class="word-badge ${word.difficulty}">${word.difficulty === "advanced" ? "Nâng cao" : "Trung cấp"}</span>
      </li>`;
    }).join("")
    : `<p style="color:#9ca3af;font-size:12px;padding:8px 0">Không tìm thấy từ vựng khó.</p>`;

  const selectedCount = selectedDifficultWords.size;

  render(`
    <div class="header">
      <div class="title"><h2 class="passage-title"><i data-icon="Languages"></i> Dịch đoạn văn</h2></div>
      <button class="icon close" id="close" aria-label="Đóng"><i data-icon="X"></i></button>
    </div>

    <div class="label">Bản dịch tiếng Việt</div>
    <div class="passage-translation">${escapeHtml(passage.translatedText)}</div>

    ${passage.contextNote ? `<div class="label">Ghi chú bối cảnh</div><div class="context-note">${escapeHtml(passage.contextNote)}</div>` : ""}

    <div class="label" style="display:flex;align-items:center;justify-content:space-between">
      <span>Từ vựng khó (${passage.difficultWords.length})</span>
      ${passage.difficultWords.length > 1 ? `<div class="select-actions"><button class="select-btn" id="selectAll">Chọn tất cả</button><button class="select-btn" id="deselectAll">Bỏ chọn</button></div>` : ""}
    </div>
    <ul class="word-list">${wordsHtml}</ul>

    ${passage.difficultWords.length > 0 ? `<button class="primary" id="saveWords" ${selectedCount === 0 ? "disabled" : ""}><i data-icon="Save"></i> Lưu ${selectedCount} từ đã chọn</button>` : ""}
  `, true);

  const updatedRoot = getRoot();

  updatedRoot.querySelectorAll(".word-item").forEach(item => {
    item.addEventListener("click", () => {
      const index = Number((item as HTMLElement).dataset.wordIndex);
      if (selectedDifficultWords.has(index)) selectedDifficultWords.delete(index);
      else selectedDifficultWords.add(index);
      renderPassageResult();
    });
  });

  updatedRoot.getElementById("selectAll")?.addEventListener("click", (e) => {
    e.stopPropagation();
    selectedDifficultWords = new Set(passage.difficultWords.map((_, i) => i));
    renderPassageResult();
  });

  updatedRoot.getElementById("deselectAll")?.addEventListener("click", (e) => {
    e.stopPropagation();
    selectedDifficultWords = new Set();
    renderPassageResult();
  });

  updatedRoot.getElementById("saveWords")?.addEventListener("click", saveDifficultWords);

  const newPopup = updatedRoot.querySelector(".popup");
  if (newPopup) {
    newPopup.scrollTop = scrollTop;
  }
}

async function saveDifficultWords() {
  if (!currentPassage || selectedDifficultWords.size === 0) return;

  const button = getRoot().getElementById("saveWords") as HTMLButtonElement;
  button.disabled = true;
  button.innerHTML = `<i data-icon="LoaderCircle" class="spin"></i> Đang lưu ${selectedDifficultWords.size} từ...`;
  iconize(getRoot());

  const wordsToSave: DifficultWord[] = [...selectedDifficultWords]
    .sort()
    .map(i => currentPassage!.difficultWords[i]);

  const response = await send({
    type: "SAVE_DIFFICULT_WORDS",
    words: wordsToSave,
    sourceUrl: location.href,
    sourceTitle: document.title,
    contextSentence: currentPassage.originalText.slice(0, 2000)
  });

  if (!response.ok && response.code === "AUTH_REQUIRED") {
    button.disabled = false;
    button.innerHTML = `<i data-icon="LogIn"></i> Đăng nhập để lưu`;
    iconize(getRoot());
    button.onclick = async () => {
      button.disabled = true; button.textContent = "Đang mở đăng nhập...";
      const result = await send({ type: "SIGN_IN" });
      if (result.ok) saveDifficultWords();
      else { button.disabled = false; button.textContent = result.error; }
    };
    return;
  }

  if (!response.ok) {
    button.disabled = false;
    button.textContent = response.error;
    return;
  }

  const data = response.data as { saved: number; total: number };
  button.classList.add("saved");
  button.innerHTML = `<i data-icon="Check"></i> Đã lưu ${data.saved}/${data.total} từ!`;
  iconize(getRoot());
  window.setTimeout(closePopup, 2000);
}

function showTranslateTrigger(rect: DOMRect, text: string) {
  const root = getRoot();
  removeTrigger();
  
  const btn = document.createElement("button");
  btn.id = "vocablens-trigger-btn";
  btn.className = "trigger-btn";
  btn.innerHTML = `<i data-icon="Languages"></i> Dịch đoạn văn`;
  
  const btnWidth = 140; 
  const btnHeight = 32;
  const left = Math.max(10, Math.min(window.innerWidth - btnWidth - 10, rect.left + rect.width / 2 - btnWidth / 2));
  const top = rect.bottom + 8 + btnHeight < window.innerHeight
    ? rect.bottom + 8
    : Math.max(10, rect.top - btnHeight - 8);
    
  btn.style.cssText = `position:fixed;left:${left}px;top:${top}px;z-index:2147483647;`;
  root.appendChild(btn);
  iconize(root);
  
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    removeTrigger();
    hasBeenDragged = false;
    positionPopup(rect, true);
    translatePassage(text);
  });
}

function removeTrigger() {
  getRoot().getElementById("vocablens-trigger-btn")?.remove();
}

// ─── Event listeners ───

document.addEventListener("mouseup", event => {
  if ((event.target as Element)?.closest?.(`#${HOST_ID}`)) return;
  window.setTimeout(() => {
    const selection = window.getSelection(); const text = selection?.toString().trim() ?? "";
    if (!selection || selection.isCollapsed || !text) {
      removeTrigger();
      return;
    }
    const rect = selection.getRangeAt(0).getBoundingClientRect(); if (!rect.width && !rect.height) return;
    currentSelectionRect = rect;

    if (isLookupTerm(text)) {
      removeTrigger();
      currentContext = getContextSentence(selection);
      hasBeenDragged = false;
      getRoot(); positionPopup(rect, false);
      lookup(text, currentContext);
    } else if (isTranslatablePassage(text)) {
      hasBeenDragged = false;
      getRoot();
      showTranslateTrigger(rect, text);
    }
  }, 0);
});

document.addEventListener("keydown", event => { if (event.key === "Escape") closePopup(); });
document.addEventListener("mousedown", event => {
  const host = document.getElementById(HOST_ID);
  if (host && event.target !== host && !host.contains(event.target as Node)) {
    closePopup();
    removeTrigger();
  }
});
