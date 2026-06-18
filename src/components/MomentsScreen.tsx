import { Heart, Plus, Sparkles } from 'lucide-react'
import { formatDate } from '../data'
import { useCopy } from '../i18n'
import type { Entry, Language } from '../types'

export function MomentsScreen({ language, entries, onAdd }: { language: Language, entries: Entry[], onAdd: () => void }) {
  const t = useCopy(language)
  const moments = entries.filter(e => e.kind === 'milestone').sort((a,b) => b.date.localeCompare(a.date))
  const featured = moments[0]
  return <div className="screen moments-screen">
    <section className="screen-intro botanical"><h1>{t.momentsTitle}</h1><p>{t.momentsCopy}</p></section>
    <article className="featured-moment"><img src="./images/ezra-hand-placeholder.png" alt="Temporary photo of a baby hand holding a parent’s finger"/><time>{formatDate(featured?.date || '2026-06-18', language, {month:'long',day:'numeric',year:'numeric'})}</time><h2>{language === 'es' ? t.gripTitle : featured?.title || t.gripTitle}</h2><p>{language === 'es' ? t.gripCopy : featured?.notes || t.gripCopy}</p></article>
    <div className="moment-timeline"><article><span><Heart/></span><img src="./images/welcome-home-placeholder.png" alt="Welcome home keepsake placeholder"/><div><h3>{t.welcomeHome}</h3><time>{formatDate('2026-05-28', language)}</time></div></article><article><span><Sparkles/></span><img src="./images/first-bottle-placeholder.png" alt="First bottle placeholder"/><div><h3>{t.firstBottle}</h3><time>{formatDate('2026-05-10', language)}</time></div></article></div>
    <button className="primary-action coral" onClick={onAdd}><Plus/>{t.addMoment}</button>
  </div>
}
