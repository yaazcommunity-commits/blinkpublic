import { callAIEndpoint } from './aiClient';

export async function getChatCompletion(
  provider: string,
  model: string,
  messages: Array<{ role: string; content: unknown }>,
  parameters: Record<string, unknown> = {}
) {
  const response = await callAIEndpoint('/api/generate', {
    provider,
    model,
    messages,
    stream: false,
    parameters,
  });
  return response.json();
}

export async function getStreamingChatCompletion(
  provider: string,
  model: string,
  messages: Array<{ role: string; content: unknown }>,
  onChunk: (chunk: unknown) => void,
  onComplete: () => void,
  onError: (error: Error) => void,
  parameters: Record<string, unknown> = {}
) {
  const response = await callAIEndpoint('/api/generate', {
    provider,
    model,
    messages,
    stream: true,
    parameters,
  });

  const reader = response.body?.getReader();
  if (!reader) {
    onError(new Error('No response body'));
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (!data) continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'chunk') onChunk(parsed.chunk);
            if (parsed.type === 'done') onComplete();
            if (parsed.type === 'error') onError(new Error(parsed.error));
          } catch {}
        }
      }
    }
    onComplete();
  } catch (err) {
    onError(err instanceof Error ? err : new Error('Stream error'));
  }
}
