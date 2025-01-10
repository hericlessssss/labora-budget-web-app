/*
  # Criar tabela de clientes

  1. Nova Tabela
    - `clients`
      - `id` (uuid, chave primária)
      - `full_name` (texto, obrigatório)
      - `email` (texto, obrigatório, único)
      - `cpf` (texto, opcional, único)
      - `cnpj` (texto, opcional, único)
      - `phone` (texto, obrigatório)
      - `is_whatsapp` (booleano, padrão false)
      - `address` (jsonb, obrigatório)
        - street (texto)
        - number (texto)
        - complement (texto, opcional)
        - neighborhood (texto)
        - city (texto)
        - state (texto)
        - zip_code (texto)
      - `created_at` (timestamp com fuso horário, padrão now())
      - `user_id` (uuid, referência para auth.users)

  2. Segurança
    - Habilitar RLS na tabela clients
    - Adicionar políticas para:
      - Leitura: usuários autenticados podem ler seus próprios clientes
      - Inserção: usuários autenticados podem inserir seus próprios clientes
      - Atualização: usuários autenticados podem atualizar seus próprios clientes
*/

-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  cpf text UNIQUE CHECK (cpf ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$'),
  cnpj text UNIQUE CHECK (cnpj ~ '^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$'),
  phone text NOT NULL CHECK (phone ~ '^\(\d{2}\)\s\d{5}-\d{4}$'),
  is_whatsapp boolean DEFAULT false,
  address jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL,
  CONSTRAINT clients_document_check CHECK (
    (cpf IS NOT NULL AND cnpj IS NULL) OR
    (cpf IS NULL AND cnpj IS NOT NULL)
  )
);

-- Habilitar RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Users can read own clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);