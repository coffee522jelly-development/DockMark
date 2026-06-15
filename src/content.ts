const STYLE_ID = 'markbrew-dark-reader-style';

function applyDarkMode(enabled: boolean, bgColor: string, textColor: string, linkColor: string, brightness: number, videoOpacity: number) {
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
      --mb-reader-video-opacity: ${videoOpacity} !important;
    }

    html, body {
      background-color: var(--mb-reader-bg) !important;
      color: var(--mb-reader-text) !important;
      border-color: var(--mb-reader-bg) !important;
    }

    /* Global background and text overrides with extremely strict exclusion for any media containers */
    div:not([class*="player"]):not([id*="player"]):not([class*="video"]):not([id*="video"]):not([class*="ytp-"]):not([id*="ytp-"]):not([class*="vjs-"]):not([class*="jw-"]):not([class*="plyr"]):not(:has(video)):not(:has(iframe)),
    section:not(:has(video)):not(:has(iframe)),
    article:not(:has(video)):not(:has(iframe)),
    main, header, footer, nav, aside, table, tr, td, th, ul, ol, li, details, summary {
      background-color: var(--mb-reader-bg) !important;
      color: var(--mb-reader-text) !important;
      border-color: var(--mb-reader-bg) !important;
      box-shadow: none !important;
      outline-color: var(--mb-reader-bg) !important;
    }

    /* Force transparency on ALL elements within a suspected player or containing media */
    [class*="player"], [id*="player"], [class*="video"], [id*="video"], [class*="ytp-"], [id*="ytp-"],
    [class*="player"] *, [id*="player"] *, [class*="video"] *, [id*="video"] *, [class*="ytp-"] *, [id*="ytp-"] *,
    video, iframe, canvas, .ytp-chrome-bottom, .ytp-gradient-bottom, .ytp-gradient-top {
      background-color: transparent !important;
    }

    /* Specifically ensure video overlays and ads don't get covered */
    .ytp-ad-overlay-container, .ytp-ad-image-overlay, .ytp-iv-video-content, .ytp-upnext {
      background-color: transparent !important;
    }

    /* Target specific controls to keep them readable but non-blocking */
    .ytp-button, .ytp-time-display, .ytp-settings-button, .ytp-volume-panel, .ytp-fullscreen-button {
      color: var(--mb-reader-text) !important;
      background: transparent !important;
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

    /* Media handling - specifically excludes video from filters to avoid double-dimming */
    img, canvas, iframe, svg {
      filter: brightness(var(--mb-reader-brightness)) contrast(1.1) !important;
      transition: filter 0.3s ease !important;
      border-color: transparent !important;
    }

    /* Videos use opacity as per user request */
    video {
      filter: none !important;
      opacity: var(--mb-reader-video-opacity) !important;
      transition: opacity 0.3s ease !important;
    }

    img:hover, svg:hover {
      filter: brightness(1) contrast(1) !important;
    }

    video:hover {
      opacity: 1 !important;
    }

    /* Handle pseudo-elements */
    *:before, *:after {
      background-color: transparent !important;
      color: var(--mb-reader-text) !important;
      border-color: var(--mb-reader-bg) !important;
    }

    /* Force hide white backgrounds in icon containers */
    [class*="icon"]:not([class*="player"]):not([class*="ytp-"]), [class*="logo"], .fa, .fas, .far, .fab, .material-icons {
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
chrome.storage.local.get(['readerEnabled', 'readerBg', 'readerText', 'readerLink', 'readerBrightness', 'readerVideoOpacity'], (result) => {
  applyDarkMode(
    result.readerEnabled || false,
    result.readerBg || '#1a1a1a',
    result.readerText || '#e5e5e5',
    result.readerLink || '#60a5fa',
    result.readerBrightness !== undefined ? result.readerBrightness : 0.7,
    result.readerVideoOpacity !== undefined ? result.readerVideoOpacity : 0.8
  );
});

// Listen for changes
chrome.storage.onChanged.addListener((_changes, area) => {
  if (area === 'local') {
    chrome.storage.local.get(['readerEnabled', 'readerBg', 'readerText', 'readerLink', 'readerBrightness', 'readerVideoOpacity'], (result) => {
      applyDarkMode(
        result.readerEnabled || false,
        result.readerBg || '#1a1a1a',
        result.readerText || '#e5e5e5',
        result.readerLink || '#60a5fa',
        result.readerBrightness !== undefined ? result.readerBrightness : 0.7,
        result.readerVideoOpacity !== undefined ? result.readerVideoOpacity : 0.8
      );
    });
  }
});
