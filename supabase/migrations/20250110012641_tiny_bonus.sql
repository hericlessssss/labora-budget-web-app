/*
  # Sistema de Orçamentos - Esquema Inicial

  1. Estruturas
    - Sequência para números de orçamentos
    - Tabela de orçamentos com todos os campos necessários
  
  2. Segurança
    - RLS habilitado na tabela de orçamentos
    - Políticas para leitura, inserção e atualização
*/

-- Criar sequência para números de orçamentos
CREATE SEQUENCE IF NOT EXISTS quote_number_seq;

-- Criar tabela de orçamentos
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number bigint DEFAULT nextval('quote_number_seq'),
  client_name text NOT NULL,
  client_document text NOT NULL,
  service_description text NOT NULL,
  observations text,
  value numeric(10,2) NOT NULL,
  payment_method text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

-- Habilitar RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Users can read own quotes"
  ON quotes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quotes"
  ON quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotes"
  ON quotes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);