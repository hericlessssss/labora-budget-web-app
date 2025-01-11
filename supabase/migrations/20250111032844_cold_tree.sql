/*
  # Corrigir UUIDs das tabelas de serviços

  1. Limpar dados existentes
  2. Inserir categorias com UUIDs válidos
  3. Inserir serviços com valores padrão
*/

-- Limpar dados existentes
TRUNCATE TABLE services CASCADE;
TRUNCATE TABLE service_categories CASCADE;

-- Inserir categorias com UUIDs válidos
INSERT INTO service_categories (id, name, description) VALUES
  ('1f3c5e7b-9a2d-4f8e-b6c4-8d7e9f0a1b3c', 'Desenvolvimento de Sites', 'Criação e desenvolvimento de websites'),
  ('2a4d6f8c-1b3e-4f8e-b6c4-8d7e9f0a1b3d', 'Manutenção de Sites', 'Serviços de manutenção e atualização de sites'),
  ('3b5e7g9i-2c4f-4f8e-b6c4-8d7e9f0a1b3e', 'Hospedagem e Suporte Técnico Web', 'Serviços de hospedagem e suporte técnico'),
  ('4c6h8j0l-3d5g-4f8e-b6c4-8d7e9f0a1b3f', 'Design UX/UI', 'Serviços de design de interface e experiência do usuário'),
  ('5d7i9k1m-4e6h-4f8e-b6c4-8d7e9f0a1b40', 'SEO e Marketing Digital', 'Serviços de otimização e marketing digital'),
  ('6e8j0l2n-5f7i-4f8e-b6c4-8d7e9f0a1b41', 'Integrações e Automatizações', 'Serviços de integração e automação de sistemas'),
  ('7f9k1m3o-6g8j-4f8e-b6c4-8d7e9f0a1b42', 'Consultoria em Tecnologia', 'Serviços de consultoria técnica'),
  ('8g0l2n4p-7h9k-4f8e-b6c4-8d7e9f0a1b43', 'Desenvolvimento de Ferramentas Personalizadas', 'Desenvolvimento de sistemas sob medida'),
  ('9h1m3o5q-8i0l-4f8e-b6c4-8d7e9f0a1b44', 'Suporte Técnico a Computadores e Notebooks', 'Serviços de manutenção e suporte técnico');

