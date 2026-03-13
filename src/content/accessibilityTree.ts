import { getRefId } from './elementTracker';
import { MAX_ACCESSIBILITY_NODES, MAX_TREE_DEPTH, ELEMENT_CACHE_TTL } from '@/shared/constants';

const INTERACTIVE_TAGS = new Set([
  'A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'DETAILS', 'SUMMARY',
]);

const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'PATH', 'META', 'LINK', 'HEAD',
]);

let cachedTree: string | null = null;
let cacheTimestamp = 0;
let observer: MutationObserver | null = null;

function invalidateCache(): void {
  cachedTree = null;
}

function setupCacheInvalidation(): void {
  if (observer) return;
  observer = new MutationObserver(() => invalidateCache());
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style', 'hidden', 'aria-hidden', 'disabled'],
  });
}

function isVisible(el: Element): boolean {
  if ((el as HTMLElement).hidden) return false;
  if (el.getAttribute('aria-hidden') === 'true') return false;
  const style = (el as HTMLElement).style;
  if (style?.display === 'none' || style?.visibility === 'hidden') return false;
  return true;
}

function getAccessibleName(el: Element): string {
  return (
    el.getAttribute('aria-label') ??
    el.getAttribute('alt') ??
    el.getAttribute('title') ??
    el.getAttribute('placeholder') ??
    (el.textContent?.trim().slice(0, 80) ?? '')
  );
}

function getRole(el: Element): string {
  return el.getAttribute('role') ?? el.tagName.toLowerCase();
}

interface TreeContext {
  nodeCount: number;
  lines: string[];
}

function walkNode(el: Element, depth: number, ctx: TreeContext): void {
  if (ctx.nodeCount >= MAX_ACCESSIBILITY_NODES || depth > MAX_TREE_DEPTH) return;
  if (SKIP_TAGS.has(el.tagName)) return;
  if (!isVisible(el)) return;

  ctx.nodeCount++;

  const role = getRole(el);
  const name = getAccessibleName(el);
  const isInteractive = INTERACTIVE_TAGS.has(el.tagName) || el.getAttribute('tabindex') !== null;
  const indent = '  '.repeat(depth);

  let line = `${indent}[${role}]`;

  if (isInteractive) {
    const refId = getRefId(el);
    line += ` ref=${refId}`;
  }

  if (name) {
    line += ` "${name.replace(/\n/g, ' ').trim()}"`;
  }

  // Add relevant state info
  const states: string[] = [];
  if ((el as HTMLInputElement).disabled) states.push('disabled');
  if ((el as HTMLInputElement).checked) states.push('checked');
  if ((el as HTMLInputElement).readOnly) states.push('readonly');
  if (el.getAttribute('aria-expanded')) states.push(`expanded=${el.getAttribute('aria-expanded')}`);
  if (el.getAttribute('aria-selected') === 'true') states.push('selected');
  if ((el as HTMLInputElement).type) states.push(`type=${(el as HTMLInputElement).type}`);
  if ((el as HTMLInputElement).value && INTERACTIVE_TAGS.has(el.tagName)) {
    states.push(`value="${(el as HTMLInputElement).value.slice(0, 50)}"`);
  }

  if (states.length > 0) {
    line += ` (${states.join(', ')})`;
  }

  // Only add non-empty lines
  if (name || isInteractive || el.children.length > 0) {
    ctx.lines.push(line);
  }

  for (const child of el.children) {
    walkNode(child, depth + 1, ctx);
  }
}

export function generateAccessibilityTree(): string {
  const now = Date.now();
  if (cachedTree && now - cacheTimestamp < ELEMENT_CACHE_TTL) {
    return cachedTree;
  }

  setupCacheInvalidation();

  const ctx: TreeContext = { nodeCount: 0, lines: [] };
  if (document.body) {
    walkNode(document.body, 0, ctx);
  }

  cachedTree = ctx.lines.join('\n');
  cacheTimestamp = now;
  return cachedTree;
}
