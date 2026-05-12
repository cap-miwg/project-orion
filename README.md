# Project ORION

> **One network. Every mission.** A standardized network architecture for Civil Air Patrol field operations.

**Live site:** https://cap-miwg.github.io/project-orion/

This repository hosts the public website for Project ORION, an architecture of standardized, modular communications kits — Core, Trailer, Base, Fleet, Air — that connect every trailer, mission base, vehicle, aircraft, and field team under one logical fabric.

The site exists to make the program legible to sponsors, partner agencies, and other CAP Wings considering adoption.

## What you'll find here

| Page | What it covers |
| --- | --- |
| **[Overview](https://cap-miwg.github.io/project-orion/)** | Premise, the five kits at a glance, principles, path forward |
| **[The Kits](https://cap-miwg.github.io/project-orion/kits/)** | One page per kit — purpose, metrics, Bill of Materials, add-ons, contact |
| **[Architecture](https://cap-miwg.github.io/project-orion/architecture.html)** | Federation topology, IP plan, dial plan, TAK federation, maturity, open questions |
| **[Calculator](https://cap-miwg.github.io/project-orion/calculator.html)** | Interactive cost estimator — pick kits + add-ons, see one-time and recurring totals |
| **[Downloads](https://cap-miwg.github.io/project-orion/downloads.html)** | Master brochure + per-kit brochures, PDF and HTML |

## Tech notes

Static HTML + CSS + vanilla JavaScript. No build step, no framework, no SaaS lock-in. Hosted on GitHub Pages directly from `main` at the repository root.

The design system mirrors the print brochures — navy/yellow/silver palette, Orion-constellation motif, Poppins + JetBrains Mono — and is fully responsive from ~360 px phone width up to large desktop.

**Editing the calculator:** all pricing lives at the top of [`assets/js/calculator.js`](assets/js/calculator.js) in a single `KITS` array. Update the numbers; the live totals and "max N" caps stay consistent.

**Regenerating PDFs:** see [`downloads/README.md`](downloads/README.md) for the Chrome print-to-PDF recipe. The brochure sources are in [`brochures/`](brochures/).

## Repository layout

```
/
├── index.html              Landing page
├── architecture.html       The architecture (federation, IP plan, TAK, etc.)
├── calculator.html         Interactive build estimator
├── downloads.html          Brochure download hub
├── kits/                   One page per kit
│   ├── index.html          The five kits at a glance
│   ├── core.html           ORION-Core (Kit 001)
│   ├── trailer.html        ORION-Trailer (Kit 002)
│   ├── base.html           ORION-Base (Kit 003)
│   ├── fleet.html          ORION-Fleet (Kit 004)
│   └── air.html            ORION-Air (Kit 005, concept)
├── brochures/              Original 2-page brochure source HTMLs + concept doc
├── downloads/              Rendered PDFs ready to share
├── assets/
│   ├── css/main.css        Shared design-system stylesheet
│   ├── img/favicon.svg     Orion-constellation favicon
│   └── js/
│       ├── nav.js          Mobile-nav toggle + active-link highlight
│       └── calculator.js   Calculator pricing data + live totals
├── robots.txt              Crawler allow-all
├── sitemap.xml             Public page list for search engines
└── .nojekyll               Disable Jekyll on GitHub Pages
```

## Contact

**SMSgt Luke Bunge, CAP** — Director of Information Technology, Michigan Wing
[luke.bunge@miwg.cap.gov](mailto:luke.bunge@miwg.cap.gov)

To support a build, fund a kit, or replicate ORION at another Wing — reach out.

---

*Civil Air Patrol · U.S. Air Force Auxiliary · Volunteers Serving America's Communities*
