export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function categorizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  const err = error as { status?: number; message?: string; error?: { message?: string } };
  const status = err.status;
  const message = err.error?.message || err.message || 'Unknown error';

  if (status === 401) {
    return new ApiError('Invalid API key. Please check your settings.', 401);
  }
  if (status === 429) {
    return new ApiError('Rate limited. Retrying...', 429, true);
  }
  if (status === 400 && message.includes('context_length')) {
    return new ApiError(
      'Conversation too long. Starting fresh context.',
      400
    );
  }
  if (status === 500 || status === 502 || status === 503) {
    return new ApiError('OpenAI service error. Retrying...', status, true);
  }
  return new ApiError(message, status);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: ApiError | undefined;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = categorizeError(e);
      if (!lastError.retryable) throw lastError;
      const delay = Math.min(1000 * Math.pow(2, i), 10000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}
