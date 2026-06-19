import { Baby, Pill, Scale, Star, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useModalDialog } from '../hooks/useModalDialog'
import { useCopy } from '../i18n'
import { toLocalDateInputValue } from '../lib/date'
import type { Entry, EntryKind, Language } from '../types'

const icons = { weight: Scale, feeding: Baby, medication: Pill, milestone: Star }

export function AddEntryModal({ language, initialKind, onClose, onSave }: { language: Language, initialKind?: EntryKind, onClose: () => void, onSave: (entry: Entry) => Promise<boolean> | boolean }) {
  const t = useCopy(language)
  const [kind, setKind] = useState<EntryKind>(initialKind || 'milestone')
  const [form, setForm] = useState({ date: toLocalDateInputValue(), time: new Date().toTimeString().slice(0, 5), title: '', amount: '', method: '', notes: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const sheetRef = useModalDialog<HTMLFormElement>(onClose)
  useEffect(() => { if (initialKind) setKind(initialKind) }, [initialKind])
  const update = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }))
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.title.trim()) return
    setBusy(true)
    setError('')
    const saved = await onSave({ id: crypto.randomUUID(), kind, ...form, time: kind === 'feeding' || kind === 'medication' ? form.time : undefined })
    if (!saved) setError(language === 'es' ? 'No se pudo guardar. Inténtalo de nuevo.' : 'Could not save. Please try again.')
    setBusy(false)
  }
  return <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="entry-title" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <form className="entry-sheet" onSubmit={submit} ref={sheetRef}>
      <header><div><span>{t.add}</span><h2 id="entry-title">{t.entryQuestion}</h2></div><button type="button" onClick={onClose} aria-label={t.cancel}><X /></button></header>
      <div className="entry-kinds">{(Object.keys(icons) as EntryKind[]).map(value => { const Icon = icons[value]; return <button type="button" key={value} className={kind === value ? 'active' : ''} onClick={() => setKind(value)}><Icon/><span>{t[value]}</span></button> })}</div>
      <div className="entry-fields">
        <label><span>{t.date}</span><input type="date" required value={form.date} onChange={e => update('date', e.target.value)}/></label>
        {(kind === 'feeding' || kind === 'medication') && <label><span>{t.time}</span><input type="time" value={form.time} onChange={e => update('time', e.target.value)}/></label>}
        <label className="full"><span>{kind === 'weight' ? `${t.weight} (${t.pounds} / ${t.ounces})` : t.title}</span><input required autoFocus placeholder={kind === 'weight' ? '6 lb 10 oz' : kind === 'feeding' ? t.bottleWell : ''} value={form.title} onChange={e => update('title', e.target.value)}/></label>
        {(kind === 'feeding' || kind === 'medication') && <label><span>{t.amount}</span><input placeholder={kind === 'feeding' ? '60 mL' : t.asDirected} value={form.amount} onChange={e => update('amount', e.target.value)}/></label>}
        {kind === 'feeding' && <label><span>{t.method}</span><input placeholder={t.bottle} value={form.method} onChange={e => update('method', e.target.value)}/></label>}
        <label className="full"><span>{t.optionalNotes}</span><textarea rows={3} value={form.notes} onChange={e => update('notes', e.target.value)}/></label>
      </div>
      {error ? <p className="auth-message" role="alert">{error}</p> : null}
      <footer><button type="button" className="secondary" onClick={onClose}>{t.cancel}</button><button type="submit" className="primary" disabled={busy}>{busy ? t.syncing : t.save}</button></footer>
    </form>
  </div>
}
