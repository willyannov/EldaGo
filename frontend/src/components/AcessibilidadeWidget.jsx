import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'

const STORAGE_FONTE = 'eldago_fonte'
const STORAGE_CONTRASTE = 'eldago_contraste'

function aplicar(fonte, contraste) {
  const html = document.documentElement
  html.classList.remove('fonte-1', 'fonte-2')
  if (fonte === 1) html.classList.add('fonte-1')
  if (fonte === 2) html.classList.add('fonte-2')
  contraste ? html.classList.add('alto-contraste') : html.classList.remove('alto-contraste')
}

export default function AcessibilidadeWidget() {
  const [aberto, setAberto] = useState(false)
  const [fonte, setFonte] = useState(() => Number(localStorage.getItem(STORAGE_FONTE) || 0))
  const [contraste, setContraste] = useState(() => localStorage.getItem(STORAGE_CONTRASTE) === '1')

  useEffect(() => { aplicar(fonte, contraste) }, [fonte, contraste])

  function mudarFonte(nivel) {
    setFonte(nivel)
    localStorage.setItem(STORAGE_FONTE, nivel)
  }

  function alternarContraste() {
    const novo = !contraste
    setContraste(novo)
    localStorage.setItem(STORAGE_CONTRASTE, novo ? '1' : '0')
  }

  return (
    <div style={s.wrapper} className="acessibilidade-widget">
      <button
        style={s.fab}
        onClick={() => setAberto(a => !a)}
        aria-label="Opções de acessibilidade"
        aria-expanded={aberto}
        aria-haspopup="dialog"
      >
        <Menu size={22} aria-hidden="true" />
        <span style={s.tabLabel}>Menu</span>
      </button>

      {aberto && (
        <div style={s.painel} role="dialog" aria-label="Opções de acessibilidade">
          <div style={s.painelHeader}>
            <span style={s.titulo}>Acessibilidade</span>
            <button style={s.fechar} onClick={() => setAberto(false)} aria-label="Fechar painel de acessibilidade">✕</button>
          </div>

          <div style={s.grupo}>
            <span style={s.grupoLabel}>Tamanho do texto</span>
            <div style={s.fonteRow}>
              {[
                { nivel: 0, label: 'A', ariaLabel: 'Fonte normal' },
                { nivel: 1, label: 'A+', ariaLabel: 'Fonte grande' },
                { nivel: 2, label: 'A++', ariaLabel: 'Fonte extra grande' },
              ].map(({ nivel, label, ariaLabel }) => (
                <button
                  key={nivel}
                  style={{ ...s.fonteBtn, ...(fonte === nivel ? s.fonteBtnAtivo : {}) }}
                  onClick={() => mudarFonte(nivel)}
                  aria-label={ariaLabel}
                  aria-pressed={fonte === nivel}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            style={{ ...s.contrasteBtn, ...(contraste ? s.contrasteBtnAtivo : {}) }}
            onClick={alternarContraste}
            aria-pressed={contraste}
          >
            ◑ Alto contraste
          </button>
        </div>
      )}
    </div>
  )
}

const s = {
  wrapper: {
    position: 'relative',
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  painel: {
    position: 'absolute',
    bottom: 'calc(100% + 6px)',
    right: 0,
    zIndex: 200,
    background: '#fff',
    border: '1.5px solid #f0f0f0',
    borderRadius: 14,
    padding: '14px 16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    minWidth: 200,
  },
  painelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3D3D3D',
    fontFamily: 'inherit',
  },
  fechar: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    color: '#717171',
    padding: 0,
    lineHeight: 1,
  },
  grupo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  grupoLabel: {
    fontSize: 12,
    color: '#5A5A5A',
    fontWeight: '600',
  },
  fonteRow: {
    display: 'flex',
    gap: 6,
  },
  fonteBtn: {
    flex: 1,
    padding: '7px 0',
    border: '1.5px solid #e0e0e0',
    borderRadius: 8,
    background: '#FFFBF9',
    color: '#3D3D3D',
    fontSize: 13,
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  fonteBtnAtivo: {
    border: '1.5px solid #D81B60',
    background: '#FCE4EC',
    color: '#D81B60',
  },
  contrasteBtn: {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid #e0e0e0',
    borderRadius: 8,
    background: '#FFFBF9',
    color: '#3D3D3D',
    fontSize: 13,
    fontWeight: '700',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
  },
  contrasteBtnAtivo: {
    border: '1.5px solid #D81B60',
    background: '#FCE4EC',
    color: '#D81B60',
  },
  fab: {
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
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 1,
  },
}
