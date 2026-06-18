import { useState } from 'react'
import { LockKeyhole, X } from 'lucide-react'
import { signIn, signUp } from '../lib/database'
import type { Language } from '../types'

export function AuthModal({ language, onClose }: { language: Language; onClose: () => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const spanish = language === 'es'

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const session = mode === 'signin'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password)
      if (session) onClose()
      else setMessage(spanish ? 'Revisa tu correo para confirmar la cuenta.' : 'Check your email to confirm the account.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in.')
    } finally {
      setBusy(false)
    }
  }

  return <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <form className="auth-card" onSubmit={submit}>
      <header>
        <span className="auth-icon"><LockKeyhole /></span>
        <button type="button" onClick={onClose} aria-label={spanish ? 'Cerrar' : 'Close'}><X /></button>
      </header>
      <h2 id="auth-title">{mode === 'signin' ? (spanish ? 'Acceso familiar' : 'Family sign in') : (spanish ? 'Crear acceso familiar' : 'Create family account')}</h2>
      <p>{spanish ? 'Las fotos siguen siendo públicas. Inicia sesión solo para guardar y sincronizar actualizaciones.' : 'Photos remain public. Sign in only to save and sync updates.'}</p>
      <label><span>{spanish ? 'Correo electrónico' : 'Email'}</span><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label><span>{spanish ? 'Contraseña' : 'Password'}</span><input type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      {message ? <p className="auth-message" role="status">{message}</p> : null}
      <button className="auth-submit" type="submit" disabled={busy}>{busy ? (spanish ? 'Espera…' : 'Please wait…') : mode === 'signin' ? (spanish ? 'Iniciar sesión' : 'Sign in') : (spanish ? 'Crear cuenta' : 'Create account')}</button>
      <button className="auth-switch" type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage('') }}>{mode === 'signin' ? (spanish ? 'Crear una cuenta' : 'Create an account') : (spanish ? 'Ya tengo una cuenta' : 'I already have an account')}</button>
    </form>
  </div>
}
