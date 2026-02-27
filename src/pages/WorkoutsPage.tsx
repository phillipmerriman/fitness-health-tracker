import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, ChevronRight } from 'lucide-react'
import useWorkouts from '@/hooks/useWorkouts'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'
import { formatDate, formatDuration } from '@/lib/utils'

export default function WorkoutsPage() {
  const { sessions, loading, create, remove } = useWorkouts()
  const navigate = useNavigate()

  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleStart() {
    setSubmitting(true)
    try {
      const session = await create({ name: name.trim() || 'Workout' })
      if (session) navigate(`/workouts/${session.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this workout session?')) return
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
        <h1 className="text-2xl font-bold">Workouts</h1>
        <Button onClick={() => setModalOpen(true)} size="sm">
          <Plus className="h-4 w-4" />
          Start Workout
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div className="py-12 text-center text-surface-400">
          No workouts yet. Start your first session!
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card key={session.id} className="flex items-center justify-between gap-3">
              <button
                onClick={() => navigate(`/workouts/${session.id}`)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="font-medium text-surface-900">{session.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-surface-500">
                  <span>{formatDate(session.started_at)}</span>
                  {session.duration_sec != null && (
                    <Badge>{formatDuration(session.duration_sec)}</Badge>
                  )}
                  {session.completed_at ? (
                    <Badge variant="primary">Completed</Badge>
                  ) : (
                    <Badge variant="warning">In Progress</Badge>
                  )}
                </div>
              </button>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => handleDelete(session.id)}
                  className="rounded-lg p-1.5 text-surface-400 hover:bg-danger-50 hover:text-danger-600"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate(`/workouts/${session.id}`)}
                  className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 hover:text-surface-600"
                  aria-label="Open"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Start Workout">
        <div className="space-y-4">
          <Input
            id="workout-name"
            label="Workout Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Push Day, Upper Body"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleStart} disabled={submitting}>
              {submitting ? 'Starting...' : 'Start'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
