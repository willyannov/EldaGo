-- =============================================
-- EldaGo — Schema do banco de dados (Supabase)
-- Execute este arquivo no SQL Editor do Supabase
-- =============================================

-- 1. Categorias
CREATE TABLE IF NOT EXISTS categorias (
  id   SERIAL PRIMARY KEY,
  nome TEXT NOT NULL
);

-- 2. Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id           SERIAL PRIMARY KEY,
  categoria_id INT REFERENCES categorias(id),
  nome         TEXT NOT NULL,
  descricao    TEXT,
  preco        DECIMAL(10,2) NOT NULL,
  disponivel   BOOLEAN DEFAULT true,
  foto_url     TEXT
);

-- 3. Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id         SERIAL PRIMARY KEY,
  codigo     TEXT UNIQUE NOT NULL,
  status     TEXT DEFAULT 'pendente'
             CHECK (status IN ('pendente','em_preparo','pronto','entregue')),
  criado_em  TIMESTAMPTZ DEFAULT now()
);

-- 4. Itens do pedido
CREATE TABLE IF NOT EXISTS itens_pedido (
  id          SERIAL PRIMARY KEY,
  pedido_id   INT REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id  INT REFERENCES produtos(id),
  quantidade  INT DEFAULT 1 CHECK (quantidade > 0)
);

-- =============================================
-- Categorias
-- =============================================

INSERT INTO categorias (nome) VALUES
  ('Bolos'),
  ('Doces'),
  ('Bebidas')
ON CONFLICT DO NOTHING;

-- =============================================
-- Produtos com imagens de placeholder (para teste)
-- Imagens geradas por placehold.co — funciona sem login
-- =============================================

INSERT INTO produtos (categoria_id, nome, descricao, preco, disponivel, foto_url) VALUES

  -- BOLOS (categoria_id = 1)
  (1, 'Bolo de Chocolate',
      'Massa fofinha com recheio e cobertura de brigadeiro cremoso',
      8.00, true,
      'https://placehold.co/300x200/7B3F00/ffffff?text=Bolo+Chocolate'),

  (1, 'Bolo de Cenoura',
      'Receita tradicional com cobertura de chocolate derretido',
      7.00, true,
      'https://placehold.co/300x200/E07B39/ffffff?text=Bolo+Cenoura'),

  (1, 'Bolo Red Velvet',
      'Massa aveludada vermelha com recheio de cream cheese',
      12.00, true,
      'https://placehold.co/300x200/C0392B/ffffff?text=Red+Velvet'),

  (1, 'Bolo de Limão',
      'Massa leve com recheio de creme de limão e cobertura merengue',
      9.00, true,
      'https://placehold.co/300x200/A9C934/333333?text=Bolo+Limao'),

  (1, 'Bolo de Morango',
      'Pão de ló com chantilly e morangos frescos',
      11.00, false,
      'https://placehold.co/300x200/E91E8C/ffffff?text=Bolo+Morango'),

  -- DOCES (categoria_id = 2)
  (2, 'Brigadeiro Tradicional',
      'Brigadeiro caseiro enrolado no granulado — unidade',
      5.00, true,
      'https://placehold.co/300x200/5D2E0C/ffffff?text=Brigadeiro'),

  (2, 'Brigadeiro Gourmet',
      'Chocolate belga, pistache ou maracujá — unidade',
      7.00, true,
      'https://placehold.co/300x200/3B1A08/ffffff?text=Brig+Gourmet'),

  (2, 'Cupcake',
      'Bolinho fofinho com cobertura de chantilly colorido',
      6.00, true,
      'https://placehold.co/300x200/F48FB1/333333?text=Cupcake'),

  (2, 'Beijinho',
      'Docinho de coco com cravo — unidade',
      5.00, true,
      'https://placehold.co/300x200/F5F5DC/333333?text=Beijinho'),

  (2, 'Cajuzinho',
      'Docinho de amendoim em forma de caju — unidade',
      5.00, true,
      'https://placehold.co/300x200/D4A017/ffffff?text=Cajuzinho'),

  (2, 'Trufa de Chocolate',
      'Recheio cremoso de chocolate meio amargo, cobertura de cacau',
      8.00, true,
      'https://placehold.co/300x200/2C1503/ffffff?text=Trufa'),

  (2, 'Palha Italiana',
      'Pedaço generoso de palha italiana com bolacha',
      6.00, false,
      'https://placehold.co/300x200/8B5E3C/ffffff?text=Palha+Italiana'),

  -- BEBIDAS (categoria_id = 3)
  (3, 'Suco de Laranja',
      'Suco natural espremido na hora — 300ml',
      6.00, true,
      'https://placehold.co/300x200/FF8C00/ffffff?text=Suco+Laranja'),

  (3, 'Suco de Morango',
      'Suco natural com leite ou água — 300ml',
      7.00, true,
      'https://placehold.co/300x200/D32F2F/ffffff?text=Suco+Morango'),

  (3, 'Café Expresso',
      'Café forte e encorpado — 50ml',
      4.00, true,
      'https://placehold.co/300x200/1A0A00/ffffff?text=Cafe+Expresso'),

  (3, 'Cappuccino',
      'Café com leite vaporizado e espuma — 200ml',
      8.00, true,
      'https://placehold.co/300x200/6F4E37/ffffff?text=Cappuccino'),

  (3, 'Chocolate Quente',
      'Achocolatado cremoso com chantilly — 200ml',
      7.00, true,
      'https://placehold.co/300x200/3E1C00/ffffff?text=Choc+Quente'),

  (3, 'Água Mineral',
      'Garrafa 500ml gelada',
      3.00, true,
      'https://placehold.co/300x200/B3E5FC/333333?text=Agua');

-- =============================================
-- Pedidos de teste
-- =============================================

INSERT INTO pedidos (codigo, status) VALUES
  ('#T001', 'pendente'),
  ('#T002', 'em_preparo'),
  ('#T003', 'pronto')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO itens_pedido (pedido_id, produto_id, quantidade) VALUES
  (1, 6, 2),   -- #T001: 2x Brigadeiro Tradicional
  (1, 8, 1),   -- #T001: 1x Cupcake
  (2, 1, 1),   -- #T002: 1x Bolo de Chocolate
  (2, 13, 1),  -- #T002: 1x Suco de Laranja
  (3, 7, 3),   -- #T003: 3x Brigadeiro Gourmet
  (3, 16, 1);  -- #T003: 1x Cappuccino

-- =============================================
-- Habilitar Realtime para a tabela pedidos:
-- Supabase > Database > Replication > Supabase Realtime
-- Habilite a tabela "pedidos" na lista
-- =============================================
