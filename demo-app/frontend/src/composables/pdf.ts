import { ref, shallowRef, computed } from 'vue'
import { 
  api
} from '@/api'
import type { SurveyInfo } from '@/typings'
import type { ApiResponse } from 'openapi-typescript-fetch'

export const usePDF = ()=> {

  const file = shallowRef<File>()
  const progress = ref(0)
  const busy = ref(false)

  const progressMessages: Record<string, string> = {
    0: 'Processing PDF file',
    20: 'Extracting Legal Descriptions',
    50: 'Parsing Legal Descriptions',
    80: 'Fetching Survey Information',
    100: 'Complete',
  }

  const progressMessage = computed(()=> busy.value 
    ? progressMessages[progress.value] ?? 'processing'
    : ''
  )

  const {
    parsePDF,
    getSurveyInfo,
    extractLegalDescriptions
  } = api

  /**
   * uploads a pdf and extracts legal descriptions and survey infos
   * @returns 
   */
  const uploadFileAndExtractSurveyInfo = async ()=> {
    if (!file.value) {
      throw new Error('No file selected')
    }

    busy.value = true
    progress.value = 0

    try {
      // Step 1: Parse PDF 
      
      
      // Step 2: Extract Legal Descriptions 
      progress.value = 20
      const legalResp  = await extractLegalDescriptions(file.value)!
      
      // Step 3: Get Survey Info for each legal description (60-80%)
      progress.value = 50

      const proms: Promise<ApiResponse<SurveyInfo>>[] = []
      for (const legal of legalResp.legalDescriptions ?? []) {
        proms.push(getSurveyInfo({ 
          legalDescription: legal.text 
        }))
      }

      progress.value = 80

      const surveyInfoResults = await (await Promise.all(proms)).map(resp => resp.data)
      
      // Step 4: Complete (100%)
      progress.value = 100
      
      return {
        // pdfResult,
        surveyInfoResults,
        legalDescriptions: legalResp.legalDescriptions,
      }
      
    } catch (error) {
      console.error('Error processing PDF:', error)
      throw error
    } finally {
      busy.value = false
    }
  }

  const reset = ()=> {
    file.value = undefined
    progress.value = 0
    busy.value = false
  }

  return {
    file,
    busy,
    progress,
    reset,
    parsePDF,
    progressMessage,
    getSurveyInfo,
    extractLegalDescriptions,
    uploadFileAndExtractSurveyInfo,
  }
}