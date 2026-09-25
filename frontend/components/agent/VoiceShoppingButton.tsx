"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";

interface VoiceShoppingButtonProps {
  onVoiceInput: (transcript: string) => void;
  isProcessing?: boolean;
  className?: string;
}

export const VoiceShoppingButton: React.FC<VoiceShoppingButtonProps> = ({
  onVoiceInput,
  isProcessing = false,
  className = "",
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setIsListening(false);
          if (transcript) {
            onVoiceInput(transcript);
          }
        };

        recognition.onerror = (err: any) => {
          console.warn("Speech recognition error:", err);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setIsSpeechSupported(false);
      }
    }
  }, [onVoiceInput]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.warn("Could not start recognition:", e);
        }
      } else {
        // Fallback demo speech input if browser lacks webkitSpeechRecognition
        const demoQueries = [
          "I need a gaming laptop in Pakistan under 300,000 PKR with RTX graphics and 16GB RAM",
          "Find me a good running shoe in the UK under £100",
          "Mujhe Pakistan mein 200,000 PKR ke andar iPhone chahiye",
          "Best laptop under $1200 in USA with 16GB RAM and delivery within a week",
        ];
        const randomQuery = demoQueries[Math.floor(Math.random() * demoQueries.length)];
        onVoiceInput(randomQuery);
      }
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={toggleListening}
        disabled={isProcessing}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs transition-all shadow-md active:scale-95 ${
          isListening
            ? "bg-red-600 text-white animate-pulse ring-4 ring-red-400/40"
            : isProcessing
            ? "bg-blue-500 text-white cursor-wait"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
        }`}
        title="Click to speak with AI Shopping Assistant"
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isListening ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
        <span>{isListening ? "Listening..." : isProcessing ? "Thinking..." : "Voice Agent"}</span>

        {isListening && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
        )}
      </button>

      <button
        onClick={() => setVoiceFeedbackEnabled(!voiceFeedbackEnabled)}
        className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        title={voiceFeedbackEnabled ? "Audio speech output enabled" : "Audio speech output muted"}
      >
        {voiceFeedbackEnabled ? <Volume2 className="w-4 h-4 text-blue-500" /> : <VolumeX className="w-4 h-4" />}
      </button>
    </div>
  );
};
