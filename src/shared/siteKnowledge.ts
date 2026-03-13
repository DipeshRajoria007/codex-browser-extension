interface SiteKnowledge {
  pattern: RegExp;
  name: string;
  systemPrompt: string;
  quickActions: string[];
}

const SITE_KNOWLEDGE: SiteKnowledge[] = [
  {
    pattern: /github\.com/,
    name: 'GitHub',
    systemPrompt:
      'You are on GitHub. Key interactive elements: repo navigation (Code/Issues/PRs tabs), file browser, code viewer with line numbers, issue/PR forms with markdown editors, comment boxes, review buttons. Use the GitHub-specific selectors and ARIA labels for navigation.',
    quickActions: [
      'Create a new issue',
      'Review the latest PR',
      'Search this repository',
      'View recent commits',
    ],
  },
  {
    pattern: /mail\.google\.com/,
    name: 'Gmail',
    systemPrompt:
      'You are on Gmail. Key elements: compose button, inbox list, email threads, reply/forward buttons, label selectors, search bar at top. Gmail uses dynamic class names - prefer ARIA roles and labels for element targeting.',
    quickActions: [
      'Compose a new email',
      'Search emails',
      'Archive selected emails',
      'Mark all as read',
    ],
  },
  {
    pattern: /calendar\.google\.com/,
    name: 'Google Calendar',
    systemPrompt:
      'You are on Google Calendar. Key elements: calendar grid, event creation buttons, date navigation, view switchers (Day/Week/Month), event detail popups. Use time-slot and date-based selectors.',
    quickActions: [
      'Create a new event',
      'Go to today',
      'Switch to week view',
      'Find free time slots',
    ],
  },
  {
    pattern: /docs\.google\.com/,
    name: 'Google Docs',
    systemPrompt:
      'You are on Google Docs. Key elements: document canvas (.kix-page), toolbar with formatting options, menu bar, comments panel. The document uses a custom editor - text input requires special handling via the active element.',
    quickActions: [
      'Summarize this document',
      'Find and replace text',
      'Add a comment',
      'Format headings',
    ],
  },
  {
    pattern: /app\.slack\.com/,
    name: 'Slack',
    systemPrompt:
      'You are on Slack. Key elements: channel sidebar, message list, message input (contenteditable), thread panel, channel header. Slack uses custom components - rely on data-qa attributes and ARIA labels.',
    quickActions: [
      'Send a message',
      'Search messages',
      'Switch channel',
      'Start a thread',
    ],
  },
];

export function getSiteKnowledge(url: string): SiteKnowledge | undefined {
  return SITE_KNOWLEDGE.find((site) => site.pattern.test(url));
}

export function getQuickActions(url: string): string[] {
  return getSiteKnowledge(url)?.quickActions ?? [];
}
