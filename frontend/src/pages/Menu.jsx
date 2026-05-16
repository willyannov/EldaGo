import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getCategorias, getProdutos } from '../services/api'
import ListaCategoria from '../components/ListaCategoria'
import CardProduto from '../components/CardProduto'
import BottomNav from '../components/BottomNav'
import SacolaDrawer from '../components/SacolaDrawer'
import AcompanharDrawer from '../components/AcompanharDrawer'
import { SkeletonList, SkeletonBanner, SkeletonDestaques } from '../components/Skeleton'

const BANNER_FALLBACK = 'https://placehold.co/480x160/D81B60/ffffff?text=Elda+Bolos+e+Doces'
const TABS_H = 50

// Grid base de 6 colunas — cada item recebe span proporcional ao layout
// n=1→6, n=2→3, n=3→2, n=4→3, n=5→2(×3)+3(×2), n=6→2
function getSpan(index, total) {
  if (total <= 1) return 6
  if (total === 2) return 3
  if (total === 3) return 2
  if (total === 4) return 3
  if (total === 5) return index < 2 ? 3 : 2  // primeira linha: 2 itens largos; segunda: 3 itens menores
  return 2 // total === 6
}

// ─── Seção Destaques ─────────────────────────────────────────────────────────
function Destaques({ produtos }) {
  const navigate = useNavigate()
  const itens = produtos.filter(p => p.destaque && p.disponivel !== false).slice(0, 6)
  if (itens.length === 0) return null

  return (
    <section style={ds.section}>
      <h2 style={ds.titulo}>Destaques</h2>
      <div style={ds.grid}>
        {itens.map((p, i) => (
          <motion.button
            key={p.id}
            type="button"
            whileTap={{ scale: 0.93, opacity: 0.85 }}
            transition={{ duration: 0.1 }}
            style={{ ...ds.card, gridColumn: `span ${getSpan(i, itens.length)}` }}
            onClick={() => navigate(`/produto/${p.id}`)}
          >
            <div style={ds.fotoBox}>
              <img
                src={p.foto_url}
                alt={p.nome}
                style={ds.foto}
                onError={e => { e.target.style.display = 'none' }}
              />
            </div>
            <div style={ds.cardInfo}>
              <span style={ds.preco}>
                R$ {Number(p.preco).toFixed(2).replace('.', ',')}
              </span>
              <span style={ds.nome}>{p.nome}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  )
}

const COR = '#D81B60'

const ds = {
  section: { padding: '4px 0 8px' },
  titulo: {
    padding: '16px 16px 12px',
    fontSize: 18, fontWeight: '700', color: '#3D3D3D', margin: 0,
    fontFamily: 'Fraunces, serif',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: 10,
    padding: '0 16px',
  },
  card: {
    cursor: 'pointer',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    borderRadius: 10,
    overflow: 'hidden',
    background: '#FFFBF9',
    boxShadow: '0 2px 8px rgba(216,27,96,0.07), 0 1px 3px rgba(0,0,0,0.05)',
    border: 'none',
    padding: 0,
    textAlign: 'left',
    fontFamily: 'inherit',
  },
  fotoBox: {
    width: '100%',
    aspectRatio: '1 / 1',
    overflow: 'hidden',
    background: '#f0f0f0',
  },
  foto: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  cardInfo: {
    padding: '6px 8px 8px',
    display: 'flex', flexDirection: 'column', gap: 2,
  },
  preco: { fontSize: 12, fontWeight: '700', color: COR },
  nome: {
    fontSize: 12, color: '#3D3D3D', lineHeight: 1.3,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
}

// ─── Menu principal ───────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export default function Menu() {
  const [searchParams] = useSearchParams()
  const [mesa, setMesa] = useState(() => sessionStorage.getItem('eldago_mesa'))

  useEffect(() => {
    const m = searchParams.get('mesa')
    if (m) {
      sessionStorage.setItem('eldago_mesa', m)
      setMesa(m)
    }
  }, [searchParams])
  const [categorias, setCategorias] = useState([])
  const [produtos, setProdutos] = useState([])
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null)
  const [buscaInput, setBuscaInput] = useState('')
  const [busca, setBusca] = useState('')
  const [carrinho, setCarrinho] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('eldago_carrinho') || '{}') } catch { return {} }
  })
  const [carregando, setCarregando] = useState(true)
  const [bannerUrl, setBannerUrl] = useState(null)
  const [sacolaAberta, setSacolaAberta] = useState(false)
  const [acompanharAberto, setAcompanharAberto] = useState(false)
  const [temPedidosAtivos, setTemPedidosAtivos] = useState(() =>
    sessionStorage.getItem('eldago_tem_pedidos') === '1'
  )


  const sectionRefs = useRef({})
  const scrollingTo = useRef(false)

  useEffect(() => {
    fetch(`${BASE_URL}/api/admin/banner`)
      .then(r => r.json())
      .then(d => {
        const src = d.url || BANNER_FALLBACK
        // Pré-carrega a imagem antes de exibir — sem flash
        const img = new Image()
        img.onload = () => setBannerUrl(src)
        img.onerror = () => setBannerUrl(BANNER_FALLBACK)
        img.src = src
      })
      .catch(() => setBannerUrl(BANNER_FALLBACK))
  }, [])

  useEffect(() => {
    Promise.all([getCategorias(), getProdutos()])
      .then(([cats, prods]) => {
        setCategorias(cats)
        setProdutos(prods)
        if (cats.length > 0) setCategoriaSelecionada(cats[0].id)
        setCarregando(false)
      })
  }, [])

  useEffect(() => {
    sessionStorage.setItem('eldago_carrinho', JSON.stringify(carrinho))
  }, [carrinho])

  useEffect(() => {
    if (!sacolaAberta) {
      setTemPedidosAtivos(sessionStorage.getItem('eldago_tem_pedidos') === '1')
    }
  }, [sacolaAberta])

  useEffect(() => {
    const t = setTimeout(() => setBusca(buscaInput), 300)
    return () => clearTimeout(t)
  }, [buscaInput])

  useEffect(() => {
    if (categorias.length === 0) return
    function onScroll() {
      if (scrollingTo.current) return
      let ativaId = categorias[0].id
      for (const cat of categorias) {
        const el = sectionRefs.current[cat.id]
        if (!el) continue
        if (el.getBoundingClientRect().top <= TABS_H + 16) ativaId = cat.id
      }
      setCategoriaSelecionada(ativaId)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [categorias])

  function scrollParaCategoria(categoriaId) {
    const el = sectionRefs.current[categoriaId]
    if (!el) return
    setCategoriaSelecionada(categoriaId)
    scrollingTo.current = true
    const top = el.getBoundingClientRect().top + window.scrollY - TABS_H
    window.scrollTo({ top, behavior: 'smooth' })
    setTimeout(() => { scrollingTo.current = false }, 900)
  }

  function adicionarAoCarrinho(produto, quantidade, comentario) {
    setCarrinho(prev => ({
      ...prev,
      [produto.id]: { produto, quantidade, comentario },
    }))
  }

  const porCategoria = categorias.map(cat => ({
    ...cat,
    itens: produtos.filter(p => p.categoria_id === cat.id && p.disponivel !== false),
  })).filter(cat => cat.itens.length > 0)

  function normalizar(txt) {
    return txt.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  }

  const resultadoBusca = busca.trim()
    ? produtos.filter(p =>
        p.disponivel !== false &&
        (normalizar(p.nome).includes(normalizar(busca)) ||
         normalizar(p.descricao || '').includes(normalizar(busca)))
      )
    : []

  return (
    <div style={styles.container}>
      <h1 className="sr-only">Cardápio Elda Bolos e Doces</h1>

      {/* Banner */}
      <div style={styles.bannerWrapper}>
        {bannerUrl
          ? <img src={bannerUrl} alt="Elda Bolos e Doces" style={styles.banner} />
          : <SkeletonBanner />
        }
      </div>

      {/* Badge de mesa */}
      {mesa && (
        <div style={styles.mesaBadge}>
          <span style={styles.mesaTexto}>Mesa {mesa}</span>
        </div>
      )}

      {/* Busca */}
      <div style={styles.buscaWrapper}>
        <label htmlFor="eldago-busca" className="sr-only">Buscar no cardápio</label>
        <motion.div
          style={styles.buscaInner}
          whileTap={{ scale: 0.99 }}
        >
          <span style={styles.buscaIcone} aria-hidden="true">🔍</span>
          <input
            id="eldago-busca"
            style={styles.buscaInput}
            placeholder="Buscar no cardápio"
            value={buscaInput}
            onChange={e => setBuscaInput(e.target.value)}
          />
          {buscaInput && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              style={styles.buscaLimpar}
              onClick={() => { setBuscaInput(''); setBusca('') }}
              aria-label="Limpar busca"
            >
              ✕
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Abas sticky */}
      {!buscaInput && (
        <ListaCategoria
          categorias={porCategoria}
          selecionada={categoriaSelecionada}
          onSelecionar={scrollParaCategoria}
        />
      )}

      {/* Conteúdo */}
      <main id="conteudo-principal" style={styles.lista}>
        {buscaInput ? (
          carregando ? (
            <SkeletonList count={4} />
          ) : resultadoBusca.length === 0 ? (
            <p style={styles.msg}>Nenhum produto encontrado.</p>
          ) : (
            resultadoBusca.map(produto => (
              <CardProduto
                key={produto.id}
                produto={produto}
                quantidade={carrinho[produto.id]?.quantidade || 0}
                onAdicionar={adicionarAoCarrinho}
              />
            ))
          )
        ) : carregando ? (
          <>
            <SkeletonDestaques />
            <div style={styles.divisor} />
            <SkeletonList count={5} />
          </>
        ) : (
          <>
            {/* Seção destaques no topo */}
            <Destaques produtos={produtos} />

            {/* Divisor sutil antes das categorias */}
            <div style={styles.linhaFina} />

            {/* Seções por categoria */}
            {porCategoria.map(cat => (
              <section
                key={cat.id}
                ref={el => { sectionRefs.current[cat.id] = el }}
              >
                <h2 style={styles.tituloCategoria}>{cat.nome}</h2>
                <div style={styles.linhaFina} />
                {cat.itens.map(produto => (
                  <CardProduto
                    key={produto.id}
                    produto={produto}
                    quantidade={carrinho[produto.id]?.quantidade || 0}
                    onAdicionar={adicionarAoCarrinho}
                  />
                ))}
              </section>
            ))}
          </>
        )}
      </main>

      <BottomNav
        carrinho={carrinho}
        onAbrirSacola={() => setSacolaAberta(true)}
        mesa={mesa}
        temPedidosAtivos={temPedidosAtivos}
        onAbrirAcompanhar={() => setAcompanharAberto(true)}
      />
      <SacolaDrawer
        isOpen={sacolaAberta}
        onClose={() => setSacolaAberta(false)}
        carrinho={carrinho}
        setCarrinho={setCarrinho}
      />
      <AcompanharDrawer
        isOpen={acompanharAberto}
        onClose={() => setAcompanharAberto(false)}
        mesa={mesa}
        onPedidosVazios={() => setTemPedidosAtivos(false)}
      />
    </div>
  )
}

const styles = {
  container: {
    maxWidth: 480,
    margin: '0 auto',
    minHeight: '100vh',
    background: '#FFFBF9',
    paddingBottom: 72,
  },
  bannerWrapper: { width: '100%', height: 160, overflow: 'hidden' },
  banner: { width: '100%', height: '100%', objectFit: 'cover' },
  mesaBadge: { display: 'flex', justifyContent: 'center', padding: '8px 16px 0', background: '#FFFBF9' },
  mesaTexto: { fontSize: 13, fontWeight: '700', color: COR, background: '#FCE4EC', padding: '4px 14px', borderRadius: 20, letterSpacing: 0.3 },
  buscaWrapper: { padding: '12px 16px', background: '#FFFBF9' },
  buscaInner: {
    display: 'flex', alignItems: 'center',
    background: '#F5EDE8', borderRadius: 12,
    padding: '10px 14px', gap: 8,
  },
  buscaIcone: { fontSize: 16, opacity: 0.45 },
  buscaInput: {
    border: 'none', background: 'none', outline: 'none',
    fontSize: 14, color: '#3D3D3D', width: '100%',
  },
  buscaLimpar: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#aaa', fontSize: 14, padding: 0, flexShrink: 0,
    WebkitTapHighlightColor: 'transparent',
  },
  divisor: {
    height: 8,
    background: '#F5F5F5',
    margin: '8px 0 0',
  },
  tituloCategoria: {
    padding: '20px 16px 8px',
    fontSize: 20, fontWeight: '700', color: '#3D3D3D', margin: 0,
    fontFamily: 'Fraunces, serif',
  },
  linhaFina: {
    height: 1,
    background: '#f0f0f0',
    margin: '0 0 0',
  },
  lista: {},
  msg: { textAlign: 'center', color: '#5A5A5A', padding: '40px 16px', fontSize: 14 },
}
