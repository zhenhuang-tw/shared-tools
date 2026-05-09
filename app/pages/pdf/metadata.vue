<template>
  <article>
    <header>
      <h2>{{pageTitle}}</h2>
      <p>{{pageDesc}}</p>
    </header>

    <main>
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
        <div v-if="!selectedFile">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--pico-primary);">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
          </svg>
          <p style="color: var(--pico-primary);">點擊此處上傳 PDF<br /><small>或將檔案拖曳至此</small></p>
          <small class="muted">(所有處理均在您的瀏覽器中完成)</small>
        </div>
        <div v-else>
          <p style="color: var(--pico-primary);">已選擇檔案：</p>
          <strong style="color: var(--pico-primary);">{{ selectedFile.name }}</strong>
        </div>
        
        <input
          type="file"
          ref="fileInput"
          accept="application/pdf"
          style="display: none;"
          @change="handleFileChange"
        />
      </div>

      <form v-if="!isLoading" @submit.prevent="processPDF">
        <label>
          作者 (選填)
          <input 
            type="text" 
            v-model="author" 
            placeholder="例如：王小明" 
          />
        </label>
        
        <label>
          日期 (選填)
          <input 
            type="text" 
            v-model="date" 
            placeholder="例如：2025 或 2025-10-27" 
          />
        </label>
        
        <label>
          文章標題 (必要)
          <input 
            type="text" 
            v-model="title" 
            placeholder="例如：論馬英九還牛之必要性" 
            required 
          />
        </label>
        
        <label>
          期刊 / 書籍名稱 (選填)
          <input 
            type="text" 
            v-model="journal" 
            placeholder="例如：福爾摩沙法學期刊" 
          />
        </label>

        <button type="submit" :disabled="!isProcessReady">
          處理並下載
        </button>
      </form>

      <div v-else class="loading-state">
        <button aria-busy="true" class="outline" disabled>
          {{ loadingText }}
        </button>
      </div>
    </main>

    <footer v-if="statusMessage" class="text-center">
      <small :class="{ 'error-text': isError }">{{ statusMessage }}</small>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PDFDocument } from 'pdf-lib' // 請確保已安裝此套件

// --- 狀態管理 ---

// DOM 參考
const fileInput = ref<HTMLInputElement | null>(null)

// 檔案與表單資料
const selectedFile = ref<File | null>(null)
const author = ref('')
const date = ref('')
const title = ref('')
const journal = ref('')

// UI 互動狀態
const isDragging = ref(false)
const isLoading = ref(false)
const loadingText = ref('')
const manualStatusMessage = ref('')
const isError = ref(false)

// --- 計算屬性 ---

// 判斷是否滿足處理條件（已選擇檔案且有填寫標題）
const isProcessReady = computed(() => {
  return selectedFile.value !== null && title.value.trim() !== ''
})

// 底部狀態訊息（自動根據當前表單狀態更新）
const statusMessage = computed(() => {
  if (manualStatusMessage.value) return manualStatusMessage.value
  if (!selectedFile.value) return '請先上傳 PDF 檔案。'
  if (!title.value.trim()) return '檔案準備就緒。請填寫「文章標題」。'
  return '準備就緒，可以開始處理。'
})

// --- 方法 ---

// 觸發隱藏的 file input
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 驗證並設定檔案
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

// 處理透過點擊上傳的檔案
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    validateAndSetFile(target.files[0])
  }
}

// 處理拖曳上傳的檔案
const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    validateAndSetFile(event.dataTransfer.files[0])
    // 清除 input 的值，避免相同檔案無法再次觸發 change 事件
    if (fileInput.value) fileInput.value.value = ''
  }
}

// 設定載入狀態
const setLoading = (loading: boolean, text: string = '') => {
  isLoading.value = loading
  loadingText.value = text
}

// 處理完成或發生錯誤時重置 UI
const resetUI = (message: string, error: boolean = false) => {
  setLoading(false)
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
  author.value = ''
  date.value = ''
  title.value = ''
  journal.value = ''
  manualStatusMessage.value = message
  isError.value = error
}

// 下載檔案輔助函式
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

// --- 核心邏輯：處理 PDF ---
const processPDF = async () => {
  if (!isProcessReady.value || !selectedFile.value) return

  setLoading(true, '正在處理 PDF...')
  manualStatusMessage.value = ''
  isError.value = false

  try {
    // 1. 將檔案讀取為 ArrayBuffer (取代原生的 FileReader callback 寫法)
    const arrayBuffer = await selectedFile.value.arrayBuffer()

    // 2. 載入來源 PDF
    const srcDoc = await PDFDocument.load(arrayBuffer)

    // 取得清除空白後的表單值
    const trimmedAuthor = author.value.trim()
    const trimmedDate = date.value.trim()
    const trimmedTitle = title.value.trim()
    const trimmedJournal = journal.value.trim()

    // 3. 修改 PDF Metadata
    if (trimmedAuthor) {
      srcDoc.setAuthor(trimmedAuthor)
    }
    
    if (trimmedJournal) {
      srcDoc.setTitle(`${trimmedTitle} (${trimmedJournal})`)
    } else {
      srcDoc.setTitle(trimmedTitle)
    }

    // 4. 產生新檔名（將字串中的空白換成底線）
    const sanitize = (str: string) => str.replace(/\s+/g, '_')
    const nameParts: string[] = []
    
    if (trimmedAuthor) nameParts.push(sanitize(trimmedAuthor))
    if (trimmedDate) nameParts.push(sanitize(trimmedDate))
    nameParts.push(sanitize(trimmedTitle)) // 標題是必要的
    if (trimmedJournal) nameParts.push(sanitize(trimmedJournal))

    // 每個元素之間以空格隔開
    const newFileName = `${nameParts.join(' ')}.pdf`

    // 5. 將修改後的 PDF 儲存為位元組
    setLoading(true, '正在產生文件...')
    const pdfBytes = await srcDoc.save()

    // 6. 觸發下載
    downloadFile(pdfBytes, newFileName, 'application/pdf')

    // 7. 重設 UI 狀態
    resetUI(`成功！正在下載 ${newFileName}`)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error('PDF 處理過程中發生錯誤:', err)
    resetUI(`錯誤：${errorMessage}。請檢查控制台。`, true)
  }
}

const pageTitle = 'PDF Metadata 編輯工具'
const pageDesc = '修改 PDF 的 Metadata 並重新命名檔案'
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
</script>

<style scoped>
/* 讓文字置中，Pico 原生無特別處理文字置中 utility */
.text-center {
  text-align: center;
}

/* 拖放區域的客製化樣式，利用 Pico CSS 自訂變數保持設計語言一致 */
.drop-zone {
  border: 2px dashed var(--pico-form-element-border-color);
  border-radius: var(--pico-border-radius);
  padding: calc(var(--pico-spacing) * 2);
  text-align: center;
  cursor: pointer;
  background-color: var(--pico-form-element-background-color);
  transition: all var(--pico-transition);
  margin-bottom: var(--pico-spacing);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.drop-zone:hover,
.drop-zone.drag-over {
  border-color: var(--pico-primary);
  background-color: var(--pico-primary-background);
}

.drop-zone svg {
  margin-bottom: var(--pico-spacing);
}

.muted {
  color: var(--pico-muted-color);
}

.error-text {
  color: var(--pico-del-color);
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: var(--pico-spacing) 0;
}
</style>