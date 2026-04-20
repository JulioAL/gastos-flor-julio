'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { MONTH_NAMES, ACCOUNTS, EXPENSE_COLUMNS, CORTE_ACCOUNT_GROUPS, getCategoryMeta } from '@/lib/utils/accounts'
import type { BudgetMonth, BudgetIncome, BudgetExpense, BudgetTransfer, PersonalExpense } from '@/lib/supabase/types'

const CHART_COLORS = ['var(--accent)','#f59e0b','#3b82f6','#10b981','#8b5cf6','#ec4899','#14b8a6','#f43f5e','#f97316','#84cc16']

const POWER_COLS = ['carro','ahorro_casa','ahorro_extra','sueldo','cts','intereses_ganados','gratificaciones','afp','emergencia','jf_baby','bonos_utilidades','salud'] as const

interface Props {
  months: BudgetMonth[]
  expenses: PersonalExpense[]
  allExpenses: PersonalExpense[]
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


function Card({ title, children, noPad = false }: { title: string; children: React.ReactNode; noPad?: boolean }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      {title && (
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--t3)' }}>{title}</p>
        </div>
      )}
      <div className={noPad ? '' : 'px-4 py-3'}>{children}</div>
    </div>
  )
}

export default function ResumenClient({ months, expenses, allExpenses }: Props) {
  const supabase = createClient()
  const currentMonth = new Date().getMonth() + 1
  const defaultMonth = months.find(m => m.month === currentMonth) ?? months[months.length - 1]
  const [selectedMonthId, setSelectedMonthId] = useState<string>(defaultMonth?.id ?? '')
  const [income, setIncome] = useState<BudgetIncome[]>([])
  const [budgetExpenses, setBudgetExpenses] = useState<BudgetExpense[]>([])
  const [, setTransfers] = useState<BudgetTransfer[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'hogar' | 'personal'>('hogar')
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('budget_income') as any).select('*').eq('budget_month_id', selectedMonthId).in('source', ['julio', 'flor', 'otros_ingresos']),
      supabase.from('budget_expenses').select('*').eq('budget_month_id', selectedMonthId),
      supabase.from('budget_transfers').select('*').eq('budget_month_id', selectedMonthId),
    ]).then(([inc, exp, tra]) => {
      setIncome(inc.data ?? [])
      setBudgetExpenses(exp.data ?? [])
      setTransfers(tra.data ?? [])
      setLoading(false)
    })
  }, [selectedMonthId]) // eslint-disable-line react-hooks/exhaustive-deps

  const allMonthExpenses = useMemo(() =>
    allExpenses.filter(e => new Date(e.date + 'T00:00:00').getMonth() + 1 === selectedMonthNum),
    [allExpenses, selectedMonthNum]
  )
  const monthExpenses = useMemo(() =>
    expenses.filter(e => new Date(e.date + 'T00:00:00').getMonth() + 1 === selectedMonthNum),
    [expenses, selectedMonthNum]
  )

  const totalIncome = income.filter(i => i.included_in_budget).reduce((s, i) => s + (i.amount ?? 0), 0)
  const totalBudgeted = budgetExpenses.reduce((s, e) => s + (e.amount ?? 0), 0)
  const totalReal = monthExpenses.reduce((s, e) => s + expenseTotal(e), 0)
  const balance = totalIncome - totalReal

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


  function subcatLabel(e: PersonalExpense): string {
    const catMeta = getCategoryMeta(e.category ?? '')
    const catLbl = catMeta?.label ?? e.category ?? 'Sin categoría'
    if (!e.subcategory) return catLbl
    const subLbl = catMeta?.subcategories.find(s => s.key === e.subcategory)?.label
    return subLbl ? `${catLbl} · ${subLbl}` : catLbl
  }

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

  const hogarTop5 = useMemo(() => {
    const hogarAmt = (e: PersonalExpense) => {
      if (isHogarPending(e)) return hogarPendingAmount(e)
      return EXPENSE_COLUMNS.filter(c => c.key !== 'julio' && c.key !== 'flor')
        .reduce((s, c) => s + ((e[c.key as keyof PersonalExpense] as number | null) ?? 0), 0)
    }
    return [...allMonthExpenses].filter(e => hogarAmt(e) > 0).sort((a, b) => hogarAmt(b) - hogarAmt(a)).slice(0, 5)
      .map(e => ({ e, amt: hogarAmt(e) }))
  }, [allMonthExpenses])

  const personalTop5 = useMemo(() => {
    const personalAmt = (e: PersonalExpense) => (e.julio ?? 0) + (e.flor ?? 0)
    return [...monthExpenses].filter(e => personalAmt(e) > 0).sort((a, b) => personalAmt(b) - personalAmt(a)).slice(0, 5)
      .map(e => ({ e, amt: personalAmt(e) }))
  }, [monthExpenses])

  return (
    <div className="space-y-5 pb-8">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--t)' }}>Resumen</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>{MONTH_NAMES[selectedMonthNum]} 2026</p>
        </div>
        <select
          value={selectedMonthId}
          onChange={e => setSelectedMonthId(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm"
          style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--t)' }}
        >
          {months.map(m => (
            <option key={m.id} value={m.id}>{MONTH_NAMES[m.month]} 2026</option>
          ))}
        </select>
      </div>

      {/* ── Hero balance card ───────────────────────────────── */}
      <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'var(--accent)' }}>
        <div className="absolute" style={{ top: -24, right: -24, width: 96, height: 96, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <div className="absolute" style={{ bottom: -32, left: -16, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Balance del mes</p>
        {loading
          ? <p className="text-3xl font-mono font-bold" style={{ color: '#fff' }}>—</p>
          : <p className="text-3xl font-mono font-bold" style={{ color: '#fff' }}>{fmt(balance)}</p>
        }
        <div className="flex gap-5 mt-4" style={{ position: 'relative' }}>
          <div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>Ingresos</p>
            <p className="text-sm font-mono font-semibold" style={{ color: '#fff' }}>{loading ? '—' : fmt(totalIncome)}</p>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
          <div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>Gastos</p>
            <p className="text-sm font-mono font-semibold" style={{ color: '#fff' }}>{loading ? '—' : fmt(totalReal)}</p>
          </div>
          {totalBudgeted > 0 && !loading && (
            <>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
              <div>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>Presupuestado</p>
                <p className="text-sm font-mono font-semibold" style={{ color: '#fff' }}>{fmt(totalBudgeted)}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Scotiabank accounts grid ────────────────────────── */}
      {!loading && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--t3)' }}>Cuentas Scotiabank</p>
          <div className="grid grid-cols-2 gap-3">
            {ACCOUNTS.map(acc => {
              const real = acc.key === 'power' ? powerTotal : (realByAccount[acc.key] ?? 0)
              const budget = acc.key === 'power' ? 0 : (scotByAccount[acc.key] ?? 0)
              const pct = budget > 0 ? real / budget : 0
              const over = pct >= 1, close = pct >= 0.85
              return (
                <div key={acc.key} className="rounded-2xl p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--t3)' }}>{acc.label}</p>
                  <p className="font-mono font-bold text-base leading-tight" style={{ color: 'var(--t)' }}>{fmt(real)}</p>
                  {budget > 0 && (
                    <>
                      <div className="mt-2" style={{ height: 6, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 4,
                          width: `${Math.min(pct, 1) * 100}%`,
                          background: over ? 'var(--red)' : close ? 'var(--amber)' : 'var(--accent)',
                          transition: 'width .3s',
                        }} />
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--t3)' }}>de {fmt(budget)}</p>
                    </>
                  )}
                  {acc.key === 'power' && (
                    <p className="text-xs mt-1 truncate" style={{ color: 'var(--t3)' }}>Ahorros e inversiones</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}


      {/* ── Income ──────────────────────────────────────────── */}
      {!loading && income.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--t3)' }}>Ingresos del mes</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {income.map((i, idx) => (
              <div key={i.id} className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: idx < income.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--t)' }}>{i.description ?? i.source}</p>
                  {!i.included_in_budget && <p className="text-xs" style={{ color: 'var(--t3)' }}>no incluido</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-sm" style={{ color: 'var(--t)' }}>{fmt(i.amount ?? 0)}</span>
                  {!i.included_in_budget && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#94a3b822', color: '#94a3b8' }}>Extra</span>
                  )}
                </div>
              </div>
            ))}
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'var(--bg2)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--t)' }}>Total incluido</p>
              <span className="font-mono font-semibold text-base" style={{ color: 'var(--t)' }}>{fmt(totalIncome)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Hogar / Personal tabs ───────────────────────────── */}
      {!loading && (
        <>
          <div className="flex gap-1 rounded-xl p-1" style={{ background: 'var(--bg2)' }}>
            {(['hogar', 'personal'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className="flex-1 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={activeTab === t
                  ? { background: 'var(--surface)', color: 'var(--accent)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                  : { color: 'var(--t2)' }
                }
              >
                {t === 'hogar' ? 'Hogar' : 'Personal'}
              </button>
            ))}
          </div>

          {activeTab === 'hogar' && (
            <div className="grid sm:grid-cols-2 gap-4">
              {hogarPieData.length > 0 && (
                <Card title="Distribución">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={hogarPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} labelLine={false}>
                        {hogarPieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip
                        formatter={(v) => fmt(Number(v))}
                        contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--t)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1.5">
                    {hogarPieData.slice(0, 5).map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span className="text-xs truncate" style={{ color: 'var(--t2)' }}>{d.name}</span>
                        </div>
                        <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--t2)' }}>{fmt(d.value)}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              {hogarTop5.length > 0 && (
                <Card title="Top 5 gastos hogar" noPad>
                  {hogarTop5.map(({ e, amt }, i) => (
                    <div key={e.id} className="px-4 py-3 flex items-center gap-3"
                      style={{ borderBottom: i < 4 ? '1px solid var(--border)' : '' }}>
                      <span className="text-xs font-bold w-4" style={{ color: 'var(--t3)' }}>#{i + 1}</span>
                      <span className="text-sm flex-1 truncate" style={{ color: 'var(--t)' }}>{e.description}</span>
                      <span className="font-mono font-semibold text-sm" style={{ color: 'var(--t)' }}>{fmt(amt)}</span>
                    </div>
                  ))}
                </Card>
              )}
              {hogarTagBar.length > 0 && (
                <Card title="Por categoría">
                  <ResponsiveContainer width="100%" height={Math.max(180, hogarTagBar.length * 28)}>
                    <BarChart data={hogarTagBar} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `S/${v}`} />
                      <YAxis type="category" dataKey="cat" tick={{ fontSize: 10 }} width={130} />
                      <Tooltip
                        formatter={(v) => fmt(Number(v))}
                        contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--t)' }}
                      />
                      <Bar dataKey="total" fill="var(--accent)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}
              {hogarPieData.length === 0 && hogarTop5.length === 0 && (
                <p className="text-sm col-span-2" style={{ color: 'var(--t3)' }}>Sin gastos hogar este mes.</p>
              )}
            </div>
          )}

          {activeTab === 'personal' && (
            <div className="grid sm:grid-cols-2 gap-4">
              {personalPieData.length > 0 && (
                <Card title="Distribución">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={personalPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} labelLine={false}>
                        {personalPieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip
                        formatter={(v) => fmt(Number(v))}
                        contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--t)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1.5">
                    {personalPieData.slice(0, 5).map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span className="text-xs truncate" style={{ color: 'var(--t2)' }}>{d.name}</span>
                        </div>
                        <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--t2)' }}>{fmt(d.value)}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              {personalTop5.length > 0 && (
                <Card title="Top 5 personales" noPad>
                  {personalTop5.map(({ e, amt }, i) => (
                    <div key={e.id} className="px-4 py-3 flex items-center gap-3"
                      style={{ borderBottom: i < 4 ? '1px solid var(--border)' : '' }}>
                      <span className="text-xs font-bold w-4" style={{ color: 'var(--t3)' }}>#{i + 1}</span>
                      <span className="text-sm flex-1 truncate" style={{ color: 'var(--t)' }}>{e.description}</span>
                      <span className="font-mono font-semibold text-sm" style={{ color: 'var(--t)' }}>{fmt(amt)}</span>
                    </div>
                  ))}
                </Card>
              )}
              {personalTagBar.length > 0 && (
                <Card title="Por categoría">
                  <ResponsiveContainer width="100%" height={Math.max(180, personalTagBar.length * 28)}>
                    <BarChart data={personalTagBar} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `S/${v}`} />
                      <YAxis type="category" dataKey="cat" tick={{ fontSize: 10 }} width={130} />
                      <Tooltip
                        formatter={(v) => fmt(Number(v))}
                        contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--t)' }}
                      />
                      <Bar dataKey="total" fill="var(--accent)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}
              {personalPieData.length === 0 && personalTop5.length === 0 && (
                <p className="text-sm col-span-2" style={{ color: 'var(--t3)' }}>Sin gastos personales este mes.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
