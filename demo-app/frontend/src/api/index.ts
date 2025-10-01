import { Fetcher } from 'openapi-typescript-fetch'
import type { paths, components } from '@/generated/api'
import type { PDFResult, SurveyInfo, LegalDescriptionInfo } from '@/typings'

export const fetcher = Fetcher.for<paths>()

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Configure the fetcher with the API base URL
fetcher.configure({
  baseUrl
})

const multipartFormHeaders = {
  'Content-Type': 'multipart'
}


// Create API endpoints
export const api = {
  fetcher,
  baseUrl,
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
  /**
   * parse a pdf
   */
  parsePDF: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${baseUrl}/api/pdf/parse`, {
      method: 'POST',
      body: formData,
    })
    return await res.json() as PDFResult
  },
  /**
   * extract legal descriptions from a PDF survey drawing file
   */
  extractLegalDescriptions: async (file: File)=> {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${baseUrl}/api/survey/extract-legal-descriptions`, {
      method: 'POST',
      body: formData,
    })

    return await res.json() as LegalDescriptionInfo
  },
  /**
   * get survey info from a given legal description
   */
  getSurveyInfo: fetcher.path('/api/survey/get-survey-info').method('post').create(),

  /**
   * RAG comments query
   */
  askQuestionRAG: fetcher.path('/api/rag/query').method('post').create()
}
