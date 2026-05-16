import { Router } from 'express'
import {
  criarPedido,
  listarPedidos,
  atualizarStatus,
  streamPedidos,
  buscarStatusPorCodigo,
  buscarPedidosPorMesa,
} from '../controllers/pedidosController.js'

const router = Router()

router.get('/stream', streamPedidos)
router.get('/status/:codigo', buscarStatusPorCodigo)
router.get('/mesa/:numero', buscarPedidosPorMesa)
router.post('/', criarPedido)
router.get('/', listarPedidos)
router.patch('/:id/status', atualizarStatus)

export default router
