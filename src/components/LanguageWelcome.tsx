import { Languages, Sprout } from 'lucide-react'
import { Brand } from './Navigation'
import { useCopy } from '../i18n'
import type { Language } from '../types'

export function LanguageWelcome({ onChoose }: { onChoose: (language: Language) => void }) {
  const t = useCopy('en')
  return <div className="welcome-overlay" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
    <section className="welcome-card">
      <Brand />
      <div className="welcome-sprout"><Sprout /></div>
      <h1 id="welcome-title">{t.welcomeTitle}</h1>
      <p>{t.welcomeHelp}</p>
      <button onClick={() => onChoose('en')}><span><strong>English</strong><small>{t.continueEnglish}</small></span><Languages /></button>
      <button onClick={() => onChoose('es')}><span><strong>Español</strong><small>{t.continueSpanish}</small></span><Languages /></button>
    </section>
  </div>
}
