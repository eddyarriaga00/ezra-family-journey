import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthModal } from './AuthModal'

const mocks = vi.hoisted(() => ({
  requestPasswordReset: vi.fn(),
  updatePassword: vi.fn(),
}))

vi.mock('../lib/database', () => ({
  requestPasswordReset: mocks.requestPasswordReset,
  signIn: vi.fn(),
  signUp: vi.fn(),
  updatePassword: mocks.updatePassword,
}))

describe('AuthModal', () => {
  beforeEach(() => {
    mocks.requestPasswordReset.mockResolvedValue(undefined)
    mocks.updatePassword.mockResolvedValue(undefined)
  })

  it('requests a password reset without exposing the gallery', async () => {
    const user = userEvent.setup()
    render(<AuthModal language="en" onClose={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Forgot password?' }))
    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'family@example.com')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))

    expect(mocks.requestPasswordReset).toHaveBeenCalledWith('family@example.com')
    expect(await screen.findByRole('status')).toHaveTextContent('Check your email')
  })

  it('updates the password during a recovery session', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<AuthModal language="en" onClose={onClose} recovery />)

    await user.type(screen.getByLabelText('New password'), 'new-password-123')
    await user.click(screen.getByRole('button', { name: 'Save new password' }))

    expect(mocks.updatePassword).toHaveBeenCalledWith('new-password-123')
    expect(onClose).toHaveBeenCalled()
  })
})
