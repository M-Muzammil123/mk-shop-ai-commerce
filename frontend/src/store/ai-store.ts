import { create } from 'zustand';
import {
  AgentActivityStep,
  DiscoveredProduct,
  ProductComparisonResult,
  StructuredShoppingRequirements,
  AgentCitation,
} from '@/types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  products?: DiscoveredProduct[];
  comparison?: ProductComparisonResult | null;
  activitySteps?: AgentActivityStep[];
  citations?: AgentCitation[];
  nextAction?: string;
  requirements?: StructuredShoppingRequirements | null;
}

interface AIState {
  sessionId: string | null;
  messages: ChatMessage[];
  activitySteps: AgentActivityStep[];
  isThinking: boolean;
  selectedDiscoveredProducts: DiscoveredProduct[];
  activeComparison: ProductComparisonResult | null;

  setSessionId: (id: string) => void;
  addMessage: (msg: ChatMessage) => void;
  setThinking: (thinking: boolean) => void;
  setActivitySteps: (steps: AgentActivityStep[]) => void;
  setSelectedDiscoveredProducts: (products: DiscoveredProduct[]) => void;
  setActiveComparison: (comp: ProductComparisonResult | null) => void;
  resetChat: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  sessionId: null,
  messages: [],
  activitySteps: [],
  isThinking: false,
  selectedDiscoveredProducts: [],
  activeComparison: null,

  setSessionId: (id) => set({ sessionId: id }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setThinking: (thinking) => set({ isThinking: thinking }),
  setActivitySteps: (steps) => set({ activitySteps: steps }),
  setSelectedDiscoveredProducts: (products) => set({ selectedDiscoveredProducts: products }),
  setActiveComparison: (comp) => set({ activeComparison: comp }),
  resetChat: () =>
    set({
      sessionId: null,
      messages: [],
      activitySteps: [],
      isThinking: false,
      selectedDiscoveredProducts: [],
      activeComparison: null,
    }),
}));
