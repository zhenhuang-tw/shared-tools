<template>
  <footer>
    <small>
      © {{ year }} Zhen HUANG
    </small>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>