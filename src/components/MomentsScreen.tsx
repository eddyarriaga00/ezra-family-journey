import { Plus } from 'lucide-react'
import { formatDate } from '../data'
import { useCopy } from '../i18n'
import type { Entry, Language } from '../types'

export function MomentsScreen({ language, entries, onAdd }: { language: Language, entries: Entry[], onAdd: () => void }) {
  const t = useCopy(language)
  const moments = entries.filter(e => e.kind === 'milestone').sort((a,b) => b.date.localeCompare(a.date))
  const featured = moments[0]
  const gallery = [
    ['./images/ezra/nicu-smile.jpg', t.sweetSmile],
    ['./images/ezra/brave-boy.jpg', t.braveBoy],
    ['./images/ezra/resting.jpg', t.restingPeacefully],
    ['./images/ezra/home-hero.jpg', t.growingEveryDay],
    ['./images/ezra/growing.jpg', t.growingEveryDay],
    ['./images/ezra/tiny-mighty.jpg', t.tinyMighty],
  ]
  return <div className="screen moments-screen">
    <section className="screen-intro botanical"><h1>{t.momentsTitle}</h1><p>{t.momentsCopy}</p></section>
    <article className="featured-moment"><img src="./images/ezra/bright-eyes.jpg" alt="Ezra awake and looking around in his NICU bed"/><time>{formatDate(featured?.date || '2026-06-18', language, {month:'long',day:'numeric',year:'numeric'})}</time><h2>{t.gripTitle}</h2><p>{t.gripCopy}</p></article>
    <div className="photo-gallery">{gallery.map(([src, caption]) => <figure key={src}><img src={src} alt={`${caption} — Ezra in the NICU`}/><figcaption><strong>{caption}</strong><span>{t.june2026}</span></figcaption></figure>)}</div>
    <button className="primary-action coral" onClick={onAdd}><Plus/>{t.addMoment}</button>
  </div>
}
