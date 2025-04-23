/*
// src/Components/ItemCadete.jsx
import React, { useRef, useState } from "react";
import Ticket from "./Ticket";
import { updateCadeteStat, getCadeteStats } from "../utils/stats";

const ItemCadete = ({ empleado, removeHabilitado, onFocusAfterDelete }) => {
  const ticketRef = useRef(null);

  // Clave para las estadísticas del día actual: YYYY-MM-DD
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayKey = `${yyyy}-${mm}-${dd}`;

  // Inicializar printDisabled según cuántas veces ya se imprimió hoy
  const stats = getCadeteStats();
  const printedToday = stats[todayKey]?.[empleado.id]?.printCount || 0;
  const [printDisabled, setPrintDisabled] = useState(printedToday > 0);

  // Eliminar cadete y actualizar estadísticas de eliminación
  const handleDeleteLocal = () => {
    updateCadeteStat(empleado.id, "deletionCount");
    removeHabilitado(empleado.id);
    onFocusAfterDelete && onFocusAfterDelete();
  };

  // Imprimir ticket y actualizar estadísticas de impresión
  const handlePrint = () => {
    if (!ticketRef.current) return;
    setPrintDisabled(true);

    const printContents = ticketRef.current.innerHTML;
    const printWindow = window.open("", "", "width=300,height=600");
    printWindow.document.write("<html><head><title>Ticket</title>");
    printWindow.document.write(`
      <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        .ticket { width: 80mm; }
      </style>
    `);
    printWindow.document.write("</head><body>");
    printWindow.document.write(`<div class='ticket'>${printContents}</div>`);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      updateCadeteStat(empleado.id, "printCount");
      onFocusAfterDelete && onFocusAfterDelete();
    }, 500);
  };

  return (
    <div className="spectacular-card">
      <div className="card-info">
        <span><strong>ID:</strong> {empleado.id}</span>
        <span><strong>Nombre:</strong> {empleado["nombre y apellido"]}</span>
        <span><strong>Movilidad:</strong> {empleado.movilidad}</span>
        <span><strong>Hora:</strong> {empleado.horario}</span>
      </div>

      
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
        <div ref={ticketRef}>
          <Ticket empleado={empleado} />
        </div>
      </div>

      <div className="card-buttons">
        <button
          className="btn btn-imprimir"
          onClick={handlePrint}
          disabled={printDisabled}
        >
          Imprimir
        </button>
        <button className="btn btn-delete" onClick={handleDeleteLocal}>
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default ItemCadete;
*/
// src/Components/ItemCadete.jsx
import React, { useRef, useState } from "react";
import Ticket from "./Ticket";
import { updateCadeteStat, getCadeteStats } from "../utils/stats";

const ItemCadete = ({ empleado, removeHabilitado, onFocusAfterDelete }) => {
  const ticketRef = useRef(null);

  // Clave para las estadísticas del día actual: YYYY-MM-DD
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayKey = `${yyyy}-${mm}-${dd}`;

  // Inicializar printDisabled según si ya se imprimió hoy
  const stats = getCadeteStats();
  const printedToday = stats[todayKey]?.[empleado.id]?.printCount || 0;
  const [printDisabled, setPrintDisabled] = useState(printedToday > 0);

  // Maneja la eliminación y actualiza estadísticas
  const handleDeleteLocal = () => {
    // Incrementar contador de eliminaciones
    updateCadeteStat(empleado.id, "deletionCount");

    // Restablecer contador de impresión para este cadete en la fecha actual
    const statsRaw = localStorage.getItem("cadeteStats") || "{}";
    const statsObj = JSON.parse(statsRaw);
    if (statsObj[todayKey] && statsObj[todayKey][empleado.id]) {
      statsObj[todayKey][empleado.id].printCount = 0;
      localStorage.setItem("cadeteStats", JSON.stringify(statsObj));
    }

    // Reactivar botón de impresión
    setPrintDisabled(false);

    // Eliminar cadete de la lista
    removeHabilitado(empleado.id);
    onFocusAfterDelete && onFocusAfterDelete();
  };

  // Maneja impresión nativa y actualiza estadísticas
  const handlePrint = () => {
    if (!ticketRef.current) return;
    setPrintDisabled(true);

    // Captura el HTML del ticket
    const printContents = ticketRef.current.innerHTML;
    const printWindow = window.open("", "", "width=300,height=600");
    printWindow.document.write("<html><head><title>Ticket</title>");
    printWindow.document.write(`
      <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        .ticket { width: 80mm; }
      </style>
    `);
    printWindow.document.write("</head><body>");
    printWindow.document.write(`<div class='ticket'>${printContents}</div>`);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();

      // Incrementar contador de impresiones
      updateCadeteStat(empleado.id, "printCount");

      onFocusAfterDelete && onFocusAfterDelete();
    }, 500);
  };

  return (
    <div className="spectacular-card">
      <div className="card-info">
        <span><strong>ID:</strong> {empleado.id}</span>
        <span><strong>Nombre:</strong> {empleado["nombre y apellido"]}</span>
        <span><strong>Movilidad:</strong> {empleado.movilidad}</span>
        <span><strong>Hora:</strong> {empleado.horario}</span>
      </div>

      {/* Ticket oculto para impresión */}
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
        <div ref={ticketRef}>
          <Ticket empleado={empleado} />
        </div>
      </div>

      <div className="card-buttons">
        <button
          className="btn btn-imprimir"
          onClick={handlePrint}
          disabled={printDisabled}
        >
          Imprimir
        </button>
        <button className="btn btn-delete" onClick={handleDeleteLocal}>
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default ItemCadete;
