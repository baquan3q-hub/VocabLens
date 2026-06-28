import type { Metadata } from "next";
import { FlashcardClient } from "@/components/flashcard-client";
export const metadata: Metadata = { title: "Flashcards" };
export default function FlashcardPage() { return <FlashcardClient />; }
