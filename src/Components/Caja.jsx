
// src/Components/Caja.jsx
import React, { useState, useEffect, useRef } from "react";
import ModalNuevoPago from "./ModalNuevoPago";

const CajaContent = React.forwardRef(({ pagos, getWeekday, operador }, ref) => {
  // Seleccionamos la clave: si existe alguna con pagos registrados, la usamos; si no, usamos la primera existente.
  const keys = Object.keys(pagos);
  const fixedDate =
    keys.find((key) => pagos[key] && pagos[key].length > 0) || keys[0] || "";
  
  // Calculamos totales a partir de TODOS los arrays en "pagos"
  const { efectivoTotal, otrosTotal } = Object.values(pagos).reduce(
    (acc, pagosDelDia) => {
      pagosDelDia.forEach((pago) => {
        const monto = parseFloat(pago.monto) || 0;
        // Si no hay detalles se considera pago en efectivo; de lo contrario, se suma a "otros"
        if (!pago.detalles) {
          acc.efectivoTotal += monto;
        } else {
          acc.otrosTotal += monto;
        }
      });
      return acc;
    },
    { efectivoTotal: 0, otrosTotal: 0 }
  );

  return (
    <div ref={ref}>
      <h1 className="caja-header">Caja</h1>
      <h2 style={{ color: "black" }}>{operador}</h2>
      {/* Mostrar siempre la fecha fija debajo del nombre del usuario */}
      {fixedDate ? (
        <div className="caja-fixed-date">
          <h3 className="caja-pagos-date" style={{ color: "black" }}>
            {getWeekday(fixedDate).charAt(0).toUpperCase() +
              getWeekday(fixedDate).slice(1)}{" "}
            - {fixedDate}
          </h3>
        </div>
      ) : (
        <p className="caja-no-pagos">No hay información de fecha fija en pagos.</p>
      )}
      {fixedDate ? (
        pagos[fixedDate] && pagos[fixedDate].length > 0 ? (
          <div className="caja-pagos-day">
            <table className="caja-pagos-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Monto</th>
                  <th>Hora</th>
                  <th>Tipo de Pago</th>
                </tr>
              </thead>
              <tbody>
                {pagos[fixedDate].map((pago, index) => {
                  const tipoDePago = pago.detalles || pago.tipo || "efectivo";
                  return (
                    <tr key={index}>
                      <td>{pago.id}</td>
                      <td>{pago.monto}</td>
                      <td>{pago.hora}</td>
                      <td className="tipo-pago">{tipoDePago}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="caja-no-pagos">No hay pagos registrados para este día.</p>
        )
      ) : null}
      {Object.keys(pagos).length > 0 && (
        <div
          className="caja-totals"
          style={{
            border: "1px solid red",
            marginTop: "20px",
            padding: "10px",
            color: "black",
          }}
        >
          <h3>Totales</h3>
          <p>Efectivo: {efectivoTotal}</p>
          <p>Otros: {otrosTotal}</p>
          <p>Total: {efectivoTotal + otrosTotal}</p>
        </div>
      )}
    </div>
  );
});

const Caja = () => {
  const [pagos, setPagos] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [details, setDetails] = useState("");
  const [cajaCerrada, setCajaCerrada] = useState(false);
  const componentRef = useRef();

  // Obtenemos el usuario logueado (se asume que loggedUser tiene username y role)
  const loggedUser = localStorage.getItem("loggedUser")
    ? JSON.parse(localStorage.getItem("loggedUser"))
    : null;
  const operador = loggedUser ? loggedUser.username : "Desconocido";
  const isAdmin = loggedUser && loggedUser.role === "admin";

  // Para usuarios no admin, leemos el flag de caja cerrada desde sessionStorage
  useEffect(() => {
    if (!isAdmin) {
      const storedCajaCerrada = sessionStorage.getItem("cajaCerrada_" + operador);
      setCajaCerrada(storedCajaCerrada === "true");
    }
  }, [operador, isAdmin]);

  // Cargar pagos desde localStorage
  useEffect(() => {
    const storedPagos = localStorage.getItem("pagos");
    if (storedPagos) {
      try {
        const parsedPagos = JSON.parse(storedPagos);
        setPagos(parsedPagos);
      } catch (error) {
        console.error("Error al parsear 'pagos':", error);
        setPagos({});
      }
    }
  }, []);

  // Filtrar pagos para usuarios no admin
  const filteredPagos = isAdmin
    ? pagos
    : Object.keys(pagos).reduce((acc, key) => {
        acc[key] = pagos[key].filter((pago) => pago.operador === operador);
        return acc;
      }, {});

  // Ajustamos getWeekday para aceptar tanto "DD-MM-YYYY" como "DD/MM/YYYY"
  const getWeekday = (fecha) => {
    const fechaFormateada = fecha.includes("-") ? fecha.replace(/-/g, "/") : fecha;
    const parts = fechaFormateada.split("/");
    if (parts.length !== 3) return "";
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const dateObj = new Date(year, month, day);
    return dateObj.toLocaleDateString("es-ES", { weekday: "long" });
  };

  const handleIngresarPago = () => {
    setShowModal(true);
  };

  // Al registrar el pago, se añade la propiedad operador para identificar al usuario
  const handlePaymentRegistered = (newPayment) => {
    const updatedPayment = {
      ...newPayment,
      tipo: details || "efectivo",
      detalles: details,
      operador, // Se agrega el operador (username)
    };

    const storedPagos = localStorage.getItem("pagos");
    const pagosActuales = storedPagos ? JSON.parse(storedPagos) : {};
    const fecha = newPayment.fecha; // Se espera que newPayment.fecha sea la fecha fija

    const existingPaymentIndex = pagosActuales[fecha]
      ? pagosActuales[fecha].findIndex((pago) => pago.id === newPayment.id)
      : -1;

    if (existingPaymentIndex === -1) {
      if (pagosActuales[fecha]) {
        pagosActuales[fecha].push(updatedPayment);
      } else {
        pagosActuales[fecha] = [updatedPayment];
      }
      localStorage.setItem("pagos", JSON.stringify(pagosActuales));
      setPagos({ ...pagosActuales });
    }
    setShowModal(false);
  };

  const handlePrintYCerrarCaja = () => {
    const printContents = componentRef.current.innerHTML;
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write("<html><head><title>Imprimir Ticket</title>");
    printWindow.document.write('<link rel="stylesheet" type="text/css" href="Caja.css">');
    printWindow.document.write(`
      <style>
        .tipo-pago { margin-left: 10px; }
      </style>
    `);
    printWindow.document.write("</head><body>");
    printWindow.document.write(printContents);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      if (!isAdmin) {
        setCajaCerrada(true);
        sessionStorage.setItem("cajaCerrada_" + operador, "true");
      }
    }, 500);
  };

  return (
    <div className="caja-container">
      <div className="caja-actions">
        <button 
          className="caja-ingresar-button" 
          onClick={handleIngresarPago}
          disabled={cajaCerrada && !isAdmin}
        >
          Ingresar Pago
        </button>
      </div>

      {showModal && (
        <ModalNuevoPago
          operador={operador}  // Se pasa el operador al modal
          onCancel={() => setShowModal(false)}
          onPaymentRegistered={handlePaymentRegistered}
          showDetails={true}
        />
      )}

      {(!cajaCerrada || isAdmin) ? (
        <div ref={componentRef}>
          <CajaContent pagos={filteredPagos} getWeekday={getWeekday} operador={operador} />
        </div>
      ) : (
        <div style={{ padding: "20px", textAlign: "center", color: "black" }}>
          <h2>Caja Cerrada</h2>
          <p>Debes loguearte nuevamente para activar la caja.</p>
        </div>
      )}

      <div className="caja-button-container">
        {(!cajaCerrada && !isAdmin) && (
          <button className="caja-imprimir-button" onClick={handlePrintYCerrarCaja}>
            Cerrar Caja
          </button>
        )}
        {isAdmin && (
          <button className="caja-imprimir-button" onClick={handlePrintYCerrarCaja}>
            Imprimir Ticket
          </button>
        )}
      </div>
    </div>
  );
};

export default Caja;
