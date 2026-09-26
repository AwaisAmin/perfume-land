import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

// Origin of the CRM backend (e.g. "http://localhost:4000"). Images uploaded
// through the CRM are absolute URLs on this origin, so it is allowed in the
// CSP img-src and in next/image's remotePatterns — only when it is set.
function parseApiOrigin(value: string | undefined): URL | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}
const apiOrigin = parseApiOrigin(process.env.NEXT_PUBLIC_API_ORIGIN);
const apiIsLocal = apiOrigin !== null && ["localhost", "127.0.0.1", "[::1]"].includes(apiOrigin.hostname);
// Static rendering uses inline hydration scripts. A nonce policy would require
// request-time rendering; keep this limitation explicit rather than breaking hydration.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://flagcdn.com${apiOrigin ? ` ${apiOrigin.origin}` : ""}`,
  `media-src 'self'${apiOrigin ? ` ${apiOrigin.origin}` : ""}`,
  "font-src 'self'",
  `connect-src 'self'${isDevelopment ? " ws://localhost:* ws://127.0.0.1:*" : ""}`,
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: apiOrigin
    ? {
        remotePatterns: [
          {
            protocol: apiOrigin.protocol === "https:" ? "https" : "http",
            hostname: apiOrigin.hostname.replace(/^\[|\]$/g, ""),
            ...(apiOrigin.port ? { port: apiOrigin.port } : {}),
            pathname: "/uploads/**",
          },
        ],
        // The optimizer refuses private/loopback hosts by default; a local
        // CRM backend (development) needs this. Never enabled for public hosts.
        ...(apiIsLocal ? { dangerouslyAllowLocalIP: true } : {}),
      }
    : undefined,
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "Content-Security-Policy", value: csp },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
    ] }];
  },
};

export default nextConfig;
