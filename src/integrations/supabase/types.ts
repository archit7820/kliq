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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity: string
          caption: string | null
          carbon_footprint_kg: number
          category: string | null
          created_at: string
          emoji: string | null
          explanation: string | null
          id: string
          image_url: string | null
          user_id: string
        }
        Insert: {
          activity: string
          caption?: string | null
          carbon_footprint_kg: number
          category?: string | null
          created_at?: string
          emoji?: string | null
          explanation?: string | null
          id?: string
          image_url?: string | null
          user_id: string
        }
        Update: {
          activity?: string
          caption?: string | null
          carbon_footprint_kg?: number
          category?: string | null
          created_at?: string
          emoji?: string | null
          explanation?: string | null
          id?: string
          image_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          created_at: string | null
          criteria: Json | null
          description: string | null
          icon_url: string | null
          id: string
          is_og_badge: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_og_badge?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_og_badge?: boolean | null
          name?: string
        }
        Relationships: []
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          completed_at: string | null
          id: string
          is_completed: boolean | null
          joined_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          joined_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          audience_scope: string
          community_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_at: string | null
          id: string
          is_active: boolean | null
          reward_kelp_points: number | null
          start_at: string | null
          title: string
        }
        Insert: {
          audience_scope?: string
          community_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_at?: string | null
          id?: string
          is_active?: boolean | null
          reward_kelp_points?: number | null
          start_at?: string | null
          title: string
        }
        Update: {
          audience_scope?: string
          community_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_at?: string | null
          id?: string
          is_active?: boolean | null
          reward_kelp_points?: number | null
          start_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          activity_id: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_id: string
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          admin_permissions: Json | null
          category: string | null
          country_code: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          invite_code: string | null
          is_official: boolean | null
          max_members: number | null
          member_permissions: Json | null
          name: string
          privacy_type: string
          scope: Database["public"]["Enums"]["community_scope"]
        }
        Insert: {
          admin_permissions?: Json | null
          category?: string | null
          country_code?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          invite_code?: string | null
          is_official?: boolean | null
          max_members?: number | null
          member_permissions?: Json | null
          name: string
          privacy_type?: string
          scope?: Database["public"]["Enums"]["community_scope"]
        }
        Update: {
          admin_permissions?: Json | null
          category?: string | null
          country_code?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          invite_code?: string | null
          is_official?: boolean | null
          max_members?: number | null
          member_permissions?: Json | null
          name?: string
          privacy_type?: string
          scope?: Database["public"]["Enums"]["community_scope"]
        }
        Relationships: [
          {
            foreignKeyName: "communities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_activities: {
        Row: {
          activity_id: string
          community_id: string
          id: string
          posted_at: string
        }
        Insert: {
          activity_id: string
          community_id: string
          id?: string
          posted_at?: string
        }
        Update: {
          activity_id?: string
          community_id?: string
          id?: string
          posted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_activities_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_activities_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_challenge_participants: {
        Row: {
          challenge_id: string
          completed_at: string | null
          id: string
          is_completed: boolean | null
          joined_at: string | null
          progress: Json | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          joined_at?: string | null
          progress?: Json | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          joined_at?: string | null
          progress?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "community_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      community_challenges: {
        Row: {
          challenge_type: string | null
          community_id: string
          created_at: string | null
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          max_participants: number | null
          reward_points: number | null
          start_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          challenge_type?: string | null
          community_id: string
          created_at?: string | null
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          reward_points?: number | null
          start_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          challenge_type?: string | null
          community_id?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          reward_points?: number | null
          start_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_challenges_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_memberships: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          status: string
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          status?: string
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_memberships_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_messages: {
        Row: {
          community_id: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          community_id: string
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          community_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_messages_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      eco_insights: {
        Row: {
          created_at: string
          id: string
          insight: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          insight: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          insight?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eco_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_requests: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_requests_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friends: {
        Row: {
          created_at: string
          id: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friends_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kelp_achievements: {
        Row: {
          category: string
          created_at: string
          criteria: Json
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          points_reward: number
          rarity: string
        }
        Insert: {
          category?: string
          created_at?: string
          criteria: Json
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          points_reward?: number
          rarity?: string
        }
        Update: {
          category?: string
          created_at?: string
          criteria?: Json
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          points_reward?: number
          rarity?: string
        }
        Relationships: []
      }
      kelp_daily_bonuses: {
        Row: {
          claimed_at: string
          date: string
          id: string
          points_earned: number
          streak_day: number
          user_id: string
        }
        Insert: {
          claimed_at?: string
          date?: string
          id?: string
          points_earned: number
          streak_day?: number
          user_id: string
        }
        Update: {
          claimed_at?: string
          date?: string
          id?: string
          points_earned?: number
          streak_day?: number
          user_id?: string
        }
        Relationships: []
      }
      kelp_purchases: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          points_spent: number
          redeemed_at: string | null
          redemption_code: string | null
          reward_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          points_spent: number
          redeemed_at?: string | null
          redemption_code?: string | null
          reward_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          points_spent?: number
          redeemed_at?: string | null
          redemption_code?: string | null
          reward_id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      kelp_rewards: {
        Row: {
          category: string
          cost_points: number
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          image_url: string | null
          is_active: boolean
          metadata: Json | null
          name: string
          stock_limit: number | null
          stock_remaining: number | null
        }
        Insert: {
          category?: string
          cost_points: number
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          metadata?: Json | null
          name: string
          stock_limit?: number | null
          stock_remaining?: number | null
        }
        Update: {
          category?: string
          cost_points?: number
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          metadata?: Json | null
          name?: string
          stock_limit?: number | null
          stock_remaining?: number | null
        }
        Relationships: []
      }
      kelp_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          metadata: Json | null
          source: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          source: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          source?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      milestones: {
        Row: {
          created_at: string | null
          description: string | null
          icon_url: string | null
          id: string
          metric: string
          name: string
          threshold: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          metric: string
          name: string
          threshold: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          metric?: string
          name?: string
          threshold?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          co2e_weekly_goal: number | null
          co2e_weekly_progress: number | null
          created_at: string
          full_name: string | null
          id: string
          invite_code: string | null
          invited_by_code: string | null
          invited_by_user_id: string | null
          is_og_user: boolean | null
          kelp_points: number | null
          lifestyle_tags: string[] | null
          location: string | null
          referral_code: string | null
          streak_count: number | null
          streak_last_logged: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          co2e_weekly_goal?: number | null
          co2e_weekly_progress?: number | null
          created_at?: string
          full_name?: string | null
          id: string
          invite_code?: string | null
          invited_by_code?: string | null
          invited_by_user_id?: string | null
          is_og_user?: boolean | null
          kelp_points?: number | null
          lifestyle_tags?: string[] | null
          location?: string | null
          referral_code?: string | null
          streak_count?: number | null
          streak_last_logged?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          co2e_weekly_goal?: number | null
          co2e_weekly_progress?: number | null
          created_at?: string
          full_name?: string | null
          id?: string
          invite_code?: string | null
          invited_by_code?: string | null
          invited_by_user_id?: string | null
          is_og_user?: boolean | null
          kelp_points?: number | null
          lifestyle_tags?: string[] | null
          location?: string | null
          referral_code?: string | null
          streak_count?: number | null
          streak_last_logged?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_invited_by_user_id_fkey"
            columns: ["invited_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          awarded_at: string | null
          badge_id: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string | null
          badge_id: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string | null
          badge_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_kelp_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_milestones: {
        Row: {
          achieved_at: string | null
          id: string
          milestone_id: string
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          id?: string
          milestone_id: string
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          id?: string
          milestone_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_milestones_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_milestones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_kelp_points: {
        Args: {
          p_amount: number
          p_description: string
          p_metadata?: Json
          p_source: string
          p_transaction_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      claim_daily_bonus: {
        Args: { p_user_id: string }
        Returns: Json
      }
      generate_invite_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_leaderboard_profiles: {
        Args: { limit_count?: number }
        Returns: {
          avatar_url: string
          id: string
          kelp_points: number
          username: string
        }[]
      }
      get_user_conversations: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          full_name: string
          last_message_at: string
          last_message_content: string
          other_user_id: string
          unread_count: number
          username: string
        }[]
      }
      is_valid_invite_code: {
        Args: { code: string }
        Returns: boolean
      }
      spend_kelp_points: {
        Args: {
          p_amount: number
          p_description: string
          p_metadata?: Json
          p_source: string
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      community_scope: "local" | "national" | "global"
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
      community_scope: ["local", "national", "global"],
    },
  },
} as const
