/// <reference types="chrome" />

const CONTEXT_MENUS = [
  { id: "saveSnippet", title: "スニペットを保存 (MarkBrew)", contexts: ["selection"] as chrome.contextMenus.ContextType[] },
  { id: "openSnippets", title: "スニペット一覧を開く (MarkBrew)", contexts: ["all"] as chrome.contextMenus.ContextType[] },
  { id: "groupTabsByDomain", title: "同一ドメインをタブグループにする (MarkBrew)", contexts: ["all"] as chrome.contextMenus.ContextType[] },
  { id: "saveTabState", title: "現在のタブの状態を保存する (MarkBrew)", contexts: ["all"] as chrome.contextMenus.ContextType[] }
];

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["tabHistory", "autoRestoreEnabled"], (result) => {
    if (result.autoRestoreEnabled !== false && result.tabHistory && result.tabHistory.length > 0) {
      const latest = result.tabHistory[0];
      latest.tabs.forEach((t: { url: string }) => {
        chrome.tabs.create({ url: t.url });
      });
    }
  });
});

chrome.runtime.onInstalled.addListener(() => {
  CONTEXT_MENUS.forEach(menu => {
    chrome.contextMenus.create(menu);
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  switch (info.menuItemId) {
    case "saveTabState":
      await handleSaveTabState();
      break;
    case "groupTabsByDomain":
      await handleGroupTabsByDomain();
      break;
    case "openSnippets":
      chrome.tabs.create({ url: 'index.html?view=snippets' });
      break;
    case "saveSnippet":
      if (tab?.id) await handleSaveSnippet(info, tab);
      break;
  }
});

async function handleSaveTabState() {
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
    chrome.storage.local.set({ tabHistory: history.slice(0, 10) });
  });
}

async function handleGroupTabsByDomain() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const groups: Record<string, number[]> = {};

  tabs.forEach(t => {
    if (t.url && t.id) {
      try {
        const domain = new URL(t.url).hostname;
        if (domain) {
          if (!groups[domain]) groups[domain] = [];
          groups[domain].push(t.id);
        }
      } catch (e) {}
    }
  });

  for (const domain in groups) {
    const tabIds = groups[domain];
    if (tabIds.length > 1) {
      const groupId = await chrome.tabs.group({ tabIds });
      await chrome.tabGroups.update(groupId, { title: domain, collapsed: false });
    }
  }

  let currentPos = 0;
  const sortedDomains = Object.keys(groups).sort();
  for (const domain of sortedDomains) {
    for (const tabId of groups[domain]) {
      await chrome.tabs.move(tabId, { index: currentPos++ });
    }
  }
}

async function handleSaveSnippet(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: () => window.getSelection()?.toString() || ""
    });

    const selectedText = results[0].result || info.selectionText || "";
    const snippet = {
      id: Date.now().toString(),
      text: selectedText,
      url: tab.url || "",
      title: tab.title || "Untitled",
      timestamp: new Date().toISOString()
    };

    chrome.storage.local.get(["snippets"], (result) => {
      const snippets = result.snippets || [];
      snippets.unshift(snippet);
      chrome.storage.local.set({ snippets });
    });
  } catch (err) {
    console.error("Failed to extract text", err);
  }
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'pomodoroTimer') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'favicon.svg',
      title: 'MarkBrew Timer',
      message: 'タイマーが終了しました！ / Timer finished!',
      priority: 2
    });

    // Clear the active timer state
    chrome.storage.local.get(['timerState'], (result) => {
      const state = result.timerState || {};
      chrome.storage.local.set({ timerState: { ...state, endTime: null, isActive: false } });
    });
  }
});
