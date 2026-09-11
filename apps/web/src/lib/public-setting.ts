// Next inlines a public setting only where it is written as process.env.NAME, so callers pass the value in.
/** Read a required NEXT_PUBLIC_ setting, or explain what is missing. Example: requirePublicSetting(process.env.NEXT_PUBLIC_API_URL, 'NEXT_PUBLIC_API_URL'). */
export function requirePublicSetting(value: string | undefined, name: string): string {
  if (!value)
    throw new Error(
      `${name} is not set. A fresh worktree needs apps/web/.env.local (see AGENTS.md).`,
    );
  return value;
}
