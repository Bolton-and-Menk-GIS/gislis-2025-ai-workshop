import { ref, shallowRef, computed } from 'vue'
import { useStorage } from '@vueuse/core';
import type { ChatMessage } from '@/typings';
import { log, warn } from '@/utils';

export interface UseChatFeaturesOptions {
  /**
   * the local storage key used to persist chat messages history
   */
  storageKey: string;
  /**
   * option to start chat with a clear history
   */
  clearHistory?: boolean;
  /**
   * a handler that can be called when a message is received to perform custom actions
   */
  onMessageReceived?: (event: ChatMessage)=> void;
}

const chatIntents = [
  'ask_help',
  'other',
] as const;

type ChatIntent = typeof chatIntents[number];

interface LayerListItem {
  id: string;
  name: string;
  type: 'layer' | 'table';
}

interface ChatResponse<T = unknown> {
  message: string;
  data?: T;
  intent: ChatIntent
  model?: string;
  content: string;
  context: {
    silent?: boolean;
    layerInfo?: LayerListItem;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export const useChatFeatures = (options: UseChatFeaturesOptions)=> {
  const { url, storageKey='chat-messages', clearHistory=false } = options;
  
  const userInput = ref<string>('');

  const isBusy = ref(false)

  const connectionError = ref(false)

  const errorMessages = ref<string[]>([])

  const messages = useStorage<ChatMessage[]>(
    storageKey,
    [],
    localStorage,
    { mergeDefaults: clearHistory },
  );

  const lastUserMessage = computed(() =>
    messages.value.slice().reverse().find(msg => msg.role === 'user') || null
  );

  const lastAssistantMessage = computed(()=> 
    messages.value.slice().reverse().find(msg => msg.role === 'assistant') || null
  )

  const clearMessages = ()=> {
    messages.value = [];
    errorMessages.value = []
  }

  return {
    isBusy,
    userInput,
    messages,
    connectionError,
    lastUserMessage,
    lastAssistantMessage,
    clearMessages,
  }
}