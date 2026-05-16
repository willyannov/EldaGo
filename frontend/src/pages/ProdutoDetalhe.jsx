import { useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageVariants, pageTransition } from '../animations'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export default function ProdutoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [produto, setProduto] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [quantidade, setQuantidade] = useState(1)
  const [comentario, setComentario] = useState('')
  const [adicionado, setAdicionado] = useState(false)

  // Inicializa com a quantidade já no carrinho (para acumular)
  useEffect(() => {
    const carrinho = JSON.parse(sessionStorage.getItem('eldago_carrinho') || '{}')
    const itemExistente = carrinho[id]
    if (itemExistente) {
      setQuantidade(itemExistente.quantidade)
      setComentario(itemExistente.comentario || '')
    }
  }, [id])

  useEffect(() => {
    fetch(`${BASE_URL}/api/produtos/${id}`)
      .then(r => { if (!r.ok) { setNotFound(true); return null } return r.json() })
      .then(data => { if (data) setProduto(data) })
      .catch(() => setNotFound(true))
  }, [id])

  function adicionar() {
    const carrinho = JSON.parse(sessionStorage.getItem('eldago_carrinho') || '{}')
    // Substitui (a qty exibida já inclui o que estava antes)
    carrinho[produto.id] = { produto, quantidade, comentario }
    sessionStorage.setItem('eldago_carrinho', JSON.stringify(carrinho))
    setAdicionado(true)
    setTimeout(() => navigate(-1), 800)
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#fff', padding: 24 }}>
        <span style={{ fontSize: 48 }}>🍰</span>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>Produto não encontrado</p>
        <p style={{ fontSize: 13, color: '#717171', margin: 0 }}>Este produto não está disponível no momento.</p>
        <button onClick={() => navigate('/')} style={{ marginTop: 8, padding: '10px 24px', background: '#D81B60', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          Ver cardápio
        </button>
      </div>
    )
  }

  if (!produto) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        style={styles.loading}
      >
        <div style={styles.skeletoFoto} />
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ ...styles.skeletoBone, width: '60%', height: 22 }} />
          <div style={{ ...styles.skeletoBone, width: '90%', height: 14 }} />
          <div style={{ ...styles.skeletoBone, width: '40%', height: 14 }} />
          <div style={{ ...styles.skeletoBone, width: '30%', height: 20, marginTop: 8 }} />
        </div>
      </motion.div>
    )
  }

  const total = (produto.preco * quantidade).toFixed(2).replace('.', ',')

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      style={styles.container}
    >
      {/* Header com foto */}
      <div style={styles.fotoWrapper}>
        {produto.foto_url ? (
          <img src={produto.foto_url} alt={produto.nome} style={styles.foto} />
        ) : (
          <div style={styles.fotoPlaceholder} />
        )}
        <button style={styles.btnVoltar} onClick={() => navigate(-1)} aria-label="Voltar">
          <ChevronLeft size={24} color={COR} strokeWidth={2.5} aria-hidden="true" />
        </button>
        <div style={styles.tituloFoto}>{produto.nome.toUpperCase()}</div>
      </div>

      {/* Conteúdo */}
      <div style={styles.conteudo}>
        <h1 style={styles.nome}>{produto.nome}</h1>
        {produto.descricao && <p style={styles.descricao}>{produto.descricao}</p>}
        {/*produto.porcoes && (
          <p style={styles.porcoes}>
            👤 Serve {produto.porcoes} {produto.porcoes === 1 ? 'pessoa' : 'pessoas'}
          </p>
        )*/}
        <p style={styles.preco}>R$ {Number(produto.preco).toFixed(2).replace('.', ',')}</p>

        {/* Info loja */}
        {/*<div style={styles.lojaBar}>
          /<span>🏪 Elda Bolos e Doces</span>
          <span style={styles.estrela}>★ 4,9</span>
        </div>
        <div style={styles.tempoBar}>0-30 min</div>

        {/* Comentário */}
        <div style={styles.comentarioSection}>
          <div style={styles.comentarioHeader}>
            <label htmlFor="comentario" style={styles.comentarioLabel}>Algum comentário?</label>
            <span id="comentario-contador" style={styles.comentarioCount}>{comentario.length} / 140</span>
          </div>
          <textarea
            id="comentario"
            aria-describedby="comentario-contador"
            style={styles.comentarioInput}
            placeholder="Ex: sem açúcar, embrulhar para presente..."
            maxLength={140}
            value={comentario}
            onChange={e => setComentario(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* Rodapé: quantidade + botão */}
      <div style={styles.rodape}>
        <div style={styles.qtdPill}>
          <motion.button
            whileTap={quantidade > 1 ? { scale: 0.85 } : {}}
            style={quantidade === 1 ? styles.btnQtdDesabilitado : styles.btnQtd}
            onClick={() => setQuantidade(q => Math.max(1, q - 1))}
            disabled={quantidade === 1}
          >
            −
          </motion.button>
          <span style={styles.qtdNum}>{quantidade}</span>
          <motion.button
            whileTap={{ scale: 0.85 }}
            style={styles.btnQtd}
            onClick={() => setQuantidade(q => q + 1)}
          >
            +
          </motion.button>
        </div>
        <button
          style={adicionado ? styles.btnAdicionadoOk : styles.btnAdicionar}
          onClick={adicionar}
          disabled={adicionado}
        >
          {adicionado ? '✓ Adicionado!' : `Adicionar  R$ ${total}`}
        </button>
      </div>
    </motion.div>
  )
}

