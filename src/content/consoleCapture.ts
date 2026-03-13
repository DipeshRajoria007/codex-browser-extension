import { MAX_CONSOLE_ENTRIES } from '@/shared/constants';

const consoleLogs: string[] = [];

function captureLog(level: string, args: unknown[]): void {
  const msg = args
    .map((a) => {
      try {
        return typeof a === 'string' ? a : JSON.stringify(a);
      } catch {
        return String(a);
      }
    })
    .join(' ');

  consoleLogs.push(`[${level}] ${msg}`);
  if (consoleLogs.length > MAX_CONSOLE_ENTRIES) {
    consoleLogs.shift();
  }
}

export function setupConsoleCapture(): void {
  const origLog = console.log;
  const origWarn = console.warn;
  const origError = console.error;

  console.log = (...args: unknown[]) => {
    captureLog('log', args);
    origLog.apply(console, args);
  };
  console.warn = (...args: unknown[]) => {
    captureLog('warn', args);
    origWarn.apply(console, args);
  };
  console.error = (...args: unknown[]) => {
    captureLog('error', args);
    origError.apply(console, args);
  };

  window.addEventListener('error', (e) => {
    captureLog('error', [`${e.message} at ${e.filename}:${e.lineno}`]);
  });

  window.addEventListener('unhandledrejection', (e) => {
    captureLog('error', [`Unhandled promise rejection: ${e.reason}`]);
  });
}

export function getConsoleLogs(): string[] {
  return [...consoleLogs];
}
