"use client"

import { useState, useCallback, useRef } from "react"
import { GoogleMap, LoadScript, DirectionsRenderer, Marker } from "@react-google-maps/api"

const containerStyle = {
  width: "100%",
  height: "500px",
}

const center = {
  lat: 23.254599621157592,
  lng: -106.41165473348944,
}

const travelModes = [
  { key: "DRIVING", label: "🚗 Conducir", icon: "🚗" },
  { key: "WALKING", label: "🚶 Caminar", icon: "🚶" },
  { key: "BICYCLING", label: "🚴 Bicicleta", icon: "🚴" },
  { key: "TRANSIT", label: "🚌 Transporte", icon: "🚌" },
]

function MapaRutas() {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [travelMode, setTravelMode] = useState("DRIVING")
  const [directions, setDirections] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [error, setError] = useState("")
  const [isCalculating, setIsCalculating] = useState(false)
  const [clickMode, setClickMode] = useState(null) // 'origin' or 'destination'
  const [markers, setMarkers] = useState({ origin: null, destination: null })

  const mapRef = useRef(null)

  const onLoad = useCallback((map) => {
    mapRef.current = map
  }, [])

  const calculateRoute = async () => {
    if (!origin || !destination) {
      setError("Por favor, ingresa tanto el origen como el destino")
      return
    }

    setIsCalculating(true)
    setError("")
    setDirections(null)
    setRouteInfo(null)

    try {
      const directionsService = new window.google.maps.DirectionsService()

      const result = await new Promise((resolve, reject) => {
        directionsService.route(
          {
            origin: origin,
            destination: destination,
            travelMode: window.google.maps.TravelMode[travelMode],
          },
          (result, status) => {
            if (status === "OK") {
              resolve(result)
            } else {
              reject(new Error(`Error al calcular la ruta: ${status}`))
            }
          },
        )
      })

      setDirections(result)

      // Extraer información de la ruta
      const route = result.routes[0]
      const leg = route.legs[0]
      setRouteInfo({
        distance: leg.distance.text,
        duration: leg.duration.text,
        startAddress: leg.start_address,
        endAddress: leg.end_address,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsCalculating(false)
    }
  }

  const clearRoute = () => {
    setDirections(null)
    setRouteInfo(null)
    setError("")
    setOrigin("")
    setDestination("")
    setMarkers({ origin: null, destination: null })
    setClickMode(null)
  }

  const onMapClick = useCallback(
    (event) => {
      if (!clickMode) return

      const lat = event.latLng.lat()
      const lng = event.latLng.lng()
      const position = { lat, lng }

      // Usar geocoding para obtener la dirección
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ location: position }, (results, status) => {
        if (status === "OK" && results[0]) {
          const address = results[0].formatted_address

          if (clickMode === "origin") {
            setOrigin(address)
            setMarkers((prev) => ({ ...prev, origin: position }))
          } else if (clickMode === "destination") {
            setDestination(address)
            setMarkers((prev) => ({ ...prev, destination: position }))
          }
        }
      })

      setClickMode(null)
    },
    [clickMode],
  )

  return (
    <div className="routes-container">
      <div className="controls-panel">
        <div className="form-section">
          <div className="input-group">
            <label htmlFor="origin">Origen</label>
            <input
              id="origin"
              type="text"
              className="location-input"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Ingresa el punto de origen"
            />
            <button className="mode-button" onClick={() => setClickMode("origin")} style={{ marginTop: "0.5rem" }}>
              📍 Seleccionar en mapa
            </button>
          </div>

          <div className="input-group">
            <label htmlFor="destination">Destino</label>
            <input
              id="destination"
              type="text"
              className="location-input"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Ingresa el punto de destino"
            />
            <button className="mode-button" onClick={() => setClickMode("destination")} style={{ marginTop: "0.5rem" }}>
              📍 Seleccionar en mapa
            </button>
          </div>
        </div>

        <div className="travel-modes">
          {travelModes.map((mode) => (
            <button
              key={mode.key}
              className={`mode-button ${travelMode === mode.key ? "active" : ""}`}
              onClick={() => setTravelMode(mode.key)}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="action-buttons">
          <button
            className="calculate-button"
            onClick={calculateRoute}
            disabled={isCalculating || !origin || !destination}
          >
            {isCalculating ? "Calculando..." : "Calcular Ruta"}
          </button>
          <button className="clear-button" onClick={clearRoute}>
            Limpiar
          </button>
        </div>

        {clickMode && (
          <div className="click-instruction">
            Haz clic en el mapa para seleccionar el {clickMode === "origin" ? "origen" : "destino"}
          </div>
        )}

        {routeInfo && (
          <div className="route-info">
            <h4>Información de la Ruta</h4>
            <p>
              <strong>Distancia:</strong> {routeInfo.distance}
            </p>
            <p>
              <strong>Tiempo estimado:</strong> {routeInfo.duration}
            </p>
            <p>
              <strong>Desde:</strong> {routeInfo.startAddress}
            </p>
            <p>
              <strong>Hasta:</strong> {routeInfo.endAddress}
            </p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="map-routes-container">
        <LoadScript
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          loadingElement={
            <div className="loading-map">
              <div className="map-spinner"></div>
              <p>Cargando mapa...</p>
            </div>
          }
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
            onLoad={onLoad}
            onClick={onMapClick}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: true,
              fullscreenControl: true,
            }}
          >
            {/* Mostrar marcadores cuando se seleccionan por clic */}
            {markers.origin && (
              <Marker
                position={markers.origin}
                title="Origen"
                icon={{
                  url: "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Ccircle cx='10' cy='10' r='8' fill='%234CAF50'/%3E%3C/svg%3E",
                }}
              />
            )}
            {markers.destination && (
              <Marker
                position={markers.destination}
                title="Destino"
                icon={{
                  url: "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Ccircle cx='10' cy='10' r='8' fill='%23F44336'/%3E%3C/svg%3E",
                }}
              />
            )}

            {/* Mostrar la ruta calculada */}
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: false,
                  polylineOptions: {
                    strokeColor: "#4285F4",
                    strokeWeight: 5,
                    strokeOpacity: 0.8,
                  },
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  )
}

export default MapaRutas
