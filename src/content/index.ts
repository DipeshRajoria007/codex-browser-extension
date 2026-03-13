import { generateAccessibilityTree } from './accessibilityTree';
import { setupConsoleCapture, getConsoleLogs } from './consoleCapture';
import { startRecording, stopRecording } from './workflowRecorder';
import { executeAction } from './actionExecutor';
import './elementTracker';

// Initialize console capture
setupConsoleCapture();

// Listen for messages from background/service worker
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case 'GET_PAGE_STATE': {
      const tree = generateAccessibilityTree();
      sendResponse({
        type: 'PAGE_STATE',
        url: location.href,
        title: document.title,
        accessibilityTree: tree,
        consoleLogs: getConsoleLogs(),
      });
      return true;
    }

    case 'EXECUTE_ACTION': {
      const result = executeAction(message.action.type, message.action.params);
      sendResponse({ type: 'ACTION_RESULT', result });
      return true;
    }

    case 'START_RECORDING': {
      startRecording();
      sendResponse({ success: true });
      return true;
    }

    case 'STOP_RECORDING': {
      stopRecording();
      sendResponse({ success: true });
      return true;
    }
  }
});
