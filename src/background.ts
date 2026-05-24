/// <reference types="chrome" />

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-snippet",
    title: "スニペットを保存 (DockMark)",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-snippet" && info.selectionText) {
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
        // Optional: Notify the user if we have a way to do so
      });
    });
  }
});
