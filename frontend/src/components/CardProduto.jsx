import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { cardVariants, tapTransition } from '../animations'

export default function CardProduto({ produto, quantidade }) {
  const navigate = useNavigate()
  const [pressionado, setPressionado] = useState(false)

  return (
    <motion.button
      type="button"
      variants={cardVariants}
      whileTap={{ scale: 0.98 }}
      transition={tapTransition}
      style={{
        ...styles.card,
        background: pressionado ? '#FFF0E8' : '#FFFBF9',
      }}
      onTouchStart={() => setPressionado(true)}
      onTouchEnd={() => setPressionado(false)}
      onTouchCancel={() => setPressionado(false)}
      onMouseDown={() => setPressionado(true)}
      onMouseUp={() => setPressionado(false)}
      onMouseLeave={() => setPressionado(false)}
      onClick={() => navigate(`/produto/${produto.id}`)}
    >
      <div style={styles.info}>
        {produto.destaque && (
          <span style={styles.badgeDestaque}>Destaque</span>
        )}
        <span style={styles.nome}>{produto.nome}</span>
        {produto.descricao && (
          <span style={styles.descricao}>{produto.descricao}</span>
        )}
        {/* {produto.porcoes && (
          <span style={styles.porcoes}>
            👤 Serve {produto.porcoes} {produto.porcoes === 1 ? 'pessoa' : 'pessoas'}
          </span>
        )} */}
        <span style={styles.preco}>
          R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
        </span>
      </div>

      <div style={styles.fotoSide}>
        {produto.foto_url && (
          <div style={styles.fotoWrapper}>
            <img
              src={produto.foto_url}
              alt={produto.nome}
              style={styles.foto}
              onError={e => { e.target.style.display = 'none' }}
            />
          </div>
        )}
        {quantidade > 0 && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={styles.badge}
            aria-hidden="true"
          >
            {quantidade}
          </motion.div>
        )}
        {quantidade > 0 && (
          <span className="sr-only">{quantidade} {quantidade === 1 ? 'unidade' : 'unidades'} no carrinho</span>
        )}
      </div>
    </motion.button>
  )
}

const COR = '#D81B60'

const styles = {
  card: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer',
    gap: 12,
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    transition: 'background 0.15s ease',
    width: '100%',
    border: 'none',
    textAlign: 'left',
    fontFamily: 'inherit',
  },
  info: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  nome: { fontSize: 15, fontWeight: '600', color: '#3D3D3D', lineHeight: 1.3 },
  descricao: {
    fontSize: 13, color: '#717171', lineHeight: 1.4,
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  porcoes: { fontSize: 12, color: '#717171', marginTop: 2 },
  preco: { fontSize: 14, fontWeight: '700', color: '#3D3D3D', marginTop: 4 },
  fotoSide: { position: 'relative', flexShrink: 0 },
  fotoWrapper: {
    width: 96, height: 96,
    borderRadius: 10, overflow: 'hidden', background: '#f5f5f5',
  },
  foto: { width: '100%', height: '100%', objectFit: 'cover' },
  badge: {
    position: 'absolute',
    bottom: -6, right: -6,
    minWidth: 20, height: 20,
    background: COR, color: '#fff',
    borderRadius: 10, fontSize: 11, fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 5px', border: '2px solid #FFFBF9',
  },
  badgeDestaque: {
    alignSelf: 'flex-start',
    fontSize: 10, fontWeight: '700',
    color: COR, background: '#FCE4EC',
    padding: '2px 8px', borderRadius: 20,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
}
