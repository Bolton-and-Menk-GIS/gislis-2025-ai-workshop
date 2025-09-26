<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  api, 
} from '@/api'
import type { 
  AskPromptOptions, 
  AskPromptType 
} from '@/typings'

const busy = ref(true)
const question = ref('')
const temperature = ref(0.7)
const maxTokens = ref(1000)
const timeout = ref(180)
const model = ref('gpt-3.5-turbo')
const modelOptions = ref<string[]>([])
const promptTypes = ref<AskPromptOptions['options']>([])
const selectedPrompts = ref<AskPromptType[]>([])
const orderedSelection = computed(() => 
  promptTypes.value
    .filter(pt => selectedPrompts.value.includes(pt.name))
    .map(pt => pt.name)
)
const answers = ref<Partial<Record<AskPromptType, unknown>>>({})
const loading = ref<Partial<Record<AskPromptType, boolean>>>({})
const isThinking = computed(() => 
  Object.values(loading.value).some(v => v)
)

async function askQuestion() {
  for (const type of selectedPrompts.value) {
    loading.value[type] = true
    api.askQuestion({
      model: model.value, 
      text: question.value,
      prompt: type as AskPromptType,
      temperature: temperature.value,
      timeout: timeout.value,
      max_tokens: maxTokens.value,
    }).then(response => {
      answers.value = {
        ...answers.value,
        [type]: response.data.response
      }
      loading.value[type] = false
    }).catch(() => {
      loading.value[type] = false
    })
  }
}

onMounted(async () => {
  // Fetch available prompt types from /ask/prompts endpoint
  try {
    busy.value = true
    const response = await api.getAskPrompts({})
    promptTypes.value = response.data.options
    selectedPrompts.value = promptTypes.value.map(pt => pt.name)

    const modelResponse = await api.getModels({})
    modelOptions.value = modelResponse.data.models.map((m) => m.name)
  } catch(err){
    console.warn('Error fetching prompt types:', err)
  } finally {
    busy.value = false
  }
})
</script>

<template>
  <article class="pico pa-md">
    
    <div class="form-container mt-md">
      <form @submit.prevent="askQuestion" class="pico">
        <label for="question">Ask a question:</label>
        <fieldset role="group">
          <input id="question" v-model="question" type="text" placeholder="what do you want to know?" required />
          <input type="submit" value="Ask" :disabled="busy || isThinking" style="height: auto"/>
        </fieldset>

        <div class="grid ask-controls py-md">
          <div class="form-element answer-types">
            <div class="py-sm">Select answer types:</div>
            <label v-for="type in promptTypes" :key="type.name">
              <input type="checkbox" v-model="selectedPrompts" :value="type.name" />
              <span :data-tooltip="type.description" data-placement="right" style="border-bottom: unset;">{{ type.label }}</span>
            </label>
          </div>

          <div class="form-element">
            <label for="model">Model:</label>
            <select id="model" v-model="model">
              <option v-for="m in modelOptions" :key="m" :value="m">{{ m }}</option>
            </select>

            <label for="timeout">Timeout (in seconds)</label>
            <input id="timeout" type="number" min="30" max="400" v-model.number="timeout" />
          </div>

          <div class="form-element">
            <label for="temperature">Temperature: {{ temperature }}</label>
            <input id="temperature" type="range" min="0" max="2" step="0.1" v-model.number="temperature" />

            <label for="maxTokens">Max Tokens: {{ maxTokens }}</label>
            <input id="maxTokens" type="range" min="100" max="4096" step="100" v-model.number="maxTokens" />
          </div>

        </div>
  
      </form>
    </div>

    <hr class="pico py-lg" />

    <div class="answers grid" v-if="promptTypes.length">
      <div
        v-for="type in orderedSelection"
        :key="type"
        class="pico answer-card"
        :class="['contrast', { 
          'ask': type === 'ask', 
          'sassy': type === 'sassy', 
          'professor': type === 'professor', 
          'simple': type === 'simple', 
          'contrarian': type === 'contrarian', 
          }
        ]"
      >
        <h4 class="pico">{{ promptTypes.find(p => p.name === type)?.label }}</h4>
        <article class="pico" v-if="loading[type]" aria-busy="true">Thinking...</article>
        <p v-else class="answer-card--content">{{ answers[type] }}</p>
      </div>
    </div>
    <footer></footer>
  </article>

</template>

<style lang="scss">
.form-element {
  align-self: center;
  width: 80%;
}

.ask-controls {
  margin: 0 auto;
}

.answer-types{
  margin: 0 25%;
  width: 50%;
}

.answer-card {
  min-height: 250px;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: var(--pico-shadow-lg);
  &--content{
    max-height: 36vh;
    overflow-y: auto;
  }
  &.ask {
    // background-color: var(--pico-color-violet-50);
    border: 2px solid var(--pico-color-violet-200);
  }
  &.simple {
    // background-color: var(--pico-color-blue-50);
    border: 2px solid var(--pico-color-orange-150);
  }
  &.professor {
    // background-color: var(--pico-color-green-50);
    border: 2px solid var(--pico-color-green-200);
  }
  &.contrarian {
    // background-color: var(--pico-color-yellow-50);
    border: 2px solid var(--pico-color-yellow-200);
  }
  &.sassy {
    // background-color: var(--pico-color-pink-50);
    border: 2px solid var(--pico-color-red-400);
  }
}
</style>