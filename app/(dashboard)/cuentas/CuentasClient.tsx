'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MONTH_NAMES, ACCOUNTS, computeCorteAccountTotals } from '@/lib/utils/accounts'
import type { BudgetMonth, BudgetExpense, PersonalExpense } from '@/lib/supabase/types'

const DIST_COLS = [
  { key: 'julio',           label: 'Julio' },
  { key: 'flor',            label: 'Flor' },
  { key: 'casita',          label: 'Casita' },
  { key: 'power',           label: 'Power' },
  { key: 'limpieza',        label: 'Limpieza' },
  { key: 'regalos',         label: 'Regalos' },
  { key: 'flor_y_julio',    label: 'Flor y Julio' },
  { key: 'navidad',         label: 'Navidad' },
  { key: 'gasolina',        label: 'Gasolina' },
  { key: 'entretenimiento', label: 'Entretenimiento' },
] as const

const DIST_COL_COLORS: Record<string, string> = {
  julio:           'oklch(60% 0.14 345)',
  flor:            'oklch(60% 0.14 60)',
  casita:          'oklch(60% 0.14 155)',
  power:           'oklch(60% 0.14 230)',
  limpieza:        'oklch(60% 0.14 290)',
  regalos:         'oklch(60% 0.14 20)',
  flor_y_julio:    'oklch(60% 0.14 35)',
  navidad:         'oklch(60% 0.14 200)',
  gasolina:        'oklch(60% 0.14 100)',
  entretenimiento: 'oklch(60% 0.14 320)',
}

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
  allExpenses: PersonalExpense[]
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

