import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import produtosRouter from './routes/produtos.js'
import pedidosRouter from './routes/pedidos.js'
import categoriasRouter from './routes/categorias.js'
import adminRouter from './routes/admin.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: [
    'https://eldagodoceria.web.app',
    'https://eldagodoceria.firebaseapp.com',
    'http://localhost:5173',
    'http://localhost:4173',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ status: 'EldaGo API funcionando' })
})

app.get('/api/health', async (req, res) => {
  const { supabase } = await import('./config/supabase.js')
  const { data, error } = await supabase.from('categorias').select('count').limit(1)
  if (error) {
    console.error('[health]', error)
    return res.status(500).json({ ok: false, erro: error.message, detalhes: error })
  }
  res.json({ ok: true, supabase: 'conectado', data })
})

app.use('/api/produtos', produtosRouter)
app.use('/api/pedidos', pedidosRouter)
app.use('/api/categorias', categoriasRouter)
app.use('/api/admin', adminRouter)

app.listen(PORT, () => {
  console.log(`Servidor EldaGo rodando na porta ${PORT}`)
})