const COR = '#D81B60'

const shimmerBase = {
  borderRadius: 8,
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
  backgroundSize: '400% 100%',
}

const styles = {
  container: {
    maxWidth: 480,
    margin: '0 auto',
    minHeight: '100vh',
    background: '#FFFBF9',
    display: 'flex',
    flexDirection: 'column',
  },
  loading: {
    maxWidth: 480,
    margin: '0 auto',
    minHeight: '100vh',
    background: '#FFFBF9',
  },
  skeletoFoto: {
    ...shimmerBase,
    width: '100%',
    height: 280,
    borderRadius: 0,
  },
  skeletoBone: {
    ...shimmerBase,
  },
  fotoWrapper: {
    position: 'relative',
    width: '100%',
    height: 280,
    background: '#f5f5f5',
    flexShrink: 0,
  },
  foto: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  fotoPlaceholder: {
    width: '100%',
    height: '100%',
    background: '#FCE4EC',
  },
  btnVoltar: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: 'none',
    padding: 0,
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    WebkitTapHighlightColor: 'transparent',
  },
  tituloFoto: {
    position: 'absolute',
    top: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    textShadow: '0 1px 4px rgba(0,0,0,0.5)',
    letterSpacing: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    maxWidth: 240,
    textOverflow: 'ellipsis',
  },
  conteudo: {
    padding: '16px',
    flex: 1,
    overflowY: 'auto',
  },
  nome: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3D3D3D',
    margin: '0 0 6px',
    fontFamily: 'Fraunces, serif',
  },
  descricao: {
    fontSize: 14,
    color: '#717171',
    lineHeight: 1.5,
    margin: '0 0 6px',
  },
  porcoes: {
    fontSize: 13,
    color: '#717171',
    margin: '0 0 8px',
  },
  preco: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3D3D3D',
    margin: '0 0 16px',
  },
  lojaBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderTop: '1px solid #f0f0f0',
    borderBottom: '1px solid #f0f0f0',
    fontSize: 13,
    color: '#717171',
  },
  estrela: {
    color: '#F5A623',
    fontWeight: '600',
  },
  tempoBar: {
    fontSize: 12,
    color: '#717171',
    padding: '6px 0 16px',
  },
  comentarioSection: {
    marginTop: 8,
  },
  comentarioHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  comentarioLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3D3D3D',
  },
  comentarioCount: {
    fontSize: 12,
    color: '#717171',
  },
  comentarioInput: {
    width: '100%',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14,
    color: '#3D3D3D',
    resize: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    background: '#FFFBF9',
  },
  rodape: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderTop: '1px solid #f0f0f0',
    background: '#FFFBF9',
    position: 'sticky',
    bottom: 0,
  },
  qtdPill: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    height: 48,
    border: `1.5px solid ${COR}`,
    borderRadius: 14,
    overflow: 'hidden',
  },
  btnQtd: {
    background: 'none',
    border: 'none',
    color: COR,
    fontSize: 20,
    fontWeight: '700',
    cursor: 'pointer',
    padding: '0 18px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    WebkitTapHighlightColor: 'transparent',
  },
  btnQtdDesabilitado: {
    background: 'none',
    border: 'none',
    color: '#ccc',
    fontSize: 20,
    fontWeight: '700',
    cursor: 'not-allowed',
    padding: '0 18px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    WebkitTapHighlightColor: 'transparent',
  },
  qtdNum: {
    fontSize: 15,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
    color: COR,
  },
  btnAdicionar: {
    flex: 1,
    height: 48,
    background: COR,
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    fontSize: 16,
    fontWeight: '700',
    cursor: 'pointer',
  },
  btnAdicionadoOk: {
    flex: 1,
    height: 48,
    background: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    fontSize: 16,
    fontWeight: '700',
    cursor: 'default',
  },
}
