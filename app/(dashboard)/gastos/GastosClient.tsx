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
  const [modalKey, setModalKey] = useState(0)
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
      setModalKey(k => k + 1)
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
      if (next.has(id)) next.delete(id); else next.add(id)
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

  const CAT_COLORS: Record<string, string> = {
    hogar: '#6366f1', alimentacion: '#10b981', transporte: '#f59e0b',
    trabajo: '#6366f1', finanzas: '#f43f5e', compras: '#8b5cf6',
    entretenimiento: '#ec4899', salud: '#14b8a6', educacion: '#06b6d4',
    viajes: '#0ea5e9', familia: '#fb923c', otros: '#94a3b8',
  }


  return (
    <div className="space-y-4 pb-32 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: 'var(--t)' }}>Mis Gastos</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSelectMode(m => !m); setSelectedIds(new Set()) }}
            className="text-sm px-3 py-1.5 rounded-xl border transition"
            style={selectMode
              ? { background: 'var(--asoft)', borderColor: 'var(--accent)', color: 'var(--atext)' }
              : { borderColor: 'var(--border)', color: 'var(--t2)', background: 'var(--surface)' }
            }
          >
            {selectMode ? 'Cancelar' : 'Seleccionar'}
          </button>
          <select
            className="rounded-xl px-3 py-1.5 text-sm"
            style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--t)' }}
            value={filterMonth}
            onChange={e => setFilterMonth(Number(e.target.value))}
          >
            <option value={0}>Todos los meses</option>
            {months.map(m => <option key={m} value={m}>{MONTH_NAMES[m]}</option>)}
          </select>
        </div>
      </div>

      {/* Filter type pills */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {([
          { id: 'pendiente',    label: 'Pendientes' },
          { id: 'all',          label: 'Todos' },
          { id: 'personal',     label: 'Personal' },
          { id: 'flor_me_debe', label: deudaLabel },
          { id: 'hogar',        label: 'Hogar' },
          { id: 'sin_cuenta',   label: 'Sin cuenta' },
          { id: 'sin_clasificar', label: 'Sin clasificar' },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setFilterType(t.id)}
            className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all flex-shrink-0"
            style={filterType === t.id
              ? { background: 'var(--accent)', color: '#fff', borderColor: 'transparent' }
              : { borderColor: 'var(--border)', color: 'var(--t2)', background: 'var(--surface)' }}
          >{t.label}</button>
        ))}
      </div>

      {/* Search with icon */}
      <div style={{ position: 'relative' }}>
        <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Buscar gastos…"
          className="w-full rounded-xl py-2.5 text-sm"
          style={{ paddingLeft: 40, paddingRight: 16, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--t)', outline: 'none' }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Advanced filters */}
      <div className="flex flex-wrap gap-2">
        <select className="rounded-xl px-2.5 py-1.5 text-sm" style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--t)' }} value={filterAccount} onChange={e => setFilterAccount(e.target.value)}>
          <option value="all">Todas las cuentas</option>
          {ACCOUNTS.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
        </select>
        <select className="rounded-xl px-2.5 py-1.5 text-sm" style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--t)' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="all">Todas las categorías</option>
          {EXPENSE_CATEGORIES.map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
        </select>
        <select className="rounded-xl px-2.5 py-1.5 text-sm" style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--t)' }} value={filterAccountType} onChange={e => setFilterAccountType(e.target.value)}>
          <option value="all">Crédito y débito</option>
          <option value="credito">Crédito</option>
          <option value="debito">Débito</option>
        </select>
        <select className="rounded-xl px-2.5 py-1.5 text-sm" style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--t)' }} value={filterRegDate} onChange={e => setFilterRegDate(e.target.value)}>
          <option value="">Fecha de registro</option>
          {regDates.map(d => (
            <option key={d} value={d}>
              {new Date(d + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
            </option>
          ))}
        </select>
      </div>

      {/* Summary pills — horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="flex-shrink-0 rounded-2xl px-4 py-3" style={{ background: 'var(--asoft)', minWidth: 130 }}>
          <p className="text-xs font-medium" style={{ color: 'var(--atext)' }}>Total · {filtered.length}</p>
          <p className="font-mono font-bold text-base" style={{ color: 'var(--atext)' }}>S/ {subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
        </div>
        {totalPersonal > 0 && (
          <div className="flex-shrink-0 rounded-2xl px-4 py-3" style={{ background: '#8b5cf622', minWidth: 130 }}>
            <p className="text-xs font-medium" style={{ color: '#7c3aed' }}>Personal</p>
            <p className="font-mono font-bold text-base" style={{ color: '#7c3aed' }}>S/ {totalPersonal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
          </div>
        )}
        {totalFlorMeDebe > 0 && (
          <div className="flex-shrink-0 rounded-2xl px-4 py-3" style={{ background: '#ec489922', minWidth: 130 }}>
            <p className="text-xs font-medium" style={{ color: '#be185d' }}>{deudaLabel}</p>
            <p className="font-mono font-bold text-base" style={{ color: '#be185d' }}>S/ {totalFlorMeDebe.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
          </div>
        )}
        {totalHogar > 0 && (
          <div className="flex-shrink-0 rounded-2xl px-4 py-3" style={{ background: 'var(--asoft)', minWidth: 130 }}>
            <p className="text-xs font-medium" style={{ color: 'var(--atext)' }}>Hogar</p>
            <p className="font-mono font-bold text-base" style={{ color: 'var(--atext)' }}>S/ {totalHogar.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
          </div>
        )}
      </div>

      {/* Select-all bar (only in select mode) */}
      {selectMode && (
        <div className="rounded-2xl px-4 py-3 flex justify-between items-center gap-3" style={{ background: 'var(--asoft)', border: '1px solid var(--border)' }}>
          <button onClick={toggleSelectAll} className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition" style={{ background: selectedIds.size === filtered.length && filtered.length > 0 ? 'var(--accent)' : 'var(--surface)', borderColor: 'var(--accent)' }}>
              {selectedIds.size === filtered.length && filtered.length > 0 && (
                <svg className="w-3.5 h-3.5" style={{ color: 'white' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              )}
              {selectedIds.size > 0 && selectedIds.size < filtered.length && (
                <span className="w-2.5 h-0.5 rounded" style={{ background: 'var(--accent)' }}/>
              )}
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--atext)' }}>
              {selectedIds.size > 0 ? `${selectedIds.size} seleccionados` : `Seleccionar todos (${filtered.length})`}
            </span>
          </button>
        </div>
      )}

      {/* Expense list */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {filtered.length === 0 ? (
          <p className="p-6 text-center text-sm" style={{ color: 'var(--t3)' }}>Sin gastos para este filtro</p>
        ) : filtered.map((e, eIdx) => {
          const isSelected = selectedIds.has(e.id)
          const splits = detectSplits(e)
          const isMulti = splits.length > 1
          const catColor = CAT_COLORS[e.category ?? ''] ?? '#94a3b8'
          const mainSplit = splits[0]
          return (
          <div
            key={e.id}
            className="px-4 py-3 flex items-center gap-3 cursor-pointer transition"
            style={{ background: isSelected ? 'var(--asoft)' : undefined, borderTop: eIdx > 0 ? '1px solid var(--border)' : undefined }}
            onClick={() => selectMode ? toggleSelect(e.id) : openEdit(e)}
          >
            {selectMode ? (
              <span className="w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition" style={{ background: isSelected ? 'var(--accent)' : 'var(--bg2)', borderColor: isSelected ? 'var(--accent)' : 'var(--border)' }}>
                {isSelected && <svg className="w-3.5 h-3.5" style={{ color: 'white' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </span>
            ) : (
              <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: catColor + '22' }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: catColor }} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--t)' }}>{e.description}</p>
              <div className="flex gap-1.5 mt-0.5 flex-wrap items-center">
                <span className="text-xs" style={{ color: 'var(--t3)' }}>{new Date(e.date + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</span>
                {(e.account_type ?? 'credito') === 'debito' && (
                  <>
                    <span style={{ color: 'var(--t3)', fontSize: 10 }}>·</span>
                    <span className="text-xs" style={{ color: 'var(--amber)' }}>Débito</span>
                  </>
                )}
                {(e.category || e.subcategory) && (() => {
                  const catMeta = getCategoryMeta(e.category ?? '')
                  const subLabel = catMeta?.subcategories.find(s => s.key === e.subcategory)?.label
                  const label = subLabel ?? catMeta?.label ?? e.category
                  return (
                    <>
                      <span style={{ color: 'var(--t3)', fontSize: 10 }}>·</span>
                      <span className="text-xs" style={{ color: 'var(--t3)' }}>{label}</span>
                    </>
                  )
                })()}
                {isMulti && splits.map(sp => {
                  const amt = parseFloat(sp.monto)
                  if (amt <= 0) return null
                  const amtLabel = `S/ ${amt.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
                  if (sp.clasificacion === 'personal') return <span key={sp.id} className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#8b5cf622', color: '#7c3aed', border: '1px solid #8b5cf633' }}>Personal · {amtLabel}</span>
                  if (sp.clasificacion === 'flor_me_debe') return <span key={sp.id} className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#ec489922', color: '#be185d', border: '1px solid #ec489933' }}>{deudaLabel} · {amtLabel}</span>
                  if (sp.clasificacion === 'hogar') {
                    const cuentaLabel = HOGAR_CUENTAS.find(c => c.key === sp.hogar_cuenta)?.label ?? (sp.hogar_cuenta || 'Hogar')
                    return <span key={sp.id} className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--bg2)', color: 'var(--t2)', border: '1px solid var(--border)' }}>{cuentaLabel} · {amtLabel}</span>
                  }
                  return null
                })}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-mono font-bold text-sm whitespace-nowrap" style={{ color: 'var(--t)' }}>
                S/ {expenseTotal(e).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
              {!selectMode && (() => {
                if (!mainSplit?.clasificacion) return <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#ef444422', color: '#ef4444', border: '1px solid #ef444433' }}>Sin clasificar</span>
                if (mainSplit.clasificacion === 'personal') return <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#8b5cf622', color: '#7c3aed', border: '1px solid #8b5cf633' }}>Personal</span>
                if (mainSplit.clasificacion === 'flor_me_debe') return <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#ec489922', color: '#be185d', border: '1px solid #ec489933' }}>{deudaLabel}</span>
                const cuentaLabel = mainSplit.hogar_cuenta ? (HOGAR_CUENTAS.find(c => c.key === mainSplit.hogar_cuenta)?.label ?? mainSplit.hogar_cuenta) : 'Hogar'
                const isPower = mainSplit.hogar_cuenta === 'power' || mainSplit.hogar_cuenta === 'otros_power'
                const powerSinSub = isPower && !mainSplit.power_subcuenta
                return <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: powerSinSub ? 'color-mix(in oklch, var(--amber) 15%, transparent)' : 'var(--asoft)', color: powerSinSub ? 'var(--amber)' : 'var(--atext)', border: `1px solid ${powerSinSub ? 'color-mix(in oklch, var(--amber) 30%, transparent)' : 'var(--border)'}` }}>{cuentaLabel}{powerSinSub ? ' · sin col.' : ''}</span>
              })()}
              {!selectMode && (
                <button onClick={ev => { ev.stopPropagation(); deleteExpense(e.id) }} className="text-xs p-0.5 mt-0.5" style={{ color: 'var(--red)' }}>✕</button>
              )}
            </div>
          </div>
          )
        })}
      </div>

      {/* Bulk delete floating bar */}
      {selectMode && selectedIds.size > 0 && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl" style={{ background: 'var(--t)', color: 'var(--bg)' }}>
          <span className="text-sm font-medium">{selectedIds.size} seleccionados</span>
          <button
            onClick={bulkDelete}
            disabled={bulkDeleting}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-xl transition disabled:opacity-50"
            style={{ background: 'var(--red)', color: 'white' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            {bulkDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
          <button onClick={exitSelectMode} className="text-sm transition" style={{ color: 'var(--bg2)' }}>Cancelar</button>
        </div>
      )}

      {/* FAB — nuevo gasto */}
      {!selectMode && (
        <button
          onClick={openNew}
          className="fixed z-30 flex items-center justify-center text-white text-2xl font-light shadow-lg active:scale-95 transition-transform"
          style={{ bottom: 90, right: 20, width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)' }}
        >+</button>
      )}

      {/* Form modal */}
      {showForm && (
        <ModalForm
          key={modalKey}
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


const CLAS_MODAL = [
  { id: 'hogar'       as const, label: 'Hogar',    icon: '🏡', color: 'var(--accent)' },
  { id: 'personal'    as const, label: 'Personal', icon: '👤', color: '#8b5cf6' },
  { id: 'flor_me_debe'as const, label: null,        icon: '💸', color: '#ec4899' },
] as const

function ModalForm({ editExpense, form, setForm, saving, canSave, totalNum, splitSum, deudaLabel, onClose, onSave }: ModalFormProps) {
  const descRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(editExpense ? 2 : 1)

  useEffect(() => {
    if (step === 1) setTimeout(() => descRef.current?.focus(), 80)
  }, [step])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function press(k: string) {
    setForm(f => {
      let v = f.totalMonto || ''
      if (k === 'del') { v = v.slice(0, -1) }
      else if (k === '.') { if (!v.includes('.')) v = (v || '0') + '.' }
      else {
        if (v.includes('.') && (v.split('.')[1]?.length ?? 0) >= 2) return f
        v = v + k
      }
      return {
        ...f,
        totalMonto: v,
        splits: f.splits.length === 1 ? [{ ...f.splits[0], monto: v }] : f.splits,
      }
    })
  }

  const firstSplit = form.splits[0]
  const clasModal = CLAS_MODAL.map(o => ({ ...o, label: o.id === 'flor_me_debe' ? deudaLabel : o.label! }))
  const accentColor = firstSplit?.clasificacion === 'personal' ? '#8b5cf6'
    : firstSplit?.clasificacion === 'flor_me_debe' ? '#ec4899'
    : 'var(--accent)'

  const canContinue = (parseFloat(form.totalMonto) || 0) > 0 && form.description.trim().length > 0

  const hero = (
    <div style={{ position: 'relative', padding: '20px 24px 24px', background: accentColor, flexShrink: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(255,255,255,.08),rgba(0,0,0,.12))', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: -40, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,.12)' }} />
      <div style={{ position: 'absolute', bottom: -30, left: -20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
      <div className="flex items-start justify-between mb-2" style={{ position: 'relative' }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,.8)' }}>{editExpense ? 'Editar gasto' : 'Nuevo gasto'}</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,.65)' }}>{step === 1 ? '¿Cuánto gastaste?' : 'Un par de detalles más'}</p>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,.18)', color: '#fff' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"><line x1="2" y1="2" x2="12" y2="12"/><line x1="12" y1="2" x2="2" y2="12"/></svg>
        </button>
      </div>
      <div style={{ position: 'relative', marginTop: 12 }}>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono" style={{ color: 'rgba(255,255,255,.75)', fontSize: 18, fontWeight: 500 }}>S/</span>
          <span className="font-mono" style={{ color: '#fff', fontSize: 48, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em' }}>{form.totalMonto || '0'}</span>
        </div>
      </div>
      <div className="flex gap-1.5 mt-4" style={{ position: 'relative' }}>
        {[1, 2].map(i => (
          <div key={i} style={{ height: 3, borderRadius: 2, flex: 1, background: step >= i ? '#fff' : 'rgba(255,255,255,.3)', transition: 'background .2s' }} />
        ))}
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose} style={{ animation: 'sheetFadeIn .2s ease-out' }}>
      <div className="absolute inset-0" style={{ background: 'rgba(20,14,10,.55)', backdropFilter: 'blur(6px)' }} />
      <div
        className="relative rounded-t-[28px] sm:rounded-3xl w-full sm:max-w-md overflow-hidden shadow-2xl"
        style={{ background: 'var(--surface)', maxHeight: '92vh', display: 'flex', flexDirection: 'column', animation: 'sheetSlideUp .28s cubic-bezier(.2,.9,.3,1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Grab handle - mobile */}
        <div className="flex justify-center pt-2.5 pb-1 sm:hidden" style={{ flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)' }} />
        </div>

        {hero}

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {step === 1 ? (
            <div style={{ padding: '20px 20px 24px' }}>
              {/* Descripción */}
              <div className="space-y-1.5 mb-5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--t2)' }}>¿En qué?</label>
                <input
                  ref={descRef}
                  type="text"
                  className="w-full rounded-xl px-3 py-2.5 text-sm"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--t)', outline: 'none' }}
                  placeholder="Supermercado, almuerzo, gasolina…"
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

              {/* Keypad */}
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--t2)' }}>Monto</p>
              <div className="grid grid-cols-3 gap-2">
                {['1','2','3','4','5','6','7','8','9','.','0','del'].map(k => (
                  <button
                    key={k}
                    type="button"
                    className="keypad-key rounded-xl text-lg font-semibold transition-all"
                    onClick={() => press(k)}
                    style={{ background: 'var(--bg2)', color: 'var(--t)', padding: '14px 0', border: '1px solid var(--border)' }}
                  >
                    {k === 'del'
                      ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM18 9l-6 6M12 9l6 6"/></svg>
                      : k}
                  </button>
                ))}
              </div>

              {/* Método de pago */}
              <p className="text-xs font-semibold uppercase tracking-wider mt-5 mb-2" style={{ color: 'var(--t2)' }}>Método de pago</p>
              <div className="grid grid-cols-2 gap-2">
                {([{ id: 'credito' as const, label: 'Crédito', icon: '💳' }, { id: 'debito' as const, label: 'Débito', icon: '🏦' }]).map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, accountType: t.id }))}
                    className="py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                    style={form.accountType === t.id
                      ? { background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)' }
                      : { background: 'var(--bg2)', color: 'var(--t2)', border: '1px solid var(--border)' }}
                  >
                    <span>{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!canContinue}
                className="w-full mt-6 py-3.5 rounded-2xl text-sm font-semibold text-white transition-all disabled:opacity-40"
                style={{ background: 'var(--accent)', boxShadow: '0 4px 14px rgba(0,0,0,.12)' }}
              >
                Continuar →
              </button>
            </div>
          ) : (
            <div style={{ padding: '20px 20px 24px' }}>
              {/* Clasificación */}
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--t2)' }}>Clasificación</p>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {clasModal.map(o => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setForm(f => ({
                      ...f,
                      splits: [{ ...f.splits[0], clasificacion: o.id, hogar_cuenta: '', power_subcuenta: '' }],
                    }))}
                    className="rounded-xl p-3 flex flex-col items-center gap-1.5 transition-all"
                    style={firstSplit?.clasificacion === o.id
                      ? { background: o.color, color: '#fff', border: `1px solid ${o.color}`, boxShadow: `0 4px 12px ${o.color}33` }
                      : { background: 'var(--bg2)', color: 'var(--t2)', border: '1px solid var(--border)' }}
                  >
                    <span style={{ fontSize: 20 }}>{o.icon}</span>
                    <span className="text-xs font-semibold">{o.label}</span>
                  </button>
                ))}
              </div>

              {/* Cuenta Scotiabank (solo si hogar) */}
              {firstSplit?.clasificacion === 'hogar' && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--t2)' }}>Cuenta Scotiabank</p>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, splits: [{ ...f.splits[0], hogar_cuenta: '', power_subcuenta: '' }] }))}
                      className="rounded-xl p-2.5 text-xs font-medium transition-all text-left"
                      style={!firstSplit.hogar_cuenta
                        ? { background: 'var(--asoft)', color: 'var(--atext)', border: '1px solid var(--accent)' }
                        : { background: 'var(--bg2)', color: 'var(--t3)', border: '1px solid var(--border)' }}
                    >Sin cuenta</button>
                    {HOGAR_CUENTAS.map(a => (
                      <button
                        key={a.key}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, splits: [{ ...f.splits[0], hogar_cuenta: a.key, power_subcuenta: '' }] }))}
                        className="rounded-xl p-2.5 text-xs font-semibold transition-all text-left"
                        style={firstSplit.hogar_cuenta === a.key
                          ? { background: 'var(--asoft)', color: 'var(--atext)', border: '1px solid var(--accent)' }
                          : { background: 'var(--bg2)', color: 'var(--t2)', border: '1px solid var(--border)' }}
                      >{a.label}</button>
                    ))}
                  </div>
                </>
              )}

              {/* Columna Power (solo si cuenta power) */}
              {(firstSplit?.hogar_cuenta === 'power' || firstSplit?.hogar_cuenta === 'otros_power') && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--t2)' }}>Columna Power</p>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {POWER_COLS.map(c => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, splits: [{ ...f.splits[0], power_subcuenta: c.key }] }))}
                        className="rounded-xl p-2.5 text-xs font-semibold transition-all text-left"
                        style={firstSplit.power_subcuenta === c.key
                          ? { background: 'var(--asoft)', color: 'var(--atext)', border: '1px solid var(--accent)' }
                          : { background: 'var(--bg2)', color: 'var(--t2)', border: '1px solid var(--border)' }}
                      >{c.label}</button>
                    ))}
                  </div>
                </>
              )}

              {/* Categoría */}
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--t2)' }}>Categoría</p>
              <div className="flex gap-1.5 flex-wrap mb-2">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, category: '', subcategory: '' }))}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                  style={!form.category
                    ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }
                    : { background: 'transparent', color: 'var(--t3)', borderColor: 'var(--border)' }}
                >Sin categoría</button>
                {EXPENSE_CATEGORIES.map(cat => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat.key, subcategory: '' }))}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                    style={form.category === cat.key
                      ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }
                      : { background: 'transparent', color: 'var(--t2)', borderColor: 'var(--border)' }}
                  >{cat.label}</button>
                ))}
              </div>

              {/* Subcategoría */}
              {form.category && (getCategoryMeta(form.category)?.subcategories ?? []).length > 0 && (
                <div className="flex gap-1.5 flex-wrap mb-5 pl-2">
                  {(getCategoryMeta(form.category)?.subcategories ?? []).map(sub => (
                    <button
                      key={sub.key}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, subcategory: f.subcategory === sub.key ? '' : sub.key }))}
                      className="px-3 py-1 rounded-full text-xs font-medium border transition-all"
                      style={form.subcategory === sub.key
                        ? { background: 'var(--asoft)', color: 'var(--atext)', borderColor: 'var(--accent)' }
                        : { background: 'transparent', color: 'var(--t3)', borderColor: 'var(--border)' }}
                    >{sub.label}</button>
                  ))}
                </div>
              )}
              {(!form.category || (getCategoryMeta(form.category)?.subcategories ?? []).length === 0) && <div className="mb-5" />}

              {/* Fecha */}
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--t2)' }}>Fecha</p>
              <input
                type="date"
                className="w-full rounded-xl px-3 py-2.5 text-sm mb-5"
                style={{ border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--t)', outline: 'none' }}
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />

              {/* División múltiple (avanzado) */}
              {form.splits.length > 1 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--t2)' }}>División del gasto</p>
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
                      className="text-xs hover:underline"
                      style={{ color: 'var(--accent)' }}
                    >Dividir equitativamente</button>
                  </div>
                  <div className="space-y-2">
                    {form.splits.map((split, idx) => {
                      const total = parseFloat(form.totalMonto) || 0
                      const splitNum = parseFloat(split.monto) || 0
                      const pct = total > 0 ? ((splitNum / total) * 100).toFixed(1) : ''
                      return (
                        <div key={split.id} className="rounded-xl p-3 space-y-2" style={{ border: '1px solid var(--border)', background: 'var(--bg2)' }}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium" style={{ color: 'var(--t3)' }}>Parte {idx + 1}</span>
                            <button type="button" onClick={() => setForm(f => ({ ...f, splits: f.splits.filter((_, i) => i !== idx) }))} className="text-xs" style={{ color: 'var(--red)' }}>✕</button>
                          </div>
                          <div className="flex gap-1.5 flex-wrap">
                            {clasModal.map(opt => (
                              <button key={opt.id} type="button"
                                onClick={() => setForm(f => ({ ...f, splits: f.splits.map((sp, i) => i === idx ? { ...sp, clasificacion: opt.id as Clasificacion, hogar_cuenta: '', power_subcuenta: '' } : sp) }))}
                                className="px-3 py-1 rounded-full text-xs font-medium border transition"
                                style={split.clasificacion === opt.id
                                  ? { background: opt.color, color: 'white', borderColor: opt.color }
                                  : { background: 'transparent', color: 'var(--t2)', borderColor: 'var(--border)' }}
                              >{opt.label}</button>
                            ))}
                          </div>
                          {split.clasificacion === 'hogar' && (
                            <select
                              className="w-full rounded-xl px-3 py-2 text-sm"
                              style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--t)' }}
                              value={split.hogar_cuenta}
                              onChange={e => setForm(f => ({ ...f, splits: f.splits.map((sp, i) => i === idx ? { ...sp, hogar_cuenta: e.target.value, power_subcuenta: '' } : sp) }))}
                            >
                              <option value="">Sin cuenta asignada</option>
                              {HOGAR_CUENTAS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                            </select>
                          )}
                          <div className="flex gap-2">
                            <div className="flex-1 relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color: 'var(--t3)' }}>S/</span>
                              <input type="number" step="0.01" placeholder="0.00"
                                className="w-full rounded-xl pl-8 pr-3 py-2 text-sm"
                                style={{ border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--t)' }}
                                value={split.monto}
                                onChange={e => setForm(f => ({ ...f, splits: f.splits.map((sp, i) => i === idx ? { ...sp, monto: e.target.value } : sp) }))}
                              />
                            </div>
                            <div className="w-20 relative">
                              <input type="number" step="0.1" min="0" max="100" placeholder="0"
                                className="w-full rounded-xl pl-3 pr-6 py-2 text-sm"
                                style={{ border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--t)' }}
                                value={pct}
                                onChange={e => {
                                  const pctVal = parseFloat(e.target.value) || 0
                                  const t = parseFloat(form.totalMonto) || 0
                                  setForm(f => ({ ...f, splits: f.splits.map((sp, i) => i === idx ? { ...sp, monto: t > 0 ? (pctVal * t / 100).toFixed(2) : '' } : sp) }))
                                }}
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: 'var(--t3)' }}>%</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {totalNum > 0 && (
                    <p className="mt-1.5 text-xs font-medium" style={{ color: Math.abs(totalNum - splitSum) < 0.01 ? 'var(--accent)' : 'var(--amber)' }}>
                      {Math.abs(totalNum - splitSum) < 0.01 ? '✓ Suma correcta' : `Restante: S/ ${(totalNum - splitSum).toFixed(2)}`}
                    </p>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, splits: [...f.splits, makeSplit()] }))}
                className="w-full rounded-xl py-2 text-xs mb-5 transition"
                style={{ border: '1px dashed var(--border)', color: 'var(--t3)' }}
              >+ División múltiple</button>

              {/* Resumen preview */}
              <div className="p-3 rounded-xl flex items-center justify-between mb-5" style={{ background: 'var(--bg2)', border: '1px dashed var(--border)' }}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: accentColor + '22' }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--t)' }}>{form.description || 'Sin descripción'}</p>
                    <p className="text-xs" style={{ color: 'var(--t3)' }}>
                      {form.accountType === 'credito' ? '💳 Crédito' : '🏦 Débito'}{form.category ? ` · ${getCategoryMeta(form.category)?.label ?? form.category}` : ''}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm flex-shrink-0 ml-2" style={{ color: 'var(--t)' }}>
                  S/ {(parseFloat(form.totalMonto) || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Fecha registro - solo al editar */}
              {editExpense && (
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--amber)' }}>Fecha registro [TEST]</p>
                  <input
                    type="date"
                    className="w-full rounded-xl px-3 py-2.5 text-sm"
                    style={{ border: '1px solid var(--amber)', background: 'var(--bg2)', color: 'var(--t)', outline: 'none' }}
                    value={form.created_at_date}
                    onChange={e => setForm(f => ({ ...f, created_at_date: e.target.value }))}
                  />
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="py-3.5 px-5 rounded-2xl text-sm font-semibold"
                  style={{ background: 'var(--bg2)', color: 'var(--t2)', border: '1px solid var(--border)' }}
                >← Atrás</button>
                {!editExpense && (
                  <button
                    onClick={() => onSave(true)}
                    disabled={saving || !canSave}
                    className="py-3.5 px-4 rounded-2xl text-sm font-semibold transition disabled:opacity-40"
                    style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}
                  >{saving ? '…' : '+1'}</button>
                )}
                <button
                  onClick={() => onSave(false)}
                  disabled={saving || !canSave}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-semibold text-white transition-all disabled:opacity-40"
                  style={{ background: 'var(--accent)', boxShadow: '0 4px 14px rgba(0,0,0,.12)' }}
                >
                  {saving ? 'Guardando…' : editExpense ? 'Guardar cambios' : 'Agregar gasto'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
