'use client'

import { useState, useEffect, Fragment } from 'react'
import { createClient } from '@/lib/supabase/client'
import { revertCorteAction, realizarCorteAction } from './actions'
import { CORTE_ACCOUNT_GROUPS, computeCorteAccountTotals, MONTH_NAMES } from '@/lib/utils/accounts'
import type { PersonalExpense, CorteWithTotals } from '@/lib/supabase/types'

interface Props {
  pendingExpenses: PersonalExpense[]
  cortes: CorteWithTotals[]
  userId: string
  budgetByAccount: Record<string, number>
  powerTotal: number
  budgetMonthId: string | null
}

const fmt = (n: number) =>
  n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function getExpenseAmountForGroup(e: PersonalExpense, cols: string[]): number {
  return cols.reduce((s, col) => s + ((e[col as keyof PersonalExpense] as number | null) ?? 0), 0)
}

const ALL_EXPENSE_COLS = ['casita', 'flor_julio', 'julio', 'flor', 'salidas', 'power', 'gasolina', 'regalos', 'navidad', 'otros_power', 'entretenimiento'] as const

function isHogarPending(e: PersonalExpense): boolean {
  return (e.tab_name ?? '').startsWith('hp|')
}

function isUnclassified(e: PersonalExpense): boolean {
  if (isHogarPending(e)) return true
  return ALL_EXPENSE_COLS.reduce((s, col) => s + ((e[col as keyof PersonalExpense] as number | null) ?? 0), 0) === 0
}

function unclassifiedLabel(e: PersonalExpense): string {
  return isHogarPending(e) ? 'Hogar sin cuenta asignada' : 'Sin clasificar'
}

function isPowerExpense(e: PersonalExpense): boolean {
  return ((e.power ?? 0) > 0 || (e.otros_power ?? 0) > 0)
}

function hasPowerSubcuenta(e: PersonalExpense): boolean {
  return (e.tab_name ?? '').startsWith('ps|')
}

function formatDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-')
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Set','Oct','Nov','Dic']
  return `${parseInt(d)} ${months[parseInt(m) - 1]}`
}

