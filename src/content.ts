const STYLE_ID = 'markbrew-dark-reader-style';

function applyDarkMode(enabled: boolean, bgColor: string, textColor: string, linkColor: string, brightness: number) {
  let styleTag = document.getElementById(STYLE_ID) as HTMLStyleElement;

  if (!enabled) {
    if (styleTag) styleTag.remove();
    return;
  }

  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = STYLE_ID;
    (document.head || document.documentElement).appendChild(styleTag);
  }

  styleTag.textContent = `
    :root {
      --mb-reader-bg: ${bgColor} !important;
      --mb-reader-text: ${textColor} !important;
      --mb-reader-link: ${linkColor} !important;
      --mb-reader-brightness: ${brightness} !important;
    }

    html, body {
      background-color: var(--mb-reader-bg) !important;
      color: var(--mb-reader-text) !important;
      border-color: rgba(255, 255, 255, 0.1) !important;
    }

    /* Global background and text overrides with exclusion for video players */
    div:not([class*="player"]):not([id*="player"]):not([class*="video"]):not([id*="video"]):not(.ytp-ad-overlay-container),
    section, article, main, header, footer, nav, aside, table, tr, td, th, ul, ol, li, details, summary {
      background-color: var(--mb-reader-bg) !important;
      color: var(--mb-reader-text) !important;
      border-color: rgba(255, 255, 255, 0.1) !important;
      box-shadow: none !important;
      outline-color: rgba(255, 255, 255, 0.1) !important;
    }

    /* Ensure video player components are transparent */
    [class*="player"], [id*="player"], [class*="video"], [id*="video"], .ytp-chrome-bottom, .ytp-chrome-top, .ytp-gradient-bottom, .ytp-gradient-top {
      background-color: transparent !important;
    }

    /* Target specific YouTube controls to keep them visible but dark-ish */
    .ytp-button, .ytp-time-display, .ytp-settings-button {
      color: var(--mb-reader-text) !important;
    }

    /* Text elements */
    h1, h2, h3, h4, h5, h6, p, span, li, b, i, strong, em, small, code, pre {
      color: var(--mb-reader-text) !important;
      background-color: transparent !important;
    }

    /* Links */
    a, a * {
      color: var(--mb-reader-link) !important;
      text-decoration-color: var(--mb-reader-link) !important;
    }

    /* Media handling */
    img, video, canvas, iframe, svg {
      filter: brightness(var(--mb-reader-brightness)) contrast(1.1) !important;
      transition: filter 0.3s ease !important;
      border-color: transparent !important;
    }

    /* Do NOT apply background to video tags directly */
    video {
      background-color: transparent !important;
    }

    img:hover, video:hover, svg:hover {
      filter: brightness(1) contrast(1) !important;
    }

    /* Handle pseudo-elements */
    *:before, *:after {
      background-color: transparent !important;
      color: var(--mb-reader-text) !important;
      border-color: rgba(255, 255, 255, 0.1) !important;
    }

    /* Force hide white backgrounds in icon containers, but check it's not a video component */
    [class*="icon"]:not([class*="player"]), [class*="logo"], .fa, .fas, .far, .fab, .material-icons {
      background-color: transparent !important;
      border-color: transparent !important;
      box-shadow: none !important;
    }

    [style*="background-image"] {
      filter: brightness(var(--mb-reader-brightness)) !important;
    }

    /* Inputs */
    input, textarea, select, button {
      background-color: rgba(255, 255, 255, 0.05) !important;
      color: var(--mb-reader-text) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
    }
  `;
}

// Initial application
chrome.storage.local.get(['readerEnabled', 'readerBg', 'readerText', 'readerLink', 'readerBrightness'], (result) => {
  applyDarkMode(
    result.readerEnabled || false,
    result.readerBg || '#1a1a1a',
    result.readerText || '#e5e5e5',
    result.readerLink || '#60a5fa',
    result.readerBrightness !== undefined ? result.readerBrightness : 0.7
  );
});

// Listen for changes
chrome.storage.onChanged.addListener((_changes, area) => {
  if (area === 'local') {
    chrome.storage.local.get(['readerEnabled', 'readerBg', 'readerText', 'readerLink', 'readerBrightness'], (result) => {
      applyDarkMode(
        result.readerEnabled || false,
        result.readerBg || '#1a1a1a',
        result.readerText || '#e5e5e5',
        result.readerLink || '#60a5fa',
        result.readerBrightness !== undefined ? result.readerBrightness : 0.7
      );
    });
  }
});
