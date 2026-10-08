'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useCountryStore } from '@/store/country-store';
import { agentApi } from '@/lib/api/agent';
import { VoiceSessionResponse } from '@/types';
import {
  Mic,
  MicOff,
  Volume2,
  Loader2,
  AlertCircle,
} from 'lucide-react';

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export function VoiceShoppingModal({
  isOpen,
  onClose,
  onResultsReceived,
}: {
  isOpen: boolean;
  onClose: () => void;
  onResultsReceived?: (results: VoiceSessionResponse) => void;
}) {
  const { currentCountry } = useCountryStore();

  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [spokenReply, setSpokenReply] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef<unknown>(null);

  const handleClose = () => {
    if (recognitionRef.current && (recognitionRef.current as { stop?: () => void }).stop) {
      (recognitionRef.current as { stop: () => void }).stop();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setState('idle');
    setTranscript('');
    setSpokenReply('');
    setErrorMessage('');
    onClose();
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current && (recognitionRef.current as { stop?: () => void }).stop) {
        (recognitionRef.current as { stop: () => void }).stop();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startListening = () => {
    setErrorMessage('');
    setTranscript('');
    setSpokenReply('');

    if (typeof window === 'undefined') return;

    // Check for web speech recognition support
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setState('error');
      setErrorMessage(
        'Speech recognition is not natively supported in this browser. Please use Google Chrome or Edge.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition() as {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        start: () => void;
        stop: () => void;
        onstart: () => void;
        onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void;
        onerror: (e: { error: string }) => void;
        onend: () => void;
      };

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setState('listening');
      };

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
      };

      recognition.onerror = (event) => {
        setState('error');
        if (event.error === 'not-allowed') {
          setErrorMessage(
            'Microphone access was denied. Please allow microphone permissions in your browser settings.'
          );
        } else {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // Send recognized transcript to voice agent
        if (transcript.trim().length > 0) {
          sendToVoiceAgent(transcript);
        } else {
          setState('idle');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setState('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to initialize microphone');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && (recognitionRef.current as { stop?: () => void }).stop) {
      (recognitionRef.current as { stop: () => void }).stop();
    }
    if (transcript.trim().length > 0) {
      sendToVoiceAgent(transcript);
    } else {
      setState('idle');
    }
  };

  const sendToVoiceAgent = async (text: string) => {
    setState('processing');
    try {
      const response = await agentApi.voiceSession({
        transcript_input: text,
        country: currentCountry.code,
        currency: currentCountry.currency,
      });

      setSpokenReply(response.spoken_reply);
      setState('speaking');

      // Speak aloud using browser Web Speech API
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(response.spoken_reply);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.onend = () => {
          setState('idle');
        };
        utterance.onerror = () => {
          setState('idle');
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setState('idle');
      }

      if (onResultsReceived) {
        onResultsReceived(response);
      }
    } catch (err) {
      setState('error');
      setErrorMessage(err instanceof Error ? err.message : 'Voice server communication failed');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Voice Shopping Copilot"
      description={`Talk naturally in English. Searching verified merchants in ${currentCountry.name} (${currentCountry.currency}).`}
      maxWidth="md"
    >
      <div className="flex flex-col items-center justify-center py-6 space-y-6 text-center">
        {/* Animated Microphone Orb */}
        <div className="relative">
          {state === 'listening' && (
            <div className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping" />
          )}
          {state === 'speaking' && (
            <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-pulse" />
          )}

          <div
            className={`h-28 w-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              state === 'listening'
                ? 'bg-rose-500 text-white ring-8 ring-rose-100 dark:ring-rose-950/50 scale-110'
                : state === 'processing'
                ? 'bg-indigo-600 text-white ring-8 ring-indigo-100 dark:ring-indigo-950/50'
                : state === 'speaking'
                ? 'bg-purple-600 text-white ring-8 ring-purple-100 dark:ring-purple-950/50'
                : state === 'error'
                ? 'bg-zinc-200 text-rose-500 dark:bg-zinc-800'
                : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:scale-105'
            }`}
          >
            {state === 'listening' ? (
              <Mic className="h-10 w-10 animate-bounce" />
            ) : state === 'processing' ? (
              <Loader2 className="h-10 w-10 animate-spin" />
            ) : state === 'speaking' ? (
              <Volume2 className="h-10 w-10 animate-pulse" />
            ) : state === 'error' ? (
              <AlertCircle className="h-10 w-10" />
            ) : (
              <Mic className="h-10 w-10" />
            )}
          </div>
        </div>

        {/* State Label */}
        <div className="space-y-1">
          <p className="text-xs uppercase font-bold tracking-widest text-zinc-400">
            {state === 'idle' && 'Ready to Listen'}
            {state === 'listening' && 'Listening to your request...'}
            {state === 'processing' && 'Agent Thinking & Querying Stores...'}
            {state === 'speaking' && 'AI Copilot Speaking...'}
            {state === 'error' && 'Encountered an Issue'}
          </p>

          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 min-h-[24px]">
            {transcript
              ? `"${transcript}"`
              : state === 'idle'
              ? 'Click below and say what you are looking for'
              : ''}
          </p>

          {spokenReply && (
            <div className="mt-4 p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 text-xs text-purple-900 dark:text-purple-200 text-left">
              <strong className="block mb-1 text-purple-950 dark:text-purple-100">
                AI Response:
              </strong>
              {spokenReply}
            </div>
          )}

          {errorMessage && (
            <p className="text-xs text-rose-500 font-medium max-w-xs mx-auto pt-2">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {state === 'listening' ? (
            <Button variant="danger" size="md" onClick={stopListening}>
              <MicOff className="h-4 w-4 mr-2" /> Stop & Search
            </Button>
          ) : (
            <Button
              variant="ai"
              size="md"
              onClick={startListening}
              disabled={state === 'processing'}
            >
              <Mic className="h-4 w-4 mr-2" />
              {state === 'idle' ? 'Start Speaking' : 'Try Again'}
            </Button>
          )}

          <Button variant="outline" size="md" onClick={handleClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
