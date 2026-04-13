'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MONTH_NAMES, BUDGET_CATEGORIES, ACCOUNTS } from '@/lib/utils/accounts'
import type { BudgetMonth, BudgetExpense, BudgetEntertainmentDetail, BudgetTransfer } from '@/lib/supabase/types'

interface Props {
  months: BudgetMonth[]
}

export default function CuentasClient({ months }: Props) {
  const supabase = createClient()
  const currentMonth = new Date().getMonth() + 1
  const defaultMonth = months.find(m => m.month === currentMonth) ?? months[months.length - 1]
  const [selectedMonthId, setSelectedMonthId] = useState(defaultMonth?.id ?? '')
  const [expenses, setExpenses] = useState<BudgetExpense[]>([])
  const [entertainment, setEntertainment] = useState<BudgetEntertainmentDetail[]>([])
  const [transfers, setTransfers] = useState<BudgetTransfer[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    if (!selectedMonthId) return
    setLoading(true)
    Promise.all([
      supabase.from('budget_expenses').select('*').eq('budget_month_id', selectedMonthId),
      supabase.from('budget_entertainment_detail').select('*').eq('budget_month_id', selectedMonthId),
      supabase.from('budget_transfers').select('*').eq('budget_month_id', selectedMonthId),
    ]).then(([exp, ent, tra]) => {
      setExpenses(exp.data ?? [])
      setEntertainment(ent.data ?? [])
      setTransfers(tra.data ?? [])
      setLoading(false)
    })
  }, [selectedMonthId])

  async function saveExpense(id: string) {
    const amount = parseFloat(editValue)
    if (isNaN(amount)) { setEditingId(null); return }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('budget_expenses') as any).update({ amount }).eq('id', id)
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, amount } : e))
    setEditingId(null)
  }

  async function saveEntertainment(id: string) {
    const amount = parseFloat(editValue)
    if (isNaN(amount)) { setEditingId(null); return }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('budget_entertainment_detail') as any).update({ amount }).eq('id', id)
    setEntertainment(prev => prev.map(e => e.id === id ? { ...e, amount } : e))
    setEditingId(null)
  }

  // Group expenses by account
  const byAccount: Record<string, number> = {}
  for (const exp of expenses) {
    if (exp.account) byAccount[exp.account] = (byAccount[exp.account] ?? 0) + (exp.amount ?? 0)
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Cuentas del Presupuesto</h1>
        <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" value={selectedMonthId} onChange={e => setSelectedMonthId(e.target.value)}>
          {months.map(m => <option key={m.id} value={m.id}>{MONTH_NAMES[m.month]} 2026</option>)}
        </select>
      </div>

      {loading ? <p className="text-gray-400 text-sm">Cargando...</p> : (
        <>
          {/* Account summary */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800 text-sm">Resumen por cuenta Scotiabank</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              {ACCOUNTS.map(acc => {
                const amt = byAccount[acc.key] ?? 0
                return (
                  <div key={acc.key} className="p-4">
                    <p className="text-xs text-gray-500 font-medium">{acc.label}</p>
                    <p className="text-lg font-bold text-gray-800 mt-1">S/ {amt.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{acc.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Editable expense table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800 text-sm">Gastos presupuestados — click para editar</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-2 font-medium">Categoría</th>
                  <th className="text-left px-4 py-2 font-medium">Responsable</th>
                  <th className="text-left px-4 py-2 font-medium">Cuenta</th>
                  <th className="text-right px-4 py-2 font-medium">Monto</th>
                </tr>
              </thead>
              <tbody>
                {BUDGET_CATEGORIES.map(cat => {
                  const exp = expenses.find(e => e.category === cat.key)
                  if (!exp) return null
                  return (
                    <tr key={cat.key} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-700">{cat.label}</td>
                      <td className="px-4 py-2.5 text-gray-500 capitalize">{exp.responsible}</td>
                      <td className="px-4 py-2.5 text-gray-500">{exp.account}</td>
                      <td className="px-4 py-2.5 text-right">
                        {editingId === exp.id ? (
                          <input
                            autoFocus
                            type="number"
                            step="0.01"
                            className="w-28 border border-indigo-400 rounded px-2 py-1 text-right text-sm"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => saveExpense(exp.id)}
                            onKeyDown={e => { if (e.key === 'Enter') saveExpense(exp.id); if (e.key === 'Escape') setEditingId(null) }}
                          />
                        ) : (
                          <button
                            className="font-medium text-gray-800 hover:text-indigo-600 transition"
                            onClick={() => { setEditingId(exp.id); setEditValue(exp.amount?.toString() ?? '0') }}
                          >
                            S/ {(exp.amount ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Entertainment detail */}
          {entertainment.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800 text-sm">Entretenimiento (desglose)</h2>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {entertainment.map(ent => (
                    <tr key={ent.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-700">{ent.service}</td>
                      <td className="px-4 py-2.5 text-right">
                        {editingId === ent.id ? (
                          <input
                            autoFocus
                            type="number"
                            step="0.01"
                            className="w-28 border border-indigo-400 rounded px-2 py-1 text-right text-sm"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => saveEntertainment(ent.id)}
                            onKeyDown={e => { if (e.key === 'Enter') saveEntertainment(ent.id); if (e.key === 'Escape') setEditingId(null) }}
                          />
                        ) : (
                          <button
                            className="font-medium text-gray-800 hover:text-indigo-600 transition"
                            onClick={() => { setEditingId(ent.id); setEditValue(ent.amount?.toString() ?? '0') }}
                          >
                            S/ {(ent.amount ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Transfers */}
          {transfers.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800 text-sm">Transferencias Julio ↔ Flor</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-2 font-medium">Cuenta / Concepto</th>
                    <th className="text-right px-4 py-2 font-medium">Julio</th>
                    <th className="text-right px-4 py-2 font-medium">Flor</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map(t => (
                    <tr key={t.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-2.5 text-gray-700 font-medium">{t.concept ?? t.account}</td>
                      <td className="px-4 py-2.5 text-right text-gray-800">
                        {t.julio_amount ? `S/ ${t.julio_amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-800">
                        {t.flor_amount ? `S/ ${t.flor_amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
