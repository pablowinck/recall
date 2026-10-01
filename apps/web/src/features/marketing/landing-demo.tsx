'use client';

import { useRef } from 'react';
import { useDemoPlayback } from './landing-demo-playback';

// Versioned names let the files be cached forever; publish a new version instead of replacing one.
const DEMO = '/video/recall-demo-v1';

/** Show Recall's loop in a muted, captioned demo with its own pause control. Example: <LandingDemo />. */
export function LandingDemo(): React.JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playback = useDemoPlayback(videoRef);
  return (
    <figure className="landing-demo">
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        poster={`${DEMO}-poster.webp`}
        width={1920}
        height={1080}
        disablePictureInPicture
        aria-describedby="landing-demo-caption"
        onPlay={playback.onPlay}
        onPause={playback.onPause}
      >
        <source media="(max-width: 800px)" src={`${DEMO}-1280.mp4`} type="video/mp4" />
        <source src={`${DEMO}.mp4`} type="video/mp4" />
      </video>
      <button
        type="button"
        className="landing-demo-toggle"
        aria-label={playback.playing ? 'Pause demo' : 'Play demo'}
        onClick={playback.toggle}
      >
        {playback.playing ? <PauseIcon /> : <PlayIcon />}
      </button>
      <figcaption id="landing-demo-caption" className="visually-hidden">
        An assistant creates a flashcard about the two meanings of “I’d” through Recall’s MCP
        server. Recall shows it in a review, the answer is revealed and rated Good, and FSRS spaces
        the next reviews from one day to two months. Today then shows the reviews done, the library
        and the day streak.
      </figcaption>
    </figure>
  );
}

function PauseIcon(): React.JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <rect x="3.5" y="2.5" width="3" height="11" rx="1" fill="currentColor" />
      <rect x="9.5" y="2.5" width="3" height="11" rx="1" fill="currentColor" />
    </svg>
  );
}

function PlayIcon(): React.JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        d="M4.5 2.9v10.2a.9.9 0 0 0 1.37.77l8.1-5.1a.9.9 0 0 0 0-1.54l-8.1-5.1A.9.9 0 0 0 4.5 2.9Z"
        fill="currentColor"
      />
    </svg>
  );
}
