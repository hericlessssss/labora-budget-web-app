/*
  # Criar tabelas de serviços com IDs sequenciais

  1. Nova Estrutura
    - Tabelas:
      - service_categories: Categorias de serviços
      - services: Serviços específicos
    - Campos:
      - IDs sequenciais ao invés de UUIDs
      - Descrições e valores base para serviços
    - Segurança:
      - RLS habilitado
      - Políticas de acesso para leitura e modificação

  2. Dados Iniciais
    - Categorias principais de serviços
    - Serviços específicos com valores base
*/

-- Criar sequências para IDs
CREATE SEQUENCE IF NOT EXISTS service_categories_id_seq;
CREATE SEQUENCE IF NOT EXISTS services_id_seq;

-- Criar tabela de categorias de serviços
CREATE TABLE IF NOT EXISTS service_categories (
  id bigint PRIMARY KEY DEFAULT nextval('service_categories_id_seq'),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de serviços
CREATE TABLE IF NOT EXISTS services (
  id bigint PRIMARY KEY DEFAULT nextval('services_id_seq'),
  category_id bigint REFERENCES service_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  default_description text,
  base_value numeric(10,2),
  created_at timestamptz DEFAULT now()
);

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

-- Inserir categorias
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

-- Inserir serviços
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