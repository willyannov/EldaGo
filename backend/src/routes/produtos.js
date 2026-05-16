import { Router } from 'express'
import {
  listarProdutos,
  buscarProduto,
  listarCategorias,
  atualizarDisponibilidade,
} from '../controllers/produtosController.js'

const router = Router()

router.get('/', listarProdutos)
router.get('/:id', buscarProduto)
router.patch('/:id/disponivel', atualizarDisponibilidade)

export default router
