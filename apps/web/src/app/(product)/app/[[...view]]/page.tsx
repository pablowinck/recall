import { RecallWorkspace } from '@/features/workspace/recall-workspace';
import { studyDeckFrom, viewFromPath, WORKSPACE_ROOT } from '@/features/workspace/workspace-url';

interface WorkspacePageProps {
  params: Promise<{ view?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Open the workspace at the requested view, and a deck review at its deck. Example: GET /app/study?deck=<id>. */
export default async function WorkspacePage(props: WorkspacePageProps): Promise<React.JSX.Element> {
  const [{ view }, query] = await Promise.all([props.params, props.searchParams]);
  return (
    <RecallWorkspace
      initialView={viewFromPath(`${WORKSPACE_ROOT}/${(view ?? []).join('/')}`)}
      initialStudyDeck={studyDeckFrom(typeof query.deck === 'string' ? query.deck : undefined)}
      startSignedUp={query.new === '1'}
    />
  );
}
