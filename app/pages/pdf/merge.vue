<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { PDFDocument } from 'pdf-lib'
import type { PdfFileItem, MergeSettings } from '~/types/pdf'
import { executePdfMerge } from '~/utils/pdfMerge'

// SEO 與中繼資料設定
const pageTitle = 'PDF 合併工具'
const pageDesc = '在瀏覽器中輕鬆合併、重新排序 PDF 檔案，並自訂書籤與頁面大小。'

definePageMeta({ breadcrumb: 'PDF 合併工具' })
useHead({ title: pageTitle })
useSeoMeta({ description: pageDesc })

// 狀態管理
const isDragging = ref(false)
const isMerging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const files = ref<PdfFileItem[]>([])

const settings = reactive<MergeSettings>({
  filename: '',
  title: '',
  author: '',
  normalizePageSize: false,
  bookmarkMode: 'A2'
})

// 載入記憶的 Author
onMounted(() => {
  const savedAuthor = localStorage.getItem('pdfAuthor')
  if (savedAuthor) settings.author = savedAuthor
})

// 儲存 Author 到 localStorage
const saveAuthor = () => {
  localStorage.setItem('pdfAuthor', settings.author)
}

// 觸發隱藏的 file input
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 處理檔案拖放與選擇
const handleFiles = async (newFiles: FileList | File[]) => {
  const pdfFiles = Array.from(newFiles).filter(f => f.type === 'application/pdf')
  
  for (const file of pdfFiles) {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
        // 避免因 XRef table 損壞而失敗
        throwOnInvalidObject: false,
      })
      const totalPages = pdfDoc.getPageCount()
      
      files.value.push({
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        pdfDoc,
        totalPages,
        pageRange: `1-${totalPages}`
      })
    } catch (error) {
      alert(`無法載入 ${file.name}，請確認是否為有效的 PDF 檔案。`)
    }
  }
  
  // 重置 input，允許重複選取相同檔案
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const onFileDrop = (e: DragEvent) => {
  isDragging.value = false
  if (e.dataTransfer?.files) {
    handleFiles(e.dataTransfer.files)
  }
}

const onFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files) handleFiles(target.files)
}

// 檔案排序與移除
const moveFile = (index: number, direction: 'up' | 'down') => {
  if (direction === 'up' && index > 0) {
    const temp = files.value[index]
    files.value[index] = files.value[index - 1]
    files.value[index - 1] = temp
  } else if (direction === 'down' && index < files.value.length - 1) {
    const temp = files.value[index]
    files.value[index] = files.value[index + 1]
    files.value[index + 1] = temp
  }
}

const removeFile = (index: number) => {
  files.value.splice(index, 1)
}

