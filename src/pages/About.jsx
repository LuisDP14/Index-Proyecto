function About() {
  const personas = [
    { nombre: "Ana", apellido: "García", edad: 28 },
    { nombre: "Carlos", apellido: "Rodríguez", edad: 35 },
    { nombre: "María", apellido: "López", edad: 22 },
    { nombre: "José", apellido: "Martínez", edad: 41 },
    { nombre: "Laura", apellido: "Sánchez", edad: 29 },
  ]

  return (
    <div className="page">
      <h1>Lista de Personas</h1>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Edad</th>
            </tr>
          </thead>
          <tbody>
            {personas.map((persona, index) => (
              <tr key={index}>
                <td>{persona.nombre}</td>
                <td>{persona.apellido}</td>
                <td>{persona.edad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default About
