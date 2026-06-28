import { describe, expect, it } from "vitest";
import { computePopupPosition, extractSentenceFromText } from "./selection";

describe("selection context", () => {
  it("extracts the sentence containing the selected word", () => {
    expect(extractSentenceFromText("First sentence. A paradigm shift changes everything! Last sentence.", "paradigm"))
      .toBe("A paradigm shift changes everything!");
  });

  it("normalizes whitespace and limits context", () => {
    expect(extractSentenceFromText("A   resilient\nteam succeeds.", "resilient")).toBe("A resilient team succeeds.");
  });
});

describe("popup placement", () => {
  it("keeps the popup inside the horizontal viewport", () => {
    expect(computePopupPosition({ left: 2, top: 100, bottom: 120, width: 20 }, { width: 1200, height: 900 }).left).toBe(12);
  });

  it("places the popup above a selection near the bottom", () => {
    expect(computePopupPosition({ left: 400, top: 800, bottom: 820, width: 60 }, { width: 1200, height: 900 }).top).toBe(370);
  });
});
