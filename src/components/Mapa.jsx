"use client"

import { useState, useCallback } from "react"
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api"

const containerStyle = {
  width: "100%",
  height: "500px",
}

const center = {
  lat: 23.254599621157592,
  lng: -106.41165473348944,
}

const markers = [
  {
    id: 1,
    position: { lat: 23.254599621157592, lng: -106.41165473348944 },
    title: "Mazatlán, Sinaloa",
    description: "Hermoso puerto mexicano conocido por sus playas, malecón y rica cultura.",
  },
  {
    id: 2,
    position: { lat: 23.2494, lng: -106.4103 },
    title: "Malecón de Mazatlán",
    description: "Uno de los malecones más largos del mundo, perfecto para caminar y disfrutar del atardecer.",
  },
  {
    id: 3,
    position: { lat: 23.2066, lng: -106.4194 },
    title: "Zona Dorada",
    description: "Principal zona turística con hoteles, restaurantes y vida nocturna.",
  },
  {
    id: 4,
    position: { lat: 23.2433, lng: -106.4261 },
    title: "Centro Histórico",
    description: "Corazón cultural de Mazatlán con arquitectura colonial y el famoso Teatro Ángela Peralta.",
  },
  {
    id: 5,
    position: { lat: 23.1886, lng: -106.4408 },
    title: "Playa Cerritos",
    description: "Playa popular para surfear y disfrutar de actividades acuáticas.",
  },
]

function Mapa() {
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  const onLoad = useCallback(() => {
    setMapLoaded(true)
  }, [])

  const onMarkerClick = (marker) => {
    setSelectedMarker(marker)
  }

  const onInfoWindowClose = () => {
    setSelectedMarker(null)
  }

  return (
    <div className="map-container">
      <LoadScript
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        onLoad={onLoad}
        loadingElement={
          <div className="loading-map">
            <div className="map-spinner"></div>
            <p>Cargando mapa...</p>
          </div>
        }
        onError={() => console.error("Error loading Google Maps")}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          }}
        >
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              title={marker.title}
              onClick={() => onMarkerClick(marker)}
              animation={window.google?.maps?.Animation?.DROP}
            />
          ))}

          {selectedMarker && (
            <InfoWindow position={selectedMarker.position} onCloseClick={onInfoWindowClose}>
              <div
                style={{
                  padding: "10px",
                  maxWidth: "250px",
                  fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    color: "#495057",
                    fontSize: "16px",
                  }}
                >
                  {selectedMarker.title}
                </h3>
                <p
                  style={{
                    margin: "0",
                    color: "#6c757d",
                    fontSize: "14px",
                    lineHeight: "1.4",
                  }}
                >
                  {selectedMarker.description}
                </p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  )
}

export default Mapa
