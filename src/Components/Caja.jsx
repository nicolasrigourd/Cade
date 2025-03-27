/*
import React, { useState, useEffect, useRef } from "react";
import ModalNuevoPago from "./ModalNuevoPago"; // Importamos el componente ModalNuevoPago

// Componente que renderiza el contenido de la caja (lista de pagos)
const CajaContent = React.forwardRef(({ pagos, getWeekday }, ref) => (
  <div ref={ref}>
    <h1 className="caja-header">Caja</h1>
    {Object.keys(pagos).length === 0 ? (
      <p className="caja-no-pagos">No hay pagos registrados.</p>
    ) : (
      Object.keys(pagos).map((fecha) => {
        const weekday = getWeekday(fecha);
        return (
          <div key={fecha} className="caja-pagos-day">
            <h3 className="caja-pagos-date">
              {weekday.charAt(0).toUpperCase() + weekday.slice(1)} - {fecha}
            </h3>
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
                {pagos[fecha].map((pago, index) => {
                  // Si 'detalles' existe, usamos su valor, si no, mostramos 'efectivo'
                  const tipoDePago = pago.detalles || pago.tipo || "efectivo";
                  return (
                    <tr key={index}>
                      <td>{pago.id}</td>
                      <td>{pago.monto}</td>
                      <td>{pago.hora}</td>
                      <td>{tipoDePago}</td> 
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })
    )}
  </div>
));

const Caja = () => {
  const [pagos, setPagos] = useState({});
  const [showModal, setShowModal] = useState(false); // Controla si el modal está visible
  const [details, setDetails] = useState(""); // Estado para detalles (lo pasamos al modal)
  const componentRef = useRef();

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

  // Función para obtener el día de la semana de una fecha "dd/mm/yyyy"
  const getWeekday = (fecha) => {
    const parts = fecha.split("/");
    if (parts.length !== 3) return "";
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const dateObj = new Date(year, month, day);
    return dateObj.toLocaleDateString("es-ES", { weekday: "long" });
  };

  // Función para mostrar el modal de "Ingresar Pago"
  const handleIngresarPago = () => {
    setShowModal(true); // Abrir el modal
  };

  // Función para manejar el pago registrado y añadir detalles
  const handlePaymentRegistered = (newPayment) => {
    // Si no se ingresaron detalles, el tipo de pago será "efectivo"
    const updatedPayment = { 
      ...newPayment, 
      tipo: details || "efectivo", // Si no hay detalles, usa "efectivo"
      detalles: details
    };

    const storedPagos = localStorage.getItem("pagos");
    const pagos = storedPagos ? JSON.parse(storedPagos) : {};
    const fecha = newPayment.fecha;

    if (pagos[fecha]) {
      pagos[fecha].push(updatedPayment);
    } else {
      pagos[fecha] = [updatedPayment];
    }

    localStorage.setItem("pagos", JSON.stringify(pagos));
    setPagos(pagos);
    setShowModal(false); // Cerrar el modal después de registrar el pago
  };

  // Función para imprimir el contenido de CajaContent en una nueva ventana
  const handlePrint = () => {
    const printContents = componentRef.current.innerHTML;
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write("<html><head><title>Imprimir Caja</title>");
    printWindow.document.write('<link rel="stylesheet" type="text/css" href="Caja.css">');
    printWindow.document.write("</head><body>");
    printWindow.document.write(printContents);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="caja-container">
      <button className="caja-ingresar-button" onClick={handleIngresarPago}>
        Ingresar Pago
      </button>

      
      {showModal && (
        <ModalNuevoPago 
          onCancel={() => setShowModal(false)} 
          onPaymentRegistered={handlePaymentRegistered} 
          showDetails={true} // Mostrar el campo detalles en el modal
        />
      )}

      
      <div ref={componentRef}>
        <CajaContent pagos={pagos} getWeekday={getWeekday} />
      </div>

      
      <div className="caja-button-container">
        <button className="caja-imprimir-button" onClick={handlePrint}>
          Imprimir Caja
        </button>
      </div>
    </div>
  );
};

export default Caja;
*/
/*
import React, { useState, useEffect, useRef } from "react";
import ModalNuevoPago from "./ModalNuevoPago";

const CajaContent = React.forwardRef(({ pagos, getWeekday, operador }, ref) => (
  <div ref={ref}>
    <h1 className="caja-header">Caja</h1>
    <h2 style={{ color: "black" }}>{operador}</h2>
    {Object.keys(pagos).length === 0 ? (
      <p className="caja-no-pagos">No hay pagos registrados.</p>
    ) : (
      Object.keys(pagos).map((fecha) => {
        const weekday = getWeekday(fecha);
        return (
          <div key={fecha} className="caja-pagos-day">
            <h3 className="caja-pagos-date">
              {weekday.charAt(0).toUpperCase() + weekday.slice(1)} - {fecha}
            </h3>
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
                {pagos[fecha].map((pago, index) => {
                  const tipoDePago = pago.detalles || pago.tipo || "efectivo";
                  return (
                    <tr key={index}>
                      <td>{pago.id}</td><td>{pago.monto}</td><td>{pago.hora}</td>
                      <td className="tipo-pago">{tipoDePago}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })
    )}
  </div>
));

const Caja = () => {
  const [pagos, setPagos] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [details, setDetails] = useState("");
  const componentRef = useRef();

  const operador = localStorage.getItem("loggedUser")
    ? JSON.parse(localStorage.getItem("loggedUser")).username
    : "Desconocido";

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

  const getWeekday = (fecha) => {
    const parts = fecha.split("/");
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

  const handlePaymentRegistered = (newPayment) => {
    const updatedPayment = {
      ...newPayment,
      tipo: details || "efectivo",
      detalles: details,
    };

    const storedPagos = localStorage.getItem("pagos");
    const pagosActuales = storedPagos ? JSON.parse(storedPagos) : {};
    const fecha = newPayment.fecha;

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
    window.location.reload();
  };

  const handlePrint = () => {
    const printContents = componentRef.current.innerHTML;
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write("<html><head><title>Imprimir Caja</title>");
    printWindow.document.write('<link rel="stylesheet" type="text/css" href="Caja.css">');
    printWindow.document.write(`
      <style>
        .tipo-pago {
          margin-left: 10px;
        }
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
    }, 500);
  };

  return (
    <div className="caja-container">
      <button className="caja-ingresar-button" onClick={handleIngresarPago}>
        Ingresar Pago
      </button>

      {showModal && (
        <ModalNuevoPago
          onCancel={() => setShowModal(false)}
          onPaymentRegistered={handlePaymentRegistered}
          showDetails={true}
        />
      )}

      <div ref={componentRef}>
        <CajaContent pagos={pagos} getWeekday={getWeekday} operador={operador} />
      </div>

      <div className="caja-button-container">
        <button className="caja-imprimir-button" onClick={handlePrint}>
          Imprimir Caja
        </button>
      </div>
    </div>
  );
};

export default Caja;
*/
import React, { useState, useEffect, useRef } from "react";
import ModalNuevoPago from "./ModalNuevoPago";

