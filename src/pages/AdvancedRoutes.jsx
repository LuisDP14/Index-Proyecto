"use client"

import MapaRutasAvanzadas from "../components/MapaRutasAvanzadas"
import "./AdvancedRoutes.css"

function AdvancedRoutes() {
  return (
    <div className="page">
      <h1>Rutas Avanzadas</h1>
      <p>
        Planifica rutas inteligentes con autocompletado de direcciones y múltiples opciones de transporte. Utiliza la
        Routes API de Google para obtener las mejores rutas.
      </p>
      <div className="advanced-routes-wrapper">
        <MapaRutasAvanzadas />
      </div>
    </div>
  )
}

export default AdvancedRoutes
