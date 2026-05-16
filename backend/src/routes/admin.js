import { Router } from 'express'
import multer from 'multer'
import { verificarAuth } from '../middleware/auth.js'
import {
  login, logout,
  uploadFoto,
  criarProduto, editarProduto, deletarProduto, listarTodosProdutos,
  criarCategoria, deletarCategoria, reordenarCategorias,
  getBanner, uploadBanner,
} from '../controllers/adminController.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

// Auth (sem middleware)
router.post('/login', login)
router.post('/logout', verificarAuth, logout)

// Upload
router.post('/upload', verificarAuth, upload.single('foto'), uploadFoto)

// Produtos (admin)
router.get('/produtos', verificarAuth, listarTodosProdutos)
router.post('/produtos', verificarAuth, criarProduto)
router.put('/produtos/:id', verificarAuth, editarProduto)
router.delete('/produtos/:id', verificarAuth, deletarProduto)

// Categorias (admin)
router.post('/categorias', verificarAuth, criarCategoria)
router.delete('/categorias/:id', verificarAuth, deletarCategoria)
router.put('/categorias/ordem', verificarAuth, reordenarCategorias)

// Banner
router.get('/banner', getBanner)
router.post('/banner', verificarAuth, upload.single('banner'), uploadBanner)

export default router
