import type { Metadata } from "next";
import { WordsClient } from "@/components/words-client";
export const metadata: Metadata = { title: "My Words" };
export default function WordsPage() { return <WordsClient />; }
