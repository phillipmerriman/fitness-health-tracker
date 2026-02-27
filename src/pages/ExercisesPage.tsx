import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import useExercises from '@/hooks/useExercises'
import type { Exercise } from '@/types/database'
import type { ExerciseType, MuscleGroup, Equipment } from '@/types/common'
import ExerciseCard from '@/components/exercises/ExerciseCard'
import ExerciseForm from '@/components/exercises/ExerciseForm'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Spinner from '@/components/ui/Spinner'

const typeFilterOptions = [
  { value: '', label: 'All Types' },
  { value: 'strength', label: 'Strength' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'other', label: 'Other' },
]

const equipmentFilterOptions = [
  { value: '', label: 'All Equipment' },
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

const muscleFilterOptions = [
  { value: '', label: 'All Muscles' },
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

export default function ExercisesPage() {
  const { exercises, loading, create, update, archive, unarchive, remove } = useExercises()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('')
  const [equipmentFilter, setEquipmentFilter] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Exercise | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const filtered = useMemo(() => {
    return exercises.filter((e) => {
      if (!showArchived && e.is_archived) return false
      if (showArchived && !e.is_archived) return false
      if (typeFilter && e.exercise_type !== typeFilter) return false
      if (muscleFilter && e.primary_muscle !== muscleFilter) return false
      if (equipmentFilter && e.equipment !== equipmentFilter) return false
      if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [exercises, search, typeFilter, muscleFilter, equipmentFilter, showArchived])

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(exercise: Exercise) {
    setEditing(exercise)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
  }

  async function handleSubmit(values: {
    name: string
    exercise_type: ExerciseType
    primary_muscle: MuscleGroup
    equipment: Equipment
    notes: string
  }) {
    setSubmitting(true)
    try {
      if (editing) {
        await update(editing.id, values)
      } else {
        await create(values)
      }
      closeModal()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this exercise? This cannot be undone.')) return
    await remove(id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exercises</h1>
        <Button onClick={openAdd} size="sm">
          <Plus className="h-4 w-4" />
          Add Exercise
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-surface-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <Select
          options={typeFilterOptions}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-36"
        />
        <Select
          options={muscleFilterOptions}
          value={muscleFilter}
          onChange={(e) => setMuscleFilter(e.target.value)}
          className="w-40"
        />
        <Select
          options={equipmentFilterOptions}
          value={equipmentFilter}
          onChange={(e) => setEquipmentFilter(e.target.value)}
          className="w-40"
        />
        <label className="flex items-center gap-1.5 text-sm text-surface-600">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="rounded border-surface-300"
          />
          Archived
        </label>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-surface-400">
          {exercises.length === 0
            ? 'No exercises yet. Add your first one!'
            : 'No exercises match your filters.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onEdit={openEdit}
              onArchive={archive}
              onUnarchive={unarchive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Exercise' : 'New Exercise'}
      >
        <ExerciseForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitting={submitting}
        />
      </Modal>
    </div>
  )
}
