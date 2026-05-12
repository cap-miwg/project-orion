# PDF Downloads

This folder holds the rendered brochure PDFs that the `downloads.html`
page links to. The expected filenames are:

- `Project_ORION_Master_Brochure.pdf`
- `Project_ORION_Kit001_Core_Brochure.pdf`
- `Project_ORION_Kit002_Trailer_Brochure.pdf`
- `Project_ORION_Kit003_Base_Brochure.pdf`
- `Project_ORION_Kit004_Fleet_Brochure.pdf`

## Regenerating a PDF

The brochure source HTMLs live in `/brochures/`. Each is a single,
self-contained file (CSS inline, designed for 8.5 × 11 in letter).

1. Open the source HTML in **Google Chrome** (Chrome respects the
   `@page { size: 8.5in 11in; margin: 0; }` CSS rule).
2. **File → Print** (or `Cmd/Ctrl + P`).
3. Destination: **Save as PDF**.
4. Paper size: **Letter**.
5. Margins: **None**.
6. Background graphics: **On** (critical — the dark cover needs it).
7. Save with one of the filenames listed above, overwriting the
   existing PDF.
8. Commit and push.

> The HTML files in `/brochures/` are also linked from the downloads
> page as "View HTML" so readers can print to PDF themselves if a
> particular file is being refreshed.
