<template>
  <div class="typesetting-page">
    <hgroup>
      <h1>漢文排版格式化</h1>
      <p>為 OCR 辨識後的中文段落設計，所有處理均在瀏覽器本機完成</p>
    </hgroup>

    <div class="layout">

      <!-- 輸入區 -->
      <div class="pane">
        <div class="pane-header">
          <label for="input-text"><strong>原始文字輸入</strong></label>
          <button class="outline contrast clear-btn" @click="confirmClear">清空</button>
        </div>
        <textarea
          id="input-text"
          v-model="inputText"
          placeholder="請在此貼上文字⋯⋯本工具為 OCR 辨識後的排版處理而設計"
        />
      </div>

      <!-- 控制面板 -->
      <div class="control-panel">
        <article>

          <!-- 1. 斷行 -->
          <section>
            <h2>1. 斷行</h2>
            <label>
              <input type="radio" v-model="lineBreakOption" value="none" />
              保留原始斷行
            </label>
            <label>
              <input type="radio" v-model="lineBreakOption" value="all" />
              一律取消斷行
            </label>
            <label>
              <input type="radio" v-model="lineBreakOption" value="smart" />
              公文書模式
              <small>保留條、款、項、目編號前的換行</small>
            </label>
          </section>

          <hr />

          <!-- 2. 標點符號 -->
          <section>
            <h2>2. 標點符號</h2>
            <label>
              <input type="radio" v-model="punctOption" value="none" />
              保留原始全半形
            </label>
            <label>
              <input type="radio" v-model="punctOption" value="simple" />
              一般標點轉全形
              <small>逗號、分號、冒號等</small>
            </label>
            <label>
              <input type="radio" v-model="punctOption" value="aggressive" />
              所有標點轉全形
              <small>含括號，半形句點 (.) 原樣保留</small>
            </label>
          </section>

          <hr />

          <!-- 3. 空格 -->
          <section>
            <h2>3. 其它</h2>
            <label>
              <input type="checkbox" v-model="removeSpaces" />
              刪除所有空格
              <small>智慧辨識：保留拉丁字母間空格</small>
            </label>
          </section>

          <button @click="process">排版！</button>

        </article>
      </div>

      <!-- 輸出區 -->
      <div class="pane">
        <div class="pane-header">
          <label for="output-text"><strong>格式化結果</strong></label>
          <button class="outline" @click="copy" :disabled="!outputText">
            {{ copied ? '已複製！' : '複製文字' }}
          </button>
        </div>
        <textarea id="output-text" :value="outputText" readonly placeholder="結果將顯示於此⋯⋯" />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  breadcrumb: '漢文排版格式化'
})
useHead({ title: '漢文排版格式化' })

// --- 狀態 ---
const inputText = ref('')
const outputText = ref('')
const lineBreakOption = ref<'none' | 'all' | 'smart'>('all')
const punctOption = ref<'none' | 'simple' | 'aggressive'>('aggressive')
const removeSpaces = ref(true)
const copied = ref(false)

// --- 常數 ---
const fullWidthMap: Record<string, string> = {
  ',': '，', ';': '；', ':': '：', '?': '？', '!': '！',
  '(': '（', ')': '）', '[': '【', ']': '】', '{': '｛', '}': '｝',
}

// 公文書標題 regex：涵蓋條、款、項、目常見格式
// 壹、貳、... / 一、二、... / (一)(二)... / （一）（二）...
// 第N條 / 1. 2. / (1)(2)... / 【
const headerRegex = /^\s*(第[一二三四五六七八九十百千\d]+條|[壹貳參肆伍陸柒捌玖拾][、。]|[一二三四五六七八九十][、。]|\(\s*[一二三四五六七八九十]\s*\)|（\s*[一二三四五六七八九十]\s*）|\d+\.|（\s*\d+\s*）|\(\s*\d+\s*\)|【)/

// --- 核心邏輯 ---
function process() {
  if (!inputText.value) return
  let raw = inputText.value

  // 1. 斷行處理
  if (lineBreakOption.value === 'all') {
    raw = raw.replace(/\n/g, '')
  } else if (lineBreakOption.value === 'smart') {
    const lines = raw.split('\n')
    let processed = lines[0]?.trim() ?? ''
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      processed += headerRegex.test(line) ? '\n' + line : line
    }
    raw = processed
  }

  // 2. 標點轉全形
  if (punctOption.value === 'simple') {
    raw = raw.replace(/[,;:?!]/g, m => fullWidthMap[m])
  } else if (punctOption.value === 'aggressive') {
    raw = raw.replace(/[,;:?!()\[\]{}]/g, m => fullWidthMap[m])
  }

  // 3. 空格處理
  // Bug fix：改用 [^\S\n] 排除換行，避免 smart 模式保留的換行被吃掉
  if (removeSpaces.value) {
    raw = raw.replace(/([a-zA-Z])[^\S\n]+([a-zA-Z])/g, '$1__SPACE__$2')
    raw = raw.replace(/[^\S\n]+/g, '')
    raw = raw.replace(/__SPACE__/g, ' ')
  }

  outputText.value = raw
}

// --- 輔助 ---
function confirmClear() {
  if (confirm('確定要清空輸入框嗎？')) {
    inputText.value = ''
    outputText.value = ''
  }
}

let copyTimer: ReturnType<typeof setTimeout>
async function copy() {
  if (!outputText.value) return
  await navigator.clipboard.writeText(outputText.value)
  copied.value = true
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => { copied.value = false }, 2000)
}
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--pico-spacing);
}

@media (min-width: 1024px) {
  .layout {
    grid-template-columns: 1fr 280px 1fr;
    align-items: start;
  }
}

.pane {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pane textarea {
  min-height: 60vh;
  resize: vertical;
  font-size: 1rem;
  line-height: 1.8;
}

.pane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pane-header label {
  margin: 0;
}

.clear-btn {
  font-size: 0.85rem;
  padding: 0.2rem 0.6rem;
}

.control-panel article {
  position: sticky;
  top: 5rem; /* 避免被 fixed nav 蓋住 */
}

.control-panel section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0;
}

.control-panel h2 {
  font-size: 0.9rem;
  margin-bottom: 0.4rem;
}

.control-panel small {
  display: block;
  font-size: 0.75rem;
  color: var(--pico-muted-color);
  margin-top: 0.1rem;
  margin-left: 1.6rem;
}

.control-panel label {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0.4rem;
  margin-bottom: 0;
  cursor: pointer;
}

.control-panel button[type=button],
.control-panel button:not(.outline) {
  width: 100%;
  margin-top: 0.5rem;
}
</style>
