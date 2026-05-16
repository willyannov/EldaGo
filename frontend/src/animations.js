// Variantes reutilizáveis de animação — EldaGo

export const pageVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -40 },
}

export const pageTransition = {
  duration: 0.22,
  ease: [0.4, 0, 0.2, 1],
}

export const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -10 },
}

export const listVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.06 } },
  exit:    { opacity: 0, transition: { duration: 0.12 } },
}

export const cardVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
}

export const tapScale = { scale: 0.97 }
export const tapTransition = { duration: 0.12, ease: 'easeInOut' }