-- Inserir serviços
INSERT INTO services (category_id, name, description, default_description, base_value) VALUES
  -- Desenvolvimento de Sites
  ('1f3c5e7b-9a2d-4f8e-b6c4-8d7e9f0a1b3c', 'Site Institucional', 'Desenvolvimento de site institucional profissional', 'Desenvolvimento de site institucional responsivo com até 5 páginas, incluindo Home, Sobre, Serviços, Blog e Contato. Inclui formulário de contato e integração com redes sociais.', 3500.00),
  ('1f3c5e7b-9a2d-4f8e-b6c4-8d7e9f0a1b3c', 'E-commerce', 'Desenvolvimento de loja virtual', 'Desenvolvimento de e-commerce completo com catálogo de produtos, carrinho de compras, gestão de estoque e integrações com meios de pagamento.', 8000.00),
  ('1f3c5e7b-9a2d-4f8e-b6c4-8d7e9f0a1b3c', 'Landing Page', 'Criação de página de conversão', 'Desenvolvimento de landing page otimizada para conversão, com formulário de captura de leads e integração com ferramentas de marketing.', 1500.00),
  ('1f3c5e7b-9a2d-4f8e-b6c4-8d7e9f0a1b3c', 'Blog', 'Desenvolvimento de blog profissional', 'Criação de blog com sistema de gerenciamento de conteúdo, categorias, tags e sistema de comentários.', 2500.00),
  ('1f3c5e7b-9a2d-4f8e-b6c4-8d7e9f0a1b3c', 'Sistema Web Personalizado', 'Desenvolvimento de sistema web sob medida', 'Desenvolvimento de sistema web personalizado de acordo com as necessidades específicas do cliente.', 10000.00),

  -- Manutenção de Sites
  ('2a4d6f8c-1b3e-4f8e-b6c4-8d7e9f0a1b3d', 'Atualização de Conteúdo', 'Serviço de atualização de conteúdo', 'Atualização periódica de conteúdo do site, incluindo textos, imagens e produtos.', 200.00),
  ('2a4d6f8c-1b3e-4f8e-b6c4-8d7e9f0a1b3d', 'Correção de Erros/Tickets', 'Correção de problemas técnicos', 'Análise e correção de erros técnicos, bugs e problemas de funcionamento.', 150.00),
  ('2a4d6f8c-1b3e-4f8e-b6c4-8d7e9f0a1b3d', 'Otimização de Velocidade', 'Melhorias de performance', 'Otimização de performance do site, incluindo tempo de carregamento e otimização de recursos.', 500.00),
  ('2a4d6f8c-1b3e-4f8e-b6c4-8d7e9f0a1b3d', 'Ajustes de Design', 'Modificações no layout', 'Ajustes e modificações no design e layout do site conforme necessidade.', 300.00),

  -- Hospedagem e Suporte Técnico Web
  ('3b5e7g9i-2c4f-4f8e-b6c4-8d7e9f0a1b3e', 'Configuração de Servidores', 'Configuração e otimização de servidores', 'Configuração e otimização de servidores web, incluindo segurança e backup.', 800.00),
  ('3b5e7g9i-2c4f-4f8e-b6c4-8d7e9f0a1b3e', 'Suporte Mensal', 'Plano de suporte técnico mensal', 'Suporte técnico mensal para manutenção e monitoramento do site.', 400.00),
  ('3b5e7g9i-2c4f-4f8e-b6c4-8d7e9f0a1b3e', 'Monitoramento e Segurança', 'Serviços de monitoramento e segurança', 'Monitoramento 24/7 e implementação de medidas de segurança.', 600.00),

  -- Design UX/UI
  ('4c6h8j0l-3d5g-4f8e-b6c4-8d7e9f0a1b3f', 'Design de Interfaces', 'Design de interfaces para web e mobile', 'Criação de interfaces modernas e intuitivas para web e aplicativos mobile.', 4000.00),
  ('4c6h8j0l-3d5g-4f8e-b6c4-8d7e9f0a1b3f', 'Prototipação', 'Prototipação com Figma ou Adobe XD', 'Criação de protótipos interativos para validação de interface e experiência.', 2500.00),
  ('4c6h8j0l-3d5g-4f8e-b6c4-8d7e9f0a1b3f', 'Redesign', 'Redesign de sites existentes', 'Reformulação completa do design de sites existentes.', 3500.00),

  -- SEO e Marketing Digital
  ('5d7i9k1m-4e6h-4f8e-b6c4-8d7e9f0a1b40', 'Otimização SEO', 'Otimização para motores de busca', 'Otimização completa do site para melhor posicionamento nos buscadores.', 1200.00),
  ('5d7i9k1m-4e6h-4f8e-b6c4-8d7e9f0a1b40', 'Google Ads', 'Gestão de campanhas Google Ads', 'Criação e gestão de campanhas de anúncios no Google Ads.', 800.00),
  ('5d7i9k1m-4e6h-4f8e-b6c4-8d7e9f0a1b40', 'Gestão de Redes Sociais', 'Gerenciamento de mídias sociais', 'Gestão completa de perfis em redes sociais e criação de conteúdo.', 1500.00),

  -- Integrações e Automatizações
  ('6e8j0l2n-5f7i-4f8e-b6c4-8d7e9f0a1b41', 'Integração de APIs', 'Desenvolvimento de integrações', 'Desenvolvimento de integrações entre sistemas via API.', 2000.00),
  ('6e8j0l2n-5f7i-4f8e-b6c4-8d7e9f0a1b41', 'Automação de Processos', 'Automação de processos com Zapier', 'Criação de automações de processos utilizando ferramentas como Zapier.', 1500.00),
  ('6e8j0l2n-5f7i-4f8e-b6c4-8d7e9f0a1b41', 'Configuração de Ferramentas', 'Configuração de ferramentas cloud', 'Configuração e integração de ferramentas como Supabase ou Firebase.', 1800.00),

  -- Suporte Técnico
  ('9h1m3o5q-8i0l-4f8e-b6c4-8d7e9f0a1b44', 'Formatação', 'Formatação e reinstalação do sistema', 'Formatação completa do computador com backup e reinstalação do sistema operacional.', 200.00),
  ('9h1m3o5q-8i0l-4f8e-b6c4-8d7e9f0a1b44', 'Instalação de Softwares', 'Instalação de programas e drivers', 'Instalação de programas essenciais e atualização de drivers.', 150.00),
  ('9h1m3o5q-8i0l-4f8e-b6c4-8d7e9f0a1b44', 'Manutenção', 'Manutenção preventiva e corretiva', 'Limpeza física, troca de pasta térmica e manutenção geral.', 250.00),
  ('9h1m3o5q-8i0l-4f8e-b6c4-8d7e9f0a1b44', 'Recuperação de Dados', 'Recuperação de arquivos', 'Recuperação de arquivos deletados ou de discos danificados.', 300.00);