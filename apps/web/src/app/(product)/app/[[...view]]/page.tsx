import { RecallWorkspace } from '@/features/workspace/recall-workspace';
import { WORKSPACE_ROOT, workspaceAddressFrom } from '@/features/workspace/workspace-url';

type PageQuery = Record<string, string | string[] | undefined>;

interface WorkspacePageProps {
  params: Promise<{ view?: string[] }>;
  searchParams: Promise<PageQuery>;
}

/** Open the workspace where its address points. Example: GET /app/study?deck=<id> or GET /app/library?q=verbs&page=2. */
export default async function WorkspacePage(props: WorkspacePageProps): Promise<React.JSX.Element> {
  const [{ view }, query] = await Promise.all([props.params, props.searchParams]);
  const path = `${WORKSPACE_ROOT}/${(view ?? []).join('/')}`;
  return (
    <RecallWorkspace
      initialAddress={workspaceAddressFrom(path, firstValues(query))}
      startSignedUp={query.new === '1'}
    />
  );
}

// Next gives a repeated parameter as an array; the browser's URLSearchParams reads its first value, so this does too.
function firstValues(query: PageQuery): URLSearchParams {
  const values = new URLSearchParams();
  for (const [name, value] of Object.entries(query)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) values.set(name, first);
  }
  return values;
}
