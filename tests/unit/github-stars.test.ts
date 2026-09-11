import { describe, expect, it } from 'vitest';
import {
  formatStars,
  readStarCount,
  type GitHubFetcher,
} from '../../apps/web/src/features/marketing/github-repo';

/** Answers like the GitHub repository endpoint, or fails the way the network does. */
class FakeGitHub {
  readonly requests: string[] = [];
  constructor(
    private readonly answer: () => Promise<{ ok: boolean; json: () => Promise<unknown> }>,
  ) {}
  readonly fetch: GitHubFetcher = async (url) => {
    this.requests.push(url);
    return this.answer() as ReturnType<GitHubFetcher>;
  };
}

describe('the star count on the landing page', () => {
  it('reads the stargazer count from the repository', async () => {
    const github = new FakeGitHub(async () => ({
      ok: true,
      json: async () => ({ stargazers_count: 42 }),
    }));
    await expect(readStarCount(github.fetch)).resolves.toBe(42);
    expect(github.requests).toEqual(['https://api.github.com/repos/pablowinck/recall']);
  });

  it('shows no number when GitHub refuses or is unreachable', async () => {
    const limited = new FakeGitHub(async () => ({ ok: false, json: async () => ({}) }));
    const offline = new FakeGitHub(() => Promise.reject(new TypeError('fetch failed')));
    await expect(readStarCount(limited.fetch)).resolves.toBeNull();
    await expect(readStarCount(offline.fetch)).resolves.toBeNull();
  });

  it('ignores an answer without a count', async () => {
    const odd = new FakeGitHub(async () => ({
      ok: true,
      json: async () => ({ message: 'Moved' }),
    }));
    await expect(readStarCount(odd.fetch)).resolves.toBeNull();
  });

  it('shortens large counts the way GitHub does', () => {
    expect(formatStars(7)).toBe('7');
    expect(formatStars(1234)).toBe('1.2K');
  });
});
