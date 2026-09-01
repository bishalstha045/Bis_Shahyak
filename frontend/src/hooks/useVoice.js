import { useState, useRef, useCallback } from 'react';

export function useVoice({ onResult, language = 'auto' }) {
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    setVoiceError(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setVoiceError("Voice recognition is not supported in this browser. Please use Chrome or Edge.");
      alert("Voice input is not supported in your current browser. Please try Google Chrome.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : (language === 'ta' ? 'ta-IN' : (language === 'te' ? 'te-IN' : 'en-IN'));
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let interim = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const transcript = finalTranscript || interim;
        if (transcript && onResult) {
          onResult(transcript, !!finalTranscript);
        }
      };

      recognition.onerror = (e) => {
        console.warn("Speech recognition error:", e);
        setIsListening(false);
        if (e.error !== 'no-speech') {
          setVoiceError(`Voice input error: ${e.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error("Voice start error:", err);
      setIsListening(false);
      setVoiceError("Failed to access microphone.");
    }
  }, [language, onResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  return { isListening, voiceError, startListening, stopListening };
}
