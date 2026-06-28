"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Library, Layers3, CircleHelp } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/words", label: "My Words", icon: Library },
  { href: "/review/flashcard", label: "Flashcards", icon: Layers3 },
  { href: "/review/quiz", label: "Quiz", icon: CircleHelp }
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar" aria-label="Điều hướng chính">
      <Link href="/dashboard" className="brand" aria-label="VocabLens dashboard">
        <span className="brand-mark"><BookOpen size={21} aria-hidden="true" /></span>
        <div><strong>VocabLens</strong><small>Học từ trong ngữ cảnh</small></div>
      </Link>
      <nav className="nav">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href === "/words" && pathname.startsWith("/words/"));
          return <Link key={href} href={href} className={`nav-link ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}>
            <Icon aria-hidden="true" /><span>{label}</span>
          </Link>;
        })}
      </nav>
      <div className="sidebar-user">
        <span className="avatar" aria-hidden="true">AQ</span>
        <div><strong>Anh Quân</strong><small>Chế độ trải nghiệm</small></div>
      </div>
    </aside>
  );
}
