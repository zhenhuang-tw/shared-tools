<template>
  <div class="app-shell">
    <AppNav />
    <div class="app-body">
      <AppBreadcrumb />
      <main class="container">
        <slot />
      </main>
    </div>
    <AppFooter />
  </div>
</template>

<style>
/* Nav 高度補償，避免內容被蓋住 */
.app-body {
  padding-top: 4rem;
}
</style>