export async function createTab(url?: string): Promise<chrome.tabs.Tab> {
  return chrome.tabs.create({ url: url ?? 'about:blank', active: true });
}

export async function closeTab(tabId: number): Promise<void> {
  await chrome.tabs.remove(tabId);
}

export async function switchToTab(tabId: number): Promise<void> {
  await chrome.tabs.update(tabId, { active: true });
  const tab = await chrome.tabs.get(tabId);
  if (tab.windowId) {
    await chrome.windows.update(tab.windowId, { focused: true });
  }
}

export async function listTabs(): Promise<chrome.tabs.Tab[]> {
  return chrome.tabs.query({});
}

export async function groupTabs(
  tabIds: number[],
  title?: string
): Promise<number> {
  const groupId = await chrome.tabs.group({ tabIds });
  if (title) {
    await chrome.tabGroups.update(groupId, { title });
  }
  return groupId;
}
