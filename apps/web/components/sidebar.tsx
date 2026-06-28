"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BookOpen, 
  Home, 
  Library, 
  Layers3, 
  CircleHelp, 
  Puzzle, 
  Languages,
  LogOut,
  LogIn
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/translate", label: "Dịch đoạn văn", icon: Languages },
  { href: "/words", label: "My Words", icon: Library },
  { href: "/review/flashcard", label: "Flashcards", icon: Layers3 },
  { href: "/review/quiz", label: "Quiz", icon: CircleHelp },
  { href: "/extension", label: "Extension", icon: Puzzle }
];

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!supabase) return;

    // Get initial user session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      window.location.href = "/login";
    }
  };

  // Compute initials and display name
  const initials = user 
    ? (user.user_metadata?.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase() || "US")
    : "AQ";

  const displayName = user
    ? (user.user_metadata?.full_name || user.email?.split("@")[0] || "Người dùng")
    : "Anh Quân";

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

      <div className="sidebar-extension-card">
        <strong className="ext-card-title">Cài đặt Extension</strong>
        <p className="ext-card-desc">Tra từ ngay trên website khi đang đọc tài liệu.</p>
        <Link href="/extension" className="button button-secondary ext-card-btn">
          <Puzzle size={14} aria-hidden="true" /> Cài đặt ngay
        </Link>
      </div>

      <div className="sidebar-user" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <span className="avatar" aria-hidden="true">{initials}</span>
          <div style={{ minWidth: 0 }}>
            <strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "13px" }} title={displayName}>
              {displayName}
            </strong>
            <small style={{ color: user ? "var(--success-dark)" : "var(--text-2)", display: "block", fontSize: "11px", fontWeight: user ? 600 : 400 }}>
              {user ? "Supabase Active ☁️" : "Chế độ trải nghiệm"}
            </small>
          </div>
        </div>

        {user ? (
          <button 
            onClick={handleLogout} 
            className="button button-ghost" 
            title="Đăng xuất"
            style={{ minHeight: "32px", width: "32px", padding: 0, borderRadius: "8px", flexShrink: 0, color: "var(--error)" }}
          >
            <LogOut size={16} />
          </button>
        ) : (
          <Link 
            href="/login" 
            className="button button-ghost" 
            title="Đăng nhập để lưu vào Supabase"
            style={{ minHeight: "32px", width: "32px", padding: 0, borderRadius: "8px", flexShrink: 0, color: "var(--primary-600)" }}
          >
            <LogIn size={16} />
          </Link>
        )}
      </div>
    </aside>
  );
}
