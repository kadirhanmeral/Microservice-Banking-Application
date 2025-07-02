import { useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Header from './components/Header'
import { Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} /> {/* Başlangıç yönlendirmesi */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  )
}

export default App
