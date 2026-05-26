/// <reference types="chrome" />

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["tabHistory", "autoRestoreEnabled"], (result) => {
    // Default to true if not set, or check user preference
    if (result.autoRestoreEnabled !== false && result.tabHistory && result.tabHistory.length > 0) {
      const latest = result.tabHistory[0];
      latest.tabs.forEach((t: { url: string }) => {
        chrome.tabs.create({ url: t.url });
      });
    }
  });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveSnippet",
    title: "スニペットを保存 (DockMark)",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "openSnippets",
    title: "スニペット一覧を開く (DockMark)",
    contexts: ["all"]
  });

  chrome.contextMenus.create({
    id: "groupTabsByDomain",
    title: "同一ドメインをタブグループにする (DockMark)",
    contexts: ["all"]
  });

  chrome.contextMenus.create({
    id: "saveTabState",
    title: "現在のタブの状態を保存する (DockMark)",
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "saveTabState") {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const tabData = tabs.map(t => ({
      title: t.title || "Untitled",
      url: t.url || ""
    })).filter(t => t.url);

    const historyEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      tabs: tabData
    };

    chrome.storage.local.get(["tabHistory"], (result) => {
      const history = result.tabHistory || [];
      history.unshift(historyEntry);
      // Keep only 10 items
      const trimmedHistory = history.slice(0, 10);
      chrome.storage.local.set({ tabHistory: trimmedHistory });
    });

  } else if (info.menuItemId === "groupTabsByDomain") {
    const tabs = await chrome.tabs.query({ currentWindow: true });

    // Group tabs by domain
    const groups: Record<string, number[]> = {};

    tabs.forEach(t => {
      if (t.url && t.id) {
        try {
          const url = new URL(t.url);
          const domain = url.hostname;
          if (domain) {
            if (!groups[domain]) groups[domain] = [];
            groups[domain].push(t.id);
          }
        } catch (e) {
          // Ignore invalid URLs
        }
      }
    });

    // Create groups for domains with multiple tabs
    for (const domain in groups) {
      const tabIds = groups[domain];
      if (tabIds.length > 1) {
        try {
          const groupId = await chrome.tabs.group({ tabIds });
          await chrome.tabGroups.update(groupId, {
            title: domain,
            collapsed: false
          });
        } catch (e) {
          console.error(`Failed to group tabs for ${domain}`, e);
        }
      }
    }

    // Optional: Sort tabs by domain to keep groups together
    // This part moves all tabs of the same domain next to each other
    let currentPos = 0;
    const sortedDomains = Object.keys(groups).sort();
    for (const domain of sortedDomains) {
      const tabIds = groups[domain];
      for (const tabId of tabIds) {
        await chrome.tabs.move(tabId, { index: currentPos++ });
      }
    }

  } else if (info.menuItemId === "openSnippets") {
    chrome.tabs.create({ url: 'index.html?view=snippets' });
  } else if (info.menuItemId === "saveSnippet" && tab?.id) {
    // Using scripting.executeScript to get the selected text directly from the page.
    // This often preserves newlines better than info.selectionText which can be normalized by the browser.
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const selection = window.getSelection();
          return selection ? selection.toString() : "";
        }
      });

      const selectedText = results[0].result || info.selectionText || "";

      const snippet = {
        id: Date.now().toString(),
        text: selectedText,
        url: tab?.url || "",
        title: tab?.title || "Untitled",
        timestamp: new Date().toISOString()
      };

      chrome.storage.local.get(["snippets"], (result) => {
        const snippets = result.snippets || [];
        snippets.unshift(snippet);
        chrome.storage.local.set({ snippets }, () => {
          console.log("Snippet saved with preserved formatting:", snippet);
        });
      });
    } catch (err) {
      console.error("Failed to extract text via script, falling back to info.selectionText", err);
      // Fallback
      const snippet = {
        id: Date.now().toString(),
        text: info.selectionText || "",
        url: tab?.url || "",
        title: tab?.title || "Untitled",
        timestamp: new Date().toISOString()
      };

      chrome.storage.local.get(["snippets"], (result) => {
        const snippets = result.snippets || [];
        snippets.unshift(snippet);
        chrome.storage.local.set({ snippets });
      });
    }
  }
});
