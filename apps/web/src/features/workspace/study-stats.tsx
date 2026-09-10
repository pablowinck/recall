import type { ReactNode } from 'react';
import { Check, Flame, Layers2 } from 'lucide-react';
import type { WorkspaceStats } from '@recall/contracts';

/** Show only statistics returned by the authenticated API. Example: <StudyStats stats={stats} />. */
export function StudyStats({ stats }: { stats: WorkspaceStats }): React.JSX.Element {
  return (
    <div className="stats-grid">
      <StatCard icon={<Check size={19} />} value={stats.reviewed_today} label="reviews today" />
      <StatCard icon={<Layers2 size={19} />} value={stats.total} label="cards in your library" />
      <StatCard icon={<Flame size={19} />} value={stats.streak} label="day streak" />
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: number;
  label: string;
}): React.JSX.Element {
  return (
    <div className="stat-card">
      <span>{icon}</span>
      <strong>{value}</strong>
      <p>{label}</p>
    </div>
  );
}
