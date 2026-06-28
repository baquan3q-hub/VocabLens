"use client";

import { useEffect, useState } from "react";
import { Download, Highlighter, Info, Layers3 } from "lucide-react";

export default function ExtensionPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="page" style={{ maxWidth: 1000, margin: "0 auto" }}>
      <header className="page-header">
        <div>
          <p className="eyebrow">Chrome Extension</p>
          <h1>Cài đặt VocabLens Extension</h1>
          <p className="muted">Tra từ vựng trực tiếp trên mọi trang web và đồng bộ về Dashboard.</p>
        </div>
      </header>

      <div 
        className="panel" 
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1.2fr 0.8fr",
          gap: isMobile ? "24px" : "40px",
          padding: isMobile ? "24px" : "36px",
          alignItems: "center",
          marginBottom: "36px",
          background: "white",
          border: "1px solid var(--border)",
          borderRadius: 14,
          boxShadow: "var(--shadow-card)"
        }}
      >
        <div className="hero-content">
          <div 
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--success-light)",
              color: "var(--success-dark)",
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 999,
              marginBottom: 16
            }}
          >
            <span className="legend-dot green" style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--success)" }}></span>
            Tiện ích chính thức
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Bôi đen để học từ vựng tức thì</h2>
          <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            Với VocabLens Extension, bạn không còn phải chuyển tab để tra từ hay sao chép thủ công. 
            Chỉ cần bôi đen bất kỳ từ nào khi đang đọc tài liệu, popup thông tin đầy đủ sẽ hiện ra ngay tại chỗ.
          </p>
          
          <div 
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: 20,
              margin: "24px 0"
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Highlighter style={{ color: "var(--primary-500)", flexShrink: 0, width: 20, height: 20, marginTop: 2 }} />
              <div>
                <strong style={{ display: "block", fontSize: 14, fontWeight: 600 }}>Tra từ tại chỗ</strong>
                <p className="muted" style={{ fontSize: 12, margin: 0, lineHeight: 1.4 }}>Định nghĩa Oxford, phiên âm IPA & bản dịch tiếng Việt AI.</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Layers3 style={{ color: "var(--success)", flexShrink: 0, width: 20, height: 20, marginTop: 2 }} />
              <div>
                <strong style={{ display: "block", fontSize: 14, fontWeight: 600 }}>Lưu kèm ngữ cảnh</strong>
                <p className="muted" style={{ fontSize: 12, margin: 0, lineHeight: 1.4 }}>Lưu từ vựng kèm câu văn bạn đang đọc và URL nguồn để ôn tập sau.</p>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: 28 }}>
            <a href="/vocablens-extension.zip" download className="button button-primary button-lg" style={{ display: "inline-flex" }}>
              <Download size={18} /> Tải xuống Extension (.zip)
            </a>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <div 
            className="mock-extension-popup"
            style={{
              width: 320,
              background: "white",
              border: "1px solid var(--primary-200)",
              borderRadius: 20,
              padding: 20,
              boxShadow: "var(--shadow-xl)",
              position: "relative"
            }}
          >
            <div className="mock-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <strong style={{ fontSize: 18, color: "var(--primary-700)", display: "block" }}>paradigm</strong>
                <span className="phonetic" style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-2)" }}>/ˈpær.ə.daɪm/</span>
              </div>
              <span className="badge badge-new" style={{ fontSize: 11 }}>noun</span>
            </div>
            <div 
              className="mock-translation" 
              style={{
                background: "var(--primary-50)",
                borderLeft: "3px solid var(--primary-400)",
                borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                padding: "8px 10px",
                fontWeight: 600,
                fontSize: 12,
                marginBottom: 12,
                color: "var(--primary-700)"
              }}
            >
              Bản dịch: Mô hình, kiểu mẫu
            </div>
            <p style={{ fontSize: 12, color: "var(--text-2)", margin: "0 0 10px 0" }}>A typical example or pattern of something; a model.</p>
            <p style={{ fontSize: 11, color: "var(--text-3)", fontStyle: "italic", borderLeft: "2px solid var(--border-strong)", paddingLeft: 8, margin: "0 0 16px 0" }}>
              &ldquo;A paradigm shift can change the way a team understands a problem.&rdquo;
            </p>
            <button className="button button-primary button-sm" style={{ width: "100%", background: "var(--success)", border: "none", color: "white" }} disabled>
              ✓ Saved to Dashboard
            </button>
          </div>
        </div>
      </div>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Hướng dẫn cài đặt thủ công (Developer Mode)</h2>
        <p className="muted" style={{ marginBottom: 24 }}>
          Do tiện ích đang ở giai đoạn phát triển cục bộ, bạn có thể dễ dàng cài đặt vào Chrome/Cốc Cốc qua các bước sau:
        </p>

        <div 
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
            gap: 20,
            paddingTop: 16
          }}
        >
          <div className="panel" style={{ position: "relative", padding: 24, display: "flex", flexDirection: "column", height: "100%", background: "white", border: "1px solid var(--border)", borderRadius: 14 }}>
            <span 
              style={{
                position: "absolute",
                top: -16,
                left: 20,
                width: 32,
                height: 32,
                background: "var(--primary-600)",
                color: "white",
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                fontSize: 14,
                boxShadow: "0 4px 10px rgba(124, 58, 237, 0.3)"
              }}
            >
              1
            </span>
            <h3 style={{ marginTop: 8, marginBottom: 10, fontSize: 15, fontWeight: 700 }}>Tải &amp; Giải nén</h3>
            <p style={{ fontSize: 12, color: "var(--text-2)", margin: 0, lineHeight: 1.5 }}>
              Nhấn nút tải file zip ở trên. Sau khi tải xuống, nhấn chuột phải chọn <strong>Extract All...</strong> (Giải nén) để giải nén tệp tin ra một thư mục.
            </p>
          </div>

          <div className="panel" style={{ position: "relative", padding: 24, display: "flex", flexDirection: "column", height: "100%", background: "white", border: "1px solid var(--border)", borderRadius: 14 }}>
            <span 
              style={{
                position: "absolute",
                top: -16,
                left: 20,
                width: 32,
                height: 32,
                background: "var(--primary-600)",
                color: "white",
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                fontSize: 14,
                boxShadow: "0 4px 10px rgba(124, 58, 237, 0.3)"
              }}
            >
              2
            </span>
            <h3 style={{ marginTop: 8, marginBottom: 10, fontSize: 15, fontWeight: 700 }}>Mở trang Tiện ích</h3>
            <p style={{ fontSize: 12, color: "var(--text-2)", margin: 0, lineHeight: 1.5 }}>
              Mở tab mới trên trình duyệt Chrome, truy cập vào địa chỉ <code className="code-url" style={{ fontFamily: "var(--font-mono)", background: "var(--surface-2)", padding: "2px 6px", borderRadius: "var(--radius-sm)", fontSize: 11, color: "var(--primary-700)", fontWeight: 600 }}>chrome://extensions</code> hoặc click biểu tượng mảnh ghép &gt; Quản lý tiện ích.
            </p>
          </div>

          <div className="panel" style={{ position: "relative", padding: 24, display: "flex", flexDirection: "column", height: "100%", background: "white", border: "1px solid var(--border)", borderRadius: 14 }}>
            <span 
              style={{
                position: "absolute",
                top: -16,
                left: 20,
                width: 32,
                height: 32,
                background: "var(--primary-600)",
                color: "white",
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                fontSize: 14,
                boxShadow: "0 4px 10px rgba(124, 58, 237, 0.3)"
              }}
            >
              3
            </span>
            <h3 style={{ marginTop: 8, marginBottom: 10, fontSize: 15, fontWeight: 700 }}>Bật Developer Mode</h3>
            <p style={{ fontSize: 12, color: "var(--text-2)", margin: 0, lineHeight: 1.5 }}>
              Tìm công tắc <strong>Developer mode</strong> (Chế độ dành cho nhà phát triển) ở góc trên bên phải màn hình và bật công tắc này lên.
            </p>
          </div>

          <div className="panel" style={{ position: "relative", padding: 24, display: "flex", flexDirection: "column", height: "100%", background: "white", border: "1px solid var(--border)", borderRadius: 14 }}>
            <span 
              style={{
                position: "absolute",
                top: -16,
                left: 20,
                width: 32,
                height: 32,
                background: "var(--primary-600)",
                color: "white",
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                fontSize: 14,
                boxShadow: "0 4px 10px rgba(124, 58, 237, 0.3)"
              }}
            >
              4
            </span>
            <h3 style={{ marginTop: 8, marginBottom: 10, fontSize: 15, fontWeight: 700 }}>Tải thư mục giải nén</h3>
            <p style={{ fontSize: 12, color: "var(--text-2)", margin: 0, lineHeight: 1.5 }}>
              Click nút <strong>Load unpacked</strong> (Tải tiện ích đã giải nén) ở góc trên bên trái, sau đó chọn đúng thư mục chứa extension mà bạn vừa giải nén ở Bước 1.
            </p>
          </div>
        </div>
      </section>

      <section 
        className="panel" 
        style={{
          padding: 24,
          background: "#fef08a22",
          borderColor: "#fef08a",
          borderStyle: "solid",
          borderWidth: 1,
          borderRadius: 14
        }}
      >
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <Info style={{ color: "#ca8a04", flexShrink: 0, width: 22, height: 22, marginTop: 2 }} />
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px 0" }}>Lưu ý quan trọng cho nhà phát triển</h3>
            <p className="muted" style={{ fontSize: 13, margin: 0 }}>
              Sau khi cài đặt thành công, extension sẽ tự động liên kết với địa chỉ API cục bộ hoặc Vercel production được cấu hình trong file môi trường. Hãy đảm bảo bạn đã chạy máy chủ web cục bộ (`npm run dev`) để kiểm tra đầy đủ tính năng.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
