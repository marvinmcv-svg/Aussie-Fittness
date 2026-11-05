import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: { qualities: [65, 75] },
  allowedDevOrigins: ["*.space-z.ai"],
  // The app moved from / to /app. Keep old shared links working.
  async redirects() {
    return [
      { source: '/', has: [{ type: 'query', key: 'recipe', value: '(?<id>r\\d+)' }], destination: '/recipes/:id', permanent: true },
      { source: '/', has: [{ type: 'query', key: 'tab' }], destination: '/app', permanent: false },
      { source: '/', has: [{ type: 'query', key: 'reset' }], destination: '/app', permanent: false },
      { source: '/', has: [{ type: 'query', key: 'payment' }], destination: '/app', permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Force HTTPS for 1 year (only in production behind HTTPS)
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          // Referrer policy — only send origin to cross-origin
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions policy — disable unused browser features
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Content Security Policy
          // - default-src 'self': only load from same origin by default
          // - script-src 'self' 'unsafe-inline' 'unsafe-eval': Next.js dev needs these; tighten in prod
          // - style-src 'self' 'unsafe-inline': Tailwind/Next inject inline styles
          // - img-src 'self' data: blob: https: : allow images from any https + data URIs
          // - font-src 'self' data: : fonts from same origin or data
          // - connect-src 'self': API calls only to same origin
          // - frame-ancestors 'none': prevent embedding (complements X-Frame-Options)
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          // Cross-Origin policies (prevent cross-origin resource leaks)
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
