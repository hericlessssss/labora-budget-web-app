/*
  # Ajustar validação de documentos de cliente

  1. Alterações
    - Remover restrições antigas de CPF e CNPJ
    - Adicionar novas restrições mais flexíveis
    - Manter validação de formato apenas quando preenchidos
  
  2. Segurança
    - Manter integridade dos dados com validação de formato
    - Permitir documentos opcionais
*/

-- Remover restrições antigas
ALTER TABLE clients 
  DROP CONSTRAINT IF EXISTS clients_cpf_check,
  DROP CONSTRAINT IF EXISTS clients_cnpj_check,
  DROP CONSTRAINT IF EXISTS clients_document_check;

-- Adicionar novas restrições
ALTER TABLE clients
  ADD CONSTRAINT clients_cpf_check 
    CHECK (cpf IS NULL OR cpf ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$'),
  ADD CONSTRAINT clients_cnpj_check 
    CHECK (cnpj IS NULL OR cnpj ~ '^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$'),
  ADD CONSTRAINT clients_document_check 
    CHECK (
      (cpf IS NOT NULL AND cnpj IS NULL) OR
      (cpf IS NULL AND cnpj IS NOT NULL) OR
      (cpf IS NULL AND cnpj IS NULL)
    );