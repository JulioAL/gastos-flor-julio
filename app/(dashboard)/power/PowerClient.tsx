'use client'

import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { createClient } from '@/lib/supabase/client'
import type { PowerAccountEntry } from '@/lib/supabase/types'

const POWER_COLS: { key: keyof PowerAccountEntry; label: string }[] = [
  { key: 'carro',             label: 'Carro' },
  { key: 'ahorro_casa',       label: 'Ahorro Casa' },
  { key: 'ahorro_extra',      label: 'Ahorro extra' },
  { key: 'sueldo',            label: 'Sueldo' },
  { key: 'cts',               label: 'CTS' },
  { key: 'intereses_ganados', label: 'Intereses ganados' },
  { key: 'gratificaciones',   label: 'Gratificaciones' },
  { key: 'afp',               label: 'AFP' },
  { key: 'emergencia',        label: 'Emergencia' },
  { key: 'jf_baby',           label: 'JF baby' },
  { key: 'bonos_utilidades',  label: 'Bonos / Utilidades' },
  { key: 'salud',             label: 'Salud' },
]

const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Setiembre','Octubre','Noviembre','Diciembre',
]

const EMPTY_FORM = Object.fromEntries([
  ['entry_year', new Date().getFullYear().toString()],
  ['entry_month', MONTHS[new Date().getMonth()]],
  ['description', ''],
  ...POWER_COLS.map(c => [c.key, '']),
]) as Record<string, string>

interface Props {
  initialEntries: PowerAccountEntry[]
}

