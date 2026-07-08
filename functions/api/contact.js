// Cloudflare Pages Function — proxies the contact form submission to Power
// Automate so the real webhook URL never ships to the browser.
//
// Deployed automatically by Cloudflare Pages from this /functions directory,
// available at POST /api/contact.
//
// Requires an environment variable named POWER_AUTOMATE_WEBHOOK_URL to be set
// in the Cloudflare Pages project settings (Settings → Environment variables,
// for both Production and Preview) — see README for setup steps.

export async function onRequestPost(context) {
  const { request, env } = context;

  let data;
  try {
    data = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { name, phone, email, company, message } = data || {};
  if (!name || !phone || !email || !company) {
    return jsonResponse({ error: "Missing required fields" }, 400);
  }

  const webhookUrl = env.POWER_AUTOMATE_WEBHOOK_URL;
  if (!webhookUrl) {
    return jsonResponse({ error: "Server misconfigured: missing webhook URL" }, 500);
  }

  try {
    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, email, company, message: message || "" }),
    });

    if (!upstream.ok) {
      return jsonResponse({ error: "Upstream webhook returned an error" }, 502);
    }

    return jsonResponse({ ok: true }, 200);
  } catch {
    return jsonResponse({ error: "Failed to reach webhook" }, 502);
  }
}

// Any non-POST method on this route is not supported.
export async function onRequestGet() {
  return jsonResponse({ error: "Method not allowed" }, 405);
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
