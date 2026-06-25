import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Property = {
  id: string;
  address: string;
  city: string;
  landlord_name: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
  avg_rating?: number;
  review_count?: number;
};

export type Review = {
  id: string;
  property_id: string;
  rating: number;
  rating_maintenance: number;
  rating_communication: number;
  rating_neighbors: number;
  rating_value: number;
  text: string | null;
  helpful_count: number;
  is_anonymous: boolean;
  created_at: string;
  tags?: string[];
  photos?: string[];
};
