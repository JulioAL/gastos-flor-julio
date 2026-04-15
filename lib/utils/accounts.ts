export const ACCOUNTS = [
  { key: 'casita', label: 'Casita', description: 'Comida, limpieza, mantenimiento, luz, internet, teléfonos' },
  { key: 'power', label: 'Power', description: 'Ahorros, salud, seguro carro, bebé, casa, emergencias' },
  { key: 'limpieza_regalos', label: 'Limpieza y Regalos', description: 'Servicio de limpieza + regalos' },
  { key: 'entretenimiento', label: 'Entretenimiento', description: 'YouTube, Netflix, servicios online' },
  { key: 'flor_julio', label: 'Flor y Julio', description: 'Salidas y compras varias del mes' },
  { key: 'navidad', label: 'Navidad', description: 'S/50 mensual para regalos navideños' },
  { key: 'gaso', label: 'Gasolina', description: 'Combustible mensual' },
] as const

export type AccountKey = typeof ACCOUNTS[number]['key']

export const BUDGET_CATEGORIES = [
  { key: 'mantenimiento',              label: 'Mantenimiento',                  responsible: 'julio', account: 'casita' },
  { key: 'energia_electrica',          label: 'Energía Eléctrica',              responsible: 'flor',  account: 'casita' },
  { key: 'telefono_casa_internet',     label: 'Teléfono en casa e internet',    responsible: 'flor',  account: 'casita' },
  { key: 'telefono_celular',           label: 'Teléfono celular',               responsible: 'ambos', account: 'casita' },
  { key: 'alquiler_casa',              label: 'Alquiler de casa',               responsible: 'julio', account: 'casita' },
  { key: 'transporte_personal',        label: 'Transporte personal',            responsible: 'ambos', account: 'flor_julio' },
  { key: 'combustible',                label: 'Combustible',                    responsible: 'ambos', account: 'gaso' },
  { key: 'alimentos_hogar',            label: 'Alimentos de hogar',             responsible: 'ambos', account: 'casita' },
  { key: 'limpieza_cuidado_personal',  label: 'Limpieza / Cuidado Personal',    responsible: 'ambos', account: 'casita' },
  { key: 'salud',                      label: 'Salud',                          responsible: 'ambos', account: 'power' },
  { key: 'ofrenda',                    label: 'Ofrenda',                        responsible: 'flor',  account: 'casita' },
  { key: 'limpieza_casa_servicio',     label: 'Limpieza Casa (servicio)',        responsible: 'ambos', account: 'limpieza_regalos' },
  { key: 'gastos_comida_salidas_compras', label: 'Gastos comida/salidas/compras', responsible: 'ambos', account: 'flor_julio' },
  { key: 'ropa_calzado',              label: 'Ropa y Calzado',                  responsible: 'ambos', account: 'flor_julio' },
  { key: 'entretenimiento',           label: 'Entretenimiento',                 responsible: 'ambos', account: 'entretenimiento' },
  { key: 'seguro_carro',              label: 'Seguro Carro',                    responsible: 'ambos', account: 'power' },
  { key: 'regalos_celebraciones',     label: 'Regalos y celebraciones',         responsible: 'ambos', account: 'limpieza_regalos' },
  { key: 'noche_buena_regalos',       label: 'Noche Buena - Regalos',           responsible: 'ambos', account: 'navidad' },
  { key: 'baby',                      label: 'Baby',                            responsible: 'ambos', account: 'power' },
  { key: 'familias',                  label: 'Familias',                        responsible: 'ambos', account: 'limpieza_regalos' },
  { key: 'otros_julio_flor',          label: 'Otros (Julio y Flor)',            responsible: 'ambos', account: 'flor_julio' },
  { key: 'ahorro_casa',               label: 'Ahorro casa',                     responsible: 'ambos', account: 'power' },
  { key: 'emergencia',                label: 'Emergencia',                      responsible: 'ambos', account: 'power' },
] as const

// Power account sub-columns — shared between PowerClient and GastosClient
export const POWER_COLS: { key: string; label: string }[] = [
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

export const MONTH_NAMES: Record<number, string> = {
  1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
  5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
  9: 'Setiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre',
}

export const MONTH_FROM_NAME: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4,
  mayo: 5, junio: 6, julio: 7, agosto: 8,
  setiembre: 9, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
}

// Personal expense columns and their display labels
export const EXPENSE_COLUMNS = [
  { key: 'casita',         label: 'Casita',         account: 'casita' },
  { key: 'flor_julio',     label: 'FlorYJulio',     account: 'flor_julio' },
  { key: 'julio',          label: 'Julio',          account: null },
  { key: 'flor',           label: 'Flor debe',      account: null },
  { key: 'salidas',        label: 'Salidas',        account: 'flor_julio' },
  { key: 'power',          label: 'Power',          account: 'power' },
  { key: 'gasolina',       label: 'Gasolina',       account: 'gaso' },
  { key: 'regalos',        label: 'Limpieza y Regalos', account: 'limpieza_regalos' },
  { key: 'navidad',        label: 'Navidad',        account: 'navidad' },
  { key: 'otros_power',    label: 'Otros (Power)',  account: 'power' },
  { key: 'entretenimiento',label: 'Entretenimiento',account: 'entretenimiento' },
] as const

// Groups expense columns by bank account for corte de cuentas settlement
// julio/flor columns excluded — they are personal/IOUs, not bank account charges
export const CORTE_ACCOUNT_GROUPS = [
  { accountKey: 'casita',           label: 'Casita',             expenseColumns: ['casita'] as string[] },
  { accountKey: 'flor_julio',       label: 'Flor y Julio',       expenseColumns: ['flor_julio', 'salidas'] as string[] },
  { accountKey: 'power',            label: 'Power',              expenseColumns: ['power', 'otros_power'] as string[] },
  { accountKey: 'gaso',             label: 'Gasolina',           expenseColumns: ['gasolina'] as string[] },
  { accountKey: 'limpieza_regalos', label: 'Limpieza y Regalos', expenseColumns: ['regalos'] as string[] },
  { accountKey: 'navidad',          label: 'Navidad',            expenseColumns: ['navidad'] as string[] },
  { accountKey: 'entretenimiento',  label: 'Entretenimiento',    expenseColumns: ['entretenimiento'] as string[] },
]

export function computeCorteAccountTotals(
  expenses: Record<string, number | null | string | boolean>[]
): Record<string, number> {
  const totals: Record<string, number> = {}
  for (const group of CORTE_ACCOUNT_GROUPS) {
    totals[group.accountKey] = expenses.reduce((sum, e) => {
      return sum + group.expenseColumns.reduce((s, col) => s + ((e[col] as number | null) ?? 0), 0)
    }, 0)
  }
  return totals
}
