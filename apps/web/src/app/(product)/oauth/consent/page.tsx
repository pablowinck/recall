import type { Metadata } from 'next';
import { OAuthConsentScreen } from '@/features/auth/oauth-consent-screen';

export const metadata: Metadata = {
  title: 'Allow access',
  robots: { index: false, follow: false },
};

interface ConsentPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Let a person approve or deny an assistant asking for their cards. Example: GET /oauth/consent?authorization_id=abc. */
export default async function ConsentPage(props: ConsentPageProps): Promise<React.JSX.Element> {
  const query = await props.searchParams;
  const id = typeof query.authorization_id === 'string' ? query.authorization_id : '';
  return <OAuthConsentScreen authorizationId={id} />;
}
