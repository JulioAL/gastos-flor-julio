'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MONTH_NAMES, ACCOUNTS } from '@/lib/utils/accounts'
import type { BudgetMonth, BudgetExpense } from '@/lib/supabase/types'

const DIST_COLS = [
  { key: 'julio',           label: 'JULIO' },
  { key: 'flor',            label: 'FLOR' },
  { key: 'casita',          label: 'CASITA' },
  { key: 'power',           label: 'POWER' },
  { key: 'limpieza',        label: 'LIMPIEZA' },
  { key: 'regalos',         label: 'REGALOS' },
  { key: 'flor_y_julio',    label: 'FLOR Y JULIO' },
  { key: 'navidad',         label: 'NAVIDAD' },
  { key: 'gasolina',        label: 'GASOLINA' },
  { key: 'entretenimiento', label: 'ENTRETENIMIENTO' },
] as const

type DistColKey = typeof DIST_COLS[number]['key']

type DistAssignment = 'full' | 'half'
const GASTO_TO_DIST: Record<string, Partial<Record<DistColKey, DistAssignment>>> = {
  'Mantenimiento':                  { casita: 'full' },
  'Energía eléctrica':              { casita: 'full' },
  'Internet & Cable':               { casita: 'full' },
  'Teléfonos celulares':            { casita: 'full' },
  'Alquiler casa':                  { julio: 'full' },
  'Combustible':                    { gasolina: 'full' },
  'Alimentos hogar':                { casita: 'full' },
  'Limpieza y Cuidado personal':    { casita: 'full' },
  'Salud':                          { power: 'full' },
  'Ofrenda':                        { flor: 'full' },
  'Limpieza Casa (servicio)':       { limpieza: 'full' },
  'Gastos: comida/salidas/compras': { flor_y_julio: 'full' },
  'Entretenimiento':                { entretenimiento: 'full' },
  'Seguro carro':                   { power: 'full' },
  'Regalos y celebraciones':        { regalos: 'full' },
  'Regalos de Navidad':             { navidad: 'full' },
  'Baby':                           { power: 'full' },
  'Familias':                       { julio: 'half', flor: 'half' },
  'Otros (Julio & Flor)':          { julio: 'half', flor: 'half' },
  'Ahorro Casa':                    { power: 'full' },
  'Emergencia':                     { power: 'full' },
}

type DistRow = {
  id: string
  gasto_egreso: string
  sort_order: number
  budget_month_id: string
  _unsaved?: boolean
} & Record<DistColKey, number | null>

function makeEmptyDistRow(gasto_egreso: string, sort_order: number, tempId: string, budget_month_id: string): DistRow {
  return {
    id: tempId, gasto_egreso, sort_order, budget_month_id,
    julio: null, flor: null, casita: null, power: null,
    limpieza: null, regalos: null, flor_y_julio: null,
    navidad: null, gasolina: null, entretenimiento: null,
    _unsaved: true,
  }
}

interface Props {
  initialMonths: BudgetMonth[]
  powerTotal: number
}

const INCOME_SOURCES = [
  { key: 'julio', label: 'JULIO' },
  { key: 'flor', label: 'FLOR' },
  { key: 'otros_ingresos', label: 'OTROS INGRESOS' },
] as const

type IncomeEntry = { id: string; amount: number; description: string | null }
type IncomeByMonth = Record<string, Record<string, IncomeEntry>>

const PRESUPUESTO_DEFAULT_LABELS = [
  'Mantenimiento',
  'Energía eléctrica',
  'Internet & Cable',
  'Teléfonos celulares',
  'Alquiler casa',
  'Combustible',
  'Alimentos hogar',
  'Limpieza y Cuidado personal',
  'Salud',
  'Ofrenda',
  'Limpieza Casa (servicio)',
  'Gastos: comida/salidas/compras',
  'Entretenimiento',
  'Seguro carro',
  'Regalos y celebraciones',
  'Regalos de Navidad',
  'Baby',
  'Familias',
  'Otros (Julio & Flor)',
  'Ahorro Casa',
  'Emergencia',
]

type GastoEntry = { id: string; amount: number }
type GastosByMonth = Record<string, Record<string, GastoEntry>>

const DEUDAS_DEFAULT_LABELS = ['Carro']

function getDisplayMonths(months: BudgetMonth[], selectedMonthId: string): (BudgetMonth | null)[] {
  const selected = months.find(m => m.id === selectedMonthId)
  if (!selected) return [null, null, null]
  return [-2, -1, 0].map(offset => {
    let month = selected.month + offset
    let year = selected.year
    while (month < 1) { month += 12; year -= 1 }
    return months.find(m => m.year === year && m.month === month) ?? null
  })
}

function getMonthLabels(months: BudgetMonth[], selectedMonthId: string): string[] {
  const selected = months.find(m => m.id === selectedMonthId)
  if (!selected) return ['—', '—', '—']
  return [-2, -1, 0].map(offset => {
    let month = selected.month + offset
    while (month < 1) month += 12
    return MONTH_NAMES[month]
  })
}


function getDeudaMonths(months: BudgetMonth[], selectedMonthId: string): BudgetMonth[] {
  const selected = months.find(m => m.id === selectedMonthId)
  if (!selected) return []
  return months
    .filter(m => m.year < selected.year || (m.year === selected.year && m.month <= selected.month))
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
}

