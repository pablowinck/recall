export interface ConsentDetails {
  redirect_uri: string;
  client: { name: string };
  user: { email: string };
  scope: string;
}
export interface ConsentSummary {
  clientName: string;
  redirectHost: string;
  email: string;
}

const CLIENT_NAME_LIMIT = 60;

/**
 * Summarize who asks for access and where the browser goes next. The client name comes from dynamic
 * registration, so it is trimmed, capped and later rendered as plain text. Example: describeConsent(details).
 */
export function describeConsent(details: ConsentDetails): ConsentSummary {
  return {
    clientName: capName(details.client.name.trim()) || 'An assistant',
    redirectHost: hostOf(details.redirect_uri),
    email: details.user.email,
  };
}

function capName(name: string): string {
  return name.length > CLIENT_NAME_LIMIT ? `${name.slice(0, CLIENT_NAME_LIMIT - 1)}…` : name;
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
