import { useEffect, useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getPedidos, atualizarStatus } from '../services/api'
import {
  ShoppingBag, Package, Tag, Settings, LogOut,
  Pencil, Trash2, ImagePlus, Eye, EyeOff,
  GripVertical, MessageSquare, Star, Plus, X,
  CheckCircle2, XCircle, Info, ChevronRight,
  Save, Camera, Search,
} from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

// ─── Cores ────────────────────────────────────────────────────────────────────
const C = {
  primary:      '#D81B60',
  primaryLight: '#FCE4EC',
  sidebarBg:    '#1C1C2E',
  sidebarText:  '#E8E8F0',
  sidebarMuted: '#8888A8',
  sidebarHover: 'rgba(255,255,255,0.06)',
  sidebarActive:'rgba(216,27,96,0.18)',
  contentBg:    '#F5F5F7',
  cardBg:       '#FFFFFF',
  border:       '#EBEBEB',
  textMain:     '#1A1A1A',
  textSub:      '#717171',
  success:      '#16A34A',
  successLight: '#DCFCE7',
  error:        '#DC2626',
  errorLight:   '#FEE2E2',
  warning:      '#D97706',
  warningLight: '#FEF3C7',
  statusColors: {
    pendente:   '#E67E22',
    em_preparo: '#2980B9',
    pronto:     '#27AE60',
    entregue:   '#95A5A6',
  },
}

const STATUS_LABEL = { pendente: 'Pendente', em_preparo: 'Em preparo', pronto: 'Pronto', entregue: 'Entregue' }
const PROXIMO      = { pendente: 'em_preparo', em_preparo: 'pronto', pronto: 'entregue' }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function token() { return localStorage.getItem('eldago_admin_token') || '' }

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    ...options,
  })
  if (res.status === 401) {
    localStorage.removeItem('eldago_admin_token')
    window.location.reload()
    return null
  }
  const data = await res.json()
  if (!res.ok) throw new Error(data.erro || `Erro ${res.status}`)
  return data
}

// ─── useToast ─────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev.slice(-2), { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  return { toasts, addToast }
}

// ─── ToastContainer ───────────────────────────────────────────────────────────
function ToastContainer({ toasts }) {
  const iconMap = { success: CheckCircle2, error: XCircle, info: Info, warning: Info }
  const colorMap = {
    success: { bg: C.successLight, text: C.success, border: '#86EFAC' },
    error:   { bg: C.errorLight,   text: C.error,   border: '#FCA5A5' },
    info:    { bg: '#EFF6FF',      text: '#2563EB', border: '#BFDBFE' },
    warning: { bg: C.warningLight, text: C.warning, border: '#FDE68A' },
  }

  return (
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
      <AnimatePresence>
        {toasts.map(t => {
          const Icon = iconMap[t.type] || CheckCircle2
          const col = colorMap[t.type] || colorMap.success
          return (
            <motion.div
              key={t.id}
              initial={{ x: 340, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 340, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              style={{
                background: col.bg,
                border: `1px solid ${col.border}`,
                borderRadius: 8,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                minWidth: 260,
                maxWidth: 340,
                boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                pointerEvents: 'all',
              }}
            >
              <Icon size={18} color={col.text} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: col.text, flex: 1 }}>{t.message}</span>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// ─── Login ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    setCarregando(true)
    setErro('')
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha }),
    })
    const data = await res.json()
    setCarregando(false)
    if (!res.ok) { setErro(data.erro || 'Senha incorreta'); return }
    localStorage.setItem('eldago_admin_token', data.token)
    onLogin()
  }

  return (
    <div style={ls.page}>
      <div style={ls.card}>
        <div style={ls.logo}>E</div>
        <h2 style={ls.titulo}>EldaGo Admin</h2>
        <p style={ls.sub}>Acesso restrito</p>
        <form onSubmit={entrar} style={ls.form}>
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            style={ls.input}
            required
            autoFocus
          />
          {erro && <p style={ls.erro}>{erro}</p>}
          <button type="submit" style={ls.btn} disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

const ls = {
  page:   { minHeight: '100vh', background: '#F5F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card:   { background: '#fff', borderRadius: 16, padding: '40px 32px', width: '100%', maxWidth: 380, boxShadow: '0 4px 32px rgba(0,0,0,0.08)', textAlign: 'center' },
  logo:   { width: 56, height: 56, borderRadius: 12, background: C.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, margin: '0 auto 20px', letterSpacing: -1 },
  titulo: { fontSize: 22, fontWeight: 700, color: C.textMain, margin: '0 0 4px' },
  sub:    { fontSize: 13, color: C.textSub, margin: '0 0 28px' },
  form:   { display: 'flex', flexDirection: 'column', gap: 12 },
  input:  { padding: '12px 16px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 15, outline: 'none', textAlign: 'center', background: '#FAFAFA' },
  erro:   { color: C.error, fontSize: 13, margin: 0 },
  btn:    { padding: '13px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' },
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'pedidos',    label: 'Pedidos',       Icon: ShoppingBag },
  { id: 'produtos',   label: 'Lista de Produtos',       Icon: Package     },
  { id: 'categorias', label: 'Categorias',     Icon: Tag         },
  { id: 'config',     label: 'Configurações',  Icon: Settings    },
]

function Sidebar({ aba, setAba, novosCount, onSair }) {
  return (
    <aside style={ss.sidebar}>
      {/* Logo */}
      <div style={ss.logoArea}>
        <div style={ss.logoBox}>E</div>
        <div>
          <div style={ss.logoNome}>EldaGo</div>
          <div style={ss.logoSub}>Painel admin</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={ss.nav}>
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const ativo = aba === id
          return (
            <button
              key={id}
              style={{ ...ss.navItem, ...(ativo ? ss.navAtivo : {}) }}
              onClick={() => setAba(id)}
            >
              <Icon size={18} color={ativo ? C.primary : C.sidebarMuted} />
              <span style={{ ...ss.navLabel, color: ativo ? C.sidebarText : C.sidebarMuted }}>
                {label}
              </span>
              {id === 'pedidos' && novosCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={ss.badge}
                >
                  {novosCount}
                </motion.span>
              )}
              {ativo && <ChevronRight size={14} color={C.primary} style={{ marginLeft: 'auto', opacity: 0.7 }} />}
            </button>
          )
        })}
      </nav>

      {/* Sair */}
      <div style={ss.bottom}>
        <button style={ss.sairBtn} onClick={onSair}>
          <LogOut size={16} color={C.sidebarMuted} />
          <span style={{ color: C.sidebarMuted, fontSize: 14 }}>Sair</span>
        </button>
      </div>
    </aside>
  )
}

