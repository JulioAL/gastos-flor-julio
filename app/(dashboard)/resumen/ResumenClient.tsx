'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { MONTH_NAMES, ACCOUNTS, EXPENSE_COLUMNS, CORTE_ACCOUNT_GROUPS, getCategoryMeta } from '@/lib/utils/accounts'
import type { BudgetMonth, BudgetIncome, BudgetExpense, BudgetTransfer, PersonalExpense } from '@/lib/supabase/types'
// BudgetTransfer kept for setTransfers state type

const CHART_COLORS = ['#059669','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#14b8a6','#f97316','#84cc16']

const POWER_COLS = ['carro','ahorro_casa','ahorro_extra','sueldo','cts','intereses_ganados','gratificaciones','afp','emergencia','jf_baby','bonos_utilidades','salud'] as const

interface Props {
  months: BudgetMonth[]
  expenses: PersonalExpense[]       // solo el usuario actual — para tab personal
  allExpenses: PersonalExpense[]    // todos los usuarios — para tab hogar
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

export default function ResumenClient({ months, expenses, allExpenses }: Props) {
  const supabase = createClient()
  const currentMonth = new Date().getMonth() + 1
  const defaultMonth = months.find(m => m.month === currentMonth) ?? months[months.length - 1]
  const [selectedMonthId, setSelectedMonthId] = useState<string>(defaultMonth?.id ?? '')
  const [income, setIncome] = useState<BudgetIncome[]>([])
  const [budgetExpenses, setBudgetExpenses] = useState<BudgetExpense[]>([])
  const [transfers, setTransfers] = useState<BudgetTransfer[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'hogar' | 'personal'>('hogar')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'))
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  const [powerTotal, setPowerTotal] = useState(0)

  useEffect(() => {
    supabase.from('power_account_entries').select(POWER_COLS.join(','))
      .then(({ data }) => {
        const total = (data ?? []).reduce((sum: number, e: Record<string, number | null>) =>
          sum + POWER_COLS.reduce((s, col) => s + (e[col] ?? 0), 0), 0)
        setPowerTotal(total)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedMonthNum = months.find(m => m.id === selectedMonthId)?.month ?? currentMonth

  useEffect(() => {
    if (!selectedMonthId) return
    setLoading(true)
    Promise.all([
      (supabase.from('budget_income') as any).select('*').eq('budget_month_id', selectedMonthId).in('source', ['julio', 'flor', 'otros_ingresos']),
      supabase.from('budget_expenses').select('*').eq('budget_month_id', selectedMonthId),
      supabase.from('budget_transfers').select('*').eq('budget_month_id', selectedMonthId),
    ]).then(([inc, exp, tra]) => {
      setIncome(inc.data ?? [])
      setBudgetExpenses(exp.data ?? [])
      setTransfers(tra.data ?? [])
      setLoading(false)
    })
  }, [selectedMonthId])

  // All users' expenses for selected month — used for hogar tab
  const allMonthExpenses = useMemo(() =>
    allExpenses.filter(e => new Date(e.date + 'T00:00:00').getMonth() + 1 === selectedMonthNum),
    [allExpenses, selectedMonthNum]
  )

  // Current user's expenses for selected month — used for personal tab
  const monthExpenses = useMemo(() =>
    expenses.filter(e => new Date(e.date + 'T00:00:00').getMonth() + 1 === selectedMonthNum),
    [expenses, selectedMonthNum]
  )

  // Totals
  const totalIncome = income.filter(i => i.included_in_budget).reduce((s, i) => s + (i.amount ?? 0), 0)
  const totalBudgeted = budgetExpenses.reduce((s, e) => s + (e.amount ?? 0), 0)
  const totalReal = monthExpenses.reduce((s, e) => s + expenseTotal(e), 0)
  const balance = totalIncome - totalReal

  // Scotiabank account balances (same logic as CuentasClient)
  const scotByAccount = useMemo(() => {
    const r: Record<string, number> = {}
    for (const acc of ACCOUNTS) {
      if (acc.key === 'power') continue
      const direct = budgetExpenses.find(e => e.account === acc.key && e.category === acc.key)
      r[acc.key] = direct
        ? (direct.amount ?? 0)
        : budgetExpenses.filter(e => e.account === acc.key && e.category !== acc.key)
            .reduce((s, e) => s + (e.amount ?? 0), 0)
    }
    return r
  }, [budgetExpenses])

  // Budget by account
  const budgetByAccount = useMemo(() => {
    const r: Record<string, number> = {}
    for (const e of budgetExpenses) {
      if (e.account) r[e.account] = (r[e.account] ?? 0) + (e.amount ?? 0)
    }
    return r
  }, [budgetExpenses])

  // Real by account (using CORTE_ACCOUNT_GROUPS mapping) — all users for hogar
  const realByAccount = useMemo(() => {
    const r: Record<string, number> = {}
    let pending = 0
    for (const e of allMonthExpenses) {
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
  }, [allMonthExpenses])

  // Accounts that appear in either budget or real
  const comparisonAccounts = useMemo(() => {
    const keys = new Set([...Object.keys(budgetByAccount), ...Object.keys(realByAccount).filter(k => k !== '_pending')])
    return ACCOUNTS.filter(a => keys.has(a.key))
  }, [budgetByAccount, realByAccount])

  // Hogar pie: by account column — all users
  const hogarPieData = useMemo(() => {
    const totals: Record<string, number> = {}
    for (const e of allMonthExpenses) {
      for (const col of EXPENSE_COLUMNS) {
        if (col.key === 'julio' || col.key === 'flor') continue
        const val = (e[col.key as keyof PersonalExpense] as number | null) ?? 0
        if (val) totals[col.label] = (totals[col.label] ?? 0) + val
      }
      if (isHogarPending(e)) totals['Sin cuenta'] = (totals['Sin cuenta'] ?? 0) + hogarPendingAmount(e)
    }
    return Object.entries(totals).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 })).sort((a, b) => b.value - a.value)
  }, [allMonthExpenses])

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

  function subcatLabel(e: PersonalExpense): string {
    const catMeta = getCategoryMeta(e.category ?? '')
    const catLbl = catMeta?.label ?? e.category ?? 'Sin categoría'
    if (!e.subcategory) return catLbl
    const subLbl = catMeta?.subcategories.find(s => s.key === e.subcategory)?.label
    return subLbl ? `${catLbl} · ${subLbl}` : catLbl
  }

  // Hogar bar: by category + subcategory — all users
  const hogarTagBar = useMemo(() => {
    const totals: Record<string, number> = {}
    for (const e of allMonthExpenses) {
      let hogarAmt = 0
      for (const col of EXPENSE_COLUMNS) {
        if (col.key === 'julio' || col.key === 'flor') continue
        hogarAmt += (e[col.key as keyof PersonalExpense] as number | null) ?? 0
      }
      if (isHogarPending(e)) hogarAmt += hogarPendingAmount(e)
      if (hogarAmt <= 0) continue
      const label = e.category ? subcatLabel(e) : 'Sin categoría'
      totals[label] = (totals[label] ?? 0) + hogarAmt
    }
    return Object.entries(totals).map(([cat, total]) => ({ cat, total: Math.round(total * 100) / 100 })).sort((a, b) => b.total - a.total)
  }, [allMonthExpenses])

  // Personal bar: by category + subcategory
  const personalTagBar = useMemo(() => {
    const totals: Record<string, number> = {}
    for (const e of monthExpenses) {
      const amt = (e.julio ?? 0) + (e.flor ?? 0)
      if (amt <= 0) continue
      const label = e.category ? subcatLabel(e) : 'Sin categoría'
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
    return [...allMonthExpenses].filter(e => hogarAmt(e) > 0).sort((a, b) => hogarAmt(b) - hogarAmt(a)).slice(0, 5)
      .map(e => ({ e, amt: hogarAmt(e) }))
  }, [allMonthExpenses])

  // Top 5 personal expenses (sorted by personal amount)
  const personalTop5 = useMemo(() => {
    const personalAmt = (e: PersonalExpense) => (e.julio ?? 0) + (e.flor ?? 0)
    return [...monthExpenses].filter(e => personalAmt(e) > 0).sort((a, b) => personalAmt(b) - personalAmt(a)).slice(0, 5)
      .map(e => ({ e, amt: personalAmt(e) }))
  }, [monthExpenses])


  return (
    <div className="space-y-6 pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Resumen</h1>
        <select
          className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm"
          value={selectedMonthId}
          onChange={e => setSelectedMonthId(e.target.value)}
        >
          {months.map(m => (
            <option key={m.id} value={m.id}>{MONTH_NAMES[m.month]} 2026</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-slate-400 dark:text-slate-500 text-sm">Cargando...</p>
      ) : (
        <>

          {/* Scotiabank accounts */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Resumen por cuenta Scotiabank</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-700">
              {ACCOUNTS.map(acc => {
                const amt = acc.key === 'power' ? powerTotal : (scotByAccount[acc.key] ?? 0)
                return (
                  <div key={acc.key} className="p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{acc.label}</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">
                      S/ {amt.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{acc.description}</p>
                  </div>
                )
              })}
            </div>
          </div>


          {/* Income */}
          {income.length > 0 && (
            <Section title="Ingresos del mes">
              <table className="w-full text-sm">
                <tbody>
                  {income.map(i => (
                    <tr key={i.id} className="border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <td className="py-2 text-slate-700 dark:text-slate-300">{i.description ?? i.source}</td>
                      <td className="py-2 text-right font-medium text-slate-900 dark:text-slate-100">{fmt(i.amount ?? 0)}</td>
                      {!i.included_in_budget && <td className="py-2 pl-2 text-xs text-slate-400 dark:text-slate-500">no incluido</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}

          {/* Hogar / Personal tabs */}
          <div className="space-y-3">
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('hogar')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition ${activeTab === 'hogar' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Hogar
              </button>
              <button
                onClick={() => setActiveTab('personal')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition ${activeTab === 'personal' ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
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
                        <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: 8, color: isDark ? '#f9fafb' : '#111827' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <p className="text-center text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">
                      Total: {fmt(hogarPieData.reduce((s, d) => s + d.value, 0))}
                    </p>
                  </Section>
                )}
                {hogarTagBar.length > 0 && (
                  <Section title="Por categoría">
                    <ResponsiveContainer width="100%" height={Math.max(200, hogarTagBar.length * 30)}>
                      <BarChart data={hogarTagBar} layout="vertical" margin={{ left: 8, right: 16 }}>
                        <XAxis type="number" tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }} tickFormatter={v => `S/${v}`} />
                        <YAxis type="category" dataKey="cat" tick={{ fontSize: 10, fill: isDark ? '#d1d5db' : '#374151' }} width={130} />
                        <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: 8, color: isDark ? '#f9fafb' : '#111827' }} />
                        <Bar dataKey="total" fill="#059669" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Section>
                )}
                {hogarTop5.length > 0 && (
                  <Section title="Top 5 gastos hogar">
                    <div className="divide-y divide-slate-50 dark:divide-slate-700">
                      {hogarTop5.map(({ e, amt }, i) => (
                        <div key={e.id} className="py-2.5 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-4">#{i + 1}</span>
                            <span className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-44">{e.description}</span>
                          </div>
                          <span className="font-bold text-sm text-slate-800 dark:text-slate-200 shrink-0">{fmt(amt)}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}
                {hogarPieData.length === 0 && hogarTagBar.length === 0 && hogarTop5.length === 0 && (
                  <p className="text-sm text-slate-400 dark:text-slate-500 col-span-2">Sin gastos hogar este mes.</p>
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
                        <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: 8, color: isDark ? '#f9fafb' : '#111827' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <p className="text-center text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">
                      Total: {fmt(personalPieData.reduce((s, d) => s + d.value, 0))}
                    </p>
                  </Section>
                )}
                {personalTagBar.length > 0 && (
                  <Section title="Por categoría">
                    <ResponsiveContainer width="100%" height={Math.max(200, personalTagBar.length * 30)}>
                      <BarChart data={personalTagBar} layout="vertical" margin={{ left: 8, right: 16 }}>
                        <XAxis type="number" tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }} tickFormatter={v => `S/${v}`} />
                        <YAxis type="category" dataKey="cat" tick={{ fontSize: 10, fill: isDark ? '#d1d5db' : '#374151' }} width={130} />
                        <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: 8, color: isDark ? '#f9fafb' : '#111827' }} />
                        <Bar dataKey="total" fill="#a855f7" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Section>
                )}
                {personalTop5.length > 0 && (
                  <Section title="Top 5 gastos personales">
                    <div className="divide-y divide-slate-50 dark:divide-slate-700">
                      {personalTop5.map(({ e, amt }, i) => (
                        <div key={e.id} className="py-2.5 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-4">#{i + 1}</span>
                            <span className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-44">{e.description}</span>
                          </div>
                          <span className="font-bold text-sm text-slate-800 dark:text-slate-200 shrink-0">{fmt(amt)}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}
                {personalPieData.length === 0 && personalTagBar.length === 0 && personalTop5.length === 0 && (
                  <p className="text-sm text-slate-400 dark:text-slate-500 col-span-2">Sin gastos personales este mes.</p>
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
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{title}</h2>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  )
}
