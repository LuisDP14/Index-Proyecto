"use client"

import { useState, useCallback, useMemo } from "react"
import { GoogleMap, LoadScript, Marker, InfoWindow, MarkerClusterer } from "@react-google-maps/api"

const containerStyle = {
  width: "100%",
  height: "600px",
}

const center = {
  lat: 23.254599621157592,
  lng: -106.41165473348944,
}

// Datos de ejemplo con múltiples ubicaciones en Mazatlán y alrededores
const locations = [
  // Hoteles
  {
    id: 1,
    lat: 23.2494,
    lng: -106.4103,
    type: "hotel",
    name: "Hotel Playa Mazatlán",
    description: "Hotel frente al mar con vista espectacular",
  },
  {
    id: 2,
    lat: 23.2066,
    lng: -106.4194,
    type: "hotel",
    name: "Resort Pueblo Bonito",
    description: "Resort de lujo en la Zona Dorada",
  },
  {
    id: 3,
    lat: 23.2433,
    lng: -106.4261,
    type: "hotel",
    name: "Hotel Belmar",
    description: "Hotel histórico en el centro de la ciudad",
  },
  {
    id: 4,
    lat: 23.1886,
    lng: -106.4408,
    type: "hotel",
    name: "Hotel Cerritos",
    description: "Hotel boutique cerca de Playa Cerritos",
  },

  // Restaurantes
  {
    id: 5,
    lat: 23.2456,
    lng: -106.4123,
    type: "restaurant",
    name: "Mariscos El Muchacho",
    description: "Auténticos mariscos mazatlecos",
  },
  {
    id: 6,
    lat: 23.2398,
    lng: -106.4187,
    type: "restaurant",
    name: "La Casa Country",
    description: "Restaurante de comida internacional",
  },
  {
    id: 7,
    lat: 23.2511,
    lng: -106.4089,
    type: "restaurant",
    name: "El Shrimp Bucket",
    description: "Famoso restaurante de mariscos",
  },
  {
    id: 8,
    lat: 23.2067,
    lng: -106.4201,
    type: "restaurant",
    name: "Joe's Oyster Bar",
    description: "Bar de ostras y mariscos frescos",
  },
  {
    id: 9,
    lat: 23.2445,
    lng: -106.4234,
    type: "restaurant",
    name: "Pedro & Lola",
    description: "Cocina gourmet mexicana",
  },

  // Atracciones
  {
    id: 10,
    lat: 23.2433,
    lng: -106.4261,
    type: "attraction",
    name: "Teatro Ángela Peralta",
    description: "Teatro histórico del siglo XIX",
  },
  {
    id: 11,
    lat: 23.2456,
    lng: -106.4198,
    type: "attraction",
    name: "Catedral de Mazatlán",
    description: "Hermosa catedral neogótica",
  },
  {
    id: 12,
    lat: 23.2511,
    lng: -106.4089,
    type: "attraction",
    name: "Malecón de Mazatlán",
    description: "Paseo costero más largo del mundo",
  },
  {
    id: 13,
    lat: 23.1967,
    lng: -106.4234,
    type: "attraction",
    name: "Acuario Mazatlán",
    description: "Acuario con especies marinas locales",
  },
  {
    id: 14,
    lat: 23.2789,
    lng: -106.4567,
    type: "attraction",
    name: "Faro de Mazatlán",
    description: "Faro histórico con vista panorámica",
  },

  // Playas
  {
    id: 15,
    lat: 23.1886,
    lng: -106.4408,
    type: "beach",
    name: "Playa Cerritos",
    description: "Playa popular para surf y deportes acuáticos",
  },
  {
    id: 16,
    lat: 23.2067,
    lng: -106.4201,
    type: "beach",
    name: "Playa Norte",
    description: "Playa tranquila ideal para familias",
  },
  {
    id: 17,
    lat: 23.2494,
    lng: -106.4103,
    type: "beach",
    name: "Playa Gaviotas",
    description: "Playa en la Zona Dorada con muchos servicios",
  },
  {
    id: 18,
    lat: 23.2789,
    lng: -106.4567,
    type: "beach",
    name: "Playa Olas Altas",
    description: "Playa histórica con ambiente bohemio",
  },

  // Tiendas
  {
    id: 19,
    lat: 23.2066,
    lng: -106.4194,
    type: "shopping",
    name: "La Gran Plaza",
    description: "Centro comercial principal",
  },
  {
    id: 20,
    lat: 23.2433,
    lng: -106.4261,
    type: "shopping",
    name: "Mercado Central",
    description: "Mercado tradicional con artesanías",
  },
  {
    id: 21,
    lat: 23.2398,
    lng: -106.4187,
    type: "shopping",
    name: "Plaza Machado",
    description: "Plaza histórica con tiendas y cafés",
  },
  {
    id: 22,
    lat: 23.2511,
    lng: -106.4089,
    type: "shopping",
    name: "Zona Dorada Shopping",
    description: "Tiendas y boutiques en zona turística",
  },

  // Ubicaciones adicionales para demostrar clustering
  {
    id: 23,
    lat: 23.2567,
    lng: -106.4123,
    type: "restaurant",
    name: "Restaurante Vista Mar",
    description: "Comida con vista al océano",
  },
  {
    id: 24,
    lat: 23.2345,
    lng: -106.4298,
    type: "hotel",
    name: "Hotel Centro Histórico",
    description: "Hotel boutique en el corazón de la ciudad",
  },
  {
    id: 25,
    lat: 23.2678,
    lng: -106.4456,
    type: "attraction",
    name: "Mirador El Faro",
    description: "Punto de observación panorámico",
  },
  {
    id: 26,
    lat: 23.1789,
    lng: -106.4567,
    type: "beach",
    name: "Playa Brujas",
    description: "Playa apartada y natural",
  },
  {
    id: 27,
    lat: 23.2123,
    lng: -106.4089,
    type: "shopping",
    name: "Artesanías Mazatlán",
    description: "Tienda de artesanías locales",
  },
  {
    id: 28,
    lat: 23.2789,
    lng: -106.4234,
    type: "restaurant",
    name: "Café Pacífico",
    description: "Café con especialidades locales",
  },
  {
    id: 29,
    lat: 23.2456,
    lng: -106.4567,
    type: "hotel",
    name: "Posada del Mar",
    description: "Hotel familiar frente al mar",
  },
  {
    id: 30,
    lat: 23.2234,
    lng: -106.4345,
    type: "attraction",
    name: "Museo de Arte",
    description: "Museo con arte local y nacional",
  },
]

