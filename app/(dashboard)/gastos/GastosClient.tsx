'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EXPENSE_COLUMNS, ACCOUNTS, MONTH_NAMES, POWER_COLS, EXPENSE_CATEGORIES, detectExpenseTag, getCategoryMeta } from '@/lib/utils/accounts'
import type { PersonalExpense } from '@/lib/supabase/types'

interface Props {
  initialExpenses: PersonalExpense[]
  userId: string
  isJulio: boolean
}

const HOGAR_CUENTAS = [
  { key: 'casita',          label: 'Casita' },
  { key: 'flor_julio',      label: 'Flor y Julio' },
  { key: 'salidas',         label: 'Salidas' },
  { key: 'power',           label: 'Power' },
  { key: 'gasolina',        label: 'Gasolina' },
  { key: 'regalos',         label: 'Limpieza y Regalos' },
  { key: 'navidad',         label: 'Navidad' },
  { key: 'otros_power',     label: 'Otros (Power)' },
  { key: 'entretenimiento', label: 'Entretenimiento' },
] as const

type Clasificacion = '' | 'personal' | 'flor_me_debe' | 'hogar'

interface Split {
  id: string
  clasificacion: Clasificacion
  hogar_cuenta: string
  power_subcuenta: string
  monto: string
}

function makeSplit(): Split {
  return { id: Math.random().toString(36).slice(2), clasificacion: '', hogar_cuenta: '', power_subcuenta: '', monto: '' }
}

// Hogar sin cuenta: amount stored in tab_name as 'hp|{amount}'
function isHogarPending(e: PersonalExpense): boolean {
  return (e.tab_name ?? '').startsWith('hp|')
}
function hogarPendingAmount(e: PersonalExpense): number {
  return parseFloat((e.tab_name ?? '').slice(3)) || 0
}
// Power subcuenta stored in tab_name as 'ps|{col_key}'
function getPowerSubcuenta(e: PersonalExpense): string {
  const t = e.tab_name ?? ''
  return t.startsWith('ps|') ? t.slice(3) : ''
}

function getClasificacion(e: PersonalExpense): 'personal' | 'flor_me_debe' | 'hogar' | 'hogar_sin_cuenta' | 'sin_clasificar' {
  if (isHogarPending(e)) return 'hogar_sin_cuenta'
  if ((e.julio ?? 0) > 0) return 'personal'
  if ((e.flor ?? 0) > 0) return 'flor_me_debe'
  if (HOGAR_CUENTAS.some(c => ((e[c.key as keyof PersonalExpense] as number | null) ?? 0) > 0)) return 'hogar'
  return 'sin_clasificar'
}

function expenseTotal(e: PersonalExpense): number {
  if (isHogarPending(e)) return hogarPendingAmount(e)
  const allCols = ['casita', 'flor_julio', 'julio', 'flor', 'salidas', 'power', 'gasolina', 'regalos', 'navidad', 'otros_power', 'entretenimiento'] as const
  return allCols.reduce((s, k) => s + ((e[k] as number | null) ?? 0), 0)
}

function detectSplits(e: PersonalExpense): Split[] {
  if (isHogarPending(e)) {
    return [{ id: 'hp', clasificacion: 'hogar', hogar_cuenta: '', power_subcuenta: '', monto: hogarPendingAmount(e).toString() }]
  }
  const splits: Split[] = []
  if ((e.julio ?? 0) > 0) splits.push({ id: 'julio', clasificacion: 'personal', hogar_cuenta: '', power_subcuenta: '', monto: e.julio!.toString() })
  if ((e.flor ?? 0) > 0) splits.push({ id: 'flor', clasificacion: 'flor_me_debe', hogar_cuenta: '', power_subcuenta: '', monto: e.flor!.toString() })
  for (const c of HOGAR_CUENTAS) {
    const val = (e[c.key as keyof PersonalExpense] as number | null) ?? 0
    if (val > 0) {
      const isPower = c.key === 'power' || c.key === 'otros_power'
      splits.push({ id: c.key, clasificacion: 'hogar', hogar_cuenta: c.key, power_subcuenta: isPower ? getPowerSubcuenta(e) : '', monto: val.toString() })
    }
  }
  return splits.length > 0 ? splits : [makeSplit()]
}

function localDateStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const EMPTY_FORM = {
  date: localDateStr(),
  created_at_date: '',
  description: '',
  totalMonto: '',
  splits: [makeSplit()] as Split[],
  category: '',
  subcategory: '',
  accountType: 'credito' as 'credito' | 'debito',
}

export default function GastosClient({ initialExpenses, userId, isJulio }: Props) {
  const deudaLabel = isJulio ? 'Flor me debe' : 'Julio me debe'
  const supabase = createClient()
  const [expenses, setExpenses] = useState<PersonalExpense[]>(initialExpenses)
  const [filterMonth, setFilterMonth] = useState<number>(0)
  const [filterAccount, setFilterAccount] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('pendiente')
  const [filterAccountType, setFilterAccountType] = useState<string>('all')
  const [filterRegDate, setFilterRegDate] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editExpense, setEditExpense] = useState<PersonalExpense | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const filtered = expenses.filter(e => {
    const month = new Date(e.date + 'T00:00:00').getMonth() + 1
    if (filterMonth && month !== filterMonth) return false
    if (filterAccount !== 'all') {
      const cols = EXPENSE_COLUMNS.filter(c => c.account === filterAccount)
      if (cols.length === 0 || cols.every(c => !(e[c.key as keyof PersonalExpense]))) return false
    }
    const clas = getClasificacion(e)
    if (filterType === 'personal' && clas !== 'personal') return false
    if (filterType === 'flor_me_debe' && clas !== 'flor_me_debe') return false
    if (filterType === 'hogar' && clas !== 'hogar' && clas !== 'hogar_sin_cuenta') return false
    if (filterType === 'sin_clasificar' && clas !== 'sin_clasificar') return false
    if (filterType === 'sin_cuenta' && clas !== 'hogar_sin_cuenta') return false
    if (filterType === 'pendiente' && e.corte_id !== null) return false
    if (filterType === 'email' && !e.source) return false
    if (filterRegDate && e.created_at?.slice(0, 10) !== filterRegDate) return false
    if (filterCategory !== 'all' && e.category !== filterCategory) return false
    if (filterAccountType !== 'all' && (e.account_type ?? 'credito') !== filterAccountType) return false
    if (search && !e.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const subtotal = filtered.reduce((s, e) => s + expenseTotal(e), 0)

  const totalPersonal   = filtered.reduce((s, e) => s + ((e.julio as number | null) ?? 0), 0)
  const totalFlorMeDebe = filtered.reduce((s, e) => s + ((e.flor as number | null) ?? 0), 0)
  const totalHogar      = filtered.reduce((s, e) => {
    const hogarCols = HOGAR_CUENTAS.reduce((hs, c) => hs + ((e[c.key as keyof PersonalExpense] as number | null) ?? 0), 0)
    return s + hogarCols + (isHogarPending(e) ? hogarPendingAmount(e) : 0)
  }, 0)

  function openNew() {
    setEditExpense(null)
    setForm({ ...EMPTY_FORM, date: localDateStr(), splits: [makeSplit()] })
    setShowForm(true)
  }

  function openEdit(e: PersonalExpense) {
    setEditExpense(e)
    const splits = detectSplits(e)
    const total = splits.reduce((s, sp) => s + (parseFloat(sp.monto) || 0), 0)
    setForm({
      date: e.date,
      created_at_date: e.created_at?.slice(0, 10) ?? '',
      description: e.description,
      totalMonto: total > 0 ? total.toString() : '',
      splits,
      category: e.category ?? '',
      subcategory: e.subcategory ?? '',
      accountType: (e.account_type ?? 'credito') as 'credito' | 'debito',
    })
    setShowForm(true)
  }


  const splitSum = form.splits.reduce((s, sp) => s + (parseFloat(sp.monto) || 0), 0)
  const totalNum = parseFloat(form.totalMonto) || 0
  const canSave = !!form.description &&
    totalNum > 0 &&
    form.splits.length > 0 &&
    form.splits.every(sp => !!sp.clasificacion) &&
    Math.abs(totalNum - splitSum) < 0.01

  async function save(andAnother = false) {
    setSaving(true)

    const payload: Record<string, unknown> = {
      date: form.date,
      description: form.description,
      user_id: userId,
      year: 2026,
      casita: null,
      flor_julio: null,
      julio: null,
      flor: null,
      salidas: null,
      power: null,
      gasolina: null,
      regalos: null,
      navidad: null,
      otros_power: null,
      entretenimiento: null,
      tab_name: null,
      category: form.category || null,
      subcategory: form.subcategory || null,
      account_type: form.accountType,
    }

    let hogarPendingAmt = 0
    let powerSubcuenta = ''

    for (const split of form.splits) {
      const amount = parseFloat(split.monto) || 0
      if (split.clasificacion === 'personal') {
        payload.julio = amount
      } else if (split.clasificacion === 'flor_me_debe') {
        payload.flor = amount
      } else if (split.clasificacion === 'hogar') {
        if (!split.hogar_cuenta) {
          hogarPendingAmt += amount
        } else {
          payload[split.hogar_cuenta] = amount
          if ((split.hogar_cuenta === 'power' || split.hogar_cuenta === 'otros_power') && split.power_subcuenta) {
            powerSubcuenta = split.power_subcuenta
          }
        }
      }
    }

    if (hogarPendingAmt > 0) {
      payload.tab_name = `hp|${hogarPendingAmt}`
    } else if (powerSubcuenta) {
      payload.tab_name = `ps|${powerSubcuenta}`
    }

    if (editExpense && form.created_at_date) {
      payload.created_at = form.created_at_date + 'T12:00:00.000Z'
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase.from('personal_expenses') as any
    if (editExpense) {
      const { data } = await client.update(payload).eq('id', editExpense.id).select().single()
      if (data) setExpenses((prev: PersonalExpense[]) => prev.map(e => e.id === data.id ? data : e))
    } else {
      const { data } = await client.insert(payload).select().single()
      if (data) setExpenses((prev: PersonalExpense[]) => [data, ...prev])
    }

    setSaving(false)
    if (andAnother) {
      setEditExpense(null)
      setForm({ ...EMPTY_FORM, date: form.date, splits: [makeSplit()], category: '', subcategory: '' })
    } else {
      setShowForm(false)
    }
  }

  async function deleteExpense(id: string) {
    if (!confirm('¿Eliminar este gasto?')) return
    await supabase.from('personal_expenses').delete().eq('id', id)
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(e => e.id)))
    }
  }

  function exitSelectMode() {
    setSelectMode(false)
    setSelectedIds(new Set())
  }

  async function bulkDelete() {
    if (!confirm(`¿Eliminar ${selectedIds.size} gasto${selectedIds.size !== 1 ? 's' : ''}? Esta acción no se puede deshacer.`)) return
    setBulkDeleting(true)
    const ids = Array.from(selectedIds)
    await supabase.from('personal_expenses').delete().in('id', ids)
    setExpenses(prev => prev.filter(e => !selectedIds.has(e.id)))
    setSelectedIds(new Set())
    setBulkDeleting(false)
  }

  const currentMonth = new Date().getMonth() + 1
  const months = Array.from(new Set([currentMonth, ...expenses.map(e => new Date(e.date + 'T00:00:00').getMonth() + 1)])).sort()
  const regDates = Array.from(new Set(expenses.map(e => e.created_at?.slice(0, 10)).filter(Boolean) as string[])).sort().reverse()

  const CLAS_STYLES = {
    personal:         { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300', label: 'Personal' },
    flor_me_debe:     { bg: 'bg-pink-100 dark:bg-pink-900/40',     text: 'text-pink-700 dark:text-pink-300',     label: deudaLabel },
    hogar:            { bg: 'bg-blue-100 dark:bg-blue-900/40',      text: 'text-blue-700 dark:text-blue-300',     label: 'Hogar' },
    hogar_sin_cuenta: { bg: 'bg-orange-100 dark:bg-orange-900/40',  text: 'text-orange-700 dark:text-orange-300', label: 'Hogar · sin cuenta' },
    sin_clasificar:   { bg: 'bg-red-100 dark:bg-red-900/40',        text: 'text-red-700 dark:text-red-300',       label: 'Sin clasificar' },
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Mis Gastos</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setSelectMode(m => !m); setSelectedIds(new Set()) }}
            className={`text-sm px-4 py-2 rounded-lg border transition ${selectMode ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 text-emerald-700 dark:text-emerald-400' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            {selectMode ? 'Cancelar' : 'Seleccionar'}
          </button>
          {!selectMode && (
            <button onClick={openNew} className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
              + Agregar
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select className="border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-sm" value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}>
          <option value={0}>Todos los meses</option>
          {months.map(m => <option key={m} value={m}>{MONTH_NAMES[m]}</option>)}
        </select>
        <select className="border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-sm" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">Todos</option>
          <option value="personal">Personal</option>
          <option value="flor_me_debe">{deudaLabel}</option>
          <option value="hogar">Hogar</option>
          <option value="sin_cuenta">Hogar sin cuenta</option>
          <option value="sin_clasificar">Sin clasificar</option>
          <option value="pendiente">Sin corte</option>
          <option value="email">Importados (correo)</option>
        </select>
        <select className="border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-sm" value={filterAccount} onChange={e => setFilterAccount(e.target.value)}>
          <option value="all">Todas las cuentas</option>
          {ACCOUNTS.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
        </select>
        <select className="border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-sm" value={filterRegDate} onChange={e => setFilterRegDate(e.target.value)}>
          <option value="">Fecha de registro</option>
          {regDates.map(d => (
            <option key={d} value={d}>
              {new Date(d + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
            </option>
          ))}
        </select>
        <select className="border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-sm" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="all">Todas las categorías</option>
          {EXPENSE_CATEGORIES.map(cat => (
            <option key={cat.key} value={cat.key}>{cat.label}</option>
          ))}
        </select>
        <select className="border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-sm" value={filterAccountType} onChange={e => setFilterAccountType(e.target.value)}>
          <option value="all">Crédito y débito</option>
          <option value="credito">Crédito</option>
          <option value="debito">Débito</option>
        </select>
        <input
          type="text"
          placeholder="Buscar..."
          className="border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-sm flex-1 min-w-28"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Summary cards — only show categories with data */}
      {(totalPersonal > 0 || totalFlorMeDebe > 0 || totalHogar > 0) && (
        <div className={`grid gap-3 ${[totalPersonal, totalFlorMeDebe, totalHogar].filter(v => v > 0).length === 1 ? 'grid-cols-1' : [totalPersonal, totalFlorMeDebe, totalHogar].filter(v => v > 0).length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {totalPersonal > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl px-4 py-3">
              <p className="text-xs text-purple-500 dark:text-purple-400 font-medium mb-1">Personal</p>
              <p className="text-base font-bold text-purple-800 dark:text-purple-300">
                S/ {totalPersonal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
          {totalFlorMeDebe > 0 && (
            <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl px-4 py-3">
              <p className="text-xs text-pink-500 dark:text-pink-400 font-medium mb-1">{deudaLabel}</p>
              <p className="text-base font-bold text-pink-800 dark:text-pink-300">
                S/ {totalFlorMeDebe.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
          {totalHogar > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3">
              <p className="text-xs text-blue-500 dark:text-blue-400 font-medium mb-1">Hogar</p>
              <p className="text-base font-bold text-blue-800 dark:text-blue-300">
                S/ {totalHogar.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Subtotal / select-all bar */}
      <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl px-4 py-3 flex justify-between items-center gap-3">
        {selectMode ? (
          <button onClick={toggleSelectAll} className="flex items-center gap-2.5">
            <span className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${selectedIds.size === filtered.length && filtered.length > 0 ? 'bg-emerald-600 border-emerald-600' : 'border-emerald-400 bg-white dark:bg-slate-700'}`}>
              {selectedIds.size === filtered.length && filtered.length > 0 && (
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              )}
              {selectedIds.size > 0 && selectedIds.size < filtered.length && (
                <span className="w-2.5 h-0.5 bg-emerald-500 rounded"/>
              )}
            </span>
            <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
              {selectedIds.size > 0 ? `${selectedIds.size} seleccionados` : `Seleccionar todos (${filtered.length})`}
            </span>
          </button>
        ) : (
          <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">{filtered.length} gastos</span>
        )}
        <span className="font-bold text-emerald-800 dark:text-emerald-400">S/ {subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
      </div>

      {/* Expense list */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
        {filtered.length === 0 ? (
          <p className="p-6 text-center text-slate-400 dark:text-slate-500 text-sm">Sin gastos para este filtro</p>
        ) : filtered.map(e => {
          const isSelected = selectedIds.has(e.id)
          const splits = detectSplits(e)
          const isMulti = splits.length > 1
          return (
          <div
            key={e.id}
            className={`px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition ${isSelected ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
            onClick={() => selectMode ? toggleSelect(e.id) : openEdit(e)}
          >
            {selectMode && (
              <span className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700'}`}>
                {isSelected && <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{e.description}</p>
              <div className="flex gap-1.5 mt-0.5 flex-wrap items-center">
                <span className="text-xs text-slate-400 dark:text-slate-500">{new Date(e.date + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${(e.account_type ?? 'credito') === 'credito' ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-700' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700'}`}>
                  {(e.account_type ?? 'credito') === 'credito' ? 'Crédito' : 'Débito'}
                </span>
                {e.source && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-700">
                    {e.source === 'bcp' ? 'BCP' : 'Scotiabank'}
                  </span>
                )}
                {e.created_at && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">· reg. {new Date(e.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</span>
                )}
                {(e.category || e.subcategory) && (() => {
                  const catMeta = getCategoryMeta(e.category ?? '')
                  const subLabel = catMeta?.subcategories.find(s => s.key === e.subcategory)?.label
                  const label = subLabel ?? catMeta?.label ?? e.category
                  return (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-700">
                      {label}
                    </span>
                  )
                })()}
                {splits.map(sp => {
                  const amt = parseFloat(sp.monto)
                  const amtLabel = isMulti && amt > 0 ? ` · S/ ${amt.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : ''
                  if (sp.clasificacion === 'personal') {
                    return (
                      <span key={sp.id} className={`text-xs px-1.5 py-0.5 rounded-full ${CLAS_STYLES.personal.bg} ${CLAS_STYLES.personal.text}`}>
                        {CLAS_STYLES.personal.label}{amtLabel}
                      </span>
                    )
                  }
                  if (sp.clasificacion === 'flor_me_debe') {
                    return (
                      <span key={sp.id} className={`text-xs px-1.5 py-0.5 rounded-full ${CLAS_STYLES.flor_me_debe.bg} ${CLAS_STYLES.flor_me_debe.text}`}>
                        {CLAS_STYLES.flor_me_debe.label}{amtLabel}
                      </span>
                    )
                  }
                  if (sp.clasificacion === 'hogar') {
                    if (!sp.hogar_cuenta) {
                      return (
                        <span key={sp.id} className={`text-xs px-1.5 py-0.5 rounded-full ${CLAS_STYLES.hogar_sin_cuenta.bg} ${CLAS_STYLES.hogar_sin_cuenta.text}`}>
                          Hogar · sin cuenta{amtLabel}
                        </span>
                      )
                    }
                    const cuentaLabel = HOGAR_CUENTAS.find(c => c.key === sp.hogar_cuenta)?.label ?? sp.hogar_cuenta
                    const isPower = sp.hogar_cuenta === 'power' || sp.hogar_cuenta === 'otros_power'
                    const powerSub = isPower && sp.power_subcuenta ? POWER_COLS.find(c => c.key === sp.power_subcuenta) : null
                    const powerSinSub = isPower && !sp.power_subcuenta
                    return (
                      <span key={sp.id} className={`text-xs px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 ${powerSinSub ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        {cuentaLabel}
                        {powerSinSub && ' · sin columna'}
                        {powerSub && <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 px-1 rounded-full"> — {powerSub.label}</span>}
                        {amtLabel}
                      </span>
                    )
                  }
                  return null
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm whitespace-nowrap">
                S/ {expenseTotal(e).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
              {!selectMode && (
                <button onClick={ev => { ev.stopPropagation(); deleteExpense(e.id) }} className="text-red-400 hover:text-red-600 text-xs p-1">✕</button>
              )}
            </div>
          </div>
          )
        })}
      </div>

      {/* Bulk delete floating bar */}
      {selectMode && selectedIds.size > 0 && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl">
          <span className="text-sm font-medium">{selectedIds.size} seleccionados</span>
          <button
            onClick={bulkDelete}
            disabled={bulkDeleting}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-1.5 rounded-xl transition disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            {bulkDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
          <button onClick={exitSelectMode} className="text-sm text-slate-300 dark:text-slate-600 hover:text-white dark:hover:text-slate-900 transition">Cancelar</button>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <ModalForm
          editExpense={editExpense}
          form={form}
          setForm={setForm}
          saving={saving}
          canSave={canSave}
          totalNum={totalNum}
          splitSum={splitSum}
          deudaLabel={deudaLabel}
          onClose={() => setShowForm(false)}
          onSave={save}
        />
      )}
    </div>
  )
}

// ─── Modal separado para mantener el componente principal limpio ───────────────

interface ModalFormProps {
  editExpense: PersonalExpense | null
  form: typeof EMPTY_FORM & { splits: Split[] }
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM & { splits: Split[] }>>
  saving: boolean
  canSave: boolean
  totalNum: number
  splitSum: number
  deudaLabel: string
  onClose: () => void
  onSave: (andAnother?: boolean) => void
}

const CLAS_OPTIONS = [
  { value: 'personal',      label: 'Personal',    active: 'bg-purple-600 text-white', inactive: 'border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20' },
  { value: 'flor_me_debe',  label: null,           active: 'bg-pink-500 text-white',   inactive: 'border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20' },
  { value: 'hogar',         label: 'Hogar',        active: 'bg-blue-600 text-white',   inactive: 'border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20' },
] as const

function ModalForm({ editExpense, form, setForm, saving, canSave, totalNum, splitSum, deudaLabel, onClose, onSave }: ModalFormProps) {
  const descRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => descRef.current?.focus(), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const clasOptions = CLAS_OPTIONS.map(o => ({ ...o, label: o.value === 'flor_me_debe' ? deudaLabel : o.label! }))

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">{editExpense ? 'Editar gasto' : 'Nuevo gasto'}</h2>
          <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">✕</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Fecha + tipo de cuenta */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Fecha</label>
              <input type="date" className="mt-1 w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            {editExpense && (
              <div>
                <label className="text-xs text-orange-500 dark:text-orange-400 font-medium">Fecha registro [TEST]</label>
                <input type="date" className="mt-1 w-full border border-orange-300 dark:border-orange-600 rounded-lg px-3 py-2 text-sm" value={form.created_at_date} onChange={e => setForm(f => ({ ...f, created_at_date: e.target.value }))} />
              </div>
            )}
          </div>

          {/* Toggle crédito / débito */}
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tipo de cuenta</label>
            <div className="mt-1.5 inline-flex rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
              {(['credito', 'debito'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, accountType: type }))}
                  className={`px-4 py-1.5 text-sm font-medium transition ${form.accountType === type ? 'bg-emerald-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  {type === 'credito' ? 'Crédito' : 'Débito'}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Descripción</label>
            <input
              ref={descRef}
              type="text"
              className="mt-1 w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
              placeholder="Ej: Supermercado"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              onBlur={e => {
                if (!form.category && e.target.value.trim()) {
                  const detected = detectExpenseTag(e.target.value)
                  if (detected) setForm(f => ({ ...f, ...detected }))
                }
              }}
            />
          </div>

          {/* Categoría */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Categoría</label>
              {(form.category || form.subcategory) && (
                <button type="button" onClick={() => setForm(f => ({ ...f, category: '', subcategory: '' }))} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  Limpiar
                </button>
              )}
            </div>
            <div className="mt-1 flex gap-2">
              <select className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value, subcategory: '' }))}>
                <option value="">Sin categoría</option>
                {EXPENSE_CATEGORIES.map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
              </select>
              {form.category && (
                <select className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800" value={form.subcategory} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}>
                  <option value="">Subcategoría...</option>
                  {(getCategoryMeta(form.category)?.subcategories ?? []).map(sub => <option key={sub.key} value={sub.key}>{sub.label}</option>)}
                </select>
              )}
            </div>
          </div>

          {/* Monto total */}
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monto total (S/)</label>
            <div className="mt-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">S/</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg pl-8 pr-3 py-2 text-sm"
                value={form.totalMonto}
                onChange={e => {
                  const val = e.target.value
                  setForm(f => ({
                    ...f,
                    totalMonto: val,
                    splits: f.splits.length === 1 ? [{ ...f.splits[0], monto: val }] : f.splits,
                  }))
                }}
              />
            </div>
          </div>

          {/* Splits */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">División del gasto</label>
              {form.splits.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const total = parseFloat(form.totalMonto) || 0
                    if (total === 0) return
                    const n = form.splits.length
                    const each = Math.floor((total / n) * 100) / 100
                    const last = Math.round((total - each * (n - 1)) * 100) / 100
                    setForm(f => ({ ...f, splits: f.splits.map((sp, i) => ({ ...sp, monto: (i < n - 1 ? each : last).toString() })) }))
                  }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Dividir equitativamente
                </button>
              )}
            </div>

            <div className="space-y-2">
              {form.splits.map((split, idx) => {
                const total = parseFloat(form.totalMonto) || 0
                const splitNum = parseFloat(split.monto) || 0
                const pct = total > 0 ? ((splitNum / total) * 100).toFixed(1) : ''
                const isMultiSplit = form.splits.length > 1
                return (
                  <div key={split.id} className="border border-slate-200 dark:border-slate-600 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        {isMultiSplit ? `Parte ${idx + 1}` : 'Clasificación'}
                      </span>
                      {isMultiSplit && (
                        <button type="button" onClick={() => setForm(f => ({ ...f, splits: f.splits.filter((_, i) => i !== idx) }))} className="text-red-400 hover:text-red-600 text-xs leading-none">✕</button>
                      )}
                    </div>

                    {/* Clasificación como pills */}
                    <div className="flex gap-1.5 flex-wrap">
                      {clasOptions.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm(f => ({
                            ...f,
                            splits: f.splits.map((sp, i) => i === idx
                              ? { ...sp, clasificacion: opt.value as Clasificacion, hogar_cuenta: '', power_subcuenta: '', monto: idx === 0 && !isMultiSplit ? f.totalMonto : sp.monto }
                              : sp)
                          }))}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition ${split.clasificacion === opt.value ? opt.active : `bg-transparent border ${opt.inactive}`}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {split.clasificacion === 'hogar' && (
                      <select
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800"
                        value={split.hogar_cuenta}
                        onChange={e => setForm(f => ({ ...f, splits: f.splits.map((sp, i) => i === idx ? { ...sp, hogar_cuenta: e.target.value, power_subcuenta: '' } : sp) }))}
                      >
                        <option value="">Sin cuenta asignada</option>
                        {HOGAR_CUENTAS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                      </select>
                    )}

                    {(split.hogar_cuenta === 'power' || split.hogar_cuenta === 'otros_power') && (
                      <select
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800"
                        value={split.power_subcuenta}
                        onChange={e => setForm(f => ({ ...f, splits: f.splits.map((sp, i) => i === idx ? { ...sp, power_subcuenta: e.target.value } : sp) }))}
                      >
                        <option value="">Sin especificar</option>
                        {POWER_COLS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                      </select>
                    )}

                    {/* Monto (+ % solo si hay múltiples splits) */}
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">S/</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full border border-slate-300 dark:border-slate-600 rounded-lg pl-8 pr-3 py-2 text-sm"
                          value={split.monto}
                          onChange={e => setForm(f => ({ ...f, splits: f.splits.map((sp, i) => i === idx ? { ...sp, monto: e.target.value } : sp) }))}
                        />
                      </div>
                      {isMultiSplit && (
                        <div className="w-20 relative">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            placeholder="0"
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg pl-3 pr-6 py-2 text-sm"
                            value={pct}
                            onChange={e => {
                              const pctVal = parseFloat(e.target.value) || 0
                              const t = parseFloat(form.totalMonto) || 0
                              setForm(f => ({ ...f, splits: f.splits.map((sp, i) => i === idx ? { ...sp, monto: t > 0 ? (pctVal * t / 100).toFixed(2) : '' } : sp) }))
                            }}
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {totalNum > 0 && form.splits.length > 1 && (
              <p className={`mt-1.5 text-xs font-medium ${Math.abs(totalNum - splitSum) < 0.01 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {Math.abs(totalNum - splitSum) < 0.01 ? '✓ Suma correcta' : `Restante: S/ ${(totalNum - splitSum).toFixed(2)}`}
              </p>
            )}

            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, splits: [...f.splits, makeSplit()] }))}
              className="mt-2 w-full border border-dashed border-slate-300 dark:border-slate-600 rounded-xl py-2 text-sm text-slate-500 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              + Agregar parte
            </button>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700 flex gap-2 justify-end flex-wrap">
          <button onClick={onClose} className="text-sm text-slate-500 dark:text-slate-400 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancelar</button>
          {!editExpense && (
            <button onClick={() => onSave(true)} disabled={saving || !canSave} className="border border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 text-sm px-4 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 disabled:opacity-50 transition">
              {saving ? '...' : 'Guardar y agregar otra'}
            </button>
          )}
          <button onClick={() => onSave(false)} disabled={saving || !canSave} className="bg-emerald-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
