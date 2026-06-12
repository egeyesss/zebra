import type { NextConfig } from "next";

// Security headers applied to every response. frame-ancestors / X-Frame-Options
// stop the site being iframed (clickjacking); nosniff stops MIME sniffing;
// HSTS forces HTTPS. The CSP is intentionally limited to frame-ancestors for
// now — the UI leans heavily on inline style={{}} so a full script/style-src
// policy would need a nonce pass before it could be enforced without breaking
// rendering. Google sign-in uses a full-page redirect (not an iframe), so
// frame-ancestors 'none' doesn't interfere with it.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
