"use client";

import { BookOpen, Chrome, Highlighter, Layers3 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function LoginClient() {
  async function signIn() {
    const supabase = createClient();
    if (!supabase) { toast.info("Supabase chưa cấu hình — đang mở chế độ trải nghiệm."); window.location.href = "/dashboard"; return; }
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
    if (error) toast.error(error.message);
  }
  return <main className="login-page" id="main-content">
    <section className="login-story"><Link href="/" className="brand" style={{ padding: 0, marginBottom: 50 }}><span className="brand-mark"><BookOpen /></span><div><strong>VocabLens</strong><small>Học từ trong ngữ cảnh</small></div></Link>
      <p className="eyebrow">Bôi đen. Hiểu. Ghi nhớ.</p><h1>Đừng để một từ mới làm đứt mạch đọc của bạn.</h1><p className="muted" style={{ fontSize: 17, maxWidth: 600 }}>Tra nghĩa ngay trên trang, giữ lại câu gốc và ôn đúng lúc — tất cả trong một vòng lặp nhẹ nhàng.</p>
      <div className="feature-list"><div className="feature"><Highlighter /><div><strong>Tra ngay tại chỗ</strong><p className="muted">Bôi đen một từ và nhận nghĩa, IPA, dịch Việt tức thì.</p></div></div><div className="feature"><Layers3 /><div><strong>Ôn theo nhịp nhớ</strong><p className="muted">Flashcard và quiz ưu tiên những từ bạn sắp quên.</p></div></div></div>
    </section>
    <section className="login-card-wrap"><div className="login-card"><span className="brand-mark" style={{ marginBottom: 22 }}><BookOpen /></span><h1>Chào mừng trở lại</h1><p className="muted" style={{ marginBottom: 28 }}>Đăng nhập một lần để đồng bộ từ giữa extension và web app.</p><button className="button button-primary button-lg" style={{ width: "100%" }} onClick={signIn}><Chrome size={19} /> Tiếp tục với Google</button><Link href="/dashboard" className="button button-secondary" style={{ width: "100%", marginTop: 10 }}>Xem bản trải nghiệm</Link><p className="muted small" style={{ textAlign: "center", marginTop: 18 }}>VocabLens chỉ lưu những từ và ngữ cảnh bạn chủ động chọn.</p></div></section>
  </main>;
}
