# Roteiro de Apresentação — EldaGo

> *Cardápio digital para a Elda Bolos e Doces*

---

## 1. Visão Geral do Projeto

O **EldaGo** é uma plataforma de cardápio digital desenvolvida para a doceria da Elda. O cliente acessa pelo navegador do celular (sem precisar instalar app), monta o pedido e envia direto pra cozinha. O funcionario recebe tudo em um painel administrativo que atualiza em tempo real.

O projeto foi pensado em **três camadas independentes** que se conversam:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│    FRONTEND     │ ───► │     BACKEND     │ ───► │     BANCO       │
│  (React/Vite)   │      │  (Node/Express) │      │   (Supabase)    │
│   Firebase      │      │     Render      │      │   PostgreSQL    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

- **Frontend** é o que o cliente e o funcionário veem na tela. Roda no navegador.
- **Backend** é o "cérebro" — recebe pedidos, valida, salva no banco, autentica logins. O cliente nunca fala direto com o banco; sempre passa pelo backend.
- **Banco de dados** é onde tudo fica guardado: produtos, categorias, pedidos, fotos.

---

## 2. Stack Técnica (com explicação)

### Frontend

| Tecnologia | O que é / Pra que serve |
|---|---|
| **React 18** | Biblioteca JavaScript que monta a interface dividindo em "componentes" reutilizáveis (um botão, um card, um drawer). Cada parte da tela é um componente. |
| **Vite** | Ferramenta que compila o código React em um pacote otimizado para o navegador. Substituto moderno do Webpack — extremamente rápido. |
| **React Router** | Controla a "navegação" dentro do site sem recarregar a página. É o que permite ir do cardápio pra tela de produto sem aquele "flash branco" de recarregamento. |
| **Framer Motion** | Biblioteca de animações. Responsável pelas transições suaves entre telas, drawers que deslizam, botões que respondem ao toque. |
| **Lucide React** | Conjunto de ícones (sacola, lixeira, estrela, etc.) usados em toda a interface. |

### Backend

| Tecnologia | O que é / Pra que serve |
|---|---|
| **Node.js** | Ambiente que permite rodar JavaScript fora do navegador, no servidor. |
| **Express** | Framework minimalista para criar uma **API REST** — uma interface padronizada por onde o frontend faz pedidos ao backend (criar pedido, buscar produtos, etc.). |
| **Multer** | Middleware que lida com upload de arquivos (as fotos dos produtos). |
| **Supabase Client** | Biblioteca que conecta o backend ao banco de dados Supabase. |

### Banco de Dados e Infraestrutura

| Tecnologia | O que é / Pra que serve |
|---|---|
| **Supabase** | Plataforma que oferece banco de dados **PostgreSQL** + armazenamento de arquivos (Storage) + autenticação. É o "Firebase do código aberto". |
| **PostgreSQL** | Banco de dados relacional. Onde ficam as tabelas: `produtos`, `categorias`, `pedidos`, `itens_pedido`. |
| **Firebase Hosting** | Serviço do Google que serve o frontend para o mundo. URL pública: `eldagodoceria.web.app`. |
| **Render** | Serviço de hospedagem do backend. URL: `backelda.onrender.com`. |

---

## 3. Conceitos-Chave do Projeto

Para entender o EldaGo, vale conhecer alguns conceitos:

### SPA — Single Page Application
O site é uma **aplicação de página única**. Em vez de recarregar a página inteira a cada clique (como em sites antigos), o React troca apenas o conteúdo dentro da mesma página. O resultado é uma navegação rápida e fluida, parecida com um app nativo.

### API REST
É o "idioma" que o frontend usa para falar com o backend. Funciona com **rotas** organizadas por verbo HTTP:
- `GET` → buscar dados (*"me dê a lista de produtos"*)
- `POST` → criar (*"crie esse pedido novo"*)
- `PUT` → atualizar (*"mude o status desse pedido"*)
- `DELETE` → apagar



### Mobile-First
O projeto foi **desenhado primeiro para celular** e depois adaptado para telas grandes. A maioria dos clientes da doceria vai usar o sistema do celular, então a tela menor é prioridade.

