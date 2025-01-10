/*
  # Adicionar relação entre orçamentos e clientes

  1. Alterações
    - Adiciona coluna `client_id` na tabela `quotes`
    - Cria chave estrangeira para a tabela `clients`
    - A coluna é opcional para permitir orçamentos sem cliente cadastrado
*/

-- Adicionar coluna client_id
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id);

-- Atualizar políticas existentes para incluir acesso via client_id
DROP POLICY IF EXISTS "Users can read own quotes" ON quotes;
CREATE POLICY "Users can read own quotes"
  ON quotes
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own quotes" ON quotes;
CREATE POLICY "Users can update own quotes"
  ON quotes
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id OR
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );