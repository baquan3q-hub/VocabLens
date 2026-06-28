import { Bookmark, Check, createIcons, LoaderCircle, LogIn, Volume2, X } from "lucide";
import { isLookupTerm, type LexicalEntry } from "@vocablens/shared";
import type { ExtensionRequest, ExtensionResponse } from "./messages";

const HOST_ID = "vocablens-shadow-host";
let currentEntry: LexicalEntry | null = null;
let currentContext = "";

const styles = `
  :host { all: initial; color-scheme: light; }
  * { box-sizing: border-box; }
  .popup { width: 360px; max-height: min(520px, calc(100vh - 24px)); overflow: auto; background: #fff; color: #111827; border: 1px solid #e5e7eb; border-radius: 18px; box-shadow: 0 12px 36px rgba(15,23,42,.18); padding: 18px; font-family: Inter, ui-sans-serif, system-ui, sans-serif; font-size: 14px; line-height: 1.55; animation: enter 180ms ease-out; }
  @keyframes enter { from { opacity: 0; transform: translateY(7px); } }
  .header { display: flex; align-items: flex-start; gap: 8px; }
  .title { flex: 1; min-width: 0; }
  h2 { margin: 0; font-size: 23px; line-height: 1.25; letter-spacing: -.02em; }
  .phonetic { color: #6b7280; font-family: ui-monospace, monospace; font-size: 12px; }
  button { min-height: 40px; border: 1px solid transparent; border-radius: 9px; padding: 8px 12px; font: 600 13px/1.2 Inter, ui-sans-serif, system-ui, sans-serif; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 7px; }
  button:focus-visible { outline: 3px solid rgba(139,92,246,.28); outline-offset: 2px; }
  .icon { width: 36px; min-height: 36px; padding: 0; color: #7c3aed; background: #f5f3ff; }
  .icon.close { color: #6b7280; background: transparent; }
  .label { margin: 14px 0 4px; color: #9ca3af; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .09em; }
  p { margin: 0; }
  .translation { background: #f5f3ff; border-left: 3px solid #a78bfa; border-radius: 0 7px 7px 0; padding: 9px 11px; color: #6d28d9; font-weight: 600; }
  .context { background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 9px 11px; color: #6b7280; font-size: 12px; font-style: italic; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip { background: #f3f4f6; color: #15803d; border-radius: 999px; padding: 3px 8px; font-size: 11px; }
  .primary { width: 100%; margin-top: 15px; background: #7c3aed; color: white; }
  .primary:hover { background: #6d28d9; }
  .primary.saved { background: #22c55e; }
  .error { color: #b91c1c; background: #fee2e2; border-radius: 8px; padding: 10px 12px; }
  .loading { min-height: 150px; display: grid; place-items: center; color: #7c3aed; text-align: center; }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { * { animation-duration: .01ms !important; } }
`;

function escapeHtml(value: string) { const div = document.createElement("div"); div.textContent = value; return div.innerHTML; }

function getContextSentence(selection: Selection): string {
  const node = selection.anchorNode;
  const container = node?.parentElement?.closest("p, li, article, blockquote, td, div") ?? node?.parentElement;
  const text = (((container as HTMLElement | null)?.innerText) || node?.textContent || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  const selected = selection.toString().trim();
  const position = text.toLowerCase().indexOf(selected.toLowerCase());
  if (position < 0) return text.slice(0, 500);
  const before = text.lastIndexOf(".", position - 1) + 1;
  const afterPeriod = text.indexOf(".", position + selected.length);
  const afterQuestion = text.indexOf("?", position + selected.length);
  const afterExclamation = text.indexOf("!", position + selected.length);
  const endings = [afterPeriod, afterQuestion, afterExclamation].filter(value => value >= 0);
  const after = endings.length ? Math.min(...endings) + 1 : Math.min(text.length, position + selected.length + 250);
  return text.slice(before, after).trim().slice(0, 1000);
}

function getRoot(): ShadowRoot {
  let host = document.getElementById(HOST_ID);
  if (!host) {
    host = document.createElement("div"); host.id = HOST_ID; host.style.cssText = "position:fixed;z-index:2147483647;left:0;top:0";
    document.documentElement.appendChild(host); const root = host.attachShadow({ mode: "open" }); const style = document.createElement("style"); style.textContent = styles; root.appendChild(style); root.addEventListener("click", event => event.stopPropagation());
  }
  return host.shadowRoot!;
}

function positionPopup(rect: DOMRect) {
  const host = document.getElementById(HOST_ID)!;
  const width = 360; const gap = 10;
  const left = Math.max(12, Math.min(window.innerWidth - width - 12, rect.left + rect.width / 2 - width / 2));
  const estimatedHeight = 420;
  const top = rect.bottom + gap + estimatedHeight < window.innerHeight ? rect.bottom + gap : Math.max(12, rect.top - estimatedHeight - gap);
  host.style.left = `${left}px`; host.style.top = `${top}px`;
}

function iconize(root: ShadowRoot) { createIcons({ icons: { Bookmark, Check, LoaderCircle, LogIn, Volume2, X }, attrs: { width: "17", height: "17", "stroke-width": "1.8" }, nameAttr: "data-icon", root }); }

function render(html: string) {
  const root = getRoot(); root.querySelector(".popup")?.remove(); const popup = document.createElement("section"); popup.className = "popup"; popup.setAttribute("role", "dialog"); popup.setAttribute("aria-label", "VocabLens tra từ"); popup.innerHTML = html; root.appendChild(popup); iconize(root);
  root.getElementById("close")?.addEventListener("click", closePopup);
}

function closePopup() { document.getElementById(HOST_ID)?.remove(); currentEntry = null; }

function send(message: ExtensionRequest): Promise<ExtensionResponse> { return chrome.runtime.sendMessage(message); }

async function lookup(term: string, context: string) {
  render(`<div class="loading"><div><i data-icon="LoaderCircle" class="spin"></i><p style="margin-top:10px">Đang tra “${escapeHtml(term)}”...</p></div></div>`);
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
  if (!response.ok && response.code === "AUTH_REQUIRED") { button.disabled = false; button.innerHTML = `<i data-icon="LogIn"></i> Đăng nhập để lưu`; iconize(getRoot()); button.onclick = async () => { const result = await send({ type: "SIGN_IN" }); if (result.ok) saveWord(); }; return; }
  if (!response.ok) { button.disabled = false; button.textContent = response.error; return; }
  button.classList.add("saved"); button.innerHTML = `<i data-icon="Check"></i> Đã lưu!`; iconize(getRoot()); window.setTimeout(closePopup, 1200);
}

document.addEventListener("mouseup", event => {
  if ((event.target as Element)?.closest?.(`#${HOST_ID}`)) return;
  window.setTimeout(() => {
    const selection = window.getSelection(); const term = selection?.toString().trim() ?? "";
    if (!selection || selection.isCollapsed || !isLookupTerm(term)) return;
    const rect = selection.getRangeAt(0).getBoundingClientRect(); if (!rect.width && !rect.height) return;
    currentContext = getContextSentence(selection); getRoot(); positionPopup(rect); lookup(term, currentContext);
  }, 0);
});

document.addEventListener("keydown", event => { if (event.key === "Escape") closePopup(); });
document.addEventListener("mousedown", event => { const host = document.getElementById(HOST_ID); if (host && event.target !== host && !host.contains(event.target as Node)) closePopup(); });
