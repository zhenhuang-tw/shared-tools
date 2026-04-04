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
    description: '分割、旋轉或編輯 PDF 的 Metadata',
    children: [
      { to: '/pdf/split', label: '分割 PDF', description: '依頁碼或範圍切割檔案' },
      { to: '/pdf/rotate', label: '旋轉頁面', description: '校正掃描方向' },
      { to: '/pdf/metadata', label: '編輯 Metadata', description: '修改標題、作者等資訊' },
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
      { to: '/search/dictionary', label: '字典查詢', description: '教育部國語辭典等詞典資料庫' },
      { to: '/search/law', label: '法律資料查詢', description: '法條、判決全文搜尋' },
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
    to: '/printlaw',
    icon: IconLaw,
    title: '極簡法典',
    description: '法條本瀏覽',
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

const appConfig = useAppConfig()

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