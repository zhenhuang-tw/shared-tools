<!-- components/ToolCard.vue -->
<template>
  <!-- coming-soon: 純展示，無互動 -->
  <article v-if="comingSoon" class="tool-card tool-card--disabled" aria-disabled="true">
    <div class="tool-card__inner">
      <div class="tool-icon-wrap tool-icon-wrap--muted">
        <slot name="icon" />
      </div>
      <div class="tool-card__body">
        <strong class="tool-card__title">{{ title }}</strong>
        <p class="tool-card__desc">{{ description }}</p>
      </div>
      <span class="tool-badge">即將上架</span>
    </div>
  </article>

  <!-- 有子項目：觸發 modal -->
  <article
    v-else-if="children && children.length"
    class="tool-card tool-card--clickable"
    role="button"
    tabindex="0"
    @click="$emit('open-modal')"
    @keydown.enter.space.prevent="$emit('open-modal')"
  >
    <div class="tool-card__inner">
      <div class="tool-icon-wrap">
        <slot name="icon" />
      </div>
      <div class="tool-card__body">
        <strong class="tool-card__title">{{ title }}</strong>
        <p class="tool-card__desc">{{ description }}</p>
      </div>
    </div>
  </article>

  <!-- 一般：直接導頁 -->
  <NuxtLink v-else :to="to" class="tool-card-link">
    <article class="tool-card tool-card--clickable">
      <div class="tool-card__inner">
        <div class="tool-icon-wrap">
          <slot name="icon" />
        </div>
        <div class="tool-card__body">
          <strong class="tool-card__title">{{ title }}</strong>
          <p class="tool-card__desc">{{ description }}</p>
        </div>
      </div>
    </article>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { ToolChild } from '~/types/tool'

defineProps<{
  to?: string
  title: string
  description: string
  comingSoon?: boolean
  children?: ToolChild[]
}>()

defineEmits<{
  'open-modal': []
}>()
</script>

<style scoped>
/* ── 連結包裝（消除底線與顏色） ── */
.tool-card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

/* ── 卡片基底 ── */
.tool-card {
  margin: 0;
  padding: var(--pico-spacing);
  border-radius: var(--pico-border-radius);
  border: 1px solid var(--pico-muted-border-color);
  background: var(--pico-card-background-color);
  transition: box-shadow 0.18s ease, transform 0.18s ease, border-color 0.18s ease;
  cursor: default;
  height: 100%;
}

.tool-card--clickable {
  cursor: pointer;
}

.tool-card--clickable:hover,
.tool-card--clickable:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--pico-primary) 12%, transparent);
  border-color: color-mix(in srgb, var(--pico-primary) 40%, var(--pico-muted-border-color));
  outline: none;
}

.tool-card--disabled {
  opacity: 0.55;
  position: relative;
}

/* ── 內部 flex 佈局 ── */
.tool-card__inner {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

/* ── 圖示容器 ── */
.tool-icon-wrap {
  flex-shrink: 0;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 0.5rem;
  background: color-mix(in srgb, var(--pico-primary) 12%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--pico-primary);
}

.tool-icon-wrap--muted {
  background: color-mix(in srgb, var(--pico-muted-color) 12%, transparent);
  color: var(--pico-muted-color);
}

.tool-icon-wrap :deep(svg) {
  width: 1.25rem;
  height: 1.25rem;
  stroke-width: 1.75;
}

/* ── 文字區塊 ── */
.tool-card__body {
  flex: 1;
  min-width: 0;
}

.tool-card__title {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--pico-contrast, var(--pico-h5-color, #1f2937));
  margin-bottom: 0.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-card__desc {
  margin: 0;
  font-size: 0.82rem;
  color: var(--pico-muted-color);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── 即將上架徽章 ── */
.tool-badge {
  flex-shrink: 0;
  font-size: 0.68rem;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--pico-muted-color) 14%, transparent);
  color: var(--pico-muted-color);
  white-space: nowrap;
  border: 1px solid var(--pico-muted-border-color);
}
</style>