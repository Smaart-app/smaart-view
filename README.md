# SMAart View

SMAart View is a free, privacy-first analytics widget for real estate websites.

It shows simple, aggregated visitor insights (views, interest signals) directly on the site —  
without cookies, without user tracking, and without third-party analytics tools.

Production runs on Cloudflare.
This repository is the source-of-truth backup and documentation of the widget.

---

## Project Structure

/pages
├─ index.html # Landing / demo page
├─ demo.html # Demo usage of the widget
├─ admin.html # Internal admin / stats page
├─ get-code.html # Embed code generator / onboarding
├─ styles.css # Shared styles
└─ static/ # Assets (icons, images, etc.)

/worker
├─ worker.js # Cloudflare Worker (API, events, stats)
└─ widget.js # Embed script loaded on external websites

---

## Architecture Overview

- **Cloudflare**  
  Runs the production environment:
  - Cloudflare Worker (API & logic)
  - Widget script delivery
  - Event collection and aggregation

- **GitHub (this repository)**  
  Acts as:
  - Source-of-truth backup
  - Version history
  - Documentation
  - Rollback & recovery point

There is **no automatic deployment** from GitHub to Cloudflare.
All production changes are deployed manually in Cloudflare and then mirrored here.

---

## Privacy & GDPR

SMAart View is designed to be fully privacy-first:

- No cookies
- No IP storage
- No user identification
- No cross-site tracking
- Only anonymous, aggregated events

The widget is safe to embed without consent banners or third-party analytics policies.

---

## Notes

- This repository does **not** power GitHub Pages.
- It is intentionally decoupled from deployment.
- The goal is stability, transparency, and long-term maintainability.

---

© SMAart — Real estate insights, without surveillance.
# smaart-view
Codebase for the SMAart View widget — a free, privacy-first analytics widget for real estate websites.
