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

// ============================================================
// Expense Tag Taxonomy
// ============================================================

export interface ExpenseSubcategory {
  key: string
  label: string
  keywords: string[]
}

export interface ExpenseCategory {
  key: string
  label: string
  color: string
  subcategories: ExpenseSubcategory[]
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { key: 'hogar', label: 'Hogar', color: 'blue', subcategories: [
    { key: 'alquiler',      label: 'Alquiler',      keywords: ['alquiler', 'renta', 'arriendo'] },
    { key: 'mantenimiento', label: 'Mantenimiento',  keywords: ['mantenimiento'] },
    { key: 'servicios',     label: 'Servicios',      keywords: ['internet', 'cable', 'telefono', 'celular', 'wifi', 'servicio luz', 'servicio agua', 'servicio gas', 'reparacion', 'plomero', 'electricista', 'pintura', 'gasfitero'] },
  ]},
  { key: 'alimentacion', label: 'Alimentación', color: 'green', subcategories: [
    { key: 'supermercado',  label: 'Supermercado',   keywords: ['supermercado', 'plaza vea', 'wong', 'tottus', 'vivanda', 'mercado', 'bodega', 'mass tambo', 'tambo'] },
    { key: 'restaurantes',  label: 'Restaurantes',   keywords: ['restaurant', 'rest.', 'restaurante', 'almuerzo', 'cena', 'desayuno', 'cafeteria', 'pizza', 'burger', 'chifa', 'sushi', 'sangucheria'] },
    { key: 'delivery',      label: 'Delivery',        keywords: ['delivery', 'rappi', 'pedidosya', 'uber eats', 'dominos'] },
  ]},
  { key: 'transporte', label: 'Transporte', color: 'amber', subcategories: [
    { key: 'gasolina',           label: 'Gasolina',            keywords: ['gaso', 'gasolina', 'combustible', 'grifo', 'gasolinera', 'repsol', 'primax', 'pecsa'] },
    { key: 'taxi',               label: 'Taxi / Apps',         keywords: ['taxi', 'tacho', 'didi', 'uber', 'cabify', 'indriver', 'beat', 'colectivo'] },
    { key: 'mant_auto',          label: 'Mantenimiento auto',  keywords: ['llanta', 'aceite motor', 'mecanico', 'taller mecanico', 'lavado auto', 'soat', 'revisión técnica'] },
    { key: 'seguro_vehicular',   label: 'Seguro vehicular',    keywords: ['seguro auto', 'seguro carro', 'seguro vehicular'] },
  ]},
  { key: 'trabajo', label: 'Trabajo', color: 'indigo', subcategories: [
    { key: 'herramientas',   label: 'Herramientas',        keywords: ['software', 'licencia software', 'herramienta', 'laptop', 'computadora', 'monitor'] },
    { key: 'cursos_trabajo', label: 'Cursos',              keywords: ['capacitacion', 'seminario', 'diplomado'] },
    { key: 'suscripciones',  label: 'Suscripciones lab.',  keywords: ['github', 'figma', 'notion', 'slack', 'zoom', 'adobe', 'aws', 'cloud'] },
  ]},
  { key: 'finanzas', label: 'Finanzas', color: 'rose', subcategories: [
    { key: 'intereses',  label: 'Intereses',           keywords: ['interes', 'prestamo', 'credito', 'deuda', 'cuota prestamo'] },
    { key: 'comisiones', label: 'Comisiones bancarias', keywords: ['comision banco', 'itf', 'mantenimiento cuenta'] },
  ]},
  { key: 'compras', label: 'Compras personales', color: 'violet', subcategories: [
    { key: 'ropa',       label: 'Ropa',        keywords: ['ropa', 'zapatos', 'calzado', 'zapatillas', 'camisa', 'pantalon', 'vestido'] },
    { key: 'tecnologia', label: 'Tecnología',  keywords: ['electronico', 'tablet', 'auriculares', 'audifonos', 'cargador', 'apple', 'samsung'] },
    { key: 'cuidado_personal', label: 'Cuidado personal',  keywords: ['corte de cabello', 'nicolini', 'perfume', 'crema', 'hidratante', 'labial', 'esmalte'] },
    { key: 'gadgets',    label: 'Gadgets',     keywords: ['gadget', 'accesorio tech', 'smartwatch'] },
  ]},
  { key: 'entretenimiento', label: 'Entretenimiento', color: 'pink', subcategories: [
    { key: 'streaming',  label: 'Streaming',  keywords: ['netflix', 'spotify', 'youtube premium', 'disney', 'hbo', 'amazon prime', 'crunchyroll'] },
    { key: 'cine',       label: 'Cine',       keywords: ['cine', 'cineplanet', 'cinemark', 'uvk'] },
    { key: 'salidas_ent',label: 'Salidas',    keywords: ['discoteca', 'karaoke', 'boliche'] },
    { key: 'juegos',     label: 'Juegos',     keywords: ['steam', 'playstation', 'xbox', 'nintendo', 'videojuego'] },
  ]},
  { key: 'salud', label: 'Salud', color: 'teal', subcategories: [
    { key: 'consultas',   label: 'Consultas médicas', keywords: ['doctor', 'medico', 'consulta medica', 'clinica', 'hospital', 'especialista', 'dentista', 'odontologo'] },
    { key: 'medicinas',   label: 'Medicinas',         keywords: ['farmacia', 'medicamento', 'pastilla', 'vitamina', 'inkafarma', 'mifarma', 'botica'] },
    { key: 'tratamiento', label: 'Tratamiento',       keywords: ['tratamiento', 'terapia', 'fisioterapia', 'laboratorio clinico', 'radiografia'] },
  ]},
  { key: 'educacion', label: 'Educación', color: 'cyan', subcategories: [
    { key: 'cursos_edu',      label: 'Cursos',          keywords: ['udemy', 'coursera', 'platzi', 'academia', 'clase particular'] },
    { key: 'libros',          label: 'Libros',          keywords: ['libro', 'libreria', 'kindle', 'audible'] },
    { key: 'certificaciones', label: 'Certificaciones', keywords: ['certificacion', 'certificado profesional'] },
  ]},
  { key: 'viajes', label: 'Viajes', color: 'sky', subcategories: [
    { key: 'pasajes',    label: 'Pasajes',    keywords: ['pasaje', 'vuelo', 'aerolinea', 'latam', 'avianca', 'cruz del sur', 'oltursa'] },
    { key: 'hospedaje',  label: 'Hospedaje',  keywords: ['hotel', 'hostal', 'airbnb', 'hospedaje', 'alojamiento'] },
    { key: 'actividades',label: 'Actividades',keywords: ['tour', 'excursion', 'museo', 'parque tematico'] },
  ]},
  { key: 'familia', label: 'Familia', color: 'orange', subcategories: [
    { key: 'regalos',   label: 'Regalos',        keywords: ['regalo', 'presente', 'cumpleanos', 'dia de la madre', 'dia del padre'] },
    { key: 'eventos',   label: 'Eventos',        keywords: ['bautizo', 'matrimonio', 'boda', 'quinceanos', 'baby shower', 'evento familiar'] },
    { key: 'apoyo_fam', label: 'Apoyo familiar', keywords: ['apoyo familiar', 'prestamo familiar'] },
  ]},
  { key: 'otros', label: 'Otros', color: 'gray', subcategories: [
    { key: 'imprevistos', label: 'Imprevistos', keywords: ['imprevisto', 'emergencia imprevista', 'gasto inesperado'] },
  ]},
]

// Returns { category, subcategory } keys or null. Longest keyword match wins (more specific wins ties).
export function detectExpenseTag(description: string): { category: string; subcategory: string } | null {
  const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const normalized = normalize(description)
  let best: { category: string; subcategory: string } | null = null
  let bestScore = 0
  for (const cat of EXPENSE_CATEGORIES) {
    for (const sub of cat.subcategories) {
      for (const kw of sub.keywords) {
        const nkw = normalize(kw)
        if (normalized.includes(nkw) && nkw.length > bestScore) {
          bestScore = nkw.length
          best = { category: cat.key, subcategory: sub.key }
        }
      }
    }
  }
  return best
}

export function getCategoryMeta(key: string): ExpenseCategory | undefined {
  return EXPENSE_CATEGORIES.find(c => c.key === key)
}
