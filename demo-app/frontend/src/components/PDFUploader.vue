<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url'

const emit = defineEmits<{
  (e: 'upload', file: File): void;
  (e: 'reset'): void;
}>()

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const busy = ref(false)
const pdfFile = shallowRef<File | null>(null)
const thumbnailUrl = ref<string | null>(null)
const error = ref<string | null>(null)

const processFile = async (files: File[]) => {
  busy.value = true
  error.value = null
  try {
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type !== 'application/pdf') {
        error.value = 'Please upload a PDF file.'
        return
      }
      pdfFile.value = file
      await generateThumbnail(file)
    }
  } finally {
    busy.value = false
  }
} 

function handleDrop(e: DragEvent) {
  e.preventDefault()
  error.value = null
  const files = e.dataTransfer?.files
  processFile(files ? Array.from(files) : [])
}

function handleInput(e: Event) {
  const files = (e.target as HTMLInputElement).files
  processFile(files ? Array.from(files) : [])
}

async function generateThumbnail(file: File) {
  thumbnailUrl.value = null
  const reader = new FileReader()
  reader.onload = async (ev) => {
    try {
      const typedarray = new Uint8Array(ev.target!.result as ArrayBuffer)
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 1 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const context = canvas.getContext('2d')
      await page.render({ canvasContext: context!, viewport, canvas }).promise
      thumbnailUrl.value = canvas.toDataURL()
      emit('upload', file)
    } catch (err) {
      error.value = 'Failed to render PDF preview.'
      console.warn(err)
    }
  }
  reader.readAsArrayBuffer(file)
}

const reset = ()=> {
  pdfFile.value = null
  thumbnailUrl.value = null
  error.value = null
  busy.value = false
  emit('reset')
}
</script>

<template>
  <article class="pico pdf-uploader-card">
    <header class="pico px-md pt-sm">
      <h6>Upload PDF</h6>
    </header>
    <hr class="pico" />
    <div class="pdf-preview-container pa-md" v-if="thumbnailUrl">
      <div class="thumbnail-preview">
        
        <img :src="thumbnailUrl" alt="PDF thumbnail" />
        <calcite-button 
          class="thumbnail-clear float-right" 
          kind="danger" 
          scale="s" 
          icon-start="x-circle" 
          @click="reset"
          :disabled="busy"
        ></calcite-button>
        <div class="thumbnail-name">
          <small class="thumbnail-name">{{ pdfFile?.name ?? 'Uknown.pdf' }}</small>
        </div>
      </div>
    </div>

    <div
      v-else
      class="pdf-uploader"
      @dragover.prevent
      @drop="handleDrop"
    >
      <label class="drop-box contrast" for="pdf-input">
        <span v-if="!pdfFile">Drag & drop a PDF here or <u>click to select</u></span>
        <input
          id="pdf-input"
          type="file"
          accept="application/pdf"
          @change="handleInput"
          style="display: none"
        />
        <span v-if="error" class="text-danger">{{ error }}</span>
        
      </label>
    </div>
  </article>
</template>

<style lang="scss">
.pdf-uploader {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 220px;
  &-card {
    width: 400px;
    margin: auto;
  }
}

.drop-box {
  min-width: 320px;
  min-height: 180px;
  border: 2px dashed var(--pico-primary-border, #4B843A);
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
  position: relative;
}

.drop-box:hover,
.drop-box:focus-within {
  border-color: var(--pico-primary, #4B843A);
}

.thumbnail-preview {
  // margin: 0 auto;
  width: 100%;
  text-align: center;
  & img {
    max-width: 180px;
    max-height: 120px;
    border-radius: 0.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
}
</style>