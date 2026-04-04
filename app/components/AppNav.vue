<template>
  <nav class="app-nav">
    <ul>
      <li>
        <NuxtLink to="/" class="nav-brand">🧰 工具盒</NuxtLink>
      </li>
    </ul>
    <ul>
      <li>
        <a
          :href="appConfig.site.githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <!-- GitHub SVG icon -->
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
          </svg>
        </a>
      </li>
      <li>
        <button
          class="theme-toggle"
          :aria-label="isDark ? '切換亮色模式' : '切換暗色模式'"
          @click="toggleTheme"
        >
          {{ isDark ? '☀️' : '🌙' }}
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
const appConfig = useAppConfig()

const isDark = ref(false)

// 初始化：讀取系統偏好或本地儲存
onMounted(() => {
  const stored = localStorage.getItem('theme')
  if (stored) {
    isDark.value = stored === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
})

function toggleTheme() {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  applyTheme()
}

function applyTheme() {
  document.documentElement.setAttribute(
    'data-theme',
    isDark.value ? 'dark' : 'light'
  )
}
</script>

<style scoped>
.app-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 0 var(--pico-spacing);
  background: var(--pico-background-color);
  border-bottom: 1px solid var(--pico-muted-border-color);
}

.nav-brand {
  font-weight: 700;
  text-decoration: none;
}

.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1.1rem;
  line-height: 1;
}
</style>