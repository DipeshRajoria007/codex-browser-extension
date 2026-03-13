import type { ActionResult } from '@/shared/types/actions';

export async function takeScreenshot(tabId: number): Promise<ActionResult> {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.windowId) return { success: false, error: 'Tab has no window' };

    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: 'png',
      quality: 80,
    });

    return { success: true, screenshot: dataUrl };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
