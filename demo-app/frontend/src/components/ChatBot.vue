<script lang="ts" setup>
import { ref } from 'vue'
import { useChatFeatures, type UseChatFeaturesOptions } from '@/composables';
import { useStorage } from '@vueuse/core';
import type { ChatMessage } from '@/typings';

interface Props extends UseChatFeaturesOptions{
  title?: string;
}

const { url, title='AI Assistant', storageKey='chat-messages', clearHistory=false } = defineProps<Props>();

const {
  isBusy,
  userInput,
  messages,
 } = useChatFeatures({
  url,
  storageKey,
  clearHistory,
  onMessageReceived: (msg: ChatMessage)=> {
    console.log('Message received in ChatBot component:', msg);
  },
  onConnected: (ws: WebSocket)=> {
    console.log('WebSocket connected in ChatBot component:', ws);
    messages.value.push({
      role: 'assistant',
      content: "Hello! I'm your AI assistant. How can I help you today?"
    });
  }
});


// const onUserInput = (e: Event) => {
//   e.preventDefault();
//   if (!e.target) return;
//   const textarea = e.target as HTMLTextAreaElement;
//   textarea.dataset.replicatedValue = userInput.value; // for auto-grow
// };


</script>

<template>
  <article class="pico chatbot--container pa-sm">
    <header>
      <nav class="px-md">
        <ul>
          <li><h4>{{ title }}</h4></li>
        </ul>
        <ul>
          <li><div class="chatbot--close pr-sm"></div></li>
        </ul>
        
      </nav>
      
    </header>
    <hr class="pico chatbot--separator" />

    <div class="chatbot--content chatbot--scroll pa-sm">
      <div v-for="(msg, index) in messages" :key="index" :class="`chat-bot--message chat-bot--message--${msg.role}`">
        <strong>{{ msg.role === 'user' ? 'You' : 'Bot' }}:</strong> {{ msg.content }} 
      </div>
      <div v-if="isBusy" class="chatbot-message chatbot-message--assistant">
        <div class="bubble typing">
          <span class="dot" v-for="i in 3" :key="i"></span>
        </div>
      </div>
    </div>

    
    <footer class="chatbot--user-form mt-sm">
      <form class="pico" @submit.prevent.stop>
        <fieldset role="group">
          <!-- <div class="grow-wrap"> -->
            <textarea 
              name="userInput"
              class="chatbot--input"
              v-model="userInput"
              placeholder="Type your message..." 
            />
          <!-- </div> -->
          <input type="submit" value="Send" style="height: auto;" />
        </fieldset>

        <!-- <input type="reset" value="Clear" @click="messages = []" style="height: auto; cursor: pointer;" /> -->
      
      </form>
    </footer>
  </article>
</template>

<style lang="scss">
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
  &--user-form {
    font-size: 0.85rem;
  }
  &--container {
    display: flex;
    flex-direction: column;
    height: 600px;
    max-height: 75vh;
    min-width: 400px;
    border: 1px solid var(--pico-secondary-border);
    // border: 1px solid #ddd;
  }
}
.chatbot--scroll {
  flex: 1 1 auto;
  overflow-y: auto;
  max-height: none; // Remove max-height if you want it to fill the space
  height: auto;     // Let flexbox control the height
  padding-right: 4px;
  background: var(--pico-bmi-card-background-color);
  border-radius: var(--pico-border-radius);
  // overflow-y: auto;
  // height: 500px;
  // max-height: 60vh;
  // padding-right: 4px; /* To prevent scrollbar overlap */
}
.chatbot-message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 12px;

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
    background: $primary;
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