### Responsividade
A interface **se adapta** automaticamente ao tamanho da tela. O mesmo código funciona no celular pequeno, no tablet e no monitor grande do painel admin.

---

## 4. Jornada do Cliente — Telas

### 🍰 4.1. Cardápio (página inicial)

**URL:** `eldagodoceria.web.app` (ou `?mesa=2` quando vem do QR code)

A primeira tela que o cliente vê. É a "vitrine digital" da doceria.

**O que tem:**
- **Banner promocional** no topo (gerenciado pela Elda no admin)
- **Indicador de mesa** se o cliente entrou pelo QR code — o sistema lê o número da mesa pela URL e mostra na tela
- **Seção de Destaques** — produtos selecionados que aparecem primeiro, em formato de cards grandes com foto
- **Lista de Categorias** com rolagem horizontal (ex: Bolos · Brigadeiros · Tortas · Salgados)
- **Cards de Produto** dentro de cada categoria, com foto, nome, descrição curta e preço
- **Barra inferior fixa** (Bottom Navigation) — sempre visível, mesmo rolando a página, com 3 botões: Pedidos, Sacola, Acessibilidade

**Como funciona por trás:**
- O navegador chama a API e busca produtos e categorias do banco
- As imagens dos produtos vêm do Supabase Storage (armazenamento em nuvem)
- O carrinho é guardado no **sessionStorage** do navegador (memória temporária que sobrevive a um refresh acidental)

### 🎂 4.2. Detalhe do Produto

**URL:** `/produto/{id}` — exemplo: `/produto/42`

Quando o cliente toca em um produto, a tela muda para a página de detalhe.

**O que tem:**
- **Foto grande** ocupando o topo da tela
- **Nome, descrição completa e preço**
- **Seletor de quantidade** com botões `+` e `−`
- **Campo de comentário** — uma instrução especial opcional. *Ex: "sem nozes, por favor", "embala pra presente"*
- **Botão fixo no rodapé** "Adicionar à sacola — R$ XX,XX"

**Como funciona por trás:**
- O React Router lê o ID na URL e busca os dados específicos daquele produto
- Ao tocar em "Adicionar", o produto é incluído no carrinho (estado em memória + sessionStorage)
- O cliente volta automaticamente ao cardápio

### 🛒 4.3. Sacola (Drawer)

**Como abre:** ao tocar no botão "Sacola" da barra inferior.

A sacola é um **drawer**: um painel que desliza para dentro da tela, sobrepondo o cardápio sem fechá-lo.

**O que tem:**
- **Lista de itens** do pedido — cada um com foto pequena, nome, quantidade e subtotal
- **Botões de ajuste** em cada item: `+` para aumentar, `−` para diminuir, lixeira para remover, lápis para editar o comentário
- **Total geral** em destaque no rodapé
- **Botão "Confirmar pedido"** — grande, em rosa, ocupando a largura do drawer

**Como funciona por trás:**
- O drawer é renderizado com animação do Framer Motion (`slide-in` a partir da direita)
- Ao confirmar, o frontend envia o pedido completo para o backend
- O backend cria um registro na tabela `pedidos`, gera um **código sequencial** (`#0042`) baseado no ID do banco, salva os itens na tabela `itens_pedido`
- O Supabase notifica o painel do Admin via SSE em tempo real

### ✅ 4.4. Confirmação do Pedido

Logo após confirmar, o drawer da sacola muda para uma **tela de sucesso**:

- Ícone de check verde
- Mensagem: *"Pedido enviado!"*
- **Código do pedido em destaque** — `#0042`
- O código é gerado a partir de um número sequencial no banco — sempre único, fácil de lembrar
- A sacola é esvaziada automaticamente

### ⏱️ 4.5. Acompanhar Pedido (Drawer)

**Como abre:** ao tocar em "Pedidos" na barra inferior.

Outro drawer, dessa vez do lado esquerdo. Mostra os pedidos ativos do cliente com status em tempo real.

