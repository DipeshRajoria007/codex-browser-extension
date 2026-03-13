import OpenAI from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import { storage } from './storage';
import { categorizeError } from './apiErrors';
import { getSiteKnowledge } from './siteKnowledge';
import { toolDefinitions } from '../tools/definitions';

let client: OpenAI | null = null;

async function getClient(): Promise<OpenAI> {
  const apiKey = await storage.getApiKey();
  if (!apiKey) throw new Error('API key not set. Please configure it in settings.');
  if (!client || (client as unknown as { apiKey: string }).apiKey !== apiKey) {
    client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  }
  return client;
}

function buildSystemPrompt(pageContext?: { url: string; title: string; accessibilityTree: string }): string {
  let prompt = `You are Codex, an AI browser automation assistant. You can help users navigate the web, interact with pages, extract information, and automate tasks.

You have access to browser automation tools. When the user asks you to perform actions on a webpage, use the appropriate tools. Always explain what you're about to do before taking actions.

Safety rules:
- Never auto-fill password fields without explicit user confirmation
- Never auto-submit payment forms
- Never execute arbitrary JavaScript without user approval
- Always describe actions before executing them
- Stop immediately if the user says to stop`;

  if (pageContext) {
    const siteKnowledge = getSiteKnowledge(pageContext.url);
    if (siteKnowledge) {
      prompt += `\n\nSite-specific context (${siteKnowledge.name}):\n${siteKnowledge.systemPrompt}`;
    }
    prompt += `\n\nCurrent page:\n- URL: ${pageContext.url}\n- Title: ${pageContext.title}\n\nPage structure (accessibility tree):\n${pageContext.accessibilityTree}`;
  }

  return prompt;
}

export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onToolCall: (toolCall: { id: string; name: string; arguments: string }) => void;
  onDone: (fullText: string) => void;
  onError: (error: Error) => void;
}

export async function streamChat(
  messages: ChatCompletionMessageParam[],
  model: string,
  pageContext: { url: string; title: string; accessibilityTree: string } | undefined,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  try {
    const openai = await getClient();
    const systemPrompt = buildSystemPrompt(pageContext);

    const allMessages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const stream = await openai.chat.completions.create(
      {
        model,
        messages: allMessages,
        tools: toolDefinitions as ChatCompletionTool[],
        stream: true,
      },
      { signal }
    );

    let fullText = '';
    const toolCalls: Map<number, { id: string; name: string; arguments: string }> = new Map();

    for await (const chunk of stream) {
      if (signal?.aborted) break;

      const delta = chunk.choices[0]?.delta;
      if (!delta) continue;

      if (delta.content) {
        fullText += delta.content;
        callbacks.onChunk(delta.content);
      }

      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const existing = toolCalls.get(tc.index) ?? { id: '', name: '', arguments: '' };
          if (tc.id) existing.id = tc.id;
          if (tc.function?.name) existing.name = tc.function.name;
          if (tc.function?.arguments) existing.arguments += tc.function.arguments;
          toolCalls.set(tc.index, existing);
        }
      }
    }

    for (const tc of toolCalls.values()) {
      callbacks.onToolCall(tc);
    }

    callbacks.onDone(fullText);
  } catch (error) {
    if (signal?.aborted) return;
    callbacks.onError(categorizeError(error) as Error);
  }
}

export async function chatCompletion(
  messages: ChatCompletionMessageParam[],
  model: string,
  pageContext?: { url: string; title: string; accessibilityTree: string }
): Promise<{ content: string; toolCalls: Array<{ id: string; name: string; arguments: string }> }> {
  const openai = await getClient();
  const systemPrompt = buildSystemPrompt(pageContext);

  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    tools: toolDefinitions as ChatCompletionTool[],
  });

  const choice = response.choices[0];
  return {
    content: choice.message.content ?? '',
    toolCalls: choice.message.tool_calls?.map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: tc.function.arguments,
    })) ?? [],
  };
}
