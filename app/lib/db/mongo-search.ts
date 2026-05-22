import "server-only";

const MAX_QUERY_LENGTH = 100;

/**
 * Escape regex metacharacters before interpolating user input into a Mongo
 * `$regex` filter. Without escaping, a single character like `.` or `*`
 * matches everything, and pathological inputs (`(a+)+`) can trigger
 * catastrophic backtracking (ReDoS) inside the Mongo regex engine.
 *
 * Also caps the length so a 10 MB query string cannot DoS the server.
 */
export function sanitiseMongoRegex(input: string): string {
  return input
    .slice(0, MAX_QUERY_LENGTH)
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
