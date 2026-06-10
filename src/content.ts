const STYLE_ID = 'markbrew-dark-reader-style';

function applyDarkMode(enabled: boolean, bgColor: string, textColor: string) {
  let styleTag = document.getElementById(STYLE_ID) as HTMLStyleElement;

  if (!enabled) {
    if (styleTag) styleTag.remove();
    return;
  }

  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = STYLE_ID;
    document.head.appendChild(styleTag);
  }

  styleTag.textContent = `
    :root {
      --markbrew-bg: ${bgColor} !important;
      --markbrew-text: ${textColor} !important;
    }
    html {
      background-color: var(--markbrew-bg) !important;
      filter: contrast(100%) !important;
    }
    body {
      background-color: var(--markbrew-bg) !important;
      color: var(--markbrew-text) !important;
    }
    /* Intelligent Background Handling */
    div, section, article, main, header, footer, nav, aside, table, tr, td, th {
      background-color: var(--markbrew-bg) !important;
      color: var(--markbrew-text) !important;
      border-color: rgba(255, 255, 255, 0.1) !important;
    }
    /* Text elements */
    h1, h2, h3, h4, h5, h6, p, span, li, a, b, i, strong, em, small, code, pre {
      color: var(--markbrew-text) !important;
      background-color: transparent !important;
    }
    /* Links */
    a {
      color: #60a5fa !important; /* Lighter blue for dark mode */
      text-decoration-color: rgba(96, 165, 250, 0.4) !important;
    }
    /* Media */
    img, video, canvas, iframe {
      filter: brightness(0.8) contrast(1.1) !important;
    }
    /* Inputs */
    input, textarea, select, button {
      background-color: rgba(255, 255, 255, 0.05) !important;
      color: var(--markbrew-text) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
    }
  `;
}

// Initial application
chrome.storage.local.get(['readerEnabled', 'readerBg', 'readerText'], (result) => {
  applyDarkMode(
    result.readerEnabled || false,
    result.readerBg || '#1a1a1a',
    result.readerText || '#e5e5e5'
  );
});

// Listen for changes
chrome.storage.onChanged.addListener((_changes, area) => {
  if (area === 'local') {
    chrome.storage.local.get(['readerEnabled', 'readerBg', 'readerText'], (result) => {
      applyDarkMode(
        result.readerEnabled || false,
        result.readerBg || '#1a1a1a',
        result.readerText || '#e5e5e5'
      );
    });
  }
});
