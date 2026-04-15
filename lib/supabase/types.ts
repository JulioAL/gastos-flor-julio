export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          personal_sheet_configured: boolean
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          personal_sheet_configured?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          personal_sheet_configured?: boolean
        }
      }
      budget_months: {
        Row: {
          id: string
          year: number
          month: number
          tab_name: string
          created_at: string
        }
        Insert: {
          id?: string
          year: number
          month: number
          tab_name: string
          created_at?: string
        }
        Update: {
          year?: number
          month?: number
          tab_name?: string
        }
      }
      budget_income: {
        Row: {
          id: string
          budget_month_id: string
          source: string
          description: string | null
          amount: number | null
          included_in_budget: boolean
        }
        Insert: {
          id?: string
          budget_month_id: string
          source: string
          description?: string | null
          amount?: number | null
          included_in_budget?: boolean
        }
        Update: {
          source?: string
          description?: string | null
          amount?: number | null
          included_in_budget?: boolean
        }
      }
      budget_expenses: {
        Row: {
          id: string
          budget_month_id: string
          category: string
          amount: number | null
          responsible: string | null
          account: string | null
        }
        Insert: {
          id?: string
          budget_month_id: string
          category: string
          amount?: number | null
          responsible?: string | null
          account?: string | null
        }
        Update: {
          category?: string
          amount?: number | null
          responsible?: string | null
          account?: string | null
        }
      }
      budget_entertainment_detail: {
        Row: {
          id: string
          budget_month_id: string
          service: string
          description: string | null
          amount: number | null
        }
        Insert: {
          id?: string
          budget_month_id: string
          service: string
          description?: string | null
          amount?: number | null
        }
        Update: {
          service?: string
          description?: string | null
          amount?: number | null
        }
      }
      budget_transfers: {
        Row: {
          id: string
          budget_month_id: string
          concept: string | null
          account: string | null
          julio_amount: number | null
          flor_amount: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          budget_month_id: string
          concept?: string | null
          account?: string | null
          julio_amount?: number | null
          flor_amount?: number | null
          notes?: string | null
        }
        Update: {
          concept?: string | null
          account?: string | null
          julio_amount?: number | null
          flor_amount?: number | null
          notes?: string | null
        }
      }
      cortes: {
        Row: {
          id: string
          settled_date: string
          year: number
          month: number
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          settled_date?: string
          year: number
          month: number
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          settled_date?: string
          year?: number
          month?: number
          notes?: string | null
        }
      }
      corte_account_totals: {
        Row: {
          id: string
          corte_id: string
          account_key: string
          total_amount: number
        }
        Insert: {
          id?: string
          corte_id: string
          account_key: string
          total_amount: number
        }
        Update: {
          total_amount?: number
        }
      }
      personal_expenses: {
        Row: {
          id: string
          user_id: string
          date: string
          description: string
          casita: number | null
          flor_julio: number | null
          julio: number | null
          flor: number | null
          salidas: number | null
          power: number | null
          gasolina: number | null
          regalos: number | null
          navidad: number | null
          otros_power: number | null
          entretenimiento: number | null
          tab_name: string | null
          year: number
          corte_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          description: string
          casita?: number | null
          flor_julio?: number | null
          julio?: number | null
          flor?: number | null
          salidas?: number | null
          power?: number | null
          gasolina?: number | null
          regalos?: number | null
          navidad?: number | null
          otros_power?: number | null
          entretenimiento?: number | null
          tab_name?: string | null
          year?: number
          corte_id?: string | null
        }
        Update: {
          date?: string
          description?: string
          casita?: number | null
          flor_julio?: number | null
          julio?: number | null
          flor?: number | null
          salidas?: number | null
          power?: number | null
          gasolina?: number | null
          regalos?: number | null
          navidad?: number | null
          otros_power?: number | null
          entretenimiento?: number | null
          corte_id?: string | null
        }
      }
      power_account_entries: {
        Row: {
          id: string
          entry_year: number | null
          entry_month: string | null
          description: string | null
          carro: number | null
          ahorro_casa: number | null
          ahorro_extra: number | null
          sueldo: number | null
          cts: number | null
          intereses_ganados: number | null
          gratificaciones: number | null
          afp: number | null
          emergencia: number | null
          jf_baby: number | null
          bonos_utilidades: number | null
          salud: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          entry_year?: number | null
          entry_month?: string | null
          description?: string | null
          carro?: number | null
          ahorro_casa?: number | null
          ahorro_extra?: number | null
          sueldo?: number | null
          cts?: number | null
          intereses_ganados?: number | null
          gratificaciones?: number | null
          afp?: number | null
          emergencia?: number | null
          jf_baby?: number | null
          bonos_utilidades?: number | null
          salud?: number | null
          notes?: string | null
        }
        Update: {
          entry_year?: number | null
          entry_month?: string | null
          description?: string | null
          carro?: number | null
          ahorro_casa?: number | null
          ahorro_extra?: number | null
          sueldo?: number | null
          cts?: number | null
          intereses_ganados?: number | null
          gratificaciones?: number | null
          afp?: number | null
          emergencia?: number | null
          jf_baby?: number | null
          bonos_utilidades?: number | null
          salud?: number | null
          notes?: string | null
        }
      }
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type BudgetMonth = Database['public']['Tables']['budget_months']['Row']
export type BudgetIncome = Database['public']['Tables']['budget_income']['Row']
export type BudgetExpense = Database['public']['Tables']['budget_expenses']['Row']
export type BudgetEntertainmentDetail = Database['public']['Tables']['budget_entertainment_detail']['Row']
export type BudgetTransfer = Database['public']['Tables']['budget_transfers']['Row']
export type PersonalExpense = Database['public']['Tables']['personal_expenses']['Row']
export type PowerAccountEntry = Database['public']['Tables']['power_account_entries']['Row']
export type Corte = Database['public']['Tables']['cortes']['Row']
export type CorteAccountTotal = Database['public']['Tables']['corte_account_totals']['Row']
export type CorteWithTotals = Corte & { corte_account_totals: CorteAccountTotal[] }
