// src/utils/stats.js

/**
 * Incrementa el contador de una estadística (deletionCount o printCount)
 * para un cadete identificado por cadeteId, dentro del objeto del día actual.
 */
export function updateCadeteStat(cadeteId, field) {
    // Leer o inicializar el objeto completo de estadísticas
    const raw = localStorage.getItem("cadeteStats") || "{}";
    const stats = JSON.parse(raw);
  
    // Clave de hoy en formato YYYY-MM-DD
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${d}`;
  
    // Asegurarnos de que exista el objeto del día
    if (!stats[key]) stats[key] = {};
  
    // Asegurarnos de que exista la entrada de este cadete
    if (!stats[key][cadeteId]) {
      stats[key][cadeteId] = { deletionCount: 0, printCount: 0 };
    }
  
    // Incrementar la propiedad solicitada
    stats[key][cadeteId][field] = (stats[key][cadeteId][field] || 0) + 1;
  
    // Guardar de nuevo en localStorage
    localStorage.setItem("cadeteStats", JSON.stringify(stats));
  }
  
  /**
   * Devuelve todo el objeto cadeteStats de localStorage (o {} si no existe).
   */
  export function getCadeteStats() {
    return JSON.parse(localStorage.getItem("cadeteStats") || "{}");
  }
  