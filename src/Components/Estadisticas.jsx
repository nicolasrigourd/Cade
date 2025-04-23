// src/Components/Estadisticas.jsx
import React, { useState, useEffect } from "react";
import { getCadeteStats } from "../utils/stats";

export default function Estadisticas() {
  const [stats, setStats] = useState({});
  const [cadetes, setCadetes] = useState([]);

  useEffect(() => {
    // Cargo las estadísticas diarias
    setStats(getCadeteStats());
    // Cargo la base de cadetes para obtener nombres
    const raw = localStorage.getItem("bdcadetes") || "[]";
    setCadetes(JSON.parse(raw));
  }, []);

  // Transformo a filas
  const rows = Object.entries(stats).flatMap(([fecha, dayStats]) =>
    Object.entries(dayStats).map(([id, { deletionCount, printCount }]) => {
      const cad = cadetes.find(c => c.id.toString() === id) || {};
      return { fecha, id, name: cad["nombre y apellido"] || "-", deletionCount, printCount };
    })
  );

  const totalElims = rows.reduce((sum, r) => sum + r.deletionCount, 0);
  const totalPrints = rows.reduce((sum, r) => sum + r.printCount, 0);

  return (
    <div style={{ padding: 20 }}>
      <h1>Estadísticas Diarias de Cadetes</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>ID</th>
            <th>Nombre</th>
            <th>Eliminaciones</th>
            <th>Impresiones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #ccc" }}>
              <td>{r.fecha}</td>
              <td>{r.id}</td>
              <td>{r.name}</td>
              <td>{r.deletionCount}</td>
              <td>{r.printCount}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: "bold" }}>
            <td colSpan={3}>Totales</td>
            <td>{totalElims}</td>
            <td>{totalPrints}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
