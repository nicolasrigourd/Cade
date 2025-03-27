/*
// src/Components/CadeteList.jsx
import React, { useRef } from "react";
import ItemCadete from "./ItemCadete";
import BasicTicket from "./BasicTicket";
import html2canvas from "html2canvas";
import qz from "qz-tray";

const CadeteList = ({ data, removeHabilitado, onPrint, onFocusAfterDelete }) => {
  const ticketRef = useRef(null);

  const handlePrintTicket = async () => {
    if (!ticketRef.current) return;

    const canvas = await html2canvas(ticketRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff"
    });

    const base64Image = canvas
      .toDataURL("image/png")
      .replace(/^data:image\/png;base64,/, "");

    try {
      await qz.websocket.connect();
      const printer = await qz.printers.find("XP-80C");
      const config = qz.configs.create(printer, {
        encoding: "CP437",
        margins: 2,
        orientation: "horizontal",
        pageWidth: 8.5
      });

      const dataToPrint = [
        {
          type: "image",
          format: "base64",
          data: base64Image
        }
      ];

      await qz.print(config, dataToPrint);
      await qz.websocket.disconnect();
      console.log("Impresión exitosa");
    } catch (error) {
      console.error("Error en la impresión:", error);
    }
  };

  if (data.length === 0) {
    return (
      <div className="cadete-list">
        <p className="sin-moviles-disp">No hay Moviles disponibles</p>
       
        <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }} ref={ticketRef}>
          <BasicTicket />
        </div>
        <button className="btn-basico" onClick={handlePrintTicket} >Imprimir Ticket Básico</button>
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
          onPrint={onPrint}
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
import html2canvas from "html2canvas";
import qz from "qz-tray";

const CadeteList = ({ data, removeHabilitado, onPrint, onFocusAfterDelete }) => {
  const ticketRef = useRef(null);

  const handlePrintTicket = async () => {
    if (!ticketRef.current) return;

    const canvas = await html2canvas(ticketRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff"
    });

    const base64Image = canvas
      .toDataURL("image/png")
      .replace(/^data:image\/png;base64,/, "");

    try {
      await qz.websocket.connect();
      const printer = await qz.printers.find("XP-80C");
      const config = qz.configs.create(printer, {
        encoding: "CP437",
        margins: 2,
        orientation: "horizontal",
        pageWidth: 8.5
      });

      const dataToPrint = [
        {
          type: "image",
          format: "base64",
          data: base64Image
        }
      ];

      await qz.print(config, dataToPrint);
      await qz.websocket.disconnect();
      console.log("Impresión exitosa");
      // Devolver el foco al input con id "employeeId"
      document.getElementById("employeeId")?.focus();
    } catch (error) {
      console.error("Error en la impresión:", error);
      document.getElementById("employeeId")?.focus();
    }
  };

  if (data.length === 0) {
    return (
      <div className="cadete-list">
        <p className="sin-moviles-disp">No hay Moviles disponibles</p>
        {/* Ticket oculto solo para impresión */}
        <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }} ref={ticketRef}>
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
          onPrint={onPrint}
          onFocusAfterDelete={onFocusAfterDelete}
        />
      ))}
    </div>
  );
};

export default CadeteList;
