import { Baby, Heart, Pill, Plus, Scale, Sprout, Star, Trash2 } from 'lucide-react'
import { formatDate } from '../data'
import { useCopy } from '../i18n'
import type { Entry, EntryKind, Language } from '../types'

const careTypes: Array<[EntryKind, typeof Scale]> = [['weight', Scale], ['feeding', Baby], ['medication', Pill], ['milestone', Star]]

export function CareScreen({ language, entries, onAdd, onDelete, canEdit }: { language: Language, entries: Entry[], onAdd: (kind?: EntryKind) => void, onDelete: (id: string) => void, canEdit: boolean }) {
  const t = useCopy(language)
  const recent = [...entries].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 6)
  return <div className="screen care-screen">
    <section className="screen-intro botanical"><h1>{t.careTitle}</h1><p>{t.careCopy}</p></section>
    <button className="primary-action" onClick={() => onAdd()}><Heart/><Plus/>{t.addCare}</button>
    <div className="care-actions">{careTypes.map(([kind, Icon]) => <button key={kind} className={`care-action ${kind}`} onClick={() => onAdd(kind)}><span><Icon/></span><strong>{t[kind]}</strong></button>)}</div>
    <section className="care-history"><header><h2>{t.recentCare}</h2><Sprout aria-hidden="true"/></header>
      {recent.length ? <div className="care-timeline">{recent.map(entry => { const Icon = careTypes.find(([kind]) => kind === entry.kind)?.[1] || Heart; return <article key={entry.id}><span className={`history-icon ${entry.kind}`}><Icon/></span><div><time>{formatDate(entry.date, language, { month:'long', day:'numeric' })}</time><strong>{t[entry.kind]}</strong><p>{translateEntry(entry.title, language, t)}</p></div>{canEdit ? <button onClick={() => onDelete(entry.id)} aria-label={t.delete}><Trash2/></button> : null}</article> })}</div> : <p className="empty-copy">{t.noEntries}</p>}
      <p className="caught-up"><Sprig/>{t.caughtUp}</p>
    </section>
  </div>
}

function Sprig() { return <Sprout aria-hidden="true"/> }
function translateEntry(title: string, language: Language, t: ReturnType<typeof useCopy>) {
  if (language === 'en') return title
  if (title === 'Welcome home, Ezra' || title === 'Welcome home') return t.welcomeShort
  if (title === 'Bottle went well') return t.bottleWell
  if (title === 'First bottle') return t.firstBottle
  if (title === 'A stronger grip every day') return t.gripTitle
  if (title === 'Those bright eyes') return t.gripTitle
  if (title === 'Daily vitamin') return t.dailyVitamin
  return title
}
