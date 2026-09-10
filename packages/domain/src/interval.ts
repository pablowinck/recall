const MINUTE = 60_000;
const DAYS_PER_MONTH = 30.44;

/** Format a review interval with short, readable units. Example: formatInterval(8 * 86_400_000) === '8 days'. */
export function formatInterval(milliseconds: number): string {
  const minutes = Math.max(1, Math.round(milliseconds / MINUTE));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr`;
  const days = Math.round(hours / 24);
  if (days < 30) return days === 1 ? '1 day' : `${days} days`;
  const months = days / DAYS_PER_MONTH;
  // Rounding at 11.5 avoids a "12 mo" label for intervals that read better as "1 yr".
  if (months < 11.5) return `${months < 3 ? roundToTenth(months) : Math.round(months)} mo`;
  return `${roundToTenth(days / 365)} yr`;
}

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}
