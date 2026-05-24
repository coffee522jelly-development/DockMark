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

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openSnippets") {
    chrome.tabs.create({ url: 'index.html?view=snippets' });
  } else if (info.menuItemId === "saveSnippet" && info.selectionText) {
    const snippet = {
      id: Date.now().toString(),
      text: info.selectionText,
      url: tab?.url || "",
      title: tab?.title || "Untitled",
      timestamp: new Date().toISOString()
    };

    chrome.storage.local.get(["snippets"], (result) => {
      const snippets = result.snippets || [];
      snippets.unshift(snippet);
      chrome.storage.local.set({ snippets }, () => {
        console.log("Snippet saved:", snippet);
      });
    });
  }
});
