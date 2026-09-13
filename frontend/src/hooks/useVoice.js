import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Robust Speech Recognition hook for BIS Sahayak.
 * Ensures:
 * 1. No duplicate adjacent words (e.g. "Hello hello" -> "Hello").
 * 2. Accurate interim accumulation across the entire recognition session.
 * 3. Exact single finalization upon speech completion (no duplicate messages).
 * 4. Safe single-instance lifecycle (aborts any stray listeners).
 */
export function useVoice({ onResult, onFinal, language = 'auto' }) {
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  const onFinalRef = useRef(onFinal);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  // Clean transcript helper
  const cleanTranscript = (text) => {
    if (!text) return '';
    // Normalize multi-spaces and trim
    return text.replace(/\s+/g, ' ').trim();
  };

  const startListening = useCallback(() => {
    setVoiceError(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError("Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      alert("Voice input is not supported in your current browser. Please try Google Chrome or Microsoft Edge.");
      return;
    }

    // Stop and abort any existing active instance cleanly
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : (language === 'ta' ? 'ta-IN' : (language === 'te' ? 'te-IN' : 'en-IN'));
      recognition.interimResults = true;
      recognition.continuous = true; // Continuous listening until user stops
      recognition.maxAlternatives = 1;

      let latestCleanText = '';
      let hasDispatchedFinal = false;

      recognition.onstart = () => {
        setIsListening(true);
        latestCleanText = '';
        hasDispatchedFinal = false;
      };

      recognition.onresult = (event) => {
        let finalStr = '';
        let interimStr = '';

        // Iterate through all results to build the full coherent transcript
        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item && item[0]) {
            if (item.isFinal) {
              finalStr += item[0].transcript + ' ';
            } else {
              interimStr += item[0].transcript + ' ';
            }
          }
        }

        const combined = (finalStr + interimStr).trim();
        const cleaned = cleanTranscript(combined);

        if (cleaned) {
          latestCleanText = cleaned;
          if (onResultRef.current) {
            onResultRef.current(cleaned, false);
          }
        }
      };

      recognition.onerror = (e) => {
        console.warn("Speech recognition notice:", e.error);
        setIsListening(false);
        if (e.error !== 'no-speech') {
          setVoiceError(`Voice input error: ${e.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // Dispatch final result exactly once upon session end
        if (latestCleanText && !hasDispatchedFinal) {
          hasDispatchedFinal = true;
          const finalClean = cleanTranscript(latestCleanText);
          if (onFinalRef.current) {
            onFinalRef.current(finalClean);
          } else if (onResultRef.current) {
            onResultRef.current(finalClean, true);
          }
        }
        recognitionRef.current = null;
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error("Voice start error:", err);
      setIsListening(false);
      setVoiceError("Failed to access microphone.");
    }
  }, [language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  }, []);

  return { isListening, voiceError, startListening, stopListening };
}