export default function CuentasClient({ initialMonths, powerTotal, allExpenses }: Props) {
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

  useEffect(() => {
    const containers = document.querySelectorAll<HTMLElement>('.table-scroll')
    containers.forEach(el => { el.scrollLeft = el.scrollWidth })
  }, [selectedMonthId])

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('payment_distribution') as any).insert(toInsert)
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
  const [reverting, setReverting] = useState(false)
  const [revertResult, setRevertResult] = useState<'success' | 'error' | null>(null)
  const [copying, setCopying] = useState(false)
  const [copyResult, setCopyResult] = useState<'success' | 'error' | null>(null)
  const [view, setView] = useState<'cuenta' | 'data' | 'dist'>('cuenta')
  const [incomeOpen, setIncomeOpen] = useState(true)
  const [gastosOpen, setGastosOpen] = useState(true)
  const [deudasOpen, setDeudasOpen] = useState(true)
  const [openDestinos, setOpenDestinos] = useState<Set<string>>(new Set())

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('payment_distribution') as any).insert([data])
      const { data: all } = await supabase
        .from('payment_distribution').select('*')
        .eq('budget_month_id', selectedMonthId)
        .order('sort_order', { ascending: true }).order('created_at', { ascending: true })
      if (all) setDistRows(all as DistRow[])
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, _unsaved, ...data } = updatedRow
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('payment_distribution') as any).update(data).eq('id', rowId)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('payment_distribution') as any).update({ hidden: true }).eq('id', row.id)
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
        // a) Add to main balance (category === accountKey, the editable amount)
        const mainRow = expenses.find(e => e.account === accountKey && e.category === accountKey)
        if (mainRow) {
          await expClient.update({ amount: (mainRow.amount ?? 0) + amount }).eq('id', mainRow.id)
        } else {
          await expClient.insert({ budget_month_id: selectedMonthId, category: accountKey, account: accountKey, amount })
        }
        // b) Track applied amount separately for the read-only badge (category === 'dist_applied')
        const appliedRow = expenses.find(e => e.account === accountKey && e.category === 'dist_applied')
        if (appliedRow) {
          await expClient.update({ amount: (appliedRow.amount ?? 0) + amount }).eq('id', appliedRow.id)
        } else {
          await expClient.insert({ budget_month_id: selectedMonthId, category: 'dist_applied', account: accountKey, amount })
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

  async function revertReparticion() {
    setReverting(true)
    setRevertResult(null)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const expClient = supabase.from('budget_expenses') as any
      const appliedRows = expenses.filter(e => e.category === 'dist_applied' && e.account)
      for (const appliedRow of appliedRows) {
        const appliedAmount = appliedRow.amount ?? 0
        // Subtract from main balance
        const mainRow = expenses.find(e => e.account === appliedRow.account && e.category === appliedRow.account)
        if (mainRow) {
          const newAmount = (mainRow.amount ?? 0) - appliedAmount
          if (newAmount <= 0) {
            await expClient.delete().eq('id', mainRow.id)
          } else {
            await expClient.update({ amount: newAmount }).eq('id', mainRow.id)
          }
        }
        // Delete the dist_applied tracking row
        await expClient.delete().eq('id', appliedRow.id)
      }
      // Reload
      const { data: refreshed } = await (supabase.from('budget_expenses') as any)
        .select('*').eq('budget_month_id', selectedMonthId)
      if (refreshed) setExpenses(refreshed)
      setRevertResult('success')
    } catch {
      setRevertResult('error')
    }
    setReverting(false)
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

  // Group expenses by account — direct row (category === account key) is the manually editable amount
  const byAccount: Record<string, number> = {}
  for (const acc of ACCOUNTS) {
    const direct = expenses.find(e => e.account === acc.key && e.category === acc.key)
    byAccount[acc.key] = direct
      ? (direct.amount ?? 0)
      : expenses.filter(e => e.account === acc.key && e.category !== acc.key && e.category !== 'dist_applied').reduce((s, e) => s + (e.amount ?? 0), 0)
  }

  // Amount accumulated from "Aplicar a Cuentas y Power" (read-only badge)
  const appliedByAccount: Record<string, number> = {}
  for (const acc of ACCOUNTS) {
    const row = expenses.find(e => e.account === acc.key && e.category === 'dist_applied')
    appliedByAccount[acc.key] = row?.amount ?? 0
  }

  const selectedMonthNum = months.find(m => m.id === selectedMonthId)?.month
  const realByAccount = useMemo(() => {
    const monthExp = allExpenses.filter(e => new Date(e.date + 'T00:00:00').getMonth() + 1 === selectedMonthNum)
    return computeCorteAccountTotals(monthExp as Record<string, number | null | string | boolean>[])
  }, [allExpenses, selectedMonthNum])

  const fmt = (n: number) => `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
  const fmtAmt = (n: number) => n % 1 === 0
    ? n.toLocaleString('es-PE')
    : n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const selMonth = months.find(m => m.id === selectedMonthId)
  const selMonthIngresos = (['julio', 'flor'] as const).reduce((sum, src) => sum + (incomeByMonth[selectedMonthId]?.[src]?.amount ?? 0), 0)
  const selMonthGastos = gastoRows.reduce((sum, label) => sum + (gastosByMonth[selectedMonthId]?.[label]?.amount ?? 0), 0)
  const selMonthDeudas = deudaRows.reduce((sum, label) => sum + (deudasByMonth[selectedMonthId]?.[label]?.amount ?? 0), 0)
  const heroBalance = selMonthIngresos - selMonthGastos - selMonthDeudas

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{color:'var(--t)'}}>Cuentas</h1>
          <p className="text-xs mt-0.5" style={{color:'var(--t3)'}}>
            Presupuesto {selMonth ? `${MONTH_NAMES[selMonth.month]} ${selMonth.year}` : ''}
          </p>
        </div>
        <select
          className="rounded-xl text-xs font-medium px-3 py-2"
          style={{background:'var(--surface)',border:'1px solid var(--border)',outline:'none',color:'var(--t)'}}
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

      {/* Hero — balance del mes */}
      <div className="relative overflow-hidden rounded-2xl p-5" style={{background:'var(--accent)'}}>
        <div style={{position:'absolute',top:-28,right:-28,width:120,height:120,borderRadius:'50%',background:'rgba(255,255,255,.08)'}}/>
        <div style={{position:'absolute',bottom:-36,right:60,width:90,height:90,borderRadius:'50%',background:'rgba(255,255,255,.05)'}}/>
        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{color:'rgba(255,255,255,.7)'}}>
            Balance mensual · {selMonth ? MONTH_NAMES[selMonth.month] : ''}
          </p>
          <p className="font-mono font-bold" style={{color:'#fff',fontSize:34,letterSpacing:'-0.02em',marginTop:2,lineHeight:1.1}}>
            {heroBalance >= 0 ? '+' : ''}{fmt(heroBalance)}
          </p>
          <div className="flex items-stretch gap-3 mt-3">
            <div style={{flex:1}}>
              <p className="text-[9px] uppercase tracking-wider" style={{color:'rgba(255,255,255,.6)'}}>Ingresos</p>
              <p className="font-mono text-[13px] font-semibold" style={{color:'#fff'}}>{fmt(selMonthIngresos)}</p>
            </div>
            <div style={{width:1,background:'rgba(255,255,255,.25)'}}/>
            <div style={{flex:1}}>
              <p className="text-[9px] uppercase tracking-wider" style={{color:'rgba(255,255,255,.6)'}}>Gastos</p>
              <p className="font-mono text-[13px] font-semibold" style={{color:'#fff'}}>{fmt(selMonthGastos)}</p>
            </div>
            <div style={{width:1,background:'rgba(255,255,255,.25)'}}/>
            <div style={{flex:1}}>
              <p className="text-[9px] uppercase tracking-wider" style={{color:'rgba(255,255,255,.6)'}}>Deudas</p>
              <p className="font-mono text-[13px] font-semibold" style={{color:'#fff'}}>{fmt(selMonthDeudas)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented tabs */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{background:'var(--bg2)'}}>
        {([
          {id:'cuenta' as const, label:'Cuentas & Flujo'},
          {id:'data' as const, label:'Ingreso de data'},
          {id:'dist' as const, label:'Distribución'},
        ]).map(t => (
          <button key={t.id} onClick={() => setView(t.id)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors"
            style={view === t.id
              ? {background:'var(--surface)',color:'var(--t)',boxShadow:'0 1px 2px rgba(0,0,0,.06)'}
              : {color:'var(--t3)',background:'transparent'}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── POR CUENTA ────────────────────────────────────────────── */}
      {view === 'cuenta' && (
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{color:'var(--t3)'}}>
              Cuentas Scotiabank · {ACCOUNTS.length}
            </p>
            <div className="flex items-center gap-2">
              {copyResult === 'success' && <span className="text-xs font-medium" style={{color:'var(--accent)'}}>✓ Copiado</span>}
              {copyResult === 'error' && <span className="text-xs font-medium" style={{color:'var(--red)'}}>Error al copiar</span>}
              {revertResult === 'success' && <span className="text-xs font-medium" style={{color:'var(--amber)'}}>✓ Revertido</span>}
              {revertResult === 'error' && <span className="text-xs font-medium" style={{color:'var(--red)'}}>Error al revertir</span>}
              {expenses.some(e => e.category === 'dist_applied') && (
                <button onClick={revertReparticion} disabled={reverting}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium disabled:opacity-40 transition-colors"
                  style={{background:'color-mix(in oklch, var(--red) 10%, transparent)',color:'var(--red)',border:'1px solid color-mix(in oklch, var(--red) 30%, transparent)'}}>
                  {reverting ? 'Revirtiendo...' : 'Revertir aplicación'}
                </button>
              )}
              {!isSelectedMonthLocked && (
                <button onClick={copyFromPreviousMonth} disabled={copying || !getDisplayMonths(months, selectedMonthId)[1]}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium disabled:opacity-40 transition-colors"
                  style={{background:'var(--bg2)',color:'var(--t2)',border:'1px solid var(--border)'}}>
                  {copying ? 'Copiando...' : 'Copiar mes anterior'}
                </button>
              )}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <p className="text-sm" style={{color:'var(--t3)'}}>Cargando...</p>
          ) : (
            <>
              <div className="rounded-2xl p-3" style={{background:'var(--surface)',border:'1px solid var(--border)'}}>
              <div className="grid grid-cols-2 gap-3">
                {ACCOUNTS.map(acc => {
                  const amt = acc.key === 'power' ? powerTotal : (byAccount[acc.key] ?? 0)
                  const applied = acc.key === 'power' ? 0 : (appliedByAccount[acc.key] ?? 0)
                  const real = acc.key === 'power' ? 0 : (realByAccount[acc.key] ?? 0)
                  const isEditing = editingAccountKey === acc.key
                  return (
                    <div key={acc.key} className="rounded-2xl p-3 flex flex-col gap-1.5" style={{background:'color-mix(in oklch, var(--asoft) 45%, var(--surface))'}}>
                      {/* Header row: label + applied badge */}
                      <div className="flex items-center justify-between gap-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{color:'var(--atext)'}}>{acc.label}</p>
                        {applied > 0 && (
                          <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{background:'color-mix(in oklch, var(--accent) 15%, transparent)',color:'var(--atext)'}}>
                            +{fmt(applied)}
                          </span>
                        )}
                      </div>
                      {/* Main editable amount */}
                      {acc.key === 'power' ? (
                        <p className="font-mono text-sm font-bold" style={{color:'var(--t)'}}>{fmt(powerTotal)}</p>
                      ) : isEditing ? (
                        <input autoFocus type="number" step="0.01"
                          className="w-full rounded-lg px-2 py-0.5 text-sm font-bold"
                          style={{border:'1px solid var(--accent)',background:'var(--surface)',color:'var(--t)',outline:'none'}}
                          value={editAccountValue}
                          onChange={e => setEditAccountValue(e.target.value)}
                          onBlur={() => saveAccountAmount(acc.key)}
                          onKeyDown={e => { if (e.key === 'Enter') saveAccountAmount(acc.key); if (e.key === 'Escape') setEditingAccountKey(null) }}
                        />
                      ) : (
                        <p className={`font-mono text-sm font-bold${isSelectedMonthLocked ? '' : ' cursor-pointer'}`}
                          style={{color:'var(--t)'}}
                          onClick={() => { if (isSelectedMonthLocked) return; setEditingAccountKey(acc.key); setEditAccountValue(amt.toString()) }}>
                          {fmt(amt)}
                        </p>
                      )}

                    </div>
                  )
                })}
              </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── INGRESO DE DATA ───────────────────────────────────────── */}
      {view === 'data' && (() => {
        const displayMonths = getDisplayMonths(months, selectedMonthId)
        const prevM = displayMonths[1]
        const fmtC = (n: number) => n >= 1000 ? `S/ ${(n/1000).toFixed(1)}k` : `S/ ${Math.round(n)}`
        const totalInc = INCOME_SOURCES.reduce((s, {key}) => s + (incomeByMonth[selectedMonthId]?.[key]?.amount ?? 0), 0)

        return (
          <div className="space-y-4">

            {/* Ingresos */}
            <div className="rounded-2xl overflow-hidden" style={{background:'var(--surface)',border:'1px solid var(--border)'}}>
              <div className="px-4 py-2.5 flex items-center justify-between cursor-pointer select-none" style={{borderBottom: incomeOpen ? '1px solid var(--border)' : 'none'}} onClick={() => setIncomeOpen(o => !o)}>
                <div className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0 transition-transform" style={{color:'var(--t3)', transform: incomeOpen ? 'rotate(90deg)' : 'rotate(0deg)'}} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <p className="text-xs font-semibold" style={{color:'var(--t)'}}>Ingresos</p>
                    <p className="text-[10px]" style={{color:'var(--t3)'}}>{selMonth ? MONTH_NAMES[selMonth.month] : ''}</p>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold" style={{color:'var(--accent)'}}>{fmtC(totalInc)}</span>
              </div>
              {incomeOpen && (<><div>
                  {INCOME_SOURCES.map(({key, label}, idx) => {
                    const entry  = incomeByMonth[selectedMonthId]?.[key]
                    const cur    = entry?.amount ?? 0
                    const prev   = prevM ? (incomeByMonth[prevM.id]?.[key]?.amount ?? 0) : 0
                    const delta  = cur - prev
                    const isEditing    = editingCell?.monthId === selectedMonthId && editingCell?.source === key
                    const isEditingCmt = editingComment?.monthId === selectedMonthId && editingComment?.source === key
                    const hasComment   = key === 'otros_ingresos' && !!entry?.description
                    return (
                      <div key={key} className="px-4 py-2.5" style={idx > 0 ? {borderTop:'1px solid var(--border)'} : {}}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs font-medium" style={{color:'var(--t)'}}>{label}</span>
                            {key === 'otros_ingresos' && (
                              isEditingCmt ? (
                                <input autoFocus type="text"
                                  className="w-36 rounded px-2 py-0.5 text-xs"
                                  style={{border:'1px solid var(--amber)',background:'var(--surface)',color:'var(--t)',outline:'none'}}
                                  value={editCommentValue} placeholder="Comentario..."
                                  onChange={e => setEditCommentValue(e.target.value)}
                                  onBlur={() => saveIncomeComment(selectedMonthId, key)}
                                  onKeyDown={e => { if (e.key === 'Enter') saveIncomeComment(selectedMonthId, key); if (e.key === 'Escape') setEditingComment(null) }}
                                />
                              ) : hasComment ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded cursor-pointer truncate max-w-[120px]"
                                  style={{background:'color-mix(in oklch, var(--amber) 15%, transparent)',color:'var(--amber)'}}
                                  onClick={() => { if (isSelectedMonthLocked) return; setEditingComment({monthId:selectedMonthId,source:key}); setEditCommentValue(entry?.description ?? '') }}>
                                  {entry!.description}
                                </span>
                              ) : !isSelectedMonthLocked ? (
                                <button className="text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover/inc:opacity-100"
                                  style={{color:'var(--t3)'}}
                                  onClick={() => { setEditingComment({monthId:selectedMonthId,source:key}); setEditCommentValue('') }}>
                                  + nota
                                </button>
                              ) : null
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {prevM && delta !== 0 && !isEditing && (
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{
                                background: delta < 0
                                  ? 'color-mix(in oklch, var(--red) 12%, transparent)'
                                  : 'color-mix(in oklch, oklch(55% 0.14 155) 15%, transparent)',
                                color: delta < 0 ? 'var(--red)' : 'oklch(45% 0.14 155)',
                              }}>
                                {delta > 0 ? '↑' : '↓'} {fmtAmt(Math.abs(delta))}
                              </span>
                            )}
                            {isEditing ? (
                              <input autoFocus type="number" step="0.01"
                                className="w-28 rounded-lg px-2 py-0.5 text-sm font-semibold text-right"
                                style={{border:'1px solid var(--accent)',background:'var(--surface)',color:'var(--t)',outline:'none'}}
                                value={editCellValue}
                                onChange={e => setEditCellValue(e.target.value)}
                                onBlur={() => saveIncomeCell(selectedMonthId, key)}
                                onKeyDown={e => { if (e.key === 'Enter') saveIncomeCell(selectedMonthId, key); if (e.key === 'Escape') setEditingCell(null) }}
                              />
                            ) : (
                              <span
                                className={isSelectedMonthLocked ? '' : 'cursor-pointer'}
                                style={{color:'var(--t)',fontFamily:'var(--font-mono,monospace)',fontSize:13,fontWeight:700,minWidth:72,textAlign:'right',display:'inline-block'}}
                                onClick={() => { if (isSelectedMonthLocked) return; setEditingCell({monthId:selectedMonthId,source:key}); setEditCellValue(cur.toString()) }}>
                                {fmt(cur)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="px-4 py-2.5 flex items-center justify-between" style={{borderTop:'1px solid var(--border)',background:'var(--bg2)'}}>
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{color:'var(--t2)'}}>Total Ingresos</span>
                  <span className="font-mono text-xs font-semibold" style={{color:'var(--t)'}}>{fmt(totalInc)}</span>
                </div>
              </>)}
            </div>

            {/* Gastos presupuestados */}
            {(() => {
              const totalGas = gastoRows.reduce((s, lbl) => s + (gastosByMonth[selectedMonthId]?.[lbl]?.amount ?? 0), 0)
              return (
                <div className="rounded-2xl overflow-hidden" style={{background:'var(--surface)',border:'1px solid var(--border)'}}>
                  <div className="px-4 py-2.5 flex items-center justify-between cursor-pointer select-none" style={{borderBottom: gastosOpen ? '1px solid var(--border)' : 'none'}} onClick={() => setGastosOpen(o => !o)}>
                    <div className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0 transition-transform" style={{color:'var(--t3)', transform: gastosOpen ? 'rotate(90deg)' : 'rotate(0deg)'}} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                      </svg>
                      <div>
                        <p className="text-xs font-semibold" style={{color:'var(--t)'}}>Gastos presupuestados</p>
                        <p className="text-[10px]" style={{color:'var(--t3)'}}>{selMonth ? MONTH_NAMES[selMonth.month] : ''}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-semibold" style={{color:'var(--accent)'}}>{fmtC(totalGas)}</span>
                  </div>
                  {gastosOpen && (<><div>
                      {gastoRows.map((lbl, idx) => {
                        const cur  = gastosByMonth[selectedMonthId]?.[lbl]?.amount ?? 0
                        const prev = prevM ? (gastosByMonth[prevM.id]?.[lbl]?.amount ?? 0) : 0
                        const delta = cur - prev
                        const displayLabel = lbl.startsWith('__new_') ? '' : lbl
                        const isEditingCell  = editingGastoCell?.monthId === selectedMonthId && editingGastoCell?.label === lbl
                        const isEditingLabel = editingGastoLabel === lbl
                        return (
                          <div key={lbl} className="px-4 py-2.5" style={idx > 0 ? {borderTop:'1px solid var(--border)'} : {}}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-2">
                                {isEditingLabel ? (
                                  <input autoFocus type="text"
                                    className="w-full rounded-lg px-2 py-0.5 text-xs"
                                    style={{border:'1px solid var(--accent)',background:'var(--surface)',color:'var(--t)',outline:'none'}}
                                    value={editGastoLabelValue} placeholder="Nombre del gasto..."
                                    onChange={e => setEditGastoLabelValue(e.target.value)}
                                    onBlur={() => saveGastoLabel(lbl)}
                                    onKeyDown={e => { if (e.key === 'Enter') saveGastoLabel(lbl); if (e.key === 'Escape') { if (lbl.startsWith('__new_')) setGastoRows(prev => prev.filter(l => l !== lbl)); setEditingGastoLabel(null) } }}
                                  />
                                ) : (
                                  <span className="text-xs font-medium truncate cursor-pointer" style={{color:'var(--t)'}}
                                    onClick={() => { setEditingGastoLabel(lbl); setEditGastoLabelValue(displayLabel) }}>
                                    {displayLabel || <em className="font-normal" style={{color:'var(--t3)'}}>Sin nombre</em>}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {prevM && delta !== 0 && !isEditingCell && (
                                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{
                                    background: delta > 0
                                      ? 'color-mix(in oklch, var(--red) 12%, transparent)'
                                      : 'color-mix(in oklch, oklch(55% 0.14 155) 15%, transparent)',
                                    color: delta > 0 ? 'var(--red)' : 'oklch(45% 0.14 155)',
                                  }}>
                                    {delta > 0 ? '↑' : '↓'} {fmtAmt(Math.abs(delta))}
                                  </span>
                                )}
                                {isEditingCell ? (
                                  <input autoFocus type="number" step="0.01"
                                    className="w-28 rounded-lg px-2 py-0.5 text-sm font-semibold text-right"
                                    style={{border:'1px solid var(--accent)',background:'var(--surface)',color:'var(--t)',outline:'none'}}
                                    value={editGastoCellValue}
                                    onChange={e => setEditGastoCellValue(e.target.value)}
                                    onBlur={() => saveGastoCell(selectedMonthId, lbl)}
                                    onKeyDown={e => { if (e.key === 'Enter') saveGastoCell(selectedMonthId, lbl); if (e.key === 'Escape') setEditingGastoCell(null) }}
                                  />
                                ) : (
                                  <span
                                    className={isSelectedMonthLocked ? '' : 'cursor-pointer'}
                                    style={{color:'var(--t)',fontFamily:'var(--font-mono,monospace)',fontSize:13,fontWeight:700,minWidth:72,textAlign:'right',display:'inline-block'}}
                                    onClick={() => { if (isSelectedMonthLocked) return; setEditingGastoCell({monthId:selectedMonthId,label:lbl}); setEditGastoCellValue(cur.toString()) }}>
                                    {fmt(cur)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="px-4 py-2.5 flex items-center justify-between" style={{borderTop:'1px solid var(--border)',background:'var(--bg2)'}}>
                      <button className="inline-flex items-center gap-1.5 text-xs font-medium" style={{color:'var(--accent)'}} onClick={addGastoRow}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
                        Agregar fila
                      </button>
                      <span className="font-mono text-xs font-semibold" style={{color:'var(--t)'}}>{fmt(totalGas)}</span>
                    </div>
                  </>)}
                </div>
              )
            })()}

            {/* Deudas */}
            {(() => {
              const totalDeu = deudaRows.reduce((s, lbl) => s + (deudasByMonth[selectedMonthId]?.[lbl]?.amount ?? 0), 0)
              return (
                <div className="rounded-2xl overflow-hidden" style={{background:'var(--surface)',border:'1px solid var(--border)'}}>
                  <div className="px-4 py-2.5 flex items-center justify-between cursor-pointer select-none" style={{borderBottom: deudasOpen ? '1px solid var(--border)' : 'none'}} onClick={() => setDeudasOpen(o => !o)}>
                    <div className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0 transition-transform" style={{color:'var(--t3)', transform: deudasOpen ? 'rotate(90deg)' : 'rotate(0deg)'}} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                      </svg>
                      <div>
                        <p className="text-xs font-semibold" style={{color:'var(--t)'}}>Deudas</p>
                        <p className="text-[10px]" style={{color:'var(--t3)'}}>{selMonth ? MONTH_NAMES[selMonth.month] : ''}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-semibold" style={{color:'var(--accent)'}}>{fmtC(totalDeu)}</span>
                  </div>
                  {deudasOpen && (<><div>
                      {deudaRows.map((lbl, idx) => {
                        const cur  = deudasByMonth[selectedMonthId]?.[lbl]?.amount ?? 0
                        const prev = prevM ? (deudasByMonth[prevM.id]?.[lbl]?.amount ?? 0) : 0
                        const delta = cur - prev
                        const displayLabel   = lbl.startsWith('__new_') ? '' : lbl
                        const isEditingCell  = editingDeudaCell?.monthId === selectedMonthId && editingDeudaCell?.label === lbl
                        const isEditingLabel = editingDeudaLabel === lbl
                        return (
                          <div key={lbl} className="px-4 py-2.5" style={idx > 0 ? {borderTop:'1px solid var(--border)'} : {}}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-2">
                                {isEditingLabel ? (
                                  <input autoFocus type="text"
                                    className="w-full rounded-lg px-2 py-0.5 text-xs"
                                    style={{border:'1px solid var(--accent)',background:'var(--surface)',color:'var(--t)',outline:'none'}}
                                    value={editDeudaLabelValue} placeholder="Nombre de deuda..."
                                    onChange={e => setEditDeudaLabelValue(e.target.value)}
                                    onBlur={() => saveDeudaLabel(lbl)}
                                    onKeyDown={e => { if (e.key === 'Enter') saveDeudaLabel(lbl); if (e.key === 'Escape') { if (lbl.startsWith('__new_')) setDeudaRows(prev => prev.filter(l => l !== lbl)); setEditingDeudaLabel(null) } }}
                                  />
                                ) : (
                                  <span className="text-xs font-medium truncate cursor-pointer" style={{color:'var(--t)'}}
                                    onClick={() => { setEditingDeudaLabel(lbl); setEditDeudaLabelValue(displayLabel) }}>
                                    {displayLabel || <em className="font-normal" style={{color:'var(--t3)'}}>Sin nombre</em>}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {prevM && delta !== 0 && !isEditingCell && (
                                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{
                                    background: delta > 0
                                      ? 'color-mix(in oklch, var(--red) 12%, transparent)'
                                      : 'color-mix(in oklch, oklch(55% 0.14 155) 15%, transparent)',
                                    color: delta > 0 ? 'var(--red)' : 'oklch(45% 0.14 155)',
                                  }}>
                                    {delta > 0 ? '↑' : '↓'} {fmtAmt(Math.abs(delta))}
                                  </span>
                                )}
                                {isEditingCell ? (
                                  <input autoFocus type="number" step="0.01"
                                    className="w-28 rounded-lg px-2 py-0.5 text-sm font-semibold text-right"
                                    style={{border:'1px solid var(--accent)',background:'var(--surface)',color:'var(--t)',outline:'none'}}
                                    value={editDeudaCellValue}
                                    onChange={e => setEditDeudaCellValue(e.target.value)}
                                    onBlur={() => saveDeudaCell(selectedMonthId, lbl)}
                                    onKeyDown={e => { if (e.key === 'Enter') saveDeudaCell(selectedMonthId, lbl); if (e.key === 'Escape') setEditingDeudaCell(null) }}
                                  />
                                ) : (
                                  <span
                                    className={isSelectedMonthLocked ? '' : 'cursor-pointer'}
                                    style={{color:'var(--t)',fontFamily:'var(--font-mono,monospace)',fontSize:13,fontWeight:700,minWidth:72,textAlign:'right',display:'inline-block'}}
                                    onClick={() => { if (isSelectedMonthLocked) return; setEditingDeudaCell({monthId:selectedMonthId,label:lbl}); setEditDeudaCellValue(cur.toString()) }}>
                                    {fmt(cur)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="px-4 py-2.5 flex items-center justify-between" style={{borderTop:'1px solid var(--border)',background:'var(--bg2)'}}>
                      <button className="inline-flex items-center gap-1.5 text-xs font-medium" style={{color:'var(--accent)'}} onClick={addDeudaRow}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
                        Agregar fila
                      </button>
                      <span className="font-mono text-xs font-semibold" style={{color:'var(--t)'}}>{fmt(totalDeu)}</span>
                    </div>
                  </>)}
                </div>
              )
            })()}

          </div>
        )
      })()}


      {/* ── DISTRIBUCIÓN ──────────────────────────────────────────── */}
      {view === 'dist' && (() => {
        const ingresoTotal = (['julio', 'flor'] as const).reduce((sum, src) => sum + (incomeByMonth[selectedMonthId]?.[src]?.amount ?? 0), 0)
        const sobrante = ingresoTotal
          - gastoRows.reduce((sum, l) => sum + (gastosByMonth[selectedMonthId]?.[l]?.amount ?? 0), 0)
          - deudaRows.reduce((sum, l) => sum + (deudasByMonth[selectedMonthId]?.[l]?.amount ?? 0), 0)

        const destinos = DIST_COLS.map(c => {
          const fromRows = distRows.reduce((sum, row) => {
            const autoVal = getAutoDistValue(row.gasto_egreso, c.key)
            return sum + (autoVal !== null ? autoVal : (row[c.key] ?? 0))
          }, 0)
          const total = c.key === 'power' ? fromRows + sobrante : fromRows
          const n = distRows.filter(row => {
            const autoVal = getAutoDistValue(row.gasto_egreso, c.key)
            return (autoVal !== null ? autoVal : (row[c.key] ?? 0)) > 0
          }).length + (c.key === 'power' && sobrante > 0 ? 1 : 0)
          return { ...c, total, n, color: DIST_COL_COLORS[c.key] ?? 'var(--accent)' }
        })
        const sorted = [...destinos].sort((a, b) => b.total - a.total)
        const grandTotal = destinos.reduce((s, d) => s + d.total, 0)
        const maxT = Math.max(...destinos.map(d => d.total), 1)
        const matches = Math.abs(grandTotal - ingresoTotal) < 0.01

        return (
          <div className="space-y-3">

            {/* Header */}
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{color:'var(--t3)'}}>
                Distribución · {DIST_COLS.length} destinos
              </p>
              <span className="text-xs font-mono font-semibold" style={{color:'var(--accent)'}}>{fmt(grandTotal)}</span>
            </div>

            {/* Proportion bar */}
            <div className="rounded-2xl p-4" style={{background:'var(--surface)',border:'1px solid var(--border)'}}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{color:'var(--t3)'}}>Proporción del mes</p>
              <div style={{height:18,borderRadius:9,overflow:'hidden',display:'flex',background:'var(--bg2)'}}>
                {sorted.filter(d => d.total > 0).map(d => (
                  <div key={d.key} title={`${d.label}: ${fmt(d.total)}`}
                    style={{width:`${(d.total / grandTotal) * 100}%`, background: d.color, opacity: 0.85}}/>
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                {sorted.filter(d => d.total > 0).map(d => (
                  <div key={d.key} className="flex items-center gap-1.5">
                    <div style={{width:8,height:8,borderRadius:2,background:d.color}}/>
                    <span className="text-[11px]" style={{color:'var(--t2)'}}>{d.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Destino cards */}
            <div className="space-y-1.5">
              {sorted.map(d => {
                const empty = d.total <= 0
                const isOpen = openDestinos.has(d.key)
                const toggle = () => {
                  if (empty) return
                  setOpenDestinos(prev => {
                    const next = new Set(prev)
                    next.has(d.key) ? next.delete(d.key) : next.add(d.key)
                    return next
                  })
                }

                // rows that contribute to this destino
                const contributing: { label: string; amount: number; isAuto: boolean }[] = distRows
                  .map(row => {
                    const autoVal = getAutoDistValue(row.gasto_egreso, d.key)
                    const amount = autoVal !== null ? autoVal : (row[d.key] ?? 0)
                    return { label: row.gasto_egreso || 'Sin nombre', amount, isAuto: autoVal !== null }
                  })
                  .filter(r => r.amount > 0)
                if (d.key === 'power' && sobrante > 0) {
                  contributing.push({ label: 'Sobrante del mes', amount: sobrante, isAuto: true })
                }

                return (
                  <div key={d.key} className="rounded-2xl overflow-hidden"
                    style={{background:'var(--surface)',border:'1px solid var(--border)',opacity:empty ? 0.5 : 1}}>
                    {/* Header row */}
                    <div className={`px-3 py-2.5 flex items-center gap-2 ${!empty ? 'cursor-pointer select-none' : ''}`}
                      onClick={toggle}>
                      {!empty && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0 transition-transform"
                          style={{color:'var(--t3)', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)'}}
                          viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                        </svg>
                      )}
                      {empty && <div style={{width:12}}/>}
                      <div style={{width:10,height:10,borderRadius:3,flexShrink:0,background:d.color}}/>
                      <span className="text-sm font-semibold flex-1" style={{color:'var(--t)'}}>{d.label}</span>
                      {!empty && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                          style={{background:'var(--bg2)',color:'var(--t3)'}}>
                          {d.n} gasto{d.n !== 1 ? 's' : ''}
                        </span>
                      )}
                      <span className="font-mono text-sm font-semibold" style={{color: empty ? 'var(--t3)' : 'var(--t)'}}>
                        {empty ? '—' : fmt(d.total)}
                      </span>
                    </div>
                    {/* Progress bar (always visible when non-empty) */}
                    {!empty && (
                      <div className="px-3 pb-2.5" style={{marginTop:-6}}>
                        <div style={{height:3,borderRadius:2,background:'var(--bg2)',overflow:'hidden'}}>
                          <div style={{height:'100%',width:`${(d.total / maxT) * 100}%`,background:d.color,opacity:.7}}/>
                        </div>
                      </div>
                    )}
                    {/* Expanded gastos list */}
                    {isOpen && contributing.length > 0 && (
                      <div style={{borderTop:'1px solid var(--border)'}}>
                        {contributing.map((r, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-2"
                            style={{borderTop: i > 0 ? '1px solid var(--border)' : 'none', background:'var(--bg2)'}}>
                            <div className="flex items-center gap-2 min-w-0">
                              {r.isAuto && (
                                <div style={{width:5,height:5,borderRadius:'50%',flexShrink:0,background:d.color,opacity:.7}}/>
                              )}
                              <span className="text-xs truncate" style={{color:'var(--t2)'}}>{r.label}</span>
                            </div>
                            <span className="font-mono text-xs font-medium flex-shrink-0 ml-3" style={{color:'var(--t)'}}>
                              {fmt(r.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Balance check */}
            <div className="rounded-2xl px-4 py-3" style={{
              background: matches ? 'color-mix(in oklch, var(--accent) 8%, transparent)' : 'color-mix(in oklch, var(--red) 8%, transparent)',
              border: `1px solid ${matches ? 'color-mix(in oklch, var(--accent) 25%, transparent)' : 'color-mix(in oklch, var(--red) 25%, transparent)'}`,
            }}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
                <span className="font-semibold" style={{color: matches ? 'var(--accent)' : 'var(--red)'}}>
                  {matches ? '✓ Cuadra' : '✗ No cuadra'}
                </span>
                <span style={{color:'var(--t3)'}}>
                  Repartición: <span className="font-semibold" style={{color: matches ? 'var(--accent)' : 'var(--red)'}}>{fmt(grandTotal)}</span>
                </span>
                <span className="font-bold" style={{color: matches ? 'var(--accent)' : 'var(--red)'}}>{matches ? '=' : '≠'}</span>
                <span style={{color:'var(--t3)'}}>
                  Ingresos: <span className="font-semibold" style={{color:'var(--t)'}}>{fmt(ingresoTotal)}</span>
                </span>
              </div>
            </div>

            {/* Edit table (collapsible) */}
            <details className="group">
              <summary className="cursor-pointer list-none flex items-center gap-1.5 py-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0 transition-transform group-open:rotate-90" style={{color:'var(--t3)'}} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-[10px] font-semibold uppercase tracking-widest" style={{color:'var(--t3)'}}>Editar distribución</span>
                {distLoading && <span className="text-xs" style={{color:'var(--t3)'}}>Cargando...</span>}
              </summary>
              <div className="rounded-2xl overflow-hidden mt-2" style={{background:'var(--surface)',border:'1px solid var(--border)'}}>
                <div className="overflow-x-auto md:max-h-[60vh] md:overflow-y-auto">
                  <table className="text-xs table-fixed w-full" style={{minWidth: `${192 + DIST_COLS.length * 112 + 32}px`}}>
                    <colgroup>
                      <col className="w-48" />
                      {DIST_COLS.map(c => <col key={c.key} className="w-28" />)}
                      <col className="w-8" />
                    </colgroup>
                    <thead className="sticky top-0 z-10">
                      <tr style={{background:'var(--bg2)',borderBottom:'1px solid var(--border)'}}>
                        <th className="text-left px-3 py-2 font-medium sticky left-0 z-20" style={{color:'var(--t3)',background:'var(--bg2)',borderRight:'1px solid var(--border)'}}>GASTO/EGRESO</th>
                        {DIST_COLS.map(c => (
                          <th key={c.key} className="text-right px-3 py-2 font-medium whitespace-nowrap uppercase" style={{color:'var(--t3)'}}>{c.label}</th>
                        ))}
                        <th className="px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {distRows.map(row => (
                        <tr key={row.id} className="group/dist transition-colors" style={{borderBottom:'1px solid var(--border)'}}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg2)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                          <td className="sticky left-0 z-10 px-4 py-2 min-w-[192px]" style={{background:'inherit',borderRight:'1px solid var(--border)'}}>
                            {editingDistCell?.rowId === row.id && editingDistCell.field === 'gasto_egreso' ? (
                              <input autoFocus type="text"
                                className="w-full min-w-0 rounded-lg px-2 py-0.5 text-sm"
                                style={{border:'1px solid var(--accent)',background:'var(--surface)',color:'var(--t)',outline:'none'}}
                                value={editDistCellValue}
                                onChange={e => setEditDistCellValue(e.target.value)}
                                onBlur={() => commitDistCell(row.id, 'gasto_egreso', editDistCellValue)}
                                onKeyDown={e => { if (e.key === 'Enter') commitDistCell(row.id, 'gasto_egreso', editDistCellValue); if (e.key === 'Escape') setEditingDistCell(null) }}
                              />
                            ) : (
                              <span className={isSelectedMonthLocked ? '' : 'cursor-pointer font-medium'}
                                style={{color: isSelectedMonthLocked ? 'var(--t3)' : 'var(--t)'}}
                                onClick={() => { if (isSelectedMonthLocked) return; setEditingDistCell({ rowId: row.id, field: 'gasto_egreso' }); setEditDistCellValue(row.gasto_egreso) }}>
                                {row.gasto_egreso || <em className="font-normal" style={{color:'var(--t3)'}}>Sin nombre</em>}
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
                                  <span style={{color: effectiveVal > 0 ? 'var(--accent)' : 'var(--t3)',fontWeight:500}}>
                                    {effectiveVal > 0 ? effectiveVal.toLocaleString('es-PE', { minimumFractionDigits: 2 }) : '—'}
                                  </span>
                                ) : editingDistCell?.rowId === row.id && editingDistCell.field === c.key ? (
                                  <input autoFocus type="number" step="0.01"
                                    className="w-full min-w-0 rounded px-2 py-0.5 text-sm text-right font-medium"
                                    style={{border:'1px solid var(--accent)',background:'var(--surface)',color:'var(--t)',outline:'none'}}
                                    value={editDistCellValue}
                                    onChange={e => setEditDistCellValue(e.target.value)}
                                    onBlur={() => commitDistCell(row.id, c.key, editDistCellValue)}
                                    onKeyDown={e => { if (e.key === 'Enter') commitDistCell(row.id, c.key, editDistCellValue); if (e.key === 'Escape') setEditingDistCell(null) }}
                                  />
                                ) : (
                                  <span className={isSelectedMonthLocked ? '' : 'cursor-pointer'} style={{color: isSelectedMonthLocked ? 'var(--t3)' : effectiveVal > 0 ? 'var(--t)' : 'var(--t3)',fontWeight:500}}
                                    onClick={() => { if (isSelectedMonthLocked) return; setEditingDistCell({ rowId: row.id, field: c.key }); setEditDistCellValue(effectiveVal === 0 ? '' : effectiveVal.toString()) }}>
                                    {effectiveVal > 0 ? effectiveVal.toLocaleString('es-PE', { minimumFractionDigits: 2 }) : '—'}
                                  </span>
                                )}
                              </td>
                            )
                          })}
                          <td className="px-2 py-2">
                            <button onClick={() => { if (isSelectedMonthLocked) return; deleteDistRow(row) }}
                              className={`opacity-0 group-hover/dist:opacity-100 transition-opacity ${isSelectedMonthLocked ? 'hidden' : ''}`}
                              style={{color:'var(--t3)'}}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {/* Sobrante row */}
                      <tr style={{borderTop:'1px solid var(--border)',background:'color-mix(in oklch, var(--amber) 8%, transparent)'}}>
                        <td className="sticky left-0 z-10 px-4 py-2 font-medium text-xs" style={{background:'color-mix(in oklch, var(--amber) 8%, transparent)',borderRight:'1px solid var(--border)',color:'var(--amber)'}}>Sobrante</td>
                        {DIST_COLS.map(c => (
                          <td key={c.key} className="px-4 py-2 text-right">
                            {c.key === 'power' ? (
                              <span className="font-medium text-xs" style={{color: sobrante >= 0 ? 'var(--amber)' : 'var(--red)'}}>
                                {sobrante.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                              </span>
                            ) : <span style={{color:'var(--t3)'}}>—</span>}
                          </td>
                        ))}
                        <td />
                      </tr>
                      {/* Totals row */}
                      <tr style={{background:'var(--bg2)',borderTop:'2px solid var(--border)'}}>
                        <td className="sticky left-0 z-20 px-4 py-2 font-semibold uppercase text-xs tracking-wide" style={{background:'var(--bg2)',borderRight:'1px solid var(--border)',color:'var(--t2)'}}>TOTAL</td>
                        {destinos.map(d => (
                          <td key={d.key} className="px-4 py-2 text-right font-semibold text-xs" style={{color:'var(--t)'}}>
                            {d.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                          </td>
                        ))}
                        <td />
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2.5" style={{borderTop:'1px solid var(--border)'}}>
                  <button className={`inline-flex items-center gap-1.5 text-xs font-medium ${isSelectedMonthLocked ? 'hidden' : ''}`}
                    style={{color:'var(--accent)'}} onClick={addDistRow}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    Agregar fila
                  </button>
                </div>
              </div>
            </details>

            {/* Apply / lock buttons */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="text-xs leading-snug" style={{color:'var(--t3)'}}>
                Aplica los totales al mes <span className="font-medium" style={{color:'var(--t)'}}>{MONTH_NAMES[months.find(m => m.id === selectedMonthId)?.month ?? 0] ?? ''}</span> en Cuentas y Power
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {applyResult === 'success' && <span className="text-xs font-medium" style={{color:'var(--accent)'}}>✓ Aplicado</span>}
                {applyResult === 'error' && <span className="text-xs font-medium" style={{color:'var(--red)'}}>Error</span>}
                {(() => {
                  const selMo = months.find(m => m.id === selectedMonthId)
                  if (!selMo) return null
                  return selMo.locked ? (
                    <button onClick={() => unlockMonth(selMo.id)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white"
                      style={{background:'var(--amber)'}}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" /></svg>
                      Desbloquear
                    </button>
                  ) : (
                    <button onClick={() => lockMonth(selMo.id)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                      style={{background:'var(--bg2)',color:'var(--t2)',border:'1px solid var(--border)'}}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                      Bloquear
                    </button>
                  )
                })()}
                <button onClick={applyReparticion} disabled={applying || isSelectedMonthLocked}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold btn-primary transition-colors disabled:opacity-50">
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
        )
      })()}

    </div>
  )
}
