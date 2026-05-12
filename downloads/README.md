# PDF Downloads

This folder is where the rendered PDF brochures live. The site's
`downloads.html` page links to these filenames:

- `Project_ORION_Master.pdf`
- `Project_ORION_Core_Kit001.pdf`
- `Project_ORION_Trailer_Kit002.pdf`
- `Project_ORION_Base_Kit003.pdf`
- `Project_ORION_Fleet_Kit004.pdf`

## How to generate the PDFs

The brochure source HTMLs live in `/brochures/`. Each is a single,
self-contained file (CSS inline, designed for 8.5 × 11 in letter).

1. Open the source HTML in **Google Chrome** (Chrome respects the
   `@page { size: 8.5in 11in; margin: 0; }` CSS rule).
2. **File → Print** (or `Cmd/Ctrl + P`).
3. Destination: **Save as PDF**.
4. Paper size: **Letter**.
5. Margins: **None**.
6. Background graphics: **On** (critical — the dark cover needs it).
7. Save with the filename listed above.
8. Drop the PDF into this folder and commit.

That's it. The download links on `/downloads.html` will then resolve.

> The HTML files in `/brochures/` are also linked directly from the
> downloads page as "View HTML" — readers can print to PDF themselves
> if a particular file isn't yet rendered.