const CajaContent = React.forwardRef(({ pagos, getWeekday, operador }, ref) => {
  const { efectivoTotal, otrosTotal } = Object.values(pagos).reduce(
    (acc, pagosDelDia) => {
      pagosDelDia.forEach((pago) => {
        const monto = parseFloat(pago.monto) || 0;
        // Sin detalles se considera pago en efectivo; con detalles se suma a "otros"
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
      {Object.keys(pagos).length === 0 ? (
        <p className="caja-no-pagos">No hay pagos registrados.</p>
      ) : (
        Object.keys(pagos).map((fecha) => {
          const weekday = getWeekday(fecha);
          return (
            <div key={fecha} className="caja-pagos-day">
              <h3 className="caja-pagos-date">
                {weekday.charAt(0).toUpperCase() + weekday.slice(1)} - {fecha}
              </h3>
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
                  {pagos[fecha].map((pago, index) => {
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
          );
        })
      )}
      {Object.keys(pagos).length > 0 && (
        <div
          className="caja-totals"
          style={{
            border: "1px solid red",
            marginTop: "20px",
            padding: "10px",
            color: "black"
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

  // Para usuarios no admin, leemos el flag de caja cerrada desde sessionStorage (no se persiste entre sesiones)
  useEffect(() => {
    if (!isAdmin) {
      const storedCajaCerrada = sessionStorage.getItem("cajaCerrada_" + operador);
      setCajaCerrada(storedCajaCerrada === "true");
    }
  }, [operador, isAdmin]);

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

  const getWeekday = (fecha) => {
    const parts = fecha.split("/");
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

  const handlePaymentRegistered = (newPayment) => {
    const updatedPayment = {
      ...newPayment,
      tipo: details || "efectivo",
      detalles: details,
    };

    const storedPagos = localStorage.getItem("pagos");
    const pagosActuales = storedPagos ? JSON.parse(storedPagos) : {};
    const fecha = newPayment.fecha;

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

  // Para admin, el botón se llama "Imprimir Ticket" y solo imprime.
  // Para usuarios no admin, al imprimir se cierra la caja y se persiste en sessionStorage.
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
          onCancel={() => setShowModal(false)}
          onPaymentRegistered={handlePaymentRegistered}
          showDetails={true}
        />
      )}

      {(!cajaCerrada || isAdmin) ? (
        <div ref={componentRef}>
          <CajaContent pagos={pagos} getWeekday={getWeekday} operador={operador} />
        </div>
      ) : (
        <div 
          style={{ padding: "20px", textAlign: "center", color: "black" }}
        >
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
