import { motion } from 'framer-motion'

const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: { duration: 1.4, repeat: Infinity, ease: 'linear' },
  },
}

const base = {
  borderRadius: 8,
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
  backgroundSize: '400% 100%',
}

function Bone({ width = '100%', height = 14, style = {} }) {
  return (
    <motion.div
      variants={shimmer}
      animate="animate"
      style={{ ...base, width, height, ...style }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div style={s.card}>
      <div style={s.info}>
        <Bone width="65%" height={15} />
        <Bone width="90%" height={12} style={{ marginTop: 6 }} />
        <Bone width="50%" height={12} style={{ marginTop: 4 }} />
        <Bone width="30%" height={14} style={{ marginTop: 8 }} />
      </div>
      <motion.div
        variants={shimmer}
        animate="animate"
        style={{ ...base, width: 96, height: 96, borderRadius: 8, flexShrink: 0 }}
      />
    </div>
  )
}

export function SkeletonDestaques() {
  return (
    <section style={{ padding: '4px 0 8px' }}>
      <Bone width={110} height={17} style={{ margin: '16px 16px 12px', borderRadius: 6 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, padding: '0 16px' }}>
        {[3, 3, 2, 2, 2].map((span, i) => (
          <div key={i} style={{ gridColumn: `span ${span}`, borderRadius: 10, overflow: 'hidden' }}>
            <motion.div
              variants={shimmer}
              animate="animate"
              style={{ ...base, width: '100%', aspectRatio: '1 / 1', borderRadius: 0 }}
            />
            <div style={{ padding: '6px 8px 8px', display: 'flex', flexDirection: 'column', gap: 4, background: '#fafafa' }}>
              <Bone width="50%" height={11} />
              <Bone width="80%" height={10} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function SkeletonBanner() {
  return (
    <motion.div
      variants={shimmer}
      animate="animate"
      style={{ ...base, width: '100%', height: 160, borderRadius: 0 }}
    />
  )
}

export function SkeletonList({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  )
}

export function SkeletonItemSacola() {
  return (
    <div style={sk.item}>
      <motion.div variants={shimmer} animate="animate"
        style={{ ...base, width: 72, height: 72, borderRadius: 8, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Bone width="60%" height={14} />
        <Bone width="85%" height={11} />
        <Bone width="40%" height={11} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <Bone width={60} height={14} />
        <Bone width={80} height={28} style={{ borderRadius: 20 }} />
      </div>
    </div>
  )
}

export function SkeletonCarrossel({ count = 4 }) {
  return (
    <div style={sk.carrosselWrapper}>
      <Bone width={110} height={16} style={{ margin: '16px 16px 12px', borderRadius: 6 }} />
      <div style={sk.trilho}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ flexShrink: 0, width: 122, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <motion.div variants={shimmer} animate="animate"
              style={{ ...base, width: 122, height: 122, borderRadius: 8 }} />
            <Bone width="55%" height={13} />
            <Bone width="80%" height={11} />
            <Bone width="70%" height={11} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonRodape() {
  return (
    <div style={sk.rodape}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Bone width={40} height={12} style={{ borderRadius: 4 }} />
        <Bone width={110} height={20} style={{ borderRadius: 6 }} />
      </div>
      <Bone width={150} height={48} style={{ borderRadius: 12, flexShrink: 0 }} />
    </div>
  )
}

const sk = {
  item: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 16px', borderBottom: '1px solid #f5f5f5',
  },
  carrosselWrapper: {
    background: '#fff',
    borderTop: '1px solid #f0f0f0',
    borderBottom: '1px solid #f0f0f0',
    paddingBottom: 16,
  },
  trilho: {
    display: 'flex', gap: 12,
    overflowX: 'hidden',
    padding: '0 16px',
  },
  rodape: {
    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
    background: '#fff', borderTop: '1px solid #f0f0f0',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
    padding: '14px 16px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    maxWidth: 480, margin: '0 auto',
  },
}

const s = {
  card: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: '1px solid #f0f0f0',
    background: '#fff',
    gap: 12,
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: 0,
  },
}
