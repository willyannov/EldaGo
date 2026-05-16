import { Router } from 'express'
import { listarCategorias } from '../controllers/produtosController.js'

const router = Router()

router.get('/', listarCategorias)

export default router
