import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { format, isToday, isSameDay, differenceInWeeks, parseISO, startOfWeek } from 'date-fns'
import { Pencil } from 'lucide-react'
import useWeeklyPlan from '@/hooks/useWeeklyPlan'
import useExercises from '@/hooks/useExercises'
import type { Program, WorkoutSession } from '@/types/database'
import { cn } from '@/lib/utils'

interface WeeklyCalendarProps {
  sessions: WorkoutSession[]
  activeProgram?: Program | null
}

export default function WeeklyCalendar({ sessions, activeProgram }: WeeklyCalendarProps) {
  const programStart = activeProgram?.start_date ? parseISO(activeProgram.start_date) : undefined

  // Figure out which week offset we're in relative to the program start
  const currentWeekOffset = useMemo(() => {
    if (!programStart) return 0
    return differenceInWeeks(
      startOfWeek(new Date(), { weekStartsOn: 0 }),
      startOfWeek(programStart, { weekStartsOn: 0 }),
    )
  }, [programStart])

  const { days, dateKeys, getEntriesForDate } = useWeeklyPlan({
    startDate: programStart,
    weekOffset: currentWeekOffset,
    programId: activeProgram?.id ?? null,
  })
  const { exercises } = useExercises()

  function getExerciseName(exerciseId: string) {
    return exercises.find((e) => e.id === exerciseId)?.name ?? 'Unknown'
  }

  function dayStatus(day: Date) {
    const completed = sessions.some(
      (s) => isSameDay(new Date(s.started_at), day) && s.completed_at,
    )
    const inProgress = sessions.some(
      (s) => isSameDay(new Date(s.started_at), day) && !s.completed_at,
    )
    if (completed) return 'completed'
    if (inProgress) return 'in_progress'
    return 'none'
  }

  const planLink = activeProgram ? `/plan/${activeProgram.id}` : '/plan'

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-surface-700">
          This Week
          {activeProgram && (
            <span className="ml-1.5 text-xs font-normal text-surface-400">
              — {activeProgram.name} (wk {currentWeekOffset + 1}/{activeProgram.weeks})
            </span>
          )}
        </h3>
        <Link
          to={planLink}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50"
        >
          <Pencil className="h-3 w-3" />
          Plan
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const dateKey = dateKeys[i]
          const today = isToday(day)
          const status = dayStatus(day)
          const planned = getEntriesForDate(dateKey)

          return (
            <div
              key={dateKey}
              className={cn(
                'flex min-h-[80px] flex-col rounded-lg border p-1.5',
                today ? 'border-primary-300 bg-primary-50/30' : 'border-surface-200',
                status === 'completed' && 'border-primary-400 bg-primary-50/50',
              )}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={cn(
                    'text-[11px] font-semibold',
                    today ? 'text-primary-600' : 'text-surface-500',
                  )}
                >
                  {format(day, 'EEE')}
                </span>
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                    today && 'bg-primary-500 text-white',
                    status === 'completed' && !today && 'bg-primary-100 text-primary-700',
                    status === 'in_progress' && !today && 'bg-warning-500/20 text-warning-600',
                    status === 'none' && !today && 'text-surface-400',
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                {planned.map((entry) => (
                  <div
                    key={entry.id}
                    className="truncate rounded bg-surface-100 px-1 py-0.5 text-[10px] leading-tight text-surface-600"
                    title={getExerciseName(entry.exercise_id)}
                  >
                    {getExerciseName(entry.exercise_id)}
                  </div>
                ))}
              </div>

              {planned.length === 0 && (
                <div className="flex flex-1 items-center justify-center">
                  <span className="text-[10px] text-surface-300">Rest</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