// 產生合併檔名
const generateFilename = () => {
  if (settings.filename) return `${settings.filename}.pdf`
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}_merged.pdf`
}

// 執行合併
const handleMerge = async () => {
  if (files.value.length === 0) return alert('請先上傳 PDF 檔案')
  
  isMerging.value = true
  try {
    const blob = await executePdfMerge(files.value, settings)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = generateFilename()
    a.click()
    URL.revokeObjectURL(url)
  } catch (error: any) {
    alert(`合併失敗: ${error.message}`)
  } finally {
    isMerging.value = false
  }
}
</script>

<template>
  <div>
    <header>
      <hgroup>
        <h1>{{ pageTitle }}</h1>
        <p>{{ pageDesc }}</p>
      </hgroup>
    </header>

    <div class="grid layout-grid">
      
      <section>
        <article 
          class="drop-zone" 
          :class="{ 'is-dragging': isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onFileDrop"
          @click="triggerFileInput"
          role="button"
          tabindex="0"
        >
          <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <h3>拖曳 PDF 檔案至此，或點擊選擇檔案</h3>
          <p><small>支援多檔案上傳，所有處理均在瀏覽器本機完成。</small></p>
          <input 
            type="file" 
            ref="fileInputRef" 
            accept="application/pdf" 
            multiple 
            hidden 
            @change="onFileSelect"
          >
        </article>

        <div v-if="files.length > 0" class="file-list">
          <h3 class="list-title">已上傳檔案 ({{ files.length }})</h3>
          
          <article v-for="(file, index) in files" :key="file.id" class="file-item">
            <div class="file-info">
              <strong>{{ file.name }}</strong>
              <small>共 {{ file.totalPages }} 頁</small>
            </div>
            
            <div class="file-controls">
              <label>
                <small>頁面範圍</small>
                <input type="text" v-model="file.pageRange" placeholder="例如: 1-5,7,9-10">
              </label>
              
              <div class="actions">
                <button class="secondary outline" @click="moveFile(index, 'up')" :disabled="index === 0" title="上移">↑</button>
                <button class="secondary outline" @click="moveFile(index, 'down')" :disabled="index === files.length - 1" title="下移">↓</button>
                <button class="contrast outline" @click="removeFile(index)" title="移除">✕</button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <aside v-if="files.length > 0">
        <article>
          <header><strong>合併設定</strong></header>
          
          <details>
            <summary>檔案資訊 (Metadata)</summary>
            <label>
              合併後檔名
              <input type="text" v-model="settings.filename" placeholder="未填寫將自動產生 (無須加 .pdf)">
            </label>
            <label>
              PDF 標題 (Title)
              <input type="text" v-model="settings.title" placeholder="選填">
            </label>
            <label>
              PDF 作者 (Author)
              <input type="text" v-model="settings.author" @input="saveAuthor" placeholder="選填">
            </label>
          </details>

          <hr>

          <fieldset>
            <legend><strong>頁面布局</strong></legend>
            <label>
              <input type="checkbox" v-model="settings.normalizePageSize" role="switch">
              將所有頁面縮放至與第一頁相同寬度
            </label>
          </fieldset>

          <hr>

          <fieldset>
            <legend><strong>書籤處理方式</strong></legend>
            <label>
              <input type="radio" v-model="settings.bookmarkMode" value="A1">
              <strong>A1. 刪除所有書籤</strong> <small>(不包含任何書籤)</small>
            </label>
            <label>
              <input type="radio" v-model="settings.bookmarkMode" value="A2">
              <strong>A2. 為每個 PDF 建立書籤</strong> <small>(推薦，指向各自第一頁)</small>
            </label>
            <!-- 因為程式會太複雜，先不實作這部分 -->
            <!--
            <label>
              <input type="radio" v-model="settings.bookmarkMode" value="B1">
              <strong>B1. 保留原有書籤</strong> <small>(保留原始結構)</small>
            </label>
            <label>
              <input type="radio" v-model="settings.bookmarkMode" value="B2">
              <strong>B2. 建立父層並保留書籤</strong> <small>(將原書籤作為子書籤)</small>
            </label>
            -->
          </fieldset>

          <footer>
            <button class="primary" :aria-busy="isMerging" @click="handleMerge" :disabled="isMerging">
              {{ isMerging ? '處理中...' : '合併 PDF' }}
            </button>
          </footer>
        </article>
      </aside>

    </div>
  </div>
</template>

<style scoped>
/* RWD 網格：桌面版並排，縮小時堆疊 */
.layout-grid {
  gap: 2rem;
  align-items: start;
}
@media (max-width: 992px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
}

/* 拖放上傳區：使用 Pico CSS 的自訂變數確保亮暗色適應 */
.drop-zone {
  text-align: center;
  padding: 3rem 1rem;
  border: 2px dashed var(--pico-muted-border-color);
  background-color: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}
.drop-zone:hover {
  border-color: var(--pico-primary);
}
.drop-zone.is-dragging {
  border-color: var(--pico-primary);
  box-shadow: 0 0 0 0.25rem var(--pico-primary-focus);
  background-color: var(--pico-form-element-background-color);
}
.upload-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  color: var(--pico-muted-color);
}

/* 檔案列表樣式優化 */
.list-title {
  margin-top: 2rem;
}
.file-item {
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.file-info {
  flex: 1 1 200px;
  display: flex;
  flex-direction: column;
}
.file-info strong {
  word-break: break-all;
}
.file-controls {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}
.file-controls label {
  margin-bottom: 0;
  width: 150px;
}
.file-controls input {
  margin-bottom: 0;
}
.actions {
  display: flex;
  gap: 0.25rem;
}
.actions button {
  padding: 0.25rem 0.75rem;
  margin-bottom: 0;
}
</style>