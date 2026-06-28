import { createClient, type SupportedStorage } from "@supabase/supabase-js";
import type { ExtensionRequest, ExtensionResponse } from "./messages";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const chromeStorage: SupportedStorage = {
  async getItem(key) { const result = await chrome.storage.local.get(key); return typeof result[key] === "string" ? result[key] : null; },
  async setItem(key, value) { await chrome.storage.local.set({ [key]: value }); },
  async removeItem(key) { await chrome.storage.local.remove(key); }
};

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, {
  auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storage: chromeStorage }
}) : null;

async function authHeaders(): Promise<Record<string, string>> {
  if (!supabase) return { "x-vocablens-demo": "true" };
  const { data } = await supabase.auth.getSession();
  return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
}

let activeApiBase = API_BASE;

async function getApiBase(): Promise<string> {
  const stored = await chrome.storage.local.get("api_base_url");
  return stored.api_base_url || activeApiBase;
}

async function detectActivePort(currentBase: string): Promise<string> {
  if (!currentBase.includes("localhost")) return currentBase;
  
  const ports = ["3000", "3001", "3002"];
  const currentUrl = new URL(currentBase);
  const currentPort = currentUrl.port;
  const checkPorts = [currentPort, ...ports.filter(p => p !== currentPort)];
  
  for (const port of checkPorts) {
    const testUrl = `${currentUrl.protocol}//${currentUrl.hostname}:${port}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${testUrl}/api/words?limit=1`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok || res.status === 401 || res.status === 200) {
        console.log(`[VocabLens] Auto-detected active API server at: ${testUrl}`);
        activeApiBase = testUrl;
        await chrome.storage.local.set({ api_base_url: testUrl });
        return testUrl;
      }
    } catch {
      // Ignored
    }
  }
  return currentBase;
}

async function api(path: string, init: RequestInit): Promise<ExtensionResponse> {
  let apiBase = await getApiBase();
  try {
    const response = await fetch(`${apiBase}${path}`, { ...init, headers: { "content-type": "application/json", ...(await authHeaders()), ...(init.headers ?? {}) } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, error: body.error ?? "Không thể kết nối VocabLens.", code: body.code };
    return { ok: true, data: body.data, demo: body.demo };
  } catch {
    console.warn(`[VocabLens] Connection to ${apiBase} failed. Detecting active port...`);
    const detectedBase = await detectActivePort(apiBase);
    if (detectedBase !== apiBase) {
      try {
        const response = await fetch(`${detectedBase}${path}`, { ...init, headers: { "content-type": "application/json", ...(await authHeaders()), ...(init.headers ?? {}) } });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) return { ok: false, error: body.error ?? "Không thể kết nối VocabLens.", code: body.code };
        return { ok: true, data: body.data, demo: body.demo };
      } catch {
        // Fall through
      }
    }
    return { ok: false, error: `Không thể kết nối tới server VocabLens (${apiBase}). Vui lòng đảm bảo server của bạn đang chạy.` };
  }
}

async function signIn(): Promise<ExtensionResponse> {
  if (!supabase) return { ok: false, error: "Extension chưa có cấu hình Supabase production.", code: "AUTH_CONFIG_MISSING" };
  const redirectTo = chrome.identity.getRedirectURL("auth");
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo, skipBrowserRedirect: true } });
  if (error || !data.url) return { ok: false, error: error?.message ?? "Không thể bắt đầu đăng nhập." };
  try {
    const finalUrl = await chrome.identity.launchWebAuthFlow({ url: data.url, interactive: true });
    if (!finalUrl) return { ok: false, error: "Đăng nhập đã bị hủy." };
    const code = new URL(finalUrl).searchParams.get("code");
    if (!code) return { ok: false, error: "Không nhận được mã xác thực." };
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) return { ok: false, error: exchangeError.message };
    return { ok: true };
  } catch { return { ok: false, error: "Đăng nhập đã bị hủy." }; }
}

chrome.runtime.onMessage.addListener((message: ExtensionRequest, _sender, sendResponse: (response: ExtensionResponse) => void) => {
  (async () => {
    if (message.type === "LOOKUP") return api("/api/lookup", { method: "POST", body: JSON.stringify({ term: message.term, context: message.context }) });
    if (message.type === "TRANSLATE_PASSAGE") return api("/api/translate", { method: "POST", body: JSON.stringify({ text: message.text, sourceUrl: message.sourceUrl }) });
    if (message.type === "SAVE_WORD") return api("/api/words", { method: "POST", body: JSON.stringify({ entry: message.entry, occurrence: message.occurrence }) });
    if (message.type === "SAVE_DIFFICULT_WORDS") {
      const results: Array<{ word: string; ok: boolean }> = [];
      for (const word of message.words) {
        const lookupResult = await api("/api/lookup", { method: "POST", body: JSON.stringify({ term: word.word, context: message.contextSentence }) });
        let saveResult;
        if (lookupResult.ok && lookupResult.data) {
          const entry = lookupResult.data as Record<string, unknown>;
          saveResult = await api("/api/words", {
            method: "POST",
            body: JSON.stringify({
              entry: { ...entry, translationVi: word.meaning || entry.translationVi },
              occurrence: { contextSentence: message.contextSentence, sourceUrl: message.sourceUrl, sourceTitle: message.sourceTitle }
            })
          });
        } else {
          const fallbackEntry = {
            term: word.word, normalizedTerm: word.word.toLowerCase(), phonetic: word.phonetic || "",
            definitions: [{ partOfSpeech: word.partOfSpeech || "word", text: word.meaning }],
            translationVi: word.meaning, synonyms: [], antonyms: [], examples: [], source: "fallback" as const
          };
          saveResult = await api("/api/words", {
            method: "POST",
            body: JSON.stringify({
              entry: fallbackEntry,
              occurrence: { contextSentence: message.contextSentence, sourceUrl: message.sourceUrl, sourceTitle: message.sourceTitle }
            })
          });
        }
        if (!saveResult.ok && saveResult.code === "AUTH_REQUIRED") {
          return { ok: false, error: saveResult.error, code: "AUTH_REQUIRED" };
        }
        results.push({ word: word.word, ok: saveResult.ok });
      }
      const saved = results.filter(r => r.ok).length;
      return { ok: true, data: { saved, total: message.words.length } } as ExtensionResponse;
    }
    if (message.type === "SIGN_IN") return signIn();
    if (message.type === "GET_SESSION") {
      const headers = await authHeaders();
      const apiBase = await getApiBase();
      return { ok: true, data: { signedIn: Boolean(headers.Authorization), configured: Boolean(supabase), apiBase, demo: !supabase } } as ExtensionResponse;
    }
    return { ok: false, error: "Yêu cầu không được hỗ trợ." } as ExtensionResponse;
  })().then(sendResponse);
  return true;
});
