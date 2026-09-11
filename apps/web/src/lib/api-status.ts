/** Tell whether a failure carries an HTTP status, duck-typed so it survives separate copies of the client package. Example: hasStatus(error, 409). */
export function hasStatus(failure: unknown, status: number): boolean {
  return (
    typeof failure === 'object' &&
    failure !== null &&
    'status' in failure &&
    failure.status === status
  );
}
