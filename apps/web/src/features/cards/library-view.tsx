'use client';
import { NewCardButton, PageHeading } from '@/components/page-heading';
import { LibraryToolbar } from './library-toolbar';
import { LibraryResults } from './library-results';
import { useLibraryView } from './use-library-view';
import type { LibraryViewProps } from './library-types';

/** Search and paginate the actual card library. Example: <LibraryView {...props} />. */
export function LibraryView(props: LibraryViewProps): React.JSX.Element {
  const state = useLibraryView(props.client, props.revision);
  return (
    <div className="view-enter">
      <PageHeading
        title="Library"
        action={<NewCardButton onClick={() => props.create(state.query.deck || undefined)} />}
      />
      <LibraryToolbar library={props} state={state} />
      <LibraryResults library={props} state={state} />
    </div>
  );
}
