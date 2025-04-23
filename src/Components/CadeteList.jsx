/*
// src/Components/CadeteList.jsx
import React, { useRef } from "react";
import ItemCadete from "./ItemCadete";
import BasicTicket from "./BasicTicket";

const CadeteList = ({ data, removeHabilitado, onFocusAfterDelete }) => {
  const ticketRef = useRef(null);

  const handlePrintTicket = () => {
    if (!ticketRef.current) return;

    // Captura el HTML del ticket básico
    const printContents = ticketRef.current.innerHTML;
    // Abre una ventana nueva para imprimir
    const printWindow = window.open("", "", "width=300,height=600");
    printWindow.document.write("<html><head><title>Ticket Básico</title>");
    printWindow.document.write(`
      <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        .ticket-container { width: 80mm; }
      </style>
    `);
    printWindow.document.write("</head><body>");
    printWindow.document.write(`<div class="ticket-container">${printContents}</div>`);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();

    // Espera un poco antes de lanzar la impresión
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      // Devuelve el foco al input principal de Gestión
      onFocusAfterDelete && onFocusAfterDelete();
    }, 500);
  };

  if (data.length === 0) {
    return (
      <div className="cadete-list">
        <p className="sin-moviles-disp">No hay Moviles disponibles</p>

        
        <div
          style={{ position: "absolute", top: "-9999px", left: "-9999px" }}
          ref={ticketRef}
        >
          <BasicTicket />
        </div>

        <button className="btn-basico" onClick={handlePrintTicket}>
          Imprimir Ticket Básico
        </button>
      </div>
    );
  }

  return (
    <div className="cadete-list">
      {data.map((cadete) => (
        <ItemCadete
          key={cadete.id}
          empleado={cadete}
          removeHabilitado={removeHabilitado}
          onFocusAfterDelete={onFocusAfterDelete}
        />
      ))}
    </div>
  );
};

export default CadeteList;
*/
// src/Components/CadeteList.jsx
import React, { useRef } from "react";
import ItemCadete from "./ItemCadete";
import BasicTicket from "./BasicTicket";
import { updateCadeteStat } from "../utils/stats";

const CadeteList = ({ data, removeHabilitado, onFocusAfterDelete }) => {
  const ticketRef = useRef(null);

  const handlePrintTicket = () => {
    if (!ticketRef.current) return;

    // Captura el HTML del ticket básico
    const printContents = ticketRef.current.innerHTML;
    // Abre una ventana nueva para imprimir
    const printWindow = window.open("", "", "width=300,height=600");
    printWindow.document.write("<html><head><title>Ticket Básico</title>");
    printWindow.document.write(`
      <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        .ticket-container { width: 80mm; }
      </style>
    `);
    printWindow.document.write("</head><body>");
    printWindow.document.write(`<div class="ticket-container">${printContents}</div>`);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();

      // Actualizar estadísticas globales de ticket básico
      updateCadeteStat('basic_ticket', 'printCount');

      // Devolver foco al input principal
      onFocusAfterDelete && onFocusAfterDelete();
    }, 500);
  };

  if (data.length === 0) {
    return (
      <div className="cadete-list">
        <p className="sin-moviles-disp">No hay Moviles disponibles</p>

        {/* Ticket oculto para impresión */}
        <div
          style={{ position: "absolute", top: "-9999px", left: "-9999px" }}
          ref={ticketRef}
        >
          <BasicTicket />
        </div>

        <button className="btn-basico" onClick={handlePrintTicket}>
          Imprimir Ticket Básico
        </button>
      </div>
    );
  }

  return (
    <div className="cadete-list">
      {data.map((cadete) => (
        <ItemCadete
          key={cadete.id}
          empleado={cadete}
          removeHabilitado={removeHabilitado}
          onFocusAfterDelete={onFocusAfterDelete}
        />
      ))}
    </div>
  );
};

export default CadeteList;
