# SMAart View

**SMAart View** is a privacy-first analytics widget for real estate websites.

It provides simple, aggregated visitor insights (views, attention signals) **directly on the website** —  
without cookies, without user tracking, and without third-party analytics platforms.

SMAart View is designed as the **entry module** of the broader SMAart ecosystem and is currently available as a **free, controlled-access widget**.

Production runs on **Cloudflare**.  
This repository serves as the **architectural reference, documentation source, and manual backup** of the system.

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
└─ widget.js # Embed script served to external websites

---

## Architecture Overview

### Cloudflare (Production Runtime)

Cloudflare hosts and runs the live system.

- **Cloudflare Pages**  
  Serves the public, static surfaces:
  - Landing page
  - Demo page
  - Onboarding / embed code generator

- **Cloudflare Worker**  
  Acts as the runtime backend and handles:
  - Widget delivery
  - Event ingestion
  - Aggregation logic
  - Internal admin endpoints

The Worker is the **runtime source of truth** for all live data and system behavior.

---

### GitHub Repository (This Repository)

This repository is intentionally **not** connected to automatic deployment.

It functions as:

- Architectural reference
- Version history
- Documentation source
- Manual backup & recovery point

All production changes follow this workflow:

1. Changes are deployed manually in Cloudflare  
2. The repository is then updated to mirror the live system

This separation is **intentional** and prioritizes operational safety, clarity, and control.

---

## Admin & Debug Views

`admin.html` is an **internal tool**, intended exclusively for:

- Creator / operator visibility
- Debugging and verification
- System validation

It is **not** part of the public product offering  
and must not be exposed to end users.

---

## Privacy & GDPR

SMAart View is privacy-first by design:

- No cookies
- No IP storage
- No user identification
- No cross-site tracking
- Only anonymous, aggregated events

The widget can be embedded without consent banners  
and without third-party analytics disclosures.

---

## Notes

- This repository does **not** power GitHub Pages.
- It is intentionally decoupled from automated deployment.
- The architecture prioritizes stability, clarity, and long-term maintainability.

---

© SMAart  
Real estate insights — without surveillance.
