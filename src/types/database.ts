export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  birth_date: string | null;
  gender: string | null;
  phone: string | null;
  cedula: string | null;
  full_name: string | null;
  role: 'user' | 'admin';
  is_winner: boolean;
  group_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  max_members: number;
  is_active: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number; // numeric(10,2) in DB, but number in TS is fine
  payment_method: 'pago_movil' | 'binance' | 'zelle' | 'other' | null;
  proof_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  week_number: number | null;
  notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

// Database schema types for Supabase
export interface PaymentWeek {
  id: string;
  week_number: number;
  due_date: string;
  is_active: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Omit<Profile, 'id'>;
        Relationships: [];
      };
      groups: {
        Row: Group;
        Insert: Omit<Group, 'id' | 'created_at'>;
        Update: Omit<Group, 'id'>;
        Relationships: [];
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, 'id' | 'created_at' | 'status' | 'amount'>;
        Update: Omit<Payment, 'id' | 'status' | 'amount'>;
        Relationships: [];
      };
      payment_weeks: {
        Row: PaymentWeek;
        Insert: Omit<PaymentWeek, 'id' | 'created_at'>;
        Update: Omit<PaymentWeek, 'id'>;
        Relationships: [];
      };
    };
    Views: { [key: string]: never };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      current_week_number: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: { [key: string]: never };
  };
}

export type Database = Database;