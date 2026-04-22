/**
 * Migration script: presupuesto_flor_y_julio.xlsx + gastos_julio.xlsx → Supabase
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/migrate.js
 *
 * Rules:
 *   - Budget: only tabs containing "2026" in the name
 *   - Gastos Julio: only tabs containing "2026" in the name
 *   - Power (Cuentasbanco v2): ALL rows, no year filter
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const XLSX = require('xlsx')
const { createClient } = require('@supabase/supabase-js')
/* eslint-enable @typescript-eslint/no-require-imports */

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const JULIO_USER_ID = process.env.JULIO_USER_ID // Julio's auth.users UUID

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !JULIO_USER_ID) {
  console.error('Required env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, JULIO_USER_ID')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_MAP = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, setiembre: 9, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
}

function parseMonthFromTabName(tabName) {
  // "2026 - Enero" → { year: 2026, month: 1 }
  const match = tabName.match(/(\d{4})\s*[-–]\s*(\w+)/i)
  if (!match) return null
  const year = parseInt(match[1])
  const monthName = match[2].toLowerCase()
  const month = MONTH_MAP[monthName]
  return month ? { year, month } : null
}

function num(val) {
  if (val === '' || val === null || val === undefined) return null
  const n = parseFloat(val)
  return isNaN(n) ? null : n
}

function excelDateToISO(serial) {
  if (!serial || typeof serial !== 'number') return null
  // Excel serial date to JS Date
  const date = new Date(Math.round((serial - 25569) * 86400 * 1000))
  return date.toISOString().split('T')[0]
}

// ─── Budget migration ──────────────────────────────────────────────────────────

// Repartición column indices (0-based in full row):
// col 16 = "" (spacer)
// col 17 = label (category name)
// col 18 = julio amount
// col 19 = flor amount
// col 20 = casita
// col 21 = power
// col 22 = limpieza_regalos (LimpRegal J)
// col 23 = flor_julio (FlorJulio)
// col 24 = navidad (NavidadJ)
// col 25 = gaso (GasoJ)

/* eslint-disable @typescript-eslint/no-unused-vars */
const REPARTO_COLS = {
  julio: 18,
  flor: 19,
  casita: 20,
  power: 21,
  limpieza_regalos: 22,
  flor_julio: 23,
  navidad: 24,
  gaso: 25,
}

// Category label → DB key mapping
const CATEGORY_LABEL_MAP = {
  'mantenimiento':               'mantenimiento',
  'energia electrica':           'energia_electrica',
  'energía eléctrica':           'energia_electrica',
  'telefono en casa e internet': 'telefono_casa_internet',
  'teléfono en casa e internet': 'telefono_casa_internet',
  'telefono celular':            'telefono_celular',
  'teléfono celular':            'telefono_celular',
  'alquiler de casa':            'alquiler_casa',
  'transporte personal':         'transporte_personal',
  'combustible':                 'combustible',
  'alimentos de hogar':          'alimentos_hogar',
  'limpieza_cuidado personal':   'limpieza_cuidado_personal',
  'limpieza cuidado personal':   'limpieza_cuidado_personal',
  'salud':                       'salud',
  'ofrenda':                     'ofrenda',
  'limpieza casa (servicio)':    'limpieza_casa_servicio',
  'gastos comida/salidas/compras': 'gastos_comida_salidas_compras',
  'ropa y calzado':              'ropa_calzado',
  'entretenimiento':             'entretenimiento',
  'seguro carro':                'seguro_carro',
  'regalos y celebraciones':     'regalos_celebraciones',
  'noche buena - regalos':       'noche_buena_regalos',
  'baby':                        'baby',
  'familias':                    'familias',
  'otros (julio y flor)':        'otros_julio_flor',
  'ahorro casa':                 'ahorro_casa',
  'emergencia':                  'emergencia',
}

// Responsible per category
const RESPONSIBLE_MAP = {
  mantenimiento: 'julio', energia_electrica: 'flor', telefono_casa_internet: 'flor',
  telefono_celular: 'ambos', alquiler_casa: 'julio', transporte_personal: 'ambos',
  combustible: 'ambos', alimentos_hogar: 'ambos', limpieza_cuidado_personal: 'ambos',
  salud: 'ambos', ofrenda: 'flor', limpieza_casa_servicio: 'ambos',
  gastos_comida_salidas_compras: 'ambos', ropa_calzado: 'ambos', entretenimiento: 'ambos',
  seguro_carro: 'ambos', regalos_celebraciones: 'ambos', noche_buena_regalos: 'ambos',
  baby: 'ambos', familias: 'ambos', otros_julio_flor: 'ambos',
  ahorro_casa: 'ambos', emergencia: 'ambos',
}

