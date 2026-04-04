<!-- components/ToolModal.vue -->
<template>
  <!-- Pico CSS 的 <dialog> 透過 open attribute 控制顯示 -->
  <dialog ref="dialogRef" @click.self="close" @cancel.prevent="close">
    <article>
      <header>
        <div class="modal-header-content">
          <div class="modal-icon-wrap">
            <slot name="icon" />
          </div>
          <div>
            <strong class="modal-title">{{ title }}</strong>
            <p v-if="description" class="modal-subtitle">{{ description }}</p>
          </div>
        </div>
        <button
          class="modal-close"
          aria-label="關閉"
          @click="close"
        >
          <!-- X icon -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </header>

      <p class="modal-hint">請選擇要使用的功能：</p>

      <div class="modal-children">
        <NuxtLink
          v-for="child in children"
          :key="child.to"
          :to="child.to"
          class="modal-child"
          @click="close"
        >
          <div class="modal-child__label">{{ child.label }}</div>
          <p v-if="child.description" class="modal-child__desc">{{ child.description }}</p>
          <!-- chevron right -->
          <svg class="modal-child__chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </NuxtLink>
      </div>
    </article>
  </dialog>
</template>

<script setup lang="ts">
import type { ToolChild } from '~/types/tool'

defineProps<{
  title: string
  description?: string
  children: ToolChild[]
}>()

const dialogRef = ref<HTMLDialogElement | null>(null)

function open() {
  dialogRef.value?.showModal()
}

function close() {
  dialogRef.value?.close()
}

defineExpose({ open, close })
</script>

<style scoped>
dialog {
  /* Pico 已提供基礎樣式，這裡只做微調 */
  max-width: 30rem;
  width: 90vw;
  padding: 0;
  border-radius: calc(var(--pico-border-radius) * 1.5);
  border: 1px solid var(--pico-muted-border-color);
}

dialog::backdrop {
  background: color-mix(in srgb, var(--pico-background-color) 20%, transparent);
  backdrop-filter: blur(3px);
}

dialog > article {
  margin: 0;
  padding: 1.25rem 1.5rem 1.5rem;
}

/* ── Header ── */
dialog > article > header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0;
  margin-bottom: 1rem;
  border-bottom: none;
  background: none;
}

.modal-header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-icon-wrap {
  flex-shrink: 0;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 0.5rem;
  background: color-mix(in srgb, var(--pico-primary) 12%, transparent);
  color: var(--pico-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-icon-wrap :deep(svg) {
  width: 1.2rem;
  height: 1.2rem;
  stroke-width: 1.75;
}

.modal-title {
  font-size: 1rem;
  font-weight: 600;
  display: block;
}

.modal-subtitle {
  margin: 0.15rem 0 0;
  font-size: 0.8rem;
  color: var(--pico-muted-color);
}

/* ── 關閉按鈕 ── */
.modal-close {
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--pico-muted-color);
  border-radius: var(--pico-border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s, background 0.15s;
}

.modal-close:hover {
  color: var(--pico-color);
  background: var(--pico-muted-border-color);
}

.modal-close svg {
  width: 1.1rem;
  height: 1.1rem;
}

/* ── 提示文字 ── */
.modal-hint {
  font-size: 0.8rem;
  color: var(--pico-muted-color);
  margin: 0 0 0.75rem;
}

/* ── 子選項列表 ── */
.modal-children {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.modal-child {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--pico-border-radius);
  border: 1px solid var(--pico-muted-border-color);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s, background 0.15s, transform 0.15s;
}

.modal-child:hover {
  border-color: color-mix(in srgb, var(--pico-primary) 50%, var(--pico-muted-border-color));
  background: color-mix(in srgb, var(--pico-primary) 5%, transparent);
  transform: translateX(2px);
}

.modal-child__label {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 500;
}

.modal-child__desc {
  flex: 2;
  margin: 0;
  font-size: 0.78rem;
  color: var(--pico-muted-color);
}

.modal-child__chevron {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  color: var(--pico-muted-color);
}
</style>