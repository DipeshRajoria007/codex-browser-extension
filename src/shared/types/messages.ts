import type { BrowserAction, ActionResult } from './actions';
import type { ChatMessage } from './chat';
import type { WorkflowStep } from './workflows';

// Background ↔ Side panel / Popup messages
export type Message =
  | SendChatMessage
  | StreamChunkMessage
  | StreamDoneMessage
  | StreamErrorMessage
  | GetPageStateMessage
  | PageStateResponse
  | ExecuteActionMessage
  | ActionResultMessage
  | ApprovalRequestMessage
  | ApprovalResponseMessage
  | StartRecordingMessage
  | StopRecordingMessage
  | RecordedStepMessage
  | ReplayWorkflowMessage
  | GetConversationsMessage
  | ConversationsResponse
  | CancelStreamMessage;

interface BaseMessage {
  type: string;
}

export interface SendChatMessage extends BaseMessage {
  type: 'SEND_CHAT';
  conversationId: string;
  message: ChatMessage;
  model: string;
  includePageContext: boolean;
}

export interface StreamChunkMessage extends BaseMessage {
  type: 'STREAM_CHUNK';
  conversationId: string;
  chunk: string;
  messageId: string;
}

export interface StreamDoneMessage extends BaseMessage {
  type: 'STREAM_DONE';
  conversationId: string;
  message: ChatMessage;
}

export interface StreamErrorMessage extends BaseMessage {
  type: 'STREAM_ERROR';
  conversationId: string;
  error: string;
}

export interface CancelStreamMessage extends BaseMessage {
  type: 'CANCEL_STREAM';
  conversationId: string;
}

export interface GetPageStateMessage extends BaseMessage {
  type: 'GET_PAGE_STATE';
}

export interface PageStateResponse extends BaseMessage {
  type: 'PAGE_STATE';
  url: string;
  title: string;
  accessibilityTree: string;
  consoleLogs: string[];
}

export interface ExecuteActionMessage extends BaseMessage {
  type: 'EXECUTE_ACTION';
  action: BrowserAction;
  tabId?: number;
}

export interface ActionResultMessage extends BaseMessage {
  type: 'ACTION_RESULT';
  result: ActionResult;
}

export interface ApprovalRequestMessage extends BaseMessage {
  type: 'APPROVAL_REQUEST';
  action: BrowserAction;
  requestId: string;
}

export interface ApprovalResponseMessage extends BaseMessage {
  type: 'APPROVAL_RESPONSE';
  requestId: string;
  approved: boolean;
  approveAll: boolean;
}

export interface StartRecordingMessage extends BaseMessage {
  type: 'START_RECORDING';
}

export interface StopRecordingMessage extends BaseMessage {
  type: 'STOP_RECORDING';
}

export interface RecordedStepMessage extends BaseMessage {
  type: 'RECORDED_STEP';
  step: WorkflowStep;
}

export interface ReplayWorkflowMessage extends BaseMessage {
  type: 'REPLAY_WORKFLOW';
  workflowId: string;
}

export interface GetConversationsMessage extends BaseMessage {
  type: 'GET_CONVERSATIONS';
}

export interface ConversationsResponse extends BaseMessage {
  type: 'CONVERSATIONS';
  conversations: Array<{ id: string; title: string; updatedAt: number }>;
}
