// Flat fills instead of an SVG gradient: gradient defs inside a display:none copy (the hidden
// mobile or desktop brand) stop rendering for every other copy that references the same id.
const MARK_BODY = 'M9 3H19L29 13V23A6 6 0 0 1 23 29H9A6 6 0 0 1 3 23V9A6 6 0 0 1 9 3Z';
const MARK_FOLD = 'M19 3V10A3 3 0 0 0 22 13H29Z';

/** Keep product identity compact and secondary to studying. Example: <RecallBrand />. */
export function RecallBrand(): React.JSX.Element {
  return (
    <div className="brand">
      <RecallMark />
      <span className="brand-name">Recall</span>
    </div>
  );
}

/** Draw the folded-card mark: a card turning to reveal its answer. Example: <RecallMark />. */
export function RecallMark(): React.JSX.Element {
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d={MARK_BODY} fill="#3e63dd" />
      <path d={MARK_FOLD} fill="#c9d5ff" />
    </svg>
  );
}

export const recallMarkPaths = { body: MARK_BODY, fold: MARK_FOLD };
