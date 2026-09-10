import { RecallApiError, type RecallClient } from '@recall/client';

interface McpAccessRejection {
  status: 401 | 503;
  message: string;
}

/** Preserve the difference between expired credentials and an unavailable API. Example: checkApiAccess(client). */
export async function checkApiAccess(
  client: Pick<RecallClient, 'workspace'>,
): Promise<McpAccessRejection | null> {
  try {
    await client.workspace();
    return null;
  } catch (error) {
    if (error instanceof RecallApiError && error.status === 401)
      return { status: 401, message: 'Invalid or expired token.' };
    return {
      status: 503,
      message: 'The study service is temporarily unavailable. Please try again.',
    };
  }
}
