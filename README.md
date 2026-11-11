# Boolio

Boolio is a logic puzzle game built with Vue 3, TypeScript, and Vite.

## Development

1. Use the pinned Node version:
	- `nvm use`
2. Install dependencies:
	- `npm install`
3. Start local development:
	- `npm run dev`

## Quality Checks

- Build: `npm run build`
- Tests: `npm run test`

## Responsive Support Policy

The app is optimized for modern evergreen browsers (latest two versions) across these device classes:

- Phones: 320px and up
- Tablets: 768px and up
- Laptops: 1024px and up
- Desktops: 1280px and up
- TVs / ultra-wide displays: 1920px and up

### UX Expectations Across Sizes

- Layout scales progressively from a stacked mobile flow to multi-column desktop and TV layouts.
- Dense controls adapt based on available container width using container queries.
- Control targets maintain touch and remote-friendly sizing.
- Keyboard navigation remains fully supported for operation selection, answer selection, and action buttons.
- Reduced-motion preferences are respected.

## Manual Responsive QA Matrix

Validate these widths during UI changes: 320, 375, 414, 768, 1024, 1280, 1440, 1920, and 2560.

At each width, verify:

- No page-level horizontal scrolling.
- Puzzle flow is completable with keyboard only.
- Focus states are visible on all interactive controls.
- Feedback text and score remain readable and unclipped.
