'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EXPENSE_COLUMNS, ACCOUNTS, MONTH_NAMES } from '@/lib/utils/accounts'
import type { PersonalExpense } from '@/lib/supabase/types'

interface Props {
  initialExpenses: PersonalExpense[]
  userId: string
}

const EXPENSE_COL_KEYS = EXPENSE_COLUMNS.map(c => c.key) as (keyof PersonalExpense)[]

function expenseTotal(e: PersonalExpense): number {
  return EXPENSE_COL_KEYS.reduce((s, k) => s + ((e[k] as number | null) ?? 0), 0)
}

function expenseType(e: PersonalExpense): string {
  if ((e.julio ?? 0) > 0 && EXPENSE_COL_KEYS.filter(k => k !== 'julio' && k !== 'flor').every(k => !e[k])) {
    return 'Personal'
  }
  return 'Hogar'
}

const EMPTY_FORM = {
  date: new Date().toISOString().split('T')[0],
  description: '',
  casita: '', flor_julio: '', julio: '', flor: '', salidas: '',
  power: '', gasolina: '', regalos: '', navidad: '', otros_power: '', entretenimiento: '',
}

export default function GastosClient({ initialExpenses, userId }: Props) {
  const supabase = createClient()
  const [expenses, setExpenses] = useState<PersonalExpense[]>(initialExpenses)
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1)
  const [filterAccount, setFilterAccount] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editExpense, setEditExpense] = useState<PersonalExpense | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const filtered = expenses.filter(e => {
    const month = new Date(e.date).getMonth() + 1
    if (filterMonth && month !== filterMonth) return false
    if (filterAccount !== 'all') {
      const col = EXPENSE_COLUMNS.find(c => c.account === filterAccount)
      if (!col || !(e[col.key as keyof PersonalExpense])) return false
    }
    if (filterType === 'personal' && expenseType(e) !== 'Personal') return false
    if (filterType === 'hogar' && expenseType(e) !== 'Hogar') return false
    if (search && !e.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const subtotal = filtered.reduce((s, e) => s + expenseTotal(e), 0)

  function openNew() {
    setEditExpense(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(e: PersonalExpense) {
    setEditExpense(e)
    setForm({
      date: e.date,
      description: e.description,
      casita: e.casita?.toString() ?? '',
      flor_julio: e.flor_julio?.toString() ?? '',
      julio: e.julio?.toString() ?? '',
      flor: e.flor?.toString() ?? '',
      salidas: e.salidas?.toString() ?? '',
      power: e.power?.toString() ?? '',
      gasolina: e.gasolina?.toString() ?? '',
      regalos: e.regalos?.toString() ?? '',
      navidad: e.navidad?.toString() ?? '',
      otros_power: e.otros_power?.toString() ?? '',
      entretenimiento: e.entretenimiento?.toString() ?? '',
    })
    setShowForm(true)
  }

  async function save(andAnother = false) {
    setSaving(true)
    const payload: Partial<PersonalExpense> = {
      date: form.date,
      description: form.description,
      user_id: userId,
      year: 2026,
      casita: form.casita ? parseFloat(form.casita) : null,
      flor_julio: form.flor_julio ? parseFloat(form.flor_julio) : null,
      julio: form.julio ? parseFloat(form.julio) : null,
      flor: form.flor ? parseFloat(form.flor) : null,
      salidas: form.salidas ? parseFloat(form.salidas) : null,
      power: form.power ? parseFloat(form.power) : null,
      gasolina: form.gasolina ? parseFloat(form.gasolina) : null,
      regalos: form.regalos ? parseFloat(form.regalos) : null,
      navidad: form.navidad ? parseFloat(form.navidad) : null,
      otros_power: form.otros_power ? parseFloat(form.otros_power) : null,
      entretenimiento: form.entretenimiento ? parseFloat(form.entretenimiento) : null,
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

  const months = Array.from(new Set(expenses.map(e => new Date(e.date).getMonth() + 1))).sort()

  return (
    <div className="space-y-4 pb-20 sm:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Mis Gastos</h1>
        <button onClick={openNew} className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          + Agregar
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm" value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}>
          <option value={0}>Todos los meses</option>
          {months.map(m => <option key={m} value={m}>{MONTH_NAMES[m]}</option>)}
        </select>
        <select className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">Todos</option>
          <option value="personal">Personal</option>
          <option value="hogar">Hogar</option>
        </select>
        <select className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm" value={filterAccount} onChange={e => setFilterAccount(e.target.value)}>
          <option value="all">Todas las cuentas</option>
          {ACCOUNTS.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
        </select>
        <input
          type="text"
          placeholder="Buscar..."
          className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm flex-1 min-w-28"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Subtotal */}
      <div className="bg-indigo-50 rounded-xl px-4 py-3 flex justify-between items-center">
        <span className="text-sm text-indigo-700 font-medium">{filtered.length} gastos</span>
        <span className="font-bold text-indigo-800">S/ {subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
      </div>

      {/* Expense list */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <p className="p-6 text-center text-gray-400 text-sm">Sin gastos para este filtro</p>
        ) : filtered.map(e => (
          <div key={e.id} className="px-4 py-3 flex items-start justify-between gap-3 hover:bg-gray-50 cursor-pointer" onClick={() => openEdit(e)}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{e.description}</p>
              <div className="flex gap-2 mt-0.5 flex-wrap">
                <span className="text-xs text-gray-400">{new Date(e.date + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${expenseType(e) === 'Personal' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {expenseType(e)}
                </span>
                {EXPENSE_COLUMNS.filter(c => (e[c.key as keyof PersonalExpense] as number | null)).map(c => (
                  <span key={c.key} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{c.label}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800 text-sm whitespace-nowrap">
                S/ {expenseTotal(e).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
              <button onClick={ev => { ev.stopPropagation(); deleteExpense(e.id) }} className="text-red-400 hover:text-red-600 text-xs p-1">✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">{editExpense ? 'Editar gasto' : 'Nuevo gasto'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Fecha</label>
                  <input type="date" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Descripción</label>
                <input type="text" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Ej: Supermercado" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <p className="text-xs text-gray-400 font-medium pt-1">Montos por cuenta (solo llena las que aplican)</p>
              <div className="grid grid-cols-2 gap-2">
                {EXPENSE_COLUMNS.map(col => (
                  <div key={col.key}>
                    <label className="text-xs text-gray-500">{col.label}</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                      value={form[col.key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [col.key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-2 justify-end flex-wrap">
              <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 px-4 py-2 hover:bg-gray-100 rounded-lg">Cancelar</button>
              {!editExpense && (
                <button onClick={() => save(true)} disabled={saving || !form.description} className="border border-indigo-600 text-indigo-600 text-sm px-4 py-2 rounded-lg hover:bg-indigo-50 disabled:opacity-50 transition">
                  {saving ? '...' : 'Guardar y agregar otra'}
                </button>
              )}
              <button onClick={() => save(false)} disabled={saving || !form.description} className="bg-indigo-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
