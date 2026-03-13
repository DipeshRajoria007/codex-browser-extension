export type Role = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  toolCalls?: ToolCallInfo[];
  imageUrl?: string;
}

export interface ToolCallInfo {
  id: string;
  name: string;
  arguments: string;
  result?: string;
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'error';
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  model: string;
}

export interface StreamingState {
  isStreaming: boolean;
  currentText: string;
  conversationId: string | null;
}
