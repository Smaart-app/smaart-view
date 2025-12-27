// SMAart View — Widget (Final Premium Version) 
// Collapse/Expand restored exactly like original widget(4).js
// View — Live • centered
// Icons v8.1 preserved • Footer preserved

(function () {
  const script = document.currentScript;
  if (!script) return;

  const siteId =
    script.getAttribute("data-site-id") ||
    script.getAttribute("data-site") ||
    "default";

  const API_BASE =
    script.getAttribute("data-api-base") ||
    "https://pulse-api.anna-fokidou.workers.dev";

  function sendViewEvent() {
    try {
      fetch(API_BASE + "/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_id: siteId,
          event_type: "view",
          page_path: window.location.pathname || ""
        }),
        keepalive: true
      }).catch(() => {});
    } catch (_) {}
  }

  function fetchStats() {
    return fetch(
      API_BASE + "/stats?site_id=" + encodeURIComponent(siteId)
    )
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }

  const VALUE = (v) => (v && v !== "" ? v : "—");

  // ICONS — preserved exactly
  const ICON_EYE = `
<svg width="17" height="17" viewBox="0 0 24 24" fill="none"
 stroke="#475569" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="2.3"></circle>
  <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"></path>
</svg>`;

  const ICON_HOUSE = `
<svg width="18" height="18" viewBox="0 0 80 58" fill="none"
 stroke="#475569" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round">
  <g transform="translate(-9.271 -8.125) scale(0.92)">
    <path d="M20.89 47.502V66.125H78.545V30.193H89.271L55.304 8.125 9.271 47.502H20.89Z"/>
  </g>
</svg>`;

  const ICON_PIN = `
<svg width="17" height="17" viewBox="0 0 24 24" fill="none"
 stroke="#475569" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 21s7-5 7-11a7 7 0 10-14 0c0 6 7 11 7 11z"></path>
  <circle cx="12" cy="10" r="2.7"></circle>
</svg>`;

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

    shadow.innerHTML = `
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
      ${ICON_EYE}
      <span class="metric-value">${views}</span>
    </div>

    <div class="metric-row">
      ${ICON_HOUSE}
      <span class="metric-value">${topListing}</span>
    </div>

    <div class="metric-row">
      ${ICON_PIN}
      <span class="metric-value">${topArea}</span>
    </div>

    <div class="sp-footer">
      Powered by SMAart • 2026
    </div>
  </div>
</div>
`;

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
      collapsed = !collapsed;
      sync();
    });

    sync();
  }

  sendViewEvent();
  fetchStats().then((s) => createWidget(s || {}));
})();