export default function CorteClient({ pendingExpenses, cortes, userId, budgetByAccount, powerTotal, budgetMonthId }: Props) {
  const supabase = createClient()
  const [localPending, setLocalPending] = useState<PersonalExpense[]>(pendingExpenses)
  const [localCortes, setLocalCortes] = useState<CorteWithTotals[]>(cortes)
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null)
  const [showPersonal, setShowPersonal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [corteNotes, setCorteNotes] = useState('')
  const [performing, setPerforming] = useState(false)
  const [settledDateInput, setSettledDateInput] = useState<string>(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
  const [expandedCorteId, setExpandedCorteId] = useState<string | null>(null)
  const [expandedCorteAccount, setExpandedCorteAccount] = useState<string | null>(null)
  const [corteExpensesCache, setCorteExpensesCache] = useState<Record<string, PersonalExpense[]>>({})
  const [loadingCorteExpenses, setLoadingCorteExpenses] = useState(false)
  const [revertingId, setRevertingId] = useState<string | null>(null)

  async function openCorte(corteId: string | null) {
    setExpandedCorteAccount(null)
    setExpandedCorteId(corteId)
    if (!corteId || corteExpensesCache[corteId]) return
    setLoadingCorteExpenses(true)
    const { data } = await supabase
      .from('personal_expenses')
      .select('*')
      .eq('corte_id', corteId)
      .order('date', { ascending: true })
    setCorteExpensesCache(prev => ({ ...prev, [corteId]: data ?? [] }))
    setLoadingCorteExpenses(false)
  }

  async function revertCorte(corteId: string) {
    if (!confirm('¿Revertir este corte? Los gastos volverán a quedar pendientes.')) return
    setRevertingId(corteId)
    await revertCorteAction(corteId)
    setLocalCortes(prev => prev.filter(c => c.id !== corteId))
    setRevertingId(null)
  }
  useEffect(() => {
    if (!showConfirmModal) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !performing) { setShowConfirmModal(false); setCorteNotes(''); resetSettledDate() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showConfirmModal, performing])

  function resetSettledDate() {
    const d = new Date()
    setSettledDateInput(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }

  const [cutoffDate, setCutoffDate] = useState<string>(() => {
    if (pendingExpenses.length > 0) return pendingExpenses[pendingExpenses.length - 1].date
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })

  const earliestDate = localPending.length > 0 ? localPending[0].date : null

  // Expenses to include in this corte (up to and including cutoffDate)
  const expensesToSettle = localPending.filter(e => e.date <= cutoffDate)

  const accountTotals = computeCorteAccountTotals(
    expensesToSettle as unknown as Record<string, number | null | string | boolean>[]
  )

  const hasPending = localPending.length > 0
  const hasToSettle = expensesToSettle.length > 0
  const totalAmount = Object.values(accountTotals).reduce((s, v) => s + v, 0)

  const totalGastado = expensesToSettle.reduce((sum, e) => sum + ((e.julio as number | null) ?? 0), 0)

  const unclassifiedExpenses = expensesToSettle.filter(e => isUnclassified(e))
  const hasUnclassified = unclassifiedExpenses.length > 0

  const powerWithoutSubcuenta = expensesToSettle.filter(e => isPowerExpense(e) && !hasPowerSubcuenta(e))

  async function realizarCorte() {
    setPerforming(true)
    const settledDate = settledDateInput
    const now = new Date(settledDate + 'T12:00:00')

    const powerExpensesWithSub = expensesToSettle.filter(e => isPowerExpense(e) && hasPowerSubcuenta(e))
    const powerRows = powerExpensesWithSub.map(e => {
      const colKey = (e.tab_name ?? '').slice(3) // strip 'ps|'
      const amount = (e.power ?? 0) + (e.otros_power ?? 0)
      return {
        entry_year: new Date(e.date + 'T00:00:00').getFullYear(),
        entry_month: MONTH_NAMES[new Date(e.date + 'T00:00:00').getMonth() + 1],
        description: `${e.description} - corte ${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        [colKey]: -amount,
      }
    })

    const newCorteWithTotals = await realizarCorteAction({
      settledDate,
      notes: corteNotes.trim() || null,
      userId,
      accountTotals,
      expenseIds: expensesToSettle.map(e => e.id),
      budgetMonthId,
      powerRows,
    })

    if (!newCorteWithTotals) {
      console.error('Error creating corte')
      setPerforming(false)
      return
    }

    const settledIdSet = new Set(expensesToSettle.map(e => e.id))
    const remaining = localPending.filter(e => !settledIdSet.has(e.id))

    setLocalCortes(prev => [newCorteWithTotals, ...prev])
    setLocalPending(remaining)
    // Reset cutoff to latest remaining date (or today if none left)
    setCutoffDate(() => {
      if (remaining.length > 0) return remaining[remaining.length - 1].date
      const d = new Date()
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    })
    setShowConfirmModal(false)
    setCorteNotes('')
    setPerforming(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 sm:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold" style={{ color: 'var(--t)' }}>Corte de Cuentas</h1>
        <button
          onClick={() => setShowConfirmModal(true)}
          disabled={!hasToSettle || hasUnclassified || powerWithoutSubcuenta.length > 0}
          className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          Realizar Corte
        </button>
      </div>

      {/* Pending summary banner */}
      {hasPending ? (
        <div className="mb-4 px-4 py-3 rounded-2xl text-sm" style={{ background: 'color-mix(in oklch, var(--amber) 12%, transparent)', border: '1px solid color-mix(in oklch, var(--amber) 30%, transparent)', color: 'var(--t)' }}>
          <span className="font-semibold">{localPending.length} gasto{localPending.length !== 1 ? 's' : ''} pendientes</span>
          {earliestDate && (
            <span className="ml-1" style={{ color: 'var(--t2)' }}>desde {formatDate(earliestDate)}</span>
          )}
        </div>
      ) : (
        <div className="mb-4 px-4 py-3 rounded-2xl text-sm" style={{ background: 'var(--asoft)', border: '1px solid var(--border)', color: 'var(--atext)' }}>
          Sin gastos pendientes. Todos los gastos han sido liquidados.
        </div>
      )}

      {/* Blocking issues — unclassified + power without subcuenta */}
      {(hasUnclassified || powerWithoutSubcuenta.length > 0) && (
        <div className="mb-4 px-4 py-3 rounded-2xl text-sm" style={{ background: 'color-mix(in oklch, var(--red) 10%, transparent)', border: '1px solid color-mix(in oklch, var(--red) 25%, transparent)', color: 'var(--t)' }}>
          <p className="font-semibold mb-2" style={{ color: 'var(--red)' }}>
            El corte no puede realizarse hasta resolver los siguientes gastos en el tab Gastos:
          </p>
          <ul className="space-y-1">
            {unclassifiedExpenses.map(e => (
              <li key={e.id} className="flex items-center gap-2 flex-wrap">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--red)' }} />
                <span className="font-medium" style={{ color: 'var(--t)' }}>{formatDate(e.date)}</span>
                <span className="truncate" style={{ color: 'var(--t2)' }}>{e.description}</span>
                <span className="text-xs italic" style={{ color: 'var(--red)' }}>({unclassifiedLabel(e)})</span>
              </li>
            ))}
            {powerWithoutSubcuenta.map(e => (
              <li key={e.id} className="flex items-center gap-2 flex-wrap">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--red)' }} />
                <span className="font-medium" style={{ color: 'var(--t)' }}>{formatDate(e.date)}</span>
                <span className="truncate" style={{ color: 'var(--t2)' }}>{e.description}</span>
                <span className="text-xs italic" style={{ color: 'var(--red)' }}>
                  ({(e.power ?? 0) > 0 ? 'Power sin columna' : 'Otros (Power) sin columna'})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cutoff date picker */}
      {hasPending && (
        <div className="mb-5 flex items-center gap-3">
          <label className="text-sm whitespace-nowrap" style={{ color: 'var(--t2)' }}>
            Cortar hasta:
          </label>
          <input
            type="date"
            value={cutoffDate}
            min={earliestDate ?? undefined}
            onChange={e => {
              setCutoffDate(e.target.value)
              setExpandedAccount(null)
            }}
            className="px-3 py-1.5 rounded-xl text-sm focus:outline-none"
            style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--t)' }}
          />
          {expensesToSettle.length < localPending.length && (
            <span className="text-xs" style={{ color: 'var(--t3)' }}>
              {expensesToSettle.length} de {localPending.length} gastos
            </span>
          )}
        </div>
      )}

      {/* Account cards grid */}
      {hasToSettle && (
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            {/* Total card */}
            <div className="col-span-2 rounded-2xl px-4 py-3" style={{ background: 'var(--asoft)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--atext)' }}>Total a transferir</p>
              <p className="text-base font-bold" style={{ color: 'var(--accent)' }}>S/ {fmt(totalAmount)}</p>
            </div>
            {CORTE_ACCOUNT_GROUPS.map(group => {
              const amount = accountTotals[group.accountKey] ?? 0
              const expensesInGroup = expensesToSettle.filter(e =>
                getExpenseAmountForGroup(e, group.expenseColumns) > 0
              )
              const isExpanded = expandedAccount === group.accountKey
              const isEmpty = amount === 0

              return (
                <div key={group.accountKey}>
                  <button
                    onClick={() => setExpandedAccount(isExpanded ? null : group.accountKey)}
                    disabled={isEmpty}
                    className="w-full text-left px-4 py-3 rounded-2xl transition"
                    style={isEmpty
                      ? { background: 'var(--bg2)', border: '1px solid var(--border)', opacity: 0.5, cursor: 'default' }
                      : isExpanded
                        ? { background: 'var(--asoft)', border: '1px solid var(--accent)' }
                        : { background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--t2)' }}>
                      {group.label}
                    </p>
                    <p className="text-base font-bold" style={{ color: isEmpty ? 'var(--t3)' : 'var(--t)' }}>
                      S/ {fmt(amount)}
                    </p>
                    {!isEmpty && (() => {
                      const balance = group.accountKey === 'power'
                        ? powerTotal
                        : (budgetByAccount[group.accountKey] ?? 0)
                      const remaining = balance - amount
                      return balance > 0 ? (
                        <p className="text-xs mt-1 font-medium" style={{ color: remaining >= 0 ? 'var(--accent)' : 'var(--red)' }}>
                          {remaining >= 0 ? `Quedan S/ ${fmt(remaining)}` : `Excede S/ ${fmt(Math.abs(remaining))}`}
                        </p>
                      ) : null
                    })()}
                    {!isEmpty && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>
                        {expensesInGroup.length} gasto{expensesInGroup.length !== 1 ? 's' : ''} {isExpanded ? '▲' : '▼'}
                      </p>
                    )}
                  </button>

                  {/* Inline breakdown */}
                  {isExpanded && (
                    <div className="col-span-2 mt-2 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs" style={{ background: 'var(--bg2)', color: 'var(--t3)' }}>
                            <th className="text-left px-3 py-2">Fecha</th>
                            <th className="text-left px-3 py-2">Descripción</th>
                            <th className="text-right px-3 py-2">Monto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expensesInGroup.map((e, i) => (
                            <tr key={e.id} style={{ background: 'var(--surface)', borderTop: i > 0 ? '1px solid var(--border)' : undefined }}>
                              <td className="px-3 py-2 whitespace-nowrap" style={{ color: 'var(--t3)' }}>
                                {formatDate(e.date)}
                              </td>
                              <td className="px-3 py-2" style={{ color: 'var(--t)' }}>
                                {e.description}
                              </td>
                              <td className="px-3 py-2 text-right font-medium whitespace-nowrap" style={{ color: 'var(--t)' }}>
                                S/ {fmt(getExpenseAmountForGroup(e, group.expenseColumns))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="font-semibold text-sm" style={{ background: 'var(--asoft)', borderTop: '1px solid var(--border)' }}>
                            <td colSpan={2} className="px-3 py-2" style={{ color: 'var(--t)' }}>
                              Total {group.label}
                            </td>
                            <td className="px-3 py-2 text-right" style={{ color: 'var(--accent)' }}>
                              S/ {fmt(amount)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Gastos personales card */}
            {(() => {
              const personalExpenses = expensesToSettle.filter(e => (e.julio ?? 0) > 0)
              const isExpanded = expandedAccount === 'personal'
              const isEmpty = totalGastado === 0
              return (
                <div className="col-span-2">
                  <div
                    className="px-4 py-3 rounded-2xl transition"
                    style={isEmpty
                      ? { background: 'var(--bg2)', border: '1px solid var(--border)', opacity: 0.5 }
                      : isExpanded
                        ? { background: 'var(--asoft)', border: '1px solid var(--accent)' }
                        : { background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium" style={{ color: 'var(--t2)' }}>
                        Gastos personales
                      </p>
                      <button
                        onClick={() => {
                          if (showPersonal && isExpanded) setExpandedAccount(null)
                          setShowPersonal(v => !v)
                        }}
                        className="transition p-0.5"
                        style={{ color: 'var(--t3)' }}
                        title={showPersonal ? 'Ocultar' : 'Mostrar'}
                      >
                        {showPersonal ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    <button
                      onClick={() => !isEmpty && showPersonal && setExpandedAccount(isExpanded ? null : 'personal')}
                      disabled={isEmpty || !showPersonal}
                      className="w-full text-left disabled:cursor-default"
                    >
                      <p className="text-base font-bold" style={{ color: isEmpty ? 'var(--t3)' : 'var(--t)' }}>
                        {showPersonal ? `S/ ${fmt(totalGastado)}` : '••••••'}
                      </p>
                      {!isEmpty && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>
                          {personalExpenses.length} gasto{personalExpenses.length !== 1 ? 's' : ''} {isExpanded ? '▲' : '▼'}
                        </p>
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-2 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs" style={{ background: 'var(--bg2)', color: 'var(--t3)' }}>
                            <th className="text-left px-3 py-2">Fecha</th>
                            <th className="text-left px-3 py-2">Descripción</th>
                            <th className="text-right px-3 py-2">Monto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {personalExpenses.map((e, i) => (
                            <tr key={e.id} style={{ background: 'var(--surface)', borderTop: i > 0 ? '1px solid var(--border)' : undefined }}>
                              <td className="px-3 py-2 whitespace-nowrap" style={{ color: 'var(--t3)' }}>
                                {formatDate(e.date)}
                              </td>
                              <td className="px-3 py-2" style={{ color: 'var(--t)' }}>
                                {e.description}
                              </td>
                              <td className="px-3 py-2 text-right font-medium whitespace-nowrap" style={{ color: 'var(--t)' }}>
                                {showPersonal ? `S/ ${fmt(e.julio ?? 0)}` : '••••'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="font-semibold text-sm" style={{ background: 'var(--asoft)', borderTop: '1px solid var(--border)' }}>
                            <td colSpan={2} className="px-3 py-2" style={{ color: 'var(--t)' }}>
                              Total Gastos personales
                            </td>
                            <td className="px-3 py-2 text-right" style={{ color: 'var(--accent)' }}>
                              {showPersonal ? `S/ ${fmt(totalGastado)}` : '••••••'}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Historial de cortes */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--t3)' }}>
          Historial de cortes
        </h2>
        {localCortes.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--t3)' }}>Sin cortes registrados.</p>
        ) : (
          <div className="space-y-2">
            {localCortes.map(corte => {
              const corteTotal = corte.corte_account_totals.reduce((s, t) => s + t.total_amount, 0)
              const isOpen = expandedCorteId === corte.id
              const corteExpenses = corteExpensesCache[corte.id] ?? []
              return (
                <div
                  key={corte.id}
                  className="rounded-2xl overflow-hidden"
                  style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
                >
                  <div className="flex items-center">
                    <button
                      onClick={() => openCorte(isOpen ? null : corte.id)}
                      className="flex-1 flex items-center justify-between px-4 py-3 text-left transition"
                    >
                      <div>
                        <span className="text-sm font-medium" style={{ color: 'var(--t)' }}>
                          {formatDate(corte.settled_date)} — {MONTH_NAMES[corte.month]} {corte.year}
                        </span>
                        {corte.notes && (
                          <span className="ml-2 text-xs" style={{ color: 'var(--t3)' }}>
                            {corte.notes}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold" style={{ color: 'var(--t)' }}>
                          S/ {fmt(corteTotal)}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--t3)' }}>
                          {isOpen ? '▲' : '▼'}
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => revertCorte(corte.id)}
                      disabled={revertingId === corte.id}
                      className="px-3 py-3 text-xs transition disabled:opacity-40"
                      style={{ color: 'var(--red)', borderLeft: '1px solid var(--border)' }}
                      title="Revertir corte"
                    >
                      {revertingId === corte.id ? '...' : 'Revertir'}
                    </button>
                  </div>

                  {isOpen && (
                    <div style={{ borderTop: '1px solid var(--border)' }}>
                      {loadingCorteExpenses && !corteExpensesCache[corte.id] ? (
                        <p className="px-4 py-3 text-xs" style={{ color: 'var(--t3)' }}>Cargando detalle...</p>
                      ) : (
                        <table className="w-full text-sm">
                          <tbody>
                            {corte.corte_account_totals
                              .sort((a, b) => b.total_amount - a.total_amount)
                              .map((t, tIdx) => {
                                const group = CORTE_ACCOUNT_GROUPS.find(g => g.accountKey === t.account_key)
                                const isAccountExpanded = expandedCorteAccount === `${corte.id}:${t.account_key}`
                                const groupExpenses = group
                                  ? corteExpenses.filter(e => getExpenseAmountForGroup(e, group.expenseColumns) > 0)
                                  : []
                                return (
                                  <Fragment key={t.id}>
                                    <tr
                                      className="cursor-pointer transition"
                                      style={{ background: isAccountExpanded ? 'var(--asoft)' : 'var(--surface)', borderTop: tIdx > 0 ? '1px solid var(--border)' : undefined }}
                                      onClick={() => setExpandedCorteAccount(isAccountExpanded ? null : `${corte.id}:${t.account_key}`)}
                                    >
                                      <td className="px-4 py-2" style={{ color: 'var(--t2)' }}>
                                        {group?.label ?? t.account_key}
                                        {groupExpenses.length > 0 && (
                                          <span className="ml-1.5 text-xs" style={{ color: 'var(--t3)' }}>
                                            ({groupExpenses.length}) {isAccountExpanded ? '▲' : '▼'}
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-2 text-right font-medium" style={{ color: 'var(--t)' }}>
                                        S/ {fmt(t.total_amount)}
                                      </td>
                                    </tr>
                                    {isAccountExpanded && groupExpenses.map(e => (
                                      <tr key={e.id} style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)' }}>
                                        <td className="pl-8 pr-4 py-1.5 text-xs" style={{ color: 'var(--t2)' }}>
                                          <span className="mr-2" style={{ color: 'var(--t3)' }}>{formatDate(e.date)}</span>
                                          {e.description}
                                        </td>
                                        <td className="px-4 py-1.5 text-right text-xs" style={{ color: 'var(--t2)' }}>
                                          S/ {fmt(group ? getExpenseAmountForGroup(e, group.expenseColumns) : 0)}
                                        </td>
                                      </tr>
                                    ))}
                                  </Fragment>
                                )
                              })}
                          </tbody>
                          <tfoot>
                            <tr className="font-semibold" style={{ background: 'var(--asoft)', borderTop: '1px solid var(--border)' }}>
                              <td className="px-4 py-2" style={{ color: 'var(--t)' }}>Total</td>
                              <td className="px-4 py-2 text-right" style={{ color: 'var(--accent)' }}>
                                S/ {fmt(corteTotal)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 pb-6 sm:pb-0"
          onClick={e => { if (e.target === e.currentTarget && !performing) { setShowConfirmModal(false); setCorteNotes(''); resetSettledDate() } }}
        >
          <div className="rounded-2xl shadow-xl w-full max-w-md" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--t)' }}>Confirmar Corte</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--t2)' }}>
                {expensesToSettle.length} gastos · {earliestDate && formatDate(earliestDate)} — {formatDate(cutoffDate)}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--t2)' }}>Fecha del corte</label>
                <input
                  type="date"
                  value={settledDateInput}
                  onChange={e => setSettledDateInput(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl text-sm focus:outline-none"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--t)' }}
                />
              </div>
            </div>
            <div className="px-6 py-4">
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="text-xs" style={{ borderBottom: '1px solid var(--border)', color: 'var(--t3)' }}>
                    <th className="text-left pb-2">Cuenta</th>
                    <th className="text-right pb-2">Transferir</th>
                  </tr>
                </thead>
                <tbody>
                  {CORTE_ACCOUNT_GROUPS.filter(g => accountTotals[g.accountKey] > 0).map((g, i) => (
                    <tr key={g.accountKey} style={{ borderTop: i > 0 ? '1px solid var(--border)' : undefined }}>
                      <td className="py-2" style={{ color: 'var(--t2)' }}>{g.label}</td>
                      <td className="py-2 text-right font-medium" style={{ color: 'var(--t)' }}>
                        S/ {fmt(accountTotals[g.accountKey])}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold" style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="pt-2" style={{ color: 'var(--t)' }}>TOTAL</td>
                    <td className="pt-2 text-right" style={{ color: 'var(--accent)' }}>
                      S/ {fmt(totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="mb-4">
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--t2)' }}>
                  Nota (opcional)
                </label>
                <input
                  type="text"
                  value={corteNotes}
                  onChange={e => setCorteNotes(e.target.value)}
                  placeholder="ej. Corte mid-mes Abril"
                  className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--t)' }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowConfirmModal(false); setCorteNotes(''); resetSettledDate() }}
                  disabled={performing}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition"
                  style={{ border: '1px solid var(--border)', color: 'var(--t2)' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={realizarCorte}
                  disabled={performing}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-60 transition"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  {performing ? 'Guardando...' : 'Confirmar Corte'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
