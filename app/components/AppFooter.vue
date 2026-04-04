<template>
  <footer>
    <small>
      © {{ year }} {{ appConfig.site.copyright }}
    </small>
  </footer>
</template>

<script setup lang="ts">
const appConfig = useAppConfig()
const year = new Date().getFullYear()
</script>