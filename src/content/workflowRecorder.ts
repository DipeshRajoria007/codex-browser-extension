let isRecording = false;
const listeners: Array<() => void> = [];

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function sendStep(step: { actionType: string; selector?: string; value?: string; url?: string; description: string }) {
  chrome.runtime.sendMessage({
    type: 'RECORDED_STEP',
    step: {
      id: generateId(),
      ...step,
      timestamp: Date.now(),
    },
  });
}

function getSelector(el: Element): string {
  if (el.id) return `#${el.id}`;
  if (el.getAttribute('data-testid')) return `[data-testid="${el.getAttribute('data-testid')}"]`;
  if (el.getAttribute('name')) return `${el.tagName.toLowerCase()}[name="${el.getAttribute('name')}"]`;
  if (el.getAttribute('aria-label')) return `[aria-label="${el.getAttribute('aria-label')}"]`;

  const tag = el.tagName.toLowerCase();
  const parent = el.parentElement;
  if (!parent) return tag;

  const siblings = Array.from(parent.children).filter((c) => c.tagName === el.tagName);
  if (siblings.length === 1) return `${parent.tagName.toLowerCase()} > ${tag}`;

  const index = siblings.indexOf(el) + 1;
  return `${tag}:nth-of-type(${index})`;
}

function handleClick(e: Event): void {
  const el = e.target as Element;
  if (!el) return;
  sendStep({
    actionType: 'click',
    selector: getSelector(el),
    description: `Click on ${el.tagName.toLowerCase()}: "${(el.textContent?.trim() ?? '').slice(0, 50)}"`,
  });
}

function handleInput(e: Event): void {
  const el = e.target as HTMLInputElement;
  if (!el) return;
  sendStep({
    actionType: 'type_text',
    selector: getSelector(el),
    value: el.value,
    description: `Type "${el.value.slice(0, 50)}" into ${el.getAttribute('name') || el.tagName.toLowerCase()}`,
  });
}

function handleChange(e: Event): void {
  const el = e.target as HTMLSelectElement;
  if (el.tagName !== 'SELECT') return;
  sendStep({
    actionType: 'select_option',
    selector: getSelector(el),
    value: el.value,
    description: `Select "${el.options[el.selectedIndex]?.text ?? el.value}" in ${el.getAttribute('name') || 'dropdown'}`,
  });
}

function handleSubmit(e: Event): void {
  const form = e.target as HTMLFormElement;
  sendStep({
    actionType: 'submit',
    selector: getSelector(form),
    description: `Submit form${form.action ? ` (action: ${form.action})` : ''}`,
  });
}

export function startRecording(): void {
  if (isRecording) return;
  isRecording = true;

  document.addEventListener('click', handleClick, true);
  document.addEventListener('input', handleInput, true);
  document.addEventListener('change', handleChange, true);
  document.addEventListener('submit', handleSubmit, true);

  listeners.push(
    () => document.removeEventListener('click', handleClick, true),
    () => document.removeEventListener('input', handleInput, true),
    () => document.removeEventListener('change', handleChange, true),
    () => document.removeEventListener('submit', handleSubmit, true)
  );
}

export function stopRecording(): void {
  isRecording = false;
  listeners.forEach((fn) => fn());
  listeners.length = 0;
}

export function isCurrentlyRecording(): boolean {
  return isRecording;
}