**O que tem:**
- Lista de pedidos do cliente
- **Status colorido** de cada um:
  - 🟠 **Pendente** — acabou de chegar
  - 🔵 **Em preparo** — o funcionario começou
  - 🟢 **Pronto** — pode buscar
  - ⚪ **Entregue** — finalizado
- Detalhes do pedido (itens, total, código)

**Como funciona por trás:**
- O navegador usa **polling**: a cada 3 segundos pergunta ao backend *"qual o status do pedido #0042?"*
- O backend consulta o banco e devolve o status atual
- Se mudou, a tela atualiza sozinha (com animação suave)
- Pedidos **sem mesa** (delivery/retirada) são salvos no **localStorage** (memória permanente do navegador) — sobrevivem mesmo se o cliente fechar o site

---

## 5. Jornada da EldaGo — Painel Administrativo

**URL:** `eldagodoceria.web.app/admin`

O painel admin é uma área restrita, protegida por senha. É onde o funcionário passa a maior parte do tempo durante o expediente.

### 🔐 5.1. Login

- Tela simples com um campo de senha
- Ao acertar, o backend gera um **token de autenticação** (Bearer Token) que é guardado no localStorage do navegador
- A partir daí, toda requisição que o funcionário faz inclui esse token — o backend verifica e libera só se for válido
- **Por que assim?** É um padrão de segurança — sem o token, a API rejeita o acesso, mesmo se alguém adivinhar a URL `/admin`

### 📋 5.2. Painel de Pedidos

A tela principal. Layout **estilo Kanban** — colunas separadas por status: **Pendentes · Em preparo · Prontos**.

**O que tem:**
- **Cards de pedido** em cada coluna mostrando:
  - Código (`#0042`)
  - Mesa ou "Sem mesa"
  - Hora que chegou
  - Itens com quantidade e comentários do cliente
  - Total
- **Botão "Avançar status"** em cada card — move o pedido para a próxima coluna

**Como funciona por trás:**
- **SSE (Server-Sent Events)** — o backend mantém uma conexão aberta com o navegador. Quando chega pedido novo ou alguém muda um status, ele empurra a notificação instantaneamente
- Diferente do polling do cliente, aqui não tem atraso de 3 segundos — é **imediato**
- Pedidos "Entregue" somem da tela (mas ficam guardados no histórico do banco)

### 🍰 5.3. Gestão de Produtos

Aba lateral. O funcionário controla todo o cardápio aqui.

**O que tem:**
- **Lista de produtos** em cards (foto, nome, preço, status disponível/indisponível)
- **Botão "Novo produto"** abre um modal (janela flutuante) com o formulário
- **Toggles** rápidos no card para ligar/desligar disponibilidade ou marcar como destaque
- Botões de **editar** e **excluir** em cada card

**Formulário de produto:**
- **Foto** (obrigatória) — upload de arquivo
- **Nome** (obrigatório)
- **Descrição** (obrigatória, máximo 150 caracteres, com contador visual)
- **Preço** (obrigatório, formatado em reais)
- **Categoria** (obrigatório, selecionado de uma lista)
- **Disponível** — se desligar, o produto some do cardápio do cliente
- **Destaque** — se ligar, aparece na seção de destaques da home

**Como funciona por trás:**
- A foto é enviada pro backend, que faz upload no **Supabase Storage** (armazenamento em nuvem)
- O Storage devolve uma URL pública da imagem, que é salva no banco junto com os dados do produto
- O backend **valida tudo de novo** (campos obrigatórios, tamanho da foto até 5MB) — segurança extra: nunca confie só na validação do frontend
- O modal é **adaptativo**: vira *bottom-sheet* no celular (sobe de baixo) e janela centralizada no desktop

### 🏷️ 5.4. Gestão de Categorias

**O que tem:**
- Lista de categorias com ordem visível
- **Drag-and-drop** — o funcionário arrasta para reordenar como vai aparecer no cardápio do cliente
- Botões para criar, renomear, excluir

**Como funciona por trás:**
- Cada categoria tem um campo `ordem` no banco
- Quando o funcionário arrasta, o frontend manda a nova ordem pro backend, que atualiza tudo de uma vez
- A próxima vez que um cliente abrir o cardápio, vai ver a nova ordem

