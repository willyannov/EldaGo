import { supabase } from '../config/supabase.js'

export async function listarProdutos(req, res) {
  const { categoria_id } = req.query

  let query = supabase
    .from('produtos')
    .select('*, categorias(nome)')
    .eq('disponivel', true)
    .order('nome')

  if (categoria_id) {
    query = query.eq('categoria_id', categoria_id)
  }

  const { data, error } = await query

  if (error) {
    console.error('[listarProdutos]', error)
    return res.status(500).json({ erro: error.message, detalhes: error })
  }
  res.json(data)
}

export async function buscarProduto(req, res) {
  const { id } = req.params

  const { data, error } = await supabase
    .from('produtos')
    .select('*, categorias(nome)')
    .eq('id', id)
    .single()

  if (error) return res.status(404).json({ erro: 'Produto não encontrado' })
  res.json(data)
}

export async function listarCategorias(req, res) {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('ordem', { ascending: true, nullsFirst: false })
    .order('nome')

  if (error) {
    console.error('[listarCategorias]', error)
    return res.status(500).json({ erro: error.message, detalhes: error })
  }
  res.json(data)
}

export async function atualizarDisponibilidade(req, res) {
  const { id } = req.params
  const { disponivel } = req.body

  if (typeof disponivel !== 'boolean') {
    return res.status(400).json({ erro: 'Campo "disponivel" deve ser true ou false' })
  }

  const { data, error } = await supabase
    .from('produtos')
    .update({ disponivel })
    .eq('id', id)
    .select()
    .single()

  if (error) return res.status(500).json({ erro: error.message })
  res.json(data)
}
