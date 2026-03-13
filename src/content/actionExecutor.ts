import { getElement } from './elementTracker';
import type { ActionResult } from '@/shared/types/actions';

export function executeAction(
  actionType: string,
  params: Record<string, unknown>
): ActionResult {
  switch (actionType) {
    case 'click':
      return doClick(params.refId as number);
    case 'type_text':
      return doTypeText(params.refId as number, params.text as string, params.clearFirst as boolean ?? true);
    case 'scroll_page':
      return doScroll(params.direction as string, params.amount as number ?? 500);
    case 'select_option':
      return doSelect(params.refId as number, params.value as string);
    case 'extract_data':
      return doExtract(params.type as string, params.selector as string | undefined);
    default:
      return { success: false, error: `Unknown action: ${actionType}` };
  }
}

function doClick(refId: number): ActionResult {
  const el = getElement(refId);
  if (!el) return { success: false, error: `Element ref=${refId} not found` };
  (el as HTMLElement).click();
  return { success: true };
}

function doTypeText(refId: number, text: string, clearFirst: boolean): ActionResult {
  const el = getElement(refId) as HTMLInputElement | HTMLTextAreaElement | null;
  if (!el) return { success: false, error: `Element ref=${refId} not found` };

  el.focus();
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
}

function doScroll(direction: string, amount: number): ActionResult {
  const x = direction === 'left' ? -amount : direction === 'right' ? amount : 0;
  const y = direction === 'up' ? -amount : direction === 'down' ? amount : 0;
  window.scrollBy({ left: x, top: y, behavior: 'smooth' });
  return { success: true };
}

function doSelect(refId: number, value: string): ActionResult {
  const el = getElement(refId) as HTMLSelectElement | null;
  if (!el) return { success: false, error: `Element ref=${refId} not found` };

  const option = Array.from(el.options).find(
    (o) => o.value === value || o.textContent?.trim() === value
  );
  if (!option) return { success: false, error: `Option "${value}" not found` };

  el.value = option.value;
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return { success: true };
}

function doExtract(type: string, selector?: string): ActionResult {
  const scope = selector ? document.querySelector(selector) ?? document : document;

  switch (type) {
    case 'table': {
      const tables: Record<string, string>[][] = [];
      scope.querySelectorAll('table').forEach((table) => {
        const headers: string[] = [];
        table.querySelectorAll('th').forEach((th) => headers.push(th.textContent?.trim() ?? ''));
        const rows: Record<string, string>[] = [];
        table.querySelectorAll('tbody tr').forEach((tr) => {
          const row: Record<string, string> = {};
          tr.querySelectorAll('td').forEach((td, i) => {
            row[headers[i] || `col_${i}`] = td.textContent?.trim() ?? '';
          });
          rows.push(row);
        });
        tables.push(rows);
      });
      return { success: true, data: tables };
    }
    case 'list': {
      const lists: string[][] = [];
      scope.querySelectorAll('ul, ol').forEach((list) => {
        const items: string[] = [];
        list.querySelectorAll('li').forEach((li) => items.push(li.textContent?.trim() ?? ''));
        lists.push(items);
      });
      return { success: true, data: lists };
    }
    case 'links': {
      const links: { text: string; href: string }[] = [];
      scope.querySelectorAll('a[href]').forEach((a) => {
        links.push({ text: a.textContent?.trim() ?? '', href: (a as HTMLAnchorElement).href });
      });
      return { success: true, data: links };
    }
    case 'text':
      return { success: true, data: (scope as Element).textContent?.trim() ?? '' };
    default:
      return { success: false, error: `Unknown extraction type: ${type}` };
  }
}
