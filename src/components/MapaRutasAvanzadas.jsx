"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { GoogleMap, LoadScript, DirectionsRenderer } from "@react-google-maps/api"

const containerStyle = {
  width: "100%",
  height: "600px",
}

const center = {
  lat: 23.254599621157592,
  lng: -106.41165473348944,
}

const libraries = ["places"]

const transportModes = [
  {
    key: "DRIVING",
    label: "Conducir",
    icon: "🚗",
    color: "#4285F4",
  },
  {
    key: "WALKING",
    label: "Caminar",
    icon: "🚶",
    color: "#34A853",
  },
  {
    key: "BICYCLING",
    label: "Bicicleta",
    icon: "🚴",
    color: "#FBBC04",
  },
  {
    key: "TRANSIT",
    label: "Transporte",
    icon: "🚌",
    color: "#EA4335",
  },
]

function MapaRutasAvanzadas() {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [travelMode, setTravelMode] = useState("DRIVING")
  const [directions, setDirections] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [error, setError] = useState("")
  const [isCalculating, setIsCalculating] = useState(false)
  const [originSuggestions, setOriginSuggestions] = useState([])
  const [destinationSuggestions, setDestinationSuggestions] = useState([])
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false)
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false)

  const mapRef = useRef(null)
  const originAutocompleteRef = useRef(null)
  const destinationAutocompleteRef = useRef(null)
  const placesServiceRef = useRef(null)

  const onLoad = useCallback((map) => {
    mapRef.current = map
    placesServiceRef.current = new window.google.maps.places.PlacesService(map)
    setMapLoaded(true)
  }, [])

  const onOriginAutocompleteLoad = useCallback((autocomplete) => {
    originAutocompleteRef.current = autocomplete
  }, [])

  const onDestinationAutocompleteLoad = useCallback((autocomplete) => {
    destinationAutocompleteRef.current = autocomplete
  }, [])

  const onOriginPlaceChanged = useCallback(() => {
    if (originAutocompleteRef.current) {
      const place = originAutocompleteRef.current.getPlace()
      if (place.formatted_address) {
        setOrigin(place.formatted_address)
        setShowOriginSuggestions(false)
      }
    }
  }, [])

  const onDestinationPlaceChanged = useCallback(() => {
    if (destinationAutocompleteRef.current) {
      const place = destinationAutocompleteRef.current.getPlace()
      if (place.formatted_address) {
        setDestination(place.formatted_address)
        setShowDestinationSuggestions(false)
      }
    }
  }, [])

  const searchPlaces = useCallback((query, setSuggestions, setShowSuggestions) => {
    if (!query || query.length < 3 || !placesServiceRef.current) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const request = {
      query: query,
      fields: ["name", "formatted_address", "geometry"],
    }

    placesServiceRef.current.textSearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        const suggestions = results.slice(0, 5).map((place) => ({
          name: place.name,
          address: place.formatted_address,
          location: place.geometry.location,
        }))
        setSuggestions(suggestions)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    })
  }, [])

  const handleOriginChange = (e) => {
    const value = e.target.value
    setOrigin(value)
    searchPlaces(value, setOriginSuggestions, setShowOriginSuggestions)
  }

  const handleDestinationChange = (e) => {
    const value = e.target.value
    setDestination(value)
    searchPlaces(value, setDestinationSuggestions, setShowDestinationSuggestions)
  }

  const selectSuggestion = (suggestion, isOrigin) => {
    if (isOrigin) {
      setOrigin(suggestion.address)
      setShowOriginSuggestions(false)
    } else {
      setDestination(suggestion.address)
      setShowDestinationSuggestions(false)
    }
  }

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
            unitSystem: window.google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false,
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

      // Extraer información detallada de la ruta
      const route = result.routes[0]
      const leg = route.legs[0]

      // Calcular información adicional
      const steps = leg.steps.length
      const warnings = route.warnings || []
      const copyrights = route.copyrights

      setRouteInfo({
        distance: leg.distance.text,
        duration: leg.duration.text,
        startAddress: leg.start_address,
        endAddress: leg.end_address,
        steps: steps,
        warnings: warnings,
        copyrights: copyrights,
        bounds: route.bounds,
      })

      // Ajustar el mapa para mostrar toda la ruta
      if (mapRef.current && route.bounds) {
        mapRef.current.fitBounds(route.bounds)
      }
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
    setShowOriginSuggestions(false)
    setShowDestinationSuggestions(false)

    // Resetear el mapa al centro original
    if (mapRef.current) {
      mapRef.current.setCenter(center)
      mapRef.current.setZoom(13)
    }
  }

  const getDirectionsOptions = () => {
    const selectedMode = transportModes.find((mode) => mode.key === travelMode)
    return {
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: selectedMode?.color || "#4285F4",
        strokeWeight: 6,
        strokeOpacity: 0.8,
      },
      markerOptions: {
        origin: {
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#28a745",
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
          },
        },
        destination: {
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#dc3545",
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
          },
        },
      },
    }
  }

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      setShowOriginSuggestions(false)
      setShowDestinationSuggestions(false)
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  return (
    <div className="advanced-routes-container">
      <div className="advanced-controls">
        <div className="search-section">
          <div className="search-group">
            <label htmlFor="origin-search">
              <span className="origin-icon address-icon"></span>
              Punto de origen
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="origin-search"
                type="text"
                className={`search-input ${origin ? "has-value" : ""}`}
                value={origin}
                onChange={handleOriginChange}
                placeholder="Buscar dirección de origen..."
                onClick={(e) => e.stopPropagation()}
              />
              {showOriginSuggestions && originSuggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {originSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={(e) => {
                        e.stopPropagation()
                        selectSuggestion(suggestion, true)
                      }}
                    >
                      <span className="suggestion-icon">📍</span>
                      <div className="suggestion-text">
                        <div className="suggestion-main">{suggestion.name}</div>
                        <div className="suggestion-secondary">{suggestion.address}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="search-group">
            <label htmlFor="destination-search">
              <span className="destination-icon address-icon"></span>
              Punto de destino
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="destination-search"
                type="text"
                className={`search-input ${destination ? "has-value" : ""}`}
                value={destination}
                onChange={handleDestinationChange}
                placeholder="Buscar dirección de destino..."
                onClick={(e) => e.stopPropagation()}
              />
              {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {destinationSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={(e) => {
                        e.stopPropagation()
                        selectSuggestion(suggestion, false)
                      }}
                    >
                      <span className="suggestion-icon">📍</span>
                      <div className="suggestion-text">
                        <div className="suggestion-main">{suggestion.name}</div>
                        <div className="suggestion-secondary">{suggestion.address}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="transport-modes">
          {transportModes.map((mode) => (
            <button
              key={mode.key}
              className={`transport-button ${travelMode === mode.key ? "active" : ""}`}
              onClick={() => setTravelMode(mode.key)}
            >
              <span className="transport-icon">{mode.icon}</span>
              <span className="transport-label">{mode.label}</span>
            </button>
          ))}
        </div>

        <div className="action-section">
          <button
            className="calculate-route-button"
            onClick={calculateRoute}
            disabled={isCalculating || !origin || !destination}
          >
            {isCalculating ? (
              <>
                <div className="loading-spinner"></div>
                Calculando...
              </>
            ) : (
              <>🗺️ Calcular Ruta</>
            )}
          </button>
          <button className="clear-route-button" onClick={clearRoute}>
            🗑️ Limpiar
          </button>
        </div>

        {isCalculating && (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <span>Calculando la mejor ruta...</span>
          </div>
        )}

        {error && <div className="error-message">⚠️ {error}</div>}

        {routeInfo && (
          <div className="route-summary">
            <h4>
              📊 Resumen de la Ruta
              {transportModes.find((mode) => mode.key === travelMode)?.icon}
            </h4>
            <div className="route-stats">
              <div className="route-stat">
                <div className="stat-value">{routeInfo.distance}</div>
                <div className="stat-label">Distancia Total</div>
              </div>
              <div className="route-stat">
                <div className="stat-value">{routeInfo.duration}</div>
                <div className="stat-label">Tiempo Estimado</div>
              </div>
              <div className="route-stat">
                <div className="stat-value">{routeInfo.steps}</div>
                <div className="stat-label">Pasos de Navegación</div>
              </div>
            </div>
            <div className="route-details">
              <div className="route-addresses">
                <div className="address-item">
                  <span className="origin-icon address-icon"></span>
                  <strong>Desde:</strong> {routeInfo.startAddress}
                </div>
                <div className="address-item">
                  <span className="destination-icon address-icon"></span>
                  <strong>Hasta:</strong> {routeInfo.endAddress}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="map-advanced-routes-container">
        <LoadScript
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          libraries={libraries}
          loadingElement={
            <div className="loading-map">
              <div className="map-spinner"></div>
              <p>Cargando mapa avanzado...</p>
            </div>
          }
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
            onLoad={onLoad}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: true,
              fullscreenControl: true,
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "simplified" }],
                },
              ],
            }}
          >
            {directions && <DirectionsRenderer directions={directions} options={getDirectionsOptions()} />}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  )
}

export default MapaRutasAvanzadas
