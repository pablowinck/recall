import { Layers2 } from 'lucide-react';

/** Marca compacta que não compete com o estudo. Exemplo: <RecallBrand />. */
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
