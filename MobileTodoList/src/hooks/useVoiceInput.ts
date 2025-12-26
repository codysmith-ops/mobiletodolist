import {useEffect, useState, useCallback} from 'react';
import Voice, {
  SpeechErrorEvent,
  SpeechResultsEvent,
} from '@react-native-voice/voice';

export const useVoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleResults = (event: SpeechResultsEvent) => {
      const next = event.value?.[0];
      if (next) {
        setTranscript(next);
      }
    };

    const handleError = (event: SpeechErrorEvent) => {
      setError(event.error?.message ?? 'Voice input error');
      setIsListening(false);
    };

    Voice.onSpeechResults = handleResults;
    Voice.onSpeechError = handleError;

    return () => {
      Voice.destroy().finally(() => Voice.removeAllListeners());
    };
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setTranscript('');
    setIsListening(true);
    try {
      await Voice.start('en-US');
    } catch (err) {
      setError((err as Error).message);
      setIsListening(false);
    }
  }, []);

  const stop = useCallback(async () => {
    setIsListening(false);
    try {
      await Voice.stop();
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
    setIsListening(false);
  }, []);

  return {isListening, transcript, error, start, stop, reset};
};
