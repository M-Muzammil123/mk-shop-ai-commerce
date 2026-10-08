'use client';

import React, { useState } from 'react';
import { AgentActivityStep } from '@/types';
import {
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Cpu,
} from 'lucide-react';

export function AIActivityPanel({
  steps,
  isThinking = false,
  className,
}: {
  steps: AgentActivityStep[];
  isThinking?: boolean;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  if ((!steps || steps.length === 0) && !isThinking) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 p-4 transition-all duration-200 ${className || ''}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              AI Agent Execution Trace
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono">
                {steps.length} {steps.length === 1 ? 'step' : 'steps'}
              </span>
            </h4>
            <p className="text-[11px] text-zinc-400">
              Live multi-source tool execution and reasoning stream
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200">
          {isThinking && (
            <span className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
              <Loader2 className="h-3 w-3 animate-spin" />
              Processing
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-3.5 space-y-2.5 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
          {steps.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isInProgress = step.status === 'in_progress';
            const isFailed = step.status === 'failed';

            return (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs rounded-xl p-2.5 bg-white/70 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/60"
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  )}
                  {isInProgress && (
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                  )}
                  {isFailed && (
                    <AlertCircle className="h-4 w-4 text-rose-500" />
                  )}
                  {!isCompleted && !isInProgress && !isFailed && (
                    <Clock className="h-4 w-4 text-zinc-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                      {step.step}
                    </span>
                    {step.timestamp && (
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {new Date(step.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                  {step.detail && (
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                      {step.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {isThinking && (
            <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 p-2 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Analyzing product parameters & querying regional merchants...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
