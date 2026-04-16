'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { MONTH_NAMES, ACCOUNTS, EXPENSE_COLUMNS, CORTE_ACCOUNT_GROUPS, getCategoryMeta } from '@/lib/utils/accounts'
import type { BudgetMonth, BudgetIncome, BudgetExpense, BudgetTransfer, PersonalExpense } from '@/lib/supabase/types'
// BudgetTransfer kept for setTransfers state type

const CHART_COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#14b8a6','#f97316','#84cc16']

interface Props {
  months: BudgetMonth[]
  expenses: PersonalExpense[]
}

function isHogarPending(e: PersonalExpense): boolean {
  return (e.tab_name ?? '').startsWith('hp|')
}
function hogarPendingAmount(e: PersonalExpense): number {
  return parseFloat((e.tab_name ?? '').slice(3)) || 0
}
function expenseTotal(e: PersonalExpense): number {
  if (isHogarPending(e)) return hogarPendingAmount(e)
  return EXPENSE_COLUMNS.reduce((s, c) => s + ((e[c.key as keyof PersonalExpense] as number | null) ?? 0), 0)
}
function fmt(n: number) {
  return `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
}

export default function ResumenClient({ months, expenses }: Props) {
  const supabase = createClient()
  const currentMonth = new Date().getMonth() + 1
  const defaultMonth = months.find(m => m.month === currentMonth) ?? months[months.length - 1]
  const [selectedMonthId, setSelectedMonthId] = useState<string>(defaultMonth?.id ?? '')
  const [income, setIncome] = useState<BudgetIncome[]>([])
  const [budgetExpenses, setBudgetExpenses] = useState<BudgetExpense[]>([])
  const [transfers, setTransfers] = useState<BudgetTransfer[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'hogar' | 'personal'>('hogar')

  const selectedMonthNum = months.find(m => m.id === selectedMonthId)?.month ?? currentMonth

  useEffect(() => {
    if (!selectedMonthId) return
    setLoading(true)
    Promise.all([
      supabase.from('budget_income').select('*').eq('budget_month_id', selectedMonthId),
      supabase.from('budget_expenses').select('*').eq('budget_month_id', selectedMonthId),
      supabase.from('budget_transfers').select('*').eq('budget_month_id', selectedMonthId),
    ]).then(([inc, exp, tra]) => {
      setIncome(inc.data ?? [])
      setBudgetExpenses(exp.data ?? [])
      setTransfers(tra.data ?? [])
      setLoading(false)
    })
  }, [selectedMonthId])

  // Real expenses for selected month
  const monthExpenses = useMemo(() =>
    expenses.filter(e => new Date(e.date + 'T00:00:00').getMonth() + 1 === selectedMonthNum),
    [expenses, selectedMonthNum]
  )

  // Totals
  const totalIncome = income.filter(i => i.included_in_budget).reduce((s, i) => s + (i.amount ?? 0), 0)
  const totalBudgeted = budgetExpenses.reduce((s, e) => s + (e.amount ?? 0), 0)
  const totalReal = monthExpenses.reduce((s, e) => s + expenseTotal(e), 0)
  const balance = totalIncome - totalReal

  // Budget by account
  const budgetByAccount = useMemo(() => {
    const r: Record<string, number> = {}
    for (const e of budgetExpenses) {
      if (e.account) r[e.account] = (r[e.account] ?? 0) + (e.amount ?? 0)
    }
    return r
  }, [budgetExpenses])

  // Real by account (using CORTE_ACCOUNT_GROUPS mapping)
  const realByAccount = useMemo(() => {
    const r: Record<string, number> = {}
    let pending = 0
    for (const e of monthExpenses) {
      if (isHogarPending(e)) { pending += hogarPendingAmount(e); continue }
      for (const group of CORTE_ACCOUNT_GROUPS) {
        for (const col of group.expenseColumns) {
          const val = (e[col as keyof PersonalExpense] as number | null) ?? 0
          if (val > 0) r[group.accountKey] = (r[group.accountKey] ?? 0) + val
        }
      }
    }
    if (pending > 0) r['_pending'] = pending
    return r
  }, [monthExpenses])

  // Accounts that appear in either budget or real
  const comparisonAccounts = useMemo(() => {
    const keys = new Set([...Object.keys(budgetByAccount), ...Object.keys(realByAccount).filter(k => k !== '_pending')])
    return ACCOUNTS.filter(a => keys.has(a.key))
  }, [budgetByAccount, realByAccount])

  // Hogar pie: by account column
  const hogarPieData = useMemo(() => {
    const totals: Record<string, number> = {}
    for (const e of monthExpenses) {
      for (const col of EXPENSE_COLUMNS) {
        if (col.key === 'julio' || col.key === 'flor') continue
        const val = (e[col.key as keyof PersonalExpense] as number | null) ?? 0
        if (val) totals[col.label] = (totals[col.label] ?? 0) + val
      }
      if (isHogarPending(e)) totals['Sin cuenta'] = (totals['Sin cuenta'] ?? 0) + hogarPendingAmount(e)
    }
    return Object.entries(totals).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 })).sort((a, b) => b.value - a.value)
  }, [monthExpenses])

  // Personal pie: by semantic category tag
  const personalPieData = useMemo(() => {
    const totals: Record<string, number> = {}
    for (const e of monthExpenses) {
      const amt = (e.julio ?? 0) + (e.flor ?? 0)
      if (amt <= 0) continue
      const label = e.category ? (getCategoryMeta(e.category)?.label ?? e.category) : 'Sin categoría'
      totals[label] = (totals[label] ?? 0) + amt
    }
    return Object.entries(totals).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 })).sort((a, b) => b.value - a.value)
  }, [monthExpenses])

  // Hogar bar: by semantic category tag
  const hogarTagBar = useMemo(() => {
    const totals: Record<string, number> = {}
    for (const e of monthExpenses) {
      let hogarAmt = 0
      for (const col of EXPENSE_COLUMNS) {
        if (col.key === 'julio' || col.key === 'flor') continue
        hogarAmt += (e[col.key as keyof PersonalExpense] as number | null) ?? 0
      }
      if (isHogarPending(e)) hogarAmt += hogarPendingAmount(e)
      if (hogarAmt <= 0) continue
      const label = e.category ? (getCategoryMeta(e.category)?.label ?? e.category) : 'Sin categoría'
      totals[label] = (totals[label] ?? 0) + hogarAmt
    }
    return Object.entries(totals).map(([cat, total]) => ({ cat, total: Math.round(total * 100) / 100 })).sort((a, b) => b.total - a.total)
  }, [monthExpenses])

  // Personal bar: by semantic category tag
  const personalTagBar = useMemo(() => {
    const totals: Record<string, number> = {}
    for (const e of monthExpenses) {
      const amt = (e.julio ?? 0) + (e.flor ?? 0)
      if (amt <= 0) continue
      const label = e.category ? (getCategoryMeta(e.category)?.label ?? e.category) : 'Sin categoría'
      totals[label] = (totals[label] ?? 0) + amt
    }
    return Object.entries(totals).map(([cat, total]) => ({ cat, total: Math.round(total * 100) / 100 })).sort((a, b) => b.total - a.total)
  }, [monthExpenses])


  // Top 5 hogar expenses (sorted by hogar amount)
  const hogarTop5 = useMemo(() => {
    const hogarAmt = (e: PersonalExpense) => {
      if (isHogarPending(e)) return hogarPendingAmount(e)
      return EXPENSE_COLUMNS.filter(c => c.key !== 'julio' && c.key !== 'flor')
        .reduce((s, c) => s + ((e[c.key as keyof PersonalExpense] as number | null) ?? 0), 0)
    }
    return [...monthExpenses].filter(e => hogarAmt(e) > 0).sort((a, b) => hogarAmt(b) - hogarAmt(a)).slice(0, 5)
      .map(e => ({ e, amt: hogarAmt(e) }))
  }, [monthExpenses])

  // Top 5 personal expenses (sorted by personal amount)
  const personalTop5 = useMemo(() => {
    const personalAmt = (e: PersonalExpense) => (e.julio ?? 0) + (e.flor ?? 0)
    return [...monthExpenses].filter(e => personalAmt(e) > 0).sort((a, b) => personalAmt(b) - personalAmt(a)).slice(0, 5)
      .map(e => ({ e, amt: personalAmt(e) }))
  }, [monthExpenses])


  return (
    <div className="space-y-6 pb-20 sm:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Resumen</h1>
        <select
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm"
          value={selectedMonthId}
          onChange={e => setSelectedMonthId(e.target.value)}
        >
          {months.map(m => (
            <option key={m.id} value={m.id}>{MONTH_NAMES[m.month]} 2026</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400 dark:text-gray-500 text-sm">Cargando...</p>
      ) : (
        <>
          {/* Hero cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4">
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">Ingresos</p>
              <p className="text-base font-bold text-green-700 dark:text-green-400">{fmt(totalIncome)}</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4">
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Presupuestado</p>
              <p className="text-base font-bold text-indigo-700 dark:text-indigo-400">{fmt(totalBudgeted)}</p>
            </div>
            <div className="bg-rose-50 dark:bg-rose-900/30 rounded-xl p-4">
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">Real</p>
              <p className="text-base font-bold text-rose-700 dark:text-rose-400">{fmt(totalReal)}</p>
              {totalBudgeted > 0 && (
                <p className={`text-xs mt-0.5 font-medium ${totalReal > totalBudgeted ? 'text-red-500' : 'text-green-600'}`}>
                  {totalReal > totalBudgeted ? '+' : ''}{fmt(totalReal - totalBudgeted)} vs presupuesto
                </p>
              )}
            </div>
            <div className={`${balance >= 0 ? 'bg-teal-50 dark:bg-teal-900/30' : 'bg-orange-50 dark:bg-orange-900/30'} rounded-xl p-4`}>
              <p className={`text-xs font-medium ${balance >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-orange-600 dark:text-orange-400'}`}>Balance</p>
              <p className={`text-base font-bold ${balance >= 0 ? 'text-teal-700 dark:text-teal-400' : 'text-orange-700 dark:text-orange-400'}`}>{fmt(balance)}</p>
            </div>
          </div>

          {/* Comparison by account */}
          {(comparisonAccounts.length > 0 || (realByAccount['_pending'] ?? 0) > 0) && (
            <Section title="Presupuestado vs Real por cuenta">
              <div className="space-y-4">
                {comparisonAccounts.map(acc => {
                  const budgeted = budgetByAccount[acc.key] ?? 0
                  const real = realByAccount[acc.key] ?? 0
                  const diff = real - budgeted
                  const pct = budgeted > 0 ? (real / budgeted) * 100 : (real > 0 ? 100 : 0)
                  const over = diff > 0 && budgeted > 0
                  return (
                    <div key={acc.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{acc.label}</span>
                        <div className="flex gap-3 items-center">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            Pres. {fmt(budgeted)}
                          </span>
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Real {fmt(real)}
                          </span>
                          {budgeted > 0 && (
                            <span className={`text-xs font-bold ${over ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                              {over ? '+' : ''}{fmt(diff)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${over ? 'bg-red-400 dark:bg-red-500' : 'bg-green-400 dark:bg-green-500'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      {pct > 100 && (
                        <p className="text-xs text-red-400 dark:text-red-500 mt-0.5">{pct.toFixed(0)}% del presupuesto</p>
                      )}
                    </div>
                  )
                })}
                {(realByAccount['_pending'] ?? 0) > 0 && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-lg px-3 py-2">
                    {fmt(realByAccount['_pending'])} en gastos hogar sin cuenta asignada
                  </p>
                )}
              </div>
            </Section>
          )}

          {/* Income */}
          {income.length > 0 && (
            <Section title="Ingresos del mes">
              <table className="w-full text-sm">
                <tbody>
                  {income.map(i => (
                    <tr key={i.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <td className="py-2 text-gray-700 dark:text-gray-300">{i.description ?? i.source}</td>
                      <td className="py-2 text-right font-medium text-gray-900 dark:text-gray-100">{fmt(i.amount ?? 0)}</td>
                      {!i.included_in_budget && <td className="py-2 pl-2 text-xs text-gray-400 dark:text-gray-500">no incluido</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}

          {/* Hogar / Personal tabs */}
          <div className="space-y-3">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('hogar')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition ${activeTab === 'hogar' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Hogar
              </button>
              <button
                onClick={() => setActiveTab('personal')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition ${activeTab === 'personal' ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Personal
              </button>
            </div>

            {activeTab === 'hogar' && (
              <div className="grid sm:grid-cols-2 gap-4">
                {hogarPieData.length > 0 && (
                  <Section title="Distribución por cuenta">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={hogarPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                          {hogarPieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v) => fmt(Number(v))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Section>
                )}
                {hogarTagBar.length > 0 && (
                  <Section title="Por categoría">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={hogarTagBar} layout="vertical" margin={{ left: 8, right: 16 }}>
                        <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `S/${v}`} />
                        <YAxis type="category" dataKey="cat" tick={{ fontSize: 11 }} width={90} />
                        <Tooltip formatter={(v) => fmt(Number(v))} />
                        <Bar dataKey="total" fill="#6366f1" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Section>
                )}
                {hogarTop5.length > 0 && (
                  <Section title="Top 5 gastos hogar">
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                      {hogarTop5.map(({ e, amt }, i) => (
                        <div key={e.id} className="py-2.5 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 w-4">#{i + 1}</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-44">{e.description}</span>
                          </div>
                          <span className="font-bold text-sm text-gray-800 dark:text-gray-200 shrink-0">{fmt(amt)}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}
                {hogarPieData.length === 0 && hogarTagBar.length === 0 && hogarTop5.length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 col-span-2">Sin gastos hogar este mes.</p>
                )}
              </div>
            )}

            {activeTab === 'personal' && (
              <div className="grid sm:grid-cols-2 gap-4">
                {personalPieData.length > 0 && (
                  <Section title="Distribución por categoría">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={personalPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                          {personalPieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v) => fmt(Number(v))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Section>
                )}
                {personalTagBar.length > 0 && (
                  <Section title="Por categoría">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={personalTagBar} layout="vertical" margin={{ left: 8, right: 16 }}>
                        <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `S/${v}`} />
                        <YAxis type="category" dataKey="cat" tick={{ fontSize: 11 }} width={90} />
                        <Tooltip formatter={(v) => fmt(Number(v))} />
                        <Bar dataKey="total" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Section>
                )}
                {personalTop5.length > 0 && (
                  <Section title="Top 5 gastos personales">
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                      {personalTop5.map(({ e, amt }, i) => (
                        <div key={e.id} className="py-2.5 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 w-4">#{i + 1}</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-44">{e.description}</span>
                          </div>
                          <span className="font-bold text-sm text-gray-800 dark:text-gray-200 shrink-0">{fmt(amt)}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}
                {personalPieData.length === 0 && personalTagBar.length === 0 && personalTop5.length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 col-span-2">Sin gastos personales este mes.</p>
                )}
              </div>
            )}
          </div>

        </>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{title}</h2>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  )
}
