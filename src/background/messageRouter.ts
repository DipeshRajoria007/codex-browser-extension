import { storage } from '@/shared/storage';
import { streamChat } from '@/shared/openai';
import { shouldAutoApprove } from '@/shared/permissions';
import { ACTION_RISK } from '@/shared/types/actions';
import type { ActionResult } from '@/shared/types/actions';
import type { ChatMessage, ToolCallInfo } from '@/shared/types/chat';
import type { SendChatMessage, ApprovalResponseMessage } from '@/shared/types/messages';
import { executeNavigate, executeClick, executeTypeText, executeScroll, executeSelectOption, executeWaitForElement } from '@/tools/browserTools';
import { executeManageTabs } from '@/tools/tabTools';
import { executeExtractData } from '@/tools/extractionTools';
import { takeScreenshot } from '@/tools/screenshotTools';
import { MAX_TOOL_ITERATIONS } from '@/shared/constants';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const activeStreams = new Map<string, AbortController>();
const pendingApprovals = new Map<string, (approved: boolean) => void>();

export function setupMessageRouter(): void {
  // Port-based connections for streaming
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'chat-stream') {
      port.onMessage.addListener(async (msg) => {
        if (msg.type === 'SEND_CHAT') {
          await handleChatStream(msg as SendChatMessage, port);
        } else if (msg.type === 'CANCEL_STREAM') {
          const controller = activeStreams.get(msg.conversationId);
          controller?.abort();
          activeStreams.delete(msg.conversationId);
        }
      });
    }
  });

  // One-time messages
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    switch (message.type) {
      case 'APPROVAL_RESPONSE': {
        const msg = message as ApprovalResponseMessage;
        const resolver = pendingApprovals.get(msg.requestId);
        if (resolver) {
          resolver(msg.approved);
          pendingApprovals.delete(msg.requestId);
        }
        sendResponse({ success: true });
        return true;
      }

      case 'GET_API_KEY': {
        storage.getApiKey().then((key) => sendResponse({ key }));
        return true;
      }

      case 'SET_API_KEY': {
        storage.setApiKey(message.key).then(() => sendResponse({ success: true }));
        return true;
      }

      case 'GET_SETTINGS': {
        storage.getSettings().then((settings) => sendResponse(settings));
        return true;
      }

      case 'SET_SETTINGS': {
        storage.setSettings(message.settings).then(() => sendResponse({ success: true }));
        return true;
      }

      case 'GET_CONVERSATIONS': {
        storage.getConversations().then((conversations) =>
          sendResponse({ conversations: conversations.map((c) => ({ id: c.id, title: c.title, updatedAt: c.updatedAt })) })
        );
        return true;
      }

      case 'GET_CONVERSATION': {
        storage.getConversations().then((conversations) => {
          const conv = conversations.find((c) => c.id === message.conversationId);
          sendResponse({ conversation: conv });
        });
        return true;
      }

      case 'SAVE_CONVERSATION': {
        storage.saveConversation(message.conversation).then(() => sendResponse({ success: true }));
        return true;
      }

      case 'DELETE_CONVERSATION': {
        storage.deleteConversation(message.conversationId).then(() => sendResponse({ success: true }));
        return true;
      }

      case 'GET_WORKFLOWS': {
        storage.getWorkflows().then((workflows) => sendResponse({ workflows }));
        return true;
      }

      case 'SAVE_WORKFLOW': {
        storage.saveWorkflow(message.workflow).then(() => sendResponse({ success: true }));
        return true;
      }

      case 'DELETE_WORKFLOW': {
        storage.deleteWorkflow(message.workflowId).then(() => sendResponse({ success: true }));
        return true;
      }

      case 'TAKE_SCREENSHOT': {
        getActiveTabId().then((tabId) => {
          if (!tabId) return sendResponse({ success: false, error: 'No active tab' });
          takeScreenshot(tabId).then(sendResponse);
        });
        return true;
      }
    }
  });
}

async function getActiveTabId(): Promise<number | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}

async function getPageState(tabId: number): Promise<{ url: string; title: string; accessibilityTree: string } | undefined> {
  try {
    const response = await chrome.tabs.sendMessage(tabId, { type: 'GET_PAGE_STATE' });
    return response;
  } catch {
    return undefined;
  }
}