const typeColors = {
  hotel: "#4285F4",
  restaurant: "#EA4335",
  attraction: "#FBBC04",
  beach: "#34A853",
  shopping: "#9C27B0",
}

const typeLabels = {
  hotel: "🏨 Hoteles",
  restaurant: "🍽️ Restaurantes",
  attraction: "🎭 Atracciones",
  beach: "🏖️ Playas",
  shopping: "🛍️ Compras",
}

function MapaClusters() {
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [activeFilters, setActiveFilters] = useState(["hotel", "restaurant", "attraction", "beach", "shopping"])
  const [clusterSize, setClusterSize] = useState("medium")
  const [mapLoaded, setMapLoaded] = useState(false)

  const onLoad = useCallback(() => {
    setMapLoaded(true)
  }, [])

  const filteredLocations = useMemo(() => {
    return locations.filter((location) => activeFilters.includes(location.type))
  }, [activeFilters])

  const toggleFilter = (type) => {
    setActiveFilters((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const clusterOptions = useMemo(() => {
    const sizes = {
      small: { gridSize: 30, maxZoom: 15 },
      medium: { gridSize: 60, maxZoom: 13 },
      large: { gridSize: 100, maxZoom: 11 },
    }

    return {
      gridSize: sizes[clusterSize].gridSize,
      maxZoom: sizes[clusterSize].maxZoom,
      styles: [
        {
          textColor: "white",
          url: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Ccircle cx="20" cy="20" r="18" fill="%234285F4" stroke="white" strokeWidth="2"/%3E%3C/svg%3E',
          height: 40,
          width: 40,
          textSize: 12,
        },
        {
          textColor: "white",
          url: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"%3E%3Ccircle cx="25" cy="25" r="23" fill="%23EA4335" stroke="white" strokeWidth="2"/%3E%3C/svg%3E',
          height: 50,
          width: 50,
          textSize: 14,
        },
        {
          textColor: "white",
          url: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Ccircle cx="30" cy="30" r="28" fill="%23FBBC04" stroke="white" strokeWidth="2"/%3E%3C/svg%3E',
          height: 60,
          width: 60,
          textSize: 16,
        },
      ],
    }
  }, [clusterSize])

  const onMarkerClick = (location) => {
    setSelectedMarker(location)
  }

  const onInfoWindowClose = () => {
    setSelectedMarker(null)
  }

  const getMarkerIcon = (type) => {
    const color = typeColors[type]
    return {
      url: `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"%3E%3Ccircle cx="12" cy="12" r="10" fill="${encodeURIComponent(color)}" stroke="white" strokeWidth="2"/%3E%3C/svg%3E`,
      scaledSize: new window.google.maps.Size(24, 24),
    }
  }

  const stats = useMemo(() => {
    const total = filteredLocations.length
    const byType = activeFilters.reduce((acc, type) => {
      acc[type] = filteredLocations.filter((loc) => loc.type === type).length
      return acc
    }, {})

    return { total, byType }
  }, [filteredLocations, activeFilters])

  return (
    <div className="clusters-container">
      <div className="clusters-controls">
        <div className="controls-grid">
          <div className="control-group">
            <label htmlFor="cluster-size">Tamaño de Cluster</label>
            <select
              id="cluster-size"
              className="control-select"
              value={clusterSize}
              onChange={(e) => setClusterSize(e.target.value)}
            >
              <option value="small">Pequeño (más clusters)</option>
              <option value="medium">Mediano (balanceado)</option>
              <option value="large">Grande (menos clusters)</option>
            </select>
          </div>
        </div>

        <div className="filter-buttons">
          {Object.entries(typeLabels).map(([type, label]) => (
            <button
              key={type}
              className={`filter-button ${activeFilters.includes(type) ? "active" : ""}`}
              onClick={() => toggleFilter(type)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="stats-info">
          <div className="stat-item">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Ubicaciones</div>
          </div>
          {Object.entries(stats.byType).map(([type, count]) => (
            <div key={type} className="stat-item">
              <div className="stat-number">{count}</div>
              <div className="stat-label">{typeLabels[type]}</div>
            </div>
          ))}
        </div>

        <div className="legend">
          <strong>Leyenda:</strong>
          {Object.entries(typeColors).map(([type, color]) => (
            <div key={type} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: color }}></div>
              <span>{typeLabels[type]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="map-clusters-container">
        <LoadScript
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          onLoad={onLoad}
          loadingElement={
            <div className="loading-map">
              <div className="map-spinner"></div>
              <p>Cargando mapa con clusters...</p>
            </div>
          }
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: true,
              fullscreenControl: true,
            }}
          >
            <MarkerClusterer options={clusterOptions}>
              {(clusterer) =>
                filteredLocations.map((location) => (
                  <Marker
                    key={location.id}
                    position={{ lat: location.lat, lng: location.lng }}
                    title={location.name}
                    icon={getMarkerIcon(location.type)}
                    onClick={() => onMarkerClick(location)}
                    clusterer={clusterer}
                  />
                ))
              }
            </MarkerClusterer>

            {selectedMarker && (
              <InfoWindow
                position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                onCloseClick={onInfoWindowClose}
              >
                <div
                  style={{
                    padding: "12px",
                    maxWidth: "280px",
                    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 8px 0",
                      color: "#495057",
                      fontSize: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: typeColors[selectedMarker.type],
                      }}
                    ></span>
                    {selectedMarker.name}
                  </h3>
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      color: "#6c757d",
                      fontSize: "14px",
                      lineHeight: "1.4",
                    }}
                  >
                    {selectedMarker.description}
                  </p>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#adb5bd",
                      fontWeight: "600",
                      textTransform: "uppercase",
                    }}
                  >
                    {typeLabels[selectedMarker.type]}
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  )
}

export default MapaClusters
