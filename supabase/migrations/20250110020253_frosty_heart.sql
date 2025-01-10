/*
  # Corrigir políticas RLS e adicionar trigger para user_id

  1. Alterações
    - Remover políticas existentes
    - Criar trigger para definir user_id automaticamente
    - Adicionar novas políticas RLS
  
  2. Segurança
    - Garantir que user_id seja sempre definido
    - Permitir leitura para usuários autenticados
    - Restringir inserção e atualização aos próprios registros
*/

-- Remover políticas existentes
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON clients;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON clients;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON clients;

-- Criar função para definir user_id automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_client()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Criar trigger para definir user_id automaticamente
DROP TRIGGER IF EXISTS set_client_user_id ON clients;
CREATE TRIGGER set_client_user_id
  BEFORE INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_client();

-- Criar novas políticas
CREATE POLICY "Enable read for authenticated users"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for own clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);