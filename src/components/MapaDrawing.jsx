"use client"

import { useState, useCallback, useRef } from "react"
import { GoogleMap, LoadScript, DrawingManager } from "@react-google-maps/api"

const containerStyle = {
  width: "100%",
  height: "100%",
}

const center = {
  lat: 23.254599621157592,
  lng: -106.41165473348944,
}

const libraries = ["drawing", "geometry"]

const drawingTools = [
  { key: "polygon", label: "Polígono", icon: "⬟" },
  { key: "rectangle", label: "Rectángulo", icon: "⬜" },
  { key: "circle", label: "Círculo", icon: "⭕" },
  { key: "polyline", label: "Línea", icon: "📏" },
  { key: "marker", label: "Marcador", icon: "📍" },
]

function MapaDrawing() {
  const [drawingMode, setDrawingMode] = useState(null)
  const [shapes, setShapes] = useState([])
  const [isMapStatic, setIsMapStatic] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)

  const mapRef = useRef(null)
  const drawingManagerRef = useRef(null)

  const onLoad = useCallback((map) => {
    mapRef.current = map
    setMapLoaded(true)
  }, [])

  const onDrawingManagerLoad = useCallback((drawingManager) => {
    drawingManagerRef.current = drawingManager
  }, [])

  const onOverlayComplete = useCallback((event) => {
    const { type, overlay } = event

    let coordinates = []
    let area = null
    let length = null
    let radius = null
    let center = null

    switch (type) {
      case "polygon":
        const polygonPath = overlay.getPath()
        coordinates = polygonPath.getArray().map((latLng) => ({
          lat: latLng.lat(),
          lng: latLng.lng(),
        }))
        area = window.google.maps.geometry.spherical.computeArea(polygonPath)
        break

      case "rectangle":
        const bounds = overlay.getBounds()
        const ne = bounds.getNorthEast()
        const sw = bounds.getSouthWest()
        coordinates = [
          { lat: ne.lat(), lng: ne.lng() },
          { lat: ne.lat(), lng: sw.lng() },
          { lat: sw.lat(), lng: sw.lng() },
          { lat: sw.lat(), lng: ne.lng() },
        ]
        area = window.google.maps.geometry.spherical.computeArea([
          new window.google.maps.LatLng(ne.lat(), ne.lng()),
          new window.google.maps.LatLng(ne.lat(), sw.lng()),
          new window.google.maps.LatLng(sw.lat(), sw.lng()),
          new window.google.maps.LatLng(sw.lat(), ne.lng()),
        ])
        break

      case "circle":
        center = {
          lat: overlay.getCenter().lat(),
          lng: overlay.getCenter().lng(),
        }
        radius = overlay.getRadius()
        area = Math.PI * radius * radius
        break

      case "polyline":
        const polylinePath = overlay.getPath()
        coordinates = polylinePath.getArray().map((latLng) => ({
          lat: latLng.lat(),
          lng: latLng.lng(),
        }))
        length = window.google.maps.geometry.spherical.computeLength(polylinePath)
        break

      case "marker":
        coordinates = [
          {
            lat: overlay.getPosition().lat(),
            lng: overlay.getPosition().lng(),
          },
        ]
        break

      default:
        break
    }

    const newShape = {
      id: Date.now(),
      type,
      overlay,
      coordinates,
      area,
      length,
      radius,
      center,
      createdAt: new Date().toLocaleTimeString(),
    }

    setShapes((prev) => [...prev, newShape])

    // Resetear el modo de dibujo
    setDrawingMode(null)
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setDrawingMode(null)
    }
  }, [])

  const deleteShape = useCallback((shapeId) => {
    setShapes((prev) => {
      const shapeToDelete = prev.find((shape) => shape.id === shapeId)
      if (shapeToDelete && shapeToDelete.overlay) {
        shapeToDelete.overlay.setMap(null)
      }
      return prev.filter((shape) => shape.id !== shapeId)
    })
  }, [])

  const clearAllShapes = useCallback(() => {
    shapes.forEach((shape) => {
      if (shape.overlay) {
        shape.overlay.setMap(null)
      }
    })
    setShapes([])
  }, [shapes])

  const setDrawingTool = useCallback(
    (tool) => {
      console.log("Seleccionando herramienta:", tool)

      // Si ya está activa la misma herramienta, la desactivamos
      if (drawingMode === tool) {
        setDrawingMode(null)
        if (drawingManagerRef.current) {
          drawingManagerRef.current.setDrawingMode(null)
        }
        return
      }

      // Activar nueva herramienta
      setDrawingMode(tool)

      // Esperar a que el DrawingManager esté listo
      setTimeout(() => {
        if (drawingManagerRef.current && window.google?.maps?.drawing) {
          let googleMapsMode = null

          switch (tool) {
            case "polygon":
              googleMapsMode = window.google.maps.drawing.OverlayType.POLYGON
              break
            case "rectangle":
              googleMapsMode = window.google.maps.drawing.OverlayType.RECTANGLE
              break
            case "circle":
              googleMapsMode = window.google.maps.drawing.OverlayType.CIRCLE
              break
            case "polyline":
              googleMapsMode = window.google.maps.drawing.OverlayType.POLYLINE
              break
            case "marker":
              googleMapsMode = window.google.maps.drawing.OverlayType.MARKER
              break
            default:
              googleMapsMode = null
          }

          console.log("Activando modo:", googleMapsMode)
          drawingManagerRef.current.setDrawingMode(googleMapsMode)
        }
      }, 100)
    },
    [drawingMode],
  )

  const toggleMapStatic = useCallback(() => {
    setIsMapStatic((prev) => !prev)
  }, [])

  const formatCoordinate = (coord) => {
    return `${coord.lat.toFixed(6)}, ${coord.lng.toFixed(6)}`
  }

  const formatArea = (area) => {
    if (area < 1000000) {
      return `${(area / 1000000).toFixed(2)} km²`
    }
    return `${area.toFixed(0)} m²`
  }

  const formatLength = (length) => {
    if (length < 1000) {
      return `${length.toFixed(0)} m`
    }
    return `${(length / 1000).toFixed(2)} km`
  }

  const getShapeIcon = (type) => {
    const tool = drawingTools.find((t) => t.key === type)
    return tool ? tool.icon : "📐"
  }

  return (
    <div className="drawing-container">
      <div className="drawing-controls">
        <div className="controls-header">
          <h3>Herramientas de Dibujo</h3>

          <div className="drawing-instructions">
            💡 <strong>Instrucciones:</strong>
            <br />
            1. Selecciona una herramienta de dibujo
            <br />
            2. Haz clic en el mapa para dibujar
            <br />
            3. Para polígonos y líneas, haz doble clic para finalizar
          </div>

          <div className="drawing-tools">
            {drawingTools.map((tool) => (
              <button
                key={tool.key}
                className={`tool-button ${drawingMode === tool.key ? "active" : ""}`}
                onClick={() => setDrawingTool(tool.key)}
              >
                <span className="tool-icon">{tool.icon}</span>
                <span>{tool.label}</span>
              </button>
            ))}
          </div>

          <div className="drawing-status">
            {drawingMode ? (
              <div
                style={{
                  padding: "0.75rem",
                  backgroundColor: "#d4edda",
                  border: "1px solid #c3e6cb",
                  borderRadius: "6px",
                  color: "#155724",
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                🎨 Modo activo: {drawingMode.toUpperCase()}
                <br />
                <small>Haz clic en el mapa para dibujar</small>
              </div>
            ) : (
              <div
                style={{
                  padding: "0.75rem",
                  backgroundColor: "#fff3cd",
                  border: "1px solid #ffeaa7",
                  borderRadius: "6px",
                  color: "#856404",
                  textAlign: "center",
                }}
              >
                Selecciona una herramienta para comenzar a dibujar
              </div>
            )}
          </div>

          <button
            className="control-button"
            onClick={() => {
              console.log("Estado actual:", {
                drawingMode,
                mapLoaded,
                drawingManagerRef: !!drawingManagerRef.current,
                googleMaps: !!window.google?.maps?.drawing,
              })

              if (!drawingMode) {
                alert("Primero selecciona una herramienta de dibujo")
                return
              }

              if (!drawingManagerRef.current) {
                alert("El DrawingManager no está listo. Espera un momento e intenta de nuevo.")
                return
              }

              // Forzar activación del modo de dibujo
              setDrawingTool(drawingMode)
            }}
            style={{
              backgroundColor: drawingMode ? "#28a745" : "#6c757d",
              color: "white",
              fontWeight: "600",
              marginTop: "0.5rem",
            }}
          >
            🎨 {drawingMode ? `Activar ${drawingMode}` : "Selecciona herramienta"}
          </button>

          <div className="map-controls">
            <button
              className={`control-button ${isMapStatic ? "active" : ""}`}
              onClick={toggleMapStatic}
              title="Bloquear/Desbloquear mapa para dibujar"
            >
              {isMapStatic ? "🔒 Bloqueado" : "🔓 Libre"}
            </button>
          </div>
        </div>

        <div className="shapes-panel">
          <div className="shapes-header">
            <h4>Formas Dibujadas ({shapes.length})</h4>
            {shapes.length > 0 && (
              <button className="clear-all-button" onClick={clearAllShapes}>
                Limpiar Todo
              </button>
            )}
          </div>

          <div className="shapes-list">
            {shapes.length === 0 ? (
              <div className="no-shapes">No hay formas dibujadas</div>
            ) : (
              shapes.map((shape) => (
                <div key={shape.id} className="shape-item">
                  <div className="shape-header">
                    <div className="shape-title">
                      <span>{getShapeIcon(shape.type)}</span>
                      <span className="shape-type">{shape.type.toUpperCase()}</span>
                    </div>
                    <button className="delete-shape-button" onClick={() => deleteShape(shape.id)}>
                      🗑️
                    </button>
                  </div>

                  <div className="shape-info">
                    <strong>Creado:</strong> {shape.createdAt}
                    <br />
                    {shape.area && (
                      <>
                        <strong>Área:</strong> {formatArea(shape.area)}
                        <br />
                      </>
                    )}
                    {shape.length && (
                      <>
                        <strong>Longitud:</strong> {formatLength(shape.length)}
                        <br />
                      </>
                    )}
                    {shape.radius && (
                      <>
                        <strong>Radio:</strong> {formatLength(shape.radius)}
                        <br />
                      </>
                    )}
                  </div>

                  <div className="coordinates-list">
                    <strong>Coordenadas:</strong>
                    {shape.center ? (
                      <div className="coordinate-item">Centro: {formatCoordinate(shape.center)}</div>
                    ) : (
                      shape.coordinates.map((coord, index) => (
                        <div key={index} className="coordinate-item">
                          {index + 1}: {formatCoordinate(coord)}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="map-drawing-container">
        <LoadScript
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          libraries={libraries}
          loadingElement={
            <div className="loading-map">
              <div className="map-spinner"></div>
              <p>Cargando herramientas de dibujo...</p>
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
              draggable: !isMapStatic,
              scrollwheel: !isMapStatic,
              disableDoubleClickZoom: false,
              gestureHandling: isMapStatic ? "cooperative" : "auto",
            }}
          >
            {mapLoaded && (
              <DrawingManager
                onLoad={onDrawingManagerLoad}
                onOverlayComplete={onOverlayComplete}
                options={{
                  drawingControl: false,
                  drawingControlOptions: {
                    position: window.google.maps.ControlPosition.TOP_CENTER,
                  },
                  polygonOptions: {
                    fillColor: "#4285F4",
                    fillOpacity: 0.3,
                    strokeWeight: 2,
                    strokeColor: "#4285F4",
                    clickable: true,
                    editable: true,
                    zIndex: 1,
                  },
                  rectangleOptions: {
                    fillColor: "#EA4335",
                    fillOpacity: 0.3,
                    strokeWeight: 2,
                    strokeColor: "#EA4335",
                    clickable: true,
                    editable: true,
                    zIndex: 1,
                  },
                  circleOptions: {
                    fillColor: "#FBBC04",
                    fillOpacity: 0.3,
                    strokeWeight: 2,
                    strokeColor: "#FBBC04",
                    clickable: true,
                    editable: true,
                    zIndex: 1,
                  },
                  polylineOptions: {
                    strokeColor: "#34A853",
                    strokeWeight: 3,
                    clickable: true,
                    editable: true,
                    zIndex: 1,
                  },
                  markerOptions: {
                    draggable: true,
                    clickable: true,
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

export default MapaDrawing
