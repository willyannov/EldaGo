// Tokens ativos em memória (reinicia com o servidor — ok para PI)
const tokensAtivos = new Set()

export function gerarToken() {
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36)
  tokensAtivos.add(token)
  return token
}

export function revogarToken(token) {
  tokensAtivos.delete(token)
}

export function verificarAuth(req, res, next) {
  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não informado' })
  }
  const token = authHeader.slice(7)
  if (!tokensAtivos.has(token)) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' })
  }
  next()
}
