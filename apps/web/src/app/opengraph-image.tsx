import { ImageResponse } from 'next/og';
import { recallMarkPaths } from '@/components/brand';

export const alt = 'Recall — free spaced repetition flashcards your AI writes';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Render the social preview from the brand mark and the headline at build time. Example: GET /opengraph-image. */
export default function OpenGraphImage(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 84px',
        background: '#f1f0ef',
        color: '#21201c',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <svg width="72" height="72" viewBox="0 0 32 32">
          <path d={recallMarkPaths.body} fill="#3e63dd" />
          <path d={recallMarkPaths.fold} fill="#c9d5ff" />
        </svg>
        <div style={{ fontSize: 46, fontWeight: 700 }}>Recall</div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontSize: 76,
          fontWeight: 700,
          letterSpacing: -2.5,
          lineHeight: 1.06,
        }}
      >
        <div>Your AI writes the cards.</div>
        <div>Recall makes them stick.</div>
      </div>
      <div style={{ fontSize: 30, color: '#63635e' }}>
        Free, open-source spaced repetition for Claude Code, Codex, Cursor and other MCP assistants
      </div>
    </div>,
    size,
  );
}
