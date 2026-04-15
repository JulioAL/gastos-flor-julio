'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EXPENSE_COLUMNS, ACCOUNTS, MONTH_NAMES, POWER_COLS } from '@/lib/utils/accounts'
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

function detectFormValues(e: PersonalExpense): { clasificacion: Clasificacion; monto: string; hogar_cuenta: string; power_subcuenta: string } {
  if (isHogarPending(e)) return { clasificacion: 'hogar', monto: hogarPendingAmount(e).toString(), hogar_cuenta: '', power_subcuenta: '' }
  if ((e.julio ?? 0) > 0) return { clasificacion: 'personal', monto: e.julio!.toString(), hogar_cuenta: '', power_subcuenta: '' }
  if ((e.flor ?? 0) > 0) return { clasificacion: 'flor_me_debe', monto: e.flor!.toString(), hogar_cuenta: '', power_subcuenta: '' }
  for (const c of HOGAR_CUENTAS) {
    const val = (e[c.key as keyof PersonalExpense] as number | null) ?? 0
    if (val > 0) return { clasificacion: 'hogar', monto: val.toString(), hogar_cuenta: c.key, power_subcuenta: getPowerSubcuenta(e) }
  }
  return { clasificacion: '', monto: '', hogar_cuenta: '', power_subcuenta: '' }
}

function localDateStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const EMPTY_FORM = {
  date: localDateStr(),
  created_at_date: '',
  description: '',
  monto: '',
  clasificacion: '' as Clasificacion,
  hogar_cuenta: '',
  power_subcuenta: '',
}

