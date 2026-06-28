import { BookOpen, createIcons, LayoutDashboard, LogIn } from "lucide";
import type { ExtensionResponse } from "./messages";

type SessionInfo = { signedIn: boolean; configured: boolean; apiBase: string; demo: boolean };
const status = document.getElementById("status")!;
const signIn = document.getElementById("signin") as HTMLButtonElement;
const dashboard = document.getElementById("dashboard") as HTMLAnchorElement;
const meta = document.getElementById("meta")!;

createIcons({ icons: { BookOpen, LayoutDashboard, LogIn }, nameAttr: "data-icon", attrs: { width: "18", height: "18", "stroke-width": "1.8" } });

async function refresh() {
  try {
    const response = await chrome.runtime.sendMessage({ type: "GET_SESSION" }) as ExtensionResponse;
    if (!response.ok) throw new Error(response.error);
    const info = response.data as SessionInfo;
    dashboard.href = `${info.apiBase}/dashboard`;
    meta.textContent = `API: ${info.apiBase}`;
    if (info.demo) { status.textContent = "Đang dùng chế độ local demo. Tra và lưu từ đã sẵn sàng."; signIn.hidden = true; return; }
    if (info.signedIn) { status.textContent = "Đã đăng nhập. Extension sẵn sàng tra và đồng bộ từ."; signIn.hidden = true; return; }
    status.textContent = "Kết nối API thành công. Đăng nhập để đồng bộ từ."; signIn.hidden = false;
  } catch (error) {
    status.classList.add("error"); status.textContent = error instanceof Error ? error.message : "Không thể kiểm tra extension.";
  }
}

signIn.addEventListener("click", async () => {
  signIn.disabled = true; status.textContent = "Đang mở đăng nhập Google...";
  const response = await chrome.runtime.sendMessage({ type: "SIGN_IN" }) as ExtensionResponse;
  if (!response.ok) { status.classList.add("error"); status.textContent = response.error; signIn.disabled = false; return; }
  status.classList.remove("error"); await refresh();
});

refresh();