export default function CuentasClient({ initialMonths, powerTotal }: Props) {
  const supabase = createClient()
  const [months, setMonths] = useState<BudgetMonth[]>(initialMonths)
  const currentMonth = new Date().getMonth() + 1
  const defaultMonth = months.find(m => m.month === currentMonth) ?? months[months.length - 1]
  const [selectedMonthId, setSelectedMonthId] = useState(defaultMonth?.id ?? '')
  const [expenses, setExpenses] = useState<BudgetExpense[]>([])
  const [loading, setLoading] = useState(false)
  const [editingAccountKey, setEditingAccountKey] = useState<string | null>(null)
  const [editAccountValue, setEditAccountValue] = useState('')
  const [incomeByMonth, setIncomeByMonth] = useState<IncomeByMonth>({})
  const [editingCell, setEditingCell] = useState<{ monthId: string; source: string } | null>(null)
  const [editCellValue, setEditCellValue] = useState('')
  const [editingComment, setEditingComment] = useState<{ monthId: string; source: string } | null>(null)
  const [editCommentValue, setEditCommentValue] = useState('')
  const [gastoRows, setGastoRows] = useState<string[]>([])
  const [gastosByMonth, setGastosByMonth] = useState<GastosByMonth>({})
  const [editingGastoCell, setEditingGastoCell] = useState<{ monthId: string; label: string } | null>(null)
  const [editGastoCellValue, setEditGastoCellValue] = useState('')
  const [editingGastoLabel, setEditingGastoLabel] = useState<string | null>(null)
  const [editGastoLabelValue, setEditGastoLabelValue] = useState('')
  const [deudaRows, setDeudaRows] = useState<string[]>([])
  const [deudasByMonth, setDeudasByMonth] = useState<GastosByMonth>({})
  const [editingDeudaCell, setEditingDeudaCell] = useState<{ monthId: string; label: string } | null>(null)
  const [editDeudaCellValue, setEditDeudaCellValue] = useState('')
  const [editingDeudaLabel, setEditingDeudaLabel] = useState<string | null>(null)
  const [editDeudaLabelValue, setEditDeudaLabelValue] = useState('')

  const [distRows, setDistRows] = useState<DistRow[]>([])
  const [distLoading, setDistLoading] = useState(false)
  const distRowsRef = useRef(distRows)
  useEffect(() => { distRowsRef.current = distRows }, [distRows])

  // Load and seed dist rows for the selected month.
  // Fetches deuda labels in the same call to avoid race conditions.
  // Uses soft-delete (hidden=true) so deleted rows are never re-seeded.
  useEffect(() => {
    if (!selectedMonthId) return
    setDistLoading(true)
    async function load() {
      const [distResult, deudaResult] = await Promise.all([
        // Fetch ALL rows for this month (including hidden) to know what's been deleted
        supabase
          .from('payment_distribution')
          .select('*')
          .eq('budget_month_id', selectedMonthId)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from('budget_expenses') as any)
          .select('category')
          .eq('budget_month_id', selectedMonthId)
          .eq('account', 'deuda'),
      ])

      const allDbRows = (distResult.data ?? []) as (DistRow & { hidden: boolean })[]
      // Names of ALL rows (visible + hidden) — hidden ones block re-seeding
      const allDbNames = new Set(allDbRows.map(r => r.gasto_egreso))
      // Only show non-hidden rows
      const visibleRows = allDbRows.filter(r => !r.hidden)

      const deudaLabels: string[] = [
        ...new Set(
          ((deudaResult.data ?? []) as { category: string }[])
            .map(r => r.category)
            .filter(Boolean)
        ),
      ]

      const allLabels = [...PRESUPUESTO_DEFAULT_LABELS, ...deudaLabels]
      const toInsert = allLabels
        .filter(cat => !allDbNames.has(cat))
        .map((cat, i) => ({
          gasto_egreso: cat,
          sort_order: allDbRows.length + i,
          budget_month_id: selectedMonthId,
          julio: null, flor: null, casita: null, power: null,
          limpieza: null, regalos: null, flor_y_julio: null,
          navidad: null, gasolina: null, entretenimiento: null,
        }))

      const dedup = (rows: DistRow[]) => {
        const seen = new Set<string>()
        return rows.filter(r => {
          if (seen.has(r.gasto_egreso)) return false
          seen.add(r.gasto_egreso)
          return true
        })
      }

      if (toInsert.length > 0) {
        await supabase.from('payment_distribution').insert(toInsert)
        const { data: all } = await supabase
          .from('payment_distribution')
          .select('*')
          .eq('budget_month_id', selectedMonthId)
          .eq('hidden', false)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true })
        setDistRows(dedup((all ?? []) as DistRow[]))
      } else {
        setDistRows(dedup(visibleRows as DistRow[]))
      }
      setDistLoading(false)
    }
    load()
  }, [selectedMonthId]) // eslint-disable-line react-hooks/exhaustive-deps
  const [editingDistCell, setEditingDistCell] = useState<{ rowId: string; field: string } | null>(null)
  const [editDistCellValue, setEditDistCellValue] = useState('')
  const [applying, setApplying] = useState(false)
  const [applyResult, setApplyResult] = useState<'success' | 'error' | null>(null)
  const [copying, setCopying] = useState(false)
  const [copyResult, setCopyResult] = useState<'success' | 'error' | null>(null)

  async function commitDistCell(rowId: string, field: string, value: string) {
    setEditingDistCell(null)
    const isText = field === 'gasto_egreso'
    const parsed = isText ? value : (value === '' ? null : parseFloat(value))
    const currentRow = distRowsRef.current.find(r => r.id === rowId)
    if (!currentRow) return
    const updatedRow = { ...currentRow, [field]: parsed }
    setDistRows(prev => prev.map(r => r.id === rowId ? updatedRow : r))

    if (updatedRow._unsaved) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, _unsaved: _u, ...data } = updatedRow
      await supabase.from('payment_distribution').insert([data])
      const { data: all } = await supabase
        .from('payment_distribution').select('*')
        .eq('budget_month_id', selectedMonthId)
        .order('sort_order', { ascending: true }).order('created_at', { ascending: true })
      if (all) setDistRows(all as DistRow[])
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, _unsaved, ...data } = updatedRow
      await supabase.from('payment_distribution').update(data).eq('id', rowId)
    }
  }

  function addDistRow() {
    const tempId = `temp-${Date.now()}`
    setDistRows(prev => [...prev, makeEmptyDistRow('', prev.length, tempId, selectedMonthId)])
    setEditingDistCell({ rowId: tempId, field: 'gasto_egreso' })
    setEditDistCellValue('')
  }

  async function deleteDistRow(row: DistRow) {
    setDistRows(prev => prev.filter(r => r.id !== row.id))
    if (row._unsaved) return
    // Soft-delete: mark hidden so it's excluded from display but blocks re-seeding for this month
    await supabase.from('payment_distribution').update({ hidden: true }).eq('id', row.id)
  }

  useEffect(() => {
    if (!selectedMonthId) return
    setLoading(true)
    supabase.from('budget_expenses').select('*').eq('budget_month_id', selectedMonthId)
      .then(({ data }) => {
        setExpenses(data ?? [])
        setLoading(false)
      })
  }, [selectedMonthId])

  useEffect(() => {
    if (!selectedMonthId) return
    const monthIds = getDisplayMonths(months, selectedMonthId).filter((m): m is BudgetMonth => m != null).map(m => m.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase.from('budget_income') as any)
      .select('*')
      .in('budget_month_id', monthIds)
      .in('source', INCOME_SOURCES.map(s => s.key))
      .then(({ data }: { data: { id: string; budget_month_id: string; source: string; amount: number | null; description: string | null }[] | null }) => {
        const byMonth: IncomeByMonth = {}
        for (const entry of data ?? []) {
          if (!byMonth[entry.budget_month_id]) byMonth[entry.budget_month_id] = {}
          byMonth[entry.budget_month_id][entry.source] = { id: entry.id, amount: entry.amount ?? 0, description: entry.description ?? null }
        }
        setIncomeByMonth(byMonth)
      })
  }, [selectedMonthId])

  useEffect(() => {
    if (!selectedMonthId) return
    const monthIds = getDisplayMonths(months, selectedMonthId).filter((m): m is BudgetMonth => m != null).map(m => m.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase.from('budget_expenses') as any)
      .select('*')
      .in('budget_month_id', monthIds)
      .eq('account', 'presupuesto')
      .then(({ data }: { data: { id: string; budget_month_id: string; category: string; amount: number | null }[] | null }) => {
        const byMonth: GastosByMonth = {}
        const selectedLabels = new Set<string>()
        for (const entry of data ?? []) {
          if (!byMonth[entry.budget_month_id]) byMonth[entry.budget_month_id] = {}
          byMonth[entry.budget_month_id][entry.category] = { id: entry.id, amount: entry.amount ?? 0 }
          if (entry.budget_month_id === selectedMonthId) selectedLabels.add(entry.category)
        }
        const ordered = selectedLabels.size === 0
          ? [...PRESUPUESTO_DEFAULT_LABELS]
          : [
              ...PRESUPUESTO_DEFAULT_LABELS.filter(l => selectedLabels.has(l)),
              ...[...selectedLabels].filter(l => !PRESUPUESTO_DEFAULT_LABELS.includes(l)),
            ]
        setGastoRows(ordered)
        setGastosByMonth(byMonth)
      })
  }, [selectedMonthId])

  useEffect(() => {
    if (!selectedMonthId) return
    const monthIds = getDeudaMonths(months, selectedMonthId).map(m => m.id)
    if (monthIds.length === 0) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase.from('budget_expenses') as any)
      .select('*')
      .in('budget_month_id', monthIds)
      .eq('account', 'deuda')
      .then(({ data }: { data: { id: string; budget_month_id: string; category: string; amount: number | null }[] | null }) => {
        const byMonth: GastosByMonth = {}
        const allLabels = new Set<string>()
        const selectedLabels = new Set<string>()
        for (const entry of data ?? []) {
          if (!byMonth[entry.budget_month_id]) byMonth[entry.budget_month_id] = {}
          byMonth[entry.budget_month_id][entry.category] = { id: entry.id, amount: entry.amount ?? 0 }
          allLabels.add(entry.category)
          if (entry.budget_month_id === selectedMonthId) selectedLabels.add(entry.category)
        }
        const combinedLabels = selectedLabels.size === 0 ? allLabels : selectedLabels
        const ordered = combinedLabels.size === 0
          ? [...DEUDAS_DEFAULT_LABELS]
          : [
              ...DEUDAS_DEFAULT_LABELS.filter(l => combinedLabels.has(l)),
              ...[...combinedLabels].filter(l => !DEUDAS_DEFAULT_LABELS.includes(l)),
              ...[...allLabels].filter(l => !combinedLabels.has(l) && !DEUDAS_DEFAULT_LABELS.includes(l)),
            ]
        setDeudaRows(ordered)
        setDeudasByMonth(byMonth)
      })
  }, [selectedMonthId])

  async function saveIncomeCell(monthId: string, source: string) {
    const amount = parseFloat(editCellValue)
    const existing = incomeByMonth[monthId]?.[source]
    setEditingCell(null) // clear before await so clicking another cell doesn't get clobbered
    if (isNaN(amount)) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase.from('budget_income') as any
    if (existing) {
      await client.update({ amount }).eq('id', existing.id)
      setIncomeByMonth(prev => ({
        ...prev,
        [monthId]: { ...prev[monthId], [source]: { ...existing, amount } },
      }))
    } else {
      const { data } = await client.insert({ budget_month_id: monthId, source, amount }).select().single()
      if (data) {
        setIncomeByMonth(prev => ({
          ...prev,
          [monthId]: { ...prev[monthId], [source]: { id: data.id, amount: data.amount ?? 0, description: null } },
        }))
      }
    }
  }

  async function saveIncomeComment(monthId: string, source: string) {
    const description = editCommentValue.trim() || null
    const existing = incomeByMonth[monthId]?.[source]
    setEditingComment(null) // clear before await
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase.from('budget_income') as any
    if (existing) {
      await client.update({ description }).eq('id', existing.id)
      setIncomeByMonth(prev => ({
        ...prev,
        [monthId]: { ...prev[monthId], [source]: { ...existing, description } },
      }))
    } else {
      const { data } = await client.insert({ budget_month_id: monthId, source, amount: 0, description }).select().single()
      if (data) {
        setIncomeByMonth(prev => ({
          ...prev,
          [monthId]: { ...prev[monthId], [source]: { id: data.id, amount: data.amount ?? 0, description: data.description ?? null } },
        }))
      }
    }
  }

  async function saveGastoCell(monthId: string, label: string) {
    const amount = parseFloat(editGastoCellValue)
    const existing = gastosByMonth[monthId]?.[label]
    setEditingGastoCell(null) // clear before await
    if (isNaN(amount)) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase.from('budget_expenses') as any
    if (existing) {
      await client.update({ amount }).eq('id', existing.id)
      setGastosByMonth(prev => ({ ...prev, [monthId]: { ...prev[monthId], [label]: { ...existing, amount } } }))
    } else {
      const { data } = await client.insert({ budget_month_id: monthId, category: label, account: 'presupuesto', amount }).select().single()
      if (data) setGastosByMonth(prev => ({ ...prev, [monthId]: { ...prev[monthId], [label]: { id: data.id, amount: data.amount ?? 0 } } }))
    }
  }

  async function saveGastoLabel(oldLabel: string) {
    const newLabel = editGastoLabelValue.trim()
    setEditingGastoLabel(null)
    const isNew = oldLabel.startsWith('__new_')
    if (!newLabel) { if (isNew) setGastoRows(prev => prev.filter(l => l !== oldLabel)); return }
    if (newLabel === oldLabel) return
    if (!isNew) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase.from('budget_expenses') as any
      const entries = Object.values(gastosByMonth).map(m => m[oldLabel]).filter(Boolean)
      await Promise.all(entries.map(e => client.update({ category: newLabel }).eq('id', e!.id)))
    }
    setGastoRows(prev => prev.map(l => l === oldLabel ? newLabel : l))
    setGastosByMonth(prev => {
      const next: GastosByMonth = {}
      for (const [mId, mEntries] of Object.entries(prev)) {
        const copy = { ...mEntries }
        if (copy[oldLabel]) { copy[newLabel] = copy[oldLabel]; delete copy[oldLabel] }
        next[mId] = copy
      }
      return next
    })
  }

  function addGastoRow() {
    const placeholder = `__new_${Date.now()}`
    setGastoRows(prev => [...prev, placeholder])
    setEditingGastoLabel(placeholder)
    setEditGastoLabelValue('')
  }

  async function removeGastoRow(label: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase.from('budget_expenses') as any
    const entry = gastosByMonth[selectedMonthId]?.[label]
    if (entry) await client.delete().eq('id', entry.id)
    setGastoRows(prev => prev.filter(l => l !== label))
    setGastosByMonth(prev => {
      const next = { ...prev }
      if (next[selectedMonthId]) {
        const { [label]: _, ...rest } = next[selectedMonthId]
        next[selectedMonthId] = rest
      }
      return next
    })
  }

  async function saveDeudaCell(monthId: string, label: string) {
    const amount = parseFloat(editDeudaCellValue)
    const existing = deudasByMonth[monthId]?.[label]
    setEditingDeudaCell(null)
    if (isNaN(amount)) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase.from('budget_expenses') as any
    if (existing) {
      await client.update({ amount }).eq('id', existing.id)
      setDeudasByMonth(prev => ({ ...prev, [monthId]: { ...prev[monthId], [label]: { ...existing, amount } } }))
    } else {
      const { data } = await client.insert({ budget_month_id: monthId, category: label, account: 'deuda', amount }).select().single()
      if (data) setDeudasByMonth(prev => ({ ...prev, [monthId]: { ...prev[monthId], [label]: { id: data.id, amount: data.amount ?? 0 } } }))
    }
  }

  async function saveDeudaLabel(oldLabel: string) {
    const newLabel = editDeudaLabelValue.trim()
    setEditingDeudaLabel(null)
    const isNew = oldLabel.startsWith('__new_')
    if (!newLabel) { if (isNew) setDeudaRows(prev => prev.filter(l => l !== oldLabel)); return }
    if (newLabel === oldLabel) return
    if (!isNew) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase.from('budget_expenses') as any
      const entries = Object.values(deudasByMonth).map(m => m[oldLabel]).filter(Boolean)
      await Promise.all(entries.map(e => client.update({ category: newLabel }).eq('id', e!.id)))
    }
    setDeudaRows(prev => prev.map(l => l === oldLabel ? newLabel : l))
    setDeudasByMonth(prev => {
      const next: GastosByMonth = {}
      for (const [mId, mEntries] of Object.entries(prev)) {
        const copy = { ...mEntries }
        if (copy[oldLabel]) { copy[newLabel] = copy[oldLabel]; delete copy[oldLabel] }
        next[mId] = copy
      }
      return next
    })
  }

  function addDeudaRow() {
    const placeholder = `__new_${Date.now()}`
    setDeudaRows(prev => [...prev, placeholder])
    setEditingDeudaLabel(placeholder)
    setEditDeudaLabelValue('')
  }

  async function removeDeudaRow(label: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase.from('budget_expenses') as any
    const entry = deudasByMonth[selectedMonthId]?.[label]
    if (entry) await client.delete().eq('id', entry.id)
    setDeudaRows(prev => prev.filter(l => l !== label))
    setDeudasByMonth(prev => {
      const next = { ...prev }
      if (next[selectedMonthId]) {
        const { [label]: _, ...rest } = next[selectedMonthId]
        next[selectedMonthId] = rest
      }
      return next
    })
  }

  async function lockMonth(id: string) {
    setMonths(prev => prev.map(m => m.id === id ? { ...m, locked: true } : m))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('budget_months') as any).update({ locked: true }).eq('id', id)
  }

  async function unlockMonth(id: string) {
    setMonths(prev => prev.map(m => m.id === id ? { ...m, locked: false } : m))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('budget_months') as any).update({ locked: false }).eq('id', id)
  }

  async function applyReparticion() {
    if (!selectedMonthId) return
    setApplying(true)
    setApplyResult(null)

    const selectedMonth = months.find(m => m.id === selectedMonthId)
    if (!selectedMonth) { setApplying(false); return }

    const norm = (s: string) => s.trim().toLowerCase()

    // Sobrante
    const ingresoTotal = (['julio', 'flor'] as const).reduce(
      (sum, src) => sum + (incomeByMonth[selectedMonthId]?.[src]?.amount ?? 0), 0
    )
    const sobrante =
      ingresoTotal
      - gastoRows.reduce((sum, label) => sum + (gastosByMonth[selectedMonthId]?.[label]?.amount ?? 0), 0)
      - deudaRows.reduce((sum, label) => sum + (deudasByMonth[selectedMonthId]?.[label]?.amount ?? 0), 0)

    // Column totals (same logic as the TOTAL row in the table)
    const colTotals = {} as Record<DistColKey, number>
    for (const c of DIST_COLS) {
      const fromRows = distRows.reduce((sum, row) => {
        const autoVal = getAutoDistValue(row.gasto_egreso, c.key)
        return sum + (autoVal !== null ? autoVal : (row[c.key] ?? 0))
      }, 0)
      colTotals[c.key] = c.key === 'power' ? fromRows + sobrante : fromRows
    }

    // Power value for a specific gasto label
    const getPowerForLabel = (label: string): number => {
      const row = distRows.find(r => norm(r.gasto_egreso) === norm(label))
      if (!row) return 0
      const autoVal = getAutoDistValue(row.gasto_egreso, 'power')
      return autoVal !== null ? autoVal : (row['power'] ?? 0)
    }

    // Cuentas: distCol totals → account key
    const cuentasMap = [
      { accountKey: 'casita',          amount: colTotals.casita },
      { accountKey: 'limpieza_regalos', amount: colTotals.limpieza + colTotals.regalos },
      { accountKey: 'flor_julio',      amount: colTotals.flor_y_julio },
      { accountKey: 'navidad',         amount: colTotals.navidad },
      { accountKey: 'gaso',            amount: colTotals.gasolina },
      { accountKey: 'entretenimiento', amount: colTotals.entretenimiento },
    ]

    // Power: individual rows → power_account_entries columns
    const powerPayload = {
      salud:      getPowerForLabel('Salud'),
      carro:      getPowerForLabel('Seguro carro'),
      jf_baby:    getPowerForLabel('Baby'),
      ahorro_casa: getPowerForLabel('Ahorro Casa'),
      emergencia: getPowerForLabel('Emergencia'),
      ahorro_extra: sobrante > 0 ? sobrante : 0,
    }

    try {
      // 1. Upsert budget_expenses for each cuenta account
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const expClient = supabase.from('budget_expenses') as any
      for (const { accountKey, amount } of cuentasMap) {
        const existing = expenses.find(e => e.account === accountKey && e.category === accountKey)
        if (existing) {
          await expClient.update({ amount: (existing.amount ?? 0) + amount }).eq('id', existing.id)
        } else {
          await expClient.insert({ budget_month_id: selectedMonthId, category: accountKey, account: accountKey, amount })
        }
      }
      // Reload expenses so the cuentas section updates
      const { data: refreshed } = await (supabase.from('budget_expenses') as any)
        .select('*').eq('budget_month_id', selectedMonthId)
      if (refreshed) setExpenses(refreshed)

      // 2. Upsert power_account_entries for this month
      const monthName = MONTH_NAMES[selectedMonth.month]
      const powerDesc = `Repartición ${monthName} ${selectedMonth.year}`
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pwClient = supabase.from('power_account_entries') as any
      const { data: existingPower } = await pwClient
        .select('id')
        .eq('entry_year', selectedMonth.year)
        .eq('entry_month', monthName)
        .ilike('description', '%Repartición%')
        .maybeSingle()
      if (existingPower) {
        await pwClient.update(powerPayload).eq('id', existingPower.id)
      } else {
        await pwClient.insert({ ...powerPayload, entry_year: selectedMonth.year, entry_month: monthName, description: powerDesc })
      }

      setApplyResult('success')
    } catch {
      setApplyResult('error')
    }
    setApplying(false)
  }

  async function copyFromPreviousMonth() {
    const displayMonths = getDisplayMonths(months, selectedMonthId)
    const prevMonth = displayMonths[1]
    if (!prevMonth || isSelectedMonthLocked) return

    setCopying(true)
    setCopyResult(null)

    try {
      const prevId = prevMonth.id
      const currId = selectedMonthId

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const expClient = supabase.from('budget_expenses') as any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const incClient = supabase.from('budget_income') as any

      // 1. Scotiabank — fetch prev month's account entries (excluding power)
      const { data: prevExpenses } = await expClient.select('*').eq('budget_month_id', prevId)
      for (const acc of ACCOUNTS) {
        if (acc.key === 'power') continue
        const prevDirect = (prevExpenses ?? []).find((e: BudgetExpense) => e.account === acc.key && e.category === acc.key)
        const amount = prevDirect
          ? (prevDirect.amount ?? 0)
          : (prevExpenses ?? []).filter((e: BudgetExpense) => e.account === acc.key && e.category !== acc.key)
              .reduce((s: number, e: BudgetExpense) => s + (e.amount ?? 0), 0)
        const existing = expenses.find(e => e.account === acc.key && e.category === acc.key)
        if (existing) {
          await expClient.update({ amount }).eq('id', existing.id)
        } else {
          await expClient.insert({ budget_month_id: currId, category: acc.key, account: acc.key, amount })
        }
      }
      const { data: refreshed } = await expClient.select('*').eq('budget_month_id', currId)
      if (refreshed) setExpenses(refreshed)

      // 2. Ingresos — copy prevId → currId
      for (const { key } of INCOME_SOURCES) {
        const prevEntry = incomeByMonth[prevId]?.[key]
        if (!prevEntry) continue
        const { amount } = prevEntry
        const existing = incomeByMonth[currId]?.[key]
        if (existing) {
          await incClient.update({ amount }).eq('id', existing.id)
          setIncomeByMonth(prev => ({ ...prev, [currId]: { ...prev[currId], [key]: { ...existing, amount } } }))
        } else {
          const { data } = await incClient.insert({ budget_month_id: currId, source: key, amount }).select().single()
          if (data) setIncomeByMonth(prev => ({ ...prev, [currId]: { ...prev[currId], [key]: { id: data.id, amount: data.amount ?? 0, description: null } } }))
        }
      }

      // 3. Gastos presupuestados — copy prevId → currId
      for (const label of gastoRows) {
        const prevEntry = gastosByMonth[prevId]?.[label]
        if (!prevEntry) continue
        const { amount } = prevEntry
        const existing = gastosByMonth[currId]?.[label]
        if (existing) {
          await expClient.update({ amount }).eq('id', existing.id)
          setGastosByMonth(prev => ({ ...prev, [currId]: { ...prev[currId], [label]: { ...existing, amount } } }))
        } else {
          const { data } = await expClient.insert({ budget_month_id: currId, category: label, account: 'presupuesto', amount }).select().single()
          if (data) setGastosByMonth(prev => ({ ...prev, [currId]: { ...prev[currId], [label]: { id: data.id, amount: data.amount ?? 0 } } }))
        }
      }

      // 4. Deudas — copy prevId → currId
      for (const label of deudaRows) {
        const prevEntry = deudasByMonth[prevId]?.[label]
        if (!prevEntry) continue
        const { amount } = prevEntry
        const existing = deudasByMonth[currId]?.[label]
        if (existing) {
          await expClient.update({ amount }).eq('id', existing.id)
          setDeudasByMonth(prev => ({ ...prev, [currId]: { ...prev[currId], [label]: { ...existing, amount } } }))
        } else {
          const { data } = await expClient.insert({ budget_month_id: currId, category: label, account: 'deuda', amount }).select().single()
          if (data) setDeudasByMonth(prev => ({ ...prev, [currId]: { ...prev[currId], [label]: { id: data.id, amount: data.amount ?? 0 } } }))
        }
      }

      setCopyResult('success')
    } catch {
      setCopyResult('error')
    }
    setCopying(false)
  }

  async function saveAccountAmount(accKey: string) {
    const amount = parseFloat(editAccountValue)
    if (isNaN(amount)) { setEditingAccountKey(null); return }
    const direct = expenses.find(e => e.account === accKey && e.category === accKey)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase.from('budget_expenses') as any
    if (direct) {
      await client.update({ amount }).eq('id', direct.id)
      setExpenses(prev => prev.map(e => e.id === direct.id ? { ...e, amount } : e))
    } else {
      const { data } = await client.insert({ budget_month_id: selectedMonthId, category: accKey, account: accKey, amount }).select().single()
      if (data) setExpenses(prev => [...prev, data])
    }
    setEditingAccountKey(null)
  }

  const monthLabels = getMonthLabels(months, selectedMonthId)
  const isSelectedMonthLocked = months.find(m => m.id === selectedMonthId)?.locked ?? false

  function getAutoDistValue(gastoLabel: string, colKey: DistColKey): number | null {
    const norm = (s: string) => s.trim().toLowerCase()
    const normalizedLabel = norm(gastoLabel)

    // Check explicit mapping first (Gastos presupuestados)
    const mappingEntry = Object.entries(GASTO_TO_DIST).find(([k]) => norm(k) === normalizedLabel)
    if (mappingEntry) {
      const mapping = mappingEntry[1]
      if (!(colKey in mapping)) return null
      const gastoEntry = Object.entries(gastosByMonth[selectedMonthId] ?? {})
        .find(([k]) => norm(k) === normalizedLabel)?.[1]
      const deudaEntry = Object.entries(deudasByMonth[selectedMonthId] ?? {})
        .find(([k]) => norm(k) === normalizedLabel)?.[1]
      const amount = gastoEntry?.amount ?? deudaEntry?.amount ?? 0
      return mapping[colKey] === 'half' ? amount / 2 : amount
    }

    // Deuda sin mapping explícito → columna power
    const deudaEntry = Object.entries(deudasByMonth[selectedMonthId] ?? {})
      .find(([k]) => norm(k) === normalizedLabel)?.[1]
    if (deudaEntry !== undefined) {
      return colKey === 'power' ? (deudaEntry.amount ?? 0) : null
    }

    return null
  }

  // Group expenses by account — direct row (category === account key) takes precedence over sum
  const byAccount: Record<string, number> = {}
  for (const acc of ACCOUNTS) {
    const direct = expenses.find(e => e.account === acc.key && e.category === acc.key)
    byAccount[acc.key] = direct
      ? (direct.amount ?? 0)
      : expenses.filter(e => e.account === acc.key && e.category !== acc.key).reduce((s, e) => s + (e.amount ?? 0), 0)
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Cuentas del Presupuesto</h1>
        <select
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm"
          value={selectedMonthId}
          onChange={async e => {
            const val = e.target.value
            if (val !== '__next__') { setSelectedMonthId(val); return }
            const now = new Date()
            const nextMonth = now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2
            const nextYear  = now.getMonth() + 2 > 12 ? now.getFullYear() + 1 : now.getFullYear()
            const tabName = `${MONTH_NAMES[nextMonth]} ${nextYear}`
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data } = await (supabase.from('budget_months') as any)
              .insert({ year: nextYear, month: nextMonth, tab_name: tabName })
              .select().single()
            if (data) {
              setMonths(prev => [...prev, data].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month))
              setSelectedMonthId(data.id)
            }
          }}
        >
          {months.map(m => <option key={m.id} value={m.id}>{MONTH_NAMES[m.month]} {m.year}</option>)}
          {(() => {
            const now = new Date()
            const nextMonth = now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2
            const nextYear  = now.getMonth() + 2 > 12 ? now.getFullYear() + 1 : now.getFullYear()
            if (months.some(m => m.year === nextYear && m.month === nextMonth)) return null
            return <option key="__next__" value="__next__">{MONTH_NAMES[nextMonth]} {nextYear} (+)</option>
          })()}
        </select>
      </div>

      {loading ? <p className="text-gray-400 dark:text-gray-500 text-sm">Cargando...</p> : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Resumen por cuenta Scotiabank</h2>
            <div className="flex items-center gap-2">
              {copyResult === 'success' && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">✓ Copiado</span>
              )}
              {copyResult === 'error' && (
                <span className="text-xs text-red-500 dark:text-red-400 font-medium">Error al copiar</span>
              )}
              {!isSelectedMonthLocked && (
                <button
                  onClick={copyFromPreviousMonth}
                  disabled={copying || !getDisplayMonths(months, selectedMonthId)[1]}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-100 hover:bg-sky-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-sky-700 dark:bg-sky-900/40 dark:hover:bg-sky-900/60 dark:disabled:bg-gray-800 dark:text-sky-300 transition-colors"
                >
                  {copying ? (
                    <>
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Copiando...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                      Copiar mes anterior
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-700">
            {ACCOUNTS.map(acc => {
              const amt = byAccount[acc.key] ?? 0
              const isEditing = editingAccountKey === acc.key
              return (
                <div key={acc.key} className="p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{acc.label}</p>
                  {acc.key === 'power' ? (
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1">
                      S/ {powerTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                  ) : isEditing ? (
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-sm text-gray-400 dark:text-gray-500">S/</span>
                      <input
                        autoFocus
                        type="number"
                        step="0.01"
                        className="w-full border border-indigo-400 dark:border-indigo-500 rounded px-2 py-1 text-sm font-bold text-gray-800"
                        value={editAccountValue}
                        onChange={e => setEditAccountValue(e.target.value)}
                        onBlur={() => saveAccountAmount(acc.key)}
                        onKeyDown={e => { if (e.key === 'Enter') saveAccountAmount(acc.key); if (e.key === 'Escape') setEditingAccountKey(null) }}
                      />
                    </div>
                  ) : (
                    <p
                      className={isSelectedMonthLocked ? 'text-lg font-bold text-gray-400 dark:text-gray-500 mt-1' : 'text-lg font-bold text-gray-800 dark:text-gray-200 mt-1 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors'}
                      onClick={() => { if (isSelectedMonthLocked) return; setEditingAccountKey(acc.key); setEditAccountValue(amt.toString()) }}
                    >
                      S/ {amt.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{acc.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Saldo después de Deudas */}
      {(() => {
        const displayMonths = getDisplayMonths(months, selectedMonthId)
        if (displayMonths.every(m => m == null)) return null
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Saldo después de Deudas</h2>
            </div>
            <table className="w-full text-sm table-fixed">
              <colgroup><col /><col className="w-36" /><col className="w-36" /><col className="w-36" /><col className="w-8" /></colgroup>
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th />
                  {monthLabels.map((label, i) => (
                    <th key={i} className="text-right px-4 py-2 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wide">
                      {label}
                    </th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td />
                  {displayMonths.map((m, i) => {
                    if (!m) return <td key={i} className="px-4 py-3 text-right text-gray-400">—</td>
                    const ingresos = (['julio', 'flor'] as const).reduce(
                      (sum, src) => sum + (incomeByMonth[m.id]?.[src]?.amount ?? 0), 0
                    )
                    const gastos = gastoRows.reduce(
                      (sum, label) => sum + (gastosByMonth[m.id]?.[label]?.amount ?? 0), 0
                    )
                    const deudas = deudaRows.reduce(
                      (sum, label) => sum + (deudasByMonth[m.id]?.[label]?.amount ?? 0), 0
                    )
                    const saldo = ingresos - gastos - deudas
                    return (
                      <td key={i} className={`px-4 py-3 text-right font-semibold ${saldo >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                        {saldo.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </td>
                    )
                  })}
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        )
      })()}

      {/* Ingresos & Gastos tables — shared displayMonths */}
      {/* Ingresos table — 3-month view */}
      {(() => {
        const displayMonths = getDisplayMonths(months, selectedMonthId)
        if (displayMonths.every(m => m == null)) return null
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Ingresos</h2>
            </div>
            <div className="overflow-visible">
              <table className="w-full text-sm table-fixed">
                <colgroup><col /><col className="w-36" /><col className="w-36" /><col className="w-36" /><col className="w-8" /></colgroup>
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left px-4 py-2 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wide">CASH</th>
                    {monthLabels.map((label, i) => (
                      <th key={i} className="text-right px-4 py-2 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wide">
                        {label}
                      </th>
                    ))}
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {INCOME_SOURCES.map(({ key, label }) => (
                    <tr key={key} className="group/row hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-gray-700 dark:text-gray-300">{label}</td>
                      {displayMonths.map((m, i) => {
                        if (!m) return <td key={i} className="px-4 py-2.5 text-right text-gray-400 w-36">—</td>
                        const entry = incomeByMonth[m.id]?.[key]
                        const isEditing = editingCell?.monthId === m.id && editingCell?.source === key
                        const isEditingCmt = editingComment?.monthId === m.id && editingComment?.source === key
                        const hasComment = key === 'otros_ingresos' && !!entry?.description
                        return (
                          <td key={i} className="px-4 py-2.5 text-right">
                            <div className="group/tip flex items-center justify-end gap-1.5 relative w-full">
                              {/* Comment icon / edit button / input — all left of amount */}
                              {key === 'otros_ingresos' && (
                                isEditingCmt ? (
                                  <input
                                    autoFocus
                                    type="text"
                                    className="w-40 border border-amber-400 dark:border-amber-500 rounded px-2 py-0.5 text-xs text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                                    value={editCommentValue}
                                    placeholder="Agregar comentario..."
                                    onChange={e => setEditCommentValue(e.target.value)}
                                    onBlur={() => saveIncomeComment(m.id, key)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') saveIncomeComment(m.id, key)
                                      if (e.key === 'Escape') setEditingComment(null)
                                    }}
                                  />
                                ) : hasComment ? (
                                  <span className="relative flex-shrink-0 cursor-help text-amber-400 hover:text-amber-500" onClick={() => { if (m.locked) return; setEditingComment({ monthId: m.id, source: key }); setEditCommentValue(entry?.description ?? '') }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                    </svg>
                                    <span className="pointer-events-none invisible group-hover/tip:visible opacity-0 group-hover/tip:opacity-100 transition-opacity absolute bottom-full left-0 mb-1.5 z-20 w-52 rounded-lg bg-gray-900 dark:bg-gray-700 px-3 py-2 text-xs text-white text-left leading-snug shadow-lg">
                                      {entry!.description}
                                      <span className="absolute top-full left-2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                                    </span>
                                  </span>
                                ) : (
                                  <button
                                    className="opacity-0 group-hover/row:opacity-100 transition-opacity flex-shrink-0 text-gray-400 hover:text-amber-500 dark:hover:text-amber-400"
                                    title="Agregar comentario"
                                    onClick={() => { if (m.locked) return; setEditingComment({ monthId: m.id, source: key }); setEditCommentValue('') }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                )
                              )}
                              {/* Amount */}
                              {isEditing ? (
                                <input
                                  autoFocus
                                  type="number"
                                  step="0.01"
                                  className="w-full min-w-0 border border-indigo-400 dark:border-indigo-500 rounded px-2 py-0.5 text-sm text-right font-medium text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                                  value={editCellValue}
                                  onChange={e => setEditCellValue(e.target.value)}
                                  onBlur={() => saveIncomeCell(m.id, key)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') saveIncomeCell(m.id, key)
                                    if (e.key === 'Escape') setEditingCell(null)
                                  }}
                                />
                              ) : (
                                <span
                                  className={m.locked ? 'font-medium text-gray-400 dark:text-gray-500' : 'cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium text-gray-800 dark:text-gray-200'}
                                  onClick={() => {
                                    if (m.locked) return
                                    setEditingCell({ monthId: m.id, source: key })
                                    setEditCellValue((entry?.amount ?? 0).toString())
                                  }}
                                >
                                  {(entry?.amount ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                </span>
                              )}
                            </div>
                          </td>
                        )
                      })}
                      <td />
                    </tr>
                  ))}
                  {/* TOTAL INGRESOS row — sum of julio + flor only */}
                  <tr className="bg-gray-50 dark:bg-gray-700/40 font-semibold">
                    <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wide">TOTAL INGRESOS</td>
                    {displayMonths.map((m, i) => {
                      if (!m) return <td key={i} className="px-4 py-2.5 text-right text-gray-400">—</td>
                      const total = (['julio', 'flor'] as const).reduce(
                        (sum, src) => sum + (incomeByMonth[m.id]?.[src]?.amount ?? 0), 0
                      )
                      return (
                        <td key={i} className="px-4 py-2.5 text-right text-gray-800 dark:text-gray-200">
                          {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                      )
                    })}
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      })()}

      {/* Gastos presupuestados table — 3-month view */}
      {(() => {
        const displayMonths = getDisplayMonths(months, selectedMonthId)
        if (displayMonths.every(m => m == null)) return null
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Gastos presupuestados</h2>
            </div>
            <div className="overflow-visible">
              <table className="w-full text-sm table-fixed">
                <colgroup><col /><col className="w-36" /><col className="w-36" /><col className="w-36" /><col className="w-8" /></colgroup>
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left px-4 py-2 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wide">GASTO</th>
                    {monthLabels.map((label, i) => (
                      <th key={i} className="text-right px-4 py-2 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wide">
                        {label}
                      </th>
                    ))}
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {gastoRows.map(label => {
                    const isEditingLbl = editingGastoLabel === label
                    const displayLabel = label.startsWith('__new_') ? '' : label
                    return (
                      <tr key={label} className="group/gasto hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        {/* Label cell */}
                        <td className="px-4 py-2">
                          {isEditingLbl ? (
                            <input
                              autoFocus
                              type="text"
                              className="w-full border border-indigo-400 dark:border-indigo-500 rounded px-2 py-0.5 text-sm text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                              value={editGastoLabelValue}
                              placeholder="Nombre del gasto..."
                              onChange={e => setEditGastoLabelValue(e.target.value)}
                              onBlur={() => saveGastoLabel(label)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') saveGastoLabel(label)
                                if (e.key === 'Escape') {
                                  if (label.startsWith('__new_')) setGastoRows(prev => prev.filter(l => l !== label))
                                  setEditingGastoLabel(null)
                                }
                              }}
                            />
                          ) : (
                            <span
                              className="cursor-pointer text-gray-700 dark:text-gray-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                              onClick={() => { setEditingGastoLabel(label); setEditGastoLabelValue(displayLabel) }}
                            >
                              {displayLabel || <em className="text-gray-400 not-italic">Sin nombre</em>}
                            </span>
                          )}
                        </td>
                        {/* Amount cells */}
                        {displayMonths.map((m, i) => {
                          if (!m) return <td key={i} className="px-4 py-2 text-right text-gray-400">—</td>
                          const entry = gastosByMonth[m.id]?.[label]
                          const isEditingCell = editingGastoCell?.monthId === m.id && editingGastoCell?.label === label
                          return (
                            <td key={i} className="px-4 py-2 text-right">
                              {isEditingCell ? (
                                <input
                                  autoFocus
                                  type="number"
                                  step="0.01"
                                  className="w-full min-w-0 border border-indigo-400 dark:border-indigo-500 rounded px-2 py-0.5 text-sm text-right font-medium text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                                  value={editGastoCellValue}
                                  onChange={e => setEditGastoCellValue(e.target.value)}
                                  onBlur={() => saveGastoCell(m.id, label)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') saveGastoCell(m.id, label)
                                    if (e.key === 'Escape') setEditingGastoCell(null)
                                  }}
                                />
                              ) : (
                                <span
                                  className={m.locked ? 'font-medium text-gray-400 dark:text-gray-500' : 'cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium text-gray-800 dark:text-gray-200'}
                                  onClick={() => {
                                    if (m.locked) return
                                    if (label.startsWith('__new_') && !editGastoLabelValue) return
                                    setEditingGastoCell({ monthId: m.id, label })
                                    setEditGastoCellValue((entry?.amount ?? 0).toString())
                                  }}
                                >
                                  {(entry?.amount ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                </span>
                              )}
                            </td>
                          )
                        })}
                        {/* Delete button */}
                        <td className="px-2 py-2">
                          <button
                            className="opacity-0 group-hover/gasto:opacity-100 transition-opacity text-gray-300 hover:text-red-400 dark:text-gray-600 dark:hover:text-red-400"
                            title="Eliminar fila"
                            onClick={() => removeGastoRow(label)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {/* TOTAL GASTOS row */}
                  <tr className="bg-gray-50 dark:bg-gray-700/40 font-semibold">
                    <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wide">TOTAL GASTOS</td>
                    {displayMonths.map((m, i) => {
                      if (!m) return <td key={i} className="px-4 py-2.5 text-right text-gray-400">—</td>
                      const total = gastoRows.reduce((sum, label) => sum + (gastosByMonth[m.id]?.[label]?.amount ?? 0), 0)
                      return (
                        <td key={i} className="px-4 py-2.5 text-right text-gray-800 dark:text-gray-200">
                          {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                      )
                    })}
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Add row button */}
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700">
              <button
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                onClick={addGastoRow}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Agregar fila
              </button>
            </div>
          </div>
        )
      })()}

      {/* Ingresos - Gastos */}
      {(() => {
        const displayMonths = getDisplayMonths(months, selectedMonthId)
        if (displayMonths.every(m => m == null)) return null
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Ingresos - Gastos</h2>
            </div>
            <table className="w-full text-sm table-fixed">
              <colgroup><col /><col className="w-36" /><col className="w-36" /><col className="w-36" /><col className="w-8" /></colgroup>
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th />
                  {monthLabels.map((label, i) => (
                    <th key={i} className="text-right px-4 py-2 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wide">
                      {label}
                    </th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td />
                  {displayMonths.map((m, i) => {
                    if (!m) return <td key={i} className="px-4 py-3 text-right text-gray-400">—</td>
                    const ingresos = (['julio', 'flor'] as const).reduce(
                      (sum, src) => sum + (incomeByMonth[m.id]?.[src]?.amount ?? 0), 0
                    )
                    const gastos = gastoRows.reduce(
                      (sum, label) => sum + (gastosByMonth[m.id]?.[label]?.amount ?? 0), 0
                    )
                    const balance = ingresos - gastos
                    return (
                      <td key={i} className={`px-4 py-3 text-right font-semibold ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                        {balance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </td>
                    )
                  })}
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        )
      })()}

      {/* Deudas table — 3-month view */}
      {(() => {
        const displayMonths = getDisplayMonths(months, selectedMonthId)
        if (displayMonths.every(m => m == null)) return null
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Deudas</h2>
            </div>
            <div className="overflow-visible">
              <table className="w-full text-sm table-fixed">
                <colgroup><col /><col className="w-36" /><col className="w-36" /><col className="w-36" /><col className="w-8" /></colgroup>
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left px-4 py-2 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wide">DEUDA</th>
                    {monthLabels.map((label, i) => (
                      <th key={i} className="text-right px-4 py-2 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wide">
                        {label}
                      </th>
                    ))}
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {deudaRows.map(label => {
                    const isEditingLbl = editingDeudaLabel === label
                    const displayLabel = label.startsWith('__new_') ? '' : label
                    return (
                      <tr key={label} className="group/deuda hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-2">
                          {isEditingLbl ? (
                            <input
                              autoFocus
                              type="text"
                              className="w-full border border-indigo-400 dark:border-indigo-500 rounded px-2 py-0.5 text-sm text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                              value={editDeudaLabelValue}
                              placeholder="Nombre de deuda..."
                              onChange={e => setEditDeudaLabelValue(e.target.value)}
                              onBlur={() => saveDeudaLabel(label)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') saveDeudaLabel(label)
                                if (e.key === 'Escape') {
                                  if (label.startsWith('__new_')) setDeudaRows(prev => prev.filter(l => l !== label))
                                  setEditingDeudaLabel(null)
                                }
                              }}
                            />
                          ) : (
                            <span
                              className="cursor-pointer text-gray-700 dark:text-gray-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                              onClick={() => { setEditingDeudaLabel(label); setEditDeudaLabelValue(displayLabel) }}
                            >
                              {displayLabel || <em className="text-gray-400 not-italic">Sin nombre</em>}
                            </span>
                          )}
                        </td>
                        {displayMonths.map((m, i) => {
                          if (!m) return <td key={i} className="px-4 py-2 text-right text-gray-400">—</td>
                          const entry = deudasByMonth[m.id]?.[label]
                          const isEditingCell = editingDeudaCell?.monthId === m.id && editingDeudaCell?.label === label
                          return (
                            <td key={i} className="px-4 py-2 text-right">
                              {isEditingCell ? (
                                <input
                                  autoFocus
                                  type="number"
                                  step="0.01"
                                  className="w-full min-w-0 border border-indigo-400 dark:border-indigo-500 rounded px-2 py-0.5 text-sm text-right font-medium text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                                  value={editDeudaCellValue}
                                  onChange={e => setEditDeudaCellValue(e.target.value)}
                                  onBlur={() => saveDeudaCell(m.id, label)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') saveDeudaCell(m.id, label)
                                    if (e.key === 'Escape') setEditingDeudaCell(null)
                                  }}
                                />
                              ) : (
                                <span
                                  className={m.locked ? 'font-medium text-gray-400 dark:text-gray-500' : 'cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium text-gray-800 dark:text-gray-200'}
                                  onClick={() => {
                                    if (m.locked) return
                                    if (label.startsWith('__new_')) return
                                    setEditingDeudaCell({ monthId: m.id, label })
                                    setEditDeudaCellValue((entry?.amount ?? 0).toString())
                                  }}
                                >
                                  {(entry?.amount ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                </span>
                              )}
                            </td>
                          )
                        })}
                        <td className="px-2 py-2">
                          <button
                            className="opacity-0 group-hover/deuda:opacity-100 transition-opacity text-gray-300 hover:text-red-400 dark:text-gray-600 dark:hover:text-red-400"
                            title="Eliminar fila"
                            onClick={() => removeDeudaRow(label)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="bg-gray-50 dark:bg-gray-700/40 font-semibold">
                    <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wide">TOTAL DEUDAS</td>
                    {displayMonths.map((m, i) => {
                      if (!m) return <td key={i} className="px-4 py-2.5 text-right text-gray-400">—</td>
                      const total = deudaRows.reduce((sum, label) => sum + (deudasByMonth[m.id]?.[label]?.amount ?? 0), 0)
                      return (
                        <td key={i} className="px-4 py-2.5 text-right text-gray-800 dark:text-gray-200">
                          {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                      )
                    })}
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700">
              <button
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                onClick={addDeudaRow}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Agregar fila
              </button>
            </div>
          </div>
        )
      })()}

      {/* Repartición de pagos/gastos */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Repartición de pagos/gastos</h2>
          {distLoading && <span className="text-xs text-gray-400 dark:text-gray-500">Cargando...</span>}
        </div>
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="text-xs table-fixed w-full" style={{minWidth: `${192 + DIST_COLS.length * 112 + 32}px`}}>
            <colgroup>
              <col className="w-48" />
              {DIST_COLS.map(c => <col key={c.key} className="w-28" />)}
              <col className="w-8" />
            </colgroup>
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-3 py-2 font-medium text-gray-500 dark:text-gray-400 sticky left-0 z-20 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">GASTO/EGRESO</th>
                {DIST_COLS.map(c => (
                  <th key={c.key} className="text-right px-3 py-2 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{c.label}</th>
                ))}
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {distRows.map(row => (
                <tr key={row.id} className="group/dist border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                  <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 group-hover/dist:bg-gray-50 dark:group-hover/dist:bg-gray-700/30 border-r border-gray-100 dark:border-gray-700 px-4 py-2 min-w-[192px]">
                    {editingDistCell?.rowId === row.id && editingDistCell.field === 'gasto_egreso' ? (
                      <input
                        autoFocus
                        type="text"
                        className="w-full min-w-0 border border-indigo-400 dark:border-indigo-500 rounded px-2 py-0.5 text-sm text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                        value={editDistCellValue}
                        onChange={e => setEditDistCellValue(e.target.value)}
                        onBlur={() => commitDistCell(row.id, 'gasto_egreso', editDistCellValue)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') commitDistCell(row.id, 'gasto_egreso', editDistCellValue)
                          if (e.key === 'Escape') setEditingDistCell(null)
                        }}
                      />
                    ) : (
                      <span
                        className={isSelectedMonthLocked ? 'font-medium text-gray-400 dark:text-gray-500' : 'cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium text-gray-800 dark:text-gray-200'}
                        onClick={() => { if (isSelectedMonthLocked) return; setEditingDistCell({ rowId: row.id, field: 'gasto_egreso' }); setEditDistCellValue(row.gasto_egreso) }}
                      >
                        {row.gasto_egreso || <em className="text-gray-400 not-italic font-normal">Sin nombre</em>}
                      </span>
                    )}
                  </td>
                  {DIST_COLS.map(c => {
                    const autoVal = getAutoDistValue(row.gasto_egreso, c.key)
                    const isAuto = autoVal !== null
                    const effectiveVal = isAuto ? autoVal : (row[c.key] ?? 0)
                    return (
                      <td key={c.key} className="px-4 py-2 text-right">
                        {isAuto ? (
                          <span className={`font-medium ${effectiveVal > 0 ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-300 dark:text-gray-700'}`}>
                            {effectiveVal > 0 ? effectiveVal.toLocaleString('es-PE', { minimumFractionDigits: 2 }) : '—'}
                          </span>
                        ) : editingDistCell?.rowId === row.id && editingDistCell.field === c.key ? (
                          <input
                            autoFocus
                            type="number"
                            step="0.01"
                            className="w-full min-w-0 border border-indigo-400 dark:border-indigo-500 rounded px-2 py-0.5 text-sm text-right font-medium text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                            value={editDistCellValue}
                            onChange={e => setEditDistCellValue(e.target.value)}
                            onBlur={() => commitDistCell(row.id, c.key, editDistCellValue)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') commitDistCell(row.id, c.key, editDistCellValue)
                              if (e.key === 'Escape') setEditingDistCell(null)
                            }}
                          />
                        ) : (
                          <span
                            className={isSelectedMonthLocked ? 'font-medium text-gray-400 dark:text-gray-500' : `cursor-pointer transition-colors font-medium ${effectiveVal > 0 ? 'text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400' : 'text-gray-300 dark:text-gray-700 hover:text-indigo-400'}`}
                            onClick={() => { if (isSelectedMonthLocked) return; setEditingDistCell({ rowId: row.id, field: c.key }); setEditDistCellValue(effectiveVal === 0 ? '' : effectiveVal.toString()) }}
                          >
                            {effectiveVal > 0 ? effectiveVal.toLocaleString('es-PE', { minimumFractionDigits: 2 }) : '—'}
                          </span>
                        )}
                      </td>
                    )
                  })}
                  <td className="px-2 py-2">
                    <button
                      onClick={() => { if (isSelectedMonthLocked) return; deleteDistRow(row) }}
                      className={isSelectedMonthLocked ? 'hidden' : 'opacity-0 group-hover/dist:opacity-100 transition-opacity text-gray-300 hover:text-red-400 dark:text-gray-600 dark:hover:text-red-400'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {/* Sobrante row — saldo del mes (ingresos - gastos - deudas) → columna power */}
              {(() => {
                const sobrante =
                  (['julio', 'flor'] as const).reduce((sum, src) => sum + (incomeByMonth[selectedMonthId]?.[src]?.amount ?? 0), 0)
                  - gastoRows.reduce((sum, label) => sum + (gastosByMonth[selectedMonthId]?.[label]?.amount ?? 0), 0)
                  - deudaRows.reduce((sum, label) => sum + (deudasByMonth[selectedMonthId]?.[label]?.amount ?? 0), 0)
                return (
                  <tr className="border-t border-gray-100 dark:border-gray-700 bg-amber-50/50 dark:bg-amber-900/10">
                    <td className="sticky left-0 z-10 bg-amber-50/50 dark:bg-amber-900/10 border-r border-gray-100 dark:border-gray-700 px-4 py-2 font-medium text-amber-700 dark:text-amber-400 text-xs">Sobrante</td>
                    {DIST_COLS.map(c => (
                      <td key={c.key} className="px-4 py-2 text-right">
                        {c.key === 'power' ? (
                          <span className={`font-medium text-xs ${sobrante >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500 dark:text-red-400'}`}>
                            {sobrante.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-700 text-xs">—</span>
                        )}
                      </td>
                    ))}
                    <td />
                  </tr>
                )
              })()}
              {/* Totals row */}
              {(() => {
                const ingresoTotal = (['julio', 'flor'] as const).reduce(
                  (sum, src) => sum + (incomeByMonth[selectedMonthId]?.[src]?.amount ?? 0), 0
                )
                const sobrante =
                  ingresoTotal
                  - gastoRows.reduce((sum, label) => sum + (gastosByMonth[selectedMonthId]?.[label]?.amount ?? 0), 0)
                  - deudaRows.reduce((sum, label) => sum + (deudasByMonth[selectedMonthId]?.[label]?.amount ?? 0), 0)
                const colTotals = DIST_COLS.map(c => {
                  const fromRows = distRows.reduce((sum, row) => {
                    const autoVal = getAutoDistValue(row.gasto_egreso, c.key)
                    const val = row[c.key] !== null ? (row[c.key] ?? 0) : (autoVal ?? 0)
                    return sum + val
                  }, 0)
                  return c.key === 'power' ? fromRows + sobrante : fromRows
                })
                const grandTotal = colTotals.reduce((s, v) => s + v, 0)
                const matches = Math.abs(grandTotal - ingresoTotal) < 0.01
                return (
                  <>
                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-t-2 border-gray-200 dark:border-gray-600">
                      <td className="sticky left-0 z-20 bg-gray-50 dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-700 px-4 py-2 font-semibold text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wide">TOTAL</td>
                      {colTotals.map((total, i) => (
                        <td key={DIST_COLS[i].key} className="px-4 py-2 text-right font-semibold text-gray-800 dark:text-gray-200 text-xs">
                          {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                      ))}
                      <td />
                    </tr>
                    <tr className={`sticky bottom-0 z-10 border-t border-gray-200 dark:border-gray-600 ${matches ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-red-100 dark:bg-red-900'}`}>
                      <td className={`sticky left-0 z-20 border-r border-gray-200 dark:border-gray-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide ${matches ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300'}`}>
                        {matches ? '✓ Cuadra' : '✗ No cuadra'}
                      </td>
                      <td colSpan={DIST_COLS.length} className="px-4 py-2">
                        <div className="flex items-center justify-start gap-3 text-xs">
                          <span className="text-gray-500 dark:text-gray-400">
                            Repartición: <span className={`font-semibold ${matches ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                              {grandTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </span>
                          </span>
                          <span className={`font-bold ${matches ? 'text-emerald-500' : 'text-red-400'}`}>{matches ? '=' : '≠'}</span>
                          <span className="text-gray-500 dark:text-gray-400">
                            Ingresos: <span className="font-semibold text-gray-700 dark:text-gray-300">
                              {ingresoTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td />
                    </tr>
                  </>
                )
              })()}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700">
          <button
            className={isSelectedMonthLocked ? 'hidden' : 'inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors'}
            onClick={addDistRow}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Agregar fila
          </button>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
          <div className="text-xs text-gray-400 dark:text-gray-500 max-w-xs leading-snug">
            Aplica los totales al mes <span className="font-medium text-gray-600 dark:text-gray-300">{MONTH_NAMES[months.find(m => m.id === selectedMonthId)?.month ?? 0] ?? ''}</span> en Cuentas y Power
          </div>
          <div className="flex items-center gap-3">
            {applyResult === 'success' && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">✓ Aplicado correctamente</span>
            )}
            {applyResult === 'error' && (
              <span className="text-xs text-red-500 dark:text-red-400 font-medium">Error al aplicar</span>
            )}
            {(() => {
              const selMonth = months.find(m => m.id === selectedMonthId)
              if (!selMonth) return null
              return selMonth.locked ? (
                <button
                  onClick={() => unlockMonth(selMonth.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" /></svg>
                  Desbloquear mes
                </button>
              ) : (
                <button
                  onClick={() => lockMonth(selMonth.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                  Bloquear mes
                </button>
              )
            })()}
            <button
              onClick={applyReparticion}
              disabled={applying || isSelectedMonthLocked}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white transition-colors"
            >
              {applying ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Aplicando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                  Aplicar a Cuentas y Power
                </>
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
