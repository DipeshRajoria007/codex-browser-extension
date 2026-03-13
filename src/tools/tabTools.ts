import type { ActionResult } from '@/shared/types/actions';

export async function executeManageTabs(params: {
  action: string;
  url?: string;
  tabId?: number;
  tabIds?: number[];
  groupName?: string;
}): Promise<ActionResult> {
  try {
    switch (params.action) {
      case 'create': {
        const tab = await chrome.tabs.create({ url: params.url ?? 'about:blank' });
        return { success: true, data: { tabId: tab.id, url: tab.url } };
      }

      case 'close': {
        if (!params.tabId) return { success: false, error: 'tabId required for close' };
        await chrome.tabs.remove(params.tabId);
        return { success: true };
      }

      case 'switch': {
        if (!params.tabId) return { success: false, error: 'tabId required for switch' };
        await chrome.tabs.update(params.tabId, { active: true });
        const tab = await chrome.tabs.get(params.tabId);
        if (tab.windowId) await chrome.windows.update(tab.windowId, { focused: true });
        return { success: true };
      }

      case 'list': {
        const tabs = await chrome.tabs.query({});
        const tabData = tabs.map((t) => ({
          id: t.id,
          title: t.title,
          url: t.url,
          active: t.active,
        }));
        return { success: true, data: tabData };
      }

      case 'group': {
        if (!params.tabIds?.length) return { success: false, error: 'tabIds required for group' };
        const groupId = await chrome.tabs.group({ tabIds: params.tabIds });
        if (params.groupName) {
          await chrome.tabGroups.update(groupId, { title: params.groupName });
        }
        return { success: true, data: { groupId } };
      }

      default:
        return { success: false, error: `Unknown tab action: ${params.action}` };
    }
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
