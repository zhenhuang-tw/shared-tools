<template>
  <article class="split-container">
    <header class="text-center">
      <h2>{{ pageTitle }}</h2>
      <p>{{ pageDesc }}</p>
    </header>

    <main class="split-layout">
      
      <div class="info-section">
        <h3>工作原理</h3>
        <p>
          本工具會自動判斷 PDF 每一頁的長寬比例：
        </p>
        <ul>
          <li><strong>橫向頁面 (寬 > 高)：</strong>將自動從中間<strong>垂直分割</strong>為左右兩頁 (例如 A3 攤開版面轉為 2 頁 A4)。</li>
          <li><strong>縱向頁面 (高 > 寬)：</strong>將自動從中間<strong>水平分割</strong>為上下兩頁。</li>
        </ul>
        
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
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
            </svg>
            <p>點擊此處上傳 PDF<br /><small>或將檔案拖曳至此</small></p>
            <small>（只在瀏覽器端處理，確保資安）</small>
          </div>
          <div v-else class="drop-zone-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="success-icon">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>已選擇檔案：</p>
            <strong>{{ selectedFile.name }}</strong>
            <small class="mt-1">（點擊可重新選擇）</small>
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
          @click="splitPDF" 
          :disabled="!isProcessReady || isLoading"
          :aria-busy="isLoading"
          class="split-btn"
        >
          {{ isLoading ? loadingText : '開始分割 PDF' }}
        </button>
      </div>

    </main>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PDFDocument } from 'pdf-lib'

// --- SEO 與頁面資訊 ---
const pageTitle = 'PDF 書籍掃描分割工具'
const pageDesc = '自動將雙頁掃描的 PDF 分割成單頁，支援水平與垂直自動判斷'
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
const statusMessage = ref('')
const isError = ref(false)

// --- 計算屬性 ---
const isProcessReady = computed(() => selectedFile.value !== null)

// --- 檔案處理方法 ---
const triggerFileInput = () => {
  fileInput.value?.click()
}

const validateAndSetFile = (file: File | undefined | null) => {
  if (file && file.type === 'application/pdf') {
    selectedFile.value = file
    statusMessage.value = '檔案準備就緒。請點擊「開始分割 PDF」。'
    isError.value = false
  } else {
    selectedFile.value = null
    statusMessage.value = '請選擇一個有效的 PDF 檔案。'
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

// --- 核心邏輯：執行分割 ---
const splitPDF = async () => {
  if (!selectedFile.value) return

  setLoading(true, '讀取檔案中...')

  try {
    const arrayBuffer = await selectedFile.value.arrayBuffer()
    
    setLoading(true, '開啟 PDF 文件中...')
    const srcDoc = await PDFDocument.load(arrayBuffer)
    const newDoc = await PDFDocument.create()
    const numPages = srcDoc.getPageCount()

    // 遍歷來源 PDF 的每一頁
    for (let i = 0; i < numPages; i++) {
      setLoading(true, `處理中：第 ${i + 1} / ${numPages} 頁...`)

      const srcPage = srcDoc.getPage(i)
      const { width, height } = srcPage.getSize()

      // 嵌入原始頁面 (每一頁只需嵌入一次)
      const [embeddedPage] = await newDoc.embedPages([srcPage])

      if (width > height) {
        // --- 情況 A：橫向頁面 (寬 > 高)，垂直切割 ---
        const midX = width / 2
        const newPageSize: [number, number] = [midX, height]

        // 左半部
        const pageLeft = newDoc.addPage(newPageSize)
        pageLeft.drawPage(embeddedPage, { x: 0, y: 0, width, height })

        // 右半部 (向左平移)
        const pageRight = newDoc.addPage(newPageSize)
        pageRight.drawPage(embeddedPage, { x: -midX, y: 0, width, height })
      } else {
        // --- 情況 B：縱向頁面 (高 > 寬)，水平切割 ---
        const midY = height / 2
        const newPageSize: [number, number] = [width, midY]

        // 上半部 (向下平移，因 pdf-lib 座標原點在左下角)
        const pageTop = newDoc.addPage(newPageSize)
        pageTop.drawPage(embeddedPage, { x: 0, y: -midY, width, height })

        // 下半部
        const pageBottom = newDoc.addPage(newPageSize)
        pageBottom.drawPage(embeddedPage, { x: 0, y: 0, width, height })
      }
    }

    setLoading(true, '正在產生文件...')
    const pdfBytes = await newDoc.save()

    const originalName = selectedFile.value.name.replace(/\.pdf$/i, '')
    const newFileName = `${originalName}_split.pdf`

    downloadFile(pdfBytes, newFileName, 'application/pdf')
    resetUI(`成功！正在下載 ${newFileName}`)

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error('PDF 對半裁切過程中發生錯誤:', err)
    resetUI(`錯誤：${errorMessage}。請檢查控制台。`, true)
  }
}
</script>

<style scoped>
/* 共用樣式 */
.text-center {
  text-align: center;
}

.muted {
  color: var(--pico-muted-color);
}

.error-text {
  color: var(--pico-del-color);
}

.success-text {
  color: var(--pico-ins-color);
}

.mt-1 {
  margin-top: 0.25rem;
}

/* 佈局容器：手機版垂直，桌面版左右兩欄 */
.split-layout {
  display: grid;
  gap: calc(var(--pico-spacing) * 2);
  grid-template-columns: 1fr;
  margin-top: var(--pico-spacing);
}

@media (min-width: 768px) {
  .split-layout {
    grid-template-columns: 1fr 1fr;
    align-items: stretch;
  }
}

/* 左側資訊區塊 */
.info-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.status-box {
  margin-top: auto;
  padding: var(--pico-spacing);
  background-color: var(--pico-mark-background-color);
  border-radius: var(--pico-border-radius);
  border-left: 4px solid var(--pico-primary);
}

.status-box p {
  margin-bottom: 0;
}

/* 右側操作區塊 */
.action-section {
  display: flex;
  flex-direction: column;
  gap: var(--pico-spacing);
}

/* 拖放區域 (徹底修復亮/暗色模式文字問題) */
.drop-zone {
  flex-grow: 1; /* 讓拖曳區自動填滿剩餘高度 */
  border: 2px dashed var(--pico-form-element-border-color);
  border-radius: var(--pico-border-radius);
  padding: calc(var(--pico-spacing) * 2);
  text-align: center;
  cursor: pointer;
  /* 移除強制寫死的背景色，交由 Pico 原生控制 */
  transition: all 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 250px;
}

/* Hover 與 Drag-over 狀態只改變邊框與光暈，不改背景 */
.drop-zone:hover,
.drop-zone.drag-over {
  border-color: var(--pico-primary);
  box-shadow: 0 0 0 0.25rem var(--pico-form-element-focus-color);
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.primary-icon {
  color: var(--pico-primary);
  margin-bottom: var(--pico-spacing);
}

.success-icon {
  color: var(--pico-ins-color);
  margin-bottom: calc(var(--pico-spacing) / 2);
}

.split-btn {
  width: 100%;
  margin-bottom: 0;
}
</style>