// Account per category
const ACCOUNT_MAP = {
  mantenimiento: 'casita', energia_electrica: 'casita', telefono_casa_internet: 'casita',
  telefono_celular: 'casita', alquiler_casa: 'casita', transporte_personal: 'flor_julio',
  combustible: 'gaso', alimentos_hogar: 'casita', limpieza_cuidado_personal: 'casita',
  salud: 'power', ofrenda: 'casita', limpieza_casa_servicio: 'limpieza_regalos',
  gastos_comida_salidas_compras: 'flor_julio', ropa_calzado: 'flor_julio', entretenimiento: 'entretenimiento',
  seguro_carro: 'power', regalos_celebraciones: 'limpieza_regalos', noche_buena_regalos: 'navidad',
  baby: 'power', familias: 'limpieza_regalos', otros_julio_flor: 'flor_julio',
  ahorro_casa: 'power', emergencia: 'power',
}

async function migrateBudget(wb) {
  const tabs2026 = wb.SheetNames.filter(n => n.includes('2026') && n !== 'Cuentasbanco v2' && n !== 'Hoja 3')
  console.log(`\n📅 Budget tabs 2026: ${tabs2026.join(', ')}`)

  for (const tab of tabs2026) {
    const parsed = parseMonthFromTabName(tab)
    if (!parsed) { console.log(`  ⚠️  Skipping ${tab} (can't parse month)`); continue }

    const { year, month } = parsed
    const monthColIdx = month + 2 // Enero=3, Febrero=4, etc.

    console.log(`\n  📄 ${tab} → ${year}/${month}`)

    // Insert budget_month
    const { data: bm, error: bmErr } = await supabase
      .from('budget_months')
      .upsert({ year, month, tab_name: tab }, { onConflict: 'year,month' })
      .select()
      .single()

    if (bmErr) { console.error('  ❌ budget_month error:', bmErr.message); continue }
    const budgetMonthId = bm.id

    const ws = wb.Sheets[tab]
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

    // ── Income (rows 11-14) ──────────────────────────────────────────
    // Row 11: JULIO salary, Row 12: FLOR salary, Row 13: Freelo, Row 14: Otros Ingresos
    const incomeRows = [
      { row: 11, source: 'julio_salary',  description: 'Sueldo Julio' },
      { row: 12, source: 'flor_salary',   description: 'Sueldo Flor' },
      { row: 13, source: 'freelo',        description: 'Freelo' },
      { row: 14, source: 'other',         description: 'Otros Ingresos', included_in_budget: false },
    ]

    const incomeInserts = incomeRows
      .map(({ row, source, description, included_in_budget = true }) => {
        const amount = num(rows[row]?.[monthColIdx])
        if (!amount) return null
        return { budget_month_id: budgetMonthId, source, description, amount, included_in_budget }
      })
      .filter(Boolean)

    if (incomeInserts.length) {
      const { error } = await supabase.from('budget_income').insert(incomeInserts)
      if (error) console.error('  ❌ income insert:', error.message)
      else console.log(`    ✓ ${incomeInserts.length} income rows`)
    }

    // ── Entertainment detail (rows 2-6, cols 1-4) ──────────────────
    // Row 2: netflix, Row 3: apple julio, Row 4: youtube, Row 5: mantenimiento latam
    const entRows = rows.slice(2, 7).filter(r => r[1] && r[1] !== '')
    const entInserts = entRows.map(r => ({
      budget_month_id: budgetMonthId,
      service: String(r[1]),
      amount: num(r[4]) ?? num(r[2]),
    })).filter(e => e.amount)

    if (entInserts.length) {
      const { error } = await supabase.from('budget_entertainment_detail').insert(entInserts)
      if (error) console.error('  ❌ entertainment insert:', error.message)
      else console.log(`    ✓ ${entInserts.length} entertainment rows`)
    }

    // ── Expenses from repartición (rows 19-41, col 17 = label, cols 18-25 = amounts) ──
    const expInserts = []
    for (let r = 19; r <= 41; r++) {
      const row = rows[r]
      if (!row) continue
      const label = String(row[17] ?? '').toLowerCase().trim()
      if (!label) continue
      const categoryKey = CATEGORY_LABEL_MAP[label]
      if (!categoryKey) continue

      // Get amount from the main table (monthColIdx) OR from repartición total
      const mainAmount = num(rows[r]?.[monthColIdx])
      // Also get the individual account amounts from repartición
      // We use mainAmount as the primary amount for budget_expenses
      if (!mainAmount) continue

      expInserts.push({
        budget_month_id: budgetMonthId,
        category: categoryKey,
        amount: mainAmount,
        responsible: RESPONSIBLE_MAP[categoryKey] ?? 'ambos',
        account: ACCOUNT_MAP[categoryKey] ?? null,
      })
    }

    if (expInserts.length) {
      const { error } = await supabase.from('budget_expenses').insert(expInserts)
      if (error) console.error('  ❌ expenses insert:', error.message)
      else console.log(`    ✓ ${expInserts.length} expense rows`)
    }

    // ── Transfers (row 45) ──────────────────────────────────────────
    // Row 45: ["","Total", julio_total, flor_total, casita, power, limpRegal, florJulio, navidad, gaso, grand_total]
    const totalRow = rows[45]
    if (totalRow) {
      const accounts = ['casita', 'power', 'limpieza_regalos', 'flor_julio', 'navidad', 'gaso']
      const colOffset = 20 // casita starts at col 20 in repartición
      const transferInserts = [
        { concept: 'Julio total', account: null, julio_amount: num(totalRow[18]), flor_amount: null },
        { concept: 'Flor total',  account: null, julio_amount: null, flor_amount: num(totalRow[19]) },
        ...accounts.map((acc, i) => ({
          concept: acc,
          account: acc,
          julio_amount: num(totalRow[colOffset + i]),
          flor_amount: null,
        })).filter(t => t.julio_amount),
      ].filter(t => t.julio_amount || t.flor_amount)
        .map(t => ({ ...t, budget_month_id: budgetMonthId }))

      if (transferInserts.length) {
        const { error } = await supabase.from('budget_transfers').insert(transferInserts)
        if (error) console.error('  ❌ transfers insert:', error.message)
        else console.log(`    ✓ ${transferInserts.length} transfer rows`)
      }
    }
  }
}

