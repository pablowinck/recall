/** Exibe um intervalo curto de revisão. Exemplo: formatInterval(60000) === '1 min'. */
export function formatInterval(milliseconds: number): string {
  const minutes = Math.max(1, Math.round(milliseconds / 60000));
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} h`;
  return `${Math.round(minutes / 1440)} d`;
}
