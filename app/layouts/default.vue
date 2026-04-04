<template>
  <div class="app-shell">
    <AppNav />
    <div class="app-body">
      <AppBreadcrumb class="container" />
      <main class="container">
        <slot />
      </main>
    </div>
    <AppFooter class="container" />
  </div>
</template>

<style>

.app-body {
  /* Nav 高度補償，避免內容被蓋住 */
  padding-top: 4rem;
  padding-bottom: 2rem;
}
</style>