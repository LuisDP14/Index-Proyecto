"use client"

import MapaDrawing from "../components/MapaDrawing"
import "./Drawing.css"

function Drawing() {
  return (
    <div className="page">
      <h1>Herramientas de Dibujo</h1>
      <p>
        Dibuja polígonos, rectángulos, círculos y líneas sobre el mapa. Visualiza las coordenadas y gestiona tus formas.
      </p>
      <div className="drawing-wrapper">
        <MapaDrawing />
      </div>
    </div>
  )
}

export default Drawing
