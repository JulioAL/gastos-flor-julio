'use client'

import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts'
import { EXPENSE_COLUMNS, MONTH_NAMES, ACCOUNTS } from '@/lib/utils/accounts'
import type { PersonalExpense } from '@/lib/supabase/types'

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#14b8a6','#f97316','#84cc16']

interface Props {
  expenses: PersonalExpense[]
  powerEntries: Record<string, unknown>[]
}

function expenseTotal(e: PersonalExpense): number {
  return EXPENSE_COLUMNS.reduce((s, c) => s + ((e[c.key as keyof PersonalExpense] as number | null) ?? 0), 0)
}

export default function DashboardClient({ expenses, powerEntries }: Props) {
  const currentMonth = new Date().getMonth() + 1
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  const months = useMemo(() =>
    Array.from(new Set(expenses.map(e => new Date(e.date).getMonth() + 1))).sort(),
    [expenses]
  )

  const monthExpenses = useMemo(() =>
    expenses.filter(e => new Date(e.date).getMonth() + 1 === selectedMonth),
    [expenses, selectedMonth]
  )

  // Pie: distribution by account/column
  const pieData = useMemo(() => {
    const totals: Record<string, number> = {}
    for (const e of monthExpenses) {
      for (const col of EXPENSE_COLUMNS) {
        const val = (e[col.key as keyof PersonalExpense] as number | null) ?? 0
        if (val) totals[col.label] = (totals[col.label] ?? 0) + val
      }
    }
    return Object.entries(totals).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value)
  }, [monthExpenses])

  // Bar: monthly totals
  const barData = useMemo(() =>
    months.map(m => ({
      mes: MONTH_NAMES[m]?.slice(0, 3),
      total: Math.round(expenses.filter(e => new Date(e.date).getMonth() + 1 === m).reduce((s, e) => s + expenseTotal(e), 0) * 100) / 100,
    })),
    [expenses, months]
  )

  // Top 5 expenses this month
  const top5 = [...monthExpenses].sort((a, b) => expenseTotal(b) - expenseTotal(a)).slice(0, 5)

  // Power evolution
  const powerLine = useMemo(() => {
    const byMonth: Record<string, number> = {}
    for (const entry of powerEntries) {
      const key = `${entry.entry_year}-${entry.entry_month}`
      const cols = ['ahorro_casa','ahorro_extra','sueldo','cts','intereses_ganados','emergencia','jf_baby','salud','carro','afp','gratificaciones','bonos_utilidades']
      const sum = cols.reduce((s, c) => s + ((entry[c] as number | null) ?? 0), 0)
      byMonth[key] = (byMonth[key] ?? 0) + sum
    }
    return Object.entries(byMonth).map(([k, v]) => {
      const [year, month] = k.split('-')
      return { label: `${month?.slice(0,3) ?? ''} ${year}`, total: Math.round(v * 100) / 100 }
    }).slice(-12)
  }, [powerEntries])

  // Totals: personal vs hogar
  const personalTotal = monthExpenses.reduce((s, e) => s + ((e.julio ?? 0)), 0)
  const hogarTotal = monthExpenses.reduce((s, e) => {
    return s + EXPENSE_COLUMNS.filter(c => c.key !== 'julio' && c.key !== 'flor')
      .reduce((ss, c) => ss + ((e[c.key as keyof PersonalExpense] as number | null) ?? 0), 0)
  }, 0)

  return (
    <div className="space-y-6 pb-20 sm:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
          {months.map(m => <option key={m} value={m}>{MONTH_NAMES[m]}</option>)}
        </select>
      </div>

      {/* Personal vs hogar */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-purple-50 rounded-xl p-4">
          <p className="text-xs text-purple-600 font-medium">Personal</p>
          <p className="text-lg font-bold text-purple-700">S/ {personalTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-xs text-blue-600 font-medium">Hogar</p>
          <p className="text-lg font-bold text-blue-700">S/ {hogarTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Pie chart */}
      {pieData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-800 text-sm mb-4">Distribución por cuenta</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `S/ ${Number(v).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bar chart */}
      {barData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-800 text-sm mb-4">Gastos por mes (2026)</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData}>
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `S/ ${Number(v).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`} />
              <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top 5 */}
      {top5.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">Top 5 gastos del mes</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {top5.map((e, i) => (
              <div key={e.id} className="px-4 py-2.5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 w-4">#{i + 1}</span>
                  <span className="text-sm text-gray-700 truncate max-w-52">{e.description}</span>
                </div>
                <span className="font-bold text-sm text-gray-800">S/ {expenseTotal(e).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Power evolution */}
      {powerLine.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-800 text-sm mb-4">Evolución cuenta Power</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={powerLine}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => `S/ ${Number(v).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`} />
              <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
