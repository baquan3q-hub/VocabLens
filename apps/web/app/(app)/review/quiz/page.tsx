import type { Metadata } from "next";
import { QuizClient } from "@/components/quiz-client";
export const metadata: Metadata = { title: "Quiz" };
export default function QuizPage() { return <QuizClient />; }