async function handleChatStream(msg: SendChatMessage, port: chrome.runtime.Port): Promise<void> {
  const controller = new AbortController();
  activeStreams.set(msg.conversationId, controller);

  const settings = await storage.getSettings();
  let pageContext: { url: string; title: string; accessibilityTree: string } | undefined;

  if (msg.includePageContext) {
    const tabId = await getActiveTabId();
    if (tabId) {
      pageContext = await getPageState(tabId);
    }
  }

  // Build messages history for OpenAI
  const conversations = await storage.getConversations();
  const conversation = conversations.find((c) => c.id === msg.conversationId);
  const historyMessages: ChatCompletionMessageParam[] = (conversation?.messages ?? []).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  // Add the new user message
  historyMessages.push({ role: 'user', content: msg.message.content });

  let iterations = 0;

  const processStream = async (messages: ChatCompletionMessageParam[]): Promise<void> => {
    if (iterations >= MAX_TOOL_ITERATIONS) {
      port.postMessage({ type: 'STREAM_ERROR', conversationId: msg.conversationId, error: 'Maximum tool iterations reached' });
      return;
    }

    iterations++;
    let fullText = '';
    const toolCalls: Array<{ id: string; name: string; arguments: string }> = [];

    await streamChat(
      messages,
      msg.model || settings.model,
      pageContext,
      {
        onChunk: (chunk) => {
          fullText += chunk;
          try {
            port.postMessage({
              type: 'STREAM_CHUNK',
              conversationId: msg.conversationId,
              chunk,
              messageId: msg.message.id + '_response',
            });
          } catch {
            // Port disconnected
          }
        },
        onToolCall: (tc) => {
          toolCalls.push(tc);
        },
        onDone: async () => {
          if (toolCalls.length === 0) {
            // No tool calls, we're done
            const responseMsg: ChatMessage = {
              id: msg.message.id + '_response',
              role: 'assistant',
              content: fullText,
              timestamp: Date.now(),
            };
            try {
              port.postMessage({ type: 'STREAM_DONE', conversationId: msg.conversationId, message: responseMsg });
            } catch {
              // Port disconnected
            }
            activeStreams.delete(msg.conversationId);
            return;
          }

          // Process tool calls
          const toolResults: ChatCompletionMessageParam[] = [];
          const toolCallInfos: ToolCallInfo[] = [];

          // Add assistant message with tool calls
          toolResults.push({
            role: 'assistant' as const,
            content: fullText || null,
            tool_calls: toolCalls.map((tc) => ({
              id: tc.id,
              type: 'function' as const,
              function: { name: tc.name, arguments: tc.arguments },
            })),
          });

          for (const tc of toolCalls) {
            const params = JSON.parse(tc.arguments);
            const actionType = tc.name as keyof typeof ACTION_RISK;
            const riskLevel = ACTION_RISK[actionType] ?? 'moderate';

            let approved = shouldAutoApprove(riskLevel, settings.autoApproveReadOnly);

            if (!approved) {
              // Request approval from side panel
              const requestId = Math.random().toString(36).slice(2);
              try {
                port.postMessage({
                  type: 'APPROVAL_REQUEST',
                  action: { type: actionType, params, riskLevel, description: `${tc.name}(${tc.arguments})` },
                  requestId,
                });
              } catch {
                break;
              }

              approved = await new Promise<boolean>((resolve) => {
                pendingApprovals.set(requestId, resolve);
                setTimeout(() => {
                  pendingApprovals.delete(requestId);
                  resolve(false);
                }, 60000);
              });
            }

            const info: ToolCallInfo = {
              id: tc.id,
              name: tc.name,
              arguments: tc.arguments,
              status: approved ? 'pending' : 'rejected',
            };

            if (approved) {
              const result = await executeToolCall(tc.name, params);
              info.result = JSON.stringify(result);
              info.status = result.success ? 'executed' : 'error';
              toolResults.push({
                role: 'tool' as const,
                tool_call_id: tc.id,
                content: JSON.stringify(result),
              });
            } else {
              info.status = 'rejected';
              toolResults.push({
                role: 'tool' as const,
                tool_call_id: tc.id,
                content: JSON.stringify({ success: false, error: 'Action rejected by user' }),
              });
            }

            toolCallInfos.push(info);
          }

          // Send tool call info to UI
          try {
            port.postMessage({
              type: 'STREAM_CHUNK',
              conversationId: msg.conversationId,
              chunk: '',
              toolCalls: toolCallInfos,
            });
          } catch {
            // Port disconnected
          }

          // Continue with tool results
          await processStream([...messages, ...toolResults]);
        },
        onError: (error) => {
          try {
            port.postMessage({ type: 'STREAM_ERROR', conversationId: msg.conversationId, error: error.message });
          } catch {
            // Port disconnected
          }
          activeStreams.delete(msg.conversationId);
        },
      },
      controller.signal
    );
  };

  await processStream(historyMessages);
}

async function executeToolCall(name: string, params: Record<string, unknown>): Promise<ActionResult> {
  const tabId = await getActiveTabId();

  switch (name) {
    case 'navigate':
      if (!tabId) return { success: false, error: 'No active tab' };
      return executeNavigate(tabId, params as { url: string });

    case 'click':
      if (!tabId) return { success: false, error: 'No active tab' };
      return executeClick(tabId, params as { refId: number });

    case 'type_text':
      if (!tabId) return { success: false, error: 'No active tab' };
      return executeTypeText(tabId, params as { refId: number; text: string; clearFirst?: boolean });

    case 'scroll_page':
      if (!tabId) return { success: false, error: 'No active tab' };
      return executeScroll(tabId, params as { direction: string; amount?: number });

    case 'take_screenshot':
      if (!tabId) return { success: false, error: 'No active tab' };
      return takeScreenshot(tabId);

    case 'get_page_content': {
      if (!tabId) return { success: false, error: 'No active tab' };
      const state = await getPageState(tabId);
      if (!state) return { success: false, error: 'Could not get page state' };
      return { success: true, data: state };
    }

    case 'extract_data':
      if (!tabId) return { success: false, error: 'No active tab' };
      return executeExtractData(tabId, params as { type: string; selector?: string });

    case 'select_option':
      if (!tabId) return { success: false, error: 'No active tab' };
      return executeSelectOption(tabId, params as { refId: number; value: string });

    case 'wait_for_element':
      if (!tabId) return { success: false, error: 'No active tab' };
      return executeWaitForElement(tabId, params as { selector: string; timeout?: number });

    case 'manage_tabs':
      return executeManageTabs(params as { action: string; url?: string; tabId?: number; tabIds?: number[]; groupName?: string });

    default:
      return { success: false, error: `Unknown tool: ${name}` };
  }
}
