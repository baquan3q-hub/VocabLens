"use client";

import { useEffect, useMemo, useState } from "react";
import type { VocabularyItem } from "@vocablens/shared";
import { BookMarked, CalendarClock, Flame, Lightbulb, Play, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { demoWords, reviewTrend } from "@/lib/demo-data";
import { WordTable } from "./word-table";

const pieColors = ["#22c55e", "#3b82f6", "#f59e0b", "#818cf8"];

export function DashboardClient() {
  const [words, setWords] = useState<VocabularyItem[]>(demoWords);
  useEffect(() => {
    fetch("/api/words?limit=20").then(response => response.json()).then(body => body.data && setWords(body.data)).catch(() => undefined);
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

  return <div className="page">
    <header className="page-header"><div><p className="eyebrow">Daily learning path</p><h1>Chào Anh Quân!</h1><p className="muted">Hôm nay là một ngày tốt để biến từ mới thành vốn từ của bạn.</p></div>
      <Link href="/review/flashcard" className="button button-primary"><Play size={17} fill="currentColor" /> Ôn tập ngay</Link>
    </header>

    <section className="hero-review" aria-labelledby="due-heading">
      <div><h2 id="due-heading">Đến lượt ôn tập hôm nay</h2><div className="due-number">{due || 4}</div><p className="muted">từ vựng cần được nhắc lại để ghi nhớ lâu hơn.</p>
        <div className="hero-actions"><Link href="/review/flashcard" className="button button-primary button-lg"><Play size={17} fill="currentColor" /> Bắt đầu ôn tập</Link><Link href="/words" className="button button-secondary"><CalendarClock size={17} /> Xem danh sách</Link></div>
      </div>
      <div className="progress-wrap"><div className="progress-head"><span>Tiến độ hôm nay</span><span style={{ color: "var(--primary-700)" }}>{progress}%</span></div>
        <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><div className="progress-bar" style={{ width: `${progress}%` }} /></div>
        <div className="progress-meta"><span>{mastered} từ đã thành thạo</span><span>Còn {due || 4} từ</span></div>
        <div className="review-tip"><Lightbulb size={17} /> Ôn đều đặn mỗi ngày hiệu quả hơn một phiên học thật dài.</div>
      </div>
    </section>

    <section className="stat-grid" aria-label="Tổng quan học tập">
      <div className="stat-card"><span className="stat-icon"><BookMarked size={20} /></span><div><span className="stat-label">Tổng từ vựng</span><div className="stat-value">{words.length}</div></div></div>
      <div className="stat-card"><span className="stat-icon green"><Target size={20} /></span><div><span className="stat-label">Đã thành thạo</span><div className="stat-value">{mastered}</div></div></div>
      <div className="stat-card"><span className="stat-icon amber"><TrendingUp size={20} /></span><div><span className="stat-label">Tỷ lệ ghi nhớ</span><div className="stat-value">{retention}%</div></div></div>
      <div className="stat-card"><span className="stat-icon"><Flame size={20} /></span><div><span className="stat-label">Chuỗi ngày học</span><div className="stat-value">7 ngày</div></div></div>
    </section>

    <section className="chart-grid">
      <div className="panel panel-pad"><div className="panel-header"><h2>Xu hướng học tập</h2><span className="badge badge-learning">7 ngày qua</span></div>
        <div style={{ width: "100%", height: 220 }} aria-label="Biểu đồ số từ đã ôn trong 7 ngày">
          <ResponsiveContainer><AreaChart data={reviewTrend} margin={{ top: 10, right: 6, left: -24, bottom: 0 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", boxShadow: "0 4px 16px rgba(0,0,0,.08)" }} />
            <Area type="monotone" dataKey="reviewed" name="Đã ôn" stroke="#7c3aed" fill="#ede9fe" strokeWidth={2} />
          </AreaChart></ResponsiveContainer>
        </div>
      </div>
      <div className="panel panel-pad"><div className="panel-header"><h2>Phân bố trình độ</h2></div><div className="proficiency-layout">
        <div style={{ width: 180, height: 180 }}><ResponsiveContainer><PieChart><Pie data={pie} dataKey="value" innerRadius={48} outerRadius={72} paddingAngle={2}>{pie.map((_, index) => <Cell key={index} fill={pieColors[index]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        <div className="proficiency-list">{pie.map((item, index) => <div className="proficiency-row" key={item.name}><span className="legend-item"><span className="legend-dot" style={{ background: pieColors[index] }} />{item.name}</span><strong>{item.value}</strong></div>)}</div>
      </div></div>
    </section>

    <section className="panel table-panel"><div className="table-header"><h2>Từ vựng đã thu thập gần đây</h2><Link href="/words" className="button button-ghost">Xem tất cả</Link></div><WordTable words={words.slice(0, 5)} compact /></section>
  </div>;
}
