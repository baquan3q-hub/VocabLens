import { WordDetailClient } from "@/components/word-detail-client";
export default async function WordDetailPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <WordDetailClient id={id} />; }
