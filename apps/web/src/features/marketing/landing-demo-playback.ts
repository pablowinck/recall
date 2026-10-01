import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

type DemoPlayback = {
  playing: boolean;
  toggle: () => void;
  onPlay: () => void;
  onPause: () => void;
};

// Half the frame on screen counts as watching; less would start it while it still sits under the fold.
const VISIBLE_SHARE = 0.5;

/**
 * Play the demo while it is on screen, unless the visitor paused it or asked for reduced motion.
 * Example: const playback = useDemoPlayback(videoRef); <video onPlay={playback.onPlay} onPause={playback.onPause} />.
 */
export function useDemoPlayback(videoRef: RefObject<HTMLVideoElement | null>): DemoPlayback {
  const [playing, setPlaying] = useState(false);
  const pausedByVisitor = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => followVisibility(video, entry?.isIntersecting ?? false, pausedByVisitor.current),
      { threshold: VISIBLE_SHARE },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [videoRef]);

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    pausedByVisitor.current = !video.paused;
    if (video.paused) startQuietly(video);
    else video.pause();
  }, [videoRef]);

  return { playing, toggle, onPlay: () => setPlaying(true), onPause: () => setPlaying(false) };
}

function followVisibility(
  video: HTMLVideoElement,
  visible: boolean,
  pausedByVisitor: boolean,
): void {
  if (!visible) return video.pause();
  if (pausedByVisitor || prefersReducedMotion()) return;
  startQuietly(video);
}

// Browsers may refuse playback (data saver, power saving); the poster then stays, which is a fine demo too.
function startQuietly(video: HTMLVideoElement): void {
  video.play().catch(() => undefined);
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
