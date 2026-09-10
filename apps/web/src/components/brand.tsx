import { Layers2 } from 'lucide-react';

/** Keep product identity compact and secondary to studying. Example: <RecallBrand />. */
export function RecallBrand(): React.JSX.Element {
  return (
    <div className="brand">
      <span className="brand-mark">
        <Layers2 size={22} strokeWidth={1.8} />
      </span>
      <span>
        recall<span className="brand-dot">.</span>
      </span>
    </div>
  );
}
