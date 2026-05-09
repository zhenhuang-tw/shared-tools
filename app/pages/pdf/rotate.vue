<template>
  <article>
    <header>
      <h2>{{ pageTitle }}</h2>
      <p>{{ pageDesc }}</p>
    </header>

    <main>
      <div v-if="!isLoading" class="pdf-workspace">
        
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
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--pico-primary);">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
            </svg>
            <p>點擊此處上傳 PDF<br><small>或將檔案拖曳至此</small></p>
            <small class="muted">(所有處理均在您的瀏覽器中完成)</small>
          </div>
          <div v-else class="drop-zone-content">
            <p>已選擇檔案：</p>
            <strong>{{ selectedFile.name }}</strong>
          </div>
          
          <input
            type="file"
            ref="fileInput"
            accept="application/pdf"
            style="display: none;"
            @change="handleFileChange"
          />
        </div>

        <div class="action-buttons">
          <button 
            @click="performRotation(90)" 
            :disabled="!isProcessReady"
            class="rotate-btn outline"
          >
            <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" /></svg>
            <span>旋轉 90°</span>
          </button>
          <button 
            @click="performRotation(180)" 
            :disabled="!isProcessReady"
            class="rotate-btn outline"
          >
            <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2A8.001 8.001 0 0019.418 15m0 0H15" /></svg>
            <span>旋轉 180°</span>
          </button>
          <button 
            @click="performRotation(270)" 
            :disabled="!isProcessReady"
            class="rotate-btn outline"
          >
            <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 15l-6-6m0 0l6-6m-6 6h12a6 6 0 010 12h-3" /></svg>
            <span>旋轉 270°</span>
          </button>
        </div>

      </div>

      <div v-else class="loading-state">
        <button aria-busy="true" class="outline" disabled>
          {{ loadingText }}
        </button>
      </div>
    </main>

    <footer v-if="statusMessage">
      <small :class="{ 'error-text': isError }">{{ statusMessage }}</small>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PDFDocument, degrees } from 'pdf-lib'

// --- SEO 與頁面資訊 ---
const pageTitle = 'PDF 旋轉工具'
const pageDesc = '將 PDF 中所有頁面旋轉 90, 180 或 270 度'
useHead({
  title: pageTitle
})
useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  description: pageDesc,
  ogDescription: pageDesc,
})
definePageMeta({
  breadcrumb: pageTitle
})

// --- 狀態管理 ---
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)

const isDragging = ref(false)
const isLoading = ref(false)
const loadingText = ref('')
const manualStatusMessage = ref('')
const isError = ref(false)

// --- 計算屬性 ---
const isProcessReady = computed(() => selectedFile.value !== null)

const statusMessage = computed(() => {
  if (manualStatusMessage.value) return manualStatusMessage.value
  if (!selectedFile.value) return '請先上傳 PDF 檔案。'
  return '檔案準備就緒。請選擇旋轉角度。'
})

// --- 檔案處理方法 ---
const triggerFileInput = () => {
  fileInput.value?.click()
}

const validateAndSetFile = (file: File | undefined | null) => {
  if (file && file.type === 'application/pdf') {
    selectedFile.value = file
    manualStatusMessage.value = ''
    isError.value = false
  } else {
    selectedFile.value = null
    manualStatusMessage.value = '請選擇一個有效的 PDF 檔案。'
    isError.value = true
  }
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    validateAndSetFile(target.files[0])
  }
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
}

const resetUI = (message: string, error: boolean = false) => {
  setLoading(false)
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
  manualStatusMessage.value = message
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

// --- 核心邏輯：執行旋轉 ---
const performRotation = async (angle: number) => {
  if (!selectedFile.value) return

  setLoading(true, `正在旋轉 ${angle} 度...`)
  manualStatusMessage.value = ''
  isError.value = false

  try {
    // 使用現代 API 取代 FileReader
    const arrayBuffer = await selectedFile.value.arrayBuffer()
    const srcDoc = await PDFDocument.load(arrayBuffer)
    const pages = srcDoc.getPages()
    
    // 遍歷每一頁並累加旋轉角度
    for (const page of pages) {
      const currentAngle = page.getRotation().angle
      const newAngle = (currentAngle + angle) % 360
      page.setRotation(degrees(newAngle))
    }

    setLoading(true, '正在產生文件...')
    const pdfBytes = await srcDoc.save()

    // 產生新檔名
    const originalName = selectedFile.value.name.replace(/\.pdf$/i, '')
    const newFileName = `${originalName}_rotated_${angle}.pdf`

    downloadFile(pdfBytes, newFileName, 'application/pdf')
    resetUI(`成功！正在下載 ${newFileName}`)

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error('PDF 處理過程中發生錯誤:', err)
    resetUI(`錯誤：${errorMessage}。請檢查控制台。`, true)
  }
}
</script>

<style scoped>
/* 共用樣式 */
.muted {
  color: var(--pico-muted-color);
}

.error-text {
  color: var(--pico-del-color);
}

/* 佈局容器：手機版預設垂直排列，桌面版轉為 2 欄 Grid */
.pdf-workspace {
  display: grid;
  gap: var(--pico-spacing);
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .pdf-workspace {
    /* 讓拖曳區佔據 2 份寬度，按鈕區佔據 1 份寬度 */
    grid-template-columns: 2fr 1fr;
  }
}

/* 拖放區域 */
.drop-zone {
  border: 2px dashed var(--pico-form-element-border-color);
  border-radius: var(--pico-border-radius);
  padding: calc(var(--pico-spacing) * 2);
  text-align: center;
  cursor: pointer;
  background-color: var(--pico-form-element-background-color);
  color: var(--pico-color); /* 確保文字顏色跟隨當前主題，解決對比度問題 */
  transition: all var(--pico-transition);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 250px; /* 給予適當的高度，讓桌面版與右側按鈕切齊 */
}

/* 移除會導致亮色模式文字看不清的實色背景，改用邊框高亮與光暈效果 */
.drop-zone:hover,
.drop-zone.drag-over {
  border-color: var(--pico-primary);
  box-shadow: 0 0 0 0.125rem var(--pico-form-element-focus-color);
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.drop-zone svg {
  margin-bottom: var(--pico-spacing);
}

/* 操作按鈕容器：改為垂直排列 */
.action-buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: calc(var(--pico-spacing) * 0.75);
}

.rotate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin-bottom: 0; /* 覆寫 Pico button 預設的 margin-bottom */
}

/* 載入狀態 */
.loading-state {
  display: flex;
  justify-content: center;
  padding: var(--pico-spacing) 0;
}
</style>