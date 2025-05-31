"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import "./Navbar.css"

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Proyecto Index
        </Link>
        <button className="menu-button" onClick={toggleMenu}>
          Menu
        </button>
        <div className={`navbar-menu ${isOpen ? "active" : ""}`}>
          <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>
            Inicio
          </Link>
          <Link to="/counter" className="nav-link" onClick={() => setIsOpen(false)}>
            Contador
          </Link>
          <Link to="/about" className="nav-link" onClick={() => setIsOpen(false)}>
            Tabla
          </Link>
          <Link to="/contact" className="nav-link" onClick={() => setIsOpen(false)}>
            Usuarios API
          </Link>
          <Link to="/maps" className="nav-link" onClick={() => setIsOpen(false)}>
            Mapa
          </Link>
          <Link to="/routes" className="nav-link" onClick={() => setIsOpen(false)}>
            Rutas
          </Link>
          <Link to="/clusters" className="nav-link" onClick={() => setIsOpen(false)}>
            Clusters
          </Link>
          <Link to="/drawing" className="nav-link" onClick={() => setIsOpen(false)}>
            Dibujo
          </Link>
          <Link to="/advanced-routes" className="nav-link" onClick={() => setIsOpen(false)}>
            Rutas Pro
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
