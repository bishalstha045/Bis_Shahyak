import { useCallback } from 'react';

export function useStreaming() {
  const streamChat = useCallback(async ({ query, mode, language, sector, session_id, onToken, onDone, onError }) => {
    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, mode, language, sector, session_id })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.type === 'token') {
                onToken(data.content);
              } else if (data.type === 'done') {
                onDone(data);
              }
            } catch (err) {
              console.warn("Failed to parse SSE line:", trimmed, err);
            }
          }
        }
      }
    } catch (err) {
      console.error("Streaming error:", err);
      if (onError) onError(err);
    }
  }, []);

  return { streamChat };
}
