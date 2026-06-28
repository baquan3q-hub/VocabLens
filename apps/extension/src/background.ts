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

async function api(path: string, init: RequestInit): Promise<ExtensionResponse> {
  try {
    const response = await fetch(`${API_BASE}${path}`, { ...init, headers: { "content-type": "application/json", ...(await authHeaders()), ...(init.headers ?? {}) } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, error: body.error ?? "Không thể kết nối VocabLens.", code: body.code };
    return { ok: true, data: body.data, demo: body.demo };
  } catch { return { ok: false, error: "Không thể kết nối VocabLens. Kiểm tra web app đang chạy." }; }
}

async function signIn(): Promise<ExtensionResponse> {
  if (!supabase) return { ok: true, demo: true };
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
    if (message.type === "SAVE_WORD") return api("/api/words", { method: "POST", body: JSON.stringify({ entry: message.entry, occurrence: message.occurrence }) });
    if (message.type === "SIGN_IN") return signIn();
    if (message.type === "GET_SESSION") { const headers = await authHeaders(); return { ok: true, data: { signedIn: Boolean(headers.Authorization), demo: !supabase } } as ExtensionResponse; }
    return { ok: false, error: "Yêu cầu không được hỗ trợ." } as ExtensionResponse;
  })().then(sendResponse);
  return true;
});
