// Cloudflare Pages Function — proxies the contact form submission to Power
// Automate so the real webhook URL never ships to the browser.
//
// Deployed automatically by Cloudflare Pages from this /functions directory,
// available at POST /api/contact.
//
// Requires environment variables set in the Cloudflare Pages project settings
// (Settings → Environment variables, for both Production and Preview):
//   POWER_AUTOMATE_WEBHOOK_URL — see README for setup steps.
//   TURNSTILE_SECRET_KEY — Cloudflare Turnstile secret key, used to verify the
//   anti-bot token submitted alongside the form (see the Turnstile setup step
//   in the project notes).

export async function onRequestPost(context) {
  const { request, env } = context;

  let data;
  try {
    data = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { name, phone, email, company, message, website, turnstileToken } = data || {};

  // Honeypot: real users never see or fill this field. If it's populated,
  // silently pretend success so bots don't learn they were caught.
  if (website) {
    return jsonResponse({ ok: true }, 200);
  }

  if (!name || !phone || !email || !company) {
    return jsonResponse({ error: "Missing required fields" }, 400);
  }

  const turnstileSecret = env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    if (!turnstileToken) {
      return jsonResponse({ error: "Missing anti-bot verification" }, 400);
    }
    const verifyBody = new URLSearchParams();
    verifyBody.append("secret", turnstileSecret);
    verifyBody.append("response", turnstileToken);
    const clientIp = request.headers.get("CF-Connecting-IP");
    if (clientIp) verifyBody.append("remoteip", clientIp);

    let verified = false;
    try {
      const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: verifyBody,
      });
      const verifyJson = await verifyRes.json();
      verified = verifyJson.success === true;
    } catch {
      verified = false;
    }
    if (!verified) {
      return jsonResponse({ error: "Anti-bot verification failed" }, 403);
    }
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
