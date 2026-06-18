export type Language = 'en' | 'es'
export type Screen = 'home' | 'growth' | 'care' | 'moments'
export type EntryKind = 'weight' | 'feeding' | 'medication' | 'milestone'

export interface Entry {
  id: string
  kind: EntryKind
  date: string
  time?: string
  title: string
  amount?: string
  method?: string
  notes?: string
  completed?: boolean
}
