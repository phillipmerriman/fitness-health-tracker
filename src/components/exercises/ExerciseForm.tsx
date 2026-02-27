import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { Exercise } from '@/types/database'
import type { ExerciseType, ExerciseRate, MuscleGroup, Equipment } from '@/types/common'
import { EXERCISE_COLORS, type ExerciseColor } from '@/types/common'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

const exerciseTypeOptions: { value: ExerciseType; label: string }[] = [
  { value: 'strength', label: 'Strength' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'warm_up', label: 'Warm Up' },
  { value: 'cool_down', label: 'Cool Down' },
  { value: 'other', label: 'Other' },
]

const muscleOptions: { value: MuscleGroup; label: string }[] = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'forearms', label: 'Forearms' },
  { value: 'core', label: 'Core' },
  { value: 'quads', label: 'Quads' },
  { value: 'hamstrings', label: 'Hamstrings' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'calves', label: 'Calves' },
  { value: 'full_body', label: 'Full Body' },
  { value: 'upper_body', label: 'Upper Body' },
  { value: 'lower_body', label: 'Lower Body' },
  { value: 'other', label: 'Other' },
]

const exerciseRateOptions: { value: string; label: string }[] = [
  { value: '', label: 'None' },
  { value: 'ballistic', label: 'Ballistic' },
  { value: 'grind', label: 'Grind' },
]

const equipmentOptions: { value: Equipment; label: string }[] = [
  { value: 'barbell', label: 'Barbell' },
  { value: 'dumbbell', label: 'Dumbbell' },
  { value: 'machine', label: 'Machine' },
  { value: 'cable', label: 'Cable' },
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'band', label: 'Band' },
  { value: 'steel_mace', label: 'Steel Mace' },
  { value: 'steel_club', label: 'Steel Club' },
  { value: 'other', label: 'Other' },
]

interface ExerciseFormProps {
  initial?: Exercise | null
  onSubmit: (values: {
    name: string
    exercise_type: ExerciseType
    exercise_rate: ExerciseRate | null
    primary_muscle: MuscleGroup
    equipment: Equipment
    color: string | null
    notes: string
  }) => Promise<void>
  onCancel: () => void
  submitting?: boolean
  loading?: boolean
}

export default function ExerciseForm({ initial, onSubmit, onCancel, submitting, loading }: ExerciseFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [exerciseType, setExerciseType] = useState<ExerciseType>(
    (initial?.exercise_type as ExerciseType) ?? 'strength',
  )
  const [primaryMuscle, setPrimaryMuscle] = useState<MuscleGroup>(
    (initial?.primary_muscle as MuscleGroup) ?? 'other',
  )
  const [exerciseRate, setExerciseRate] = useState<ExerciseRate | null>(
    (initial?.exercise_rate as ExerciseRate) ?? null,
  )
  const [equipment, setEquipment] = useState<Equipment>(
    (initial?.equipment as Equipment) ?? 'bodyweight',
  )
  const [color, setColor] = useState<ExerciseColor | null>(
    (initial?.color as ExerciseColor) ?? null,
  )
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const isSubmitting = submitting || loading

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onSubmit({ name: name.trim(), exercise_type: exerciseType, exercise_rate: exerciseRate, primary_muscle: primaryMuscle, equipment, color, notes: notes.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="exercise-name"
        label="Name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        onClear={() => setName('')}
        placeholder="e.g. Bench Press"
      />

      <Select
        id="exercise-type"
        label="Type"
        value={exerciseType}
        onChange={(e) => setExerciseType(e.target.value as ExerciseType)}
        options={exerciseTypeOptions}
      />

      <Select
        id="primary-muscle"
        label="Primary Muscle"
        value={primaryMuscle}
        onChange={(e) => setPrimaryMuscle(e.target.value as MuscleGroup)}
        options={muscleOptions}
      />

      <Select
        id="exercise-rate"
        label="Rate"
        value={exerciseRate ?? ''}
        onChange={(e) => setExerciseRate((e.target.value || null) as ExerciseRate | null)}
        options={exerciseRateOptions}
      />

      <Select
        id="equipment"
        label="Equipment"
        value={equipment}
        onChange={(e) => setEquipment(e.target.value as Equipment)}
        options={equipmentOptions}
      />

      {/* Color picker */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-surface-700">Color</label>
        <div className="flex flex-wrap gap-1.5">
          {EXERCISE_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(color === c.value ? null : c.value as ExerciseColor)}
              className={cn(
                'h-7 w-7 rounded-full border-2 transition-transform hover:scale-110',
                c.bg,
                color === c.value ? 'border-surface-900 ring-2 ring-surface-400 scale-110' : 'border-transparent',
              )}
              aria-label={c.label}
              title={c.label}
            />
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="exercise-notes" className="block text-sm font-medium text-surface-700">
          Notes
        </label>
        <div className="relative">
          <textarea
            id="exercise-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={cn(
              'block w-full rounded-lg border border-surface-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
              notes && 'pr-8',
            )}
            placeholder="Optional notes..."
          />
          {notes && (
            <button
              type="button"
              onClick={() => setNotes('')}
              className="absolute right-2 top-2 rounded p-0.5 text-surface-400 hover:text-surface-600"
              aria-label="Clear notes"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !name.trim()}>
          {initial ? 'Save Changes' : 'Add Exercise'}
        </Button>
      </div>
    </form>
  )
}
