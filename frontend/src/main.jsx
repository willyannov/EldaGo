import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import SkipLink from './components/SkipLink'
import Menu from './pages/Menu'
import Pedido from './pages/Pedido'
import ProdutoDetalhe from './pages/ProdutoDetalhe'
import Admin from './pages/Admin'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Menu />} />
        <Route path="/produto/:id" element={<ProdutoDetalhe />} />
        <Route path="/pedido" element={<Pedido />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SkipLink />
      <div id="app-content">
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  </React.StrictMode>
)
