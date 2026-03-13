import type { ActionResult } from '@/shared/types/actions';

export async function executeNavigate(
  tabId: number,
  params: { url: string }
): Promise<ActionResult> {
  try {
    let url = params.url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    await chrome.tabs.update(tabId, { url });
    // Wait for page load
    await new Promise<void>((resolve) => {
      const listener = (
        updatedTabId: number,
        info: chrome.tabs.TabChangeInfo
      ) => {
        if (updatedTabId === tabId && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
      setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }, 10000);
    });
    return { success: true, data: { url } };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function executeClick(
  tabId: number,
  params: { refId: number }
): Promise<ActionResult> {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: (refId: number) => {
        const tracker = (window as unknown as { __codexElements: Map<number, WeakRef<Element>> }).__codexElements;
        if (!tracker) return { success: false, error: 'Element tracker not initialized' };
        const ref = tracker.get(refId);
        const el = ref?.deref();
        if (!el) return { success: false, error: `Element with ref ${refId} not found or was removed` };
        (el as HTMLElement).click();
        return { success: true };
      },
      args: [params.refId],
    });
    return results[0]?.result as ActionResult ?? { success: false, error: 'Script execution failed' };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function executeTypeText(
  tabId: number,
  params: { refId: number; text: string; clearFirst?: boolean }
): Promise<ActionResult> {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: (refId: number, text: string, clearFirst: boolean) => {
        const tracker = (window as unknown as { __codexElements: Map<number, WeakRef<Element>> }).__codexElements;
        if (!tracker) return { success: false, error: 'Element tracker not initialized' };
        const ref = tracker.get(refId);
        const el = ref?.deref() as HTMLInputElement | HTMLTextAreaElement | null;
        if (!el) return { success: false, error: `Element with ref ${refId} not found` };

        el.focus();

        // Use native value setter trick for React compatibility
        const nativeSetter =
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set ??
          Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;

        if (nativeSetter) {
          nativeSetter.call(el, clearFirst ? text : el.value + text);
        } else {
          el.value = clearFirst ? text : el.value + text;
        }

        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));

        return { success: true };
      },
      args: [params.refId, params.text, params.clearFirst ?? true],
    });
    return results[0]?.result as ActionResult ?? { success: false, error: 'Script execution failed' };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function executeScroll(
  _tabId: number,
  params: { direction: string; amount?: number }
): Promise<ActionResult> {
  try {
    const amount = params.amount ?? 500;
    const results = await chrome.scripting.executeScript({
      target: { tabId: _tabId },
      func: (dir: string, amt: number) => {
        const x = dir === 'left' ? -amt : dir === 'right' ? amt : 0;
        const y = dir === 'up' ? -amt : dir === 'down' ? amt : 0;
        window.scrollBy({ left: x, top: y, behavior: 'smooth' });
        return { success: true };
      },
      args: [params.direction, amount],
    });
    return results[0]?.result as ActionResult ?? { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function executeSelectOption(
  tabId: number,
  params: { refId: number; value: string }
): Promise<ActionResult> {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: (refId: number, value: string) => {
        const tracker = (window as unknown as { __codexElements: Map<number, WeakRef<Element>> }).__codexElements;
        if (!tracker) return { success: false, error: 'Element tracker not initialized' };
        const ref = tracker.get(refId);
        const el = ref?.deref() as HTMLSelectElement | null;
        if (!el) return { success: false, error: `Element with ref ${refId} not found` };

        const option = Array.from(el.options).find(
          (o) => o.value === value || o.textContent?.trim() === value
        );
        if (!option) return { success: false, error: `Option "${value}" not found` };

        el.value = option.value;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return { success: true };
      },
      args: [params.refId, params.value],
    });
    return results[0]?.result as ActionResult ?? { success: false, error: 'Script execution failed' };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function executeWaitForElement(
  tabId: number,
  params: { selector: string; timeout?: number }
): Promise<ActionResult> {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: (selector: string, timeout: number) => {
        return new Promise<{ success: boolean; error?: string }>((resolve) => {
          const el = document.querySelector(selector);
          if (el) {
            resolve({ success: true });
            return;
          }
          const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
              observer.disconnect();
              resolve({ success: true });
            }
          });
          observer.observe(document.body, { childList: true, subtree: true });
          setTimeout(() => {
            observer.disconnect();
            resolve({ success: false, error: `Timeout waiting for "${selector}"` });
          }, timeout);
        });
      },
      args: [params.selector, params.timeout ?? 5000],
    });
    return results[0]?.result as ActionResult ?? { success: false, error: 'Script execution failed' };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
