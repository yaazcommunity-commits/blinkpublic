'use client';

import { useState, useCallback } from 'react';
import { getStreamingChatCompletion, getChatCompletion } from '../ai/chatCompletion';

interface ChatResponse {
  choices?: Array<{ message?: { content?: string }; delta?: { content?: string } }>;
}

export function useChat(provider: string, model: string, streaming: boolean = false) {
  const [response, setResponse] = useState('');
  const [fullResponse, setFullResponse] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async (messages: Array<{ role: string; content: unknown }>, parameters: Record<string, unknown> = {}) => {
      setIsLoading(true);
      setError(null);
      setResponse('');
      setFullResponse(null);

      try {
        if (streaming) {
          const chunks: unknown[] = [];
          let accumulated = '';

          await getStreamingChatCompletion(
            provider,
            model,
            messages,
            (chunk) => {
              chunks.push(chunk);
              // SDK streaming chunk: { id, choices: [{ delta: { content } }] }
              const chunkObj = chunk as { choices?: Array<{ delta?: { content?: string } }> };
              const delta = chunkObj?.choices?.[0]?.delta?.content || '';
              accumulated += delta;
              setResponse(accumulated);
              setFullResponse([...chunks]);
            },
            () => {
              setIsLoading(false);
            },
            (err) => {
              setError(err);
              setIsLoading(false);
            },
            parameters
          );
        } else {
          const result = await getChatCompletion(provider, model, messages, parameters);
          const content = result?.choices?.[0]?.message?.content || '';
          setResponse(content);
          setFullResponse(result);
          setIsLoading(false);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        setIsLoading(false);
      }
    },
    [provider, model, streaming]
  );

  return { response, fullResponse, isLoading, error, sendMessage };
}
