import { Heart, HeartHandshake, Home, Images, Sprout } from 'lucide-react'
import { useCopy } from '../i18n'
import type { Language, Screen } from '../types'

export function Brand() { return <div className="brand" aria-label="Ezra"><span className="brand-mark"><Heart/><Sprout/></span><strong>Ezra</strong></div> }

export function TopBar({ language, onLanguage }: { language: Language, onLanguage: (language: Language) => void }) {
  const t = useCopy(language)
  return <header className="top-bar"><Brand/><div className="language-toggle" aria-label={t.language}><button className={language === 'en' ? 'active' : ''} onClick={() => onLanguage('en')}>{t.english}</button><button className={language === 'es' ? 'active' : ''} onClick={() => onLanguage('es')}>{t.spanish}</button></div></header>
}

const nav = [ ['home', Home], ['growth', Sprout], ['care', HeartHandshake], ['moments', Images] ] as const

export function BottomNav({ language, screen, setScreen }: { language: Language, screen: Screen, setScreen: (screen: Screen) => void }) {
  const t = useCopy(language)
  return <nav className="bottom-nav" aria-label="Primary">{nav.map(([value, Icon]) => <button key={value} className={screen === value ? 'active' : ''} onClick={() => { setScreen(value); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><Icon/><span>{t[value]}</span></button>)}</nav>
}
