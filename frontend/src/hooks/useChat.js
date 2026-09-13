import { useState, useCallback, useRef } from 'react';
import { useStreaming } from './useStreaming';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const { streamChat } = useStreaming();

  const isSendingRef = useRef(false);

  const sendMessage = useCallback(async ({ query, mode = "auto", language = "auto", sector = null, session_id = null }) => {
    const trimmed = (query || '').trim();
    if (!trimmed || isSendingRef.current || isLoading) return;

    isSendingRef.current = true;
    setIsLoading(true);
    setStreamingText('');

    const userMessageId = `usr-${Date.now()}`;
    const userMessage = {
      id: userMessageId,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    let accumulatedText = '';

    try {
      await streamChat({
        query: trimmed,
        mode,
        language,
        sector,
        session_id,
        onToken: (token) => {
          accumulatedText += token;
          setStreamingText(accumulatedText);
        },
        onDone: (meta) => {
          const assistantMessage = {
            id: `asst-${Date.now()}`,
            role: 'assistant',
            content: accumulatedText || "No response generated.",
            confidence: typeof meta.confidence === 'number' ? meta.confidence : null,
            citations: meta.citations || [],
            mode: meta.mode || mode,
            language: meta.language || language,
            processingTime: meta.processing_time || 0.4,
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, assistantMessage]);
          setStreamingText('');
          setIsLoading(false);
          isSendingRef.current = false;
        },
        onError: (err) => {
          const errorMessage = {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: err?.message ? `Connection/Service Error: ${err.message}` : "Sorry, I encountered an issue connecting to the BIS Sahayak service. Please try again.",
            confidence: null,
            citations: [],
            isError: true,
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, errorMessage]);
          setStreamingText('');
          setIsLoading(false);
          isSendingRef.current = false;
        }
      });
    } catch (err) {
      setIsLoading(false);
      isSendingRef.current = false;
    }
  }, [isLoading, streamChat]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingText('');
    setIsLoading(false);
  }, []);

  return {
    messages,
    setMessages,
    isLoading,
    streamingText,
    sendMessage,
    clearMessages
  };
}
