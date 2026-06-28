import { describe, expect, it } from "vitest";
import { isLookupTerm, normalizeTerm, proficiencyFromScore, scheduleReview } from "./learning.js";

describe("normalizeTerm", () => {
  it("normalizes case and punctuation", () => {
    expect(normalizeTerm("  Paradigm. ")).toBe("paradigm");
  });

  it("accepts a single hyphenated English word", () => {
    expect(isLookupTerm("well-being")).toBe(true);
    expect(isLookupTerm("two words")).toBe(false);
  });
});

describe("review scheduling", () => {
  it("increments remembered words and schedules the matching interval", () => {
    const now = new Date("2026-06-28T00:00:00.000Z");
    const result = scheduleReview(2, "remembered", now);
    expect(result.score).toBe(3);
    expect(result.intervalDays).toBe(7);
    expect(result.nextReviewAt).toBe("2026-07-05T00:00:00.000Z");
  });

  it("brings forgotten words back within the day", () => {
    const result = scheduleReview(3, "forgotten", new Date("2026-06-28T00:00:00.000Z"));
    expect(result.score).toBe(2);
    expect(result.nextReviewAt).toBe("2026-06-28T08:00:00.000Z");
  });

  it("maps score to a stable proficiency label", () => {
    expect(proficiencyFromScore(0)).toBe("new");
    expect(proficiencyFromScore(4)).toBe("familiar");
    expect(proficiencyFromScore(5)).toBe("mastered");
  });
});
