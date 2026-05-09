// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  // 為了靜態生成 (SSG)，啟用 SSR，這樣 nuxt generate 才能產出 HTML
  ssr: true,

  nitro: {
    preset: 'github_pages',
    prerender: {
      crawlLinks: true, // 確保爬蟲抓取所有連結頁面
      failOnError: false, // 容許部分資源錯誤（如外部圖片）而不中斷部署
    }
  },
  
  app: {
    baseURL: '/labs/shared-tools', 
    head: {
      htmlAttrs: {
        lang: 'zh-TW'
      },
      titleTemplate: '%s - Zhen Toolkit',
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
