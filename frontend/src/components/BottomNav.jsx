import { ShoppingBag, ClipboardList } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AcessibilidadeWidget from './AcessibilidadeWidget'

const COR = '#D81B60'

export default function BottomNav({ carrinho, onAbrirSacola, mesa, temPedidosAtivos, onAbrirAcompanhar }) {
  const totalItens = Object.values(carrinho).reduce((acc, item) => acc + item.quantidade, 0)
  const totalPreco = Object.values(carrinho).reduce(
    (acc, item) => acc + item.produto.preco * item.quantidade,
    0
  )
  const temPedidosSemMesa = JSON.parse(localStorage.getItem('eldago_pedidos_sem_mesa') || '[]')
    .some(p => p.status !== 'entregue')
  const acompanharAtivo = !!(mesa && temPedidosAtivos) || (!mesa && temPedidosSemMesa)

  return (
    <nav style={s.barra} aria-label="Navegação principal">
      <div style={s.inner}>

        {/* Pedidos */}
        <button
          style={{ ...s.tab, ...(!acompanharAtivo ? s.tabDesabilitado : {}) }}
          onClick={acompanharAtivo ? onAbrirAcompanhar : undefined}
          disabled={!acompanharAtivo}
          aria-label={acompanharAtivo ? 'Acompanhar pedido' : 'Nenhum pedido ativo'}
        >
          <div style={s.tabIcone}>
            {acompanharAtivo && <span style={s.dot} aria-hidden="true" />}
            <ClipboardList size={22} aria-hidden="true" />
          </div>
          <span style={s.tabLabel}>Pedidos</span>
        </button>

        {/* Sacola */}
        <button
          style={totalItens > 0 ? s.sacolaAtiva : s.tab}
          onClick={onAbrirSacola}
          aria-label={totalItens > 0
            ? `Ver sacola, ${totalItens} ${totalItens === 1 ? 'item' : 'itens'}, R$ ${totalPreco.toFixed(2).replace('.', ',')}`
            : 'Sacola vazia'
          }
        >
          <AnimatePresence mode="wait">
            {totalItens > 0 ? (
              <motion.div
                key="cheio"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                style={s.sacolaConteudo}
                aria-live="polite"
              >
                <span style={s.sacolaTotal}>
                  R$ {totalPreco.toFixed(2).replace('.', ',')}
                </span>
                <span style={s.sacolaBadge}>{totalItens}</span>
              </motion.div>
            ) : (
              <motion.div
                key="vazio"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={s.tabVazio}
              >
                <ShoppingBag size={22} aria-hidden="true" />
                <span style={s.tabLabel}>Sacola</span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Acessibilidade */}
        <AcessibilidadeWidget />

      </div>
    </nav>
  )
}

const s = {
  barra: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    pointerEvents: 'none',
  },
  inner: {
    pointerEvents: 'auto',
    maxWidth: 480,
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '14px 16px',
    background: '#FFFBF9',
    borderTop: '1.5px solid #f0f0f0',
    gap: 8,
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#5A5A5A',
    padding: '4px 12px',
    borderRadius: 10,
    fontFamily: 'inherit',
    WebkitTapHighlightColor: 'transparent',
    minWidth: 64,
  },
  tabDesabilitado: {
    opacity: 0.3,
    cursor: 'default',
  },
  tabIcone: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 1,
  },
  tabVazio: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    color: '#5A5A5A',
  },
  dot: {
    position: 'absolute',
    top: -3,
    right: -5,
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#27ae60',
    border: '1.5px solid #FFFBF9',
  },
  sacolaAtiva: {
    display: 'flex',
    alignItems: 'center',
    background: COR,
    border: 'none',
    cursor: 'pointer',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: 22,
    fontFamily: 'inherit',
    WebkitTapHighlightColor: 'transparent',
    minWidth: 120,
    justifyContent: 'center',
    boxShadow: '0 3px 12px rgba(216,27,96,0.30)',
  },
  sacolaConteudo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  sacolaTotal: {
    fontSize: 14,
    fontWeight: '700',
  },
  sacolaBadge: {
    background: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    padding: '1px 7px',
    fontSize: 12,
    fontWeight: '700',
  },
}