export default function PowerClient({ initialEntries }: Props) {
  const supabase = createClient()
  const [entries, setEntries] = useState<PowerAccountEntry[]>(initialEntries)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [filterYear, setFilterYear] = useState<number>(2026)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // All available years for the selector
  const years = useMemo(() =>
    Array.from(new Set(entries.map(e => e.entry_year).filter(Boolean))).sort() as number[],
    [entries]
  )

  // Filtered entries for the table (only affects display)
  const filteredEntries = useMemo(() =>
    filterYear === 0 ? entries : entries.filter(e => e.entry_year === filterYear),
    [entries, filterYear]
  )

  // Totals always calculated from ALL entries regardless of filter
  const totals = useMemo(() => {
    const t: Record<string, number> = {}
    for (const col of POWER_COLS) {
      t[col.key] = entries.reduce((s, e) => s + ((e[col.key] as number | null) ?? 0), 0)
    }
    return t
  }, [entries])

  // Line chart: running total per entry
  const chartData = useMemo(() => {
    let running = 0
    return entries.map((e, i) => {
      const rowTotal = POWER_COLS.reduce((s, c) => s + ((e[c.key] as number | null) ?? 0), 0)
      running += rowTotal
      return { label: `${e.entry_month ?? ''} ${e.entry_year ?? ''}`.trim() || `#${i + 1}`, total: Math.round(running * 100) / 100 }
    })
  }, [entries])

  async function save(andAnother = false) {
    setSaving(true)
    const payload: Partial<PowerAccountEntry> = {
      entry_year: form.entry_year ? parseInt(form.entry_year) : undefined,
      entry_month: form.entry_month || undefined,
      description: form.description || undefined,
    }
    for (const col of POWER_COLS) {
      const val = form[col.key]
      ;(payload as Record<string, unknown>)[col.key] = val ? parseFloat(val) : null
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('power_account_entries') as any).insert(payload).select().single()
    if (data) setEntries(prev => [...prev, data])
    setSaving(false)
    if (andAnother) {
      setForm(EMPTY_FORM)
    } else {
      setShowForm(false)
      setForm(EMPTY_FORM)
    }
  }

  async function deleteEntry() {
    if (!confirmDeleteId) return
    await supabase.from('power_account_entries').delete().eq('id', confirmDeleteId)
    setEntries(prev => prev.filter(e => e.id !== confirmDeleteId))
    setConfirmDeleteId(null)
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Cuenta Power</h1>
        <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          + Nueva entrada
        </button>
      </div>

      {/* Column totals */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">Totales acumulados por columna</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-y sm:divide-y-0 divide-gray-100">
          {POWER_COLS.map(col => (
            <div key={col.key} className="p-3 border-b sm:border-b-0 sm:border-r border-gray-100 last:border-0">
              <p className="text-xs text-gray-500 font-medium">{col.label}</p>
              <p className={`text-sm font-bold mt-0.5 ${(totals[col.key] ?? 0) >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                S/ {(totals[col.key] ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Evolution chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-800 text-sm mb-4">Evolución del saldo Power</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData.slice(-24)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => `S/ ${Number(v).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`} />
              <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Full history table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-gray-800 text-sm">Historial — {filteredEntries.length} entradas</h2>
            <select
              className="border border-gray-300 rounded-lg px-2.5 py-1 text-xs"
              value={filterYear}
              onChange={e => setFilterYear(Number(e.target.value))}
            >
              <option value={0}>Todos los años</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <span className="text-sm font-bold text-indigo-700">
            Total general (todo el historial): S/ {Object.values(totals).reduce((s, v) => s + v, 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="text-xs min-w-max w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-3 py-2 font-medium text-gray-500 sticky left-0 z-20 bg-gray-50 w-12 min-w-[48px]">Año</th>
                <th className="text-left px-3 py-2 font-medium text-gray-500 sticky left-12 z-20 bg-gray-50 w-24 min-w-[96px]">Mes</th>
                <th className="text-left px-3 py-2 font-medium text-gray-500 sticky left-36 z-20 bg-gray-50 w-32 min-w-[128px] border-r border-gray-200">Detalle</th>
                {POWER_COLS.map(c => (
                  <th key={c.key} className="text-right px-3 py-2 font-medium text-gray-500 whitespace-nowrap">{c.label}</th>
                ))}
                <th className="text-right px-3 py-2 font-medium text-indigo-600 whitespace-nowrap">Total fila</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map(e => {
                const rowTotal = POWER_COLS.reduce((s, c) => s + ((e[c.key] as number | null) ?? 0), 0)
                return (
                  <tr key={e.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-600 sticky left-0 z-10 bg-white w-12 min-w-[48px]">{e.entry_year}</td>
                    <td className="px-3 py-2 text-gray-600 sticky left-12 z-10 bg-white w-24 min-w-[96px] whitespace-nowrap">{e.entry_month}</td>
                    <td className="px-3 py-2 text-gray-500 sticky left-36 z-10 bg-white w-32 min-w-[128px] truncate border-r border-gray-200">{e.description}</td>
                    {POWER_COLS.map(c => {
                      const val = e[c.key] as number | null
                      return (
                        <td key={c.key} className={`px-3 py-2 text-right whitespace-nowrap ${val == null ? 'text-gray-200' : val >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                          {val != null ? `S/ ${val.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                      )
                    })}
                    <td className={`px-3 py-2 text-right font-semibold whitespace-nowrap ${rowTotal >= 0 ? 'text-indigo-700' : 'text-red-600'}`}>
                      S/ {rowTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => setConfirmDeleteId(e.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 transition rounded p-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="sticky bottom-0">
              <tr className="bg-indigo-50 border-t-2 border-indigo-200 font-bold">
                <td className="px-3 py-2 text-indigo-800 sticky left-0 z-10 bg-indigo-50 w-12 min-w-[48px]">TOT.</td>
                <td className="px-3 py-2 sticky left-12 z-10 bg-indigo-50 w-24 min-w-[96px]"></td>
                <td className="px-3 py-2 sticky left-36 z-10 bg-indigo-50 w-32 min-w-[128px] border-r border-indigo-200"></td>
                {POWER_COLS.map(c => (
                  <td key={c.key} className={`px-3 py-2 text-right whitespace-nowrap ${(totals[c.key] ?? 0) >= 0 ? 'text-indigo-700' : 'text-red-600'}`}>
                    S/ {(totals[c.key] ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                ))}
                <td className="px-3 py-2 text-right text-indigo-800 whitespace-nowrap">
                  S/ {Object.values(totals).reduce((s, v) => s + v, 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Confirm delete modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl ring-1 ring-black/10">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Eliminar entrada</h3>
              <p className="text-sm text-gray-500">Esta acción no se puede deshacer. ¿Estás seguro?</p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-3.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition rounded-bl-2xl"
              >
                Cancelar
              </button>
              <div className="w-px bg-gray-100" />
              <button
                onClick={deleteEntry}
                className="flex-1 py-3.5 text-sm font-bold text-red-600 hover:bg-red-50 transition rounded-br-2xl"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New entry modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">Nueva entrada Power</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Año</label>
                  <input type="number" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.entry_year} onChange={e => setForm(f => ({ ...f, entry_year: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Mes</label>
                  <select className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.entry_month} onChange={e => setForm(f => ({ ...f, entry_month: e.target.value }))}>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Detalle / descripción</label>
                <input type="text" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <p className="text-xs text-gray-400 font-medium pt-1">Montos por columna</p>
              <div className="grid grid-cols-2 gap-2">
                {POWER_COLS.map(col => (
                  <div key={col.key}>
                    <label className="text-xs text-gray-500">{col.label}</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                      value={form[col.key]}
                      onChange={e => setForm(f => ({ ...f, [col.key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 px-4 py-2 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={() => save(true)} disabled={saving} className="border border-indigo-600 text-indigo-600 text-sm px-4 py-2 rounded-lg hover:bg-indigo-50 disabled:opacity-50 transition">
                {saving ? '...' : 'Guardar y agregar otra'}
              </button>
              <button onClick={() => save(false)} disabled={saving} className="bg-indigo-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
