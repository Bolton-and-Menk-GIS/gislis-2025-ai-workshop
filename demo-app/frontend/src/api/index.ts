import { Fetcher } from 'openapi-typescript-fetch'
import type { paths, components } from '@/generated/api'

export const fetcher = Fetcher.for<paths>()

// Configure the fetcher with the API base URL
fetcher.configure({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000'
})

export type AskPromptType = components['schemas']['AskPromptOption']['name']
export type AskPromptOptions = components['schemas']['AskPromptOptions']


// Create API endpoints
export const api = {
  fetcher,
  // Assistant/Chat endpoints
  /**
   * health check endpoint
   */
  healthCheck: fetcher.path('/api/health/').method('get').create(),
  /**
   * fetch the available LLM's
   */
  getModels: fetcher.path('/api/assistant/models').method('get').create(),
  /**
   * ask a question to LLM
   */
  askQuestion: fetcher.path('/api/assistant/ask').method('post').create(),
  /**
   * get the available ask prompts
   */
  getAskPrompts: fetcher.path('/api/assistant/ask/prompts').method('get').create(),
}
