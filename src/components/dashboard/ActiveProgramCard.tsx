import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CalendarRange, ChevronRight } from 'lucide-react'
import { useProgramDays } from '@/hooks/usePrograms'
import type { Program, WorkoutSession } from '@/types/database'
import Badge from '@/components/ui/Badge'

interface ActiveProgramCardProps {
  program: Program
  sessions: WorkoutSession[]
}

export default function ActiveProgramCard({ program, sessions }: ActiveProgramCardProps) {
  const { days } = useProgramDays(program.id)

  // Count how many sessions have been completed since the program was created
  const completedSessions = useMemo(
    () =>
      sessions.filter(
        (s) =>
          s.completed_at &&
          new Date(s.started_at) >= new Date(program.created_at),
      ).length,
    [sessions, program.created_at],
  )

  const totalDays = days.length

  return (
    <Link
      to={`/programs/${program.id}`}
      className="block rounded-xl border border-surface-200 bg-white p-4 shadow-sm transition-colors hover:border-primary-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary-50 p-2">
            <CalendarRange className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <p className="font-semibold text-surface-900">{program.name}</p>
            {program.description && (
              <p className="mt-0.5 text-sm text-surface-500">{program.description}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="primary">Active</Badge>
              <Badge>{program.weeks} {program.weeks === 1 ? 'week' : 'weeks'}</Badge>
              <Badge>{totalDays} {totalDays === 1 ? 'day' : 'days'}</Badge>
            </div>
          </div>
        </div>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-surface-400" />
      </div>

      {/* Progress bar */}
      {totalDays > 0 && (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs text-surface-500">
            <span>{completedSessions} sessions completed</span>
            <span>{totalDays} days in program</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-100">
            <div
              className="h-full rounded-full bg-primary-500 transition-all"
              style={{ width: `${Math.min((completedSessions / totalDays) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </Link>
  )
}
