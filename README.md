# WebSurf Helper

A Chrome extension that makes web surfing more comfortable with three small features:

1. **Double-click a link** to open it in a new tab. Foreground / background is configurable.
2. **Custom scroll amount** for the Up / Down arrow keys (default: half a viewport — between a single line and PageUp/PageDown).
3. **Custom new tab URL** — open a fixed URL when you create a new tab (default: Google Search AI Mode).

## Requirements

- Google Chrome (or any Chromium browser) supporting **Manifest V3**.

## Installation (Unpacked)

1. Open `chrome://extensions/`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** and select this directory (`websurf-helper/`).
4. The extension is now active on all pages.

## Configuration

Open the extension's **Options** (from `chrome://extensions/` → "Details" → "Extension options", or click the extension icon → options).

| Setting | Default | Description |
|---------|---------|-------------|
| Double-click to open in new tab | ON | Enable / disable the link double-click feature |
| Open new tab in foreground | OFF | If OFF, new tabs open in the background |
| Custom arrow-key scroll | ON | Enable / disable the scroll feature |
| Scroll ratio | 0.5 | Fraction of viewport scrolled per key press (0.1 – 1.0) |
| Custom new tab URL | OFF | Enable / disable redirecting new tabs to a fixed URL |
| New tab URL | `https://www.google.com/search?udm=50` | URL opened when a new tab is created |

## Notes

- Arrow-key scrolling is suppressed while focus is in `<input>`, `<textarea>`, `<select>`, or any `contenteditable` element.
- Modifier keys (Ctrl / Shift / Alt / Cmd) bypass the custom scroll so site- and browser-specific shortcuts keep working.
- Anchors with `javascript:` and pure in-page hashes (`#...`) are ignored by the double-click handler.
- The new tab page is overridden via `chrome_url_overrides`. When the feature is OFF, the new tab opens regular Google Search (`https://www.google.com`).

## License

MIT
