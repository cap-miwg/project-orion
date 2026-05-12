# Project ORION — Website

Static website for **Project ORION**, a standardized network architecture
for Civil Air Patrol field operations.

**Live site:** https://cap-miwg.github.io/project-orion/

## What's here

```
/
├── index.html              Landing page
├── architecture.html       The architecture (federation, IP plan, dial plan, TAK, etc.)
├── calculator.html         Interactive build estimator
├── downloads.html          Brochure download hub
├── kits/
│   ├── index.html          The five kits at a glance
│   ├── core.html           ORION-Core (Kit 001)
│   ├── trailer.html        ORION-Trailer (Kit 002)
│   ├── base.html           ORION-Base (Kit 003)
│   ├── fleet.html          ORION-Fleet (Kit 004)
│   └── air.html            ORION-Air (Kit 005, concept)
├── brochures/              Original 2-page brochure HTMLs (print at 8.5×11 in)
│   ├── Project_ORION_Master_Brochure_source.html
│   ├── Project_ORION_Core_Kit001_source.html
│   ├── Project_ORION_Trailer_Kit002_source.html
│   ├── Project_ORION_Base_Kit003_source.html
│   ├── Project_ORION_Fleet_Kit004_source.html
│   └── Project_ORION_Concept.docx
├── downloads/              Rendered PDFs (see downloads/README.md to generate)
├── assets/
│   ├── css/main.css        Single design-system stylesheet
│   └── js/
│       ├── nav.js          Mobile nav toggle + active-link highlight
│       └── calculator.js   Calculator pricing data + live totals
├── .nojekyll               Disable Jekyll on GitHub Pages
└── README.md               This file
```

## Tech stack

Pure static HTML + CSS + vanilla JavaScript. No build step, no
framework. Hosted on GitHub Pages directly from the repository root.

The design system carries the brochure look — navy/yellow/silver
palette, Poppins + JetBrains Mono fonts, the Orion-constellation SVG,
and the grid background — into a fully responsive web layout. The
layout uses CSS Grid and `clamp()` for fluid typography so it adapts
from phone (~360 px) up to large desktop without breaking.

## Hosting

The site is configured to serve at the GitHub Pages default URL.
In the repo settings:

1. **Settings → Pages**
2. **Source:** Deploy from a branch
3. **Branch:** `main` (or your default), folder `/ (root)`
4. Save. Pages will publish at `https://cap-miwg.github.io/project-orion/`.

The `.nojekyll` file disables Jekyll so files starting with underscores
(none currently, but future-proof) are served verbatim.

## Adding or updating PDFs

See [`downloads/README.md`](downloads/README.md) for the print-to-PDF
recipe. Drop rendered files into `/downloads/` with the filenames the
download cards expect.

## Editing the calculator

Pricing lives at the top of [`assets/js/calculator.js`](assets/js/calculator.js)
in a single `KITS` array. Update the numbers there and the calculator,
totals, and summary all stay consistent.

## Point of contact

SMSgt Luke Bunge, CAP
Director of Information Technology · Michigan Wing Civil Air Patrol
luke.bunge@miwg.cap.gov

---

*Civil Air Patrol · U.S. Air Force Auxiliary · Volunteers Serving America's Communities*
