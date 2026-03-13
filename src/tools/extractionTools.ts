import type { ActionResult } from '@/shared/types/actions';

export async function executeExtractData(
  tabId: number,
  params: { type: string; selector?: string }
): Promise<ActionResult> {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: (extractType: string, selector?: string) => {
        const scope = selector ? document.querySelector(selector) ?? document : document;

        switch (extractType) {
          case 'table': {
            const tables: Record<string, string>[][] = [];
            scope.querySelectorAll('table').forEach((table) => {
              const headers: string[] = [];
              table.querySelectorAll('th').forEach((th) => headers.push(th.textContent?.trim() ?? ''));
              const rows: Record<string, string>[] = [];
              table.querySelectorAll('tbody tr, tr:not(:first-child)').forEach((tr) => {
                const row: Record<string, string> = {};
                tr.querySelectorAll('td').forEach((td, i) => {
                  const key = headers[i] || `col_${i}`;
                  row[key] = td.textContent?.trim() ?? '';
                });
                if (Object.keys(row).length > 0) rows.push(row);
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

          case 'form': {
            const forms: Record<string, string>[] = [];
            scope.querySelectorAll('form').forEach((form) => {
              const fields: Record<string, string> = {};
              form.querySelectorAll('input, select, textarea').forEach((el) => {
                const input = el as HTMLInputElement;
                const name = input.name || input.id || input.getAttribute('aria-label') || '';
                if (name) fields[name] = input.value ?? '';
              });
              forms.push(fields);
            });
            return { success: true, data: forms };
          }

          case 'links': {
            const links: { text: string; href: string }[] = [];
            scope.querySelectorAll('a[href]').forEach((a) => {
              const anchor = a as HTMLAnchorElement;
              links.push({
                text: anchor.textContent?.trim() ?? '',
                href: anchor.href,
              });
            });
            return { success: true, data: links };
          }

          case 'text': {
            return { success: true, data: (scope as Element).textContent?.trim() ?? '' };
          }

          default:
            return { success: false, error: `Unknown extraction type: ${extractType}` };
        }
      },
      args: [params.type, params.selector],
    });
    return results[0]?.result as ActionResult ?? { success: false, error: 'Extraction failed' };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
