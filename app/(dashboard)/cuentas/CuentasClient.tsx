'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MONTH_NAMES, ACCOUNTS } from '@/lib/utils/accounts'
import type { BudgetMonth, BudgetExpense } from '@/lib/supabase/types'

interface Props {
  months: BudgetMonth[]
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

export default function CuentasClient({ months, powerTotal }: Props) {
  const supabase = createClient()
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
    const monthIds = getDisplayMonths(months, selectedMonthId).filter((m): m is BudgetMonth => m != null).map(m => m.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase.from('budget_expenses') as any)
      .select('*')
      .in('budget_month_id', monthIds)
      .eq('account', 'deuda')
      .then(({ data }: { data: { id: string; budget_month_id: string; category: string; amount: number | null }[] | null }) => {
        const byMonth: GastosByMonth = {}
        const selectedLabels = new Set<string>()
        for (const entry of data ?? []) {
          if (!byMonth[entry.budget_month_id]) byMonth[entry.budget_month_id] = {}
          byMonth[entry.budget_month_id][entry.category] = { id: entry.id, amount: entry.amount ?? 0 }
          if (entry.budget_month_id === selectedMonthId) selectedLabels.add(entry.category)
        }
        const ordered = selectedLabels.size === 0
          ? [...DEUDAS_DEFAULT_LABELS]
          : [
              ...DEUDAS_DEFAULT_LABELS.filter(l => selectedLabels.has(l)),
              ...[...selectedLabels].filter(l => !DEUDAS_DEFAULT_LABELS.includes(l)),
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
        <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm" value={selectedMonthId} onChange={e => setSelectedMonthId(e.target.value)}>
          {months.map(m => <option key={m.id} value={m.id}>{MONTH_NAMES[m.month]} 2026</option>)}
        </select>
      </div>

      {loading ? <p className="text-gray-400 dark:text-gray-500 text-sm">Cargando...</p> : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Resumen por cuenta Scotiabank</h2>
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
                      className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      onClick={() => { setEditingAccountKey(acc.key); setEditAccountValue(amt.toString()) }}
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
                                  <span className="relative flex-shrink-0 cursor-help text-amber-400 hover:text-amber-500" onClick={() => { setEditingComment({ monthId: m.id, source: key }); setEditCommentValue(entry?.description ?? '') }}>
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
                                    onClick={() => { setEditingComment({ monthId: m.id, source: key }); setEditCommentValue('') }}
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
                                  className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium text-gray-800 dark:text-gray-200"
                                  onClick={() => {
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
                                  className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium text-gray-800 dark:text-gray-200"
                                  onClick={() => {
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
                                  className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium text-gray-800 dark:text-gray-200"
                                  onClick={() => {
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

    </div>
  )
}
