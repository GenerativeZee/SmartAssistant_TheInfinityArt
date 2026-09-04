// Builds the @supabase/ssr auth cookie for a password sign-in, so we can
// drive authenticated requests against the local Next dev server with curl
// (no browser extension available). Local-dev debugging aid only.
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

const res = await fetch("http://127.0.0.1:54321/auth/v1/token?grant_type=password", {
  method: "POST",
  headers: { apikey: ANON, "Content-Type": "application/json" },
  body: JSON.stringify({ email: "shahid@theinfinityart.in", password: "infinity123" }),
});
const session = await res.json();
if (!session.access_token) {
  console.error("login failed:", session);
  process.exit(1);
}

function base64url(str) {
  return Buffer.from(str, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const value = "base64-" + base64url(JSON.stringify(session));
console.log(`sb-127-auth-token=${value}`);
