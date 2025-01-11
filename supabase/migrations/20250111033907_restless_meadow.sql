/*
  # Fix service categories and services schema

  1. Changes
    - Drop existing tables and recreate with bigint IDs
    - Add foreign key references to quotes table
    - Reinsert all data with proper ID types

  2. Security
    - Maintain existing RLS policies
    - Ensure all tables have RLS enabled
*/

-- Drop existing foreign key constraints
ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_category_id_fkey;
ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_service_id_fkey;
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_category_id_fkey;

-- Drop existing tables
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS service_categories;

-- Drop sequences if they exist
DROP SEQUENCE IF EXISTS service_categories_id_seq;
DROP SEQUENCE IF EXISTS services_id_seq;

-- Create sequences
CREATE SEQUENCE service_categories_id_seq;
CREATE SEQUENCE services_id_seq;

-- Create service_categories table with bigint ID
CREATE TABLE service_categories (
  id bigint PRIMARY KEY DEFAULT nextval('service_categories_id_seq'),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create services table with bigint ID
CREATE TABLE services (
  id bigint PRIMARY KEY DEFAULT nextval('services_id_seq'),
  category_id bigint REFERENCES service_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  default_description text,
  base_value numeric(10,2),
  created_at timestamptz DEFAULT now()
);

-- Modify quotes table to use bigint for category_id and service_id
ALTER TABLE quotes
  DROP COLUMN IF EXISTS category_id,
  DROP COLUMN IF EXISTS service_id;

ALTER TABLE quotes
  ADD COLUMN category_id bigint REFERENCES service_categories(id),
  ADD COLUMN service_id bigint REFERENCES services(id);

-- Enable RLS
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Insert categories
INSERT INTO service_categories (name, description) VALUES
  ('Desenvolvimento de Sites', 'Criação e desenvolvimento de websites'),
  ('Manutenção de Sites', 'Serviços de manutenção e atualização de sites'),
  ('Hospedagem e Suporte Técnico Web', 'Serviços de hospedagem e suporte técnico'),
  ('Design UX/UI', 'Serviços de design de interface e experiência do usuário'),
  ('SEO e Marketing Digital', 'Serviços de otimização e marketing digital'),
  ('Integrações e Automatizações', 'Serviços de integração e automação de sistemas'),
  ('Consultoria em Tecnologia', 'Serviços de consultoria técnica'),
  ('Desenvolvimento de Ferramentas Personalizadas', 'Desenvolvimento de sistemas sob medida'),
  ('Suporte Técnico a Computadores e Notebooks', 'Serviços de manutenção e suporte técnico');

-- Insert services
INSERT INTO services (category_id, name, description, default_description, base_value)
SELECT 
  c.id as category_id,
  s.name,
  s.description,
  s.default_description,
  s.base_value
FROM (
  -- Desenvolvimento de Sites
  SELECT 'Desenvolvimento de Sites' as category, 'Site Institucional' as name, 
         'Desenvolvimento de site institucional profissional' as description,
         'Desenvolvimento de site institucional responsivo com até 5 páginas, incluindo Home, Sobre, Serviços, Blog e Contato. Inclui formulário de contato e integração com redes sociais.' as default_description,
         3500.00 as base_value
  UNION ALL
  SELECT 'Desenvolvimento de Sites', 'E-commerce', 'Desenvolvimento de loja virtual',
         'Desenvolvimento de e-commerce completo com catálogo de produtos, carrinho de compras, gestão de estoque e integrações com meios de pagamento.',
         8000.00
  UNION ALL
  SELECT 'Desenvolvimento de Sites', 'Landing Page', 'Criação de página de conversão',
         'Desenvolvimento de landing page otimizada para conversão, com formulário de captura de leads e integração com ferramentas de marketing.',
         1500.00
  UNION ALL
  SELECT 'Desenvolvimento de Sites', 'Blog', 'Desenvolvimento de blog profissional',
         'Criação de blog com sistema de gerenciamento de conteúdo, categorias, tags e sistema de comentários.',
         2500.00
  UNION ALL
  SELECT 'Desenvolvimento de Sites', 'Sistema Web Personalizado', 'Desenvolvimento de sistema web sob medida',
         'Desenvolvimento de sistema web personalizado de acordo com as necessidades específicas do cliente.',
         10000.00

  -- Manutenção de Sites
  UNION ALL
  SELECT 'Manutenção de Sites', 'Atualização de Conteúdo', 'Serviço de atualização de conteúdo',
         'Atualização periódica de conteúdo do site, incluindo textos, imagens e produtos.',
         200.00
  UNION ALL
  SELECT 'Manutenção de Sites', 'Correção de Erros/Tickets', 'Correção de problemas técnicos',
         'Análise e correção de erros técnicos, bugs e problemas de funcionamento.',
         150.00
  UNION ALL
  SELECT 'Manutenção de Sites', 'Otimização de Velocidade', 'Melhorias de performance',
         'Otimização de performance do site, incluindo tempo de carregamento e otimização de recursos.',
         500.00
  UNION ALL
  SELECT 'Manutenção de Sites', 'Ajustes de Design', 'Modificações no layout',
         'Ajustes e modificações no design e layout do site conforme necessidade.',
         300.00

  -- Hospedagem e Suporte Técnico Web
  UNION ALL
  SELECT 'Hospedagem e Suporte Técnico Web', 'Configuração de Servidores', 'Configuração e otimização de servidores',
         'Configuração e otimização de servidores web, incluindo segurança e backup.',
         800.00
  UNION ALL
  SELECT 'Hospedagem e Suporte Técnico Web', 'Suporte Mensal', 'Plano de suporte técnico mensal',
         'Suporte técnico mensal para manutenção e monitoramento do site.',
         400.00
  UNION ALL
  SELECT 'Hospedagem e Suporte Técnico Web', 'Monitoramento e Segurança', 'Serviços de monitoramento e segurança',
         'Monitoramento 24/7 e implementação de medidas de segurança.',
         600.00

  -- Design UX/UI
  UNION ALL
  SELECT 'Design UX/UI', 'Design de Interfaces', 'Design de interfaces para web e mobile',
         'Criação de interfaces modernas e intuitivas para web e aplicativos mobile.',
         4000.00
  UNION ALL
  SELECT 'Design UX/UI', 'Prototipação', 'Prototipação com Figma ou Adobe XD',
         'Criação de protótipos interativos para validação de interface e experiência.',
         2500.00
  UNION ALL
  SELECT 'Design UX/UI', 'Redesign', 'Redesign de sites existentes',
         'Reformulação completa do design de sites existentes.',
         3500.00

  -- SEO e Marketing Digital
  UNION ALL
  SELECT 'SEO e Marketing Digital', 'Otimização SEO', 'Otimização para motores de busca',
         'Otimização completa do site para melhor posicionamento nos buscadores.',
         1200.00
  UNION ALL
  SELECT 'SEO e Marketing Digital', 'Google Ads', 'Gestão de campanhas Google Ads',
         'Criação e gestão de campanhas de anúncios no Google Ads.',
         800.00
  UNION ALL
  SELECT 'SEO e Marketing Digital', 'Gestão de Redes Sociais', 'Gerenciamento de mídias sociais',
         'Gestão completa de perfis em redes sociais e criação de conteúdo.',
         1500.00

  -- Integrações e Automatizações
  UNION ALL
  SELECT 'Integrações e Automatizações', 'Integração de APIs', 'Desenvolvimento de integrações',
         'Desenvolvimento de integrações entre sistemas via API.',
         2000.00
  UNION ALL
  SELECT 'Integrações e Automatizações', 'Automação de Processos', 'Automação de processos com Zapier',
         'Criação de automações de processos utilizando ferramentas como Zapier.',
         1500.00
  UNION ALL
  SELECT 'Integrações e Automatizações', 'Configuração de Ferramentas', 'Configuração de ferramentas cloud',
         'Configuração e integração de ferramentas como Supabase ou Firebase.',
         1800.00

  -- Consultoria em Tecnologia
  UNION ALL
  SELECT 'Consultoria em Tecnologia', 'Avaliação Técnica', 'Avaliação de necessidades técnicas',
         'Análise completa da infraestrutura e necessidades tecnológicas da empresa.',
         1500.00
  UNION ALL
  SELECT 'Consultoria em Tecnologia', 'Planejamento Estratégico', 'Planejamento de soluções tecnológicas',
         'Desenvolvimento de plano estratégico para implementação de soluções tecnológicas.',
         2000.00

  -- Desenvolvimento de Ferramentas Personalizadas
  UNION ALL
  SELECT 'Desenvolvimento de Ferramentas Personalizadas', 'Sistema de Gestão', 'Sistema personalizado de gestão',
         'Desenvolvimento de sistema de gestão personalizado para necessidades específicas.',
         15000.00
  UNION ALL
  SELECT 'Desenvolvimento de Ferramentas Personalizadas', 'Automação de Processos', 'Automação de processos específicos',
         'Desenvolvimento de ferramentas para automatização de processos específicos.',
         8000.00

  -- Suporte Técnico
  UNION ALL
  SELECT 'Suporte Técnico a Computadores e Notebooks', 'Formatação', 'Formatação e reinstalação do sistema',
         'Formatação completa do computador com backup e reinstalação do sistema operacional.',
         200.00
  UNION ALL
  SELECT 'Suporte Técnico a Computadores e Notebooks', 'Instalação de Softwares', 'Instalação de programas e drivers',
         'Instalação de programas essenciais e atualização de drivers.',
         150.00
  UNION ALL
  SELECT 'Suporte Técnico a Computadores e Notebooks', 'Manutenção', 'Manutenção preventiva e corretiva',
         'Limpeza física, troca de pasta térmica e manutenção geral.',
         250.00
  UNION ALL
  SELECT 'Suporte Técnico a Computadores e Notebooks', 'Recuperação de Dados', 'Recuperação de arquivos',
         'Recuperação de arquivos deletados ou de discos danificados.',
         300.00
) s
JOIN service_categories c ON c.name = s.category;