### ⚙️ 5.5. Configurações

- **Upload do banner** principal do cardápio
- Preferências gerais do sistema

---

## 6. Acessibilidade

Um cuidado que perpassa o sistema inteiro. O EldaGo segue o padrão **WCAG 2.1 nível AA** — uma diretriz internacional de acessibilidade web.

**Widget de acessibilidade** (botão fixo no rodapé) com toggles:
- **Alto contraste** — inverte as cores e aumenta o contraste para baixa visão
- **Aumentar fonte** — texto maior para quem tem dificuldade de leitura
- **Reduzir movimento** — desliga animações para quem se incomoda com movimento (ex: pessoas com vertigem)

**Recursos invisíveis mas importantes:**
- **Skip Link** — atalho de teclado que pula direto pro conteúdo (essencial para usuários de leitor de tela)
- **ARIA labels** — descrições em todos os botões com ícone (o leitor de tela "lê" o que cada botão faz)
- **Focus visible** — contorno claro no botão selecionado para quem navega só pelo teclado
- **Focus trap** nos drawers e modais — o foco fica preso dentro do elemento aberto, não vaza pro fundo

---

## 7. Detalhes Técnicos Extras

### Persistência local no navegador
- **sessionStorage** — guarda o carrinho. Sobrevive ao refresh, mas some quando fecha a aba.
- **localStorage** — guarda pedidos sem mesa e o token do admin. Permanente até o usuário limpar o navegador.

### Segurança
- **CORS configurado** — só aceita requisições vindas do domínio oficial do site (Firebase). Bloqueia tentativas de outros sites usarem a API.
- **Validação dupla** — tudo que é validado no frontend, é validado de novo no backend. Nunca confie apenas no que veio do navegador.
- **Senha do admin em variável de ambiente** — não fica exposta no código, só no servidor.

### Performance
- **Code splitting** — o Vite divide o código em pedaços. Quem só abre o cardápio não baixa o código do admin.
- **Lazy loading de imagens** — fotos só carregam quando aparecem na tela.
- **Bundle final**: ~408 KB (122 KB comprimido) — leve pra rede móvel.

### Custo
Toda a infraestrutura usa **planos gratuitos**:
- Firebase Hosting (grátis até 10 GB de tráfego/mês)
- Render (grátis com limitação — o backend "dorme" após 15 min sem uso, acorda em ~30s)
- Supabase (grátis até 500 MB de banco + 1 GB de storage)

**Custo total: R$ 0,00/mês.**

---

## 8. Resumo Visual das Telas

| # | Tela | Tipo | Quem usa | Tecnologia destaque |
|---|------|------|----------|---------------------|
| 1 | Cardápio | Página | Cliente | SPA + Grid responsivo |
| 2 | Detalhe do Produto | Página | Cliente | Rota dinâmica (React Router) |
| 3 | Sacola | **Drawer** | Cliente | Framer Motion (slide-in) |
| 4 | Confirmação | Tela inline | Cliente | Código sequencial do banco |
| 5 | Acompanhar Pedido | **Drawer** | Cliente | Polling 3s + localStorage |
| 6 | Login Admin | Página | Funcionário | Bearer Token |
| 7 | Painel de Pedidos | Página | Funcionário | **SSE** (tempo real) |
| 8 | Produtos | Página + Modal | Funcionário | Upload pro Supabase Storage |
| 9 | Categorias | Página | Funcionário | Drag-and-drop |
| 10 | Configurações | Página | Funcionário | Upload de banner |

---

## 9. Encerramento

O EldaGo é um exemplo prático de uma **arquitetura web moderna**: frontend SPA em React, backend REST em Node, banco PostgreSQL gerenciado, comunicação em tempo real via SSE, drawers e animações para uma experiência de app, validação dupla para segurança, e acessibilidade pensada desde o início.

O resultado é um sistema **completo, gratuito, hospedado em nuvem profissional** e — o mais importante — **pronto para uso real** na doceria da Elda, atendendo clientes de verdade.

> *"Por trás de uma interface simples e bonita, uma arquitetura sólida e cuidadosa."*
