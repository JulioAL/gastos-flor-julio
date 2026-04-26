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
  const [showAllCols, setShowAllCols] = useState(false)

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
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} className="rounded-lg px-3 py-2 shadow-lg text-xs space-y-1">
        <p className="font-semibold" style={{ color: 'var(--t2)' }}>{d.label as string}</p>
        <p style={{ color: 'var(--t)' }}>{fmt(value)}</p>
        {delta !== 0 && (
          <p className="font-semibold" style={{ color: delta > 0 ? 'var(--accent)' : 'var(--red)' }}>
            {delta > 0 ? '+' : ''}{fmt(delta)}
          </p>
        )}
      </div>
    )
  }

  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0)
  const fmt = (n: number) => `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`

  // Mobile: group filtered entries by year+month for expandable history
  const MONTH_NUM: Record<string, number> = {
    enero:1,febrero:2,marzo:3,abril:4,mayo:5,junio:6,
    julio:7,agosto:8,setiembre:9,septiembre:9,octubre:10,noviembre:11,diciembre:12,
  }
  const mobileGroups = useMemo(() => {
    const map: Record<string, { label: string; total: number; items: typeof filteredEntries }> = {}
    for (const e of filteredEntries) {
      const m = MONTH_NUM[e.entry_month?.toLowerCase() ?? ''] ?? 0
      const key = `${e.entry_year ?? 0}-${String(m).padStart(2, '0')}`
      const label = `${e.entry_month ?? ''} ${e.entry_year ?? ''}`
      if (!map[key]) map[key] = { label, total: 0, items: [] }
      const rowTotal = POWER_COLS.reduce((s, c) => s + (((e as Record<string, unknown>)[c.key] as number | null) ?? 0), 0)
      map[key].total += rowTotal
      map[key].items.push(e)
    }
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a)).map(([, v]) => v)
  }, [filteredEntries])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--t)' }}>Cuenta Power</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>{filteredEntries.length} entradas históricas</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm px-4 py-2 rounded-xl transition">
          + Nueva entrada
        </button>
      </div>

      {/* ── MOBILE VIEW ── hero + column cards + expandable history ── */}
      <div className="md:hidden space-y-4">
        {/* Hero card */}
        <div
          className="rounded-2xl p-4 text-white relative overflow-hidden"
          style={{ background: 'var(--accent)' }}
        >
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full" style={{ background: 'rgba(255,255,255,.1)' }} />
          <div className="absolute -bottom-8 -left-4 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,.06)' }} />
          <p className="text-xs font-semibold uppercase tracking-widest relative" style={{ color: 'rgba(255,255,255,.75)' }}>
            Saldo total Power
          </p>
          <p className="text-3xl font-bold tabular-nums tracking-tight mt-1 relative">{fmt(grandTotal)}</p>
          <div className="flex gap-5 mt-3 relative">
            <div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,.7)' }}>Entradas</p>
              <p className="text-sm font-semibold mt-0.5">{entries.length} total</p>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,.22)', alignSelf: 'stretch' }} />
            <div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,.7)' }}>Filtradas</p>
              <p className="text-sm font-semibold mt-0.5">{filteredEntries.length}</p>
            </div>
          </div>
        </div>

        {/* Column cards */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--t3)' }}>
            Saldo por columna
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(showAllCols ? POWER_COLS : POWER_COLS.slice(0, 8)).map((col, i) => (
              <div
                key={col.key}
                className="rounded-2xl p-3"
                style={{
                  background: i === 3
                    ? 'linear-gradient(135deg, var(--asoft), color-mix(in oklch, var(--accent) 8%, var(--surface)))'
                    : 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-wide truncate" style={{ color: i === 3 ? 'var(--atext)' : 'var(--t3)' }}>
                  {col.label}
                </p>
                <p
                  className="text-sm font-bold tabular-nums mt-0.5"
                  style={{ color: (totals[col.key] ?? 0) < 0 ? 'var(--red)' : i === 3 ? 'var(--atext)' : 'var(--t)' }}
                >
                  {fmt(totals[col.key] ?? 0)}
                </p>
              </div>
            ))}
          </div>
          {POWER_COLS.length > 8 && (
            <button
              onClick={() => setShowAllCols(v => !v)}
              className="mt-2 w-full text-xs font-medium py-2 rounded-xl"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--t2)' }}
            >
              {showAllCols ? 'Ver menos' : `Ver todas (${POWER_COLS.length} columnas)`}
            </button>
          )}
        </div>

        {/* Filters (year + search) */}
        <div className="flex gap-2">
          <select
            className="flex-shrink-0 rounded-xl px-3 py-2 text-xs"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--t)' }}
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
            className="flex-1 rounded-xl px-3 py-2 text-xs"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--t)' }}
          />
        </div>

        {/* Expandable history grouped by month */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--t3)' }}>Historial</p>
          <div className="space-y-2">
            {mobileGroups.map(group => (
              <div key={group.label} className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between px-4 py-2.5" style={{ background: 'var(--bg2)' }}>
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--t2)' }}>{group.label}</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--atext)' }}>
                    {group.total >= 0 ? '+' : ''}{fmt(group.total)}
                  </span>
                </div>
                {group.items.map((e, idx) => {
                  const rowTotal = POWER_COLS.reduce((s, c) => s + (((e as Record<string, unknown>)[c.key] as number | null) ?? 0), 0)
                  const nonZero = POWER_COLS.filter(c => (e as Record<string, unknown>)[c.key] != null)
                  return (
                    <details key={e.id} className={idx > 0 ? 'border-t' : ''} style={{ borderColor: 'var(--border)' }}>
                      <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer list-none">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--t)' }}>{e.description || '—'}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>
                            {e.entry_month} {e.entry_year} · {nonZero.length} columna{nonZero.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <span className="text-sm font-bold tabular-nums flex-shrink-0" style={{ color: rowTotal < 0 ? 'var(--red)' : 'var(--t)' }}>
                          {rowTotal >= 0 ? '+' : ''}{fmt(rowTotal)}
                        </span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--t3)', flexShrink: 0 }} className="details-caret">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </summary>
                      <div className="px-4 pb-3 pt-1 grid grid-cols-2 gap-x-4 gap-y-1" style={{ borderTop: '1px solid var(--border)' }}>
                        {nonZero.map(c => {
                          const val = (e as Record<string, unknown>)[c.key] as number
                          return (
                            <div key={c.key} className="flex justify-between text-xs">
                              <span style={{ color: 'var(--t3)' }}>{c.label}</span>
                              <span className="tabular-nums font-medium" style={{ color: val < 0 ? 'var(--red)' : 'var(--t2)' }}>
                                {val >= 0 ? '+' : ''}{fmt(val)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </details>
                  )
                })}
              </div>
            ))}
            {mobileGroups.length === 0 && (
              <p className="text-center text-sm py-8" style={{ color: 'var(--t3)' }}>Sin entradas</p>
            )}
          </div>
        </div>
      </div>

      {/* ── DESKTOP VIEW ── column totals + chart + table ── */}

      {/* Column totals */}
      <div className="hidden md:block rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-semibold text-sm" style={{ color: 'var(--t)' }}>Totales acumulados por columna</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {POWER_COLS.map((col, i) => (
            <div
              key={col.key}
              className="p-3"
              style={{ borderBottom: i < POWER_COLS.length - (POWER_COLS.length % 4 || 4) ? '1px solid var(--border)' : undefined, borderRight: (i + 1) % 4 !== 0 ? '1px solid var(--border)' : undefined }}
            >
              <p className="text-xs font-medium" style={{ color: 'var(--t3)' }}>{col.label}</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: (totals[col.key] ?? 0) >= 0 ? 'var(--atext)' : 'var(--red)' }}>
                {fmt(totals[col.key] ?? 0)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Evolution chart */}
      {chartData.length > 0 && (
        <div className="hidden md:block rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <h2 className="font-semibold text-sm" style={{ color: 'var(--t)' }}>Evolución del saldo Power</h2>
            <select
              className="rounded-lg px-2.5 py-1.5 text-xs"
              style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--t)' }}
              value={chartCol}
              onChange={e => setChartCol(e.target.value)}
            >
              <option value="total">Saldo total</option>
              {POWER_COLS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'var(--t3)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--t3)' }} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey={chartCol} stroke="var(--accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Full history table */}
      <div className="hidden md:block rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)', overflow: 'clip' }}>
        <div className="px-4 py-3 flex items-center justify-between gap-4 flex-wrap" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-semibold text-sm" style={{ color: 'var(--t)' }}>Historial — {filteredEntries.length} entradas</h2>
            <select
              className="rounded-lg px-2.5 py-1 text-xs"
              style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--t)' }}
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
              className="rounded-lg px-2.5 py-1 text-xs w-44"
              style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--t)' }}
            />
            <button
              onClick={() => { setSelectMode(m => !m); setSelectedIds(new Set()) }}
              className="text-xs px-3 py-1 rounded-lg border transition"
              style={
                selectMode
                  ? { background: 'var(--asoft)', borderColor: 'var(--accent)', color: 'var(--atext)' }
                  : { borderColor: 'var(--border)', color: 'var(--t3)' }
              }
            >
              {selectMode ? 'Cancelar selección' : 'Seleccionar'}
            </button>
            {selectMode && selectedIds.size > 0 && (
              <button
                onClick={bulkDelete}
                disabled={bulkDeleting}
                className="flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-1 rounded-lg transition disabled:opacity-50"
                style={{ background: 'var(--red)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
                {bulkDeleting ? 'Eliminando...' : `Eliminar ${selectedIds.size}`}
              </button>
            )}
          </div>
          <span className="text-sm font-bold text-atext">
            Total general: {fmt(grandTotal)}
          </span>
        </div>
        <div className="overflow-x-auto touch-pan-x md:max-h-[60vh] md:overflow-y-auto">
          <table className="text-xs min-w-max w-full power-table">
            <thead className="sticky top-0 z-10">
              <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                {selectMode && (
                  <th className="px-3 py-2 sticky left-0 z-20 w-10 min-w-[40px]" style={{ background: 'var(--bg2)' }}>
                    <button
                      onClick={toggleSelectAll}
                      className="w-6 h-6 rounded-md border-2 flex items-center justify-center transition"
                      style={{
                        background: selectedIds.size === filteredEntries.length && filteredEntries.length > 0 ? 'var(--accent)' : 'var(--surface)',
                        borderColor: selectedIds.size > 0 ? 'var(--accent)' : 'var(--border)',
                      }}
                    >
                      {selectedIds.size === filteredEntries.length && filteredEntries.length > 0
                        ? <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        : selectedIds.size > 0 ? <span className="w-2.5 h-0.5 bg-accent rounded"/> : null}
                    </button>
                  </th>
                )}
                <th className="text-left px-3 py-2 font-medium sticky left-0 z-20 w-12 min-w-[48px]" style={{ color: 'var(--t3)', background: 'var(--bg2)' }}>Año</th>
                <th className="text-left px-3 py-2 font-medium sticky left-12 z-20 w-24 min-w-[96px]" style={{ color: 'var(--t3)', background: 'var(--bg2)' }}>Mes</th>
                <th className="text-left px-3 py-2 font-medium sticky left-36 z-20 w-32 min-w-[128px]" style={{ color: 'var(--t3)', background: 'var(--bg2)', borderRight: '1px solid var(--border)' }}>Detalle</th>
                {POWER_COLS.map(c => (
                  <th key={c.key} className="text-right px-3 py-2 font-medium whitespace-nowrap" style={{ color: 'var(--t3)' }}>{c.label}</th>
                ))}
                <th className="text-right px-3 py-2 font-medium whitespace-nowrap text-accent">Total fila</th>
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
                    className={isSelected ? 'bg-col-current' : ''}
                    style={{ borderBottom: '1px solid var(--border)', cursor: selectMode ? 'pointer' : undefined }}
                    onClick={selectMode ? () => toggleSelect(e.id) : undefined}
                  >
                    {selectMode && (
                      <td className="px-3 py-2 sticky left-0 z-10 bg-inherit w-10 min-w-[40px]">
                        <span
                          className="w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition"
                          style={{ background: isSelected ? 'var(--accent)' : 'var(--surface)', borderColor: isSelected ? 'var(--accent)' : 'var(--border)' }}
                        >
                          {isSelected && <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                        </span>
                      </td>
                    )}
                    <td className="px-3 py-2 sticky left-0 z-10 w-12 min-w-[48px]" style={{ color: 'var(--t2)', background: 'var(--surface)' }}>{e.entry_year}</td>
                    <td className="px-3 py-2 sticky left-12 z-10 w-24 min-w-[96px] whitespace-nowrap" style={{ color: 'var(--t2)', background: 'var(--surface)' }}>{e.entry_month}</td>
                    <td className="px-3 py-2 sticky left-36 z-10 w-32 min-w-[128px] truncate" style={{ color: 'var(--t3)', background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>{e.description}</td>
                    {POWER_COLS.map(c => {
                      const val = (e as Record<string, unknown>)[c.key] as number | null
                      return (
                        <td key={c.key} className="px-3 py-2 text-right whitespace-nowrap" style={{ color: val == null ? 'var(--border)' : val >= 0 ? 'var(--t)' : 'var(--red)' }}>
                          {val != null ? fmt(val) : '-'}
                        </td>
                      )
                    })}
                    <td className="px-3 py-2 text-right font-semibold whitespace-nowrap" style={{ color: rowTotal >= 0 ? 'var(--atext)' : 'var(--red)' }}>
                      {fmt(rowTotal)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => setConfirmDeleteId(e.id)} className="transition rounded p-1.5" style={{ color: 'var(--red)' }}>
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
              <tr className="font-bold" style={{ background: 'var(--asoft)', borderTop: '2px solid var(--accent)' }}>
                <td className="px-3 py-2 text-atext sticky left-0 z-10 w-12 min-w-[48px]" style={{ background: 'var(--asoft)' }}>TOT.</td>
                <td className="px-3 py-2 sticky left-12 z-10 w-24 min-w-[96px]" style={{ background: 'var(--asoft)' }}></td>
                <td className="px-3 py-2 sticky left-36 z-10 w-32 min-w-[128px]" style={{ background: 'var(--asoft)', borderRight: '1px solid var(--accent)' }}></td>
                {POWER_COLS.map(c => (
                  <td key={c.key} className="px-3 py-2 text-right whitespace-nowrap" style={{ color: (totals[c.key] ?? 0) >= 0 ? 'var(--atext)' : 'var(--red)' }}>
                    {fmt(totals[c.key] ?? 0)}
                  </td>
                ))}
                <td className="px-3 py-2 text-right text-atext whitespace-nowrap">{fmt(grandTotal)}</td>
                <td className="px-3 py-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Confirm delete modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDeleteId(null)}>
          <div className="rounded-2xl w-full max-w-sm shadow-2xl" style={{ background: 'var(--surface)' }} onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'color-mix(in oklch, var(--red) 15%, transparent)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" style={{ color: 'var(--red)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--t)' }}>Eliminar entrada</h3>
              <p className="text-sm" style={{ color: 'var(--t3)' }}>Esta acción no se puede deshacer. ¿Estás seguro?</p>
            </div>
            <div className="flex" style={{ borderTop: '1px solid var(--border)' }}>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-3.5 text-sm font-medium transition rounded-bl-2xl"
                style={{ color: 'var(--t2)' }}
              >
                Cancelar
              </button>
              <div style={{ width: 1, background: 'var(--border)' }} />
              <button
                onClick={deleteEntry}
                className="flex-1 py-3.5 text-sm font-bold transition rounded-br-2xl"
                style={{ color: 'var(--red)' }}
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
          <div className="rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" style={{ background: 'var(--surface)' }} onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-semibold" style={{ color: 'var(--t)' }}>Nueva entrada Power</h2>
              <button onClick={() => setShowForm(false)} style={{ color: 'var(--t3)' }}>✕</button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium" style={{ color: 'var(--t3)' }}>Año</label>
                  <input type="number" className="mt-1 w-full rounded-xl px-3 py-2 text-sm" style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--t)' }} value={form.entry_year} onChange={e => setForm(f => ({ ...f, entry_year: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium" style={{ color: 'var(--t3)' }}>Mes</label>
                  <select className="mt-1 w-full rounded-xl px-3 py-2 text-sm" style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--t)' }} value={form.entry_month} onChange={e => setForm(f => ({ ...f, entry_month: e.target.value }))}>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: 'var(--t3)' }}>Detalle / descripción</label>
                <input type="text" className="mt-1 w-full rounded-xl px-3 py-2 text-sm" style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--t)' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <p className="text-xs font-medium pt-1" style={{ color: 'var(--t3)' }}>Montos por columna</p>
              <div className="grid grid-cols-2 gap-2">
                {POWER_COLS.map(col => (
                  <div key={col.key}>
                    <label className="text-xs" style={{ color: 'var(--t3)' }}>{col.label}</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="mt-1 w-full rounded-xl px-3 py-1.5 text-sm"
                      style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--t)' }}
                      value={form[col.key]}
                      onChange={e => setForm(f => ({ ...f, [col.key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 py-4 flex gap-2 justify-end" style={{ borderTop: '1px solid var(--border)' }}>
              <button onClick={() => setShowForm(false)} className="text-sm px-4 py-2 rounded-xl transition" style={{ color: 'var(--t2)', background: 'var(--bg2)' }}>Cancelar</button>
              <button onClick={() => save(true)} disabled={saving} className="border border-accent text-accent text-sm px-4 py-2 rounded-xl hover:bg-asoft disabled:opacity-50 transition">
                {saving ? '...' : 'Guardar y agregar otra'}
              </button>
              <button onClick={() => save(false)} disabled={saving} className="btn-primary text-sm px-5 py-2 rounded-xl disabled:opacity-50 transition">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
