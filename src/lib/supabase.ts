import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sunucu tarafı (admin) client - sadece API route'larda kullan
export function createServerClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
  return createClient(supabaseUrl, serviceKey);
}

// Supabase SQL şeması (Supabase dashboard'da çalıştır)
export const SUPABASE_SCHEMA = `
-- Maçlar tablosu
CREATE TABLE IF NOT EXISTS matches (
  id BIGINT PRIMARY KEY,
  home_team_id INTEGER NOT NULL,
  home_team_name TEXT NOT NULL,
  home_team_crest TEXT,
  away_team_id INTEGER NOT NULL,
  away_team_name TEXT NOT NULL,
  away_team_crest TEXT,
  competition_name TEXT NOT NULL,
  competition_code TEXT NOT NULL,
  kickoff TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'SCHEDULED',
  score_home INTEGER,
  score_away INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analizler tablosu
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id BIGINT REFERENCES matches(id),
  over25_pct INTEGER NOT NULL,
  btts_pct INTEGER NOT NULL,
  hy05_pct INTEGER NOT NULL,
  winner_prediction TEXT NOT NULL,
  winner_team_name TEXT NOT NULL,
  confidence TEXT NOT NULL,
  confidence_level INTEGER NOT NULL,
  home_goal_avg DECIMAL(3,1),
  away_goal_avg DECIMAL(3,1),
  home_form TEXT,
  away_form TEXT,
  home_goal_trend JSONB,
  away_goal_trend JSONB,
  value_bet JSONB,
  analysis_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sonuçlar tablosu
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES analyses(id),
  match_id BIGINT REFERENCES matches(id),
  score_home INTEGER NOT NULL,
  score_away INTEGER NOT NULL,
  over25_hit BOOLEAN NOT NULL,
  btts_hit BOOLEAN NOT NULL,
  hy05_hit BOOLEAN NOT NULL,
  winner_hit BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kullanıcılar tablosu (NextAuth ile entegre)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  role TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gerekli indexler
CREATE INDEX IF NOT EXISTS idx_matches_kickoff ON matches(kickoff);
CREATE INDEX IF NOT EXISTS idx_analyses_match_id ON analyses(match_id);
CREATE INDEX IF NOT EXISTS idx_results_analysis_id ON results(analysis_id);
`;
