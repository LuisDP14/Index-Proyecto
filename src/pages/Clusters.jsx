"use client"

import MapaClusters from "../components/MapaClusters"
import "./Clusters.css"

function Clusters() {
  return (
    <div className="page">
      <h1>Mapa con Clusters</h1>
      <p>Visualiza múltiples ubicaciones agrupadas de manera eficiente con MarkerClusterer.</p>
      <div className="clusters-wrapper">
        <MapaClusters />
      </div>
    </div>
  )
}

export default Clusters
