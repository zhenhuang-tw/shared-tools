<template>
  <div>
    <hgroup>
      <h1>{{ appConfig.site.name }}</h1>
      <p>選擇工具以開始使用</p>
    </hgroup>

    <div class="tool-grid">
      <ToolCard
        v-for="tool in tools"
        :key="tool.to"
        :to="tool.to"
        :icon="tool.icon"
        :title="tool.title"
        :description="tool.description"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const appConfig = useAppConfig()

const tools = [
  {
    to: '/pdf',
    icon: '📄',
    title: 'PDF 工具箱',
    description: '分割、旋轉或編輯 PDF 的 Metadata',
  },
  {
    to: '/chinese-typesetting',
    icon: '漢',
    title: '漢文格式化排版',
    description: '處理 OCR 後的中文段落排版',
  },
  {
    to: '/search',
    icon: '🔍',
    title: '資料搜尋',
    description: '字典與法律資料查詢',
  },
  {
    to: '/symbols',
    icon: '※',
    title: '常用符號',
    description: '筆記用特殊符號快速複製',
  },
  {
    to: '/printlaw',
    icon: '⚖️',
    title: '極簡法典',
    description: '法條本瀏覽',
  },
  {
    to: '/ntpu-courses',
    icon: '🎓',
    title: '臺北大學課程查詢',
    description: '響應式課程查詢系統',
  },
]
</script>

<style scoped>
hgroup {
  margin-bottom: var(--pico-spacing);
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--pico-spacing);
}
</style>