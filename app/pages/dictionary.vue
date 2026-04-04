<script setup lang="ts">
definePageMeta({
  breadcrumb: '字典查詢'
})
</script>

<template>
  <div>
    <!-- 頁面標題區 -->
    <hgroup>
      <h1>字典查詢</h1>
      <p>英文、法文、日文一次滿足</p>
    </hgroup>

    <!-- 三欄網格：Pico 的 .grid 在手機版會自動堆疊 -->
    <div class="grid">
      
      <!-- 英文區塊 -->
      <article>
        <header>
          <h2>🇬🇧 <span lang="en">English</span></h2>
        </header>

        <h3><span lang="en">Cambridge En-Zh</span></h3>
        <form action="https://dictionary.cambridge.org/zht/搜索/英語-漢語-繁體/direct/" method="get" target="_blank">
          <fieldset role="group">
            <input autocomplete="off" type="text" required name="q" placeholder="輸入單字..." />
            <button type="submit">搜尋</button>
          </fieldset>
        </form>

        <hr />

        <h3><span lang="en">Longman</span></h3>
        <form action="https://www.ldoceonline.com/search/english/direct/" method="get" target="_blank">
          <fieldset role="group">
            <input autocomplete="off" type="text" required name="q" placeholder="輸入單字..." />
            <button type="submit">搜尋</button>
          </fieldset>
        </form>
      </article>

      <!-- 法文區塊 -->
      <article>
        <header>
          <h2>🇫🇷 <span lang="fr">français</span></h2>
        </header>

        <h3><span lang="en">Cambridge Fr-En</span></h3>
        <form action="https://dictionary.cambridge.org/zht/搜索/法語-英語/direct/" method="get" target="_blank">
          <fieldset role="group">
            <input autocomplete="off" type="text" required name="q" placeholder="輸入單字..." />
            <button type="submit">搜尋</button>
          </fieldset>
        </form>

        <hr />

        <h3>法語助手</h3>
        <!-- 使用 a 標籤搭配 role="button" 達到按鈕效果，取代原有的 onclick -->
        <a href="https://www.frdic.com/" target="_blank" role="button" class="outline">前往法語助手</a>
      </article>

      <!-- 日文區塊 -->
      <article>
        <header>
          <h2>🇯🇵 <span lang="ja">日本語</span></h2>
        </header>

        <h3><span lang="en">Longman Ja-En</span></h3>
        <form action="https://www.ldoceonline.com/search/japanese-english/direct/" method="get" target="_blank">
          <fieldset role="group">
            <input autocomplete="off" type="text" required name="q" placeholder="輸入單字..." />
            <button type="submit">搜尋</button>
          </fieldset>
        </form>
      </article>

    </div>
  </div>
</template>

<style scoped>
/* 防止群組內的按鈕文字被擠壓換行 */
fieldset[role="group"] button {
  white-space: nowrap;
}

/* 調整卡片內的標題間距，讓排版更緊湊 */
article h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}
</style>