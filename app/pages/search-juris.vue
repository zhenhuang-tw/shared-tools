<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({
  breadcrumb: '法學資料檢索'
})

// 頁籤狀態切換
const activeTab = ref<'cons' | 'judg' | 'law'>('cons')

// 動態產生憲法法庭年度 (民國 111 年至今年)
const years = computed(() => {
  const currentYearTw = new Date().getFullYear() - 1911
  const list = []
  for (let y = currentYearTw; y >= 111; y--) {
    list.push(y)
  }
  return list
})
</script>

<template>
  <div>
    <!-- 頁面標題區 -->
    <hgroup>
      <h1>輕鬆檢索法學資料</h1>
      <p>一個網頁，查裁判與法規。</p>
    </hgroup>

    <!-- 頁籤導覽 -->
    <nav>
      <ul>
        <li>
          <button 
            :class="activeTab === 'cons' ? '' : 'outline contrast'" 
            @click="activeTab = 'cons'"
          >
            憲法法庭
          </button>
        </li>
        <li>
          <button 
            :class="activeTab === 'judg' ? '' : 'outline contrast'" 
            @click="activeTab = 'judg'"
          >
            法院裁判
          </button>
        </li>
        <li>
          <button 
            :class="activeTab === 'law' ? '' : 'outline contrast'" 
            @click="activeTab = 'law'"
          >
            全國法規
          </button>
        </li>
      </ul>
    </nav>

    <!-- 內容區塊 -->
    <article>
      <!-- 憲法法庭 -->
      <div v-if="activeTab === 'cons'">
        <h2>憲法法庭判決 (憲判字)</h2>
        <form action="https://cons.judicial.gov.tw/docredirect.aspx" target="_blank">
          <fieldset role="group">
            <select name="year" required>
              <option v-for="y in years" :key="y" :value="y">{{ y }}年</option>
            </select>
            <input type="text" value="憲判字" disabled style="max-width: 6em; text-align: center;" />
            <input type="hidden" name="word" value="憲判" />
            <input type="hidden" name="type" value="2" />
            <input type="number" placeholder="第「...」號" name="no" required />
            <button type="submit">送出</button>
          </fieldset>
        </form>
        <p style="text-align: right;">
          <a href="https://cons.judicial.gov.tw/judcurrentNew1.aspx?fid=38" target="_blank">憲法法庭判決 (列表)</a>
        </p>

        <hr />

        <h2>大法官解釋</h2>
        <form action="https://cons.judicial.gov.tw/docredirect.aspx" method="get" target="_blank">
          <input type="hidden" name="type" value="1" />
          <fieldset role="group">
            <input type="number" name="no" placeholder="直接輸入：釋字第「...」號" required />
            <button type="submit">送出</button>
          </fieldset>
        </form>
        <p style="text-align: right;">
          <a href="https://cons.judicial.gov.tw/judcurrent.aspx?fid=2195" target="_blank">大法官解釋 (列表)</a>
        </p>
      </div>

      <!-- 法院裁判 -->
      <div v-if="activeTab === 'judg'">
        <h2>裁判書查詢</h2>
        
        <!-- 電腦版 -->
        <form class="desktop-only" action="https://judgment.judicial.gov.tw/FJUD/qryresult.aspx" method="get" target="_blank">
          <fieldset role="group">
            <input type="text" name="akw" placeholder="法院名稱、裁判案號、案由、全文檢索字詞..." required />
            <button type="submit">搜尋</button>
          </fieldset>
        </form>

        <!-- 行動版 -->
        <form class="mobile-only" action="https://judgment.judicial.gov.tw/LAW_Mobile_FJUD/FJUD/qryresult.aspx" method="get" target="_blank">
          <fieldset role="group">
            <input type="text" name="kw" placeholder="關鍵字..." required />
            <button type="submit">搜尋</button>
          </fieldset>
        </form>

        <p style="text-align: right;">
          <a href="https://judgment.judicial.gov.tw/" target="_blank">司法院法學資料檢索系統 - 裁判書系統</a>
        </p>
      </div>

      <!-- 全國法規 -->
      <div v-if="activeTab === 'law'">
        <h2>全國法規資料庫 - 中央法規</h2>
        <form action="https://law.moj.gov.tw/Law/LawSearchResult.aspx" method="get" target="_blank">
          <fieldset role="group">
            <input type="text" name="kw" placeholder="輸入法規的名稱" required />
            <input type="hidden" name="cur" value="Ln" />
            <input type="hidden" name="ty" value="LAW" />
            <button type="submit">送出</button>
          </fieldset>
        </form>
        <p style="text-align: right;">
          <a href="https://law.moj.gov.tw/Law/LawSearchLaw.aspx" target="_blank">中央法規 - 全國法規資料庫</a>
        </p>

        <hr />

        <h2>常用六法「編章節」目錄</h2>
        <div class="law-links">
          <a href="https://law.moj.gov.tw/LawClass/LawAllPara.aspx?pcode=B0000001" target="_blank">民法</a>
          <a href="https://law.moj.gov.tw/LawClass/LawAllPara.aspx?pcode=B0010048" target="_blank">家事</a>
          <a href="https://law.moj.gov.tw/LawClass/LawAllPara.aspx?pcode=B0010001" target="_blank">民訴</a>
          <a href="https://law.moj.gov.tw/LawClass/LawAllPara.aspx?pcode=A0030159" target="_blank">憲訴</a>
          <a href="https://law.moj.gov.tw/LawClass/LawAllPara.aspx?pcode=A0030055" target="_blank">行程</a>
          <a href="https://law.moj.gov.tw/LawClass/LawAllPara.aspx?pcode=A0030154" target="_blank">行訴</a>
          <a href="https://law.moj.gov.tw/LawClass/LawAllPara.aspx?pcode=C0000001" target="_blank">刑法</a>
          <a href="https://law.moj.gov.tw/LawClass/LawAllPara.aspx?pcode=C0010001" target="_blank">刑訴</a>
        </div>

        <hr />

        <hgroup>
          <h2>立法院法律系統</h2>
          <p>民國59年以後的立法理由 <mark>因技術問題，現無法使用</mark></p>
        </hgroup>
        <form action="https://lis.ly.gov.tw/lglawc/lglawkm?@@795158449" method="post" target="_blank">
          <fieldset role="group">
            <input type="text" name="_1_6_T" placeholder="輸入法規的名稱" disabled required />
            <input type="hidden" name="@_1_6_T" value="T_LN/LW" />
            <input type="hidden" name="INFO" value="005F2D610000210100000000000000A001000000000000000" />
            <button type="submit" disabled>送出</button>
          </fieldset>
        </form>
        <p style="text-align: right;">
          <a href="https://lis.ly.gov.tw/lglawc/lglawkm" target="_blank">立法院法律系統</a>
        </p>
      </div>
    </article>
  </div>
</template>

<style scoped>
/* Pico CSS 選單微調 */
ul {
  margin-bottom: 0;
}

/* 常用六法連結排版 */
.law-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

/* 裁判書查詢 RWD 顯示控制 */
.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
  .mobile-only {
    display: block;
  }
}

/* 防止群組內的按鈕文字被擠壓換行 */
fieldset[role="group"] button {
  white-space: nowrap;
}
</style>