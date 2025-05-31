"use client"

import Mapa from "../components/Mapa"
import "./Maps.css"

function Maps() {
  return (
    <div className="page">
      <h1>Mapa Interactivo</h1>
      <p>Explora los lugares marcados en el mapa. Haz clic en los marcadores para ver más información.</p>
      <div className="map-wrapper">
        <Mapa />
      </div>
    </div>
  )
}

export default Maps
