const STYLE_ID = 'markbrew-dark-reader-style';

function applyDarkMode(enabled: boolean, bgColor: string, textColor: string, brightness: number) {
  let styleTag = document.getElementById(STYLE_ID) as HTMLStyleElement;

  if (!enabled) {
    if (styleTag) styleTag.remove();
    return;
  }

  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = STYLE_ID;
    // Append to head if possible, otherwise documentElement
    (document.head || document.documentElement).appendChild(styleTag);
  }

  styleTag.textContent = `
    :root {
      --mb-reader-bg: ${bgColor} !important;
      --mb-reader-text: ${textColor} !important;
      --mb-reader-brightness: ${brightness} !important;
    }

    html {
      background-color: var(--mb-reader-bg) !important;
    }

    body {
      background-color: var(--mb-reader-bg) !important;
      color: var(--mb-reader-text) !important;
    }

    /* Global background and text overrides */
    div, section, article, main, header, footer, nav, aside, table, tr, td, th {
      background-color: var(--mb-reader-bg) !important;
      color: var(--mb-reader-text) !important;
      border-color: rgba(255, 255, 255, 0.1) !important;
    }

    /* Text elements */
    h1, h2, h3, h4, h5, h6, p, span, li, a, b, i, strong, em, small, code, pre {
      color: var(--mb-reader-text) !important;
      background-color: transparent !important;
    }

    /* Links */
    a {
      color: #60a5fa !important;
      text-decoration-color: rgba(96, 165, 250, 0.4) !important;
    }

    /* Media handling with improved darkening */
    img, video, canvas, iframe, svg {
      filter: brightness(var(--mb-reader-brightness)) contrast(1.1) !important;
      transition: filter 0.3s ease !important;
    }

    /* Restore brightness on hover for better UX */
    img:hover, video:hover, svg:hover {
      filter: brightness(1) contrast(1) !important;
    }

    /* Specific background-image handling for common containers */
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
chrome.storage.local.get(['readerEnabled', 'readerBg', 'readerText', 'readerBrightness'], (result) => {
  applyDarkMode(
    result.readerEnabled || false,
    result.readerBg || '#1a1a1a',
    result.readerText || '#e5e5e5',
    result.readerBrightness !== undefined ? result.readerBrightness : 0.7
  );
});

// Listen for changes
chrome.storage.onChanged.addListener((_changes, area) => {
  if (area === 'local') {
    chrome.storage.local.get(['readerEnabled', 'readerBg', 'readerText', 'readerBrightness'], (result) => {
      applyDarkMode(
        result.readerEnabled || false,
        result.readerBg || '#1a1a1a',
        result.readerText || '#e5e5e5',
        result.readerBrightness !== undefined ? result.readerBrightness : 0.7
      );
    });
  }
});
