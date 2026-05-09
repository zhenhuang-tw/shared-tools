<!-- pages/index.vue -->
<template>
  <div>
    <hgroup>
      <h1>{{ appConfig.site.name }}</h1>
      <p>選擇工具以開始使用</p>
    </hgroup>

    <div class="tool-grid">
      <template v-for="tool in tools" :key="tool.id">
        <ToolCard
          :title="tool.title"
          :description="tool.description"
          :to="tool.to"
          :coming-soon="tool.comingSoon"
          :children="tool.children"
          @open-modal="openModal(tool)"
        >
          <template #icon>
            <component :is="tool.icon" />
          </template>
        </ToolCard>
      </template>
    </div>

    <!-- Modal 實體放在 grid 外，避免佔據 grid cell -->
    <template v-for="tool in tools" :key="`modal-${tool.id}`">
      <ToolModal
        v-if="tool.children?.length"
        :ref="(el) => setModalRef(tool.id, el)"
        :title="tool.title"
        :description="tool.description"
        :children="tool.children"
      >
        <template #icon>
          <component :is="tool.icon" />
        </template>
      </ToolModal>
    </template>
  </div>
</template>

<script setup lang="ts">
import { h, type Component } from 'vue'
import type { ToolDef } from '~/types/tool'

const appConfig = useAppConfig()
useHead({ title: 'Tool List' })

// ── SVG icon 定義（functional component，避免污染 template） ──

const IconPdf: Component = () =>
  h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
    h('polyline', { points: '14 2 14 8 20 8' }),
    h('line', { x1: '16', y1: '13', x2: '8', y2: '13' }),
    h('line', { x1: '16', y1: '17', x2: '8', y2: '17' }),
    h('polyline', { points: '10 9 9 9 8 9' }),
  ])

const IconTypeset: Component = () =>
  h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('line', { x1: '3', y1: '6', x2: '21', y2: '6' }),
    h('line', { x1: '3', y1: '12', x2: '21', y2: '12' }),
    h('line', { x1: '3', y1: '18', x2: '15', y2: '18' }),
  ])

const IconSearch: Component = () =>
  h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('circle', { cx: '11', cy: '11', r: '8' }),
    h('line', { x1: '21', y1: '21', x2: '16.65', y2: '16.65' }),
  ])

const IconSymbol: Component = () =>
  h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M4 7V4h16v3' }),
    h('path', { d: 'M9 20h6' }),
    h('path', { d: 'M12 4v16' }),
  ])

const IconLaw: Component = () =>
  h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M12 2L2 7l10 5 10-5-10-5z' }),
    h('path', { d: 'M2 17l10 5 10-5' }),
    h('path', { d: 'M2 12l10 5 10-5' }),
  ])

const IconCourses: Component = () =>
  h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M22 10v6M2 10l10-5 10 5-10 5z' }),
    h('path', { d: 'M6 12v5c3 3 9 3 12 0v-5' }),
  ])

// ── 工具定義 ──

type LocalToolDef = Omit<ToolDef, 'icon'> & { icon: Component }

const tools: LocalToolDef[] = [
  {
    id: 'pdf',
    icon: IconPdf,
    title: 'PDF 工具箱',
    description: '均於瀏覽器端處理，維護資安',
    children: [
      { to: '/pdf/merge', label: '合併 PDFs', description: '支援多檔案，且容許調整次序' },
      { to: '/pdf/metadata', label: '編輯 Metadata', description: '修改標題、作者等元資訊及檔名' },
      { to: '/pdf/extract', label: '擷取 PDF 頁面', description: '從多頁 PDF 中分離出您指定的特定頁碼範圍' },
      { to: '/pdf/rotate', label: '旋轉頁面', description: '可旋轉 90, 180, 270 度' },
      { to: '/pdf/swap', label: 'PDF 頁面排序修正', description: '將單雙頁順序互換 (例如: 1,2 → 2,1)' },
      { to: '/pdf/halve', label: '對半裁切 PDF', description: '把雙頁掃描的 PDF 裁切成單頁' },
    ],
  },
  {
    id: 'typeset',
    to: '/chinese-typesetting',
    icon: IconTypeset,
    title: '漢文格式化排版',
    description: '預設用以處理 OCR 後的中文段落',
  },
  {
    id: 'search',
    icon: IconSearch,
    title: '資料搜尋',
    description: '字典／法律資料',
    children: [
      { to: '/dictionary', label: '語言學習', description: '快速查英文、法文、日文字典 ' },
      { to: '/search-juris', label: '法學資料檢索', description: '一個頁面，查法規和裁判' },
    ],
  },
  {
    id: 'symbols',
    to: '/symbols',
    icon: IconSymbol,
    title: '常用符號',
    description: '筆記用特殊符號快速複製',
  },
  {
    id: 'printlaw',
    to: '/Gesetz',
    icon: IconLaw,
    title: '極簡法典',
    description: '司律二試/執行官所附法條，每月更新',
    comingSoon: true,
  },
  {
    id: 'courses',
    icon: IconCourses,
    title: '臺北大學課程查詢',
    description: '響應式設計的課程查詢系統',
    comingSoon: true,
  },
]

// ── Modal 控制 ──

// 用 Map 儲存各 modal ref
const modalRefs = new Map<string, { open: () => void } | null>()

function setModalRef(id: string, el: unknown) {
  if (el && typeof (el as { open: () => void }).open === 'function') {
    modalRefs.set(id, el as { open: () => void })
  }
}

function openModal(tool: LocalToolDef) {
  modalRefs.get(tool.id)?.open()
}
</script>

<style scoped>
hgroup {
  margin-bottom: var(--pico-spacing);
}

hgroup h1 {
  font-size: 1.4rem;
  margin-bottom: 0.2rem;
}

hgroup p {
  font-size: 0.875rem;
  color: var(--pico-muted-color);
  margin: 0;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--pico-spacing);
}
</style>