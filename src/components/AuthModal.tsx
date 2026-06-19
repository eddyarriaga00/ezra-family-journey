import { useEffect, useState } from 'react'
import { LockKeyhole, X } from 'lucide-react'
import { useModalDialog } from '../hooks/useModalDialog'
import { requestPasswordReset, signIn, signUp, updatePassword } from '../lib/database'
import type { Language } from '../types'

type AuthMode = 'signin' | 'signup' | 'forgot' | 'recovery'

export function AuthModal({ language, onClose, recovery = false }: { language: Language; onClose: () => void; recovery?: boolean }) {
  const [mode, setMode] = useState<AuthMode>(recovery ? 'recovery' : 'signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const spanish = language === 'es'
  const cardRef = useModalDialog<HTMLFormElement>(onClose)

  useEffect(() => {
    if (recovery) setMode('recovery')
  }, [recovery])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      if (mode === 'forgot') {
        await requestPasswordReset(email.trim())
        setMessage(spanish ? 'Revisa tu correo para restablecer la contraseña.' : 'Check your email for the password reset link.')
      } else if (mode === 'recovery') {
        await updatePassword(password)
        onClose()
      } else {
        const session = mode === 'signin' ? await signIn(email.trim(), password) : await signUp(email.trim(), password)
        if (session) onClose()
        else setMessage(spanish ? 'Revisa tu correo para confirmar la cuenta.' : 'Check your email to confirm the account.')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in.')
    } finally {
      setBusy(false)
    }
  }

  return <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <form className="auth-card" onSubmit={submit} ref={cardRef}>
      <header>
        <span className="auth-icon"><LockKeyhole /></span>
        <button type="button" onClick={onClose} aria-label={spanish ? 'Cerrar' : 'Close'}><X /></button>
      </header>
      <h2 id="auth-title">{mode === 'signin' ? (spanish ? 'Acceso familiar' : 'Family sign in') : mode === 'signup' ? (spanish ? 'Crear acceso familiar' : 'Create family account') : mode === 'forgot' ? (spanish ? 'Restablecer contraseña' : 'Reset password') : (spanish ? 'Elige una contraseña nueva' : 'Choose a new password')}</h2>
      <p>{spanish ? 'Las fotos siguen siendo públicas. Inicia sesión solo para guardar y sincronizar actualizaciones.' : 'Photos remain public. Sign in only to save and sync updates.'}</p>
      {mode !== 'recovery' ? <label><span>{spanish ? 'Correo electrónico' : 'Email'}</span><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label> : null}
      {mode !== 'forgot' ? <label><span>{spanish ? 'Contraseña' : mode === 'recovery' ? 'New password' : 'Password'}</span><input type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label> : null}
      {message ? <p className="auth-message" role="status">{message}</p> : null}
      <button className="auth-submit" type="submit" disabled={busy}>{busy ? (spanish ? 'Espera…' : 'Please wait…') : mode === 'signin' ? (spanish ? 'Iniciar sesión' : 'Sign in') : mode === 'signup' ? (spanish ? 'Crear cuenta' : 'Create account') : mode === 'forgot' ? (spanish ? 'Enviar enlace' : 'Send reset link') : (spanish ? 'Guardar contraseña' : 'Save new password')}</button>
      {mode === 'signin' ? <button className="auth-switch" type="button" onClick={() => { setMode('forgot'); setMessage('') }}>{spanish ? 'Olvidé mi contraseña' : 'Forgot password?'}</button> : null}
      {mode !== 'recovery' ? <button className="auth-switch" type="button" onClick={() => { setMode(mode === 'signup' ? 'signin' : mode === 'signin' ? 'signup' : 'signin'); setMessage('') }}>{mode === 'signin' ? (spanish ? 'Crear una cuenta' : 'Create an account') : (spanish ? 'Volver a iniciar sesión' : 'Back to sign in')}</button> : null}
    </form>
  </div>
}
