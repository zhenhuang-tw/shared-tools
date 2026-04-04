<template>
  <nav v-if="crumbs.length > 1" aria-label="breadcrumb">
    <ul>
      <li v-for="(crumb, i) in crumbs" :key="crumb.path">
        <NuxtLink v-if="i < crumbs.length - 1" :to="crumb.path">
          {{ crumb.label }}
        </NuxtLink>
        <span v-else aria-current="page">{{ crumb.label }}</span>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()

// 每個工具頁用 definePageMeta 設定 breadcrumb label
// 這裡從 route.meta 讀取
const crumbs = computed(() => {
  if (route.path === '/') return []
  return [
    { path: '/', label: '首頁' },
    { path: route.path, label: route.meta.breadcrumb as string ?? route.path },
  ]
})
</script>