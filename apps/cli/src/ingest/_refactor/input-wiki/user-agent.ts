// Wikimedia's API Policy (see https://phabricator.wikimedia.org/T400119 and
// https://meta.wikimedia.org/wiki/User-Agent_policy) requires every API client
// to send a descriptive User-Agent that identifies the application and a way
// to contact the operator. Anonymous / generic UAs (including axios's default
// `axios/<version>`) are now blocked with HTTP 403, which breaks the daily
// Wiki species sync. Keep this string descriptive and include contact info.
export const WIKI_USER_AGENT = 'BiodiversityCLI/1.0 (https://github.com/rfcx/arbimon; support@rfcx.org)'
