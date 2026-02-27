import { useState, type FormEvent } from 'react'
import type { Exercise } from '@/types/database'
import type { ExerciseType, MuscleGroup, Equipment } from '@/types/common'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

const exerciseTypeOptions: { value: ExerciseType; label: string }[] = [
  { value: 'strength', label: 'Strength' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibility' },
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
    primary_muscle: MuscleGroup
    equipment: Equipment
    notes: string
  }) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}

export default function ExerciseForm({ initial, onSubmit, onCancel, submitting }: ExerciseFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [exerciseType, setExerciseType] = useState<ExerciseType>(
    (initial?.exercise_type as ExerciseType) ?? 'strength',
  )
  const [primaryMuscle, setPrimaryMuscle] = useState<MuscleGroup>(
    (initial?.primary_muscle as MuscleGroup) ?? 'other',
  )
  const [equipment, setEquipment] = useState<Equipment>(
    (initial?.equipment as Equipment) ?? 'bodyweight',
  )
  const [notes, setNotes] = useState(initial?.notes ?? '')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onSubmit({ name: name.trim(), exercise_type: exerciseType, primary_muscle: primaryMuscle, equipment, notes: notes.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="exercise-name"
        label="Name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
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
        id="equipment"
        label="Equipment"
        value={equipment}
        onChange={(e) => setEquipment(e.target.value as Equipment)}
        options={equipmentOptions}
      />

      <div className="space-y-1">
        <label htmlFor="exercise-notes" className="block text-sm font-medium text-surface-700">
          Notes
        </label>
        <textarea
          id="exercise-notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="block w-full rounded-lg border border-surface-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          placeholder="Optional notes..."
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || !name.trim()}>
          {initial ? 'Save Changes' : 'Add Exercise'}
        </Button>
      </div>
    </form>
  )
}
