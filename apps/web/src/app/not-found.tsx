import Link from 'next/link';

/** Help a lost visitor or agent find their way, with a real 404 status. Example: GET /nowhere. */
export default function NotFound(): React.JSX.Element {
  return (
    <main className="landing landing-not-found">
      <h1>This page doesn’t exist</h1>
      <p>Recall is a free, open-source flashcard app. These pages do:</p>
      <ul>
        <li>
          <Link href="/">What Recall is</Link>
        </li>
        <li>
          <Link href="/app">Sign in to your cards</Link>
        </li>
        <li>
          <a href="/llms.txt">Recall for AI assistants</a>
        </li>
        <li>
          <a href="/sitemap.xml">Sitemap</a>
        </li>
      </ul>
    </main>
  );
}
