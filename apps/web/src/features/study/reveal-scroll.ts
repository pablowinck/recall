interface RevealedAnswerView {
  answerTop: number;
  viewportHeight: number;
  scrollY: number;
}

/**
 * Where to scroll so a revealed answer is readable, or null when enough of it already shows.
 * Example: revealScrollTop({ answerTop: 900, viewportHeight: 664, scrollY: 0 }).
 */
export function revealScrollTop({
  answerTop,
  viewportHeight,
  scrollY,
}: RevealedAnswerView): number | null {
  // Below two thirds of the screen the answer starts under the rating bar, where revealing looks like nothing happened.
  if (answerTop <= viewportHeight * 0.66) return null;
  // Leave the tail of the question in view, so the answer is read against what was asked.
  return Math.max(0, Math.round(scrollY + answerTop - viewportHeight * 0.25));
}
