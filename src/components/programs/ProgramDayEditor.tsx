import { useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { useProgramDayExercises } from '@/hooks/usePrograms'
import useExercises from '@/hooks/useExercises'
import type { ProgramDay } from '@/types/database'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'

interface ProgramDayEditorProps {
  day: ProgramDay
  onRemoveDay: (id: string) => void
}

export default function ProgramDayEditor({ day, onRemoveDay }: ProgramDayEditorProps) {
  const { dayExercises, loading, addExercise, updateExercise, removeExercise } =
    useProgramDayExercises(day.id)
  const { exercises } = useExercises()
  const [selectedExerciseId, setSelectedExerciseId] = useState('')

  const activeExercises = exercises.filter((e) => !e.is_archived)
  const exerciseOptions = activeExercises.map((e) => ({ value: e.id, label: e.name }))

  async function handleAddExercise() {
    if (!selectedExerciseId) return
    await addExercise({
      exercise_id: selectedExerciseId,
      sort_order: dayExercises.length,
      target_sets: 3,
      target_reps: 10,
    })
    setSelectedExerciseId('')
  }

  function getExerciseName(exerciseId: string) {
    return exercises.find((e) => e.id === exerciseId)?.name ?? 'Unknown'
  }

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner size="sm" />
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-surface-200 bg-white">
      <div className="flex items-center justify-between border-b border-surface-200 px-4 py-2.5">
        <h3 className="text-sm font-semibold text-surface-900">{day.name}</h3>
        <button
          onClick={() => onRemoveDay(day.id)}
          className="rounded-lg p-1 text-surface-400 hover:bg-danger-50 hover:text-danger-600"
          aria-label="Remove day"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="divide-y divide-surface-100">
        {dayExercises.map((de) => (
          <div key={de.id} className="flex items-center gap-3 px-4 py-2">
            <GripVertical className="h-4 w-4 shrink-0 text-surface-300" />
            <span className="flex-1 text-sm text-surface-800">{getExerciseName(de.exercise_id)}</span>

            <div className="flex items-center gap-2">
              <Input
                className="w-16 text-center"
                type="number"
                min={1}
                value={de.target_sets ?? ''}
                onChange={(e) => updateExercise(de.id, { target_sets: Number(e.target.value) || null })}
                placeholder="Sets"
              />
              <span className="text-xs text-surface-400">x</span>
              <Input
                className="w-16 text-center"
                type="number"
                min={1}
                value={de.target_reps ?? ''}
                onChange={(e) => updateExercise(de.id, { target_reps: Number(e.target.value) || null })}
                placeholder="Reps"
              />
            </div>

            <button
              onClick={() => removeExercise(de.id)}
              className="rounded-lg p-1 text-surface-400 hover:bg-danger-50 hover:text-danger-600"
              aria-label="Remove exercise"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-surface-100 px-4 py-2.5">
        <Select
          options={exerciseOptions}
          value={selectedExerciseId}
          onChange={(e) => setSelectedExerciseId(e.target.value)}
          placeholder="Select exercise..."
          className="flex-1"
        />
        <Button size="sm" onClick={handleAddExercise} disabled={!selectedExerciseId}>
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
    </div>
  )
}
