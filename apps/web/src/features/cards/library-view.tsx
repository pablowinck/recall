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
        eyebrow="WHAT YOU WANT TO REMEMBER"
        title="Your library."
        description="Words, ideas, and little discoveries."
        action={<NewCardButton onClick={props.create} />}
      />
      <LibraryToolbar library={props} state={state} />
      <LibraryResults library={props} state={state} />
    </div>
  );
}
