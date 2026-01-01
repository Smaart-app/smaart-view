export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // --------------------------------------------------
    // INTERNAL DEBUG ENDPOINT (ADMIN ONLY)
    // Used for internal verification during development.
    // Not part of the public API. Read-only.
    // --------------------------------------------------
    if (path === "/debug/events") {
      // Optional feature flag for extra safety
      if (env.DEBUG_ENABLED !== "true") {
        return new Response("Not found", { status: 404 });
      }

      const token = url.searchParams.get("token");
      const siteId = url.searchParams.get("site_id");

      if (!token || token !== env.ADMIN_TOKEN) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      if (!siteId) {
        return new Response(
          JSON.stringify({ error: "Missing site_id" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      try {
        const events = {};

        // Views
        const views = await env.DB
          .prepare(
            "SELECT path, COUNT(*) as count FROM events WHERE site_id = ? AND event_type = 'view' GROUP BY path"
          )
          .bind(siteId)
          .all();

        events.view = {};
        for (const row of views.results) {
          events.view[row.path] = row.count;
        }

        // Area interest
        const areas = await env.DB
          .prepare(
            "SELECT area, COUNT(*) as count FROM events WHERE site_id = ? AND event_type = 'area_interest' GROUP BY area"
          )
          .bind(siteId)
          .all();

        if (areas.results.length > 0) {
          events.area_interest = {};
          for (const row of areas.results) {
            events.area_interest[row.area] = row.count;
          }
        }

        // Listing clicks
        const listings = await env.DB
          .prepare(
            "SELECT listing_id, COUNT(*) as count FROM events WHERE site_id = ? AND event_type = 'click_listing' GROUP BY listing_id"
          )
          .bind(siteId)
          .all();

        if (listings.results.length > 0) {
          events.click_listing = {};
          for (const row of listings.results) {
            events.click_listing[row.listing_id] = row.count;
          }
        }

        return new Response(
          JSON.stringify({ site_id: siteId, events }, null, 2),
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "Debug query failed" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // --------------------------------------------------
    // EVENT INGESTION ENDPOINT
    // --------------------------------------------------
    if (path === "/events" && request.method === "POST") {
      try {
        const body = await request.json();

        const {
          site_id,
          event_type,
          path: pagePath,
          area,
          listing_id,
        } = body;

        if (!site_id || !event_type) {
          return new Response("Bad request", { status: 400 });
        }

        await env.DB
          .prepare(
            "INSERT INTO events (site_id, event_type, path, area, listing_id, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))"
          )
          .bind(
            site_id,
            event_type,
            pagePath || null,
            area || null,
            listing_id || null
          )
          .run();

        return new Response("OK", { status: 200 });
      } catch (err) {
        return new Response("Server error", { status: 500 });
      }
    }

    // --------------------------------------------------
    // FALLBACK
    // --------------------------------------------------
    return new Response("SMAart View API running", { status: 200 });
  },
};
