<template>
  <article class="pdf-workspace">
    <header class="text-center">
      <h2>{{ pageTitle }}</h2>
      <p>{{ pageDesc }}</p>
    </header>

    <main class="grid-layout">
      <div class="info-section">
        <label for="page-range">
          <strong>請輸入要擷取的頁碼：</strong>
          <input 
            type="text" 
            id="page-range" 
            v-model="pageRangeInput" 
            placeholder="例如: 1, 3, 5-8" 
            :disabled="isLoading || !selectedFile"
          />
          <small class="muted">支援單頁與範圍，以逗號分隔。必須先上傳檔案才能輸入。</small>
        </label>
        
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <p>點擊此處上傳 PDF<br><small>或將檔案拖曳至此</small></p>
          </div>
          <div v-else class="drop-zone-content">
            <p>已選擇檔案 (總頁數: {{ totalPages }})：</p>
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
          {{ isLoading ? loadingText : '擷取並下載' }}
        </button>
      </div>
    </main>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PDFDocument } from 'pdf-lib'

const pageTitle = '擷取 PDF 頁面'
const pageDesc = '從多頁 PDF 中分離出您指定的特定頁碼範圍'
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
const pageRangeInput = ref('')
const totalPages = ref(0) // 記錄當前 PDF 總頁數

const isDragging = ref(false)
const isLoading = ref(false)
const loadingText = ref('')
const statusMessage = ref('')
const isError = ref(false)

// 需同時有檔案且輸入了頁碼才允許處理
const isProcessReady = computed(() => selectedFile.value !== null && pageRangeInput.value.trim() !== '')

const triggerFileInput = () => fileInput.value?.click()

const validateAndSetFile = async (file: File | undefined | null) => {
  if (file && file.type === 'application/pdf') {
    selectedFile.value = file
    try {
      // 預先讀取檔案以取得總頁數，幫助使用者輸入
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
      totalPages.value = pdfDoc.getPageCount()
      statusMessage.value = `檔案就緒，共 ${totalPages.value} 頁。請輸入要擷取的頁碼。`
      isError.value = false
    } catch (e) {
      selectedFile.value = null
      statusMessage.value = '無法讀取此 PDF 檔案，可能已加密或損毀。'
      isError.value = true
    }
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
  pageRangeInput.value = ''
  totalPages.value = 0
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

/**
 * 解析使用者輸入的頁碼字串 (例如 "1, 3, 5-8")
 * 轉為 zero-based 的陣列並去重
 */
const parsePageRange = (input: string, maxPages: number): number[] => {
  const indices: number[] = []
  const parts = input.split(',')
  
  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue

    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-')
      const start = parseInt(startStr, 10)
      const end = parseInt(endStr, 10)
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= maxPages) indices.push(i - 1)
        }
      }
    } else {
      const num = parseInt(trimmed, 10)
      if (!isNaN(num) && num >= 1 && num <= maxPages) {
        indices.push(num - 1)
      }
    }
  }
  // 去除重複並確保順序是由小到大
  return [...new Set(indices)].sort((a, b) => a - b)
}

const processPDF = async () => {
  if (!selectedFile.value || !pageRangeInput.value) return
  
  setLoading(true, '讀取檔案中...')

  try {
    const arrayBuffer = await selectedFile.value.arrayBuffer()
    const srcDoc = await PDFDocument.load(arrayBuffer)
    const maxPages = srcDoc.getPageCount()
    
    // 解析頁碼
    const indicesToExtract = parsePageRange(pageRangeInput.value, maxPages)
    
    if (indicesToExtract.length === 0) {
      throw new Error('解析不到有效的頁碼，請檢查輸入格式與範圍。')
    }

    setLoading(true, `準備擷取 ${indicesToExtract.length} 頁...`)
    const newDoc = await PDFDocument.create()
    
    const copiedPages = await newDoc.copyPages(srcDoc, indicesToExtract)
    copiedPages.forEach(page => newDoc.addPage(page))

    setLoading(true, '正在產生新文件...')
    const pdfBytes = await newDoc.save()
    const originalName = selectedFile.value.name.replace(/\.pdf$/i, '')
    downloadFile(pdfBytes, `${originalName}_extracted.pdf`, 'application/pdf')
    
    resetUI(`成功！已擷取 ${indicesToExtract.length} 頁。`)
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