import { useState, type DragEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, X, Trash2, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { format, isToday, parseISO } from 'date-fns'
import useWeeklyPlan from '@/hooks/useWeeklyPlan'
import useExercises from '@/hooks/useExercises'
import usePrograms from '@/hooks/usePrograms'
import type { Exercise } from '@/types/database'
import type { ExerciseType, ExerciseRate, MuscleGroup, Equipment } from '@/types/common'
import ExerciseForm from '@/components/exercises/ExerciseForm'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function WeeklyPlanPage() {
  const { programId } = useParams<{ programId: string }>()
  const { programs, loading: programsLoading } = usePrograms()
  const { exercises, loading: exercisesLoading, create: createExercise } = useExercises()

  const program = programId ? programs.find((p) => p.id === programId) : null
  const totalWeeks = program?.weeks ?? 1
  const programStart = program?.start_date ? parseISO(program.start_date) : new Date()

  const [weekOffset, setWeekOffset] = useState(0)

  const {
    days,
    dateKeys,
    getEntriesForDate,
    addEntry,
    removeEntry,
    moveEntry,
    clearDate,
  } = useWeeklyPlan({
    startDate: programStart,
    weekOffset,
    programId: programId ?? null,
  })

  const activeExercises = exercises.filter((e) => !e.is_archived)

  // Filter exercise pool
  const [search, setSearch] = useState('')
  const filtered = activeExercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()),
  )

  // Drag state
  const [dragSource, setDragSource] = useState<
    | { type: 'pool'; exerciseId: string }
    | { type: 'entry'; entryId: string; fromDate: string }
    | null
  >(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)

  // New exercise modal
  const [newExerciseOpen, setNewExerciseOpen] = useState(false)
  const [creatingExercise, setCreatingExercise] = useState(false)

  async function handleCreateExercise(values: {
    name: string
    exercise_type: ExerciseType
    exercise_rate: ExerciseRate | null
    primary_muscle: MuscleGroup
    equipment: Equipment
    notes: string
  }) {
    setCreatingExercise(true)
    try {
      await createExercise(values)
      setNewExerciseOpen(false)
    } finally {
      setCreatingExercise(false)
    }
  }

  function getExerciseName(exerciseId: string) {
    return exercises.find((e) => e.id === exerciseId)?.name ?? 'Unknown'
  }

  function getExercise(exerciseId: string): Exercise | undefined {
    return exercises.find((e) => e.id === exerciseId)
  }

  function handlePoolDragStart(e: DragEvent, exerciseId: string) {
    setDragSource({ type: 'pool', exerciseId })
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('text/plain', exerciseId)
  }

  function handleEntryDragStart(e: DragEvent, entryId: string, fromDate: string) {
    setDragSource({ type: 'entry', entryId, fromDate })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', entryId)
  }

  function handleDayDragOver(e: DragEvent, dateKey: string) {
    e.preventDefault()
    e.dataTransfer.dropEffect = dragSource?.type === 'pool' ? 'copy' : 'move'
    setDropTarget(dateKey)
  }

  function handleDayDragLeave() {
    setDropTarget(null)
  }

  function handleDayDrop(e: DragEvent, dateKey: string) {
    e.preventDefault()
    setDropTarget(null)
    if (!dragSource) return

    if (dragSource.type === 'pool') {
      addEntry(dateKey, dragSource.exerciseId)
    } else if (dragSource.type === 'entry') {
      const dayEntries = getEntriesForDate(dateKey)
      moveEntry(dragSource.entryId, dateKey, dayEntries.length)
    }
    setDragSource(null)
  }

  function handleDragEnd() {
    setDragSource(null)
    setDropTarget(null)
  }

  if (programsLoading || exercisesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (programId && !program) {
    return (
      <div className="space-y-4">
        <Link to="/programs" className="inline-flex items-center gap-1 text-sm text-primary-600">
          <ArrowLeft className="h-4 w-4" /> Programs
        </Link>
        <p className="text-surface-500">Program not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            to={program ? `/programs/${program.id}` : '/'}
            className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-500"
          >
            <ArrowLeft className="h-4 w-4" /> {program ? program.name : 'Dashboard'}
          </Link>
          <h1 className="mt-1 text-2xl font-bold">
            {program ? `Plan: ${program.name}` : 'Plan Your Week'}
          </h1>
          <p className="text-sm text-surface-500">
            Drag exercises from the pool into each day.
          </p>
        </div>
      </div>

      {/* Week navigation */}
      {program && totalWeeks > 1 && (
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            disabled={weekOffset === 0}
            onClick={() => setWeekOffset((w) => w - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold text-surface-700">
            Week {weekOffset + 1} of {totalWeeks}
          </span>
          <Button
            size="sm"
            variant="ghost"
            disabled={weekOffset >= totalWeeks - 1}
            onClick={() => setWeekOffset((w) => w + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-xs text-surface-400">
            {format(days[0], 'MMM d')} – {format(days[6], 'MMM d, yyyy')}
          </span>
        </div>
      )}

      <div className="flex gap-4">
        {/* Day columns */}
        <div className="grid flex-1 grid-cols-7 gap-2">
          {days.map((day, i) => {
            const dateKey = dateKeys[i]
            const today = isToday(day)
            const planned = getEntriesForDate(dateKey)
            const isOver = dropTarget === dateKey

            return (
              <div
                key={dateKey}
                onDragOver={(e) => handleDayDragOver(e, dateKey)}
                onDragLeave={handleDayDragLeave}
                onDrop={(e) => handleDayDrop(e, dateKey)}
                className={cn(
                  'flex min-h-[300px] flex-col rounded-xl border-2 border-dashed transition-colors',
                  today ? 'border-primary-300 bg-primary-50/20' : 'border-surface-200 bg-white',
                  isOver && 'border-primary-400 bg-primary-50/40',
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-between rounded-t-lg px-2 py-1.5',
                    today ? 'bg-primary-100/50' : 'bg-surface-50',
                  )}
                >
                  <div>
                    <span
                      className={cn(
                        'text-xs font-bold',
                        today ? 'text-primary-700' : 'text-surface-600',
                      )}
                    >
                      {format(day, 'EEE')}
                    </span>
                    <span className="ml-1 text-[11px] text-surface-400">
                      {format(day, 'M/d')}
                    </span>
                  </div>
                  {planned.length > 0 && (
                    <button
                      onClick={() => clearDate(dateKey)}
                      className="rounded p-0.5 text-surface-300 hover:bg-danger-50 hover:text-danger-500"
                      aria-label="Clear day"
                      title="Clear all"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-1 p-1.5">
                  {planned.map((entry) => {
                    const ex = getExercise(entry.exercise_id)
                    return (
                      <div
                        key={entry.id}
                        draggable
                        onDragStart={(e) => handleEntryDragStart(e, entry.id, dateKey)}
                        onDragEnd={handleDragEnd}
                        className="group flex items-start gap-1 rounded-lg border border-surface-200 bg-white p-1.5 text-[11px] shadow-sm cursor-grab active:cursor-grabbing"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-surface-800">
                            {getExerciseName(entry.exercise_id)}
                          </p>
                          {ex && (
                            <p className="truncate text-[10px] text-surface-400">
                              {formatLabel(ex.primary_muscle)}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeEntry(entry.id)}
                          className="shrink-0 rounded p-0.5 text-surface-300 opacity-0 transition-opacity hover:text-danger-500 group-hover:opacity-100"
                          aria-label="Remove"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )
                  })}

                  {planned.length === 0 && (
                    <div className="flex flex-1 items-center justify-center">
                      <span className="text-[11px] text-surface-300">Drop here</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Exercise pool */}
        <div className="w-56 shrink-0">
          <div className="sticky top-6 rounded-xl border border-surface-200 bg-white">
            <div className="border-b border-surface-100 px-3 py-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wide text-surface-500">
                  Exercise Pool
                </h3>
                <button
                  onClick={() => setNewExerciseOpen(true)}
                  className="rounded p-0.5 text-surface-400 hover:bg-primary-50 hover:text-primary-600"
                  aria-label="New exercise"
                  title="New exercise"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mt-1.5 w-full rounded border border-surface-200 px-2 py-1 text-xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              <div className="space-y-1">
                {filtered.map((exercise) => (
                  <div
                    key={exercise.id}
                    draggable
                    onDragStart={(e) => handlePoolDragStart(e, exercise.id)}
                    onDragEnd={handleDragEnd}
                    className="rounded-lg border border-surface-200 bg-surface-50 px-2.5 py-1.5 cursor-grab active:cursor-grabbing hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
                  >
                    <p className="text-xs font-medium text-surface-800 truncate">
                      {exercise.name}
                    </p>
                    <div className="mt-0.5 flex gap-1">
                      <Badge className="!text-[9px] !px-1 !py-0">{formatLabel(exercise.primary_muscle)}</Badge>
                      <Badge className="!text-[9px] !px-1 !py-0">{formatLabel(exercise.equipment)}</Badge>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p className="py-4 text-center text-[11px] text-surface-400">
                    {activeExercises.length === 0 ? 'Add exercises first' : 'No matches'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New exercise modal */}
      <Modal open={newExerciseOpen} onClose={() => setNewExerciseOpen(false)} title="New Exercise">
        <ExerciseForm
          onSubmit={handleCreateExercise}
          onCancel={() => setNewExerciseOpen(false)}
          loading={creatingExercise}
        />
      </Modal>
    </div>
  )
}