// ─── Power account migration ───────────────────────────────────────────────────

async function migratePower(wb) {
  console.log('\n⚡ Migrating Power account (Cuentasbanco v2)...')
  const ws = wb.Sheets['Cuentasbanco v2']
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

  // Row 2 is the header: [AÑO, Fecha/mes, Detalle, Carro, Ahorro Casa, Ahorro extra, Sueldo, CTS, Interes ganados, Gratificaciones, AFP, Emergencia, JF baby, Bonos/Utilidades, Salud]
  // Data starts at row 3
  const POWER_COL_IDX = {
    carro: 3, ahorro_casa: 4, ahorro_extra: 5, sueldo: 6, cts: 7,
    intereses_ganados: 8, gratificaciones: 9, afp: 10, emergencia: 11,
    jf_baby: 12, bonos_utilidades: 13, salud: 14,
  }

  const inserts = []
  for (let r = 3; r < rows.length; r++) {
    const row = rows[r]
    if (!row || row.every(c => c === '')) continue

    const entry_year = num(row[0])
    const entry_month = row[1] ? String(row[1]).trim() : null
    const description = row[2] ? String(row[2]).trim() : null

    // Skip if no meaningful data
    const hasData = Object.values(POWER_COL_IDX).some(idx => num(row[idx]) !== null)
    if (!hasData) continue

    const entry = {
      entry_year,
      entry_month,
      description: description || null,
    }

    for (const [key, idx] of Object.entries(POWER_COL_IDX)) {
      entry[key] = num(row[idx])
    }

    inserts.push(entry)
  }

  // Insert in batches of 100
  for (let i = 0; i < inserts.length; i += 100) {
    const batch = inserts.slice(i, i + 100)
    const { error } = await supabase.from('power_account_entries').insert(batch)
    if (error) console.error(`  ❌ power batch ${i}-${i + batch.length}:`, error.message)
    else console.log(`  ✓ Power rows ${i + 1}-${i + batch.length}`)
  }

  console.log(`  Total Power entries: ${inserts.length}`)
}

// ─── Personal expenses migration ──────────────────────────────────────────────

// Maps Excel column header (lowercase, trimmed) → DB field
const GASTOS_COL_MAP = {
  'casita':        'casita',
  'floryjulio':    'flor_julio',
  'julio':         'julio',
  'flor':          'flor',
  'salidas':       'salidas',
  'power':         'power',
  'gasolina':      'gasolina',
  'regalos':       'regalos',
  'navidad':       'navidad',
  'entretenimiento': 'entretenimiento',
}

// Any column not in the map above but not in SKIP is treated as otros_power
const GASTOS_SKIP = new Set([
  'fecha', 'descripción costo', 'descripcion costo', 'costo soles',
  'costo dólares', 'costo dolares', 'flor dolares', 'julio dolares',
  'viaje argentina $',
])

