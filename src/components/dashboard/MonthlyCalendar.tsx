import { useState, useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { loadProgramEntries } from '@/hooks/useWeeklyPlan'
import { useAuth } from '@/contexts/AuthContext'
import type { Program, WorkoutSession } from '@/types/database'
import { cn } from '@/lib/utils'

interface MonthlyCalendarProps {
  sessions: WorkoutSession[]
  activeProgram?: Program | null
}

export default function MonthlyCalendar({ sessions, activeProgram }: MonthlyCalendarProps) {
  const { user } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  // Load all planned entries for the active program
  const plannedDates = useMemo(() => {
    if (!activeProgram || !user) return new Set<string>()
    const entries = loadProgramEntries(user.id, activeProgram.id)
    return new Set(entries.map((e) => e.date))
  }, [activeProgram, user])

  function hasWorkout(day: Date) {
    return sessions.some((s) => isSameDay(new Date(s.started_at), day))
  }

  function isCompleted(day: Date) {
    return sessions.some(
      (s) => isSameDay(new Date(s.started_at), day) && s.completed_at,
    )
  }

  function isPlanned(day: Date) {
    return plannedDates.has(format(day, 'yyyy-MM-dd'))
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-surface-700">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="rounded-lg p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-600"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="rounded-lg p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-600"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <span key={d} className="text-[11px] font-medium text-surface-400">{d}</span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-px">
        {days.map((day) => {
          const inMonth = isSameMonth(day, currentMonth)
          const today = isToday(day)
          const worked = hasWorkout(day)
          const completed = isCompleted(day)
          const planned = isPlanned(day)

          return (
            <div
              key={day.toISOString()}
              className="flex flex-col items-center justify-center py-1"
            >
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors',
                  !inMonth && 'text-surface-300',
                  inMonth && !worked && !planned && 'text-surface-600',
                  today && !worked && !planned && 'ring-2 ring-primary-400 ring-offset-1',
                  completed && 'bg-primary-500 text-white',
                  worked && !completed && 'bg-warning-500/20 text-warning-600',
                  planned && !worked && inMonth && 'bg-primary-100 text-primary-700',
                )}
              >
                {format(day, 'd')}
              </div>
              {/* Dot indicator for planned days */}
              {planned && !worked && inMonth && (
                <div className="mt-0.5 h-1 w-1 rounded-full bg-primary-400" />
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-surface-400">
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-full bg-primary-500" />
          Completed
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-full bg-warning-500/40" />
          In Progress
        </div>
        {activeProgram && (
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-full bg-primary-200" />
            Planned
          </div>
        )}
      </div>
    </div>
  )
}
