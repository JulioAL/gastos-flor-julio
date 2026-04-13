'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MONTH_NAMES, BUDGET_CATEGORIES, ACCOUNTS } from '@/lib/utils/accounts'
import type { BudgetMonth, BudgetIncome, BudgetExpense, BudgetTransfer } from '@/lib/supabase/types'

interface Props {
  months: BudgetMonth[]
}

export default function ResumenClient({ months }: Props) {
  const supabase = createClient()
  const currentMonth = new Date().getMonth() + 1
  const defaultMonth = months.find(m => m.month === currentMonth) ?? months[months.length - 1]
  const [selectedMonthId, setSelectedMonthId] = useState<string>(defaultMonth?.id ?? '')
  const [income, setIncome] = useState<BudgetIncome[]>([])
  const [expenses, setExpenses] = useState<BudgetExpense[]>([])
  const [transfers, setTransfers] = useState<BudgetTransfer[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedMonthId) return
    setLoading(true)
    Promise.all([
      supabase.from('budget_income').select('*').eq('budget_month_id', selectedMonthId),
      supabase.from('budget_expenses').select('*').eq('budget_month_id', selectedMonthId),
      supabase.from('budget_transfers').select('*').eq('budget_month_id', selectedMonthId),
    ]).then(([inc, exp, tra]) => {
      setIncome(inc.data ?? [])
      setExpenses(exp.data ?? [])
      setTransfers(tra.data ?? [])
      setLoading(false)
    })
  }, [selectedMonthId])

  const totalIncome = income.filter(i => i.included_in_budget).reduce((s, i) => s + (i.amount ?? 0), 0)
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount ?? 0), 0)
  const balance = totalIncome - totalExpenses

  // Group expenses by account
  const byAccount: Record<string, number> = {}
  for (const exp of expenses) {
    if (exp.account) byAccount[exp.account] = (byAccount[exp.account] ?? 0) + (exp.amount ?? 0)
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Resumen del Mes</h1>
        <select
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          value={selectedMonthId}
          onChange={e => setSelectedMonthId(e.target.value)}
        >
          {months.map(m => (
            <option key={m.id} value={m.id}>{MONTH_NAMES[m.month]} 2026</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : (
        <>
          {/* Balance cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-green-600 font-medium">Ingresos</p>
              <p className="text-lg font-bold text-green-700">S/ {totalIncome.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-xs text-red-600 font-medium">Gastos</p>
              <p className="text-lg font-bold text-red-700">S/ {totalExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className={`${balance >= 0 ? 'bg-indigo-50' : 'bg-orange-50'} rounded-xl p-4`}>
              <p className={`text-xs font-medium ${balance >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>Balance</p>
              <p className={`text-lg font-bold ${balance >= 0 ? 'text-indigo-700' : 'text-orange-700'}`}>
                S/ {balance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Income table */}
          <Section title="Ingresos">
            <table className="w-full text-sm">
              <tbody>
                {income.map(i => (
                  <tr key={i.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 text-gray-700">{i.description ?? i.source}</td>
                    <td className="py-2 text-right font-medium text-gray-900">
                      S/ {(i.amount ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    {!i.included_in_budget && <td className="py-2 pl-2 text-xs text-gray-400">no incluido</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* Expenses by category */}
          <Section title="Gastos Programados">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left py-1.5 font-medium">Categoría</th>
                  <th className="text-left py-1.5 font-medium">Responsable</th>
                  <th className="text-left py-1.5 font-medium">Cuenta</th>
                  <th className="text-right py-1.5 font-medium">Monto</th>
                </tr>
              </thead>
              <tbody>
                {BUDGET_CATEGORIES.map(cat => {
                  const exp = expenses.find(e => e.category === cat.key)
                  if (!exp) return null
                  return (
                    <tr key={cat.key} className="border-b border-gray-50 last:border-0">
                      <td className="py-2 text-gray-700">{cat.label}</td>
                      <td className="py-2 text-gray-500 capitalize">{exp.responsible}</td>
                      <td className="py-2 text-gray-500">{exp.account}</td>
                      <td className="py-2 text-right font-medium text-gray-900">
                        S/ {(exp.amount ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Section>

          {/* By account */}
          <Section title="Resumen por Cuenta">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ACCOUNTS.map(acc => {
                const amt = byAccount[acc.key] ?? 0
                if (!amt) return null
                return (
                  <div key={acc.key} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">{acc.label}</p>
                    <p className="font-bold text-gray-800 text-sm mt-0.5">
                      S/ {amt.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )
              })}
            </div>
          </Section>

          {/* Transfers */}
          {transfers.length > 0 && (
            <Section title="Transferencias Julio ↔ Flor">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="text-left py-1.5 font-medium">Concepto</th>
                    <th className="text-right py-1.5 font-medium">Julio</th>
                    <th className="text-right py-1.5 font-medium">Flor</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map(t => (
                    <tr key={t.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-2 text-gray-700">{t.concept ?? t.account}</td>
                      <td className="py-2 text-right text-gray-900">
                        {t.julio_amount ? `S/ ${t.julio_amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="py-2 text-right text-gray-900">
                        {t.flor_amount ? `S/ ${t.flor_amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}
        </>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800 text-sm">{title}</h2>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  )
}
