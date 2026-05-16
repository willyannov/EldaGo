import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { buscarPedidosPorMesa, buscarStatusPedido } from '../services/api'

const COR = '#D81B60'

const STATUS_LABEL = { pendente: 'Recebido', em_preparo: 'Em preparo', pronto: 'Pronto!', entregue: 'Entregue' }
const STATUS_COR = {
  pendente:   { bg: '#FCE4EC', text: '#880E4F' },
  em_preparo: { bg: '#FFF8E1', text: '#7A5C00' },
  pronto:     { bg: '#DCFCE7', text: '#0F5132' },
  entregue:   { bg: '#E5E5E5', text: '#3A3A3A' },
}

export default function AcompanharDrawer({ isOpen, onClose, mesa, onPedidosVazios }) {
  const [pedidos, setPedidos] = useState(null)
  const [erro, setErro] = useState(false)
  const [expandidos, setExpandidos] = useState({})

  useEffect(() => {
    if (!isOpen) return
    setErro(false)
    setPedidos(null)
    setExpandidos({})
    let ativo = true

    if (mesa) {
      async function carregar() {
        if (!ativo) return
        try {
          const data = await buscarPedidosPorMesa(mesa)
          if (!ativo) return
          setPedidos(data)
          if (data.length === 0) { setErro(true); onPedidosVazios?.() }
        } catch {
          if (ativo) setErro(true)
        }
      }
      carregar()
      const intervalo = setInterval(carregar, 3000)
      return () => { ativo = false; clearInterval(intervalo) }
    } else {
      async function carregarSemMesa() {
        if (!ativo) return
        const salvos = JSON.parse(localStorage.getItem('eldago_pedidos_sem_mesa') || '[]')
        if (salvos.length === 0) {
          if (ativo) { setErro(true); onPedidosVazios?.() }
          return
        }
        const atualizados = await Promise.all(
          salvos.map(async p => {
            try {
              const s = await buscarStatusPedido(p.codigo)
              return { ...p, status: s.status }
            } catch { return p }
          })
        )
        if (!ativo) return
        const ativos = atualizados.filter(p => p.status !== 'entregue')
        localStorage.setItem('eldago_pedidos_sem_mesa', JSON.stringify(ativos))
        // Normaliza para o mesmo shape que buscarPedidosPorMesa retorna
        setPedidos(atualizados.map(p => ({
          codigo: p.codigo,
          status: p.status,
          criado_em: p.criadoEm,
          numero_mesa: null,
          itens_pedido: p.itens.map(item => ({
            produtos: { nome: item.nome, preco: item.preco },
            quantidade: item.quantidade,
            comentario: null,
          })),
        })))
        if (ativos.length === 0) onPedidosVazios?.()
      }
      carregarSemMesa()
      const intervalo = setInterval(carregarSemMesa, 3000)
      return () => { ativo = false; clearInterval(intervalo) }
    }
  }, [isOpen, mesa])

  useEffect(() => {
    if (!isOpen) return
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  function toggle(codigo) {
    setExpandidos(prev => ({ ...prev, [codigo]: !prev[codigo] }))
  }

  const pronto = pedidos && pedidos.length > 0 && pedidos.some(p => p.status === 'pronto')

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="acompanhar-titulo"
          style={d.drawer}
        >
          <header style={d.header}>
            <button style={d.btnBack} onClick={onClose} aria-label="Fechar">
              <ChevronDown size={26} strokeWidth={2} aria-hidden="true" />
            </button>
            <h2 id="acompanhar-titulo" style={d.titulo}>Mesa {mesa}</h2>
          </header>

          <div style={d.conteudo}>
            {!pedidos ? (
              <div style={d.centro}>
                <div style={d.skeleton} />
                <div style={{ ...d.skeleton, width: '60%', height: 16 }} />
              </div>
            ) : erro ? (
              <div style={d.centro}>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#3D3D3D', margin: '0 0 6px' }}>Nenhum pedido ativo</p>
                <p style={{ fontSize: 13, color: '#717171', margin: 0 }}>Seus pedidos já foram entregues.</p>
              </div>
            ) : (
              <>
                {pronto && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={d.prontoAlert}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: COR }}>Pedido pronto!</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#555' }}>Retire no balcão</p>
                    </div>
                  </motion.div>
                )}

                <div style={d.lista}>
                  {pedidos.map(p => {
                    const aberto = expandidos[p.codigo]
                    const itens = p.itens_pedido || []
                    const totalPedido = itens.reduce((s, item) =>
                      s + (item.produtos?.preco || 0) * item.quantidade, 0
                    )
                    return (
                      <div key={p.codigo} style={d.pedidoCard}>
                        <button
                          style={d.pedidoHeader}
                          onClick={() => toggle(p.codigo)}
                          aria-expanded={!!aberto}
                          aria-controls={`pedido-itens-${p.codigo}`}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={d.codigo}>{p.codigo}</span>
                            <span style={d.pedidoSubtotal}>
                              R$ {totalPedido.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              ...d.statusPill,
                              background: STATUS_COR[p.status].bg,
                              color: STATUS_COR[p.status].text,
                            }}>
                              {STATUS_LABEL[p.status]}
                            </span>
                            <motion.span
                              animate={{ rotate: aberto ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              style={{ display: 'flex', color: '#AAAAAA' }}
                              aria-hidden="true"
                            >
                              <ChevronDown size={16} />
                            </motion.span>
                          </div>
                        </button>

                        <AnimatePresence initial={false}>
                          {aberto && (
                            <motion.div
                              id={`pedido-itens-${p.codigo}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={d.itensLista}>
                                {itens.map((item, i) => {
                                  const nome = item.produtos?.nome || 'Produto'
                                  const preco = item.produtos?.preco
                                  const subtotal = preco ? preco * item.quantidade : null
                                  return (
                                    <div key={i} style={d.itemLinha}>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <span style={d.itemNome}>
                                          {nome}
                                          <span style={d.itemQtd}> × {item.quantidade}</span>
                                        </span>
                                        {item.comentario && (
                                          <span style={d.itemComentario}>{item.comentario}</span>
                                        )}
                                      </div>
                                      {subtotal && (
                                        <span style={d.itemPreco}>
                                          R$ {subtotal.toFixed(2).replace('.', ',')}
                                        </span>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>

                <div style={{ height: 70 }} />
              </>
            )}
          </div>

          {/* Rodapé fixo com total geral */}
          {pedidos && !erro && pedidos.length > 0 && (
            <div style={d.rodape}>
              <div>
                <span style={d.rodapeLabel}>Total Geral</span>
                <span style={d.rodapeItens}>
                  {' '}· {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'}
                </span>
              </div>
              <span style={d.rodapeValor}>
                R$ {pedidos.reduce((total, p) =>
                  total + (p.itens_pedido || []).reduce((s, item) =>
                    s + (item.produtos?.preco || 0) * item.quantidade, 0
                  ), 0
                ).toFixed(2).replace('.', ',')}
              </span>
            </div>
          )}
        </motion.div>
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
  header: {
    background: '#FFFBF9', display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 16px', borderBottom: '1px solid #f0f0f0', flexShrink: 0,
  },
  btnBack: {
    background: 'none', border: 'none', cursor: 'pointer', color: '#3D3D3D',
    display: 'flex', alignItems: 'center', padding: 0,
  },
  titulo: { margin: 0, fontSize: 18, fontWeight: '700', color: '#3D3D3D' },
  conteudo: {
    flex: 1, overflowY: 'auto', padding: 16,
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  centro: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 40,
  },
  prontoAlert: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: '#FCE4EC', borderRadius: 12, padding: '14px 16px',
  },
  lista: { display: 'flex', flexDirection: 'column', gap: 8 },
  pedidoCard: {
    background: '#FFFBF9', border: '1px solid #f0f0f0',
    borderRadius: 12, overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(216,27,96,0.07), 0 1px 3px rgba(0,0,0,0.05)',
  },
  pedidoHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', border: 'none', background: 'none',
    padding: '14px 16px', cursor: 'pointer',
    fontFamily: 'inherit', WebkitTapHighlightColor: 'transparent',
  },
  codigo: { fontSize: 16, fontWeight: 800, color: '#3D3D3D', letterSpacing: 1 },
  pedidoSubtotal: { fontSize: 13, fontWeight: 700, color: COR },
  statusPill: {
    fontSize: 13, fontWeight: 700, padding: '5px 12px', borderRadius: 20,
  },
  itensLista: {
    borderTop: '1px solid #f0f0f0',
    padding: '10px 16px 14px',
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  itemLinha: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    gap: 8,
  },
  itemNome: { fontSize: 14, color: '#3D3D3D' },
  itemQtd: { color: COR, fontWeight: 700 },
  itemPreco: {
    fontSize: 13, fontWeight: 600, color: '#3D3D3D',
    flexShrink: 0, textAlign: 'right',
  },
  itemComentario: {
    fontSize: 13, color: '#5A5A5A', fontStyle: 'italic',
    display: 'block', marginTop: 2,
  },
  totalLinha: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 8, paddingTop: 10, borderTop: '1px solid #f0f0f0',
  },
  totalLabel: { fontSize: 14, fontWeight: 600, color: '#3D3D3D' },
  totalValor: { fontSize: 16, fontWeight: 700, color: COR },
  rodape: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    background: '#FFFBF9', borderTop: '1px solid #f0f0f0',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
    padding: '14px 16px', zIndex: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  rodapeLabel: { fontSize: 18, fontWeight: 700, color: '#3D3D3D' },
  rodapeItens: { fontSize: 13, color: '#717171', fontWeight: 400 },
  rodapeValor: { fontSize: 20, fontWeight: 700, color: COR },
  skeleton: {
    height: 20, borderRadius: 8, width: '100%', maxWidth: 260,
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
  },
}
