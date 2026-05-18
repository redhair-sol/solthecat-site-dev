// functions/contact.js — v1
//
// Cloudflare Pages Function that receives a native HTML form submission from
// /contact, validates it, and forwards the message to info@solthecat.com via
// the Resend API. Replaces the previous Google Forms iframe.
//
// One-time Cloudflare setup (manual, in dashboard):
//   1. Sign up at https://resend.com (free tier covers 3000 emails/month).
//   2. Resend → Domains → Add → solthecat.com. Follow the wizard, add the SPF
//      + DKIM + return-path DNS records to Cloudflare DNS, click "Verify" on
//      Resend until every row is ✅.
//   3. Resend → API Keys → Create API Key (Sending only is enough).
//   4. Pages → solthecat-site → Settings → Environment variables → Production
//      → Add variable: RESEND_API_KEY = the key from step 3. Re-deploy.
//
// Endpoint:
//   POST /api/contact body: { name, email, subject, message, elapsedMs, language }
//                     → { ok: true } on success
//                     → { error: "..." } with appropriate status on failure
//
// Lives under /api/ so the React Router /contact page renders normally.
// A function at functions/contact.js would intercept GET /contact and return
// JSON instead of the SPA page.
//
// Spam guards (no third-party required):
//   - Honeypot field "_gotcha" on the client. If filled, server returns 200
//     silently so the bot thinks it worked.
//   - Time-trap: rejects submissions completed in under 3 seconds (typical
//     bots POST in < 100 ms).
//   - Length caps on every field.
//
// Stronger guards (deferred until spam appears):
//   - Cloudflare Turnstile (free, invisible). Adds 1 widget, 1 verify call.
//   - Per-IP rate limiting via KV.

const MAX_NAME = 80;
const MAX_EMAIL = 120;
const MAX_SUBJECT = 120;
const MAX_MESSAGE = 3000;
const MIN_ELAPSED_MS = 3000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "From" address must use the domain we verified in Resend (solthecat.com).
// "To" routes through Cloudflare Email Routing to your personal inbox.
const FROM = "Sol the Cat <contact@solthecat.com>";
const TO = "info@solthecat.com";

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (!env.RESEND_API_KEY) {
    return json(
      { error: "Contact endpoint is not configured yet. Please email info@solthecat.com directly." },
      503
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const subject = String(body.subject || "").trim();
  const message = String(body.message || "").trim();
  const gotcha = String(body._gotcha || "").trim();
  const elapsedMs = Number(body.elapsedMs || 0);
  const language = body.language === "el" ? "el" : "en";

  // Honeypot: real users never see / fill this field. If a bot did, pretend
  // we accepted the submission so the bot moves on and does not retry.
  if (gotcha) {
    return json({ ok: true });
  }

  // Time-trap: a human cannot type a coherent message in under 3 seconds.
  if (elapsedMs > 0 && elapsedMs < MIN_ELAPSED_MS) {
    return json({ ok: true });
  }

  if (!name || name.length > MAX_NAME) {
    return json({ error: "Please provide your name (1-80 characters)." }, 400);
  }
  if (!email || email.length > MAX_EMAIL || !EMAIL_REGEX.test(email)) {
    return json({ error: "Please provide a valid email address." }, 400);
  }
  if (!subject || subject.length > MAX_SUBJECT) {
    return json({ error: "Please provide a subject (1-120 characters)." }, 400);
  }
  if (!message || message.length > MAX_MESSAGE) {
    return json({ error: "Please provide a message (1-3000 characters)." }, 400);
  }

  const safeSubject = `[solthecat.com] ${subject}`.slice(0, 200);
  const text = [
    `From: ${name} <${email}>`,
    `Language: ${language}`,
    "",
    message,
  ].join("\n");

  const html = `
    <div style="font-family: system-ui, sans-serif; color: #1a1614;">
      <p style="margin:0 0 12px;"><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
      <p style="margin:0 0 12px;"><strong>Language:</strong> ${language}</p>
      <hr style="border:none;border-top:1px solid #e7ddd2;margin:16px 0;">
      <p style="white-space: pre-wrap; margin:0;">${escapeHtml(message)}</p>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject: safeSubject,
        text,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      // Log to Pages tail for debugging; do not leak provider error to client.
      console.error("Resend send failed:", res.status, errText);
      return json({ error: "Could not send the message right now. Please try again or email info@solthecat.com." }, 502);
    }

    return json({ ok: true });
  } catch (err) {
    console.error("Resend fetch threw:", err);
    return json({ error: "Could not send the message right now. Please try again or email info@solthecat.com." }, 502);
  }
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
