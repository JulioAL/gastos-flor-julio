'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MONTH_NAMES, ACCOUNTS } from '@/lib/utils/accounts'
import type { BudgetMonth, BudgetExpense } from '@/lib/supabase/types'

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
  const [loading, setLoading] = useState(false)
  const [editingAccountKey, setEditingAccountKey] = useState<string | null>(null)
  const [editAccountValue, setEditAccountValue] = useState('')

  useEffect(() => {
    if (!selectedMonthId) return
    setLoading(true)
    supabase.from('budget_expenses').select('*').eq('budget_month_id', selectedMonthId)
      .then(({ data }) => {
        setExpenses(data ?? [])
        setLoading(false)
      })
  }, [selectedMonthId])

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
    </div>
  )
}
