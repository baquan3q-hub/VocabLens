"use client";

import { BookOpen, Chrome, HelpCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function LoginClient() {
  async function signIn() {
    const supabase = createClient();
    if (!supabase) {
      toast.info("Supabase chưa cấu hình — đang mở chế độ trải nghiệm.");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 800);
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) toast.error(error.message);
  }

  return (
    <main className="login-wrap-glass" id="main-content">
      {/* Background decoration blobs */}
      <div className="bg-blobs">
        <div className="blur-blob blob-primary"></div>
        <div className="blur-blob blob-success"></div>
        <div className="blur-blob blob-warning"></div>
      </div>

      {/* Back to Home button */}
      <Link 
        href="/" 
        className="button button-secondary" 
        style={{ 
          position: "absolute", 
          top: "24px", 
          left: "24px", 
          zIndex: 20, 
          minHeight: "36px", 
          padding: "6px 12px",
          gap: "6px",
          fontSize: "13px"
        }}
      >
        <ArrowLeft size={14} /> Quay lại trang chủ
      </Link>

      {/* Login Card */}
      <section className="login-card-glass glass-panel" aria-labelledby="login-title">
        <span className="brand-mark" aria-hidden="true" style={{ width: "48px", height: "48px", borderRadius: "12px", marginBottom: "20px" }}>
          <BookOpen size={26} />
        </span>
        
        <h1 id="login-title">Chào mừng trở lại</h1>
        <p className="muted" style={{ fontSize: "14px", lineHeight: "1.5", marginBottom: "32px" }}>
          Đăng nhập một lần duy nhất để đồng bộ từ vựng và câu ngữ cảnh giữa extension trên trình duyệt và web app.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button 
            className="button button-primary button-lg" 
            style={{ width: "100%", gap: "10px", fontSize: "15px" }} 
            onClick={signIn}
          >
            <Chrome size={20} fill="currentColor" style={{ color: "white" }} /> Tiếp tục với Google
          </button>
          
          <Link 
            href="/dashboard" 
            className="button button-secondary button-lg" 
            style={{ width: "100%", fontSize: "14px" }}
          >
            Dùng thử bản Demo (Không lưu dữ liệu)
          </Link>
        </div>

        <div style={{ marginTop: "32px", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
          <p className="muted small" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", margin: 0 }}>
            <HelpCircle size={14} />
            Đồng bộ đám mây giúp bạn học từ mọi nơi.
          </p>
        </div>
      </section>
    </main>
  );
}
