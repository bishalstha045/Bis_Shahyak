import { useState, useCallback } from 'react';
import { useStreaming } from './useStreaming';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const { streamChat } = useStreaming();

  const sendMessage = useCallback(async ({ query, mode = "simple", language = "auto", sector = null, session_id = null }) => {
    if (!query.trim() || isLoading) return;

    const userMessageId = `usr-${Date.now()}`;
    const userMessage = {
      id: userMessageId,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setStreamingText('');

    let accumulatedText = '';

    await streamChat({
      query,
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
          confidence: meta.confidence || 85,
          citations: meta.citations || [],
          mode: meta.mode || mode,
          language: meta.language || language,
          processingTime: meta.processing_time || 0.4,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setStreamingText('');
        setIsLoading(false);
      },
      onError: (err) => {
        const errorMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: "Sorry, I encountered an issue connecting to the BIS Sahayak service. Please try again.",
          confidence: 0,
          citations: [],
          isError: true,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
        setStreamingText('');
        setIsLoading(false);
      }
    });
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