export default function GastosClient({ initialExpenses, userId, isJulio }: Props) {
  const deudaLabel = isJulio ? 'Flor me debe' : 'Julio me debe'
  const supabase = createClient()
  const [expenses, setExpenses] = useState<PersonalExpense[]>(initialExpenses)
  const [filterMonth, setFilterMonth] = useState<number>(0)
  const [filterAccount, setFilterAccount] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('pendiente')
  const [filterRegDate, setFilterRegDate] = useState('')
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
    if (filterRegDate && e.created_at?.slice(0, 10) !== filterRegDate) return false
    if (search && !e.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const subtotal = filtered.reduce((s, e) => s + expenseTotal(e), 0)

  const totalPersonal    = filtered.filter(e => getClasificacion(e) === 'personal').reduce((s, e) => s + expenseTotal(e), 0)
  const totalFlorMeDebe  = filtered.filter(e => getClasificacion(e) === 'flor_me_debe').reduce((s, e) => s + expenseTotal(e), 0)
  const totalHogar       = filtered.filter(e => getClasificacion(e) === 'hogar' || getClasificacion(e) === 'hogar_sin_cuenta').reduce((s, e) => s + expenseTotal(e), 0)

  function openNew() {
    setEditExpense(null)
    setForm({ ...EMPTY_FORM, date: localDateStr() })
    setShowForm(true)
  }

  function openEdit(e: PersonalExpense) {
    setEditExpense(e)
    const detected = detectFormValues(e)
    setForm({
      date: e.date,
      created_at_date: e.created_at?.slice(0, 10) ?? '',
      description: e.description,
      ...detected,
    })
    setShowForm(true)
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && showForm) setShowForm(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [showForm])

  const canSave = !!form.description && !!form.monto && !!form.clasificacion

  async function save(andAnother = false) {
    setSaving(true)
    const amount = form.monto ? parseFloat(form.monto) : null

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
    }

    if (form.clasificacion === 'personal') {
      payload.julio = amount
    } else if (form.clasificacion === 'flor_me_debe') {
      payload.flor = amount
    } else if (form.clasificacion === 'hogar' && form.hogar_cuenta) {
      payload[form.hogar_cuenta] = amount
      const isPowerAccount = form.hogar_cuenta === 'power' || form.hogar_cuenta === 'otros_power'
      if (isPowerAccount && form.power_subcuenta) {
        payload.tab_name = `ps|${form.power_subcuenta}`
      }
    } else if (form.clasificacion === 'hogar' && !form.hogar_cuenta) {
      // Store amount in tab_name until account is assigned
      payload.tab_name = `hp|${amount}`
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
      setForm(EMPTY_FORM)
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
    <div className="space-y-4 pb-20 sm:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Mis Gastos</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setSelectMode(m => !m); setSelectedIds(new Set()) }}
            className={`text-sm px-4 py-2 rounded-lg border transition ${selectMode ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-400 text-indigo-700 dark:text-indigo-400' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            {selectMode ? 'Cancelar' : 'Seleccionar'}
          </button>
          {!selectMode && (
            <button onClick={openNew} className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
              + Agregar
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-2.5 py-1.5 text-sm" value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}>
          <option value={0}>Todos los meses</option>
          {months.map(m => <option key={m} value={m}>{MONTH_NAMES[m]}</option>)}
        </select>
        <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-2.5 py-1.5 text-sm" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">Todos</option>
          <option value="personal">Personal</option>
          <option value="flor_me_debe">{deudaLabel}</option>
          <option value="hogar">Hogar</option>
          <option value="sin_cuenta">Hogar sin cuenta</option>
          <option value="sin_clasificar">Sin clasificar</option>
          <option value="pendiente">Sin corte</option>
        </select>
        <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-2.5 py-1.5 text-sm" value={filterAccount} onChange={e => setFilterAccount(e.target.value)}>
          <option value="all">Todas las cuentas</option>
          {ACCOUNTS.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
        </select>
        <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-2.5 py-1.5 text-sm" value={filterRegDate} onChange={e => setFilterRegDate(e.target.value)}>
          <option value="">Fecha de registro</option>
          {regDates.map(d => (
            <option key={d} value={d}>
              {new Date(d + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Buscar..."
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-2.5 py-1.5 text-sm flex-1 min-w-28"
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
      <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl px-4 py-3 flex justify-between items-center gap-3">
        {selectMode ? (
          <button onClick={toggleSelectAll} className="flex items-center gap-2.5">
            <span className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${selectedIds.size === filtered.length && filtered.length > 0 ? 'bg-indigo-600 border-indigo-600' : 'border-indigo-400 bg-white dark:bg-gray-700'}`}>
              {selectedIds.size === filtered.length && filtered.length > 0 && (
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              )}
              {selectedIds.size > 0 && selectedIds.size < filtered.length && (
                <span className="w-2.5 h-0.5 bg-indigo-500 rounded"/>
              )}
            </span>
            <span className="text-sm text-indigo-700 dark:text-indigo-400 font-medium">
              {selectedIds.size > 0 ? `${selectedIds.size} seleccionados` : `Seleccionar todos (${filtered.length})`}
            </span>
          </button>
        ) : (
          <span className="text-sm text-indigo-700 dark:text-indigo-400 font-medium">{filtered.length} gastos</span>
        )}
        <span className="font-bold text-indigo-800 dark:text-indigo-400">S/ {subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
      </div>

      {/* Expense list */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
        {filtered.length === 0 ? (
          <p className="p-6 text-center text-gray-400 dark:text-gray-500 text-sm">Sin gastos para este filtro</p>
        ) : filtered.map(e => {
          const isSelected = selectedIds.has(e.id)
          const clas = getClasificacion(e)
          const clasStyle = CLAS_STYLES[clas]
          const hogarCuenta = clas === 'hogar'
            ? HOGAR_CUENTAS.find(c => ((e[c.key as keyof PersonalExpense] as number | null) ?? 0) > 0)
            : null
          const isPowerAccount = hogarCuenta && (hogarCuenta.key === 'power' || hogarCuenta.key === 'otros_power')
          const powerSub = isPowerAccount ? POWER_COLS.find(c => c.key === getPowerSubcuenta(e)) : null
          const powerSinSubcuenta = isPowerAccount && !powerSub
          return (
          <div
            key={e.id}
            className={`px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
            onClick={() => selectMode ? toggleSelect(e.id) : openEdit(e)}
          >
            {selectMode && (
              <span className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700'}`}>
                {isSelected && <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{e.description}</p>
              <div className="flex gap-2 mt-0.5 flex-wrap">
                <span className="text-xs text-gray-400 dark:text-gray-500" title="Fecha del gasto">{new Date(e.date + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</span>
                {e.created_at && (
                  <span className="text-xs text-gray-400 dark:text-gray-500" title="Fecha de registro">· reg. {new Date(e.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</span>
                )}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${clasStyle.bg} ${clasStyle.text}`}>
                  {clasStyle.label}
                </span>
                {hogarCuenta && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full">{hogarCuenta.label}</span>
                )}
                {powerSinSubcuenta && (
                  <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded-full">Power · sin columna</span>
                )}
                {powerSub && (
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded-full">{powerSub.label}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800 dark:text-gray-200 text-sm whitespace-nowrap">
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
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-5 py-3 rounded-2xl shadow-2xl">
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
          <button onClick={exitSelectMode} className="text-sm text-gray-300 dark:text-gray-600 hover:text-white dark:hover:text-gray-900 transition">Cancelar</button>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800 dark:text-gray-200">{editExpense ? 'Editar gasto' : 'Nuevo gasto'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Fecha</label>
                  <input type="date" className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                {editExpense && (
                  <div>
                    <label className="text-xs text-orange-500 dark:text-orange-400 font-medium">Fecha registro [TEST]</label>
                    <input type="date" className="mt-1 w-full border border-orange-300 dark:border-orange-600 rounded-lg px-3 py-2 text-sm" value={form.created_at_date} onChange={e => setForm(f => ({ ...f, created_at_date: e.target.value }))} />
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Descripción</label>
                <input type="text" className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" placeholder="Ej: Supermercado" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Monto (S/)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
                  value={form.monto}
                  onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Clasificación</label>
                <select
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  value={form.clasificacion}
                  onChange={e => setForm(f => ({ ...f, clasificacion: e.target.value as Clasificacion, hogar_cuenta: '' }))}
                >
                  <option value="">Seleccionar...</option>
                  <option value="personal">Gasto personal</option>
                  <option value="flor_me_debe">Gasto — {deudaLabel}</option>
                  <option value="hogar">Gasto hogar</option>
                </select>
              </div>
              {form.clasificacion === 'hogar' && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Cuenta <span className="text-gray-400 font-normal">(opcional — necesaria para el corte)</span>
                  </label>
                  <select
                    className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    value={form.hogar_cuenta}
                    onChange={e => setForm(f => ({ ...f, hogar_cuenta: e.target.value, power_subcuenta: '' }))}
                  >
                    <option value="">Sin asignar por ahora</option>
                    {HOGAR_CUENTAS.map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>
              )}
              {(form.hogar_cuenta === 'power' || form.hogar_cuenta === 'otros_power') && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Columna Power <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <select
                    className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    value={form.power_subcuenta}
                    onChange={e => setForm(f => ({ ...f, power_subcuenta: e.target.value }))}
                  >
                    <option value="">Sin especificar</option>
                    {POWER_COLS.map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-2 justify-end flex-wrap">
              <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 dark:text-gray-400 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancelar</button>
              {!editExpense && (
                <button onClick={() => save(true)} disabled={saving || !canSave} className="border border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 text-sm px-4 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-50 transition">
                  {saving ? '...' : 'Guardar y agregar otra'}
                </button>
              )}
              <button onClick={() => save(false)} disabled={saving || !canSave} className="bg-indigo-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
