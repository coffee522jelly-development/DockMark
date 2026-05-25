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
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "openSnippets") {
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
