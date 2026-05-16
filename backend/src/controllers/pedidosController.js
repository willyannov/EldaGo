import { supabase } from '../config/supabase.js'

// ─── SSE: clientes conectados ao painel admin ─────────────────────────────────
const clientes = new Set()

export function streamPedidos(req, res) {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.flushHeaders()

  res.write('data: conectado\n\n')

  clientes.add(res)
  req.on('close', () => clientes.delete(res))
}

function notificar(evento) {
  for (const cliente of clientes) {
    cliente.write(`data: ${evento}\n\n`)
  }
}

export async function buscarStatusPorCodigo(req, res) {
  const { codigo } = req.params
  const { data, error } = await supabase
    .from('pedidos')
    .select('status, numero_mesa, criado_em')
    .eq('codigo', codigo)
    .single()
  if (error || !data) return res.status(404).json({ erro: 'Pedido não encontrado' })
  res.json(data)
}

export async function buscarPedidosPorMesa(req, res) {
  const { numero } = req.params
  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      codigo,
      status,
      criado_em,
      numero_mesa,
      itens_pedido (
        quantidade,
        comentario,
        produtos (nome, preco)
      )
    `)
    .eq('numero_mesa', numero)
    .neq('status', 'entregue')
    .order('criado_em', { ascending: false })
  if (error) return res.status(500).json({ erro: error.message })
  res.json(data)
}

export async function criarPedido(req, res) {
  const { itens, numero_mesa } = req.body

  if (!itens || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: 'Informe ao menos um item no pedido' })
  }

  const { data: pedido, error: erroPedido } = await supabase
    .from('pedidos')
    .insert({ codigo: `_tmp_${Date.now()}`, status: 'pendente', numero_mesa: numero_mesa || null })
    .select('id')
    .single()

  if (erroPedido) {
    console.error('[criarPedido] inserir pedido:', erroPedido)
    return res.status(500).json({ erro: erroPedido.message })
  }

  const codigo = '#' + String(pedido.id).padStart(4, '0')
  await supabase.from('pedidos').update({ codigo }).eq('id', pedido.id)

  const itensPedido = itens.map(item => ({
    pedido_id: pedido.id,
    produto_id: item.produto_id,
    quantidade: item.quantidade || 1,
    comentario: item.comentario || null,
  }))

  const { error: erroItens } = await supabase
    .from('itens_pedido')
    .insert(itensPedido)

  if (erroItens) {
    console.error('[criarPedido] inserir itens:', erroItens)
    // Se falhar por coluna inexistente (comentario), tenta sem ela
    if (erroItens.message?.includes('comentario')) {
      const itensSemComentario = itensPedido.map(({ comentario, ...rest }) => rest)
      const { error: erroRetry } = await supabase.from('itens_pedido').insert(itensSemComentario)
      if (erroRetry) {
        console.error('[criarPedido] retry sem comentario:', erroRetry)
        return res.status(500).json({ erro: erroRetry.message })
      }
    } else {
      return res.status(500).json({ erro: erroItens.message })
    }
  }

  notificar('novo_pedido')
  res.status(201).json({ codigo, pedido_id: pedido.id })
}

export async function listarPedidos(req, res) {
  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      id,
      codigo,
      status,
      numero_mesa,
      criado_em,
      itens_pedido (
        *,
        produtos (*)
      )
    `)
    .neq('status', 'entregue')
    .order('criado_em', { ascending: true })

  if (error) {
    console.error('[listarPedidos]', error)
    return res.status(500).json({ erro: error.message })
  }
  res.json(data)
}

export async function atualizarStatus(req, res) {
  const { id } = req.params
  const { status } = req.body

  const statusValidos = ['pendente', 'em_preparo', 'pronto', 'entregue']
  if (!statusValidos.includes(status)) {
    return res.status(400).json({ erro: `Status inválido. Use: ${statusValidos.join(', ')}` })
  }

  const { data, error } = await supabase
    .from('pedidos')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) return res.status(500).json({ erro: error.message })
  notificar('status_atualizado')
  res.json(data)
}
