export interface PageData {
  url: string;
  title: string;
  metadata: Record<string, string>;
  headings: string[];
  mainText: string;
}

export function extractPageData(): PageData {
  const metadata: Record<string, string> = {};
  document.querySelectorAll('meta[name], meta[property]').forEach((meta) => {
    const key = meta.getAttribute('name') || meta.getAttribute('property') || '';
    const val = meta.getAttribute('content') || '';
    if (key && val) metadata[key] = val;
  });

  const headings: string[] = [];
  document.querySelectorAll('h1, h2, h3').forEach((h) => {
    const text = h.textContent?.trim();
    if (text) headings.push(`${h.tagName}: ${text}`);
  });

  const mainEl = document.querySelector('main, [role="main"], article, .content') ?? document.body;
  const mainText = (mainEl?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 5000);

  return {
    url: location.href,
    title: document.title,
    metadata,
    headings,
    mainText,
  };
}
