/*
  # Adicionar sistema de categorias e serviços

  1. Novas Tabelas
    - `service_categories`: Categorias principais de serviços
      - `id` (uuid, primary key)
      - `name` (text, nome da categoria)
      - `description` (text, descrição opcional)
      - `created_at` (timestamp)
    
    - `services`: Serviços específicos
      - `id` (uuid, primary key)
      - `category_id` (uuid, referência à categoria)
      - `name` (text, nome do serviço)
      - `description` (text, descrição opcional)
      - `created_at` (timestamp)

  2. Alterações em Tabelas Existentes
    - Adiciona campos opcionais na tabela `quotes` para vincular a serviços

  3. Security
    - Habilita RLS em todas as tabelas
    - Adiciona políticas para leitura e escrita
*/

-- Criar tabela de categorias de serviços
CREATE TABLE IF NOT EXISTS service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de serviços
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES service_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Adicionar campos de serviço na tabela de orçamentos
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES service_categories(id),
ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES services(id);

-- Habilitar RLS
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias de serviços
CREATE POLICY "Todos podem ler categorias"
  ON service_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Apenas administradores podem modificar categorias"
  ON service_categories FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- Políticas para serviços
CREATE POLICY "Todos podem ler serviços"
  ON services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Apenas administradores podem modificar serviços"
  ON services FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- Inserir categorias e serviços iniciais
INSERT INTO service_categories (name, description) VALUES
  ('Desenvolvimento de Sites', 'Criação e desenvolvimento de websites'),
  ('Manutenção de Sites', 'Serviços de manutenção e atualização de sites'),
  ('Hospedagem e Suporte Técnico Web', 'Serviços de hospedagem e suporte técnico'),
  ('Design UX/UI', 'Serviços de design de interface e experiência do usuário'),
  ('SEO e Marketing Digital', 'Serviços de otimização e marketing digital'),
  ('Integrações e Automatizações', 'Serviços de integração e automação de sistemas'),
  ('Consultoria em Tecnologia', 'Serviços de consultoria técnica'),
  ('Desenvolvimento de Ferramentas Personalizadas', 'Desenvolvimento de sistemas sob medida'),
  ('Suporte Técnico a Computadores e Notebooks', 'Serviços de manutenção e suporte técnico')
ON CONFLICT DO NOTHING;

-- Inserir serviços para cada categoria
WITH categories AS (
  SELECT * FROM service_categories
)
INSERT INTO services (category_id, name, description)
SELECT
  id as category_id,
  unnest(CASE
    WHEN name = 'Desenvolvimento de Sites' THEN
      ARRAY['Site Institucional', 'E-commerce', 'Landing Page', 'Blog', 'Sistema Web Personalizado']
    WHEN name = 'Manutenção de Sites' THEN
      ARRAY['Atualização de Conteúdo', 'Correção de Erros/Tickets', 'Otimização de Velocidade', 'Ajustes de Design']
    WHEN name = 'Hospedagem e Suporte Técnico Web' THEN
      ARRAY['Configuração de Servidores', 'Suporte Mensal', 'Monitoramento e Segurança']
    WHEN name = 'Design UX/UI' THEN
      ARRAY['Design de Interfaces para Web e Mobile', 'Prototipação com Figma ou Adobe XD', 'Redesign de Sites Existentes']
    WHEN name = 'SEO e Marketing Digital' THEN
      ARRAY['Otimização para Motores de Busca (SEO)', 'Criação de Estratégias para Google Ads', 'Gerenciamento de Redes Sociais', 'Consultoria em Marketing Digital']
    WHEN name = 'Integrações e Automatizações' THEN
      ARRAY['Integração de APIs', 'Automação de Processos', 'Configuração de Ferramentas como Supabase ou Firebase']
    WHEN name = 'Consultoria em Tecnologia' THEN
      ARRAY['Avaliação de Necessidades Técnicas', 'Sugestões de Ferramentas e Soluções', 'Treinamentos para Equipes']
    WHEN name = 'Desenvolvimento de Ferramentas Personalizadas' THEN
      ARRAY['Ferramenta de Gestão de Orçamentos', 'Sistema de CRM Personalizado', 'Dashboards de Controle Financeiro']
    WHEN name = 'Suporte Técnico a Computadores e Notebooks' THEN
      ARRAY['Formatação e Reinstalação de Sistema Operacional', 'Instalação de Softwares e Drivers', 'Manutenção Preventiva e Corretiva', 'Upgrades de Hardware', 'Remoção de Vírus e Malware', 'Recuperação de Dados', 'Suporte Remoto', 'Montagem e Configuração de Computadores']
  END) as name
FROM categories
ON CONFLICT DO NOTHING;