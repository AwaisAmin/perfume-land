// Minimal cookie parsing so we don't need an extra dependency just for reading
// one httpOnly session cookie.
export function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (!key) continue;
    try {
      cookies[key] = decodeURIComponent(value);
    } catch {
      cookies[key] = value;
    }
  }
  return cookies;
}

export function cookieParserMiddleware(req, _res, next) {
  req.cookies = parseCookies(req.headers.cookie);
  next();
}
