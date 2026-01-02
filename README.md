# SMAart View

SMAart View is a privacy-first analytics widget for real estate websites.

It provides simple, aggregated visitor insights (views, attention signals) **directly on the website** —  
without cookies, without user tracking, and without third-party analytics platforms.

SMAart View is designed as the **entry module** of the broader SMAart ecosystem and is currently available as a free, controlled-access widget.

Production runs on **Cloudflare**.  
This repository serves as the **architectural reference, backup, and documentation source**.

---

## Project Structure

/pages
├─ index.html # Landing page
├─ demo.html # Public demo (real integration example)
├─ get-code.html # Embed code generator / onboarding
├─ admin.html # Internal admin & debug view (not public product)
├─ styles.css # Shared styles
└─ static/ # Assets (icons, images, OG assets)

/worker
├─ worker.js # Cloudflare Worker (API, events, aggregation)
└─ widget.js # Embed script loaded on external websites

---

## Architecture Overview

### Cloudflare (Production Runtime)

Cloudflare hosts and runs the live system:

- **Cloudflare Pages**  
  Serves the public, static surfaces (landing, demo, onboarding).

- **Cloudflare Worker**  
  Handles:
  - Widget delivery
  - Event ingestion
  - Aggregation logic
  - Internal admin endpoints

The Worker is the **runtime source of truth** for all live data and behavior.

---

### GitHub Repository (This Repo)

This repository acts as:

- Architectural reference
- Version history
- Documentation
- Manual backup & recovery point

There is **no automatic deployment** from GitHub to Cloudflare.

All production changes are:
1. Deployed manually in Cloudflare  
2. Then mirrored here to keep the repository in sync

This separation is intentional and ensures operational safety.

---

## Admin & Debug Views

`admin.html` is an **internal tool** intended exclusively for:

- Creator / operator visibility
- Debugging and verification
- System validation

It is **not** part of the public product offering and should not be exposed to end users.

---

## Privacy & GDPR

SMAart View is designed to be fully privacy-first by default:

- No cookies
- No IP storage
- No user identification
- No cross-site tracking
- Only anonymous, aggregated events

The widget can be embedded without consent banners or third-party analytics disclosures.

---

## Notes

- This repository does **not** power GitHub Pages.
- It is intentionally decoupled from automated deployment.
- The architecture prioritizes stability, clarity, and long-term maintainability.

---

© SMAart  
Real estate insights — without surveillance.