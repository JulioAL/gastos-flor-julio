'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CORTE_ACCOUNT_GROUPS, computeCorteAccountTotals, MONTH_NAMES } from '@/lib/utils/accounts'
import type { PersonalExpense, CorteWithTotals } from '@/lib/supabase/types'

interface Props {
  pendingExpenses: PersonalExpense[]
  cortes: CorteWithTotals[]
  userId: string
}

const fmt = (n: number) =>
  n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function getExpenseAmountForGroup(e: PersonalExpense, cols: string[]): number {
  return cols.reduce((s, col) => s + ((e[col as keyof PersonalExpense] as number | null) ?? 0), 0)
}

function formatDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-')
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Set','Oct','Nov','Dic']
  return `${parseInt(d)} ${months[parseInt(m) - 1]}`
}

export default function CorteClient({ pendingExpenses, cortes, userId }: Props) {
  const supabase = createClient()

  const [localPending, setLocalPending] = useState<PersonalExpense[]>(pendingExpenses)
  const [localCortes, setLocalCortes] = useState<CorteWithTotals[]>(cortes)
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [corteNotes, setCorteNotes] = useState('')
  const [performing, setPerforming] = useState(false)
  const [expandedCorteId, setExpandedCorteId] = useState<string | null>(null)
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

  async function realizarCorte() {
    setPerforming(true)
    const now = new Date()
    const settledDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

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
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Corte de Cuentas</h1>
        <button
          onClick={() => setShowConfirmModal(true)}
          disabled={!hasToSettle}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 transition"
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

      {/* Cutoff date picker */}
      {hasPending && (
        <div className="mb-5 flex items-center gap-3">
          <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
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
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {expensesToSettle.length < localPending.length && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {expensesToSettle.length} de {localPending.length} gastos
            </span>
          )}
        </div>
      )}

      {/* Account cards grid */}
      {hasToSettle && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Transferencias a realizar · Total S/ {fmt(totalAmount)}
          </p>
          <div className="grid grid-cols-2 gap-3">
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
                        ? 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 opacity-50 cursor-default'
                        : isExpanded
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {group.label}
                    </p>
                    <p className={`text-base font-bold ${isEmpty ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-gray-100'}`}>
                      S/ {fmt(amount)}
                    </p>
                    {!isEmpty && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {expensesInGroup.length} gasto{expensesInGroup.length !== 1 ? 's' : ''} {isExpanded ? '▲' : '▼'}
                      </p>
                    )}
                  </button>

                  {/* Inline breakdown */}
                  {isExpanded && (
                    <div className="col-span-2 mt-2 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
                            <th className="text-left px-3 py-2">Fecha</th>
                            <th className="text-left px-3 py-2">Descripción</th>
                            <th className="text-right px-3 py-2">Monto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {expensesInGroup.map(e => (
                            <tr key={e.id} className="bg-white dark:bg-gray-900">
                              <td className="px-3 py-2 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {formatDate(e.date)}
                              </td>
                              <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                                {e.description}
                              </td>
                              <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                S/ {fmt(getExpenseAmountForGroup(e, group.expenseColumns))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50 dark:bg-gray-800 font-semibold text-sm">
                            <td colSpan={2} className="px-3 py-2 text-gray-700 dark:text-gray-300">
                              Total {group.label}
                            </td>
                            <td className="px-3 py-2 text-right text-indigo-700 dark:text-indigo-400">
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
          </div>
        </div>
      )}

      {/* Historial de cortes */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Historial de cortes
        </h2>
        {localCortes.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-600">Sin cortes registrados.</p>
        ) : (
          <div className="space-y-2">
            {localCortes.map(corte => {
              const corteTotal = corte.corte_account_totals.reduce((s, t) => s + t.total_amount, 0)
              const isOpen = expandedCorteId === corte.id
              return (
                <div
                  key={corte.id}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedCorteId(isOpen ? null : corte.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatDate(corte.settled_date)} — {MONTH_NAMES[corte.month]} {corte.year}
                      </span>
                      {corte.notes && (
                        <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                          {corte.notes}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        S/ {fmt(corteTotal)}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500 text-xs">
                        {isOpen ? '▲' : '▼'}
                      </span>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="border-t border-gray-100 dark:border-gray-700">
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {corte.corte_account_totals
                            .sort((a, b) => b.total_amount - a.total_amount)
                            .map(t => {
                              const group = CORTE_ACCOUNT_GROUPS.find(g => g.accountKey === t.account_key)
                              return (
                                <tr key={t.id} className="bg-white dark:bg-gray-800">
                                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                    {group?.label ?? t.account_key}
                                  </td>
                                  <td className="px-4 py-2 text-right font-medium text-gray-900 dark:text-gray-100">
                                    S/ {fmt(t.total_amount)}
                                  </td>
                                </tr>
                              )
                            })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50 dark:bg-gray-700/50 font-semibold">
                            <td className="px-4 py-2 text-gray-700 dark:text-gray-300">Total</td>
                            <td className="px-4 py-2 text-right text-indigo-700 dark:text-indigo-400">
                              S/ {fmt(corteTotal)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 pb-6 sm:pb-0">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Confirmar Corte</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {expensesToSettle.length} gastos · {earliestDate && formatDate(earliestDate)} — {formatDate(cutoffDate)}
              </p>
            </div>
            <div className="px-6 py-4">
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="text-xs text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left pb-2">Cuenta</th>
                    <th className="text-right pb-2">Transferir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {CORTE_ACCOUNT_GROUPS.filter(g => accountTotals[g.accountKey] > 0).map(g => (
                    <tr key={g.accountKey}>
                      <td className="py-2 text-gray-700 dark:text-gray-300">{g.label}</td>
                      <td className="py-2 text-right font-medium text-gray-900 dark:text-gray-100">
                        S/ {fmt(accountTotals[g.accountKey])}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200 dark:border-gray-700 font-bold">
                    <td className="pt-2 text-gray-900 dark:text-gray-100">TOTAL</td>
                    <td className="pt-2 text-right text-indigo-700 dark:text-indigo-400">
                      S/ {fmt(totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Nota (opcional)
                </label>
                <input
                  type="text"
                  value={corteNotes}
                  onChange={e => setCorteNotes(e.target.value)}
                  placeholder="ej. Corte mid-mes Abril"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowConfirmModal(false); setCorteNotes('') }}
                  disabled={performing}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={realizarCorte}
                  disabled={performing}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition"
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
