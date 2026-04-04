// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false, // 純靜態輸出
  
  app: {
    head: {
      htmlAttrs: {
        lang: 'zh-TW'
      },
      title: '個人工具盒',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '僅供個人平時使用。' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: 'https://zhenhuang.tw/icon/favicon-16x16.png' }
      ]
    }
  },
  
  // 引入 Pico CSS
  css: ['@picocss/pico/css/pico.min.css'],
})
