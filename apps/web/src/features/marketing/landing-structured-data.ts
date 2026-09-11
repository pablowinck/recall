import { SITE_URL } from '@/lib/site';
import { questionsNode } from './landing-questions';

// One graph with stable @ids tells search engines and agents this is the open-source Recall, not another app of the name.
const NODES: Record<string, unknown>[] = JSON.parse(
  `[
  {
    "@type": "WebSite",
    "@id": "${SITE_URL}/#website",
    "url": "${SITE_URL}/",
    "name": "Recall",
    "alternateName": "Recall flashcards",
    "inLanguage": "en",
    "publisher": {
      "@id": "${SITE_URL}/#publisher"
    }
  },
  {
    "@type": "WebApplication",
    "@id": "${SITE_URL}/#app",
    "name": "Recall",
    "url": "${SITE_URL}/",
    "description": "Recall is a free, open-source flashcard web app for people who study for hours. It schedules reviews with the FSRS spaced repetition algorithm, and AI assistants such as Claude Code, Codex and Cursor create and organize the cards through MCP.",
    "disambiguatingDescription": "The open-source FSRS flashcard web app at recall-web-gilt.vercel.app, with source code at github.com/pablowinck/recall.",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "browserRequirements": "A current web browser on a phone, tablet or desktop.",
    "isAccessibleForFree": true,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "FSRS spaced repetition with a 90% target retention",
      "Again, Hard, Good and Easy ratings that preview the next interval",
      "MCP server over Streamable HTTP with personal bearer tokens",
      "Setup for Claude Code, Codex, Cursor, VS Code, Claude Desktop and Gemini CLI",
      "Decks, tags, search and keyboard study controls",
      "A private tenant per account, enforced by PostgreSQL row-level security"
    ],
    "image": "${SITE_URL}/opengraph-image",
    "license": "https://opensource.org/licenses/MIT",
    "softwareHelp": {
      "@type": "CreativeWork",
      "url": "https://github.com/pablowinck/recall/blob/main/docs/mcp.md"
    },
    "sameAs": [
      "https://github.com/pablowinck/recall"
    ],
    "publisher": {
      "@id": "${SITE_URL}/#publisher"
    }
  },
  {
    "@type": "Organization",
    "@id": "${SITE_URL}/#publisher",
    "name": "Recall contributors",
    "url": "https://github.com/pablowinck/recall",
    "logo": "${SITE_URL}/apple-icon",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "url": "https://wa.me/5551992116696",
      "availableLanguage": "English"
    }
  }
]`,
);

/** The landing page's schema.org graph: site, application, publisher and questions. Example: landingStructuredData(). */
export function landingStructuredData(): Record<string, unknown> {
  return { '@context': 'https://schema.org', '@graph': [...NODES, questionsNode(SITE_URL)] };
}
