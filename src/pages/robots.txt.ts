import type { APIRoute } from 'astro';

// Generated from `site` in astro.config.mjs, so it follows a future custom domain automatically.
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
