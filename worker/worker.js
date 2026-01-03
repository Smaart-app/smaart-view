export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // -----------------------------
    // CORS (public widget)
    // -----------------------------
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    const securityHeaders = {
      "X-Content-Type-Options": "nosniff",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: { ...cors, ...securityHeaders } });
    }

    const today = new Date().toISOString().slice(0, 10);

    // -----------------------------
    // Small helpers
    // -----------------------------
    const json = (data, init = {}) =>
      Response.json(data, {
        ...init,
        headers: { ...cors, ...securityHeaders, ...(init.headers || {}) },
      });

    function sanitizeText(v, max = 200) {
      if (v == null) return "";
      const s = String(v);
      return s.length > max ? s.slice(0, max) : s;
    }

    // allow: letters, digits, underscore, dash, dot, colon
    function isValidSiteId(siteId) {
      if (!siteId) return false;
      const s = String(siteId).trim();
      if (s.length < 1 || s.length > 64) return false;
      return /^[a-zA-Z0-9_.:-]+$/.test(s);
    }

    const ALLOWED_EVENT_TYPES = new Set(["view", "widget_open"]);

    async function sha256Base64(input) {
      const data = new TextEncoder().encode(input);
      const hash = await crypto.subtle.digest("SHA-256", data);
      let binary = "";
      const bytes = new Uint8Array(hash);
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      return btoa(binary);
    }

    // --------------------------------------------------
    // Lifecycle helper
    // --------------------------------------------------
    async function updateLifecycle(siteId, isWidgetOpen) {
      if (!siteId) return;

      const row = await env.DB.prepare("SELECT * FROM installations WHERE site_id=?")
        .bind(siteId)
        .first();

      // First time we see this site
      if (!row) {
        await env.DB.prepare(`
          INSERT INTO installations
          (site_id, first_seen_at, last_seen_at, active_days_count, widget_open_days_count, last_active_day, last_open_day)
          VALUES (?, datetime('now'), datetime('now'), 1, ?, ?, ?)
        `)
          .bind(
            siteId,
            isWidgetOpen ? 1 : 0,
            today,
            isWidgetOpen ? today : null
          )
          .run();
        return;
      }

      const prevActiveDays = Number(row.active_days_count || 0);
      const prevOpenDays = Number(row.widget_open_days_count || 0);

      let activeDays = prevActiveDays;
      let openDays = prevOpenDays;

      if (row.last_active_day !== today) activeDays += 1;
      if (isWidgetOpen && row.last_open_day !== today) openDays += 1;

      await env.DB.prepare(`
        UPDATE installations
        SET
          last_seen_at = datetime('now'),
          active_days_count = ?,
          widget_open_days_count = ?,
          last_active_day = ?,
          last_open_day = ?
        WHERE site_id = ?
      `)
        .bind(
          activeDays,
          openDays,
          today,
          isWidgetOpen ? today : row.last_open_day,
          siteId
        )
        .run();
    }

    // --------------------------------------------------
    // GET /widget.js  ✅ FINAL — cached + ETag
    // --------------------------------------------------
    if (request.method === "GET" && path === "/widget.js") {
      const js = `
(function () {
  const script = document.currentScript;
  if (!script) return;

  const siteId =
    script.getAttribute("data-site-id") ||
    script.getAttribute("data-site") ||
    "default";

  const API_BASE =
    script.getAttribute("data-api-base") ||
    new URL(script.src).origin;

  function sendEvent(type) {
    try {
      fetch(API_BASE + "/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_id: siteId,
          event_type: type,
          page_path: window.location.pathname || ""
        }),
        keepalive: true
      }).catch(() => {});
    } catch (_) {}
  }

  function fetchStats() {
    return fetch(API_BASE + "/stats?site_id=" + encodeURIComponent(siteId))
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null);
  }

  const VALUE = v => (v && v !== "" ? v : "—");

  const ICON_EYE = \`
<svg width="17" height="17" viewBox="0 0 24 24" fill="none"
 stroke="#475569" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="2.3"></circle>
  <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"></path>
</svg>\`;

  const ICON_HOUSE = \`
<svg width="18" height="18" viewBox="0 0 80 58" fill="none"
 stroke="#475569" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round">
  <g transform="translate(-9.271 -8.125) scale(0.92)">
    <path d="M20.89 47.502V66.125H78.545V30.193H89.271L55.304 8.125 9.271 47.502H20.89Z"/>
  </g>
</svg>\`;

  const ICON_PIN = \`
<svg width="17" height="17" viewBox="0 0 24 24" fill="none"
 stroke="#475569" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 21s7-5 7-11a7 7 0 10-14 0c0 6 7 11 7 11z"></path>
  <circle cx="12" cy="10" r="2.7"></circle>
</svg>\`;

  function createWidget(stats) {
    const views = VALUE(stats?.views);
    const topListing = VALUE(stats?.topListing);
    const topArea = VALUE(stats?.topArea);

    // Avoid duplicates if someone injects twice
    if (document.querySelector("[data-smaart-view-host='1']")) return;

    const host = document.createElement("div");
    host.setAttribute("data-smaart-view-host", "1");
    host.style.position = "fixed";
    host.style.right = "20px";
    host.style.bottom = "30px";
    host.style.zIndex = "999999";
    host.style.fontFamily = "Inter, system-ui, sans-serif";

    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: "open" });

    shadow.innerHTML = \`
<style>
  :host { all: initial; }
  .sp-card{width:190px; background:#fff; border-radius:14px; padding:12px; border:1px solid #e2e8f0;
    box-shadow:0 16px 30px rgba(15,23,42,.14);font-size:13px;color:#0f172a;}
  .sp-card.sp-collapsed .sp-body {max-height:0;opacity:0;overflow:hidden;}
  .sp-header{display:flex;justify-content:center;align-items:center;gap:6px;cursor:pointer;
    border:none;background:transparent;width:100%;}
  .sp-header-sub{font-weight:600;font-size:15px;color:#007BFF;}
  .sp-live-dot{width:7px;height:7px;background:#007BFF;border-radius:999px;animation:sp-pulse 1.6s infinite;}
  @keyframes sp-pulse{0%{transform:scale(1);opacity:.7}50%{transform:scale(1.3);opacity:1}100%{transform:scale(1);opacity:.7}}
  .metric-row{display:grid;grid-template-columns:22px 1fr;padding:4px 0;}
  .metric-value{justify-self:end;font-weight:500;max-width:110px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .sp-footer{text-align:center;font-size:10.5px;color:#64748b;margin-top:10px;}
</style>
<div class="sp-card sp-collapsed">
  <button class="sp-header" type="button" aria-expanded="false">
    <span class="sp-header-sub">View — Live</span><span class="sp-live-dot"></span>
  </button>
  <div class="sp-body">
    <div class="metric-row">\${ICON_EYE}<span class="metric-value">\${views}</span></div>
    <div class="metric-row">\${ICON_HOUSE}<span class="metric-value">\${topListing}</span></div>
    <div class="metric-row">\${ICON_PIN}<span class="metric-value">\${topArea}</span></div>
    <div class="sp-footer">Powered by SMAart • 2026</div>
  </div>
</div>\`;

    const card = shadow.querySelector(".sp-card");
    const header = shadow.querySelector(".sp-header");
    let collapsed = true;

    function sync() {
      card.classList.toggle("sp-collapsed", collapsed);
      header.setAttribute("aria-expanded", String(!collapsed));
    }

    header.addEventListener("click", () => {
      const wasCollapsed = collapsed;
      collapsed = !collapsed;
      sync();
      if (wasCollapsed && !collapsed) sendEvent("widget_open");
    });

    sync();
  }

  sendEvent("view");
  fetchStats().then(s => createWidget(s || {}));
})();
`;

      const etag = `"sha256-${await sha256Base64(js)}"`;
      const inm = request.headers.get("If-None-Match");

      // 304 if unchanged
      if (inm && inm === etag) {
        return new Response(null, {
          status: 304,
          headers: {
            "ETag": etag,
            // Cache on the edge for 1 hour, serve stale while revalidating for 1 day
            "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
            "Content-Type": "text/javascript; charset=utf-8",
            ...cors,
            ...securityHeaders,
          },
        });
      }

      return new Response(js, {
        headers: {
          "Content-Type": "text/javascript; charset=utf-8",
          "ETag": etag,
          "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          ...cors,
          ...securityHeaders,
        },
      });
    }

    // --------------------------------------------------
    // POST /events
    // --------------------------------------------------
    if (request.method === "POST" && path === "/events") {
      try {
        const d = await request.json();

        const siteId = sanitizeText(d?.site_id, 64).trim();
        const eventType = sanitizeText(d?.event_type, 40).trim();

        if (!isValidSiteId(siteId)) {
          return json({ success: false, error: "invalid_site_id" }, { status: 400 });
        }
        if (!ALLOWED_EVENT_TYPES.has(eventType)) {
          return json({ success: false, error: "invalid_event_type" }, { status: 400 });
        }

        const listingIdRaw = d?.listing_id ?? null;
        const areaRaw = d?.area ?? null;

        const listing_id =
          listingIdRaw == null ? null : sanitizeText(listingIdRaw, 120).trim() || null;
        const area =
          areaRaw == null ? null : sanitizeText(areaRaw, 120).trim() || null;

        const page_path = sanitizeText(d?.page_path, 200).trim();

        await env.DB.prepare(`
          INSERT INTO events (site_id, event_type, listing_id, area, page_path)
          VALUES (?, ?, ?, ?, ?)
        `)
          .bind(siteId, eventType, listing_id, area, page_path)
          .run();

        await updateLifecycle(siteId, eventType === "widget_open");

        return json({ success: true });
      } catch {
        return json({ success: false }, { status: 200 });
      }
    }

    // --------------------------------------------------
    // GET /stats
    // --------------------------------------------------
    if (request.method === "GET" && path === "/stats") {
      const siteId = sanitizeText(url.searchParams.get("site_id"), 64).trim();
      if (!isValidSiteId(siteId)) {
        return json({ error: "Missing or invalid site_id" }, { status: 400 });
      }

      const views = await env.DB
        .prepare("SELECT COUNT(*) AS c FROM events WHERE site_id=? AND event_type='view'")
        .bind(siteId)
        .first();

      const topListing = await env.DB
        .prepare(`
          SELECT listing_id, COUNT(*) AS c
          FROM events
          WHERE site_id=? AND listing_id IS NOT NULL AND listing_id != ''
          GROUP BY listing_id
          ORDER BY c DESC
          LIMIT 1
        `)
        .bind(siteId)
        .first();

      const topArea = await env.DB
        .prepare(`
          SELECT area, COUNT(*) AS c
          FROM events
          WHERE site_id=? AND area IS NOT NULL AND area != ''
          GROUP BY area
          ORDER BY c DESC
          LIMIT 1
        `)
        .bind(siteId)
        .first();

      return json({
        views: views?.c || 0,
        topListing: topListing?.listing_id || null,
        topArea: topArea?.area || null,
      });
    }

    // --------------------------------------------------
    // GET /admin/lifecycle
    // --------------------------------------------------
    if (request.method === "GET" && path === "/admin/lifecycle") {
      const rows = await env.DB.prepare(`
        SELECT *,
          CASE
            WHEN julianday('now') - julianday(last_seen_at) <= 3 THEN 'green'
            WHEN julianday('now') - julianday(last_seen_at) <= 7 THEN 'yellow'
            ELSE 'red'
          END AS status
        FROM installations
        ORDER BY last_seen_at DESC
      `).all();

      return json({ sites: rows.results || [] });
    }

    return new Response("SMAart View API running", {
      headers: { ...cors, ...securityHeaders },
    });
  },
};
