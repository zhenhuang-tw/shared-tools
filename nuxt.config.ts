// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false, // 純靜態輸出
  
  // 引入 Pico CSS
  css: ['@picocss/pico/css/pico.min.css'],
})
