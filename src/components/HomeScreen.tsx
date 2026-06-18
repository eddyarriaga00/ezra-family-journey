import { Baby, CalendarDays, ChevronRight, Heart, Plus, Sprout } from 'lucide-react'
import { formatDate } from '../data'
import { useCopy } from '../i18n'
import type { Entry, EntryKind, Language, Screen } from '../types'

export function HomeScreen({ language, entries, onAdd, setScreen }: { language: Language, entries: Entry[], onAdd: (kind?: EntryKind) => void, setScreen: (screen: Screen) => void }) {
  const t = useCopy(language)
  const weights = entries.filter(e => e.kind === 'weight').sort((a,b) => a.date.localeCompare(b.date))
  const latestWeight = weights[weights.length - 1]?.title || '6 lb 10 oz'
  const milestones = entries.filter(e => e.kind === 'milestone').sort((a,b) => b.date.localeCompare(a.date))
  const latestFeeding = entries.filter(e => e.kind === 'feeding').sort((a,b) => b.date.localeCompare(a.date))[0]
  return <div className="screen home-screen">
    <section className="home-hero">
      <div className="hero-photo"><img src="./images/ezra/home-hero.jpg" alt="Ezra looking around from his NICU bed"/></div>
      <div className="hero-copy"><h1>{t.heroTitle}</h1><Heart className="outline-heart"/><p>{t.heroCopy}</p></div>
      <div className="baby-facts"><p><span><CalendarDays/></span>{t.born}</p><p><span><Sprout/></span>{latestWeight} · {t.stronger}</p></div>
      <button className="primary-action" onClick={() => onAdd('milestone')}><Heart/><Plus/>{t.addMoment}</button>
    </section>
    <section className="latest-section"><header><h2>{t.latestMoments}</h2><Sprout aria-hidden="true"/></header>
      <button className="moment-preview warm" onClick={() => setScreen('moments')}><img src="./images/ezra/nicu-smile.jpg" alt="Ezra smiling in his NICU bed"/><span><small><Heart/> {formatDate(milestones[0]?.date || '2026-06-18', language)}</small><strong>{t.sweetSmile}</strong></span><ChevronRight/></button>
      {latestFeeding && <button className="moment-preview cool" onClick={() => setScreen('care')}><span className="preview-icon"><Baby/></span><span><small>{formatDate(latestFeeding.date, language)}</small><strong>{t.feedingWell}</strong></span><ChevronRight/></button>}
    </section>
  </div>
}
