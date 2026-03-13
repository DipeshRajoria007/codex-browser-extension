import { setupMessageRouter } from './messageRouter';
import { setupAlarms } from './alarmHandler';
import { storage } from '@/shared/storage';

// Initialize service worker
setupMessageRouter();
setupAlarms();

// Restore API key from local storage to session on service worker startup
storage.loadApiKeyFromLocal();

// Open side panel on extension icon click
chrome.action.onClicked.addListener((_tab) => {
  chrome.sidePanel.setOptions({ enabled: true });
});

// Set side panel behavior
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(() => {
    // Side panel API might not be available
  });
