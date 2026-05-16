import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { criarPedido, getProdutos } from '../services/api'
import { Pencil, Plus, ChevronDown, Trash2 } from 'lucide-react'
import { SkeletonItemSacola, SkeletonCarrossel, SkeletonRodape } from './Skeleton'

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
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 122 }}
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
                  <motion.button whileTap={{ scale: 0.88 }} style={c.btnAdd} onClick={() => onAdicionar(p)}>
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
  wrapper: { background: '#FFFBF9', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', paddingBottom: 16 },
  titulo: { margin: 0, padding: '16px 16px 12px', fontSize: 16, fontWeight: '700', color: '#3D3D3D' },
  trilho: { display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', padding: '0 16px' },
  item: { flexShrink: 0, width: 122, display: 'flex', flexDirection: 'column', gap: 4 },
  fotoBox: { position: 'relative', width: 122, height: 122, borderRadius: 8, overflow: 'hidden', border: '1px solid #ebebeb', background: '#F5EDE8' },
  foto: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  fotoVazio: { width: '100%', height: '100%', background: '#F5EDE8' },
  btnAdd: { position: 'absolute', bottom: 6, right: 6, width: 32, height: 32, borderRadius: '50%', background: '#FFFBF9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.18)', WebkitTapHighlightColor: 'transparent' },
  preco: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  nome: { fontSize: 12, color: '#3D3D3D', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
}

export default function SacolaDrawer({ isOpen, onClose, carrinho, setCarrinho }) {
  const navigate = useNavigate()
  const drawerRef = useRef(null)
  const [enviando, setEnviando] = useState(false)
  const [codigo, setCodigo] = useState(null)
  const [erro, setErro] = useState(null)
  const [todosProdutos, setTodosProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)

  const itens = Object.values(carrinho)

  useEffect(() => {
    if (!isOpen) return
    setCarregando(true)
    setCodigo(null)
    setErro(null)
    getProdutos()
      .then(lista => setTodosProdutos(lista.filter(p => p.disponivel !== false)))
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Fecha com ESC + focus trap
  useEffect(() => {
    if (!isOpen) return
    const el = drawerRef.current
    function onKey(e) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab' || !el) return
      const focusaveis = Array.from(el.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
      )).filter(f => f.offsetParent !== null)
      if (focusaveis.length === 0) return
      const primeiro = focusaveis[0]
      const ultimo = focusaveis[focusaveis.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === primeiro) { e.preventDefault(); ultimo.focus() }
      } else {
        if (document.activeElement === ultimo) { e.preventDefault(); primeiro.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    // Move foco para o primeiro elemento focável ao abrir
    setTimeout(() => {
      const focusaveis = el?.querySelectorAll('button:not([disabled])')
      focusaveis?.[0]?.focus()
    }, 50)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

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

      if (!mesa) {
        const salvos = JSON.parse(localStorage.getItem('eldago_pedidos_sem_mesa') || '[]')
        salvos.push({
          codigo: resultado.codigo,
          criadoEm: new Date().toISOString(),
          status: 'pendente',
          itens: itens.map(item => ({
            nome: item.produto.nome,
            preco: item.produto.preco,
            quantidade: item.quantidade,
          })),
        })
        localStorage.setItem('eldago_pedidos_sem_mesa', JSON.stringify(salvos.slice(-10)))
      }

      sessionStorage.removeItem('eldago_carrinho')
      sessionStorage.setItem('eldago_tem_pedidos', '1')
      setCarrinho({})
      setCodigo(resultado.codigo)
    } catch {
      setErro('Não foi possível enviar o pedido. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sacola-titulo"
            style={d.drawer}
          >

            {/* Tela de sucesso */}
            {codigo ? (
              <div style={d.sucesso}>
                <div style={d.icone}>✓</div>
                <h2 style={d.tituloSucesso}>Pedido recebido!</h2>
                <p style={d.sub}>Seu código é</p>
                <div style={d.codigo}>{codigo}</div>
                <p style={d.instrucao}>
                  Acompanhe o status no botão Pedidos.
                </p>
                <button style={d.btnAcompanhar} onClick={onClose}>
                  Fechar
                </button>
              </div>
            ) : (
              <div style={d.conteudo}>
                {/* Header */}
                <header style={d.header}>
                  <button style={d.btnBack} onClick={onClose} aria-label="Fechar sacola">
                    <ChevronDown size={26} strokeWidth={2} aria-hidden="true" />
                  </button>
                  <h2 id="sacola-titulo" style={d.titulo}>Sua sacola</h2>
                </header>

                {/* Itens */}
                <div style={d.itensCard}>
                  <h3 style={d.secTitulo}>Itens adicionados</h3>

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
                            <div style={d.item}>
                              <div style={d.fotoWrapper}>
                                {produto.foto_url
                                  ? <img src={produto.foto_url} alt={produto.nome} style={d.itemFoto} />
                                  : <div style={d.fotoVazio} />
                                }
                                <button
                                  style={d.editBtn}
                                  onClick={() => { onClose(); navigate(`/produto/${produto.id}`) }}
                                  aria-label={`Editar ${produto.nome}`}
                                >
                                  <Pencil size={13} color="#fff" strokeWidth={2.5} aria-hidden="true" />
                                </button>
                              </div>
                              <div style={d.itemInfo}>
                                <span style={d.itemNome}>{produto.nome}</span>
                                {(produto.descricao || comentario) && (
                                  <span style={d.itemDesc}>
                                    {comentario || (produto.descricao || '').slice(0, 150)}
                                  </span>
                                )}
                              </div>
                              <div style={d.direita}>
                                <span style={d.itemPreco}>
                                  R$ {(produto.preco * quantidade).toFixed(2).replace('.', ',')}
                                </span>
                                <div style={d.qtdPill}>
                                  <motion.button
                                    whileTap={{ scale: 0.85 }}
                                    style={d.qtdBtn}
                                    onClick={() => alterarQtd(produto.id, -1)}
                                    aria-label={quantidade === 1 ? `Remover ${produto.nome}` : `Diminuir quantidade de ${produto.nome}`}
                                  >
                                    {quantidade === 1 ? <Trash2 size={14} color={COR} strokeWidth={2.5} aria-hidden="true" /> : '−'}
                                  </motion.button>
                                  <span style={d.qtdNum} aria-live="polite" aria-label={`Quantidade: ${quantidade}`}>{quantidade}</span>
                                  <motion.button
                                    whileTap={{ scale: 0.85 }}
                                    style={d.qtdBtn}
                                    onClick={() => alterarQtd(produto.id, +1)}
                                    aria-label={`Aumentar quantidade de ${produto.nome}`}
                                  >
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

                  <button style={d.btnMaisItens} onClick={onClose}>
                    Adicionar mais itens
                  </button>
                </div>

                {/* Carrossel */}
                {carregando
                  ? <SkeletonCarrossel count={4} />
                  : <CarrosselProdutos produtos={produtosCarrossel} onAdicionar={adicionarDoCarrossel} />
                }

                {erro && <p style={d.erro}>{erro}</p>}

                {/* Espaço para o rodapé fixo não cobrir conteúdo */}
                <div style={{ height: 90 }} />
              </div>
            )}

            {/* Rodapé fixo dentro do drawer */}
            {!codigo && (
              carregando ? <SkeletonRodape /> : (
                <div style={d.rodape}>
                  <div style={d.totalInfo}>
                    <span style={d.totalLabel}>Total</span>
                    <div style={d.totalValorRow}>
                      <span style={d.totalValor}>R$ {totalPreco.toFixed(2).replace('.', ',')}</span>
                      <span style={d.totalItens}> / {itens.reduce((a, i) => a + i.quantidade, 0)} {itens.reduce((a, i) => a + i.quantidade, 0) === 1 ? 'item' : 'itens'}</span>
                    </div>
                  </div>
                  <button
                    style={enviando ? d.btnDesabilitado : d.btnConfirmar}
                    onClick={confirmar}
                    disabled={enviando}
                  >
                    {enviando ? 'Enviando...' : 'Confirmar pedido'}
                  </button>
                </div>
              )
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const d = {
  drawer: {
    position: 'fixed', inset: 0, zIndex: 200,
    background: '#FFF5EE',
    display: 'flex', flexDirection: 'column',
    maxWidth: 480, margin: '0 auto',
    overflow: 'hidden',
  },
  conteudo: {
    flex: 1, overflowY: 'auto',
  },
  header: {
    background: '#FFFBF9', display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 16px', borderBottom: '1px solid #f0f0f0', flexShrink: 0,
  },
  btnBack: {
    background: 'none', border: 'none', cursor: 'pointer', color: '#3D3D3D',
    display: 'flex', alignItems: 'center', padding: 0,
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
    position: 'absolute', top: 4, left: 4, width: 26, height: 26, borderRadius: '50%',
    background: COR, border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.25)', WebkitTapHighlightColor: 'transparent',
  },
  itemInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 },
  itemNome: { fontSize: 14, fontWeight: '600', color: '#3D3D3D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  itemDesc: { fontSize: 12, color: '#717171', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  direita: { flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  itemPreco: { fontSize: 14, fontWeight: '700', color: COR, whiteSpace: 'nowrap' },
  qtdPill: { display: 'inline-flex', alignItems: 'center', background: '#f5f5f5', borderRadius: 20, overflow: 'hidden' },
  qtdBtn: { background: 'none', border: 'none', color: COR, fontSize: 16, fontWeight: '700', cursor: 'pointer', width: 38, padding: '5px 0', textAlign: 'center', WebkitTapHighlightColor: 'transparent', lineHeight: 1 },
  qtdNum: { fontSize: 13, fontWeight: '700', color: '#3D3D3D', minWidth: 18, textAlign: 'center' },
  btnMaisItens: { display: 'block', width: '100%', background: 'none', border: 'none', color: COR, fontSize: 15, fontWeight: '700', cursor: 'pointer', padding: '16px', textAlign: 'center', WebkitTapHighlightColor: 'transparent' },
  rodape: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    background: '#FFFBF9', borderTop: '1px solid #f0f0f0',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
    padding: '12px 16px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    zIndex: 10,
  },
  totalInfo: { display: 'flex', flexDirection: 'column', gap: 2 },
  totalLabel: { fontSize: 13, color: '#717171', fontWeight: '400' },
  totalValorRow: { display: 'flex', alignItems: 'baseline' },
  totalValor: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  totalItens: { fontSize: 14, color: '#717171', fontWeight: '400' },
  btnConfirmar: { flexShrink: 0, height: 48, padding: '0 28px', background: COR, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' },
  btnDesabilitado: { flexShrink: 0, height: 48, padding: '0 28px', background: '#ccc', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, cursor: 'not-allowed', whiteSpace: 'nowrap' },
  erro: { color: '#c0392b', textAlign: 'center', fontSize: 14, margin: '0 16px' },
  sucesso: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32, textAlign: 'center' },
  icone: { width: 64, height: 64, background: '#27ae60', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 },
  tituloSucesso: { fontSize: 24, margin: 0 },
  sub: { color: '#717171', margin: 0 },
  codigo: { fontSize: 48, fontWeight: '700', color: COR, letterSpacing: 4 },
  instrucao: { color: '#555', fontSize: 14, margin: '0 0 20px' },
  btnAcompanhar: {
    padding: '14px 32px', background: COR, color: '#fff',
    border: 'none', borderRadius: 28, fontSize: 15, fontWeight: '700',
    cursor: 'pointer', fontFamily: 'inherit',
  },
}
