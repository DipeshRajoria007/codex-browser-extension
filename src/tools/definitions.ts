import type { ChatCompletionTool } from 'openai/resources/chat/completions';

export const toolDefinitions: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'navigate',
      description: 'Navigate the browser to a specified URL',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'The URL to navigate to' },
        },
        required: ['url'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'click',
      description: 'Click on an element identified by its ref ID from the accessibility tree',
      parameters: {
        type: 'object',
        properties: {
          refId: { type: 'number', description: 'The ref ID of the element to click' },
          description: { type: 'string', description: 'Human-readable description of what is being clicked' },
        },
        required: ['refId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'type_text',
      description: 'Type text into an input field identified by its ref ID',
      parameters: {
        type: 'object',
        properties: {
          refId: { type: 'number', description: 'The ref ID of the input element' },
          text: { type: 'string', description: 'The text to type' },
          clearFirst: { type: 'boolean', description: 'Whether to clear the field before typing (default: true)' },
        },
        required: ['refId', 'text'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'scroll_page',
      description: 'Scroll the page in a specified direction',
      parameters: {
        type: 'object',
        properties: {
          direction: { type: 'string', enum: ['up', 'down', 'left', 'right'], description: 'Direction to scroll' },
          amount: { type: 'number', description: 'Pixels to scroll (default: 500)' },
        },
        required: ['direction'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'take_screenshot',
      description: 'Take a screenshot of the current visible page',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_page_content',
      description: 'Get the current page accessibility tree, URL, and title',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'extract_data',
      description: 'Extract structured data from the page (tables, lists, forms)',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['table', 'list', 'form', 'links', 'text'],
            description: 'Type of data to extract',
          },
          selector: { type: 'string', description: 'Optional CSS selector to scope extraction' },
        },
        required: ['type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'select_option',
      description: 'Select an option in a dropdown/select element',
      parameters: {
        type: 'object',
        properties: {
          refId: { type: 'number', description: 'The ref ID of the select element' },
          value: { type: 'string', description: 'The value or text of the option to select' },
        },
        required: ['refId', 'value'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'wait_for_element',
      description: 'Wait for an element matching a selector to appear on the page',
      parameters: {
        type: 'object',
        properties: {
          selector: { type: 'string', description: 'CSS selector of the element to wait for' },
          timeout: { type: 'number', description: 'Maximum wait time in ms (default: 5000)' },
        },
        required: ['selector'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'manage_tabs',
      description: 'Manage browser tabs (create, close, switch, list, group)',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['create', 'close', 'switch', 'list', 'group'],
            description: 'Tab action to perform',
          },
          url: { type: 'string', description: 'URL for create action' },
          tabId: { type: 'number', description: 'Tab ID for close/switch actions' },
          tabIds: { type: 'array', items: { type: 'number' }, description: 'Tab IDs for group action' },
          groupName: { type: 'string', description: 'Name for tab group' },
        },
        required: ['action'],
      },
    },
  },
];
