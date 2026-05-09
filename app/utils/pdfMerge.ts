import { PDFDocument, PDFName, PDFString, PDFNull, PDFArray } from 'pdf-lib'
import type { PdfFileItem, MergeSettings } from '~/types/pdf'

/**
 * 解析使用者輸入的頁面範圍字串
 */
export function parsePageRange(rangeStr: string, totalPages: number): number[] {
  const pages = new Set<number>()
  const cleanStr = rangeStr.replace(/\s/g, '')
  
  const validPattern = /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/
  if (!validPattern.test(cleanStr)) {
    throw new Error(`頁面範圍格式錯誤: ${rangeStr}`)
  }
  
  const parts = cleanStr.split(',')
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number)
      if (start < 1 || end > totalPages || start > end) {
        throw new Error(`頁面範圍 ${part} 超出範圍 (總頁數: ${totalPages})`)
      }
      for (let i = start; i <= end; i++) {
        pages.add(i)
      }
    } else {
      const page = Number(part)
      if (page < 1 || page > totalPages) {
        throw new Error(`頁面 ${page} 超出範圍 (總頁數: ${totalPages})`)
      }
      pages.add(page)
    }
  }
  
  return Array.from(pages).sort((a, b) => a - b)
}

/**
 * 處理書籤邏輯 (A2 模式：安全實作版)
 */
async function processBookmarks(
  mergedPdf: PDFDocument, 
  pageOffsetMap: { fileName: string, startPageIndex: number }[],
  mode: string
) {
  // 若為 A1 模式或無檔案，直接跳過
  if (mode === 'A1' || pageOffsetMap.length === 0) return

  try {
    const context = mergedPdf.context
    
    // 預先建立 Ref
    const outlineRefs = pageOffsetMap.map(() => context.nextRef())
    const outlinesDictRef = context.nextRef()
    
    // 建立根目錄 (Outlines Dictionary)
    const outlinesDict = context.obj({
      Type: 'Outlines',
      First: outlineRefs[0],
      Last: outlineRefs[outlineRefs.length - 1],
      Count: pageOffsetMap.length // context.obj 會自動處理數字
    })
    
    mergedPdf.catalog.set(PDFName.of('Outlines'), outlinesDictRef)
    context.assign(outlinesDictRef, outlinesDict)
    
    const pages = mergedPdf.getPages()
    
    // 建立每個書籤項目
    for (let i = 0; i < pageOffsetMap.length; i++) {
      const map = pageOffsetMap[i]
      const itemRef = outlineRefs[i]
      const targetPage = pages[map.startPageIndex]
      
      if (!targetPage) continue
      
      // 【關鍵修復】：使用 PDFName.of('XYZ') 而不是普通字串 'XYZ'
      const destArray = context.obj([
        targetPage.ref,
        PDFName.of('XYZ'),
        PDFNull.instance,
        PDFNull.instance,
        PDFNull.instance,
      ])
      
      const itemDict: any = {
        Title: PDFString.of(map.fileName),
        Parent: outlinesDictRef,
        Dest: destArray
      }
      
      // 設定前後指標
      if (i > 0) itemDict.Prev = outlineRefs[i - 1]
      if (i < pageOffsetMap.length - 1) itemDict.Next = outlineRefs[i + 1]
      
      context.assign(itemRef, context.obj(itemDict))
    }
  } catch (err) {
    console.error('建立書籤時發生錯誤，跳過書籤生成:', err)
  }
}

/**
 * 執行 PDF 合併作業
 */
export async function executePdfMerge(files: PdfFileItem[], settings: MergeSettings): Promise<Blob> {
  const mergedPdf = await PDFDocument.create()
  const pageOffsetMap: { fileName: string, startPageIndex: number }[] = []
  
  let currentOffset = 0
  let referenceWidth: number | null = null
  
  for (const fileData of files) {
    const pageIndices = parsePageRange(fileData.pageRange, fileData.totalPages).map(p => p - 1)
    
    pageOffsetMap.push({
      fileName: fileData.name.replace('.pdf', ''),
      startPageIndex: currentOffset
    })
    
    const copiedPages = await mergedPdf.copyPages(fileData.pdfDoc, pageIndices)
    
    for (const page of copiedPages) {
      // 移除跨文件後失效的 Annotation refs 
      page.node.delete(PDFName.of('Annots'))

      // 安全取得頁面尺寸，避免 indirect MediaBox ref 崩潰
      let pageWidth = 612
      let pageHeight = 792
      try {
        const size = page.getSize()
        pageWidth = size.width
        pageHeight = size.height
      } catch (e) {
        console.warn('無法取得頁面尺寸，使用預設值:', e)
      }

      if (referenceWidth === null) {
        referenceWidth = pageWidth
      }

      if (settings.normalizePageSize) {
        const scale = referenceWidth / pageWidth
        page.scale(scale, scale)
        page.node.set(
          PDFName.of('MediaBox'),
          mergedPdf.context.obj([0, 0, referenceWidth, pageHeight * scale])
        )
      }

      mergedPdf.addPage(page)
    }
    
    currentOffset += pageIndices.length
  }
  
  if (settings.title) mergedPdf.setTitle(settings.title)
  if (settings.author) mergedPdf.setAuthor(settings.author)
  mergedPdf.setProducer('自製 PDF 合併工具 (Nuxt Edition)')
  mergedPdf.setCreationDate(new Date())
  
  // 呼叫修復後的書籤處理函式
  await processBookmarks(mergedPdf, pageOffsetMap, settings.bookmarkMode)
  
  const pdfBytes = await mergedPdf.save()
  return new Blob([pdfBytes], { type: 'application/pdf' })
}