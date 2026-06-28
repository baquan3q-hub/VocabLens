import type { VocabularyItem } from "@vocablens/shared";

const now = new Date();
const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();
const daysAhead = (days: number) => new Date(now.getTime() + days * 86_400_000).toISOString();

export const demoWords: VocabularyItem[] = [
  {
    id: "11111111-1111-4111-8111-111111111111", userId: "demo-user", term: "resilient", normalizedTerm: "resilient",
    phonetic: "/rɪˈzɪliənt/", audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/resilient-us.mp3",
    definitions: [{ partOfSpeech: "adjective", text: "Able to recover quickly from difficult conditions.", example: "The community showed resilient spirit after the storm." }],
    translationVi: "kiên cường, có khả năng phục hồi", synonyms: ["strong", "adaptable"], antonyms: ["fragile"],
    examples: ["The community showed resilient spirit after the storm."], source: "dictionaryapi", reviewScore: 4,
    lastReviewedAt: daysAgo(1), nextReviewAt: daysAhead(1), createdAt: daysAgo(1), updatedAt: daysAgo(1),
    occurrences: [{ id: "a1111111-1111-4111-8111-111111111111", contextSentence: "The community showed resilient spirit after the storm.", sourceUrl: "https://www.bbc.com/news", sourceTitle: "BBC News", createdAt: daysAgo(1) }]
  },
  {
    id: "22222222-2222-4222-8222-222222222222", userId: "demo-user", term: "subtle", normalizedTerm: "subtle",
    phonetic: "/ˈsʌtəl/", definitions: [{ partOfSpeech: "adjective", text: "Not immediately obvious or noticeable.", example: "She gave me a subtle hint about her decision." }],
    translationVi: "tinh tế, khó nhận thấy", synonyms: ["delicate", "nuanced"], antonyms: ["obvious"], examples: ["She gave me a subtle hint about her decision."],
    source: "dictionaryapi", reviewScore: 3, lastReviewedAt: daysAgo(2), nextReviewAt: daysAgo(1), createdAt: daysAgo(2), updatedAt: daysAgo(2),
    occurrences: [{ id: "a2222222-2222-4222-8222-222222222222", contextSentence: "She gave me a subtle hint about her decision.", sourceUrl: "https://www.theguardian.com", sourceTitle: "The Guardian", createdAt: daysAgo(2) }]
  },
  {
    id: "33333333-3333-4333-8333-333333333333", userId: "demo-user", term: "negotiate", normalizedTerm: "negotiate",
    phonetic: "/nɪˈɡəʊʃieɪt/", definitions: [{ partOfSpeech: "verb", text: "Try to reach an agreement by discussion.", example: "We need to negotiate a better deal." }],
    translationVi: "đàm phán, thương lượng", synonyms: ["bargain", "discuss"], antonyms: [], examples: ["We need to negotiate a better deal."],
    source: "dictionaryapi", reviewScore: 2, lastReviewedAt: daysAgo(3), nextReviewAt: daysAgo(1), createdAt: daysAgo(3), updatedAt: daysAgo(3),
    occurrences: [{ id: "a3333333-3333-4333-8333-333333333333", contextSentence: "We need to negotiate a better deal for both parties.", sourceUrl: "https://hbr.org", sourceTitle: "Harvard Business Review", createdAt: daysAgo(3) }]
  },
  {
    id: "44444444-4444-4444-8444-444444444444", userId: "demo-user", term: "comprehensive", normalizedTerm: "comprehensive",
    phonetic: "/ˌkɒmprɪˈhensɪv/", definitions: [{ partOfSpeech: "adjective", text: "Including all or nearly all elements of something.", example: "The report provides a comprehensive analysis." }],
    translationVi: "toàn diện, bao quát", synonyms: ["complete", "thorough"], antonyms: ["partial"], examples: ["The report provides a comprehensive analysis of the market."],
    source: "dictionaryapi", reviewScore: 5, lastReviewedAt: daysAgo(4), nextReviewAt: daysAhead(14), createdAt: daysAgo(4), updatedAt: daysAgo(4),
    occurrences: [{ id: "a4444444-4444-4444-8444-444444444444", contextSentence: "The report provides a comprehensive analysis of the market.", sourceUrl: "https://vnexpress.net", sourceTitle: "VnExpress International", createdAt: daysAgo(4) }]
  },
  {
    id: "55555555-5555-4555-8555-555555555555", userId: "demo-user", term: "paradigm", normalizedTerm: "paradigm",
    phonetic: "/ˈpærədaɪm/", definitions: [{ partOfSpeech: "noun", text: "A typical example or pattern of something.", example: "It requires a paradigm shift in how we think." }],
    translationVi: "mô hình, khuôn mẫu tư duy", synonyms: ["model", "pattern"], antonyms: [], examples: ["It requires a paradigm shift in how we think."],
    source: "dictionaryapi", reviewScore: 1, lastReviewedAt: null, nextReviewAt: daysAgo(1), createdAt: daysAgo(5), updatedAt: daysAgo(5),
    occurrences: [{ id: "a5555555-5555-4555-8555-555555555555", contextSentence: "Quantum computing requires a paradigm shift in how we think about security.", sourceUrl: "https://www.economist.com", sourceTitle: "The Economist", createdAt: daysAgo(5) }]
  },
  {
    id: "66666666-6666-4666-8666-666666666666", userId: "demo-user", term: "ubiquitous", normalizedTerm: "ubiquitous",
    phonetic: "/juːˈbɪkwɪtəs/", definitions: [{ partOfSpeech: "adjective", text: "Present, appearing, or found everywhere.", example: "Smartphones have become ubiquitous." }],
    translationVi: "có mặt ở khắp mọi nơi", synonyms: ["omnipresent", "pervasive"], antonyms: ["rare"], examples: ["Smartphones have become ubiquitous in modern life."],
    source: "dictionaryapi", reviewScore: 1, lastReviewedAt: null, nextReviewAt: daysAgo(2), createdAt: daysAgo(6), updatedAt: daysAgo(6),
    occurrences: [{ id: "a6666666-6666-4666-8666-666666666666", contextSentence: "Smartphones have become ubiquitous in modern life.", sourceUrl: "https://www.wired.com", sourceTitle: "Wired", createdAt: daysAgo(6) }]
  }
];

export const reviewTrend = [
  { day: "T2", reviewed: 18, newWords: 7 }, { day: "T3", reviewed: 24, newWords: 9 },
  { day: "T4", reviewed: 31, newWords: 6 }, { day: "T5", reviewed: 27, newWords: 8 },
  { day: "T6", reviewed: 35, newWords: 12 }, { day: "T7", reviewed: 41, newWords: 10 },
  { day: "CN", reviewed: 44, newWords: 8 }
];
