import { describe, expect, it } from 'vitest';
import { viewFromPath, workspacePath } from '../../apps/web/src/features/workspace/workspace-url';

describe('workspace addresses', () => {
  it('gives every view its own path', () => {
    expect(workspacePath('today')).toBe('/app');
    expect(workspacePath('library')).toBe('/app/library');
    expect(workspacePath('study')).toBe('/app/study');
  });

  it('reads the view back from an address', () => {
    expect(viewFromPath('/app/library')).toBe('library');
    expect(viewFromPath('/app/connections')).toBe('connections');
    expect(viewFromPath('/app')).toBe('today');
  });

  it('falls back to Today for an unknown address', () => {
    expect(viewFromPath('/app/nowhere')).toBe('today');
    expect(viewFromPath('/')).toBe('today');
  });
});
