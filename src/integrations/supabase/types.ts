export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      monsters: {
        Row: {
          created_at: string
          creator_id: string | null
          creator_wallet: string | null
          description: string | null
          evolution_stage: number | null
          holders: number | null
          hp: number
          id: string
          image_url: string | null
          market_cap: number | null
          mint_address: string | null
          moves: Json | null
          name: string
          price_change_24h: number | null
          pump_url: string | null
          rarity: Database["public"]["Enums"]["monster_rarity"]
          ticker: string
          twitter_link: string | null
          type: Database["public"]["Enums"]["monster_type"]
          updated_at: string
          volume_24h: number | null
        }
        Insert: {
          created_at?: string
          creator_id?: string | null
          creator_wallet?: string | null
          description?: string | null
          evolution_stage?: number | null
          holders?: number | null
          hp?: number
          id?: string
          image_url?: string | null
          market_cap?: number | null
          mint_address?: string | null
          moves?: Json | null
          name: string
          price_change_24h?: number | null
          pump_url?: string | null
          rarity?: Database["public"]["Enums"]["monster_rarity"]
          ticker: string
          twitter_link?: string | null
          type?: Database["public"]["Enums"]["monster_type"]
          updated_at?: string
          volume_24h?: number | null
        }
        Update: {
          created_at?: string
          creator_id?: string | null
          creator_wallet?: string | null
          description?: string | null
          evolution_stage?: number | null
          holders?: number | null
          hp?: number
          id?: string
          image_url?: string | null
          market_cap?: number | null
          mint_address?: string | null
          moves?: Json | null
          name?: string
          price_change_24h?: number | null
          pump_url?: string | null
          rarity?: Database["public"]["Enums"]["monster_rarity"]
          ticker?: string
          twitter_link?: string | null
          type?: Database["public"]["Enums"]["monster_type"]
          updated_at?: string
          volume_24h?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          total_launches: number | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          total_launches?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          total_launches?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          base_moves: Json | null
          created_at: string
          hp: number
          id: string
          image_url: string | null
          name: string
          rarity: Database["public"]["Enums"]["monster_rarity"]
          type: Database["public"]["Enums"]["monster_type"]
        }
        Insert: {
          base_moves?: Json | null
          created_at?: string
          hp?: number
          id?: string
          image_url?: string | null
          name: string
          rarity?: Database["public"]["Enums"]["monster_rarity"]
          type: Database["public"]["Enums"]["monster_type"]
        }
        Update: {
          base_moves?: Json | null
          created_at?: string
          hp?: number
          id?: string
          image_url?: string | null
          name?: string
          rarity?: Database["public"]["Enums"]["monster_rarity"]
          type?: Database["public"]["Enums"]["monster_type"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      monster_rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary"
      monster_type: "Fire" | "Water" | "Electric" | "Grass" | "Shadow" | "Meme"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      monster_rarity: ["Common", "Uncommon", "Rare", "Epic", "Legendary"],
      monster_type: ["Fire", "Water", "Electric", "Grass", "Shadow", "Meme"],
    },
  },
} as const
