export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    // --------------------------------------------------
    // GET /widget.js  (FINAL — compact + calm motion)
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

  const SCALE =
    parseFloat(script.getAttribute("data-scale")) || 1;

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
    } catch {}
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
  .sp-card {
    width: 190px;
    background: #fff;
    border-radius: 14px;
    padding: 12px;
    border: 5px solid red !important;
    box-shadow: 0 14px 28px rgba(15,23,42,0.14);
    font-size: 12.5px;
    color: #0f172a;

    transform: scale(\${SCALE});
    transform-origin: bottom right;

    transition:
      max-height .22s cubic-bezier(.4,0,.2,1),
      opacity .22s ease,
      transform .22s cubic-bezier(.4,0,.2,1),
      box-shadow .22s ease;
  }

  .sp-card.sp-collapsed {
    transform: scale(\${SCALE}) translateY(4px);
  }

  .sp-card.sp-collapsed .sp-body {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
  }

  .sp-header {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    border: none;
    background: transparent;
    width: 100%;
  }

  .sp-header-sub {
    font-weight: 600;
    font-size: 14.5px;
    color: #007BFF;
  }

  .sp-live-dot {
    width: 7px;
    height: 7px;
    background: #007BFF;
    border-radius: 999px;
    animation: pulse 1.8s ease-out infinite;
  }

  @keyframes pulse {
    0% { transform: scale(1); opacity: .6; }
    50% { transform: scale(1.25); opacity: 1; }
    100% { transform: scale(1); opacity: .6; }
  }

  .sp-body {
    margin-top: 6px;
    transition:
      max-height .22s cubic-bezier(.4,0,.2,1),
      opacity .22s ease;
  }

  .metric-row {
    display: grid;
    grid-template-columns: 22px 1fr;
    padding: 4px 0;
  }

  .metric-value {
    justify-self: end;
    font-weight: 500;
    max-width: 100px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sp-footer {
    margin-top: 8px;
    text-align: center;
    font-size: 10.2px;
    color: #64748b;
  }
</style>

<div class="sp-card sp-collapsed">
  <button class="sp-header" type="button">
    <span class="sp-header-sub">View — Live</span>
    <span class="sp-live-dot"></span>
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

    header.addEventListener("click", () => {
      collapsed = !collapsed;
      card.classList.toggle("sp-collapsed", collapsed);
      if (!collapsed) sendEvent("widget_open");
    });
  }

  sendEvent("view");
  fetchStats().then(s => createWidget(s || {}));
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
      const d = await request.json();
      await env.DB.prepare(`
        INSERT INTO events (site_id, event_type, listing_id, area, page_path)
        VALUES (?, ?, ?, ?, ?)
      `)
        .bind(d.site_id, d.event_type, d.listing_id ?? null, d.area ?? null, d.page_path || "")
        .run();

      return Response.json({ success: true }, { headers: cors });
    }

    // --------------------------------------------------
    // GET /stats
    // --------------------------------------------------
    if (request.method === "GET" && path === "/stats") {
      const siteId = url.searchParams.get("site_id");

      const views = await env.DB
        .prepare("SELECT COUNT(*) AS c FROM events WHERE site_id=? AND event_type='view'")
        .bind(siteId)
        .first();

      const topListing = await env.DB
        .prepare("SELECT listing_id FROM events WHERE site_id=? AND listing_id IS NOT NULL LIMIT 1")
        .bind(siteId)
        .first();

      const topArea = await env.DB
        .prepare("SELECT area FROM events WHERE site_id=? AND area IS NOT NULL LIMIT 1")
        .bind(siteId)
        .first();

      return Response.json({
        views: views?.c || 0,
        topListing: topListing?.listing_id || null,
        topArea: topArea?.area || null,
      }, { headers: cors });
    }

    return new Response("SMAart View API running", { headers: cors });
  },
};
