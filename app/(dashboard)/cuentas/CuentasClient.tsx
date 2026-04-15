'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MONTH_NAMES, BUDGET_CATEGORIES, ACCOUNTS } from '@/lib/utils/accounts'
import type { BudgetMonth, BudgetExpense, BudgetEntertainmentDetail, BudgetTransfer } from '@/lib/supabase/types'

interface Props {
  months: BudgetMonth[]
  powerTotal: number
}

export default function CuentasClient({ months, powerTotal }: Props) {
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
  const [editingTransferId, setEditingTransferId] = useState<string | null>(null)
  const [editTransferValues, setEditTransferValues] = useState({ julio: '', flor: '' })
  const [editingAccountKey, setEditingAccountKey] = useState<string | null>(null)
  const [editAccountValue, setEditAccountValue] = useState('')

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

  async function saveTransfer(id: string) {
    const julio_amount = editTransferValues.julio ? parseFloat(editTransferValues.julio) : null
    const flor_amount = editTransferValues.flor ? parseFloat(editTransferValues.flor) : null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('budget_transfers') as any).update({ julio_amount, flor_amount }).eq('id', id)
    setTransfers(prev => prev.map(t => t.id === id ? { ...t, julio_amount, flor_amount } : t))
    setEditingTransferId(null)
  }

  async function saveEntertainment(id: string) {
    const amount = parseFloat(editValue)
    if (isNaN(amount)) { setEditingId(null); return }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('budget_entertainment_detail') as any).update({ amount }).eq('id', id)
    setEntertainment(prev => prev.map(e => e.id === id ? { ...e, amount } : e))
    setEditingId(null)
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
        <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm" value={selectedMonthId} onChange={e => setSelectedMonthId(e.target.value)}>
          {months.map(m => <option key={m.id} value={m.id}>{MONTH_NAMES[m.month]} 2026</option>)}
        </select>
      </div>

      {loading ? <p className="text-gray-400 dark:text-gray-500 text-sm">Cargando...</p> : (
        <>
          {/* Account summary */}
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

          {/* Editable expense table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Gastos presupuestados — click para editar</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
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
                    <tr key={cat.key} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{cat.label}</td>
                      <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 capitalize">{exp.responsible}</td>
                      <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">{exp.account}</td>
                      <td className="px-4 py-2.5 text-right">
                        {editingId === exp.id ? (
                          <input
                            autoFocus
                            type="number"
                            step="0.01"
                            className="w-28 border border-indigo-400 dark:border-indigo-500 rounded px-2 py-1 text-right text-sm"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => saveExpense(exp.id)}
                            onKeyDown={e => { if (e.key === 'Enter') saveExpense(exp.id); if (e.key === 'Escape') setEditingId(null) }}
                          />
                        ) : (
                          <button
                            className="font-medium text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
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
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Entretenimiento (desglose)</h2>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {entertainment.map(ent => (
                    <tr key={ent.id} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{ent.service}</td>
                      <td className="px-4 py-2.5 text-right">
                        {editingId === ent.id ? (
                          <input
                            autoFocus
                            type="number"
                            step="0.01"
                            className="w-28 border border-indigo-400 dark:border-indigo-500 rounded px-2 py-1 text-right text-sm"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => saveEntertainment(ent.id)}
                            onKeyDown={e => { if (e.key === 'Enter') saveEntertainment(ent.id); if (e.key === 'Escape') setEditingId(null) }}
                          />
                        ) : (
                          <button
                            className="font-medium text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
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
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Transferencias Julio ↔ Flor</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <th className="text-left px-4 py-2 font-medium">Cuenta / Concepto</th>
                    <th className="text-right px-4 py-2 font-medium">Julio</th>
                    <th className="text-right px-4 py-2 font-medium">Flor</th>
                    <th className="w-10 px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map(t => (
                    <tr key={t.id} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 font-medium">{t.concept ?? t.account}</td>
                      {editingTransferId === t.id ? (
                        <>
                          <td className="px-4 py-2 text-right">
                            <input
                              autoFocus
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="w-28 border border-indigo-400 dark:border-indigo-500 rounded px-2 py-1 text-right text-sm"
                              value={editTransferValues.julio}
                              onChange={e => setEditTransferValues(v => ({ ...v, julio: e.target.value }))}
                              onKeyDown={e => { if (e.key === 'Enter') saveTransfer(t.id); if (e.key === 'Escape') setEditingTransferId(null) }}
                            />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="w-28 border border-indigo-400 dark:border-indigo-500 rounded px-2 py-1 text-right text-sm"
                              value={editTransferValues.flor}
                              onChange={e => setEditTransferValues(v => ({ ...v, flor: e.target.value }))}
                              onKeyDown={e => { if (e.key === 'Enter') saveTransfer(t.id); if (e.key === 'Escape') setEditingTransferId(null) }}
                            />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <button
                              onClick={() => saveTransfer(t.id)}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-xs font-semibold px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition"
                            >
                              OK
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2.5 text-right text-gray-800 dark:text-gray-200">
                            {t.julio_amount != null ? `S/ ${t.julio_amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '-'}
                          </td>
                          <td className="px-4 py-2.5 text-right text-gray-800 dark:text-gray-200">
                            {t.flor_amount != null ? `S/ ${t.flor_amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '-'}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <button
                              onClick={() => {
                                setEditingTransferId(t.id)
                                setEditTransferValues({
                                  julio: t.julio_amount?.toString() ?? '',
                                  flor: t.flor_amount?.toString() ?? '',
                                })
                              }}
                              className="text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                              title="Editar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                          </td>
                        </>
                      )}
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
