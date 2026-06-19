export type Database = {
  public: {
    Tables: {
      care_entries: {
        Row: {
          amount: string | null
          baby_id: string
          completed: boolean
          created_at: string
          created_by: string
          id: string
          kind: 'weight' | 'feeding' | 'medication' | 'milestone'
          method: string | null
          notes: string | null
          occurred_at: string
          title: string
        }
        Insert: {
          amount?: string | null
          baby_id: string
          completed?: boolean
          created_at?: string
          created_by?: string
          id?: string
          kind: 'weight' | 'feeding' | 'medication' | 'milestone'
          method?: string | null
          notes?: string | null
          occurred_at: string
          title: string
        }
        Update: Partial<Database['public']['Tables']['care_entries']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      bootstrap_family: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
