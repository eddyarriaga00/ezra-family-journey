import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Entry } from '../types'
import { useFamilyDatabase } from './useFamilyDatabase'

const mocks = vi.hoisted(() => ({
  createEntry: vi.fn(),
  existingEntry: { id: 'existing', kind: 'weight' as const, date: '2026-06-18', title: '6 lb 10 oz' },
  removeEntry: vi.fn(),
}))
const existingEntry: Entry = mocks.existingEntry

vi.mock('../lib/supabase', () => ({ isSupabaseConfigured: true }))
vi.mock('../lib/database', () => ({
  createEntry: mocks.createEntry,
  getSession: vi.fn().mockResolvedValue({ user: { id: 'user-1', email: 'family@example.com' } }),
  loadDatabase: vi.fn().mockResolvedValue({ babyId: 'baby-1', entries: [mocks.existingEntry] }),
  onSessionChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  removeEntry: mocks.removeEntry,
  signOut: vi.fn(),
}))

describe('useFamilyDatabase', () => {
  beforeEach(() => {
    const values = new Map<string, string>()
    const storage = {
      clear: () => values.clear(),
      getItem: (key: string) => values.get(key) ?? null,
      key: (index: number) => [...values.keys()][index] ?? null,
      get length() { return values.size },
      removeItem: (key: string) => values.delete(key),
      setItem: (key: string, value: string) => values.set(key, value),
    }
    vi.stubGlobal('localStorage', storage)
    localStorage.clear()
    mocks.createEntry.mockReset()
    mocks.removeEntry.mockReset()
  })

  it('does not show an entry when PostgreSQL creation fails', async () => {
    mocks.createEntry.mockRejectedValue(new Error('network unavailable'))
    const { result } = renderHook(() => useFamilyDatabase())
    await waitFor(() => expect(result.current.syncState).toBe('synced'))

    let saved = true
    await act(async () => {
      saved = await result.current.saveEntry({ id: 'new', kind: 'milestone', date: '2026-06-19', title: 'New moment' })
    })

    expect(saved).toBe(false)
    expect(result.current.entries).toEqual([existingEntry])
    expect(result.current.syncState).toBe('error')
  })

  it('keeps an entry visible when PostgreSQL deletion fails', async () => {
    mocks.removeEntry.mockRejectedValue(new Error('permission denied'))
    const { result } = renderHook(() => useFamilyDatabase())
    await waitFor(() => expect(result.current.syncState).toBe('synced'))

    let deleted = true
    await act(async () => {
      deleted = await result.current.deleteEntry(existingEntry.id)
    })

    expect(deleted).toBe(false)
    expect(result.current.entries).toEqual([existingEntry])
  })
})
