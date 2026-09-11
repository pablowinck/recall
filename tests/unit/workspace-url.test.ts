import { describe, expect, it } from 'vitest';
import {
  studyDeckFrom,
  viewFromPath,
  workspacePath,
  workspaceTitle,
} from '../../apps/web/src/features/workspace/workspace-url';

describe('workspace addresses', () => {
  it('gives every view its own path', () => {
    expect(workspacePath('today')).toBe('/app');
    expect(workspacePath('library')).toBe('/app/library');
    expect(workspacePath('study')).toBe('/app/study');
  });

  it('keeps a deck review’s deck in its address, and reads back only a deck id', () => {
    const deck = '4f0b6f1e-0000-4000-8000-000000000000';
    expect(workspacePath('study', deck)).toBe(`/app/study?deck=${deck}`);
    expect(workspacePath('library', deck)).toBe('/app/library');
    expect(studyDeckFrom(deck)).toBe(deck);
    expect(studyDeckFrom('../workspace')).toBeUndefined();
    expect(studyDeckFrom(null)).toBeUndefined();
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

  it('names each view for tabs and the history menu', () => {
    expect(workspaceTitle('library')).toBe('Library · Recall');
    expect(workspaceTitle('study')).toBe('Review session · Recall');
  });
});
