import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { criarPedido, getProdutos } from '../services/api'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { SkeletonItemSacola, SkeletonCarrossel, SkeletonRodape } from '../components/Skeleton'

const COR = '#D81B60'

function CarrosselProdutos({ produtos, onAdicionar }) {
  if (produtos.length === 0) return null

  return (
    <div style={c.wrapper}>
      <h3 style={c.titulo}>Peça também</h3>
      <div style={c.trilho}>
        <AnimatePresence initial={false}>
          {produtos.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, width: 0, marginRight: 0 }}
              animate={{ opacity: 1, width: 122, marginRight: 0 }}
              exit={{ opacity: 0, width: 0, marginRight: -12 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              style={{ flexShrink: 0, overflow: 'hidden' }}
            >
              <div style={c.item}>
                <div style={c.fotoBox}>
                  {p.foto_url
                    ? <img src={p.foto_url} alt={p.nome} style={c.foto} />
                    : <div style={c.fotoVazio} />
                  }
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    style={c.btnAdd}
                    onClick={() => onAdicionar(p)}
                  >
                    <Plus size={20} color={COR} strokeWidth={2.5} />
                  </motion.button>
                </div>
                <span style={c.preco}>R$ {Number(p.preco).toFixed(2).replace('.', ',')}</span>
                <span style={c.nome}>{p.nome}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

const c = {
  wrapper: {
    background: '#FFFBF9',
    borderTop: '1px solid #f0f0f0',
    borderBottom: '1px solid #f0f0f0',
    paddingBottom: 16,
  },
  titulo: {
    margin: 0, padding: '16px 16px 12px',
    fontSize: 16, fontWeight: '700', color: '#3D3D3D',
  },
  trilho: {
    display: 'flex', gap: 12,
    overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none',
    padding: '0 16px',
  },
  item: {
    flexShrink: 0, width: 122,
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  fotoBox: {
    position: 'relative', width: 122, height: 122,
    borderRadius: 8, overflow: 'hidden',
    border: '1px solid #ebebeb', background: '#f5f5f5',
  },
  foto: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  fotoVazio: { width: '100%', height: '100%', background: '#ebebeb' },
  btnAdd: {
    position: 'absolute', bottom: 6, right: 6,
    width: 32, height: 32, borderRadius: '50%',
    background: '#fff', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 1px 6px rgba(0,0,0,0.18)',
    WebkitTapHighlightColor: 'transparent',
  },
  preco: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  nome: {
    fontSize: 12, color: '#3D3D3D', lineHeight: 1.3,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
}

export default function Pedido() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [enviando, setEnviando] = useState(false)
  const [codigo, setCodigo] = useState(null)
  const [erro, setErro] = useState(null)
  const [todosProdutos, setTodosProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)

  const [carrinho, setCarrinho] = useState(() => {
    const stored = sessionStorage.getItem('eldago_carrinho')
    if (stored) return JSON.parse(stored)
    return state?.carrinho || {}
  })
  const itens = Object.values(carrinho)

  useEffect(() => {
    getProdutos()
      .then(lista => setTodosProdutos(lista.filter(p => p.disponivel !== false)))
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [])

  const idsNoCarrinho = new Set(Object.keys(carrinho).map(Number))
  const produtosCarrossel = todosProdutos.filter(p => !idsNoCarrinho.has(p.id))

  function alterarQtd(produtoId, delta) {
    setCarrinho(prev => {
      const atual = prev[produtoId]
      if (!atual) return prev
      const nova = atual.quantidade + delta
      if (nova <= 0) {
        const { [produtoId]: _, ...resto } = prev
        return resto
      }
      return { ...prev, [produtoId]: { ...atual, quantidade: nova } }
    })
  }

  function adicionarDoCarrossel(produto) {
    setCarrinho(prev => {
      const existente = prev[produto.id]
      return {
        ...prev,
        [produto.id]: {
          produto,
          quantidade: existente ? existente.quantidade + 1 : 1,
          comentario: existente?.comentario || '',
        },
      }
    })
  }

  const totalPreco = itens.reduce((acc, item) => acc + item.produto.preco * item.quantidade, 0)

  async function confirmar() {
    if (itens.length === 0) return
    setEnviando(true)
    setErro(null)
    try {
      const payload = itens.map(item => ({
        produto_id: item.produto.id,
        quantidade: item.quantidade,
        comentario: item.comentario || null,
      }))
      const mesa = sessionStorage.getItem('eldago_mesa')
      const resultado = await criarPedido(payload, mesa)
      sessionStorage.removeItem('eldago_carrinho')
      sessionStorage.setItem('eldago_tem_pedidos', '1')
      setCodigo(resultado.codigo)
    } catch {
      setErro('Não foi possível enviar o pedido. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  if (codigo) {
    return (
      <div style={s.sucesso}>
        <div style={s.icone}>✓</div>
        <h2 style={s.tituloSucesso}>Pedido recebido!</h2>
        <p style={s.sub}>Seu código é</p>
        <div style={s.codigo}>{codigo}</div>
        <p style={s.instrucao}>Acompanhe o status do seu pedido em tempo real.</p>
        <a href="/" style={{ ...s.btnVoltar, textDecoration: 'none', display: 'inline-block' }}>
          Voltar ao cardápio
        </a>
      </div>
    )
  }

  if (itens.length === 0 && !carregando) {
    return (
      <div style={s.vazio}>
        <p>Sua sacola está vazia.</p>
        <button style={s.btnVoltar} onClick={() => navigate('/')}>Ver cardápio</button>
      </div>
    )
  }

  return (
    <div style={s.container}>
      <header style={s.header}>
        <button style={s.btnBack} onClick={() => navigate(-1)}>←</button>
        <h2 style={s.titulo}>Sua sacola</h2>
      </header>

      <div style={s.itensCard}>
        <h3 style={s.secTitulo}>Itens adicionados</h3>

        {carregando
          ? Array.from({ length: itens.length || 2 }).map((_, i) => <SkeletonItemSacola key={i} />)
          : (
            <AnimatePresence initial={false}>
              {itens.map(({ produto, quantidade, comentario }) => (
                <motion.div
                  key={produto.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={s.item}>
                    <div style={s.fotoWrapper}>
                      {produto.foto_url
                        ? <img src={produto.foto_url} alt={produto.nome} style={s.itemFoto} />
                        : <div style={s.fotoVazio} />
                      }
                      <button
                        style={s.editBtn}
                        onClick={() => navigate(`/produto/${produto.id}`)}
                      >
                        <Pencil size={13} color="#fff" strokeWidth={2.5} />
                      </button>
                    </div>

                    <div style={s.itemInfo}>
                      <span style={s.itemNome}>{produto.nome}</span>
                      {(produto.descricao || comentario) && (
                        <span style={s.itemDesc}>
                          {comentario || (produto.descricao || '').slice(0, 150)}
                        </span>
                      )}
                    </div>

                    <div style={s.direita}>
                      <span style={s.itemPreco}>
                        R$ {(produto.preco * quantidade).toFixed(2).replace('.', ',')}
                      </span>
                      <div style={s.qtdPill}>
                        <motion.button whileTap={{ scale: 0.85 }} style={s.qtdBtn}
                          onClick={() => alterarQtd(produto.id, -1)}>
                          {quantidade === 1 ? <Trash2 size={14} color={COR} strokeWidth={2.5} /> : '−'}
                        </motion.button>
                        <span style={s.qtdNum}>{quantidade}</span>
                        <motion.button whileTap={{ scale: 0.85 }} style={s.qtdBtn}
                          onClick={() => alterarQtd(produto.id, +1)}>
                          +
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )
        }

        <button style={s.btnMaisItens} onClick={() => navigate('/')}>
          Adicionar mais itens
        </button>
      </div>

      {carregando
        ? <SkeletonCarrossel count={4} />
        : <CarrosselProdutos produtos={produtosCarrossel} onAdicionar={adicionarDoCarrossel} />
      }

      {erro && <p style={s.erro}>{erro}</p>}

      {carregando ? <SkeletonRodape /> : <div style={s.rodape}>
        <div style={s.totalInfo}>
          <span style={s.totalLabel}>Total</span>
          <div style={s.totalValorRow}>
            <span style={s.totalValor}>R$ {totalPreco.toFixed(2).replace('.', ',')}</span>
            <span style={s.totalItens}> / {itens.reduce((a, i) => a + i.quantidade, 0)} {itens.reduce((a, i) => a + i.quantidade, 0) === 1 ? 'item' : 'itens'}</span>
          </div>
        </div>
        <button
          style={enviando ? s.btnDesabilitado : s.btnConfirmar}
          onClick={confirmar}
          disabled={enviando}
        >
          {enviando ? 'Enviando...' : 'Confirmar pedido'}
        </button>
      </div>}
    </div>
  )
}

const s = {
  container: {
    maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#FFFBF9',
    paddingBottom: 90,
  },
  header: {
    background: '#FFFBF9', display: 'flex', alignItems: 'center', gap: 12,
    padding: '16px', borderBottom: '1px solid #f0f0f0',
  },
  btnBack: {
    background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#3D3D3D',
  },
  titulo: { margin: 0, fontSize: 18, fontWeight: '700', color: '#3D3D3D' },
  itensCard: {
    background: '#FFFBF9', margin: '12px', borderRadius: 12,
    overflow: 'hidden', boxShadow: '0 2px 8px rgba(216,27,96,0.07), 0 1px 3px rgba(0,0,0,0.05)',
  },
  secTitulo: {
    margin: 0, padding: '16px 16px 12px',
    fontSize: 16, fontWeight: '700', color: '#3D3D3D',
    borderBottom: '1px solid #f5f5f5',
  },
  item: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 16px', borderBottom: '1px solid #f5f5f5',
  },
  fotoWrapper: { position: 'relative', flexShrink: 0, width: 72, height: 72 },
  itemFoto: { width: 72, height: 72, objectFit: 'cover', borderRadius: 8, display: 'block' },
  fotoVazio: { width: 72, height: 72, borderRadius: 8, background: '#f0f0f0' },
  editBtn: {
    position: 'absolute', top: 4, left: 4,
    width: 26, height: 26, borderRadius: '50%',
    background: COR, border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
    WebkitTapHighlightColor: 'transparent',
  },
  itemInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 },
  itemNome: {
    fontSize: 14, fontWeight: '600', color: '#3D3D3D',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  itemDesc: {
    fontSize: 12, color: '#717171', lineHeight: 1.4,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  direita: {
    flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
  },
  itemPreco: { fontSize: 14, fontWeight: '700', color: COR, whiteSpace: 'nowrap' },
  qtdPill: {
    display: 'inline-flex', alignItems: 'center',
    background: '#f5f5f5', borderRadius: 20, overflow: 'hidden',
  },
  qtdBtn: {
    background: 'none', border: 'none', color: COR,
    fontSize: 16, fontWeight: '700', cursor: 'pointer',
    width: 38, padding: '5px 0', textAlign: 'center',
    WebkitTapHighlightColor: 'transparent', lineHeight: 1,
  },
  qtdNum: { fontSize: 13, fontWeight: '700', color: '#3D3D3D', minWidth: 18, textAlign: 'center' },
  btnMaisItens: {
    display: 'block', width: '100%', background: 'none', border: 'none',
    color: COR, fontSize: 15, fontWeight: '700', cursor: 'pointer',
    padding: '16px', textAlign: 'center', WebkitTapHighlightColor: 'transparent',
  },
  rodape: {
    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
    background: '#FFFBF9', borderTop: '1px solid #f0f0f0',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
    padding: '14px 16px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    maxWidth: 480, margin: '0 auto',
  },
  totalInfo: { display: 'flex', flexDirection: 'column', gap: 2 },
  totalLabel: { fontSize: 13, color: '#717171', fontWeight: '400' },
  totalValorRow: { display: 'flex', alignItems: 'baseline' },
  totalValor: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  totalItens: { fontSize: 14, color: '#717171', fontWeight: '400' },
  btnConfirmar: {
    flexShrink: 0, padding: '14px 28px',
    background: COR, color: '#fff', border: 'none',
    borderRadius: 12, fontSize: 15, fontWeight: '700', cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  btnDesabilitado: {
    flexShrink: 0, padding: '14px 28px',
    background: '#ccc', color: '#fff', border: 'none',
    borderRadius: 12, fontSize: 15, cursor: 'not-allowed',
    whiteSpace: 'nowrap',
  },
  erro: { color: '#c0392b', textAlign: 'center', fontSize: 14, margin: '0 16px' },
  sucesso: {
    maxWidth: 480, margin: '0 auto', minHeight: '100vh',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 12, padding: 32, textAlign: 'center', background: '#FFFBF9',
  },
  icone: {
    width: 64, height: 64, background: '#27ae60', color: '#fff',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
  },
  tituloSucesso: { fontSize: 24, margin: 0 },
  sub: { color: '#717171', margin: 0 },
  codigo: { fontSize: 48, fontWeight: '700', color: COR, letterSpacing: 4 },
  instrucao: { color: '#555', fontSize: 14 },
  btnVoltar: {
    marginTop: 16, padding: '12px 28px', background: COR, color: '#fff',
    border: 'none', borderRadius: 20, fontSize: 15, cursor: 'pointer',
  },
  vazio: { textAlign: 'center', padding: 60 },
}
