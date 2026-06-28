export function extractSentenceFromText(textValue: string, selectedValue: string): string {
  const text = textValue.replace(/\s+/g, " ").trim();
  const selected = selectedValue.trim();
  if (!text || !selected) return "";
  const position = text.toLowerCase().indexOf(selected.toLowerCase());
  if (position < 0) return text.slice(0, 500);
  const punctuationBefore = Math.max(text.lastIndexOf(".", position - 1), text.lastIndexOf("?", position - 1), text.lastIndexOf("!", position - 1));
  const before = punctuationBefore + 1;
  const endings = [text.indexOf(".", position + selected.length), text.indexOf("?", position + selected.length), text.indexOf("!", position + selected.length)].filter(value => value >= 0);
  const after = endings.length ? Math.min(...endings) + 1 : Math.min(text.length, position + selected.length + 250);
  return text.slice(before, after).trim().slice(0, 1000);
}

export function computePopupPosition(
  rect: Pick<DOMRect, "left" | "top" | "bottom" | "width">,
  viewport: { width: number; height: number },
  popup = { width: 360, estimatedHeight: 420, gap: 10, margin: 12 }
) {
  const left = Math.max(popup.margin, Math.min(viewport.width - popup.width - popup.margin, rect.left + rect.width / 2 - popup.width / 2));
  const top = rect.bottom + popup.gap + popup.estimatedHeight < viewport.height
    ? rect.bottom + popup.gap
    : Math.max(popup.margin, rect.top - popup.estimatedHeight - popup.gap);
  return { left, top };
}
