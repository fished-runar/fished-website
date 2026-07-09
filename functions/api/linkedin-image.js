// Cloudflare Pages Function — proxies LinkedIn/licdn.com media images so the
// browser loads them from our own origin instead of hotlinking LinkedIn's CDN
// directly (Chrome blocks direct hotlinks to these signed URLs via ORB, since
// they don't send CORS/CORP headers for third-party origins).
//
// Restricted to a small allowlist of LinkedIn CDN hostnames so this can't be
// abused as an open URL-fetching proxy (SSRF).
//
// Available at GET /api/linkedin-image?url=<encoded LinkedIn CDN image URL>

const ALLOWED_HOSTS = new Set(["media.licdn.com", "dms.licdn.com"]);
const CACHE_TTL_SECONDS = 60 * 60 * 24; // 24h

export async function onRequestGet(context) {
  const { request } = context;
  const requestUrl = new URL(request.url);
  const target = requestUrl.searchParams.get("url");

  if (!target) {
    return textResponse("Missing url parameter", 400);
  }

  let parsed;
  try {
    parsed = new URL(target);
  } catch {
    return textResponse("Invalid url parameter", 400);
  }

  if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.has(parsed.hostname)) {
    return textResponse("URL host not allowed", 403);
  }

  const cache = caches.default;
  const cacheKey = new Request(requestUrl.toString(), { method: "GET" });
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  let upstream;
  try {
    upstream = await fetch(parsed.toString(), {
      headers: {
        Accept: "image/*",
        Referer: "https://www.linkedin.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    });
  } catch {
    return textResponse("Failed to reach image host", 502);
  }

  if (!upstream.ok) {
    return textResponse(`Upstream image returned an error: ${upstream.status} ${upstream.statusText}`, 502);
  }

  const contentType = upstream.headers.get("Content-Type") || "";
  if (!contentType.startsWith("image/")) {
    return textResponse("Upstream did not return an image", 502);
  }

  const response = new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}`,
    },
  });

  context.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

export async function onRequestPost() {
  return textResponse("Method not allowed", 405);
}

function textResponse(body, status) {
  return new Response(body, { status, headers: { "Content-Type": "text/plain" } });
}
