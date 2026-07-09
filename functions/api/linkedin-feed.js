// Cloudflare Pages Function — proxies Elfsight's internal LinkedIn feed data
// endpoint server-side (a server-to-server request has no CORS restriction)
// and caches the response at the edge for 24h, since new posts are infrequent.
//
// Deployed automatically by Cloudflare Pages from this /functions directory,
// available at GET /api/linkedin-feed.
//
// NOTE: this calls an *undocumented* Elfsight backend endpoint (observed via
// browser devtools, not a published/supported API). The response shape can
// change without notice, and this may fall outside Elfsight's intended usage
// of their widget.

const ELFSIGHT_PID = "d93a53e7-6c2a-472b-9667-c9c5bc919696";
const ELFSIGHT_URL =
  "https://widget-data.service.elfsight.com/api/posts?sources[]=" +
  encodeURIComponent(JSON.stringify({ pid: ELFSIGHT_PID, filters: [{ type: "exclude", post_type: "repost" }] })) +
  "&limit=100";

const CACHE_TTL_SECONDS = 60 * 60 * 24; // 24h

export async function onRequestGet(context) {
  const cache = caches.default;
  const cacheKey = new Request(ELFSIGHT_URL, { method: "GET" });

  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  let upstream;
  try {
    upstream = await fetch(ELFSIGHT_URL, {
      headers: { Accept: "application/json" },
    });
  } catch {
    return jsonResponse({ error: "Failed to reach Elfsight" }, 502);
  }

  if (!upstream.ok) {
    return jsonResponse({ error: "Upstream returned an error" }, 502);
  }

  let data;
  try {
    data = await upstream.json();
  } catch {
    return jsonResponse({ error: "Invalid upstream response" }, 502);
  }

  const response = jsonResponse(data, 200, CACHE_TTL_SECONDS);
  context.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

export async function onRequestPost() {
  return jsonResponse({ error: "Method not allowed" }, 405);
}

function jsonResponse(body, status, cacheTtlSeconds) {
  const headers = { "Content-Type": "application/json" };
  if (cacheTtlSeconds) {
    headers["Cache-Control"] = `public, max-age=${cacheTtlSeconds}`;
  }
  return new Response(JSON.stringify(body), { status, headers });
}
