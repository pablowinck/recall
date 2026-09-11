import type { ReactNode } from 'react';
import { Check, Flame, Layers2 } from 'lucide-react';
import type { WorkspaceStats } from '@recall/contracts';
import { isFirstRun } from './session-summary';

/** Show only statistics returned by the authenticated API, once there is something to count. Example: <StudyStats stats={stats} />. */
export function StudyStats({ stats }: { stats: WorkspaceStats }): React.JSX.Element | null {
  // Three zeros on a first visit say nothing next to the invitation to write a first card.
  if (isFirstRun(stats)) return null;
  return (
    <div className="stats-grid">
      <StatCard icon={<Check size={17} />} value={stats.reviewed_today} label="reviews today" />
      <StatCard icon={<Layers2 size={17} />} value={stats.total} label="cards in your library" />
      <StatCard icon={<Flame size={17} />} value={stats.streak} label="day streak" kind="streak" />
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  kind,
}: {
  icon: ReactNode;
  value: number;
  label: string;
  kind?: string;
}): React.JSX.Element {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className={`stat-icon ${kind ?? ''}`}>{icon}</span>
      </div>
      <strong>{value}</strong>
      <p>{label}</p>
    </div>
  );
}
