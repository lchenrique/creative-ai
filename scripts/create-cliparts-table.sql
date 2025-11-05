-- Criar tabela de cliparts
CREATE TABLE IF NOT EXISTS public.cliparts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  path TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_cliparts_category ON public.cliparts(category);
CREATE INDEX IF NOT EXISTS idx_cliparts_name ON public.cliparts(name);
CREATE INDEX IF NOT EXISTS idx_cliparts_path ON public.cliparts(path);
CREATE INDEX IF NOT EXISTS idx_cliparts_keywords ON public.cliparts USING GIN(keywords);

-- RLS (Row Level Security) - permitir leitura pública
ALTER TABLE public.cliparts ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
DROP POLICY IF EXISTS "Allow public read access" ON public.cliparts;
CREATE POLICY "Allow public read access" 
  ON public.cliparts 
  FOR SELECT 
  USING (true);

-- Política para permitir insert/update apenas com service role
DROP POLICY IF EXISTS "Allow service role all access" ON public.cliparts;
CREATE POLICY "Allow service role all access"
  ON public.cliparts
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
