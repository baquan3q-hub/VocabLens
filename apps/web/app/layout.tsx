import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "VocabLens", template: "%s · VocabLens" },
  description: "Tra từ trong ngữ cảnh và ôn tập thông minh."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <a className="skip-link" href="#main-content">Bỏ qua điều hướng</a>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
