// Every answer was checked against the product: FSRS retention, tool names, token hashing and expiry.
// Each question names Recall, because other products share the name and answers get quoted out of context.
const QUESTIONS = [
  {
    question: 'What is Recall?',
    answer:
      'Recall is a free, open-source flashcard web app for people who study for hours. It schedules reviews with the FSRS spaced repetition algorithm, and AI assistants such as Claude Code, Codex and Cursor create and organize the cards through MCP.',
  },
  {
    question: 'What does Recall cost?',
    answer:
      'Nothing. Recall is free to use, and its source code is public on GitHub under the MIT license.',
  },
  {
    question: 'How is Recall different from Anki?',
    answer:
      'Both can schedule reviews with FSRS. In Recall, AI assistants create and organize your cards through MCP, and you study in the browser. Recall doesn’t import Anki decks.',
  },
  {
    question: 'What is MCP, and how does Recall use it?',
    answer:
      'The Model Context Protocol, an open standard that lets AI assistants use tools such as Recall. Your assistant calls Recall to create, organize and find your cards.',
  },
  {
    question: 'Which AI assistants work with Recall?',
    answer:
      'Claude Code, Codex, Cursor, VS Code, Claude Desktop (which needs Node.js) and Gemini CLI, plus other MCP clients that accept a token header. Recall prepares the setup for each of them.',
  },
  {
    question: 'Does Recall work with ChatGPT or claude.ai?',
    answer:
      'Not yet. ChatGPT and claude.ai connect through OAuth sign-in, which Recall doesn’t offer yet. Until then, connect Claude Code, Codex, Cursor or Gemini CLI, or write cards yourself.',
  },
  {
    question: 'How do I connect an assistant to Recall?',
    answer:
      'Open Connections in Recall, pick your assistant and create a personal connection. Recall shows the token only once, with ready-to-paste setup for that assistant, so copy it right away.',
  },
  {
    question: 'What can an assistant do in my Recall account?',
    answer:
      "It can list your decks, search your cards, get the cards due now, create decks, create or import up to 100 cards at a time, and edit, pause or delete cards. Recall's tools tell assistants to record a review only with the rating you give.",
  },
  {
    question: 'Do I need an AI assistant to use Recall?',
    answer: 'No. You can write cards yourself in the editor, with bold, italic, code and lists.',
  },
  {
    question: 'Can I study any language in Recall?',
    answer: 'Yes. Cards can hold any language or subject, and the interface is in English.',
  },
  {
    question: 'How does Recall decide when a card comes back?',
    answer:
      "When you rate a card Again, Hard, Good or Easy, Recall's FSRS scheduler picks the next review date, aiming for a 90% chance that you still remember the card. Each rating shows its next interval before you choose.",
  },
  {
    question: 'Who else can reach my Recall cards?',
    answer:
      'Only you and the assistants you connect. Row-level security scopes every query to your account, and connection tokens are stored hashed, expire after 90 days and can be revoked at any time.',
  },
  {
    question: 'Can I delete my cards and decks in Recall?',
    answer:
      'Yes. Deleting a card also deletes its review history. When you delete a deck, you choose whether its cards move to another deck or are deleted with it.',
  },
];

/** Answer what a first-time visitor still wonders about. Example: <LandingQuestions />. */
export function LandingQuestions(): React.JSX.Element {
  return (
    <section className="landing-section" id="questions" aria-labelledby="questions-title">
      <h2 id="questions-title">Questions</h2>
      <div className="landing-questions">
        {QUESTIONS.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/** The same questions as a FAQPage node for the page's structured data graph. Example: questionsNode(siteUrl). */
export function questionsNode(siteUrl: string): Record<string, unknown> {
  return {
    '@type': 'FAQPage',
    '@id': `${siteUrl}/#questions`,
    about: { '@id': `${siteUrl}/#app` },
    mainEntity: QUESTIONS.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}
