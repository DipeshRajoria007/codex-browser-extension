import { useEffect, useRef, useState } from 'react';

export function useStreamingText(text: string, isStreaming: boolean) {
  const [displayText, setDisplayText] = useState('');
  const prevTextRef = useRef('');

  useEffect(() => {
    if (!isStreaming) {
      setDisplayText(text);
      prevTextRef.current = text;
      return;
    }

    setDisplayText(text);
    prevTextRef.current = text;
  }, [text, isStreaming]);

  return displayText;
}
