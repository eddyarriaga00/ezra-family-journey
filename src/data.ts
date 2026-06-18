import type { Entry } from './types'

export const seedEntries: Entry[] = [
  { id: 'w1', kind: 'weight', date: '2026-03-19', title: '2 lb', notes: 'Birth weight' },
  { id: 'w2', kind: 'weight', date: '2026-04-23', title: '3 lb 12 oz' },
  { id: 'w3', kind: 'weight', date: '2026-05-14', title: '5 lb 2 oz' },
  { id: 'w4', kind: 'weight', date: '2026-06-18', title: '6 lb 10 oz', notes: 'Current weight' },
  { id: 'f1', kind: 'feeding', date: '2026-06-12', title: 'Bottle went well', amount: '60 mL', method: 'Bottle' },
  { id: 'med1', kind: 'medication', date: '2026-06-02', title: 'Daily vitamin', amount: 'As directed' },
  { id: 'm1', kind: 'milestone', date: '2026-05-10', title: 'First bottle' },
  { id: 'm2', kind: 'milestone', date: '2026-05-28', title: 'Welcome home, Ezra' },
  { id: 'm3', kind: 'milestone', date: '2026-06-18', title: 'Those bright eyes', notes: 'Taking in the world around him.' },
]

export function poundsToOunces(label: string) {
  const match = label.match(/(\d+)\s*lb(?:\s*(\d+)\s*oz)?/i)
  return match ? Number(match[1]) * 16 + Number(match[2] || 0) : 0
}

export function formatDate(date: string, language: 'en' | 'es', options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }) {
  return new Intl.DateTimeFormat(language === 'es' ? 'es-US' : 'en-US', options).format(new Date(`${date}T12:00:00`))
}
