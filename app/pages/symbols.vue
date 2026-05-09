<template>
  <div>
    <hgroup>
      <h1>常用符號表</h1>
      <p>從中文維基百科的編輯區整理（CC BY-SA 3.0）</p>
    </hgroup>

    <div v-for="group in symbolGroups" :key="group.label">
      <h2>{{ group.label }}</h2>
      <div class="symbol-grid">
        <button
          v-for="symbol in group.symbols"
          :key="symbol"
          class="symbol-btn secondary outline"
          :aria-label="`複製 ${symbol}`"
          :class="{ copied: lastCopied === symbol }"
          @click="copy(symbol)"
        >
          {{ symbol }}
        </button>
      </div>
    </div>

    <div v-if="lastCopied" class="copy-toast" role="status" aria-live="polite">
      已複製：{{ lastCopied }}
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  breadcrumb: '常用符號表'
})

const lastCopied = ref('')
let toastTimer: ReturnType<typeof setTimeout>

async function copy(symbol: string) {
  await navigator.clipboard.writeText(symbol)
  lastCopied.value = symbol
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    lastCopied.value = ''
  }, 1500)
}

const symbolGroups = [
  {
    label: '注音符號・拼音聲調',
    symbols: [
      'ā','á','ǎ','à','ō','ó','ǒ','ò','ē','é','ě','è',
      'ī','í','ǐ','ì','ū','ú','ǔ','ù','ü','ǖ','ǘ','ǚ','ǜ',
      'ê','ê̄','ế','ê̌','ề',
      'Ā','Á','Ǎ','À','Ō','Ó','Ǒ','Ò','Ē','É','Ě','È',
    ],
  },
  {
    label: '單位・貨幣・常用記號',
    symbols: [
      '−','°','℃','℉','‰','￥','¥','€','£','¤','￠',
      '©','®','™','№','·','→','↑','←','↓','↖','↗','↘','↙',
    ],
  },
  {
    label: '圓圈數字・序號',
    symbols: [
      '①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩',
      '⑪','⑫','⑬','⑭','⑮','⑯','⑰','⑱','⑲','⑳',
      '㈠','㈡','㈢','㈣','㈤','㈥','㈦','㈧','㈨','㈩',
      '⒈','⒉','⒊','⒋','⒌','⒍','⒎','⒏','⒐','⒑',
      '⑴','⑵','⑶','⑷','⑸','⑹','⑺','⑻','⑼','⑽',
    ],
  },
  {
    label: '中文數字',
    symbols: ['〇','〡','〢','〣','〤','〥','〦','〧','〨','〩'],
  },
  {
    label: '羅馬數字',
    symbols: ['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','Ⅶ','Ⅷ','Ⅸ','Ⅹ','Ⅺ','Ⅻ','Ⅼ','Ⅽ','Ⅾ','Ⅿ'],
  },
  {
    label: '數學符號',
    symbols: [
      '≠','≤','≥','<','>','≡','≈','≅','∝','°','′','″',
      '∴','∵','·','−','×','÷','±','⊥','⊕','⊗','∗',
      '…','¼','½','¾','¹','²','³',
      '∂','∫','∑','∞','∏','√','∇',
      '←','→','↔','⇐','⇒','⇔',
      '⌈','⌉','⌊','⌋',
      '¬','∧','∨','∃','∀',
      '∈','∉','∋','∅','⊆','⊇','⊃','⊂','⊄','∪','∩','ℵ',
    ],
  },
]
</script>

<style scoped>
.symbol-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: var(--pico-spacing);
}

.symbol-btn {
  min-width: 2.4rem;
  padding: 0.3rem 0.5rem;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s;
}

.symbol-btn.copied {
  --pico-color: var(--pico-primary);
}

.copy-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--pico-contrast-background);
  color: var(--pico-contrast-inverse);
  padding: 0.4rem 1.2rem;
  border-radius: var(--pico-border-radius);
  font-size: 0.9rem;
  pointer-events: none;
  z-index: 200;
}
</style>