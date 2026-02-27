import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import usePrograms, { useProgramDays } from '@/hooks/usePrograms'
import ProgramDayEditor from '@/components/programs/ProgramDayEditor'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/Spinner'
import Badge from '@/components/ui/Badge'

export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { programs, loading: programsLoading } = usePrograms()
  const { days, loading: daysLoading, addDay, removeDay } = useProgramDays(id!)

  const [addDayOpen, setAddDayOpen] = useState(false)
  const [dayName, setDayName] = useState('')
  const [weekNumber, setWeekNumber] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const program = programs.find((p) => p.id === id)
  const loading = programsLoading || daysLoading

  async function handleAddDay() {
    setSubmitting(true)
    try {
      await addDay({
        name: dayName.trim(),
        week_number: weekNumber,
        day_number: days.filter((d) => d.week_number === weekNumber).length + 1,
      })
      setDayName('')
      setAddDayOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRemoveDay(dayId: string) {
    if (!confirm('Remove this day and all its exercises?')) return
    await removeDay(dayId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!program) {
    return (
      <div className="space-y-4">
        <Link to="/programs" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-500">
          <ArrowLeft className="h-4 w-4" /> Back to programs
        </Link>
        <p className="text-surface-500">Program not found.</p>
      </div>
    )
  }

  // Group days by week
  const weeks = Array.from({ length: program.weeks }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/programs" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-500">
            <ArrowLeft className="h-4 w-4" /> Programs
          </Link>
          <h1 className="mt-1 text-2xl font-bold">{program.name}</h1>
          {program.description && (
            <p className="mt-0.5 text-sm text-surface-500">{program.description}</p>
          )}
          <div className="mt-2 flex gap-1.5">
            <Badge>{program.weeks} {program.weeks === 1 ? 'week' : 'weeks'}</Badge>
            {program.is_active && <Badge variant="primary">Active</Badge>}
          </div>
        </div>
        <Button size="sm" onClick={() => setAddDayOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Day
        </Button>
      </div>

      {weeks.map((week) => {
        const weekDays = days.filter((d) => d.week_number === week)
        return (
          <div key={week} className="space-y-3">
            <h2 className="text-lg font-semibold text-surface-800">Week {week}</h2>
            {weekDays.length === 0 ? (
              <p className="py-4 text-center text-sm text-surface-400">
                No days added for this week yet.
              </p>
            ) : (
              <div className="space-y-3">
                {weekDays.map((day) => (
                  <ProgramDayEditor
                    key={day.id}
                    day={day}
                    onRemoveDay={handleRemoveDay}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}

      <Modal open={addDayOpen} onClose={() => setAddDayOpen(false)} title="Add Day">
        <div className="space-y-4">
          <Input
            id="day-name"
            label="Day Name"
            required
            value={dayName}
            onChange={(e) => setDayName(e.target.value)}
            placeholder="e.g. Push Day"
          />
          <Input
            id="week-number"
            label="Week"
            type="number"
            min={1}
            max={program.weeks}
            value={weekNumber}
            onChange={(e) => setWeekNumber(Number(e.target.value))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setAddDayOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDay} disabled={submitting || !dayName.trim()}>
              Add Day
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
