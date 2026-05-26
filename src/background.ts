/// <reference types="chrome" />

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
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "groupTabsByDomain") {
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
