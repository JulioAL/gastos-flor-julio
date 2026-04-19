'use client'

import { useState, useEffect, Fragment } from 'react'
import { createClient } from '@/lib/supabase/client'
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
    // Deleting the corte row triggers ON DELETE SET NULL on personal_expenses.corte_id automatically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('cortes') as any).delete().eq('id', corteId)
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cortesClient = supabase.from('cortes') as any
    const { data: newCorte, error } = await cortesClient
      .insert({
        settled_date: settledDate,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        notes: corteNotes.trim() || null,
        created_by: userId,
      })
      .select()
      .single()

    if (error || !newCorte) {
      console.error('Error creating corte:', error)
      setPerforming(false)
      return
    }

    const totalsRows = CORTE_ACCOUNT_GROUPS
      .filter(g => accountTotals[g.accountKey] > 0)
      .map(g => ({
        corte_id: newCorte.id,
        account_key: g.accountKey,
        total_amount: accountTotals[g.accountKey],
      }))

    if (totalsRows.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('corte_account_totals') as any).insert(totalsRows)
    }

    const settledIds = expensesToSettle.map(e => e.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('personal_expenses') as any)
      .update({ corte_id: newCorte.id })
      .in('id', settledIds)

    // Subtract settled amounts from each account's balance in budget_expenses
    // Power is skipped — its balance comes from power_account_entries, not budget_expenses
    if (budgetMonthId) {
      const accountsToDeduct = CORTE_ACCOUNT_GROUPS.filter(
        g => g.accountKey !== 'power' && (accountTotals[g.accountKey] ?? 0) > 0
      )
      if (accountsToDeduct.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const budgetClient = supabase.from('budget_expenses') as any
        const { data: existingRows } = await budgetClient
          .select('id, account, category, amount')
          .eq('budget_month_id', budgetMonthId)

        const rows = (existingRows ?? []) as { id: string; account: string; category: string; amount: number | null }[]

        for (const group of accountsToDeduct) {
          const corteAmt = accountTotals[group.accountKey]
          // Find the direct row (category === account key) — this is the editable balance
          const direct = rows.find(r => r.account === group.accountKey && r.category === group.accountKey)
          const currentBalance = direct
            ? (direct.amount ?? 0)
            : rows.filter(r => r.account === group.accountKey && r.category !== group.accountKey)
                .reduce((s, r) => s + (r.amount ?? 0), 0)
          const newBalance = currentBalance - corteAmt

          if (direct) {
            await budgetClient.update({ amount: newBalance }).eq('id', direct.id)
          } else {
            await budgetClient.insert({
              budget_month_id: budgetMonthId,
              account: group.accountKey,
              category: group.accountKey,
              amount: newBalance,
            })
          }
        }
      }
    }

    // Insert one negative power entry per expense with subcuenta assigned
    const powerExpensesWithSub = expensesToSettle.filter(e => isPowerExpense(e) && hasPowerSubcuenta(e))
    if (powerExpensesWithSub.length > 0) {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('power_account_entries') as any).insert(powerRows)
    }

    const newCorteWithTotals: CorteWithTotals = {
      ...newCorte,
      corte_account_totals: totalsRows.map((r, i) => ({ ...r, id: `temp-${i}` })),
    }

    const settledIdSet = new Set(settledIds)
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
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Corte de Cuentas</h1>
        <button
          onClick={() => setShowConfirmModal(true)}
          disabled={!hasToSettle || hasUnclassified || powerWithoutSubcuenta.length > 0}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-700 transition"
        >
          Realizar Corte
        </button>
      </div>

      {/* Pending summary banner */}
      {hasPending ? (
        <div className="mb-4 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300">
          <span className="font-semibold">{localPending.length} gasto{localPending.length !== 1 ? 's' : ''} pendientes</span>
          {earliestDate && (
            <span className="ml-1">desde {formatDate(earliestDate)}</span>
          )}
        </div>
      ) : (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-800 dark:text-green-300">
          Sin gastos pendientes. Todos los gastos han sido liquidados.
        </div>
      )}

      {/* Blocking issues — unclassified + power without subcuenta */}
      {(hasUnclassified || powerWithoutSubcuenta.length > 0) && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-300">
          <p className="font-semibold mb-2">
            El corte no puede realizarse hasta resolver los siguientes gastos en el tab Gastos:
          </p>
          <ul className="space-y-1">
            {unclassifiedExpenses.map(e => (
              <li key={e.id} className="flex items-center gap-2 flex-wrap">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 dark:bg-red-500 flex-shrink-0" />
                <span className="font-medium">{formatDate(e.date)}</span>
                <span className="text-red-700 dark:text-red-400 truncate">{e.description}</span>
                <span className="text-xs text-red-500 dark:text-red-400 italic">({unclassifiedLabel(e)})</span>
              </li>
            ))}
            {powerWithoutSubcuenta.map(e => (
              <li key={e.id} className="flex items-center gap-2 flex-wrap">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 dark:bg-red-500 flex-shrink-0" />
                <span className="font-medium">{formatDate(e.date)}</span>
                <span className="text-red-700 dark:text-red-400 truncate">{e.description}</span>
                <span className="text-xs text-red-500 dark:text-red-400 italic">
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
          <label className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
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
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {expensesToSettle.length < localPending.length && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
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
            <div className="col-span-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-4 py-3">
              <p className="text-xs text-emerald-500 dark:text-emerald-400 font-medium mb-1">Total a transferir</p>
              <p className="text-base font-bold text-emerald-800 dark:text-emerald-300">S/ {fmt(totalAmount)}</p>
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
                    className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                      isEmpty
                        ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 opacity-50 cursor-default'
                        : isExpanded
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                    }`}
                  >
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      {group.label}
                    </p>
                    <p className={`text-base font-bold ${isEmpty ? 'text-slate-400 dark:text-slate-600' : 'text-slate-900 dark:text-slate-100'}`}>
                      S/ {fmt(amount)}
                    </p>
                    {!isEmpty && (() => {
                      const balance = group.accountKey === 'power'
                        ? powerTotal
                        : (budgetByAccount[group.accountKey] ?? 0)
                      const remaining = balance - amount
                      return balance > 0 ? (
                        <p className={`text-xs mt-1 font-medium ${remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                          {remaining >= 0 ? `Quedan S/ ${fmt(remaining)}` : `Excede S/ ${fmt(Math.abs(remaining))}`}
                        </p>
                      ) : null
                    })()}
                    {!isEmpty && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {expensesInGroup.length} gasto{expensesInGroup.length !== 1 ? 's' : ''} {isExpanded ? '▲' : '▼'}
                      </p>
                    )}
                  </button>

                  {/* Inline breakdown */}
                  {isExpanded && (
                    <div className="col-span-2 mt-2 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400">
                            <th className="text-left px-3 py-2">Fecha</th>
                            <th className="text-left px-3 py-2">Descripción</th>
                            <th className="text-right px-3 py-2">Monto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {expensesInGroup.map(e => (
                            <tr key={e.id} className="bg-white dark:bg-slate-900">
                              <td className="px-3 py-2 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                {formatDate(e.date)}
                              </td>
                              <td className="px-3 py-2 text-slate-900 dark:text-slate-100">
                                {e.description}
                              </td>
                              <td className="px-3 py-2 text-right font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                S/ {fmt(getExpenseAmountForGroup(e, group.expenseColumns))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-50 dark:bg-slate-800 font-semibold text-sm">
                            <td colSpan={2} className="px-3 py-2 text-slate-700 dark:text-slate-300">
                              Total {group.label}
                            </td>
                            <td className="px-3 py-2 text-right text-emerald-700 dark:text-emerald-400">
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
                  <div className={`px-4 py-3 rounded-xl border transition ${
                    isEmpty
                      ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 opacity-50'
                      : isExpanded
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Gastos personales
                      </p>
                      <button
                        onClick={() => {
                          if (showPersonal && isExpanded) setExpandedAccount(null)
                          setShowPersonal(v => !v)
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition p-0.5"
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
                      <p className={`text-base font-bold ${isEmpty ? 'text-slate-400 dark:text-slate-600' : 'text-slate-900 dark:text-slate-100'}`}>
                        {showPersonal ? `S/ ${fmt(totalGastado)}` : '••••••'}
                      </p>
                      {!isEmpty && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {personalExpenses.length} gasto{personalExpenses.length !== 1 ? 's' : ''} {isExpanded ? '▲' : '▼'}
                        </p>
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-2 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400">
                            <th className="text-left px-3 py-2">Fecha</th>
                            <th className="text-left px-3 py-2">Descripción</th>
                            <th className="text-right px-3 py-2">Monto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {personalExpenses.map(e => (
                            <tr key={e.id} className="bg-white dark:bg-slate-900">
                              <td className="px-3 py-2 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                {formatDate(e.date)}
                              </td>
                              <td className="px-3 py-2 text-slate-900 dark:text-slate-100">
                                {e.description}
                              </td>
                              <td className="px-3 py-2 text-right font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                {showPersonal ? `S/ ${fmt(e.julio ?? 0)}` : '••••'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-50 dark:bg-slate-800 font-semibold text-sm">
                            <td colSpan={2} className="px-3 py-2 text-slate-700 dark:text-slate-300">
                              Total Gastos personales
                            </td>
                            <td className="px-3 py-2 text-right text-emerald-700 dark:text-emerald-400">
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
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
          Historial de cortes
        </h2>
        {localCortes.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-600">Sin cortes registrados.</p>
        ) : (
          <div className="space-y-2">
            {localCortes.map(corte => {
              const corteTotal = corte.corte_account_totals.reduce((s, t) => s + t.total_amount, 0)
              const isOpen = expandedCorteId === corte.id
              const corteExpenses = corteExpensesCache[corte.id] ?? []
              return (
                <div
                  key={corte.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden"
                >
                  <div className="flex items-center">
                    <button
                      onClick={() => openCorte(isOpen ? null : corte.id)}
                      className="flex-1 flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                    >
                      <div>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {formatDate(corte.settled_date)} — {MONTH_NAMES[corte.month]} {corte.year}
                        </span>
                        {corte.notes && (
                          <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                            {corte.notes}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          S/ {fmt(corteTotal)}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 text-xs">
                          {isOpen ? '▲' : '▼'}
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => revertCorte(corte.id)}
                      disabled={revertingId === corte.id}
                      className="px-3 py-3 text-xs text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-40 border-l border-slate-100 dark:border-slate-700"
                      title="Revertir corte"
                    >
                      {revertingId === corte.id ? '...' : 'Revertir'}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="border-t border-slate-100 dark:border-slate-700">
                      {loadingCorteExpenses && !corteExpensesCache[corte.id] ? (
                        <p className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500">Cargando detalle...</p>
                      ) : (
                        <table className="w-full text-sm">
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {corte.corte_account_totals
                              .sort((a, b) => b.total_amount - a.total_amount)
                              .map(t => {
                                const group = CORTE_ACCOUNT_GROUPS.find(g => g.accountKey === t.account_key)
                                const isAccountExpanded = expandedCorteAccount === `${corte.id}:${t.account_key}`
                                const groupExpenses = group
                                  ? corteExpenses.filter(e => getExpenseAmountForGroup(e, group.expenseColumns) > 0)
                                  : []
                                return (
                                  <Fragment key={t.id}>
                                    <tr
                                      className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition ${isAccountExpanded ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-white dark:bg-slate-800'}`}
                                      onClick={() => setExpandedCorteAccount(isAccountExpanded ? null : `${corte.id}:${t.account_key}`)}
                                    >
                                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                                        {group?.label ?? t.account_key}
                                        {groupExpenses.length > 0 && (
                                          <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500">
                                            ({groupExpenses.length}) {isAccountExpanded ? '▲' : '▼'}
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-2 text-right font-medium text-slate-900 dark:text-slate-100">
                                        S/ {fmt(t.total_amount)}
                                      </td>
                                    </tr>
                                    {isAccountExpanded && groupExpenses.map(e => (
                                      <tr key={e.id} className="bg-slate-50 dark:bg-slate-700/20">
                                        <td className="pl-8 pr-4 py-1.5 text-xs text-slate-500 dark:text-slate-400">
                                          <span className="text-slate-400 dark:text-slate-500 mr-2">{formatDate(e.date)}</span>
                                          {e.description}
                                        </td>
                                        <td className="px-4 py-1.5 text-right text-xs text-slate-600 dark:text-slate-400">
                                          S/ {fmt(group ? getExpenseAmountForGroup(e, group.expenseColumns) : 0)}
                                        </td>
                                      </tr>
                                    ))}
                                  </Fragment>
                                )
                              })}
                          </tbody>
                          <tfoot>
                            <tr className="bg-slate-50 dark:bg-slate-700/50 font-semibold">
                              <td className="px-4 py-2 text-slate-700 dark:text-slate-300">Total</td>
                              <td className="px-4 py-2 text-right text-emerald-700 dark:text-emerald-400">
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Confirmar Corte</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {expensesToSettle.length} gastos · {earliestDate && formatDate(earliestDate)} — {formatDate(cutoffDate)}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Fecha del corte</label>
                <input
                  type="date"
                  value={settledDateInput}
                  onChange={e => setSettledDateInput(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="px-6 py-4">
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="text-xs text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left pb-2">Cuenta</th>
                    <th className="text-right pb-2">Transferir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {CORTE_ACCOUNT_GROUPS.filter(g => accountTotals[g.accountKey] > 0).map(g => (
                    <tr key={g.accountKey}>
                      <td className="py-2 text-slate-700 dark:text-slate-300">{g.label}</td>
                      <td className="py-2 text-right font-medium text-slate-900 dark:text-slate-100">
                        S/ {fmt(accountTotals[g.accountKey])}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 dark:border-slate-700 font-bold">
                    <td className="pt-2 text-slate-900 dark:text-slate-100">TOTAL</td>
                    <td className="pt-2 text-right text-emerald-700 dark:text-emerald-400">
                      S/ {fmt(totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Nota (opcional)
                </label>
                <input
                  type="text"
                  value={corteNotes}
                  onChange={e => setCorteNotes(e.target.value)}
                  placeholder="ej. Corte mid-mes Abril"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowConfirmModal(false); setCorteNotes(''); resetSettledDate() }}
                  disabled={performing}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={realizarCorte}
                  disabled={performing}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 transition"
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