function mapGastosHeader(header) {
  const normalized = String(header).toLowerCase().trim()
  if (GASTOS_SKIP.has(normalized)) return null
  return GASTOS_COL_MAP[normalized] ?? 'otros_power'
}

async function migrateGastos(wb) {
  const tabs2026 = wb.SheetNames.filter(n => n.includes('2026'))
  console.log(`\n💸 Gastos Julio tabs 2026: ${tabs2026.join(', ')}`)

  const allInserts = []

  for (const tab of tabs2026) {
    const ws = wb.Sheets[tab]
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
    if (rows.length < 2) continue

    // Row 0 is header
    const headers = rows[0]
    const colMap = headers.map(h => mapGastosHeader(h))

    // Find date column index
    const dateIdx = headers.findIndex(h => String(h).toLowerCase().includes('fecha'))
    // Find description column index
    const descIdx = headers.findIndex(h => String(h).toLowerCase().includes('descripci'))
    // Find "costo soles" column
    const costoSolesIdx = headers.findIndex(h => String(h).toLowerCase().includes('costo soles'))
    // Fallback: "costo dólares" if no soles column
    const costoIdx = costoSolesIdx !== -1 ? costoSolesIdx : headers.findIndex(h => String(h).toLowerCase().includes('costo'))
/* eslint-enable @typescript-eslint/no-unused-vars */

    // Fallback date = the tab name itself if it's "DD-MM-YYYY", else first day of the tab's month
    const ddmmyyyy = tab.match(/^(\d{2})-(\d{2})-(\d{4})$/)
    const tabFallbackDate = ddmmyyyy
      ? `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`  // → "2026-01-03"
      : (() => {
          const p = parseMonthFromTabName(tab)
          return p ? `${p.year}-${String(p.month).padStart(2, '0')}-01` : new Date().toISOString().split('T')[0]
        })()

    let lastDate = null

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r]
      if (!row || row.every(c => c === '')) continue

      const rawDate = row[dateIdx]
      const dateStr = typeof rawDate === 'number' ? excelDateToISO(rawDate) : null
      if (dateStr) lastDate = dateStr

      const description = row[descIdx] ? String(row[descIdx]).trim() : null
      if (!description) continue

      const entry = {
        user_id: JULIO_USER_ID,
        date: lastDate ?? tabFallbackDate,
        description,
        tab_name: tab,
        year: 2026,
      }

      let hasAmount = false
      for (let c = 0; c < headers.length; c++) {
        const dbField = colMap[c]
        if (!dbField) continue
        const val = num(row[c])
        if (val !== null) {
          // If multiple cols map to 'otros_power', accumulate
          if (dbField === 'otros_power') {
            entry.otros_power = (entry.otros_power ?? 0) + val
          } else {
            entry[dbField] = (entry[dbField] ?? 0) + val
          }
          hasAmount = true
        }
      }

      if (!hasAmount) continue
      allInserts.push(entry)
    }

    console.log(`  📄 ${tab}: ${allInserts.length} expenses so far`)
  }

  // Insert in batches
  for (let i = 0; i < allInserts.length; i += 100) {
    const batch = allInserts.slice(i, i + 100)
    const { error } = await supabase.from('personal_expenses').insert(batch)
    if (error) console.error(`  ❌ gastos batch ${i}:`, error.message)
    else console.log(`  ✓ Gastos rows ${i + 1}-${i + batch.length}`)
  }

  console.log(`  Total personal_expenses inserted: ${allInserts.length}`)
}

// ─── Clean existing data ───────────────────────────────────────────────────────

async function cleanAll() {
  console.log('\n🧹 Cleaning existing data...')
  const tables = [
    'personal_expenses',
    'power_account_entries',
    'budget_transfers',
    'budget_entertainment_detail',
    'budget_expenses',
    'budget_income',
    'budget_months',
  ]
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) console.error(`  ❌ Clean ${table}:`, error.message)
    else console.log(`  ✓ Cleaned ${table}`)
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Starting migration...')
  console.log(`   Supabase: ${SUPABASE_URL}`)
  console.log(`   Julio user ID: ${JULIO_USER_ID}`)

  const wbPresupuesto = XLSX.readFile('../presupuesto_flor_y_julio.xlsx')
  const wbGastos = XLSX.readFile('../gastos_julio.xlsx')

  await cleanAll()
  await migrateBudget(wbPresupuesto)
  await migratePower(wbPresupuesto)
  await migrateGastos(wbGastos)

  console.log('\n✅ Migration complete!')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
