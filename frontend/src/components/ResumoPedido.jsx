import { motion, AnimatePresence } from 'framer-motion'

export default function ResumoPedido({ carrinho, onAbrirSacola }) {
  const totalItens = Object.values(carrinho).reduce((acc, item) => acc + item.quantidade, 0)
  const totalPreco = Object.values(carrinho).reduce(
    (acc, item) => acc + item.produto.preco * item.quantidade,
    0
  )

  return (
    <AnimatePresence>
      {totalItens > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          style={styles.barra}
        >
          <div role="status" aria-live="polite" style={styles.inner}>
            <div style={styles.info}>
              <span style={styles.label}>Total</span>
              <div style={styles.valorRow}>
                <span style={styles.valor}>R$ {totalPreco.toFixed(2).replace('.', ',')}</span>
                <span style={styles.itens}> / {totalItens} {totalItens === 1 ? 'item' : 'itens'}</span>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.1 }}
              style={styles.btn}
              onClick={onAbrirSacola}
            >
              Ver sacola
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const styles = {
  barra: {
    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
    display: 'flex', justifyContent: 'center',
    background: 'transparent', pointerEvents: 'none',
  },
  inner: {
    pointerEvents: 'auto', width: '100%', maxWidth: 480,
    background: '#fff', borderTop: '1px solid #f0f0f0',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
    padding: '14px 16px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
  },
  info: { display: 'flex', flexDirection: 'column', gap: 2 },
  label: { fontSize: 13, color: '#5A5A5A', fontWeight: '400' },
  valorRow: { display: 'flex', alignItems: 'baseline', gap: 0 },
  valor: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  itens: { fontSize: 14, color: '#5A5A5A', fontWeight: '400' },
  btn: {
    background: '#D81B60', color: '#fff', border: 'none',
    borderRadius: 12, padding: '14px 28px',
    fontSize: 15, fontWeight: '700', cursor: 'pointer',
    flexShrink: 0, whiteSpace: 'nowrap',
  },
}
