import { ref, shallowRef, computed } from 'vue'
import { useStorage } from '@vueuse/core';
import type { ChatMessage } from '@/typings';
import { log, warn, Deferred } from '@/utils';

export interface UseChatFeaturesOptions {
  /**
   * the url to the chat endpoint (OpenAI spec)
   */
  url: string;
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
  /**
   * a handler that can be called when the websocket is connected
   */
  onConnected?: (ws: WebSocket)=> void;
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

  const connectionErrorMessage = ref<string>()

  const socket = shallowRef<WebSocket | null>(null);

  const deferredSocket = shallowRef(new Deferred<WebSocket>())

  const messages = useStorage<ChatMessage[]>(
    storageKey,
    [],
    localStorage,
    { mergeDefaults: clearHistory },
  );

  const messageTimeout = shallowRef<ReturnType<typeof setTimeout> | null>(null);

  const lastUserMessage = computed(() =>
    messages.value.slice().reverse().find(msg => msg.role === 'user') || null
  );

  const lastAssistantMessage = computed(()=> 
    messages.value.slice().reverse().find(msg => msg.role === 'assistant') || null
  )

  const isConnected = computed(()=> socket.value?.readyState === WebSocket.OPEN)
  const isConnecting = computed(()=> socket.value?.readyState === WebSocket.CONNECTING)
  const isClosing = computed(()=> socket.value?.readyState === WebSocket.CLOSING)
  const isClosed = computed(()=> socket.value?.readyState === WebSocket.CLOSED)

  const clearMessages = ()=> {
    messages.value = [];
    errorMessages.value = []
  }

  const getConnection = async ()=> {
    return await deferredSocket.value.promise
  }

  const clearMessageTimeout = ()=> {
    if (messageTimeout.value) {
      clearTimeout(messageTimeout.value);
      messageTimeout.value = null;
    }
  }

  const disconnect = async ()=> {
    try {
      await socket.value?.close()
    } catch(err){
      warn(`[chatbot]: error disconnecting: `, err)
    } finally {
      socket.value = null
    }
  }

  const onReceiveMessage = (event: MessageEvent)=> {
    try {
      const data = JSON.parse(event.data)
      
      if (data.type === 'message') {
        // Add assistant message to chat
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.content,
          context: data.context
        };
        messages.value.push(assistantMessage);

        // run message received callback if specified
        if (options?.onMessageReceived) {
          options.onMessageReceived(data)
        }
      } else if (data.type === 'error') {
        connectionError.value = true;
        connectionErrorMessage.value = data.message || 'An error occurred';
        warn(`[chatbot]: received error from server: `, data.message);
      }
      
      // Clear any pending message timeout
      clearMessageTimeout();
      
      // Set busy state to false when message is complete
      isBusy.value = false;

    } catch (err) {
      warn(`[chatbot]: error parsing message: `, err);
      // connectionError.value = true;
      isBusy.value = false;
    } 
  }

  const connectToWebSocket = async (force=false)=> {
    if (force){
      await disconnect();
    }
    if (isConnected.value) return
    try {
      const ws = new WebSocket(url)
      if (ws.readyState === WebSocket.OPEN) {
        socket.value = ws
        deferredSocket.value.resolve(ws)
      } else if (ws.readyState === WebSocket.CLOSING || ws.readyState === WebSocket.CLOSED) {
        connectionError.value = true
      } else {
        ws.onopen = () => {
          log(`[chatbot]: successfully connected to AI Service`)
          socket.value = ws
          deferredSocket.value.resolve(ws)
          if (options?.onConnected){
            options.onConnected(ws)
          }
        }

        ws.onmessage = onReceiveMessage
      
      } ws.onerror = (err)=> {
        // reject(err);
        log(`[chatbot]: error connecting to AI Service: `, err)
        connectionError.value = true
      }

    } catch(err) {
      connectionError.value = true
    }
  }

  return {
    url,
    socket,
    isBusy,
    userInput,
    messages,
    isConnected,
    isConnecting,
    isClosed,
    isClosing,
    deferredSocket,
    messageTimeout,
    lastUserMessage,
    lastAssistantMessage,
    clearMessages,
    getConnection,
    connectToWebSocket,
  }
  
  
}