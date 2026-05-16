import { supabase } from '../config/supabase.js'
import { gerarToken, revogarToken } from '../middleware/auth.js'

// URL do banner em memória (persiste enquanto o servidor estiver rodando)
let bannerUrl = supabase.storage.from('product-images').getPublicUrl('banner.jpg').data.publicUrl

// ─── Auth ────────────────────────────────────────────────────────────────────

export function login(req, res) {
  const { senha } = req.body
  if (!senha || senha !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ erro: 'Senha incorreta' })
  }
  const token = gerarToken()
  res.json({ token })
}

export function logout(req, res) {
  const token = req.headers['authorization']?.slice(7)
  if (token) revogarToken(token)
  res.json({ ok: true })
}

// ─── Upload de foto ───────────────────────────────────────────────────────────

export async function uploadFoto(req, res) {
  if (!req.file) return res.status(400).json({ erro: 'Nenhum arquivo enviado' })

  const nomeArquivo = `${Date.now()}-${req.file.originalname.replace(/\s/g, '_')}`

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(nomeArquivo, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    })

  if (error) {
    console.error('[uploadFoto]', error)
    return res.status(500).json({ erro: error.message })
  }

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(nomeArquivo)

  res.json({ url: urlData.publicUrl })
}

// ─── Produtos ─────────────────────────────────────────────────────────────────

export async function criarProduto(req, res) {
  const { categoria_id, nome, descricao, preco, porcoes, disponivel, foto_url, destaque } = req.body

  if (!nome || !preco || !categoria_id || !descricao || !foto_url) {
    return res.status(400).json({ erro: 'nome, preco, categoria_id, descricao e foto são obrigatórios' })
  }

  const { data, error } = await supabase
    .from('produtos')
    .insert({ categoria_id, nome, descricao, preco, porcoes: porcoes || 1, disponivel: disponivel ?? true, foto_url, destaque: destaque ?? false })
    .select()
    .single()

  if (error) {
    console.error('[criarProduto]', error)
    return res.status(500).json({ erro: error.message })
  }
  res.status(201).json(data)
}

export async function editarProduto(req, res) {
  const { id } = req.params

  // Aceita apenas campos válidos da tabela produtos
  const { nome, descricao, preco, porcoes, categoria_id, disponivel, foto_url, destaque } = req.body
  const campos = {}
  if (nome !== undefined)         campos.nome = nome
  if (descricao !== undefined)    campos.descricao = descricao
  if (preco !== undefined)        campos.preco = parseFloat(preco)
  if (porcoes !== undefined)      campos.porcoes = parseInt(porcoes)
  if (categoria_id !== undefined) campos.categoria_id = categoria_id
  if (disponivel !== undefined)   campos.disponivel = disponivel
  if (foto_url !== undefined)     campos.foto_url = foto_url
  if (destaque !== undefined)     campos.destaque = destaque

  if (Object.keys(campos).length === 0) {
    return res.status(400).json({ erro: 'Nenhum campo para atualizar' })
  }

  const { data, error } = await supabase
    .from('produtos')
    .update(campos)
    .eq('id', id)
    .select('*, categorias(nome)')
    .single()

  if (error) {
    console.error('[editarProduto]', error)
    return res.status(500).json({ erro: error.message })
  }
  res.json(data)
}

export async function deletarProduto(req, res) {
  const { id } = req.params

  // Remove itens de pedidos vinculados antes de deletar o produto
  const { error: erroItens } = await supabase
    .from('itens_pedido')
    .delete()
    .eq('produto_id', id)

  if (erroItens) {
    console.error('[deletarProduto] erro ao limpar itens:', erroItens)
    return res.status(500).json({ erro: erroItens.message })
  }

  const { error } = await supabase.from('produtos').delete().eq('id', id)

  if (error) {
    console.error('[deletarProduto]', error)
    return res.status(500).json({ erro: error.message })
  }
  res.json({ ok: true })
}

export async function listarTodosProdutos(req, res) {
  const { data, error } = await supabase
    .from('produtos')
    .select('*, categorias(nome)')
    .order('categoria_id')
    .order('nome')

  if (error) return res.status(500).json({ erro: error.message })
  res.json(data)
}

// ─── Categorias ───────────────────────────────────────────────────────────────

export async function criarCategoria(req, res) {
  const { nome } = req.body
  if (!nome) return res.status(400).json({ erro: 'nome é obrigatório' })

  const { data, error } = await supabase
    .from('categorias')
    .insert({ nome })
    .select()
    .single()

  if (error) {
    console.error('[criarCategoria]', error)
    return res.status(500).json({ erro: error.message })
  }
  res.status(201).json(data)
}

export async function deletarCategoria(req, res) {
  const { id } = req.params

  const { error } = await supabase.from('categorias').delete().eq('id', id)

  if (error) {
    console.error('[deletarCategoria]', error)
    return res.status(500).json({ erro: error.message })
  }
  res.json({ ok: true })
}

// ─── Banner ───────────────────────────────────────────────────────────────────

export function getBanner(req, res) {
  res.json({ url: bannerUrl })
}

export async function uploadBanner(req, res) {
  if (!req.file) return res.status(400).json({ erro: 'Nenhum arquivo enviado' })

  const { error } = await supabase.storage
    .from('product-images')
    .upload('banner.jpg', req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: true,
    })

  if (error) {
    console.error('[uploadBanner]', error)
    return res.status(500).json({ erro: error.message })
  }

  const base = supabase.storage.from('product-images').getPublicUrl('banner.jpg').data.publicUrl
  bannerUrl = `${base}?v=${Date.now()}`
  res.json({ url: bannerUrl })
}

// ─── Reordenar Categorias ─────────────────────────────────────────────────────

export async function reordenarCategorias(req, res) {
  const { ordem } = req.body
  if (!Array.isArray(ordem) || ordem.length === 0) {
    return res.status(400).json({ erro: 'ordem deve ser um array não vazio' })
  }

  const updates = ordem.map(({ id, ordem: o }) =>
    supabase.from('categorias').update({ ordem: o }).eq('id', id)
  )

  const results = await Promise.all(updates)
  const falha = results.find(r => r.error)
  if (falha) {
    console.error('[reordenarCategorias]', falha.error)
    return res.status(500).json({ erro: falha.error.message })
  }

  res.json({ ok: true })
}
