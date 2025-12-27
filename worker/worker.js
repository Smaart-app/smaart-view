export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // --------------------------------------------------
    // CORS
    // --------------------------------------------------
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    // --------------------------------------------------
    // GET /widget.js  (SERVE PREMIUM WIDGET + widget_open)
    // --------------------------------------------------
    if (request.method === "GET" && path === "/widget.js") {
      const js = `
/* SMAart View — Widget (Premium)
   - Collapse/Expand preserved
   - Sends: view + widget_open
*/
(function () {
  const script = document.currentScript;
  if (!script) return;

  const siteId =
    script.getAttribute("data-site-id") ||
    script.getAttribute("data-site") ||
    "default";

  // Prefer explicit override, else use the origin of the script (same Worker domain)
  const API_BASE =
    script.getAttribute("data-api-base") ||
    (new URL(script.src)).origin;

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
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }

  const VALUE = (v) => (v && v !== "" ? v : "—");

  // ICONS — preserved exactly
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

    const host = document.createElement("div");
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

  .sp-card {
    width: 210px;
    background: #fff;
    border-radius: 14px;
    padding: 14px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 16px 30px rgba(15,23,42,0.14);
    font-size: 13px;
    color: #0f172a;
    box-sizing: border-box;
    transition: box-shadow 0.18s ease-out, transform 0.18s ease-out;
  }

  .sp-card.sp-collapsed {
    padding-bottom: 10px;
  }

  .sp-header {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    padding-left: 0;
    margin-bottom: 4px;
    width: 100%;
    cursor: pointer;
    background: transparent;
    border: none;
    font: inherit;
    text-align: center;
  }

  .sp-header-sub {
    font-weight: 600;
    font-size: 15px;
    color: #007BFF;
  }

  .sp-live-dot {
    width: 7px;
    height: 7px;
    background: #007BFF;
    border-radius: 999px;
    animation: sp-pulse 1.6s ease-out infinite;
  }

  @keyframes sp-pulse {
    0% { transform: scale(1); opacity: .7; }
    50% { transform: scale(1.30); opacity: 1; }
    100% { transform: scale(1); opacity: .7; }
  }

  .sp-body {
    margin-top: 6px;
    max-height: 260px;
    opacity: 1;
    overflow: hidden;
    transition: max-height 0.18s ease-out, opacity 0.18s ease-out;
  }

  .sp-card.sp-collapsed .sp-body {
    max-height: 0;
    opacity: 0;
  }

  .metric-row {
    display: grid;
    grid-template-columns: 22px 1fr;
    align-items: center;
    padding: 4px 0;
    min-width: 0;
  }

  .metric-value {
    justify-self: end;
    padding-right: 4px;
    font-weight: 500;
    max-width: 110px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sp-footer {
    margin-top: 10px;
    text-align: center;
    font-size: 10.5px;
    color: #64748b;
  }
</style>

<div class="sp-card sp-collapsed">
  <button class="sp-header" type="button" aria-label="Toggle SMAart View" aria-expanded="false">
    <span class="sp-header-sub">View — Live</span>
    <span class="sp-live-dot"></span>
  </button>

  <div class="sp-body">
    <div class="metric-row">
      \${ICON_EYE}
      <span class="metric-value">\${views}</span>
    </div>

    <div class="metric-row">
      \${ICON_HOUSE}
      <span class="metric-value">\${topListing}</span>
    </div>

    <div class="metric-row">
      \${ICON_PIN}
      <span class="metric-value">\${topArea}</span>
    </div>

    <div class="sp-footer">
      Powered by SMAart • 2026
    </div>
  </div>
</div>\`;

    const cardEl = shadow.querySelector(".sp-card");
    const headerEl = shadow.querySelector(".sp-header");

    let collapsed = true;

    const sync = () => {
      if (collapsed) {
        cardEl.classList.add("sp-collapsed");
        headerEl.setAttribute("aria-expanded", "false");
      } else {
        cardEl.classList.remove("sp-collapsed");
        headerEl.setAttribute("aria-expanded", "true");
      }
    };

    headerEl.addEventListener("click", () => {
      const wasCollapsed = collapsed;
      collapsed = !collapsed;
      sync();

      // Only count "open" action (collapsed -> expanded)
      if (wasCollapsed && !collapsed) {
        sendEvent("widget_open");
      }
    });

    sync();
  }

  // Always record view
  sendEvent("view");

  // Load stats once; (optional: you can add polling later)
  fetchStats().then((s) => createWidget(s || {}));
})();
`;
      return new Response(js, {
        headers: { "Content-Type": "text/javascript; charset=utf-8", ...cors },
      });
    }

    // --------------------------------------------------
    // POST /events
    // --------------------------------------------------
    if (request.method === "POST" && path === "/events") {
      try {
        const d = await request.json();
        await env.DB.prepare(`
          INSERT INTO events (site_id, event_type, listing_id, area, page_path)
          VALUES (?, ?, ?, ?, ?)
        `)
          .bind(
            d.site_id || "",
            d.event_type || "",
            d.listing_id ?? null,
            d.area ?? null,
            d.page_path || ""
          )
          .run();

        return Response.json({ success: true }, { headers: cors });
      } catch (err) {
        console.error("POST /events error:", err);
        return Response.json({ success: false }, { headers: cors });
      }
    }

    // --------------------------------------------------
    // GET /stats (per site)
    // --------------------------------------------------
    if (request.method === "GET" && path === "/stats") {
      const siteId = url.searchParams.get("site_id");
      if (!siteId) {
        return Response.json({ error: "Missing site_id" }, { status: 400, headers: cors });
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

      return Response.json(
        {
          views: views?.c || 0,
          topListing: topListing?.listing_id || null,
          topArea: topArea?.area || null,
        },
        { headers: cors }
      );
    }

    // --------------------------------------------------
    // GET /admin/stats 🔐 (UPDATED)
    // Returns:
    // - installedSites (from registrations)
    // - widgetOpens per domain (LEFT JOIN)
    // --------------------------------------------------
    if (request.method === "GET" && path === "/admin/stats") {
      const token = url.searchParams.get("token");

      if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
        return Response.json({ error: "Unauthorized" }, { status: 401, headers: cors });
      }

      try {
        // Total installations (registrations)
        const installedSites = await env.DB
          .prepare("SELECT COUNT(*) AS c FROM registrations")
          .first();

        // Widget opens per site (we assume site_id == registrations.domain)
        const widgetOpens = await env.DB
          .prepare(`
            SELECT r.domain AS domain, COUNT(e.id) AS opens
            FROM registrations r
            LEFT JOIN events e
              ON e.site_id = r.domain
             AND e.event_type = 'widget_open'
            GROUP BY r.domain
            ORDER BY opens DESC, r.domain ASC
          `)
          .all();

        return Response.json(
          {
            installedSites: installedSites?.c || 0,
            widgetOpens: widgetOpens?.results || [],
          },
          { headers: cors }
        );
      } catch (err) {
        console.error("ADMIN stats error:", err);
        return Response.json(
          { error: "Failed to load admin stats" },
          { status: 500, headers: cors }
        );
      }
    }

    // --------------------------------------------------
    // POST /register
    // --------------------------------------------------
    if (request.method === "POST" && path === "/register") {
      try {
        const d = await request.json();
        if (!d.first || !d.last || !d.email || !d.domain) {
          return Response.json({ error: "Missing required fields" }, { status: 400, headers: cors });
        }

        await env.DB.prepare(`
          INSERT INTO registrations (first, last, email, domain, created_at)
          VALUES (?, ?, ?, ?, datetime('now'))
        `)
          .bind(d.first, d.last, d.email, d.domain)
          .run();

        return Response.json({ success: true }, { headers: cors });
      } catch (err) {
        console.error("POST /register error:", err);
        // Keep behavior as you had it (non-breaking)
        return Response.json({ success: true }, { headers: cors });
      }
    }

    // --------------------------------------------------
    // POST /notify
    // --------------------------------------------------
    if (request.method === "POST" && path === "/notify") {
      try {
        const d = await request.json();

        if (!env.RESEND_KEY || !env.NOTIFY_TO_EMAIL) {
          console.warn("Notify skipped – missing env vars");
          return Response.json({ ok: true }, { headers: cors });
        }

        const text = `
New SMAart View – Installation Request

Name: ${d.first} ${d.last}
Email: ${d.email}
Domain: ${d.domain}
Submitted: ${new Date().toISOString()}
`;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + env.RESEND_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "SMAart View <onboarding@resend.dev>",
            to: env.NOTIFY_TO_EMAIL,
            reply_to: "view@smaart-app.com",
            subject: "SMAart View · New Installation Request",
            text,
          }),
        });

        return Response.json({ ok: true }, { headers: cors });
      } catch (err) {
        console.error("POST /notify error:", err);
        return Response.json({ ok: true }, { headers: cors });
      }
    }

    // --------------------------------------------------
    return new Response("SMAart View API running", { headers: cors });
  },
};
