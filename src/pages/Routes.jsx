"use client"

import MapaRutas from "../components/MapaRutas"
import "./Routes.css"

function Routes() {
  return (
    <div className="page">
      <h1>Planificador de Rutas</h1>
      <p>Calcula rutas entre dos puntos y elige tu método de transporte preferido.</p>
      <div className="routes-wrapper">
        <MapaRutas />
      </div>
    </div>
  )
}

export default Routes
