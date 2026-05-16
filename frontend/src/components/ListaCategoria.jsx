import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function ListaCategoria({ categorias, selecionada, onSelecionar }) {
  const tabRefs = useRef({})
  const barraRef = useRef(null)

  useEffect(() => {
    if (!selecionada || !barraRef.current) return
    const btn = tabRefs.current[selecionada]
    if (!btn) return
    const barra = barraRef.current
    const target = btn.offsetLeft - barra.offsetWidth / 2 + btn.offsetWidth / 2
    barra.scrollTo({ left: target, behavior: 'smooth' })
  }, [selecionada])

  return (
    <div style={styles.wrapper}>
      <div ref={barraRef} role="tablist" aria-label="Categorias do cardápio" style={styles.container}>
        {categorias.map(cat => {
          const ativa = selecionada === cat.id
          return (
            <motion.button
              key={cat.id}
              ref={el => { tabRefs.current[cat.id] = el }}
              role="tab"
              aria-selected={ativa}
              whileTap={{ scale: 0.94, backgroundColor: '#FCE4EC' }}
              transition={{ duration: 0.1 }}
              style={ativa ? styles.abaAtiva : styles.aba}
              onClick={() => onSelecionar(cat.id)}
            >
              {cat.nome}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

const COR = '#D81B60'

const styles = {
  wrapper: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    background: '#FFFBF9',
    borderBottom: '1px solid #f0f0f0',
    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
  },
  container: {
    display: 'flex',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    padding: '0 8px',
  },
  aba: {
    flexShrink: 0,
    padding: '13px 16px',
    border: 'none',
    borderBottom: '2px solid transparent',
    background: 'none',
    color: '#717171',
    fontSize: 15,
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    WebkitTapHighlightColor: 'transparent',
    transition: 'color 0.2s, border-color 0.2s',
  },
  abaAtiva: {
    flexShrink: 0,
    padding: '13px 16px',
    border: 'none',
    borderBottom: `2px solid ${COR}`,
    background: 'none',
    color: COR,
    fontSize: 15,
    fontWeight: '700',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    WebkitTapHighlightColor: 'transparent',
  },
}
