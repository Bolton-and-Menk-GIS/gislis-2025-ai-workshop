<script lang="ts" setup>
import { useChatFeatures, type UseChatFeaturesOptions } from '@/composables';
import type { ChatMessage } from '@/typings';
import { api } from '@/api';

interface Props extends Pick<UseChatFeaturesOptions, | 'storageKey' | 'clearHistory'> {
  title?: string;
  extent?: __esri.ExtentProperties | null;
}

const emit = defineEmits<{
  (e: 'message-received', msg: ChatMessage): void;
  (e: 'connected', ws: WebSocket): void;
  (e: 'close'): void;
}>();

const { 
  title='AI Assistant', 
  storageKey='chat-messages', 
  clearHistory=false, 
  extent
} = defineProps<Props>();

const {
  isBusy,
  userInput,
  messages,
  clearMessages,
  lastAssistantMessage
 } = useChatFeatures({
  storageKey,
  clearHistory,
  onMessageReceived: (msg: ChatMessage)=> {
    console.log('Message received in ChatBot component:', msg);
    emit('message-received', msg);
  }
});

if (!lastAssistantMessage.value?.isWelcomeMessage){
  messages.value.push({
    role: 'assistant',
    isWelcomeMessage: true,
    content: "Hello! I'm your AI assistant and I'm here to help answer any questions you have about Public Comments. How can I help you?"
  });
}

const onSubmit = async () => {
  if (!userInput.value.trim() || isBusy.value) return;

  const userMessage: ChatMessage = {
    role: 'user',
    content: userInput.value.trim(),
  };

  messages.value.push(userMessage);
  userInput.value = '';

  try {
    isBusy.value = true;
    const response = await api.askQuestionRAG({
      question: userMessage.content,
      // @ts-expect-error // type mismatch
      extent: extent, 
    })
    if (response && response.data) {
      const msg = {
        content: response.data.answer,
        role: 'assistant',
        result: response.data.features || [],
      } as ChatMessage<typeof response.data.features>;
      messages.value.push(msg);
      emit('message-received', msg);
    }
  } catch (error) {
    console.error('Error sending message:', error);
    messages.value.push({
      role: 'assistant',
      content: 'Sorry, there was an error processing your message. Please try again later.',
    });
  } finally {
    isBusy.value = false;
  }
};

// dev test
// isBusy.value = true

</script>

<template>
  <article class="pico chatbot--container pa-sm">
    <header>
      <nav class="px-md">
        <ul>
          <li><h4 class="pt-sm">{{ title }}</h4></li>
        </ul>
        <ul>
          <li>
            <button 
              class="icon-btn--flat pr-sm"
              data-tooltip="Clear Chat History" 
              data-placement="bottom" 
              @click="clearMessages" 
            >
              <span class="material-symbols-outlined">
                clear_all
              </span>
            </button>
          </li>
          <li>
            <button 
              class="icon-btn--flat pr-sm" 
              @click="emit('close')"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </li>
        </ul>
      </nav>
      
    </header>

    <hr class="pico chatbot--separator" />

    <div class="chatbot--content chatbot--scroll pa-sm">
      <div v-for="(msg, index) in messages" :key="index">
        <div :class="`chatbot-message chatbot-message--${msg.role.toLowerCase()}`">
          <div class="bubble">
            <strong>{{ msg.role === 'user' ? 'You' : 'Bot' }}:</strong> {{ msg.content }} 
          </div>
        </div>
      </div>
      <div v-if="isBusy" class="chatbot-message chatbot-message--assistant">
        <div class="bubble typing">
          <span class="dot" v-for="i in 3" :key="i"></span>
        </div>
      </div>
    </div>
    
    <footer class="chatbot--user-form mt-sm">
      <form class="pico" @submit.prevent.stop="onSubmit">
        <fieldset role="group">
          <textarea 
            name="userInput"
            rows="3"
            class="chatbot--input"
            v-model="userInput"
            placeholder="Type your message..." 
          />
          <input class="pico-btn-sm" type="submit" value="Send" :disabled="isBusy" />
        </fieldset>
      </form>
    </footer>

  </article>
</template>

<style lang="scss" scoped>
.pico input, .pico optgroup, .pico select, .pico textarea {
  line-height: var(--pico-line-height);
  font-size: 0.75rem;
}

.chatbot {
  &--separator {
    margin: 0.25rem;
  }
  &--close {
    width: 1rem;
    height: 1rem;
    cursor: pointer;
    background-image: var(--pico-icon-close);
    &:hover {
      opacity: 0.7;
      transform: scale(1.25);
    }
  }
  &--input {
    font-size: 0.85rem;
  }
  &--user-form * input, textarea {
    font-size: 0.85rem;
  }
  &--container {
    display: flex;
    flex-direction: column;
    height: 700px;
    max-height: 80vh;
    min-width: 300px;
    max-width: 40vw;
    border: 1px solid var(--pico-secondary-border);
  }
}

.chatbot--scroll {
  flex: 1 1 auto;
  overflow-y: auto;
  max-height: none; // Remove max-height if you want it to fill the space
  height: auto;     // Let flexbox control the height
  padding-right: 4px;  /* To prevent scrollbar overlap */
  background: var(--pico-bmi-card-background-color);
  border-radius: var(--pico-border-radius);
}

.chatbot-message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 12px;
  font-size: 0.9rem !important;

  &--user {
    align-items: flex-end;
    .bubble {
      background: $primary;
      color: white;
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 16px;
      align-self: flex-end;
    }
  }

  &--assistant {
    align-items: flex-start;
    .bubble {
      background: $secondary;
      color: white;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 16px;
      align-self: flex-start;
    }
  }

  .bubble {
    padding: 10px 16px;
    margin: 0 8px;
    max-width: 80%;
    word-break: break-word;
    border-radius: 16px;
    font-size: 1rem;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    position: relative;
  }

  .bubble.typing {
    display: flex;
    align-items: center;
    min-width: 44px;
    min-height: 24px;
    background: $secondary;
    color: white;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 16px;
    align-self: flex-start;
    /* Inherit padding/margin from .bubble */
  }

  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    margin: 0 3px;
    background: white;
    border-radius: 50%;
    opacity: 0.7;
    transform: scale(1);
    animation: typing-wave 1.2s infinite;
  }

  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }
  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing-wave {
    0%, 80%, 100% {
      opacity: 0.7;
      transform: scale(1);
    }
    40% {
      opacity: 1;
      transform: scale(1.5);
    }
  }
}

</style>