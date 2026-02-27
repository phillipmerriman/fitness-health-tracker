import type { Database } from '@/types/database'

type TableName = keyof Database['public']['Tables']
type Row<T extends TableName> = Database['public']['Tables'][T]['Row']

const PREFIX = 'fittrack:'

export const localDb = {
  getAll<T extends TableName>(table: T): Row<T>[] {
    const raw = localStorage.getItem(`${PREFIX}${table}`)
    return raw ? JSON.parse(raw) : []
  },

  setAll<T extends TableName>(table: T, rows: Row<T>[]) {
    localStorage.setItem(`${PREFIX}${table}`, JSON.stringify(rows))
  },

  insert<T extends TableName>(table: T, row: Row<T>): Row<T> {
    const rows = localDb.getAll(table)
    rows.push(row)
    localDb.setAll(table, rows)
    return row
  },

  update<T extends TableName>(table: T, id: string, values: Partial<Row<T>>): Row<T> | null {
    const rows = localDb.getAll(table)
    const idx = rows.findIndex((r) => (r as { id: string }).id === id)
    if (idx === -1) return null
    rows[idx] = { ...rows[idx], ...values, updated_at: new Date().toISOString() } as Row<T>
    localDb.setAll(table, rows)
    return rows[idx]
  },

  remove<T extends TableName>(table: T, id: string): boolean {
    const rows = localDb.getAll(table)
    const filtered = rows.filter((r) => (r as { id: string }).id !== id)
    if (filtered.length === rows.length) return false
    localDb.setAll(table, filtered)
    return true
  },
}
