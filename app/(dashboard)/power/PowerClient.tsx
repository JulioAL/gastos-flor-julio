'use client'

import { useState, useMemo, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { POWER_COLS } from '@/lib/utils/accounts'
import type { PowerAccountEntry } from '@/lib/supabase/types'

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
  const [filterDesc, setFilterDesc] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [chartCol, setChartCol] = useState<string>('total')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectMode, setSelectMode] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  // All available years for the selector
  const years = useMemo(() =>
    Array.from(new Set(entries.map(e => e.entry_year).filter(Boolean))).sort() as number[],
    [entries]
  )

  // Filtered entries for the table (only affects display)
  const filteredEntries = useMemo(() => {
    let result = filterYear === 0 ? entries : entries.filter(e => e.entry_year === filterYear)
    if (filterDesc.trim()) {
      const q = filterDesc.trim().toLowerCase()
      result = result.filter(e => e.description?.toLowerCase().includes(q))
    }
    return result
  }, [entries, filterYear, filterDesc])

  // Totals always calculated from ALL entries regardless of filter
  const totals = useMemo(() => {
    const t: Record<string, number> = {}
    for (const col of POWER_COLS) {
      t[col.key] = entries.reduce((s, e) => s + (((e as Record<string, unknown>)[col.key] as number | null) ?? 0), 0)
    }
    return t
  }, [entries])

  const MONTH_ORDER: Record<string, number> = {
    enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
    julio: 7, agosto: 8, setiembre: 9, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
  }

  // Line chart: group by month+year, one point per month, running totals for all cols + total
  const chartData = useMemo(() => {
    const grouped: Record<string, Record<string, number>> = {}
    for (const e of entries) {
      const monthNum = MONTH_ORDER[e.entry_month?.toLowerCase() ?? ''] ?? 0
      const year = e.entry_year ?? 0
      const key = `${year}-${String(monthNum).padStart(2, '0')}`
      if (!grouped[key]) grouped[key] = {}
      const eRec = e as Record<string, unknown>
      for (const c of POWER_COLS) {
        grouped[key][c.key] = (grouped[key][c.key] ?? 0) + ((eRec[c.key] as number | null) ?? 0)
      }
      const rowTotal = POWER_COLS.reduce((s, c) => s + ((eRec[c.key] as number | null) ?? 0), 0)
      grouped[key].total = (grouped[key].total ?? 0) + rowTotal
    }
    const sortedKeys = Object.keys(grouped).sort()
    const running: Record<string, number> = {}
    return sortedKeys.map(key => {
      const [year, monthPad] = key.split('-')
      const monthNum = parseInt(monthPad)
      const monthName = Object.entries(MONTH_ORDER).find(([, v]) => v === monthNum)?.[0] ?? key
      const point: Record<string, number | string> = {
        label: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`,
      }
      for (const field of ['total', ...POWER_COLS.map(c => c.key)]) {
        const delta = grouped[key][field] ?? 0
        running[field] = (running[field] ?? 0) + delta
        point[field] = Math.round(running[field] * 100) / 100
        point[`${field}_delta`] = Math.round(delta * 100) / 100
      }
      return point
    })
  }, [entries])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (confirmDeleteId) setConfirmDeleteId(null)
      else if (showForm) { setShowForm(false); setForm(EMPTY_FORM) }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [showForm, confirmDeleteId])

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

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredEntries.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredEntries.map(e => e.id)))
    }
  }

  async function bulkDelete() {
    if (!confirm(`¿Eliminar ${selectedIds.size} entrada${selectedIds.size !== 1 ? 's' : ''}? Esta acción no se puede deshacer.`)) return
    setBulkDeleting(true)
    const ids = Array.from(selectedIds)
    await supabase.from('power_account_entries').delete().in('id', ids)
    setEntries(prev => prev.filter(e => !selectedIds.has(e.id)))
    setSelectedIds(new Set())
    setSelectMode(false)
    setBulkDeleting(false)
  }

  function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: Record<string, number | string> }[] }) {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    const value = d[chartCol] as number
    const delta = d[`${chartCol}_delta`] as number
    const fmt = (n: number) => `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-lg text-xs space-y-1">
        <p className="font-semibold text-slate-700 dark:text-slate-300">{d.label as string}</p>
        <p className="text-slate-800 dark:text-slate-200">{fmt(value)}</p>
        {delta !== 0 && (
          <p className={delta > 0 ? 'text-accent font-semibold' : 'text-red-500 dark:text-red-400 font-semibold'}>
            {delta > 0 ? '+' : ''}{fmt(delta)}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Cuenta Power</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm px-4 py-2 rounded-lg transition">
          + Nueva entrada
        </button>
      </div>

      {/* Column totals */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Totales acumulados por columna</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-y sm:divide-y-0 divide-slate-100 dark:divide-slate-700">
          {POWER_COLS.map(col => (
            <div key={col.key} className="p-3 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-700 last:border-0">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{col.label}</p>
              <p className={`text-sm font-bold mt-0.5 ${(totals[col.key] ?? 0) >= 0 ? 'text-atext' : 'text-red-600 dark:text-red-400'}`}>
                S/ {(totals[col.key] ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Evolution chart */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Evolución del saldo Power</h2>
            <select
              className="border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs"
              value={chartCol}
              onChange={e => setChartCol(e.target.value)}
            >
              <option value="total">Saldo total</option>
              {POWER_COLS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey={chartCol} stroke="var(--accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Full history table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700" style={{ overflow: 'clip' }}>
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Historial — {filteredEntries.length} entradas</h2>
            <select
              className="border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1 text-xs"
              value={filterYear}
              onChange={e => setFilterYear(Number(e.target.value))}
            >
              <option value={0}>Todos los años</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <input
              type="text"
              placeholder="Buscar descripción..."
              value={filterDesc}
              onChange={e => setFilterDesc(e.target.value)}
              className="border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 w-44"
            />
            <button
              onClick={() => { setSelectMode(m => !m); setSelectedIds(new Set()) }}
              className={`text-xs px-3 py-1 rounded-lg border transition ${selectMode ? 'bg-asoft border-accent text-atext' : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              {selectMode ? 'Cancelar selección' : 'Seleccionar'}
            </button>
            {selectMode && selectedIds.size > 0 && (
              <button
                onClick={bulkDelete}
                disabled={bulkDeleting}
                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-lg transition disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
                {bulkDeleting ? 'Eliminando...' : `Eliminar ${selectedIds.size}`}
              </button>
            )}
          </div>
          <span className="text-sm font-bold text-atext">
            Total general (todo el historial): S/ {Object.values(totals).reduce((s, v) => s + v, 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="overflow-x-auto touch-pan-x md:max-h-[60vh] md:overflow-y-auto">
          <table className="text-xs min-w-max w-full power-table">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                {selectMode && (
                  <th className="px-3 py-2 sticky left-0 z-20 bg-slate-50 dark:bg-slate-900 w-10 min-w-[40px]">
                    <button onClick={toggleSelectAll} className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition ${selectedIds.size === filteredEntries.length && filteredEntries.length > 0 ? 'bg-accent border-accent' : 'border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700'}`}>
                      {selectedIds.size === filteredEntries.length && filteredEntries.length > 0
                        ? <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        : selectedIds.size > 0 ? <span className="w-2.5 h-0.5 bg-accent rounded"/> : null}
                    </button>
                  </th>
                )}
                <th className="text-left px-3 py-2 font-medium text-slate-500 dark:text-slate-400 sticky left-0 z-20 bg-slate-50 dark:bg-slate-900 w-12 min-w-[48px]">Año</th>
                <th className="text-left px-3 py-2 font-medium text-slate-500 dark:text-slate-400 sticky left-12 z-20 bg-slate-50 dark:bg-slate-900 w-24 min-w-[96px]">Mes</th>
                <th className="text-left px-3 py-2 font-medium text-slate-500 dark:text-slate-400 sticky left-36 z-20 bg-slate-50 dark:bg-slate-900 w-32 min-w-[128px] border-r border-slate-200 dark:border-slate-700">Detalle</th>
                {POWER_COLS.map(c => (
                  <th key={c.key} className="text-right px-3 py-2 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{c.label}</th>
                ))}
                <th className="text-right px-3 py-2 font-medium text-accent whitespace-nowrap">Total fila</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map(e => {
                const rowTotal = POWER_COLS.reduce((s, c) => s + (((e as Record<string, unknown>)[c.key] as number | null) ?? 0), 0)
                const isSelected = selectedIds.has(e.id)
                return (
                  <tr
                    key={e.id}
                    className={`border-b border-slate-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${isSelected ? 'bg-col-current' : ''}`}
                    onClick={selectMode ? () => toggleSelect(e.id) : undefined}
                    style={selectMode ? { cursor: 'pointer' } : undefined}
                  >
                    {selectMode && (
                      <td className="px-3 py-2 sticky left-0 z-10 bg-inherit w-10 min-w-[40px]">
                        <span className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${isSelected ? 'bg-accent border-accent' : 'border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700'}`}>
                          {isSelected && <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                        </span>
                      </td>
                    )}
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400 sticky left-0 z-10 bg-white dark:bg-slate-800 w-12 min-w-[48px]">{e.entry_year}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400 sticky left-12 z-10 bg-white dark:bg-slate-800 w-24 min-w-[96px] whitespace-nowrap">{e.entry_month}</td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400 sticky left-36 z-10 bg-white dark:bg-slate-800 w-32 min-w-[128px] truncate border-r border-slate-200 dark:border-slate-700">{e.description}</td>
                    {POWER_COLS.map(c => {
                      const val = (e as Record<string, unknown>)[c.key] as number | null
                      return (
                        <td key={c.key} className={`px-3 py-2 text-right whitespace-nowrap ${val == null ? 'text-slate-200 dark:text-slate-700' : val >= 0 ? 'text-slate-800 dark:text-slate-200' : 'text-red-600 dark:text-red-400'}`}>
                          {val != null ? `S/ ${val.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                      )
                    })}
                    <td className={`px-3 py-2 text-right font-semibold whitespace-nowrap ${rowTotal >= 0 ? 'text-atext' : 'text-red-600 dark:text-red-400'}`}>
                      S/ {rowTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => setConfirmDeleteId(e.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition rounded p-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="sticky bottom-0 z-10">
              <tr className="bg-asoft border-t-2 border-accent font-bold">
                <td className="px-3 py-2 text-atext sticky left-0 z-10 bg-asoft w-12 min-w-[48px]">TOT.</td>
                <td className="px-3 py-2 sticky left-12 z-10 bg-asoft w-24 min-w-[96px]"></td>
                <td className="px-3 py-2 sticky left-36 z-10 bg-asoft w-32 min-w-[128px] border-r border-accent"></td>
                {POWER_COLS.map(c => (
                  <td key={c.key} className={`px-3 py-2 text-right whitespace-nowrap ${(totals[c.key] ?? 0) >= 0 ? 'text-atext' : 'text-red-600 dark:text-red-400'}`}>
                    S/ {(totals[c.key] ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                ))}
                <td className="px-3 py-2 text-right text-atext whitespace-nowrap">
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm shadow-2xl ring-1 ring-black/10 dark:ring-white/10" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Eliminar entrada</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Esta acción no se puede deshacer. ¿Estás seguro?</p>
            </div>
            <div className="flex border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-3.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition rounded-bl-2xl"
              >
                Cancelar
              </button>
              <div className="w-px bg-slate-100 dark:bg-slate-700" />
              <button
                onClick={deleteEntry}
                className="flex-1 py-3.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition rounded-br-2xl"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New entry modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">Nueva entrada Power</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">✕</button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Año</label>
                  <input type="number" className="mt-1 w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm" value={form.entry_year} onChange={e => setForm(f => ({ ...f, entry_year: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Mes</label>
                  <select className="mt-1 w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm" value={form.entry_month} onChange={e => setForm(f => ({ ...f, entry_month: e.target.value }))}>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Detalle / descripción</label>
                <input type="text" className="mt-1 w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium pt-1">Montos por columna</p>
              <div className="grid grid-cols-2 gap-2">
                {POWER_COLS.map(col => (
                  <div key={col.key}>
                    <label className="text-xs text-slate-500 dark:text-slate-400">{col.label}</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="mt-1 w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm"
                      value={form[col.key]}
                      onChange={e => setForm(f => ({ ...f, [col.key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700 flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="text-sm text-slate-500 dark:text-slate-400 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancelar</button>
              <button onClick={() => save(true)} disabled={saving} className="border border-accent text-accent text-sm px-4 py-2 rounded-lg hover:bg-asoft disabled:opacity-50 transition">
                {saving ? '...' : 'Guardar y agregar otra'}
              </button>
              <button onClick={() => save(false)} disabled={saving} className="btn-primary text-sm px-5 py-2 rounded-lg disabled:opacity-50 transition">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
