let nextRefId = 1;
const refToElement = new Map<number, WeakRef<Element>>();
const elementToRef = new WeakMap<Element, number>();

export function getRefId(element: Element): number {
  const existing = elementToRef.get(element);
  if (existing !== undefined) return existing;

  const id = nextRefId++;
  refToElement.set(id, new WeakRef(element));
  elementToRef.set(element, id);
  return id;
}

export function getElement(refId: number): Element | undefined {
  const ref = refToElement.get(refId);
  if (!ref) return undefined;
  const el = ref.deref();
  if (!el) {
    refToElement.delete(refId);
    return undefined;
  }
  return el;
}

export function clearStaleRefs(): void {
  for (const [id, ref] of refToElement) {
    if (!ref.deref()) {
      refToElement.delete(id);
    }
  }
}

// Expose on window for content script access
(window as unknown as { __codexElements: Map<number, WeakRef<Element>> }).__codexElements = refToElement;
