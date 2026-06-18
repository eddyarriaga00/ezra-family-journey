import type { Session } from '@supabase/supabase-js'
import type { Entry } from '../types'
import { supabase } from './supabase'

type CareEntryRow = {
  id: string
  kind: Entry['kind']
  occurred_at: string
  title: string
  amount: string | null
  method: string | null
  notes: string | null
  completed: boolean
}

function requireSupabase() {
  if (!supabase) throw new Error('Supabase is not configured.')
  return supabase
}

function fromRow(row: CareEntryRow): Entry {
  const occurredAt = new Date(row.occurred_at)
  const localDate = [
    occurredAt.getFullYear(),
    String(occurredAt.getMonth() + 1).padStart(2, '0'),
    String(occurredAt.getDate()).padStart(2, '0'),
  ].join('-')
  return {
    id: row.id,
    kind: row.kind,
    date: localDate,
    time: row.kind === 'feeding' || row.kind === 'medication'
      ? occurredAt.toTimeString().slice(0, 5)
      : undefined,
    title: row.title,
    amount: row.amount || undefined,
    method: row.method || undefined,
    notes: row.notes || undefined,
    completed: row.completed,
  }
}

function toInsert(entry: Entry, babyId: string) {
  const time = entry.time || '12:00'
  return {
    baby_id: babyId,
    kind: entry.kind,
    occurred_at: new Date(`${entry.date}T${time}:00`).toISOString(),
    title: entry.title,
    amount: entry.amount || null,
    method: entry.method || null,
    notes: entry.notes || null,
    completed: entry.completed || false,
  }
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await requireSupabase().auth.getSession()
  if (error) throw error
  return data.session
}

export function onSessionChange(callback: (session: Session | null) => void) {
  return requireSupabase().auth.onAuthStateChange((_event, session) => callback(session))
}

export async function signIn(email: string, password: string) {
  const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.session
}

export async function signUp(email: string, password: string) {
  const { data, error } = await requireSupabase().auth.signUp({ email, password })
  if (error) throw error
  return data.session
}

export async function signOut() {
  const { error } = await requireSupabase().auth.signOut()
  if (error) throw error
}

async function ensureBaby(): Promise<string> {
  const { data, error } = await requireSupabase().rpc('bootstrap_family')
  if (error) throw error
  if (!data) throw new Error('The family database could not be initialized.')
  return data as string
}

async function fetchEntries(babyId: string) {
  const { data, error } = await requireSupabase()
    .from('care_entries')
    .select('id, kind, occurred_at, title, amount, method, notes, completed')
    .eq('baby_id', babyId)
    .order('occurred_at', { ascending: true })
  if (error) throw error
  return (data as CareEntryRow[]).map(fromRow)
}

export async function loadDatabase(initialEntries: Entry[]) {
  const babyId = await ensureBaby()
  let entries = await fetchEntries(babyId)

  if (entries.length === 0 && initialEntries.length > 0) {
    const { error } = await requireSupabase()
      .from('care_entries')
      .insert(initialEntries.map((entry) => toInsert(entry, babyId)))
    if (error) throw error
    entries = await fetchEntries(babyId)
  }

  return { babyId, entries }
}

export async function createEntry(babyId: string, entry: Entry) {
  const { data, error } = await requireSupabase()
    .from('care_entries')
    .insert(toInsert(entry, babyId))
    .select('id, kind, occurred_at, title, amount, method, notes, completed')
    .single()
  if (error) throw error
  return fromRow(data as CareEntryRow)
}

export async function removeEntry(id: string) {
  const { error } = await requireSupabase().from('care_entries').delete().eq('id', id)
  if (error) throw error
}
