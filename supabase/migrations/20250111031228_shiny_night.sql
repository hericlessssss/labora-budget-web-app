/*
  # Adicionar justificativa para orçamentos rejeitados

  1. Alterações
    - Adiciona coluna `rejection_reason` na tabela `quotes`
    - A coluna é opcional e armazena o motivo da rejeição do orçamento
*/

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS rejection_reason text;