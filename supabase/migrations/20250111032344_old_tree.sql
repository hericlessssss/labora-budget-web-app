/*
  # Adicionar campos de descrição padrão e valor base para serviços

  1. Alterações em Tabelas Existentes
    - Adiciona campos de descrição padrão e valor base na tabela `services`

  2. Security
    - Mantém as políticas existentes
*/

-- Adicionar campos de descrição padrão e valor base
ALTER TABLE services
ADD COLUMN IF NOT EXISTS default_description text,
ADD COLUMN IF NOT EXISTS base_value numeric(10,2);