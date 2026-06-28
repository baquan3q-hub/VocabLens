import type { Metadata } from "next";
import { LandingClient } from "@/components/landing-client";

export const metadata: Metadata = {
  title: "VocabLens · Học từ vựng trong ngữ cảnh",
  description: "Tra nghĩa từ tiếng Anh trực tiếp trên mọi trang web mà không ngắt mạch đọc. Lưu trữ ngữ cảnh gốc và ôn tập thông minh bằng thuật toán lặp lại ngắt quãng."
};

export default function Home() {
  return <LandingClient />;
}
