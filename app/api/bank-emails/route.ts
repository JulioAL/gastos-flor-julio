import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

// TODO: set JULIO_USER_ID in Vercel env vars (copy from Supabase → Authentication → Users)
const JULIO_USER_ID = process.env.JULIO_USER_ID

type BankEmailPayload = {
  bank: string
  source: string
  amount: number
  merchant: string
  card_type: string
  card_last4: string | null
  date: string
  operation_number: string | null
  gmail_message_id: string
}

function getServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const secret = process.env.BANK_EMAIL_SECRET

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!JULIO_USER_ID) {
    return NextResponse.json({ error: 'JULIO_USER_ID not configured' }, { status: 500 })
  }

  const payload: BankEmailPayload = await request.json()
  const { bank, source, amount, merchant, card_type, date, operation_number, gmail_message_id } = payload

  const supabase = getServiceClient()

  // Deduplicate by Gmail message ID
  const { data: existing } = await supabase
    .from('bank_email_log')
    .select('id')
    .eq('gmail_message_id', gmail_message_id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ status: 'duplicate' })
  }

  const expenseDate = new Date(date)
  const year = expenseDate.getFullYear()

  // Store as hogar-pending so the user can assign the account later from gastos
  const { error: insertError } = await supabase.from('personal_expenses').insert({
    user_id: JULIO_USER_ID,
    date: expenseDate.toISOString().split('T')[0],
    description: merchant,
    tab_name: `hp|${amount}`,
    account_type: card_type === 'Crédito' ? 'credito' : 'debito',
    source,
    year,
  })

  if (insertError) {
    await supabase.from('bank_email_log').insert({
      gmail_message_id,
      bank,
      amount,
      merchant,
      operation_number: operation_number ?? undefined,
      status: 'error',
      error_message: insertError.message,
    })
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  await supabase.from('bank_email_log').insert({
    gmail_message_id,
    bank,
    amount,
    merchant,
    operation_number: operation_number ?? undefined,
    status: 'ok',
  })

  return NextResponse.json({ status: 'created' })
}
