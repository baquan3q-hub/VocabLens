import { Sidebar } from "@/components/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="app-shell"><Sidebar /><main className="main" id="main-content">{children}</main></div>;
}
