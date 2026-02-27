import { useCallback, useEffect, useState } from 'react'
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  eachDayOfInterval,
  format,
} from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'

export interface PlannedEntry {
  id: string
  user_id: string
  program_id: string | null
  date: string        // YYYY-MM-DD
  exercise_id: string
  sort_order: number
}

const STORAGE_KEY = 'fittrack:weekly_plan'

function loadAll(): PlannedEntry[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}

function saveAll(entries: PlannedEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

interface UseWeeklyPlanOptions {
  /** The reference date for week 0 (program start_date or current date) */
  startDate?: Date
  /** Which week offset to display (0-indexed) */
  weekOffset?: number
  /** Scope entries to a specific program */
  programId?: string | null
}

export default function useWeeklyPlan(options: UseWeeklyPlanOptions = {}) {
  const { user } = useAuth()
  const {
    startDate = new Date(),
    weekOffset = 0,
    programId = null,
  } = options

  const [entries, setEntries] = useState<PlannedEntry[]>([])

  const weekStart = startOfWeek(addWeeks(startDate, weekOffset), { weekStartsOn: 0 })
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })
  const dateKeys = days.map((d) => format(d, 'yyyy-MM-dd'))

  const fetch = useCallback(() => {
    if (!user) return
    const all = loadAll().filter(
      (e) =>
        e.user_id === user.id &&
        dateKeys.includes(e.date) &&
        (programId ? e.program_id === programId : true),
    )
    setEntries(all)
  }, [user, dateKeys.join(','), programId])

  useEffect(() => { fetch() }, [fetch])

  function getEntriesForDate(dateKey: string) {
    return entries
      .filter((e) => e.date === dateKey)
      .sort((a, b) => a.sort_order - b.sort_order)
  }

  function addEntry(dateKey: string, exerciseId: string) {
    if (!user) return
    const dateEntries = entries.filter((e) => e.date === dateKey)
    const entry: PlannedEntry = {
      id: crypto.randomUUID(),
      user_id: user.id,
      program_id: programId,
      date: dateKey,
      exercise_id: exerciseId,
      sort_order: dateEntries.length,
    }
    const all = loadAll()
    all.push(entry)
    saveAll(all)
    setEntries((prev) => [...prev, entry])
  }

  function removeEntry(id: string) {
    const all = loadAll().filter((e) => e.id !== id)
    saveAll(all)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  function moveEntry(entryId: string, toDateKey: string, toIndex: number) {
    const all = loadAll()
    const idx = all.findIndex((e) => e.id === entryId)
    if (idx === -1) return

    all[idx].date = toDateKey

    const dateEntries = all
      .filter((e) => e.date === toDateKey && e.user_id === user?.id && (programId ? e.program_id === programId : true))
      .sort((a, b) => a.sort_order - b.sort_order)

    const withoutMoved = dateEntries.filter((e) => e.id !== entryId)
    withoutMoved.splice(toIndex, 0, all[idx])
    withoutMoved.forEach((e, i) => {
      const globalIdx = all.findIndex((a) => a.id === e.id)
      if (globalIdx !== -1) all[globalIdx].sort_order = i
    })

    saveAll(all)
    setEntries(
      all.filter((e) => e.user_id === user?.id && dateKeys.includes(e.date) && (programId ? e.program_id === programId : true)),
    )
  }

  function clearDate(dateKey: string) {
    if (!user) return
    const all = loadAll().filter(
      (e) => !(e.date === dateKey && e.user_id === user.id && (programId ? e.program_id === programId : true)),
    )
    saveAll(all)
    setEntries((prev) => prev.filter((e) => e.date !== dateKey))
  }

  return {
    entries,
    days,
    dateKeys,
    weekStart,
    weekEnd,
    getEntriesForDate,
    addEntry,
    removeEntry,
    moveEntry,
    clearDate,
    refetch: fetch,
  }
}

/** Load all entries for a given program across all weeks */
export function loadProgramEntries(userId: string, programId: string): PlannedEntry[] {
  return loadAll().filter((e) => e.user_id === userId && e.program_id === programId)
}
