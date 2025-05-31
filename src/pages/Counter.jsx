"use client"

import { useState } from "react"
import "./Counter.css"

function Counter() {
  const [count, setCount] = useState(0)

  const handleIncrement = () => {
    if (count < 10) {
      setCount(count + 1)
    }
    if (count + 1 === 10) {
      alert("¡Has llegado al límite!")
    }
  }

  const handleReset = () => {
    setCount(0)
  }

  return (
    <div className="page">
      <h1>Contador</h1>
      <div className="counter-container">
        <div className="counter-display">
          <span className="count-number">{count}</span>
          <span className="count-label">/ 10</span>
        </div>

        <div className="counter-buttons">
          <button className="counter-button" onClick={handleIncrement} disabled={count >= 10}>
            {count >= 10 ? "Límite alcanzado" : "Incrementar"}
          </button>

          {count > 0 && (
            <button className="reset-button" onClick={handleReset}>
              Reiniciar
            </button>
          )}
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(count / 10) * 100}%` }}></div>
        </div>
      </div>
    </div>
  )
}

export default Counter
