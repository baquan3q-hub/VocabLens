"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Chrome, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Cloud, 
  BarChart3, 
  Layers3, 
  CircleHelp, 
  Puzzle, 
  Play, 
  Volume2, 
  CheckCircle,
  HelpCircle,
  Library,
  ChevronRight
} from "lucide-react";

export function LandingClient() {
  const [wordClicked, setWordClicked] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const speakWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance("serendipity");
      utterance.lang = "en-US";
      utterance.rate = 0.85;
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="landing-body">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-header-container">
          <Link href="/" className="landing-brand">
            <span className="brand-mark">
              <BookOpen size={20} />
            </span>
            <strong>VocabLens</strong>
          </Link>
          
          <nav className="landing-nav" aria-label="Menu phụ">
            <a href="#features" className="landing-nav-link">Tính năng</a>
            <a href="#workflow" className="landing-nav-link">Cách hoạt động</a>
            <a href="#pricing" className="landing-nav-link">Bảng giá</a>
          </nav>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Link href="/login" className="button button-ghost" style={{ minHeight: "36px", fontSize: "13.5px" }}>
              Đăng nhập
            </Link>
            <Link href="/login" className="button button-primary" style={{ minHeight: "36px", padding: "0 14px", fontSize: "13px" }}>
              Dùng thử miễn phí
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main id="main-content">
        <section className="landing-hero" aria-labelledby="hero-title">
          <div className="hero-content">
            <div className="hero-badge">
              <span></span> Tích hợp Trí tuệ Nhân tạo AI
            </div>
            <h1 id="hero-title" className="hero-title">
              Đọc trôi chảy,<br /><span>ghi nhớ tự nhiên.</span>
            </h1>
            <p className="hero-desc">
              Tra nghĩa từ vựng tiếng Anh trực tiếp trên mọi trang web mà không ngắt mạch đọc. Lưu trữ ngữ cảnh gốc và ôn tập thông minh bằng thuật toán lặp lại ngắt quãng.
            </p>
            <div className="hero-actions">
              <Link href="/login" className="button button-primary button-lg">
                Bắt đầu ngay <ArrowRight size={16} />
              </Link>
              <Link href="/extension" className="button button-secondary button-lg">
                <Chrome size={18} /> Cài đặt Extension
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="bg-blobs">
              <div className="blur-blob blob-primary"></div>
              <div className="blur-blob blob-warning"></div>
            </div>
            
            {/* Interactive extension mockup */}
            <div className="mockup-browser">
              <div className="mockup-header-bar">
                <div className="mockup-dots">
                  <span className="mockup-dot"></span>
                  <span className="mockup-dot"></span>
                  <span className="mockup-dot"></span>
                </div>
                <div className="mockup-url">en.wikipedia.org/wiki/Serendipity</div>
              </div>
              <div className="mockup-content">
                <p style={{ margin: 0 }}>
                  The discovery of penicillin was a stroke of pure{" "}
                  <span 
                    className="mockup-highlight"
                    onClick={() => setWordClicked(!wordClicked)}
                    title="Click để ẩn/hiện popup dịch"
                  >
                    serendipity
                  </span>
                  . Alexander Fleming noticed a mold that killed bacteria, leading to the world's first active antibiotic.
                </p>

                {wordClicked && (
                  <div className="mockup-popover">
                    <div className="mockup-popover-header">
                      <div>
                        <span className="mockup-popover-word">serendipity</span>
                        <span className="mockup-popover-ipa" style={{ marginLeft: "8px" }}>/ˌser.ənˈdɪp.ɪ.ti/</span>
                      </div>
                      <span className="mockup-popover-type">noun</span>
                    </div>

                    <div className="mockup-popover-trans">
                      sự tình cờ may mắn 🍀
                    </div>

                    <div className="mockup-popover-def">
                      <strong>Định nghĩa:</strong> The occurrence and development of events by chance in a happy or beneficial way.
                    </div>

                    <div className="mockup-popover-context">
                      <strong>Ngữ cảnh:</strong> "...was a stroke of pure <span style={{ color: "var(--primary-600)", fontWeight: 600 }}>serendipity</span>."
                    </div>

                    <div style={{ marginTop: "14px", display: "flex", gap: "8px" }}>
                      <button 
                        className="button button-primary" 
                        style={{ flex: 1, minHeight: "30px", fontSize: "11px", padding: "4px 8px" }}
                        onClick={speakWord}
                      >
                        <Volume2 size={13} className={isPlaying ? "animate-pulse" : ""} /> 
                        {isPlaying ? "Đang đọc..." : "Phát âm"}
                      </button>
                      <Link 
                        href="/login" 
                        className="button button-secondary" 
                        style={{ flex: 1, minHeight: "30px", fontSize: "11px", padding: "4px 8px" }}
                      >
                        Lưu vào kho từ
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="section-features" aria-labelledby="features-title">
          <div className="section-title-wrap">
            <h2 id="features-title" className="section-title">Tính năng nổi bật thiết kế riêng cho bạn</h2>
            <p className="section-subtitle">VocabLens kết hợp sức mạnh của một bộ từ điển ngữ cảnh và một huấn luyện viên ghi nhớ cá nhân.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card-landing">
              <div className="feature-icon-box">
                <Puzzle size={24} />
              </div>
              <h3>Tra Từ Tức Thì</h3>
              <p>Bôi đen bất kỳ từ hoặc cụm từ tiếng Anh nào khi lướt web, đọc báo hoặc tài liệu để tra từ điển tức thì không cần rời trang.</p>
            </div>

            <div className="feature-card-landing">
              <div className="feature-icon-box" style={{ background: "var(--success-light)", color: "var(--success-dark)" }}>
                <Sparkles size={24} />
              </div>
              <h3>AI Giải Mã Ngữ Cảnh</h3>
              <p>Hệ thống tự động trích xuất câu gốc và phân tích từ loại, nghĩa chuẩn xác nhất dựa trên văn cảnh nhờ công nghệ AI thông minh.</p>
            </div>

            <div className="feature-card-landing">
              <div className="feature-icon-box" style={{ background: "var(--warning-light)", color: "#b45309" }}>
                <Layers3 size={24} />
              </div>
              <h3>Lặp Lại Ngắt Quãng</h3>
              <p>Thuật toán Spaced Repetition tự động tính toán thời gian vàng để hiển thị flashcard & quiz ôn tập trước khi bạn chuẩn bị quên.</p>
            </div>

            <div className="feature-card-landing">
              <div className="feature-icon-box" style={{ background: "#eff6ff", color: "#1d4ed8" }}>
                <Cloud size={24} />
              </div>
              <h3>Đồng Bộ Đám Mây</h3>
              <p>Lưu từ vựng bằng extension và quản lý, ôn tập chúng ngay trên thiết bị di động hay máy tính thông qua ứng dụng Web tiện lợi.</p>
            </div>

            <div className="feature-card-landing">
              <div className="feature-icon-box" style={{ background: "#fdf2f8", color: "#db2777" }}>
                <BarChart3 size={24} />
              </div>
              <h3>Phân Tích Tiến Độ</h3>
              <p>Biểu đồ xu hướng học tập trực quan giúp bạn theo dõi tỷ lệ nhớ từ, số ngày học liên tục (streak) và phân bố trình độ.</p>
            </div>

            <div className="feature-card-landing">
              <div className="feature-icon-box" style={{ background: "#f0fdf4", color: "#15803d" }}>
                <Zap size={24} />
              </div>
              <h3>Siêu Nhẹ & Tối Giản</h3>
              <p>Extension hoạt động mượt mà, không quảng cáo, không làm chậm trình duyệt, thiết kế gọn gàng giúp tối đa hóa khả năng tập trung.</p>
            </div>
          </div>
        </section>

        {/* Workflow / Learning Loop */}
        <section id="workflow" style={{ padding: "10px 24px" }} aria-labelledby="workflow-title">
          <div className="loop-container">
            <div className="loop-text">
              <h2 id="workflow-title">Vòng lặp học tập<br /><span style={{ color: "var(--primary-600)" }}>hiệu quả tối đa.</span></h2>
              <p className="muted" style={{ fontSize: "15px", lineHeight: "1.6" }}>
                Học một từ mới không chỉ dừng lại ở việc tra cứu. VocabLens tạo ra một quy trình khoa học khép kín từ lúc phát hiện từ mới đến khi ghi nhớ sâu vào trí nhớ dài hạn.
              </p>
              <div style={{ marginTop: "24px" }}>
                <Link href="/login" className="button button-primary">
                  Trải nghiệm vòng lặp <ChevronRight size={16} />
                </Link>
              </div>
            </div>
            <div className="loop-steps">
              <div className="loop-step-card">
                <span className="loop-step-num">1</span>
                <div className="loop-step-info">
                  <strong>Tra & Lưu ngữ cảnh</strong>
                  <p>Khi đọc tài liệu thấy từ mới, bôi đen để tra và bấm lưu. Câu chứa từ được ghi lại để học theo văn cảnh.</p>
                </div>
              </div>
              
              <div className="loop-step-card">
                <span className="loop-step-num">2</span>
                <div className="loop-step-info">
                  <strong>Xem lại Dashboard & Phân tích</strong>
                  <p>Mở ứng dụng Web, hệ thống phân loại từ mới theo các cấp độ (Mới học, Tiến bộ, Quen thuộc, Thành thạo).</p>
                </div>
              </div>

              <div className="loop-step-card">
                <span className="loop-step-num">3</span>
                <div className="loop-step-info">
                  <strong>Học ôn tập chủ động</strong>
                  <p>Lật Flashcard để gợi nhớ hoặc làm Quiz trắc nghiệm. Thuật toán tự động cập nhật độ thuộc từ của bạn.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="pricing-section" aria-labelledby="pricing-title">
          <div className="section-title-wrap">
            <h2 id="pricing-title" className="section-title">Chọn gói học tập phù hợp</h2>
            <p className="section-subtitle">Mọi tính năng cốt lõi luôn miễn phí. Nâng cấp để học không giới hạn với sức mạnh của AI.</p>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Bản Trải Nghiệm</h3>
              <p className="muted" style={{ fontSize: "13px" }}>Phù hợp cho việc làm quen ứng dụng</p>
              <div className="price-value">0đ <span>/ vĩnh viễn</span></div>
              <hr style={{ border: 0, borderTop: "1px solid var(--border)", margin: "0 0 16px" }} />
              <ul className="pricing-features">
                <li><CheckCircle size={15} /> Lưu tối đa 20 từ vựng</li>
                <li><CheckCircle size={15} /> Tra từ bằng Extension</li>
                <li><CheckCircle size={15} /> Flashcard cơ bản</li>
                <li><CheckCircle size={15} /> Xem danh sách từ</li>
              </ul>
              <Link href="/dashboard" className="button button-secondary" style={{ marginTop: "auto", width: "100%" }}>
                Dùng thử bản Demo
              </Link>
            </div>

            <div className="pricing-card premium">
              <h3>Thành Viên Pro</h3>
              <p className="muted" style={{ fontSize: "13px" }}>Dành cho người học tiếng Anh chuyên sâu</p>
              <div className="price-value">99.000đ <span>/ tháng</span></div>
              <hr style={{ border: 0, borderTop: "1px solid var(--border)", margin: "0 0 16px" }} />
              <ul className="pricing-features">
                <li><CheckCircle size={15} /> Lưu từ vựng không giới hạn</li>
                <li><CheckCircle size={15} /> Giải nghĩa AI & Dịch ngữ cảnh nâng cao</li>
                <li><CheckCircle size={15} /> Trọn bộ ôn tập Flashcard & Quiz</li>
                <li><CheckCircle size={15} /> Biểu đồ tiến độ chi tiết, streak học</li>
                <li><CheckCircle size={15} /> Đồng bộ đa thiết bị tức thì</li>
              </ul>
              <Link href="/login" className="button button-primary" style={{ marginTop: "auto", width: "100%" }}>
                Nâng cấp Premium
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-content">
          <div>
            <div className="landing-brand" style={{ marginBottom: "10px" }}>
              <span className="brand-mark">
                <BookOpen size={16} />
              </span>
              <strong>VocabLens</strong>
            </div>
            <p className="muted small" style={{ margin: 0 }}>Học từ vựng trong ngữ cảnh. Đọc trôi chảy, nhớ bền lâu.</p>
          </div>
          <div style={{ display: "flex", gap: "24px" }} className="muted small">
            <span>© 2026 VocabLens. Bảo lưu mọi quyền.</span>
            <a href="#" className="landing-nav-link">Điều khoản</a>
            <a href="#" className="landing-nav-link">Bảo mật</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
