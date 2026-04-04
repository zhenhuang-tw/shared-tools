<template>
  <NuxtLink :to="to" class="tool-card">
    <article>
      <header>
        <span class="tool-icon" aria-hidden="true">{{ icon }}</span>
        <h3>{{ title }}</h3>
      </header>
      <p>{{ description }}</p>
    </article>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  to: string
  icon: string
  title: string
  description: string
}>()
</script>

<style scoped>
.tool-card {
  text-decoration: none;
  color: inherit;
  display: block;
}

.tool-card article {
  height: 100%;
  transition: box-shadow 0.2s, transform 0.2s;
}

.tool-card:hover article {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--pico-muted-border-color);
}

.tool-card article header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tool-icon {
  font-size: 1.4rem;
  line-height: 1;
}

h3 {
  margin: 0;
}
</style>