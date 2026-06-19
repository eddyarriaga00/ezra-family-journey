import { useCallback, useEffect, useState } from 'react'
import { seedEntries } from '../data'
import {
  createEntry,
  getSession,
  loadDatabase,
  onSessionChange,
  removeEntry,
  signOut,
} from '../lib/database'
import { isSupabaseConfigured } from '../lib/supabase'
import type { Entry } from '../types'

const STORAGE_KEY = 'ezra-family-updates-v2'
const MIGRATION_OWNER_KEY = 'ezra-database-migration-owner'

type Account = { id: string; email?: string }
export type SyncState = 'local' | 'signed_out' | 'syncing' | 'synced' | 'error'

function readLocalEntries() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? (JSON.parse(saved) as Entry[]) : seedEntries
  } catch {
    return seedEntries
  }
}

export function useFamilyDatabase() {
  const [account, setAccount] = useState<Account>()
  const [babyId, setBabyId] = useState<string>()
  const [entries, setEntries] = useState<Entry[]>(() => isSupabaseConfigured ? seedEntries : readLocalEntries())
  const [syncState, setSyncState] = useState<SyncState>(isSupabaseConfigured ? 'signed_out' : 'local')
  const [syncError, setSyncError] = useState('')
  const [passwordRecovery, setPasswordRecovery] = useState(false)
  const accountId = account?.id

  useEffect(() => {
    if (!isSupabaseConfigured) localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let active = true
    void getSession()
      .then((session) => {
        if (active && session) setAccount({ id: session.user.id, email: session.user.email })
      })
      .catch((error) => {
        if (!active) return
        setSyncError(error.message)
        setSyncState('error')
      })
    const { data } = onSessionChange((event, session) => {
      if (!active) return
      setAccount(session ? { id: session.user.id, email: session.user.email } : undefined)
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true)
    })
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    if (!accountId) {
      setBabyId(undefined)
      setEntries(seedEntries)
      setSyncState('signed_out')
      setSyncError('')
      return
    }

    let active = true
    setSyncState('syncing')
    setSyncError('')
    const migrationOwner = localStorage.getItem(MIGRATION_OWNER_KEY)
    const migrationEntries = !migrationOwner || migrationOwner === accountId ? readLocalEntries() : seedEntries
    void loadDatabase(migrationEntries)
      .then((database) => {
        if (!active) return
        if (!migrationOwner) localStorage.setItem(MIGRATION_OWNER_KEY, accountId)
        localStorage.removeItem(STORAGE_KEY)
        setBabyId(database.babyId)
        setEntries(database.entries)
        setSyncState('synced')
      })
      .catch((error) => {
        if (!active) return
        setSyncError(error.message)
        setSyncState('error')
      })
    return () => {
      active = false
    }
  }, [accountId])

  const saveEntry = useCallback(async (entry: Entry) => {
    if (!isSupabaseConfigured) {
      setEntries((current) => [...current, entry])
      return true
    }
    if (!babyId) return false

    setSyncState('syncing')
    setSyncError('')
    try {
      const saved = await createEntry(babyId, entry)
      setEntries((current) => [...current, saved])
      setSyncState('synced')
      return true
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Unable to save the update.')
      setSyncState('error')
      return false
    }
  }, [babyId])

  const deleteEntry = useCallback(async (id: string) => {
    if (!isSupabaseConfigured) {
      setEntries((current) => current.filter((entry) => entry.id !== id))
      return true
    }
    if (!babyId) return false

    setSyncState('syncing')
    setSyncError('')
    try {
      await removeEntry(id)
      setEntries((current) => current.filter((entry) => entry.id !== id))
      setSyncState('synced')
      return true
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Unable to delete the update.')
      setSyncState('error')
      return false
    }
  }, [babyId])

  const signOutAccount = useCallback(async () => {
    try {
      await signOut()
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Unable to sign out.')
      setSyncState('error')
    }
  }, [])

  return {
    account,
    babyId,
    deleteEntry,
    entries,
    isConfigured: isSupabaseConfigured,
    passwordRecovery,
    saveEntry,
    setPasswordRecovery,
    signOutAccount,
    syncError,
    syncState,
  }
}
