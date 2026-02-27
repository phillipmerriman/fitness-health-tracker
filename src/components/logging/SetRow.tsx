import { Trash2 } from 'lucide-react'
import type { WorkoutSet, UpdateDto } from '@/types/database'
import Badge from '@/components/ui/Badge'

interface SetRowProps {
  set: WorkoutSet
  onUpdate: (id: string, values: UpdateDto<'workout_sets'>) => void
  onRemove: (id: string) => void
}

export default function SetRow({ set, onUpdate, onRemove }: SetRowProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <span className="w-8 text-center text-xs font-medium text-surface-400">
        {set.is_warmup ? 'W' : set.set_number}
      </span>

      {set.is_warmup && <Badge variant="warning" className="text-[10px]">Warm-up</Badge>}

      <input
        type="number"
        min={0}
        className="w-16 rounded border border-surface-200 px-2 py-1 text-center text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        value={set.weight ?? ''}
        onChange={(e) => onUpdate(set.id, { weight: e.target.value ? Number(e.target.value) : null })}
        placeholder="lbs"
      />
      <span className="text-xs text-surface-400">x</span>
      <input
        type="number"
        min={0}
        className="w-16 rounded border border-surface-200 px-2 py-1 text-center text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        value={set.reps ?? ''}
        onChange={(e) => onUpdate(set.id, { reps: e.target.value ? Number(e.target.value) : null })}
        placeholder="reps"
      />

      <input
        type="number"
        min={1}
        max={10}
        step={0.5}
        className="w-14 rounded border border-surface-200 px-2 py-1 text-center text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        value={set.rpe ?? ''}
        onChange={(e) => onUpdate(set.id, { rpe: e.target.value ? Number(e.target.value) : null })}
        placeholder="RPE"
      />

      <button
        onClick={() => onRemove(set.id)}
        className="ml-auto rounded p-1 text-surface-300 hover:bg-danger-50 hover:text-danger-600"
        aria-label="Remove set"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
