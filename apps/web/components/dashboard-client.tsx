"use client";

import { useEffect, useMemo, useState } from "react";
import type { VocabularyItem } from "@vocablens/shared";
import { 
  BookMarked, 
  CalendarClock, 
  Flame, 
  Lightbulb, 
  Play, 
  Target, 
  TrendingUp, 
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  Cell, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { reviewTrend } from "@/lib/demo-data";
import { WordTable } from "./word-table";

const pieColors = ["#22c55e", "#3b82f6", "#f59e0b", "#818cf8"];

export function DashboardClient() {
  const [words, setWords] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/words?limit=20")
      .then(response => response.json())
      .then(body => {
        if (body.data) setWords(body.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

  }, []);

  const due = words.filter(word => new Date(word.nextReviewAt) <= new Date()).length;
  const mastered = words.filter(word => word.reviewScore === 5).length;
  const retention = words.length ? Math.round(words.reduce((sum, word) => sum + word.reviewScore, 0) / (words.length * 5) * 100) : 0;
  
  const pie = useMemo(() => [
    { name: "Thành thạo", value: words.filter(word => word.reviewScore === 5).length },
    { name: "Quen thuộc", value: words.filter(word => word.reviewScore === 4).length },
    { name: "Đang tiến bộ", value: words.filter(word => word.reviewScore >= 2 && word.reviewScore <= 3).length },
    { name: "Mới học", value: words.filter(word => word.reviewScore <= 1).length }
  ], [words]);

  const target = Math.max(10, due + mastered);
  const progress = target ? Math.min(100, Math.round(mastered / target * 100)) : 0;

  return (
    <div className="page">
      {/* Dashboard Header */}
      <header className="page-header">
        <div>
          <p className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles size={12} /> Hướng học tập hôm nay
          </p>
          <h1>Chào Anh Quân!</h1>
          <p className="muted">Hôm nay là một ngày tuyệt vời để tiếp thu thêm các từ vựng mới.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/translate" className="button button-secondary">
            Dịch đoạn văn
          </Link>
          <Link href="/review/flashcard" className="button button-primary">
            <Play size={16} fill="currentColor" /> Ôn tập ngay
          </Link>
        </div>
      </header>

      {/* Main Stats Banner */}
      <section className="hero-review" aria-labelledby="due-heading" style={{ position: "relative", overflow: "hidden" }}>
        {/* Subtle background decoration */}
        <div style={{ position: "absolute", top: "-50px", right: "-30px", width: "180px", height: "180px", borderRadius: "999px", background: "var(--primary-50)", opacity: 0.5, zIndex: 0 }}></div>
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 id="due-heading">Cần ôn tập hôm nay</h2>
          <div className="due-number">
            {loading ? (
              <span className="skeleton" style={{ display: "inline-block", width: "60px", height: "48px", verticalAlign: "middle" }} />
            ) : (
              due
            )}
          </div>
          <p className="muted" style={{ maxWidth: "260px" }}>từ vựng cần nhắc lại theo chu kỳ để không trôi vào quên lãng.</p>
          
          <div className="hero-actions">
            <Link href="/review/flashcard" className={`button button-primary button-lg ${(!loading && due === 0) ? "disabled" : ""}`} style={{ pointerEvents: (!loading && due === 0) ? "none" : "auto", opacity: (!loading && due === 0) ? 0.6 : 1 }}>
              <Play size={16} fill="currentColor" /> Bắt đầu ôn tập
            </Link>
            <Link href="/words" className="button button-secondary">
              <CalendarClock size={16} /> Xem lịch trình
            </Link>
          </div>
        </div>
        
        <div className="progress-wrap" style={{ position: "relative", zIndex: 1 }}>
          <div className="progress-head">
            <span>Tiến độ hoàn thành mục tiêu</span>
            <span style={{ color: "var(--primary-700)" }}>{loading ? "..." : `${progress}%`}</span>
          </div>
          <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-bar" style={{ width: `${loading ? 0 : progress}%`, transition: "width 0.8s ease-out" }} />
          </div>
          <div className="progress-meta">
            <span>{loading ? "..." : mastered} từ đã thành thạo</span>
            <span>Còn {loading ? "..." : due} từ cần học</span>
          </div>
          
          <div className="review-tip">
            <Lightbulb size={16} style={{ flexShrink: 0 }} /> 
            <span><strong>Mẹo nhỏ:</strong> Ôn tập lặp lại ngắt quãng giúp tăng gấp 3 lần khả năng ghi nhớ dài hạn.</span>
          </div>
        </div>
      </section>

      {/* Overview Stat Grid */}
      <section className="stat-grid" aria-label="Tổng quan học tập">
        <div className="stat-card">
          <span className="stat-icon">
            <BookMarked size={20} />
          </span>
          <div>
            <span className="stat-label">Tổng từ đã lưu</span>
            <div className="stat-value">
              {loading ? (
                <span className="skeleton" style={{ display: "inline-block", width: "40px", height: "24px", verticalAlign: "middle" }} />
              ) : (
                words.length
              )}
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <span className="stat-icon green">
            <Target size={20} />
          </span>
          <div>
            <span className="stat-label">Từ đã thành thạo</span>
            <div className="stat-value">
              {loading ? (
                <span className="skeleton" style={{ display: "inline-block", width: "40px", height: "24px", verticalAlign: "middle" }} />
              ) : (
                mastered
              )}
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <span className="stat-icon amber">
            <TrendingUp size={20} />
          </span>
          <div>
            <span className="stat-label">Tỉ lệ ghi nhớ</span>
            <div className="stat-value">
              {loading ? (
                <span className="skeleton" style={{ display: "inline-block", width: "40px", height: "24px", verticalAlign: "middle" }} />
              ) : (
                `${retention}%`
              )}
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <span className="stat-icon" style={{ background: "#f5f3ff", color: "var(--primary-600)" }}>
            <Flame size={20} />
          </span>
          <div>
            <span className="stat-label">Streak học tập</span>
            <div className="stat-value" style={{ color: "#d97706" }}>7 ngày 🔥</div>
          </div>
        </div>
      </section>

      {/* Chart Visualizations Grid */}
      <section className="chart-grid">
        {/* Learn Curve Area Chart */}
        <div className="panel panel-pad">
          <div className="panel-header">
            <div>
              <h2 style={{ marginBottom: "2px" }}>Xu hướng học tập</h2>
              <p className="muted small" style={{ margin: 0 }}>Thống kê số lượng từ vựng đã ôn tập</p>
            </div>
            <span className="badge badge-learning" style={{ height: "fit-content" }}>7 ngày qua</span>
          </div>
          
          <div style={{ width: "100%", height: 230 }} aria-label="Biểu đồ số từ đã ôn trong 7 ngày">
            <ResponsiveContainer>
              <AreaChart data={reviewTrend} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-600)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--primary-600)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: "var(--text-2)" }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: "var(--text-2)" }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: 12, 
                    border: "1px solid var(--border)", 
                    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                    fontSize: "12.5px"
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="reviewed" 
                  name="Đã ôn" 
                  stroke="var(--primary-600)" 
                  fill="url(#chartGradient)" 
                  strokeWidth={2.5} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Proficiency Pie Chart */}
        <div className="panel panel-pad">
          <div className="panel-header">
            <div>
              <h2 style={{ marginBottom: "2px" }}>Phân bố trình độ</h2>
              <p className="muted small" style={{ margin: 0 }}>Mức độ thuộc lòng các từ đã lưu</p>
            </div>
          </div>
          
          <div className="proficiency-layout" style={{ minHeight: "230px" }}>
            <div style={{ width: 170, height: 170, margin: "0 auto" }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie 
                    data={pie} 
                    dataKey="value" 
                    innerRadius={50} 
                    outerRadius={70} 
                    paddingAngle={3}
                  >
                    {pie.map((_, index) => (
                      <Cell key={index} fill={pieColors[index]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 10, 
                      border: "1px solid var(--border)",
                      fontSize: "12px" 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="proficiency-list">
              {pie.map((item, index) => (
                <div className="proficiency-row" key={item.name}>
                  <span className="legend-item" style={{ fontSize: "13px" }}>
                    <span className="legend-dot" style={{ background: pieColors[index] }} />
                    {item.name}
                  </span>
                  <strong style={{ fontSize: "13.5px" }}>{item.value} từ</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recently Collected Words Table */}
      <section className="panel table-panel">
        <div className="table-header">
          <div>
            <h2 style={{ marginBottom: "2px" }}>Từ vựng đã thu thập gần đây</h2>
            <p className="muted small" style={{ margin: 0 }}>Được lưu từ các phiên đọc của bạn</p>
          </div>
          <Link href="/words" className="button button-ghost" style={{ gap: "4px" }}>
            Xem tất cả từ điển
          </Link>
        </div>
        <div className="table-scroll">
          {loading ? (
            <div style={{ padding: "24px", display: "grid", gap: "10px" }}>
              <div className="skeleton" style={{ height: "40px", width: "100%" }} />
              <div className="skeleton" style={{ height: "40px", width: "100%" }} />
              <div className="skeleton" style={{ height: "40px", width: "100%" }} />
            </div>
          ) : words.length === 0 ? (
            <div className="empty" style={{ padding: "40px 20px" }}>
              <BookMarked size={32} style={{ color: "var(--primary-400)", marginBottom: "12px" }} />
              <h3>Chưa có từ vựng nào</h3>
              <p className="muted small" style={{ maxWidth: "340px", margin: "0 auto 16px" }}>
                Bôi đen từ tiếng Anh trên trang bất kỳ để lưu qua Chrome Extension hoặc tự nhập văn bản để dịch.
              </p>
              <Link href="/translate" className="button button-primary">
                Dịch đoạn văn ngay
              </Link>
            </div>
          ) : (
            <WordTable words={words.slice(0, 5)} compact />
          )}
        </div>
      </section>
    </div>
  );
}
