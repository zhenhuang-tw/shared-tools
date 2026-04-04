// types/tool.ts

export interface ToolChild {
  to: string
  label: string
  description?: string
}

export interface ToolDef {
  id: string
  to?: string
  icon: unknown // Vue Component，在 index.vue 中以 Component 型別覆寫
  title: string
  description: string
  comingSoon?: boolean
  children?: ToolChild[]
}