/*
import React, { useRef } from "react";
import Ticket from "./Ticket";
import html2canvas from 'html2canvas';
import qz from 'qz-tray';

const ItemCadete = ({ empleado, removeHabilitado, onFocusAfterDelete }) => {
  const ticketRef = useRef(null);

  const handleDeleteLocal = () => {
    removeHabilitado(empleado.id);
    if (onFocusAfterDelete) onFocusAfterDelete();
  };

  const handlePrint = async () => {
    if (!ticketRef.current) return;

    const canvas = await html2canvas(ticketRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const base64Image = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');

    try {
      await qz.websocket.connect();
      const printer = await qz.printers.find("XP-80C");
      const config = qz.configs.create(printer, {
        encoding: "CP437",
        margins: 2,
        orientation: 'horizontal',
        pageWidth: 8.5
      });

      const data = [{
        type: 'image',
        format: 'base64',
        data: base64Image
      }];

      await qz.print(config, data);
      await qz.websocket.disconnect();
      console.log("Impresión exitosa");
    } catch (error) {
      console.error("Error en la impresión:", error);
    }
  };

  return (
    <div className="spectacular-card">
      <div className="card-info">
        <span className="card-id">
          <strong>ID:</strong> {empleado.id}
        </span>
        <span className="card-name">
          <strong>Nombre y Apellido:</strong> {empleado["nombre y apellido"]}
        </span>
        <span className="card-time">
          <strong>Hora:</strong> {empleado.horario}
        </span>
      </div>

      
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
        <div ref={ticketRef}>
          <Ticket empleado={empleado} />
        </div>
      </div>

      <div className="card-buttons">
        <button className="btn btn-imprimir" onClick={handlePrint}>
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
import React, { useRef } from "react";
import Ticket from "./Ticket";
import html2canvas from 'html2canvas';
import qz from 'qz-tray';

const ItemCadete = ({ empleado, removeHabilitado, onFocusAfterDelete }) => {
  const ticketRef = useRef(null);

  const handleDeleteLocal = () => {
    removeHabilitado(empleado.id);
    if (onFocusAfterDelete) onFocusAfterDelete();
  };

  const handlePrint = async () => {
    if (!ticketRef.current) return;

    const canvas = await html2canvas(ticketRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const base64Image = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');

    try {
      await qz.websocket.connect();
      const printer = await qz.printers.find("XP-80C");
      const config = qz.configs.create(printer, {
        encoding: "CP437",
        margins: 2,
        orientation: 'horizontal',
        pageWidth: 8.5
      });

      const data = [{
        type: 'image',
        format: 'base64',
        data: base64Image
      }];

      await qz.print(config, data);
      await qz.websocket.disconnect();
      console.log("Impresión exitosa");

      // Devuelve el foco al input principal luego de imprimir
      document.getElementById("employeeId")?.focus();

    } catch (error) {
      console.error("Error en la impresión:", error);
      // También devuelve el foco en caso de error para mejor UX
      document.getElementById("employeeId")?.focus();
    }
  };

  return (
    <div className="spectacular-card">
      <div className="card-info">
        <span className="card-id">
          <strong>ID:</strong> {empleado.id}
        </span>
        <span className="card-name">
          <strong>Nombre y Apellido:</strong> {empleado["nombre y apellido"]}
        </span>
        <span className="card-time">
          <strong>Hora:</strong> {empleado.horario}
        </span>
      </div>

      {/* Ticket oculto solo para impresión */}
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
        <div ref={ticketRef}>
          <Ticket empleado={empleado} />
        </div>
      </div>

      <div className="card-buttons">
        <button className="btn btn-imprimir" onClick={handlePrint}>
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
