import { TranslateClient } from "@/components/translate-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dịch đoạn văn - VocabLens",
  description: "Dịch văn bản dài bằng AI, tự phân tích bối cảnh và trích xuất từ vựng khó để học tập.",
};

export default function TranslatePage() {
  return <TranslateClient />;
}
