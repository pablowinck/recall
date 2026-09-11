export const REPOSITORY_URL = 'https://github.com/pablowinck/recall';
export const CONTRIBUTING_URL = `${REPOSITORY_URL}/blob/main/CONTRIBUTING.md`;
const REPOSITORY_API = 'https://api.github.com/repos/pablowinck/recall';

interface GitHubRequest {
  headers: Record<string, string>;
  next: { revalidate: number };
}
type GitHubReply = Pick<Response, 'ok' | 'json'>;
export type GitHubFetcher = (url: string, init: GitHubRequest) => Promise<GitHubReply>;

/**
 * Read the repository's star count, or null when GitHub cannot answer, so the page still renders.
 * Example: await readStarCount(fetch).
 */
export async function readStarCount(fetcher: GitHubFetcher): Promise<number | null> {
  try {
    const reply = await fetcher(REPOSITORY_API, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'recall-landing-page' },
      // An hourly refresh stays far inside GitHub's unauthenticated rate limit.
      next: { revalidate: 3600 },
    });
    return reply.ok ? readStargazers(await reply.json()) : null;
  } catch {
    return null;
  }
}

function readStargazers(repository: unknown): number | null {
  if (typeof repository !== 'object' || repository === null) return null;
  const count = (repository as { stargazers_count?: unknown }).stargazers_count;
  return typeof count === 'number' ? count : null;
}

/** Shorten large counts the way GitHub does. Example: formatStars(1234) === '1.2K'. */
export function formatStars(stars: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(
    stars,
  );
}
