const BASE_URL = import.meta.env.VITE_API_URL ?? ''

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const erro = await res.json().catch(() => ({ erro: 'Erro desconhecido' }))
    throw new Error(erro.erro || `Erro ${res.status}`)
  }
  return res.json()
}

export function getCategorias() {
  return request('/api/categorias')
}

export function getProdutos(categoria_id) {
  const query = categoria_id ? `?categoria_id=${categoria_id}` : ''
  return request(`/api/produtos${query}`)
}

export function criarPedido(itens, numero_mesa) {
  return request('/api/pedidos', {
    method: 'POST',
    body: JSON.stringify({ itens, numero_mesa: numero_mesa || null }),
  })
}

export function buscarStatusPedido(codigo) {
  return request(`/api/pedidos/status/${encodeURIComponent(codigo)}`)
}

export function buscarPedidosPorMesa(numero) {
  return request(`/api/pedidos/mesa/${numero}`)
}

export function getPedidos() {
  return request('/api/pedidos')
}

export function atualizarStatus(pedidoId, status) {
  return request(`/api/pedidos/${pedidoId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function atualizarDisponibilidade(produtoId, disponivel) {
  return request(`/api/produtos/${produtoId}/disponivel`, {
    method: 'PATCH',
    body: JSON.stringify({ disponivel }),
  })
}
