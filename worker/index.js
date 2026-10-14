// Cloudflare Worker in front of joelathiessen.ca
// - The site's own paths go to the website on Cloud Run
// - /share/website/<branch>/ and /share/kaly2/<branch>/ go to that branch's preview,
//   for browsers holding a share cookie (set by opening a ?key= link)
// - Everything else redirects to the other server
// Settings are Worker secrets, so nothing about the hosting lives in this repo:
// SITE_KEY, SHARE_CODE, PROD_ORIGIN, PREVIEW_ORIGIN (contains {tag}), OTHER_ORIGIN

const SITE_PATH = /^\/(|favicon\.ico|[\w-]+\.bundle\.js|[\w-]+\.worker\.js|(css|img|public|socket\.io)\/.*)$/;
const SHARE_PATH = /^\/share\/(website|kaly2)\/([a-z0-9-]{1,28})(\/.*)?$/;
const TAG_PREFIX = { website: "w-", kaly2: "k-" };
const OWNER_COOKIE = "share-owner";
const MAX_AGE = 400 * 24 * 60 * 60; // the longest browsers keep a cookie
const PRIVATE = { "x-robots-tag": "noindex, nofollow", "referrer-policy": "no-referrer" };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname.startsWith("www.")) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
    }
    const path = url.pathname;
    if (path === "/share" || path === "/share/") return shareHome(request, env, url);
    const share = path.match(SHARE_PATH);
    if (share) return sharePreview(request, env, url, share[1], share[2], share[3]);
    if (SITE_PATH.test(path)) return forward(request, env, env.PROD_ORIGIN + path + url.search);
    // Everything else, including older /share/ links, lives on the other server
    return Response.redirect(env.OTHER_ORIGIN + path + url.search, 302);
  },
};

// /share/?key=<SHARE_CODE> turns share links on for this browser
async function shareHome(request, env, url) {
  const key = url.searchParams.get("key");
  const owner = key === null ? await isOwner(request, env) : await same(key, env.SHARE_CODE);
  if (!owner) return notFound();
  return text("Share links are on for this browser.", ownerCookie(env));
}

async function sharePreview(request, env, url, kind, name, rest) {
  const base = `/share/${kind}/${name}/`;
  const itemKey = await hmac(env.SHARE_CODE, `${kind}/${name}`);
  const itemCookie = `share-${kind}-${name}`;

  // Opening a ?key= link sets the cookie, then goes to the same page without the key
  const key = url.searchParams.get("key");
  if (key !== null) {
    let setCookie;
    if (await same(key, env.SHARE_CODE)) setCookie = ownerCookie(env);
    else if (await same(key, itemKey)) setCookie = cookie(itemCookie, itemKey, base);
    else return notFound();
    url.searchParams.delete("key");
    return redirect((rest ? url.pathname : base) + url.search, setCookie);
  }

  const owner = await isOwner(request, env);
  if (!owner && !(await same(readCookie(request, itemCookie), itemKey))) return notFound();

  // ?link gives the owner a link that opens only this preview
  if (url.searchParams.has("link")) {
    if (!owner) return notFound();
    return text(`${url.origin}${base}?key=${itemKey}`, ownerCookie(env));
  }
  if (!rest) return redirect(base + url.search);

  const origin = env.PREVIEW_ORIGIN.replace("{tag}", TAG_PREFIX[kind] + name);
  const response = await forward(request, env, origin + rest + url.search);
  if (response.status === 101) return response; // websocket upgrade
  const out = new Response(response.body, response);
  for (const [k, v] of Object.entries(PRIVATE)) out.headers.set(k, v);
  if (owner) out.headers.append("set-cookie", ownerCookie(env));
  return out;
}

// Pass the request on with the site key, without our share cookies
function forward(request, env, target) {
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("x-site-key", env.SITE_KEY);
  const cookies = (headers.get("cookie") || "").split(/;\s*/).filter((c) => c && !c.startsWith("share-"));
  if (cookies.length) headers.set("cookie", cookies.join("; "));
  else headers.delete("cookie");
  return fetch(target, { method: request.method, headers, body: request.body, redirect: "manual" });
}

function isOwner(request, env) {
  return same(readCookie(request, OWNER_COOKIE), env.SHARE_CODE);
}

function readCookie(request, name) {
  for (const c of (request.headers.get("cookie") || "").split(/;\s*/)) {
    const i = c.indexOf("=");
    if (i > 0 && c.slice(0, i) === name) return c.slice(i + 1);
  }
  return "";
}

function cookie(name, value, path) {
  return `${name}=${value}; Path=${path}; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`;
}

function ownerCookie(env) {
  return cookie(OWNER_COOKIE, env.SHARE_CODE, "/share/");
}

async function hmac(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

async function same(a, b) {
  const enc = new TextEncoder();
  const x = enc.encode(a || "");
  const y = enc.encode(b || "");
  return x.byteLength === y.byteLength && y.byteLength > 0 && crypto.subtle.timingSafeEqual(x, y);
}

function text(body, setCookie) {
  const headers = { ...PRIVATE, "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" };
  if (setCookie) headers["set-cookie"] = setCookie;
  return new Response(body + "\n", { headers });
}

function redirect(location, setCookie) {
  const headers = { ...PRIVATE, location, "cache-control": "no-store" };
  if (setCookie) headers["set-cookie"] = setCookie;
  return new Response(null, { status: 302, headers });
}

function notFound() {
  return new Response("Not found\n", { status: 404, headers: { ...PRIVATE, "content-type": "text/plain" } });
}
