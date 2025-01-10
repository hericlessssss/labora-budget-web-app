/*
  # Corrigir políticas RLS para tabela clients

  1. Alterações
    - Remover políticas existentes
    - Adicionar novas políticas mais permissivas para usuários autenticados
  
  2. Segurança
    - Permitir que usuários autenticados possam:
      - Inserir seus próprios registros
      - Ler registros que criaram
      - Atualizar seus próprios registros
*/

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can read own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;

-- Criar novas políticas
CREATE POLICY "Enable read access for authenticated users"
  ON clients
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);