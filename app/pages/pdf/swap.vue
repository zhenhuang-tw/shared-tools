<template>
  <article class="pdf-workspace">
    <header class="text-center">
      <h2>{{ pageTitle }}</h2>
      <p>{{ pageDesc }}</p>
    </header>

    <main class="grid-layout">
      <div class="info-section">
        <h3>應用情境</h3>
        <p>
          當使用 vFlat 等掃描軟體以「雙頁模式」掃描書籍時，若左右頁設定錯誤，會導致最終輸出的 PDF 頁碼錯亂（例如 1,2 變成 2,1）。此工具會自動將所有「相鄰的奇偶頁」順序對調，修正此問題。
        </p>
        
        <div class="status-box" v-if="statusMessage || isError">
          <p :class="{ 'error-text': isError, 'success-text': !isError && selectedFile && !isLoading }">
            <strong>狀態：</strong>{{ statusMessage || '等待檔案上傳中...' }}
          </p>
        </div>
      </div>

      <div class="action-section">
        <div
          class="drop-zone"
          :class="{ 'drag-over': isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
          role="button"
          tabindex="0"
          aria-label="上傳 PDF 檔案"
        >
          <div v-if="!selectedFile" class="drop-zone-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="primary-icon">
              <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
            </svg>
            <p>點擊此處上傳 PDF<br><small>或將檔案拖曳至此</small></p>
          </div>
          <div v-else class="drop-zone-content">
            <p>已選擇檔案：</p>
            <strong>{{ selectedFile.name }}</strong>
            <small class="muted mt-1">點擊可重新選擇</small>
          </div>
          
          <input
            type="file"
            ref="fileInput"
            accept="application/pdf"
            style="display: none;"
            @change="handleFileChange"
          />
        </div>

        <button 
          @click="processPDF" 
          :disabled="!isProcessReady || isLoading"
          :aria-busy="isLoading"
        >
          {{ isLoading ? loadingText : '修正排序並下載' }}
        </button>
      </div>
    </main>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PDFDocument } from 'pdf-lib'

const pageTitle = 'PDF 頁面排序修正'
const pageDesc = '將單雙頁順序互換 (例如: 1,2 → 2,1)'
useHead({ title: pageTitle })
useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  description: pageDesc,
  ogDescription: pageDesc,
})
definePageMeta({ breadcrumb: pageTitle })

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const isLoading = ref(false)
const loadingText = ref('')
const statusMessage = ref('')
const isError = ref(false)

const isProcessReady = computed(() => selectedFile.value !== null)

const triggerFileInput = () => fileInput.value?.click()

const validateAndSetFile = (file: File | undefined | null) => {
  if (file && file.type === 'application/pdf') {
    selectedFile.value = file
    statusMessage.value = '檔案準備就緒。'
    isError.value = false
  } else {
    selectedFile.value = null
    statusMessage.value = '請選擇一個有效的 PDF 檔案。'
    isError.value = true
  }
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) validateAndSetFile(target.files[0])
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    validateAndSetFile(event.dataTransfer.files[0])
    if (fileInput.value) fileInput.value.value = ''
  }
}

const setLoading = (loading: boolean, text: string = '') => {
  isLoading.value = loading
  loadingText.value = text
  if (loading) {
    statusMessage.value = text
    isError.value = false
  }
}

const resetUI = (message: string, error: boolean = false) => {
  setLoading(false)
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
  statusMessage.value = message
  isError.value = error
}

const downloadFile = (data: Uint8Array, fileName: string, mimeType: string) => {
  const blob = new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const processPDF = async () => {
  if (!selectedFile.value) return
  setLoading(true, '讀取檔案中...')

  try {
    const arrayBuffer = await selectedFile.value.arrayBuffer()
    const srcDoc = await PDFDocument.load(arrayBuffer)
    const newDoc = await PDFDocument.create()
    const pageCount = srcDoc.getPageCount()
    
    setLoading(true, '計算新排序...')
    const newIndices: number[] = []
    for (let i = 0; i < pageCount; i += 2) {
      if (i + 1 < pageCount) {
        newIndices.push(i + 1, i)
      } else {
        newIndices.push(i) // 處理總頁數為奇數時的最後一頁
      }
    }

    setLoading(true, '正在重建文件...')
    const copiedPages = await newDoc.copyPages(srcDoc, newIndices)
    copiedPages.forEach(page => newDoc.addPage(page))

    const pdfBytes = await newDoc.save()
    const originalName = selectedFile.value.name.replace(/\.pdf$/i, '')
    downloadFile(pdfBytes, `${originalName}_swap.pdf`, 'application/pdf')
    resetUI(`成功！正在下載 ${originalName}_swap.pdf`)
  } catch (err) {
    console.error('處理失敗:', err)
    resetUI(`錯誤：${err instanceof Error ? err.message : String(err)}`, true)
  }
}
</script>

<style scoped>
.text-center { text-align: center; }
.muted { color: var(--pico-muted-color); }
.error-text { color: var(--pico-del-color); }
.success-text { color: var(--pico-ins-color); }
.mt-1 { margin-top: 0.25rem; }

.grid-layout {
  display: grid;
  gap: calc(var(--pico-spacing) * 2);
  grid-template-columns: 1fr;
}
@media (min-width: 768px) {
  .grid-layout { grid-template-columns: 1fr 1fr; }
}

.info-section, .action-section {
  display: flex;
  flex-direction: column;
  gap: var(--pico-spacing);
}
.status-box {
  margin-top: auto;
  padding: var(--pico-spacing);
  background-color: var(--pico-mark-background-color);
  border-radius: var(--pico-border-radius);
  border-left: 4px solid var(--pico-primary);
}
.status-box p { margin-bottom: 0; }

.drop-zone {
  flex-grow: 1;
  border: 2px dashed var(--pico-form-element-border-color);
  border-radius: var(--pico-border-radius);
  padding: calc(var(--pico-spacing) * 2);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 250px;
}
.drop-zone:hover, .drop-zone.drag-over {
  border-color: var(--pico-primary);
  box-shadow: 0 0 0 0.25rem var(--pico-form-element-focus-color);
}
.drop-zone-content { display: flex; flex-direction: column; align-items: center; }
.primary-icon { color: var(--pico-primary); margin-bottom: var(--pico-spacing); }
</style>