const ss = {
  sidebar:   { width: 220, minHeight: '100vh', background: C.sidebarBg, display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100 },
  logoArea:  { display: 'flex', alignItems: 'center', gap: 12, padding: '24px 20px 20px' },
  logoBox:   { width: 36, height: 36, borderRadius: 8, background: C.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, flexShrink: 0 },
  logoNome:  { fontSize: 15, fontWeight: 700, color: C.sidebarText, lineHeight: 1.2 },
  logoSub:   { fontSize: 11, color: C.sidebarMuted, lineHeight: 1 },
  nav:       { flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 },
  navItem:   { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'background 0.15s' },
  navAtivo:  { background: C.sidebarActive },
  navLabel:  { fontSize: 14, fontWeight: 500, flex: 1, transition: 'color 0.15s' },
  badge:     { minWidth: 20, height: 20, borderRadius: 10, background: C.primary, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' },
  bottom:    { padding: '12px 12px 24px' },
  sairBtn:   { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', width: '100%' },
}

// ─── useMobile ────────────────────────────────────────────────────────────────
function useMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    function onResize() { setIsMobile(window.innerWidth < 768) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return isMobile
}

// ─── BottomNav (mobile) ───────────────────────────────────────────────────────
const NAV_SHORT = { pedidos: 'Pedidos', produtos: 'Produtos', categorias: 'Categorias', config: 'Config' }

function BottomNav({ aba, setAba, novosCount, onSair }) {
  return (
    <nav style={bn.nav}>
      {NAV_ITEMS.map(({ id, Icon }) => {
        const ativo = aba === id
        return (
          <button key={id} style={{ ...bn.item, ...(ativo ? bn.itemAtivo : {}) }} onClick={() => setAba(id)}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={22} color={ativo ? C.primary : C.sidebarMuted} />
              {id === 'pedidos' && novosCount > 0 && (
                <span style={bn.badge}>{novosCount}</span>
              )}
            </div>
            <span style={{ ...bn.label, color: ativo ? C.primary : C.sidebarMuted }}>{NAV_SHORT[id]}</span>
          </button>
        )
      })}
      <button style={bn.item} onClick={onSair}>
        <LogOut size={22} color={C.sidebarMuted} />
        <span style={{ ...bn.label, color: C.sidebarMuted }}>Sair</span>
      </button>
    </nav>
  )
}

const bn = {
  nav:      { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, background: C.sidebarBg, display: 'flex', borderTop: '1px solid rgba(255,255,255,0.08)', paddingBottom: 'env(safe-area-inset-bottom)' },
  item:     { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '10px 4px 8px', background: 'none', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', minWidth: 0 },
  itemAtivo:{ background: 'rgba(216,27,96,0.12)' },
  label:    { fontSize: 10, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' },
  badge:    { position: 'absolute', top: -5, right: -8, minWidth: 16, height: 16, borderRadius: 8, background: C.primary, color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' },
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
const PAGE_TITLES = { pedidos: 'Pedidos', produtos: 'Lista de Produtos', categorias: 'Categorias', config: 'Configurações' }

function Topbar({ aba, isMobile }) {
  return (
    <header style={{ ...ts.topbar, padding: isMobile ? '0 16px' : '0 32px' }}>
      <h1 style={ts.titulo}>{PAGE_TITLES[aba]}</h1>
    </header>
  )
}

const ts = {
  topbar: { height: 56, background: C.cardBg, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 },
  titulo: { fontSize: 18, fontWeight: 700, color: C.textMain, margin: 0 },
}

// ─── Aba Pedidos ──────────────────────────────────────────────────────────────
function AbaPedidos({ addToast }) {
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    try {
      const data = await getPedidos()
      setPedidos(data)
    } catch (err) {
      addToast(`Erro ao carregar pedidos: ${err.message}`, 'error')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
    function onVisibility() { if (document.visibilityState === 'visible') carregar() }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  async function avancar(pedido) {
    const prox = PROXIMO[pedido.status]
    if (!prox) return
    try {
      await atualizarStatus(pedido.id, prox)
      carregar()
    } catch (err) {
      addToast(`Erro ao atualizar status: ${err.message}`, 'error')
    }
  }

  if (carregando) return <div style={cs.empty}>Carregando pedidos...</div>
  if (pedidos.length === 0) return <div style={cs.empty}>Nenhum pedido no momento.</div>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, padding: 32 }}>
      {pedidos.map(pedido => (
        <div key={pedido.id} style={cs.pedidoCard}>
          <div style={{ ...cs.pedidoHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={cs.pedidoCodigo}>{pedido.codigo}</span>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <span style={{ ...cs.statusBadge, background: C.statusColors[pedido.status] }}>
                  {STATUS_LABEL[pedido.status]}
                </span>
                {pedido.numero_mesa && (
                  <span style={cs.mesaBadge}>Mesa {pedido.numero_mesa}</span>
                )}
              </div>
            </div>
            <span style={{ fontSize: 12, color: C.textSub, flexShrink: 0 }}>
              {new Date(pedido.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <ul style={cs.itensList}>
            {pedido.itens_pedido?.map((item, i) => (
              <li key={i} style={cs.itemLinha}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ fontSize: 14, color: C.textMain }}>{item.produtos?.nome} × {item.quantidade}</span>
                  {item.produtos?.preco && (
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.textMain, flexShrink: 0 }}>
                      R$ {(item.produtos.preco * item.quantidade).toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>
                {item.comentario && (
                  <span style={cs.comentario}>
                    <MessageSquare size={12} style={{ flexShrink: 0 }} />
                    {item.comentario}
                  </span>
                )}
              </li>
            ))}
          </ul>

          <div style={cs.pedidoFooter}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.textSub }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: C.primary }}>
                R$ {(pedido.itens_pedido || []).reduce(
                  (s, item) => s + (item.produtos?.preco || 0) * item.quantidade, 0
                ).toFixed(2).replace('.', ',')}
              </span>
            </div>
            {PROXIMO[pedido.status] && (
              <button style={cs.btnAvancar} onClick={() => avancar(pedido)}>
                Marcar como {STATUS_LABEL[PROXIMO[pedido.status]]}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Modal Confirmação ───────────────────────────────────────────────────────
function ModalConfirm({ titulo, mensagem, labelConfirmar = 'Remover', onConfirmar, onCancelar }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onCancelar() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 10 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 380, padding: 24, boxShadow: '0 16px 48px rgba(0,0,0,0.18)' }}
      >
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Trash2 size={20} color="#DC2626" />
        </div>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: '0 0 6px' }}>{titulo}</p>
        <p style={{ fontSize: 13, color: '#717171', margin: '0 0 24px', lineHeight: 1.5 }}>{mensagem}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancelar} style={{ padding: '8px 18px', background: 'none', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#555', cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancelar
          </button>
          <button onClick={onConfirmar} style={{ padding: '8px 18px', background: '#DC2626', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
            {labelConfirmar}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Modal Produto ────────────────────────────────────────────────────────────
const FORM_VAZIO = { nome: '', descricao: '', preco: '', porcoes: 1, categoria_id: '', disponivel: true, foto_url: '', destaque: false }

function ModalProduto({ categorias, editandoId, formInicial, onSalvar, onFechar, salvando }) {
  const [form, setForm] = useState(formInicial || FORM_VAZIO)
  const [fotoFile, setFotoFile] = useState(null)
  const [fotoHover, setFotoHover] = useState(false)
  const fileRef = useRef()
  const isEdicao = !!editandoId
  const isMobile = useMobile()

  useEffect(() => {
    setForm(formInicial || FORM_VAZIO)
    setFotoFile(null)
  }, [editandoId])

  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const prevOverflow = document.body.style.overflow
    const prevPadding = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPadding
    }
  }, [])

  function f(campo) { return e => setForm(prev => ({ ...prev, [campo]: e.target.value })) }

  function handlePrecoChange(e) {
    const digits = e.target.value.replace(/\D/g, '')
    const centavos = parseInt(digits || '0', 10)
    setForm(prev => ({ ...prev, preco: centavos ? centavos / 100 : '' }))
  }

  function precoDisplay(preco) {
    if (preco === '' || preco === null || preco === undefined) return ''
    const centavos = Math.round(parseFloat(preco) * 100)
    return (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const preview = fotoFile ? URL.createObjectURL(fotoFile) : form.foto_url
  const canSave = !salvando && form.nome && form.preco && form.categoria_id && form.descricao && preview

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={ms.overlay}
      onClick={e => { if (e.target === e.currentTarget) onFechar() }}
    >
      <motion.div
        initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.96, y: 16 }}
        animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
        exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        style={isMobile ? ms.modalMobile : ms.modal}
      >
        {/* Handle mobile */}
        {isMobile && <div style={ms.handle} />}

        {/* Header */}
        <div style={ms.header}>
          <div>
            <h2 style={ms.titulo}>{isEdicao ? 'Editar produto' : 'Novo produto'}</h2>
            {isEdicao && <p style={ms.subtitulo}>{form.nome}</p>}
          </div>
          <button style={ms.closeBtn} onClick={onFechar}><X size={18} /></button>
        </div>

        {/* Body */}
        <div style={isMobile ? ms.bodyMobile : ms.body}>

          {/* Foto */}
          <div style={isMobile ? ms.fotoRowMobile : ms.fotoCol}>
            {isMobile ? (
              <>
                {/* Thumbnail 48x48 com badge câmera no canto */}
                <div style={{ position: 'relative', flexShrink: 0 }} onClick={() => fileRef.current.click()}>
                  <div style={ms.fotoAreaMobile}>
                    {preview
                      ? <img src={preview} alt="preview" style={ms.fotoImg} />
                      : <ImagePlus size={20} color="#C8C8C8" />
                    }
                  </div>
                  <div style={ms.fotoBadge}>
                    <Camera size={10} color="#fff" />
                  </div>
                </div>
                <div style={ms.fotoInfoMobile}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.textMain, margin: 0 }}>Foto do produto <span style={ms.req}>*</span></p>
                  <p style={{ fontSize: 11, color: '#BBB', margin: '3px 0 0' }}>JPG, PNG ou WebP · máx. 5 MB</p>
                </div>
              </>
            ) : (
              <>
                <label style={{ ...ms.fieldLabel, marginBottom: 8 }}>Foto <span style={ms.req}>*</span></label>
                <div
                  style={{ ...ms.fotoArea, cursor: 'pointer' }}
                  onClick={() => fileRef.current.click()}
                  onMouseEnter={() => setFotoHover(true)}
                  onMouseLeave={() => setFotoHover(false)}
                >
                  {preview
                    ? <img src={preview} alt="preview" style={ms.fotoImg} />
                    : <div style={ms.fotoEmpty}>
                        <ImagePlus size={32} color="#C8C8C8" />
                        <span style={{ fontSize: 11, color: '#BBBBBB', marginTop: 6, textAlign: 'center', lineHeight: 1.4 }}>Clique para<br />adicionar foto</span>
                      </div>
                  }
                  <div style={{ ...ms.fotoOverlay, opacity: fotoHover && preview ? 1 : 0 }}>
                    <Camera size={18} color="#fff" />
                    <span style={{ fontSize: 11, color: '#fff', marginTop: 4 }}>Trocar</span>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: '#BBB', textAlign: 'center', margin: '8px 0 0', lineHeight: 1.4 }}>
                  JPG, PNG ou WebP<br />máx. 5 MB
                </p>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => setFotoFile(e.target.files[0])} />
          </div>

          {/* Campos */}
          <div style={ms.camposCol}>
            <div style={ms.fieldGroup}>
              <label style={ms.fieldLabel}>Nome <span style={ms.req}>*</span></label>
              <input style={ms.input} placeholder="Ex: Brigadeiro de Pistache" value={form.nome} onChange={f('nome')} />
            </div>

            <div style={ms.fieldGroup}>
              <label style={ms.fieldLabel}>Descrição <span style={ms.req}>*</span></label>
              <textarea style={ms.textarea} placeholder="Descreva o produto brevemente..." value={form.descricao} onChange={f('descricao')} rows={5} maxLength={250} />
              <div style={ms.charCount}><span style={(form.descricao || '').length >= 250 ? { color: '#D81B60' } : {}}>{(form.descricao || '').length}</span>/250</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={ms.fieldGroup}>
                <label style={ms.fieldLabel}>Preço <span style={ms.req}>*</span></label>
                <div style={ms.inputPrefix}>
                  <span style={ms.prefix}>R$</span>
                  <input style={{ ...ms.input, borderLeft: 'none', borderRadius: '0 8px 8px 0', flex: 1 }}
                    type="text" inputMode="numeric" placeholder="0,00"
                    value={precoDisplay(form.preco)} onChange={handlePrecoChange} />
                </div>
              </div>
              <div style={ms.fieldGroup}>
                <label style={ms.fieldLabel}>Categoria <span style={ms.req}>*</span></label>
                <select style={ms.select} value={form.categoria_id} onChange={f('categoria_id')}>
                  <option value="">Selecionar...</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
            </div>

            {/* Toggles */}
            <div style={ms.toggleSection}>
              <button
                type="button"
                style={{ ...ms.toggleCard, borderColor: form.disponivel ? C.primary : C.border, background: form.disponivel ? C.primaryLight : '#FAFAFA' }}
                onClick={() => setForm(p => ({ ...p, disponivel: !p.disponivel }))}
              >
                <div style={{ ...ms.togglePill, background: form.disponivel ? C.primary : '#D1D5DB' }}>
                  <div style={{ ...ms.toggleThumb, transform: form.disponivel ? 'translateX(16px)' : 'translateX(2px)' }} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: form.disponivel ? C.primary : C.textMain }}>Disponível no cardápio</div>
                  <div style={{ fontSize: 11, color: C.textSub, marginTop: 1 }}>Visível para os clientes</div>
                </div>
              </button>

              <button
                type="button"
                style={{ ...ms.toggleCard, borderColor: form.destaque ? C.primary : C.border, background: form.destaque ? C.primaryLight : '#FAFAFA' }}
                onClick={() => setForm(p => ({ ...p, destaque: !p.destaque }))}
              >
                <div style={{ ...ms.togglePill, background: form.destaque ? C.primary : '#D1D5DB' }}>
                  <div style={{ ...ms.toggleThumb, transform: form.destaque ? 'translateX(16px)' : 'translateX(2px)' }} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: form.destaque ? C.primary : C.textMain, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Star size={12} color={form.destaque ? C.primary : C.textSub} fill={form.destaque ? C.primary : 'none'} />
                    Destaque
                  </div>
                  <div style={{ fontSize: 11, color: C.textSub, marginTop: 1 }}>Aparece na seção de destaques</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={ms.footer}>
          <button style={ms.btnCancelar} onClick={onFechar} disabled={salvando}>Cancelar</button>
          <button style={{ ...ms.btnSalvar, opacity: canSave ? 1 : 0.5 }} disabled={!canSave} onClick={() => onSalvar(form, fotoFile)}>
            {salvando ? 'Salvando...' : isEdicao ? 'Salvar alterações' : 'Criar produto'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

const ms = {
  overlay:       { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'clamp(16px, 3vw, 60px)' },
  modal:         { background: '#fff', borderRadius: 16, width: 'clamp(700px, 80vw, 1600px)', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', overflow: 'hidden' },
  modalMobile:   { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '20px 20px 0 0', minHeight: '85dvh', maxHeight: '94dvh', display: 'flex', flexDirection: 'column', boxShadow: '0 -8px 40px rgba(0,0,0,0.18)', overflow: 'hidden' },
  handle:        { width: 36, height: 4, borderRadius: 2, background: '#D1D5DB', margin: '12px auto 0', flexShrink: 0 },
  header:        { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: 'clamp(14px, 1.5vw, 24px) clamp(16px, 2vw, 32px)', borderBottom: `1px solid ${C.border}`, flexShrink: 0 },
  titulo:        { fontSize: 17, fontWeight: 700, color: C.textMain, margin: 0 },
  subtitulo:     { fontSize: 12, color: C.textSub, margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 },
  closeBtn:      { background: '#F5F5F7', border: 'none', cursor: 'pointer', color: C.textSub, display: 'flex', padding: 7, borderRadius: 8, flexShrink: 0, marginLeft: 8 },
  // Body
  body:          { display: 'grid', gridTemplateColumns: 'minmax(240px, 360px) 1fr', gap: 'clamp(16px, 2vw, 32px)', padding: 'clamp(16px, 2vw, 32px)', overflowY: 'auto', flex: 1 },
  bodyMobile:    { display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 16px', overflowY: 'auto', flex: 1 },
  // Foto desktop
  fotoCol:       { display: 'flex', flexDirection: 'column' },
  fotoArea:      { width: '100%', aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden', background: '#F7F7F7', border: `2px dashed #E0E0E0`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.15s' },
  // Foto mobile
  fotoRowMobile:  { display: 'flex', alignItems: 'center', gap: 14, background: '#F7F7F7', borderRadius: 12, padding: 12 },
  fotoAreaMobile: { width: 128, height: 128, borderRadius: 12, overflow: 'hidden', background: '#E5E5E5', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  fotoBadge:      { position: 'absolute', bottom: -3, right: -3, width: 24, height: 24, borderRadius: 12, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #F7F7F7' },
  fotoInfoMobile: { flex: 1 },
  fotoTrocarBtn:  { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: C.primary, background: C.primaryLight, border: 'none', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit' },
  fotoImg:       { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  fotoEmpty:     { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 8 },
  fotoOverlay:   { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' },
  // Campos
  camposCol:     { display: 'flex', flexDirection: 'column', gap: 12 },
  fieldGroup:    { display: 'flex', flexDirection: 'column', gap: 5 },
  fieldLabel:    { fontSize: 12, fontWeight: 600, color: '#374151' },
  req:           { color: C.primary },
  input:         { padding: '7px 10px', border: `1.5px solid #E5E7EB`, borderRadius: 8, fontSize: 13, outline: 'none', background: '#FAFAFA', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' },
  textarea:      { padding: '7px 10px', border: `1.5px solid #E5E7EB`, borderRadius: 8, fontSize: 13, outline: 'none', background: '#FAFAFA', width: '100%', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' },
  charCount:     { fontSize: 11, color: '#BBBBBB', textAlign: 'right', marginTop: 3 },
  select:        { padding: '7px 10px', border: `1.5px solid #E5E7EB`, borderRadius: 8, fontSize: 13, outline: 'none', background: '#FAFAFA', width: '100%', cursor: 'pointer', fontFamily: 'inherit' },
  inputPrefix:   { display: 'flex', alignItems: 'stretch', border: `1.5px solid #E5E7EB`, borderRadius: 8, overflow: 'hidden', background: '#FAFAFA' },
  prefix:        { padding: '7px 10px', background: '#F0F0F0', fontSize: 12, color: C.textSub, borderRight: '1.5px solid #E5E7EB', display: 'flex', alignItems: 'center', flexShrink: 0 },
  // Toggles como cards
  toggleSection: { display: 'flex', flexDirection: 'column', gap: 8 },
  toggleCard:    { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 8, border: '1.5px solid', cursor: 'pointer', background: 'none', width: '100%', textAlign: 'left', transition: 'background 0.15s, border-color 0.15s', fontFamily: 'inherit' },
  togglePill:    { width: 36, height: 20, borderRadius: 10, position: 'relative', flexShrink: 0, transition: 'background 0.2s' },
  toggleThumb:   { position: 'absolute', top: 2, width: 16, height: 16, borderRadius: 8, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'transform 0.2s' },
  // Footer
  footer:        { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: 'clamp(12px, 1.2vw, 20px) clamp(16px, 2vw, 32px)', borderTop: `1px solid ${C.border}`, background: '#FAFAFA', flexShrink: 0 },
  btnCancelar:   { padding: '8px 18px', background: 'none', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontWeight: 500, color: C.textSub, cursor: 'pointer', fontFamily: 'inherit' },
  btnSalvar:     { padding: '8px 22px', background: C.primary, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s' },
}

// ─── Aba Produtos ─────────────────────────────────────────────────────────────
function ProdCard({ p, onEditar, onToggle, onDeletar }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      style={{ ...ps.prodCard, background: hover ? '#F5F5F7' : C.cardBg, transition: 'background 0.15s' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={ps.fotoBox}>
        {p.foto_url
          ? <img src={p.foto_url} alt={p.nome} style={ps.foto} />
          : <div style={ps.fotoEmpty}><ImagePlus size={24} color="#CCC" /></div>
        }
        {!p.disponivel && <div style={ps.indispBadge}>Indisponível</div>}
        {p.destaque && (
          <div style={ps.destaqueBadge}><Star size={10} fill="#fff" color="#fff" /></div>
        )}
      </div>
      <div style={ps.cardBody}>
        <div style={{ opacity: p.disponivel ? 1 : 0.5 }}>
          <div style={ps.cardNome} title={p.nome}>{p.nome}</div>
          <div style={ps.cardCat}>{p.categorias?.nome}</div>
          {p.descricao && <div style={ps.cardDesc}>{p.descricao}</div>}
        </div>
        <div style={ps.cardFooter}>
          <span style={ps.cardPreco}>R$ {Number(p.preco).toFixed(2).replace('.', ',')}</span>
          <div style={{ display: 'flex', gap: 0 }}>
            <button style={cs.iconBtn} title="Editar" onClick={() => onEditar(p)}>
              <Pencil size={16} color={C.textSub} />
            </button>
            <button style={cs.iconBtn} title={p.disponivel ? 'Desativar' : 'Ativar'} onClick={() => onToggle(p)}>
              {p.disponivel ? <Eye size={16} color={C.success} /> : <EyeOff size={16} color={C.textSub} />}
            </button>
            <button style={cs.iconBtn} title="Remover" onClick={() => onDeletar(p.id)}>
              <Trash2 size={16} color={C.error} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AbaProdutos({ categorias, addToast, isMobile }) {
  const [produtos, setProdutos] = useState([])
  const [catFiltro, setCatFiltro] = useState(null)
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(null) // null | { editandoId, formInicial }
  const [salvando, setSalvando] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null) // null | id
  const fileRef = useRef()
  const formRef = useRef()

  async function carregar() {
    try {
      const data = await apiFetch('/api/admin/produtos')
      if (Array.isArray(data)) setProdutos(data)
    } catch (e) {
      addToast(`Erro ao carregar produtos: ${e.message}`, 'error')
    }
  }

  useEffect(() => { carregar() }, [])

  function abrirCriar() { setModal({ editandoId: null, formInicial: FORM_VAZIO }) }

  function abrirEditar(p) {
    setModal({
      editandoId: p.id,
      formInicial: { nome: p.nome, descricao: p.descricao || '', preco: p.preco, porcoes: p.porcoes || 1, categoria_id: p.categoria_id, disponivel: p.disponivel, foto_url: p.foto_url || '', destaque: p.destaque ?? false },
    })
  }

  async function salvar(form, fotoFile) {
    setSalvando(true)
    try {
      let foto_url = form.foto_url
      if (fotoFile) {
        const fd = new FormData()
        fd.append('foto', fotoFile)
        const res = await fetch(`${BASE_URL}/api/admin/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token()}` },
          body: fd,
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.erro || 'Falha no upload da foto')
        if (data.url) foto_url = data.url
      }

      const payload = {
        nome: form.nome, descricao: form.descricao || null,
        preco: parseFloat(form.preco), porcoes: parseInt(form.porcoes) || 1,
        categoria_id: form.categoria_id, disponivel: form.disponivel,
        foto_url: foto_url || null, destaque: form.destaque,
      }

      const url = modal.editandoId ? `/api/admin/produtos/${modal.editandoId}` : '/api/admin/produtos'
      await apiFetch(url, { method: modal.editandoId ? 'PUT' : 'POST', body: JSON.stringify(payload) })
      addToast(modal.editandoId ? 'Produto atualizado!' : 'Produto criado!', 'success')
      setModal(null)
      await carregar()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSalvando(false)
    }
  }

  async function alternarDisponivel(p) {
    try {
      await apiFetch(`/api/admin/produtos/${p.id}`, { method: 'PUT', body: JSON.stringify({ disponivel: !p.disponivel }) })
      await carregar()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  async function deletar(id) {
    try {
      await apiFetch(`/api/admin/produtos/${id}`, { method: 'DELETE' })
      addToast('Produto removido.', 'info')
      await carregar()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setConfirmDelete(null)
    }
  }

  function normalizar(txt) {
    return txt.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  }

  const produtosFiltrados = produtos
    .filter(p => catFiltro === null || p.categoria_id === catFiltro)
    .filter(p => !busca.trim() || normalizar(p.nome).includes(normalizar(busca)))

  const destaques = produtosFiltrados.filter(p => p.destaque)
  const outros    = produtosFiltrados.filter(p => !p.destaque)

  return (
    <>
      {/* Modal criar/editar */}
      <AnimatePresence>
        {modal && (
          <ModalProduto
            key="modal-produto"
            categorias={categorias}
            editandoId={modal.editandoId}
            formInicial={modal.formInicial}
            onSalvar={salvar}
            onFechar={() => setModal(null)}
            salvando={salvando}
          />
        )}
      </AnimatePresence>

      {/* Modal confirmação de exclusão */}
      <AnimatePresence>
        {confirmDelete !== null && (
          <ModalConfirm
            key="confirm-delete"
            titulo="Remover produto?"
            mensagem="Esta ação não pode ser desfeita. O produto será removido permanentemente."
            labelConfirmar="Remover"
            onConfirmar={() => deletar(confirmDelete)}
            onCancelar={() => setConfirmDelete(null)}
          />
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column' }}>

        {/* Barra de ações */}
        <div style={ps.actionBar}>
          <button style={ps.btnNovo} onClick={abrirCriar}>
            <Plus size={16} />
            Novo produto
          </button>
          <div style={ps.buscaBox}>
            <Search size={15} color={C.textSub} style={{ flexShrink: 0 }} />
            <input
              style={ps.buscaInput}
              placeholder="Buscar produto..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
            {busca && (
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSub, display: 'flex', padding: 2 }} onClick={() => setBusca('')}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Tabs de categoria */}
        <div style={ps.tabsBar}>
          <button
            style={{ ...ps.tab, ...(catFiltro === null ? ps.tabAtiva : {}) }}
            onMouseDown={e => e.preventDefault()}
            onClick={() => setCatFiltro(null)}
          >
            Todos
            <span style={{ ...ps.tabCount, background: catFiltro === null ? C.primary : '#E5E7EB', color: catFiltro === null ? '#fff' : C.textSub }}>
              {produtos.length}
            </span>
          </button>
          {categorias.map(cat => {
            const count = produtos.filter(p => p.categoria_id === cat.id).length
            if (count === 0) return null
            const ativo = catFiltro === cat.id
            return (
              <button
                key={cat.id}
                style={{ ...ps.tab, ...(ativo ? ps.tabAtiva : {}) }}
                onMouseDown={e => e.preventDefault()}
                onClick={() => setCatFiltro(cat.id)}
              >
                {cat.nome}
                <span style={{ ...ps.tabCount, background: ativo ? C.primary : '#E5E7EB', color: ativo ? '#fff' : C.textSub }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Seções Destaques + Produtos */}
        {produtosFiltrados.length === 0
          ? <div style={cs.empty}>{busca ? 'Nenhum produto encontrado.' : 'Nenhum produto nesta categoria.'}</div>
          : <div style={{ padding: '0 24px 24px' }}>

              {destaques.length > 0 && (
                <div>
                  <h2 style={ps.secTitulo}>Destaques</h2>
                  <div style={ps.secLinha} />
                  <div style={{ ...ps.grid, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(6, 1fr)' }}>
                    {destaques.map(p => <ProdCard key={p.id} p={p} onEditar={abrirEditar} onToggle={alternarDisponivel} onDeletar={id => setConfirmDelete(id)} />)}
                  </div>
                </div>
              )}

              {outros.length > 0 && (
                <div style={{ marginTop: destaques.length > 0 ? 32 : 0 }}>
                  <h2 style={ps.secTitulo}>Produtos</h2>
                  <div style={ps.secLinha} />
                  <div style={{ ...ps.grid, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(6, 1fr)' }}>
                    {outros.map(p => <ProdCard key={p.id} p={p} onEditar={abrirEditar} onToggle={alternarDisponivel} onDeletar={id => setConfirmDelete(id)} />)}
                  </div>
                </div>
              )}

            </div>
        }
      </div>
    </>
  )
}

// Estilos específicos de produtos
const ps = {
  actionBar:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: C.cardBg, borderBottom: `1px solid ${C.border}`, gap: 12 },
  btnNovo:      { display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', flexShrink: 0 },
  buscaBox:     { display: 'flex', alignItems: 'center', gap: 8, background: '#F5F5F7', border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', flex: 1, maxWidth: 320 },
  buscaInput:   { border: 'none', background: 'none', outline: 'none', fontSize: 14, color: C.textMain, width: '100%' },
  tabsBar:      { display: 'flex', gap: 6, padding: '12px 24px', borderBottom: `1px solid ${C.border}`, background: C.cardBg, flexWrap: 'wrap', position: 'sticky', top: 56, zIndex: 10 },
  tab:          { display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, borderWidth: 1, borderStyle: 'solid', borderColor: C.border, background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: C.textSub, whiteSpace: 'nowrap', transition: 'color 0.15s, background 0.15s, border-color 0.15s', outline: 'none', WebkitAppearance: 'none', appearance: 'none', boxSizing: 'border-box' },
  tabAtiva:     { background: C.primaryLight, borderColor: C.primary, color: C.primary },
  tabCount:     { fontSize: 11, fontWeight: 700, borderRadius: 10, padding: '1px 6px', lineHeight: 1.5 },
  secTitulo:    { fontSize: 24, fontWeight: 700, color: C.textMain, margin: '24px 0 10px', padding: 0 },
  secLinha:     { height: 1, background: C.border, marginBottom: 16 },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 },
  prodCard:     { background: C.cardBg, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  fotoBox:      { position: 'relative', width: '100%', aspectRatio: '1 / 1', background: '#F5F5F5', overflow: 'hidden', flexShrink: 0 },
  foto:         { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  fotoEmpty:    { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  indispBadge:  { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10, fontWeight: 700, textAlign: 'center', padding: '3px 0', letterSpacing: 0.5 },
  destaqueBadge:{ position: 'absolute', top: 6, left: 6, background: C.primary, borderRadius: 8, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardBody:     { padding: '8px 10px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, gap: 4 },
  cardNome:     { fontSize: 12, fontWeight: 600, color: C.textMain, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  cardCat:      { fontSize: 11, color: C.textSub, marginTop: 2 },
  cardDesc:     { fontSize: 11, color: '#9CA3AF', lineHeight: 1.4, marginTop: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  cardFooter:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  cardPreco:    { fontSize: 12, fontWeight: 700, color: C.primary },
}

// ─── Aba Categorias ───────────────────────────────────────────────────────────
function AbaCategorias({ categorias, onAtualizar, addToast }) {
  const [lista, setLista] = useState([])
  const [novaCategoria, setNovaCategoria] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [salvandoOrdem, setSalvandoOrdem] = useState(false)
  const [sobreIndex, setSobreIndex] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null) // null | { id, nome }
  const dragIndex = useRef(null)

  useEffect(() => { setLista([...categorias]) }, [categorias])

  async function criar(e) {
    e.preventDefault()
    setSalvando(true)
    try {
      await apiFetch('/api/admin/categorias', { method: 'POST', body: JSON.stringify({ nome: novaCategoria }) })
      setNovaCategoria('')
      await onAtualizar()
      addToast('Categoria criada!', 'success')
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSalvando(false)
    }
  }

  async function deletar(id) {
    try {
      await apiFetch(`/api/admin/categorias/${id}`, { method: 'DELETE' })
      await onAtualizar()
      addToast('Categoria removida.', 'info')
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setConfirmDelete(null)
    }
  }

  function onDragStart(e, i) { dragIndex.current = i; e.dataTransfer.effectAllowed = 'move' }
  function onDragOver(e, i) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setSobreIndex(i) }
  function onDragLeave() { setSobreIndex(null) }
  function onDragEnd() { dragIndex.current = null; setSobreIndex(null) }

  async function onDrop(e, i) {
    e.preventDefault()
    setSobreIndex(null)
    const from = dragIndex.current
    dragIndex.current = null
    if (from === null || from === i) return

    const nova = [...lista]
    const [item] = nova.splice(from, 1)
    nova.splice(i, 0, item)
    setLista(nova)

    setSalvandoOrdem(true)
    try {
      await apiFetch('/api/admin/categorias/ordem', {
        method: 'PUT',
        body: JSON.stringify({ ordem: nova.map((c, idx) => ({ id: c.id, ordem: idx })) }),
      })
      addToast('Ordem salva!', 'success')
    } catch (err) {
      addToast(err.message, 'error')
      setLista([...categorias])
    } finally {
      setSalvandoOrdem(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {confirmDelete !== null && (
          <ModalConfirm
            key="confirm-delete-cat"
            titulo="Remover categoria?"
            mensagem={`Os produtos vinculados à categoria "${confirmDelete.nome}" ficarão sem categoria.`}
            labelConfirmar="Remover"
            onConfirmar={() => deletar(confirmDelete.id)}
            onCancelar={() => setConfirmDelete(null)}
          />
        )}
      </AnimatePresence>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, padding: 32, alignItems: 'start' }}>
      {/* Formulário */}
      <div style={cs.card}>
        <h3 style={cs.cardTitulo}>Nova categoria</h3>
        <form onSubmit={criar} style={cs.form}>
          <input style={cs.input} placeholder="Nome da categoria *" value={novaCategoria} onChange={e => setNovaCategoria(e.target.value)} required />
          <button type="submit" style={cs.btnPrimary} disabled={salvando}>
            <Plus size={15} />
            {salvando ? 'Criando...' : 'Criar categoria'}
          </button>
        </form>
      </div>

      {/* Lista drag-and-drop */}
      <div>
        <p style={{ fontSize: 13, color: C.textSub, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
          {salvandoOrdem
            ? <><Save size={13} color={C.primary} /> Salvando ordem...</>
            : <><GripVertical size={13} /> Arraste para reordenar</>
          }
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {lista.map((c, i) => (
            <div
              key={c.id}
              draggable
              onDragStart={e => onDragStart(e, i)}
              onDragOver={e => onDragOver(e, i)}
              onDragLeave={onDragLeave}
              onDrop={e => onDrop(e, i)}
              onDragEnd={onDragEnd}
              style={{
                ...cs.catRow,
                background: sobreIndex === i ? C.primaryLight : C.cardBg,
                borderColor: sobreIndex === i ? C.primary : C.border,
                cursor: 'grab',
              }}
            >
              <GripVertical size={16} color="#CCC" style={{ flexShrink: 0 }} />
              <span style={cs.ordemBadge}>{i + 1}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: C.textMain }}>{c.nome}</span>
              <button style={cs.iconBtn} title="Remover" onClick={() => setConfirmDelete({ id: c.id, nome: c.nome })}>
                <Trash2 size={14} color={C.error} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  )
}

// ─── Aba Configurações ────────────────────────────────────────────────────────
function AbaConfiguracoes({ addToast }) {
  const [bannerAtual, setBannerAtual] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [numMesas, setNumMesas] = useState(() => parseInt(localStorage.getItem('eldago_num_mesas') || '0', 10))
  const [inputMesas, setInputMesas] = useState(String(localStorage.getItem('eldago_num_mesas') || ''))
  const fileRef = useRef()

  function salvarNumMesas(e) {
    e.preventDefault()
    const n = parseInt(inputMesas, 10)
    if (!n || n < 1) return
    localStorage.setItem('eldago_num_mesas', String(n))
    setNumMesas(n)
    addToast(`${n} mesa${n > 1 ? 's' : ''} configurada${n > 1 ? 's' : ''}!`, 'success')
  }

  const baseUrl = window.location.origin
  const mesas = numMesas > 0 ? Array.from({ length: numMesas }, (_, i) => i + 1) : []

  useEffect(() => {
    fetch(`${BASE_URL}/api/admin/banner`)
      .then(r => r.json())
      .then(d => { if (d.url) setBannerAtual(d.url) })
      .catch(() => {})
  }, [])

  async function salvarBanner(e) {
    e.preventDefault()
    if (!bannerFile) return
    setEnviando(true)
    try {
      const fd = new FormData()
      fd.append('banner', bannerFile)
      const res = await fetch(`${BASE_URL}/api/admin/banner`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` },
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.erro || 'Falha no upload')
      setBannerAtual(data.url)
      setBannerFile(null)
      addToast('Banner atualizado!', 'success')
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setEnviando(false)
    }
  }

  const preview = bannerFile ? URL.createObjectURL(bannerFile) : bannerAtual

  function imprimirQRCodes() {
    const win = window.open('', '_blank')
    const cards = mesas.map(n => {
      const url = `${baseUrl}/?mesa=${n}`
      const src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
      return `<div class="card">
        <img src="${src}" width="160" height="160" alt="Mesa ${n}" />
        <p class="label">Mesa ${n}</p>
        <p class="url">${url}</p>
      </div>`
    }).join('')
    win.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>QR Codes — EldaGo</title>
<style>
  body { font-family: sans-serif; padding: 24px; margin: 0; }
  h1   { font-size: 18px; margin: 0 0 20px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .card { border: 1px solid #ddd; border-radius: 10px; padding: 16px; text-align: center; }
  img  { display: block; margin: 0 auto; }
  .label { font-size: 15px; font-weight: 700; margin: 10px 0 4px; }
  .url   { font-size: 10px; color: #666; word-break: break-all; margin: 0; }
  @media print { body { padding: 0; } }
</style>
</head><body>
<h1>QR Codes das mesas</h1>
<div class="grid">${cards}</div>
<script>window.onload = function() { window.print() }<\/script>
</body></html>`)
    win.document.close()
  }

  return (
    <div style={{ padding: 32, maxWidth: 600 }}>
      <div style={cs.card}>
        <h3 style={cs.cardTitulo}>Banner do cardápio</h3>
        <p style={{ fontSize: 13, color: C.textSub, margin: '0 0 16px' }}>
          Imagem exibida no topo da página inicial. Proporção ideal: 480 × 160 px.
        </p>

        {preview && (
          <div style={{ marginBottom: 16, borderRadius: 8, overflow: 'hidden', background: '#F0F0F0' }}>
            <img src={preview} alt="Banner" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
          </div>
        )}

        <form onSubmit={salvarBanner} style={cs.form}>
          <div style={cs.row}>
            <button type="button" style={cs.btnUpload} onClick={() => fileRef.current.click()}>
              <Camera size={15} />
              {bannerFile ? 'Trocar imagem' : 'Selecionar imagem'}
            </button>
            {bannerFile && (
              <button type="submit" style={cs.btnPrimary} disabled={enviando}>
                {enviando ? 'Enviando...' : 'Salvar banner'}
              </button>
            )}
          </div>
          {bannerFile && <p style={{ fontSize: 12, color: C.textSub, margin: 0 }}>{bannerFile.name}</p>}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setBannerFile(e.target.files[0])} />
        </form>
      </div>

      {/* QR Codes das mesas */}
      <div style={{ ...cs.card, marginTop: 24 }}>
        <h3 style={cs.cardTitulo}>QR Codes das mesas</h3>
        <p style={{ fontSize: 13, color: C.textSub, margin: '0 0 16px' }}>
          Configure o número de mesas. Cada mesa terá um QR code único para o cliente escanear.
        </p>
        <form onSubmit={salvarNumMesas} style={{ ...cs.form, flexDirection: 'row', alignItems: 'center' }}>
          <input
            style={{ ...cs.input, width: 100, textAlign: 'center', marginBottom: 0 }}
            type="number" min="1" max="99" placeholder="Nº mesas"
            value={inputMesas}
            onChange={e => setInputMesas(e.target.value)}
          />
          <button type="submit" style={{ ...cs.btnPrimary, flex: 'none', paddingLeft: 20, paddingRight: 20 }}>
            Confirmar
          </button>
          {numMesas > 0 && (
            <button type="button" style={{ ...cs.btnSecondary, flex: 'none' }} onClick={imprimirQRCodes}>
              Imprimir
            </button>
          )}
        </form>

        {mesas.length > 0 && (
          <div style={qs.grid} className="qr-print-grid">
            {mesas.map(n => {
              const url = `${baseUrl}/?mesa=${n}`
              const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`
              return (
                <div key={n} style={qs.card}>
                  <img src={qrSrc} alt={`Mesa ${n}`} style={qs.qr} />
                  <p style={qs.mesaLabel}>Mesa {n}</p>
                  <p style={qs.url}>{url}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const qs = {
  grid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginTop: 20 },
  card:      { background: '#FAFAFA', border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  qr:        { width: 140, height: 140, display: 'block' },
  mesaLabel: { margin: 0, fontSize: 15, fontWeight: 700, color: C.textMain },
  url:       { margin: 0, fontSize: 10, color: C.textSub, textAlign: 'center', wordBreak: 'break-all' },
}

// ─── Estilos compartilhados ───────────────────────────────────────────────────
const cs = {
  empty:       { textAlign: 'center', color: C.textSub, padding: '60px 32px', fontSize: 14 },
  card:        { background: C.cardBg, borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `1px solid ${C.border}` },
  cardTitulo:  { fontSize: 16, fontWeight: 700, color: C.textMain, margin: '0 0 16px' },
  form:        { display: 'flex', flexDirection: 'column', gap: 12 },
  input:       { padding: '10px 12px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box', background: '#FAFAFA' },
  textarea:    { padding: '10px 12px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: '#FAFAFA' },
  inputHalf:   { flex: 1, padding: '10px 12px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, outline: 'none', minWidth: 0, background: '#FAFAFA' },
  row:         { display: 'flex', gap: 8 },
  checkGroup:  { display: 'flex', flexDirection: 'column', gap: 8 },
  checkLabel:  { fontSize: 13, color: C.textMain, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' },
  fotoArea:    { display: 'flex', alignItems: 'center', gap: 12 },
  fotoPreview: { width: 56, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 },
  btnPrimary:  { flex: 1, padding: '10px 16px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
  btnSecondary:{ padding: '10px 14px', background: '#F5F5F5', color: C.textSub, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
  btnUpload:   { padding: '9px 14px', border: `1.5px dashed ${C.primary}`, background: C.primaryLight, color: C.primary, borderRadius: 8, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
  iconBtn:     { background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  // Pedidos
  pedidoCard:  { background: C.cardBg, borderRadius: 12, padding: '20px 20px 0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 12 },
  pedidoHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  pedidoCodigo:{ fontSize: 24, fontWeight: 800, color: C.primary, letterSpacing: 2 },
  statusBadge: { color: '#fff', fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600, minWidth: 90, textAlign: 'center' },
  mesaBadge:   { fontSize: 11, fontWeight: 700, color: C.primary, background: C.primaryLight, padding: '3px 10px', borderRadius: 20, minWidth: 90, textAlign: 'center' },
  itensList:   { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6, flex: 1 },
  itemLinha:   { display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: 6, borderBottom: `1px solid ${C.border}` },
  comentario:  { fontSize: 12, color: C.textSub, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 4 },
  pedidoFooter:{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: `1px solid ${C.border}`, background: '#FAFAFA', margin: '0 -20px', padding: '14px 20px 20px' },
  btnAvancar:  { width: '100%', padding: '11px', background: C.primary, color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  // Produtos lista
  produtoRow:  { background: C.cardBg, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${C.border}`, transition: 'opacity 0.2s' },
  produtoThumb:{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 },
  produtoInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 },
  produtoPreco:{ fontSize: 13, fontWeight: 700, color: C.primary, flexShrink: 0 },
  produtoAcoes:{ display: 'flex', gap: 2, flexShrink: 0 },
  // Categorias
  catRow:      { background: C.cardBg, borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${C.border}`, transition: 'background 0.12s, border-color 0.12s' },
  ordemBadge:  { minWidth: 22, height: 22, borderRadius: 11, background: '#F0F0F0', color: '#999', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
}

// ─── Admin principal ──────────────────────────────────────────────────────────
export default function Admin() {
  const [autenticado, setAutenticado] = useState(!!localStorage.getItem('eldago_admin_token'))
  const [aba, setAba] = useState('pedidos')
  const [categorias, setCategorias] = useState([])
  const [novosCount, setNovosCount] = useState(0)
  const { toasts, addToast } = useToast()

  async function carregarCategorias() {
    const res = await fetch(`${BASE_URL}/api/categorias`)
    const data = await res.json()
    if (Array.isArray(data)) setCategorias(data)
  }

  // SSE no pai — detecta novos pedidos para badge na sidebar
  useEffect(() => {
    if (!autenticado) return
    carregarCategorias()

    const es = new EventSource(`${BASE_URL}/api/pedidos/stream`)
    es.onmessage = (e) => {
      if (e.data === 'novo_pedido') {
        setNovosCount(n => n + 1)
        addToast('Novo pedido recebido!', 'info')
      }
    }
    return () => es.close()
  }, [autenticado])

  function selecionarAba(id) {
    setAba(id)
    if (id === 'pedidos') setNovosCount(0)
  }

  function sair() {
    localStorage.removeItem('eldago_admin_token')
    setAutenticado(false)
  }

  const isMobile = useMobile()

  if (!autenticado) return <Login onLogin={() => setAutenticado(true)} />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.contentBg }}>
      <ToastContainer toasts={toasts} />

      {!isMobile && (
        <Sidebar
          aba={aba}
          setAba={selecionarAba}
          novosCount={novosCount}
          onSair={sair}
        />
      )}

      {/* Área principal */}
      <div style={{ marginLeft: isMobile ? 0 : 220, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: isMobile ? 64 : 0 }}>
        <Topbar aba={aba} isMobile={isMobile} />
        <main style={{ flex: 1 }}>
          {aba === 'pedidos'    && <AbaPedidos addToast={addToast} />}
          {aba === 'produtos'   && <AbaProdutos categorias={categorias} addToast={addToast} isMobile={isMobile} />}
          {aba === 'categorias' && <AbaCategorias categorias={categorias} onAtualizar={carregarCategorias} addToast={addToast} />}
          {aba === 'config'     && <AbaConfiguracoes addToast={addToast} />}
        </main>
      </div>

      {isMobile && (
        <BottomNav
          aba={aba}
          setAba={selecionarAba}
          novosCount={novosCount}
          onSair={sair}
        />
      )}
    </div>
  )
}
