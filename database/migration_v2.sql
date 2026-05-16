-- =============================================
-- EldaGo v2 — Migration
-- Execute no SQL Editor do Supabase
-- =============================================

-- Novos campos em produtos e itens_pedido
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS porcoes INT DEFAULT 1;
ALTER TABLE itens_pedido ADD COLUMN IF NOT EXISTS comentario TEXT;

-- Limpar dados antigos (placeholder)
DELETE FROM itens_pedido;
DELETE FROM pedidos;
DELETE FROM produtos;
DELETE FROM categorias;

-- =============================================
-- Categorias reais da Elda
-- =============================================
INSERT INTO categorias (id, nome) VALUES
  (1, 'Brigadeiro ou trufinha'),
  (2, 'Bombons de pote'),
  (3, 'Bolos da Felicidade'),
  (4, 'Bolos Gelados'),
  (5, 'Sobremesas'),
  (6, 'Fatias de Bolo'),
  (7, 'Bebidas');

-- Resetar sequência
SELECT setval('categorias_id_seq', 7);

-- =============================================
-- Produtos reais do iFood
-- =============================================
INSERT INTO produtos (categoria_id, nome, descricao, preco, porcoes, disponivel, foto_url) VALUES

  -- Brigadeiro ou trufinha
  (1, 'Brigadeiro',
      'Brigadeiro tradicional',
      10.90, 1, true,
      'https://placehold.co/300x300/5D2E0C/ffffff?text=Brigadeiro'),

  -- Bombons de pote
  (2, 'Bombom de Kinder Bueno',
      'Brigadeiro branco cremoso, pedaços de Kinder bueno, Nutella, finalizado com granulado',
      14.90, 1, true,
      'https://placehold.co/300x300/8B5E3C/ffffff?text=Kinder+Bueno'),

  -- Bolos da Felicidade (categoria 3 — adicionar produtos quando tiver fotos reais)

  -- Bolos Gelados
  (4, 'Bolo Gelado de Ninho com Abacaxi',
      'Massa branca, mousse de Ninho com abacaxi',
      25.90, 1, true,
      'https://placehold.co/300x300/FFF9C4/333333?text=Ninho+Abacaxi'),

  (4, 'Bolo Gelado de Prestígio',
      'Massa de pão de ló de chocolate, recheio cocada cremosa, cobertura de brigadeiro',
      25.90, 1, true,
      'https://placehold.co/300x300/3E2723/ffffff?text=Prestigio'),

  (4, 'Bolo Gelado de Alpino',
      'Massa chocolate, chocolate meio amargo',
      25.90, 1, true,
      'https://placehold.co/300x300/4E342E/ffffff?text=Alpino'),

  (4, 'Bolo Gelado Trufado com Brigadeiro',
      'Massa chocolate, trufado de chocolate com brigadeiro cremoso',
      25.90, 1, true,
      'https://placehold.co/300x300/2C1503/ffffff?text=Trufado'),

  -- Sobremesas
  (5, 'Folhata de Morango',
      'Creme suave, com bolacha folhada e morangos frescos',
      26.90, 3, true,
      'https://placehold.co/300x300/E91E63/ffffff?text=Folhata+Morango'),

  (5, 'Pavê de Ninho com Frutas Vermelhas',
      'Pavê cremoso de Ninho com frutas vermelhas frescas',
      26.90, 3, true,
      'https://placehold.co/300x300/F8BBD9/333333?text=Pave+Ninho'),

  -- Fatias de Bolo
  (6, 'Fatia Bolo Camafeu de Morango',
      'Massa chocolate, brigadeiro branco com morangos frescos',
      25.90, 1, true,
      'https://placehold.co/300x300/C0392B/ffffff?text=Camafeu+Morango'),

  (6, 'Fatia de Bolo Brigadeiro com Baba',
      'Massa de chocolate, recheio brigadeiro ao leite e uma camada de baba de moça',
      25.90, 1, true,
      'https://placehold.co/300x300/5D4037/ffffff?text=Brig+com+Baba'),

  (6, 'Fatia de Bolo de Brigadeiro com Morango',
      'Massa de chocolate, recheio de brigadeiro com morango',
      25.90, 1, true,
      'https://placehold.co/300x300/AD1457/ffffff?text=Brig+Morango'),

  (6, 'Fatia de Bolo Laka com Morango',
      'Massa de chocolate laka com morangos frescos',
      25.90, 1, true,
      'https://placehold.co/300x300/880E4F/ffffff?text=Laka+Morango'),

  (6, 'Fatia de Bolo Mil Folhas de Morango',
      'Massa mil folhas com creme e morangos frescos',
      25.90, 1, true,
      'https://placehold.co/300x300/F06292/ffffff?text=Mil+Folhas'),

  -- Bebidas
  (7, 'Água Mineral 510ml',
      'Garrafa de 510ml gelada',
      3.90, 1, true,
      'https://placehold.co/300x300/B3E5FC/333333?text=Agua+Mineral'),

  (7, 'Coca Cola Lata',
      'Coca cola lata 350ml',
      7.90, 1, true,
      'https://placehold.co/300x300/C62828/ffffff?text=Coca+Cola');

-- Resetar sequência de produtos
SELECT setval('produtos_id_seq', (SELECT MAX(id) FROM produtos));

-- =============================================
-- Pedidos de teste
-- =============================================
INSERT INTO pedidos (codigo, status) VALUES
  ('#T001', 'pendente'),
  ('#T002', 'em_preparo');

INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, comentario) VALUES
  (1, 1, 2, 'Sem granulado por favor'),
  (1, 14, 1, NULL),
  (2, 3, 1, 'Bem gelado');
