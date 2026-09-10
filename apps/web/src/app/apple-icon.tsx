import { ImageResponse } from 'next/og';
import { recallMarkPaths } from '@/components/brand';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** Render the home-screen icon from the brand mark at build time. Example: GET /apple-icon.png. */
export default function AppleIcon(): ImageResponse {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#f1f0ef' }}>
      <svg width="180" height="180" viewBox="-6 -6 44 44">
        <path d={recallMarkPaths.body} fill="#3e63dd" />
        <path d={recallMarkPaths.fold} fill="#c9d5ff" />
      </svg>
    </div>,
    size,
  );
}
