import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Counter from "./pages/Counter"
import About from "./pages/About"
import Contact from "./pages/Contact"
import Maps from "./pages/Maps"
import RoutesComponent from "./pages/Routes"
import Clusters from "./pages/Clusters"
import Drawing from "./pages/Drawing"
import AdvancedRoutes from "./pages/AdvancedRoutes"
import "./App.css"

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/counter" element={<Counter />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/maps" element={<Maps />} />
            <Route path="/routes" element={<RoutesComponent />} />
            <Route path="/clusters" element={<Clusters />} />
            <Route path="/drawing" element={<Drawing />} />
            <Route path="/advanced-routes" element={<AdvancedRoutes />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
