/*
// src/Components/ModalNuevoPago.jsx
import React, { useState, useEffect, useRef } from "react";

const ModalNuevoPago = ({ onCancel, onPaymentRegistered, showDetails, operador }) => {
  const [idInput, setIdInput] = useState("");
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState("");
  const [confirmPayment, setConfirmPayment] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [idError, setIdError] = useState("");

  const idInputRef = useRef(null);
  const amountInputRef = useRef(null);
  const detailsInputRef = useRef(null);
  const submitButtonRef = useRef(null);

  // Formatea la fecha a "DD-MM-YYYY"
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Foco inicial en el campo ID
  useEffect(() => {
    idInputRef.current?.focus();
  }, []);

  // Cierra con ESC y retorna foco al input principal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onCancel();
        document.getElementById("employeeId")?.focus();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onCancel]);

  // Valida que el ID exista en bdcadetes
  const handleIdKeyDown = (e) => {
    if (e.key === "Enter") {
      const bdc = JSON.parse(localStorage.getItem("bdcadetes") || "[]");
      const exists = bdc.some((c) => c.id.toString() === idInput.trim());
      if (!exists) {
        setIdError("El id ingresado es inexistente");
      } else {
        setIdError("");
        amountInputRef.current?.focus();
      }
    }
  };

  // Navegación entre campos
  const handleAmountKeyDown = (e) => {
    if (e.key === "Enter") {
      if (!showDetails && submitButtonRef.current) {
        submitButtonRef.current.click();
      } else {
        detailsInputRef.current?.focus();
      }
    }
  };
  const handleDetailsKeyDown = (e) => {
    if (e.key === "Enter") initPagamento();
  };

  // Prepara el pago y muestra confirmación
  const initPagamento = () => {
    if (!idInput || !amount || (showDetails && !details)) {
      alert("Por favor, complete todos los campos");
      return;
    }
    if (idError) return;
    const now = new Date();
    const fecha = formatDate(now);
    const hora = now.toLocaleTimeString();
    const newPayment = { id: idInput, monto: amount, fecha, hora, detalles: details, operador };
    setPendingPayment(newPayment);
    setConfirmPayment(true);
  };

  // Confirma el pago, lo guarda y actualiza bdcadetes
  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const payment = { ...pendingPayment };

      // 1. Guardar en localStorage.pagos bajo la clave DD-MM-YYYY
      const stored = localStorage.getItem("pagos");
      const pagos = stored ? JSON.parse(stored) : {};
      pagos[payment.fecha] = pagos[payment.fecha] || [];
      pagos[payment.fecha].push(payment);
      localStorage.setItem("pagos", JSON.stringify(pagos));

      // 2. Actualizar la deuda en bdcadetes
      const storedBd = JSON.parse(localStorage.getItem("bdcadetes") || "[]");
      const idx = storedBd.findIndex(c => c.id.toString() === payment.id.toString());
      if (idx !== -1) {
        const cadete = storedBd[idx];
        const pagoNum = parseFloat(payment.monto) || 0;

        if (cadete.contador !== undefined && cadete.deudaPendiente !== undefined) {
          // Ya tenía habilitación parcial: descontar de deudaPendiente
          const pending = Number(cadete.deudaPendiente);
          if (pagoNum >= pending) {
            cadete.deuda = 0;
            cadete.multa = 0;
            delete cadete.contador;
            delete cadete.deudaPendiente;
          } else {
            cadete.deuda = 0;
            cadete.deudaPendiente = pending - pagoNum;
            // Mantiene el contador original
          }
        } else {
          // Primera habilitación: lógica de parcial vs total
          const totalDebt = Number(cadete.deuda) + Number(cadete.multa || 0);
          if (pagoNum >= totalDebt) {
            cadete.deuda = 0;
            cadete.multa = 0;
            delete cadete.contador;
            delete cadete.deudaPendiente;
          } else {
            const remaining = totalDebt - pagoNum;
            cadete.deuda = 0;
            cadete.contador = 3;
            cadete.deudaPendiente = remaining;
          }
        }

        storedBd[idx] = cadete;
        localStorage.setItem("bdcadetes", JSON.stringify(storedBd));
      }

      setIsProcessing(false);
      onPaymentRegistered?.(payment);
      onCancel();
      document.getElementById("employeeId")?.focus();
    }, 2000);
  };

  const handleCancelConfirmation = () => {
    onCancel();
    document.getElementById("employeeId")?.focus();
  };

  return (
    <div className="np-modal-overlay">
      {confirmPayment && pendingPayment ? (
        isProcessing ? (
          <div className="modal-confirm">
            <div className="modal-confirm-header"><p>OPERADOR</p></div>
            <div className="modal-confirm-body">
              <p>Registrando pago...</p>
              <div className="spinner" />
            </div>
          </div>
        ) : (
          <div className="modal-confirm">
            <div className="modal-confirm-header"><p>OPERADOR</p></div>
            <h2>{`Recibiste: $${pendingPayment.monto}`}</h2>
            <p>Este importe se computará como un pago en efectivo en el sistema.</p>
            <div className="modal-confirm-actions">
              <button onClick={handleConfirmPayment}>SI, LO RECIBÍ</button>
              <button onClick={handleCancelConfirmation}>CERRAR</button>
            </div>
          </div>
        )
      ) : (
        <div className="np-modal">
          <div className="np-modal-header"><h2>Nuevo Pago</h2></div>
          <div className="np-modal-body">
            <div className="np-input-container">
              <label>Ingrese su id/móvil:</label>
              <input
                type="text"
                id="employeeId"
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
                onKeyDown={handleIdKeyDown}
                ref={idInputRef}
                style={idError ? { borderColor: "red" } : {}}
              />
              {idError && <p style={{ color: "red", margin: "0.5em 0 0" }}>{idError}</p>}
            </div>
            <div className="np-input-container">
              <label>Ingrese el monto a pagar:</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={handleAmountKeyDown}
                ref={amountInputRef}
              />
            </div>
            {showDetails && (
              <div className="np-input-container">
                <label>Detalles del Pago:</label>
                <input
                  type="text"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Ej. Trámite fallido"
                  ref={detailsInputRef}
                  onKeyDown={handleDetailsKeyDown}
                />
              </div>
            )}
            <div className="np-modal-actions">
              <button ref={submitButtonRef} onClick={initPagamento}>
                Registrar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalNuevoPago;
*/
// src/Components/ModalNuevoPago.jsx
import React, { useState, useEffect, useRef } from "react";
import ModalObservaciones from "./ModalObservaciones"; // ⬅️ NUEVO: para mostrar bloqueo

const ModalNuevoPago = ({ onCancel, onPaymentRegistered, showDetails, operador }) => {
  const [idInput, setIdInput] = useState("");
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState("");
  const [confirmPayment, setConfirmPayment] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [idError, setIdError] = useState("");

  // ⬇️ NUEVO: estados para Observaciones si el ID está bloqueado
  const [cadeteObservado, setCadeteObservado] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // "observaciones" | null

  const idInputRef = useRef(null);
  const amountInputRef = useRef(null);
  const detailsInputRef = useRef(null);
  const submitButtonRef = useRef(null);

  // Formatea la fecha a "DD-MM-YYYY"
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Foco inicial en el campo ID
  useEffect(() => {
    idInputRef.current?.focus();
  }, []);

  // Cierra con ESC y retorna foco al input principal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onCancel();
        document.getElementById("employeeId")?.focus();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onCancel]);

  // ⬇️ NUEVO: helper para leer bdcadetes y buscar cadete por id
  const getCadeteById = (idRaw) => {
    const bdc = JSON.parse(localStorage.getItem("bdcadetes") || "[]");
    const trimmed = (idRaw || "").trim();
    return bdc.find((c) => c.id?.toString() === trimmed) || null;
  };

  // Valida que el ID exista y NO esté bloqueado
  const handleIdKeyDown = (e) => {
    if (e.key === "Enter") {
      const found = getCadeteById(idInput);
      if (!found) {
        setIdError("El id ingresado es inexistente");
        return;
      }
      // ⬇️ NUEVO: si está bloqueado → abrir observaciones y bloquear flujo
      if (Boolean(found.bloqueado)) {
        setIdError("El id está bloqueado");
        setCadeteObservado(found);
        setActiveModal("observaciones");
        return;
      }
      setIdError("");
      amountInputRef.current?.focus();
    }
  };

  // Navegación entre campos
  const handleAmountKeyDown = (e) => {
    if (e.key === "Enter") {
      if (!showDetails && submitButtonRef.current) {
        submitButtonRef.current.click();
      } else {
        detailsInputRef.current?.focus();
      }
    }
  };
  const handleDetailsKeyDown = (e) => {
    if (e.key === "Enter") initPagamento();
  };

  // Prepara el pago y muestra confirmación
  const initPagamento = () => {
    if (!idInput || !amount || (showDetails && !details)) {
      alert("Por favor, complete todos los campos");
      return;
    }
    if (idError) return;

    // ⬇️ NUEVO: validación final antes de armar el pago (existe + no bloqueado)
    const found = getCadeteById(idInput);
    if (!found) {
      setIdError("El id ingresado es inexistente");
      return;
    }
    if (Boolean(found.bloqueado)) {
      setIdError("El id está bloqueado");
      setCadeteObservado(found);
      setActiveModal("observaciones");
      return;
    }

    const now = new Date();
    const fecha = formatDate(now);
    const hora = now.toLocaleTimeString();
    const newPayment = { id: idInput, monto: amount, fecha, hora, detalles: details, operador };
    setPendingPayment(newPayment);
    setConfirmPayment(true);
  };

  // Confirma el pago, lo guarda y actualiza bdcadetes
  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const payment = { ...pendingPayment };

      // 1. Guardar en localStorage.pagos bajo la clave DD-MM-YYYY
      const stored = localStorage.getItem("pagos");
      const pagos = stored ? JSON.parse(stored) : {};
      pagos[payment.fecha] = pagos[payment.fecha] || [];
      pagos[payment.fecha].push(payment);
      localStorage.setItem("pagos", JSON.stringify(pagos));

      // 2. Actualizar la deuda en bdcadetes (se mantiene tu lógica funcional)
      const storedBd = JSON.parse(localStorage.getItem("bdcadetes") || "[]");
      const idx = storedBd.findIndex(c => c.id.toString() === payment.id.toString());
      if (idx !== -1) {
        const cadete = storedBd[idx];
        const pagoNum = parseFloat(payment.monto) || 0;

        if (cadete.contador !== undefined && cadete.deudaPendiente !== undefined) {
          // Ya tenía habilitación parcial: descontar de deudaPendiente
          const pending = Number(cadete.deudaPendiente);
          if (pagoNum >= pending) {
            cadete.deuda = 0;
            cadete.multa = 0;
            delete cadete.contador;
            delete cadete.deudaPendiente;
          } else {
            cadete.deuda = 0;
            cadete.deudaPendiente = pending - pagoNum;
            // Mantiene el contador original
          }
        } else {
          // Primera habilitación: lógica de parcial vs total
          const totalDebt = Number(cadete.deuda) + Number(cadete.multa || 0);
          if (pagoNum >= totalDebt) {
            cadete.deuda = 0;
            cadete.multa = 0;
            delete cadete.contador;
            delete cadete.deudaPendiente;
          } else {
            const remaining = totalDebt - pagoNum;
            cadete.deuda = 0;
            cadete.contador = 3;
            cadete.deudaPendiente = remaining;
          }
        }

        storedBd[idx] = cadete;
        localStorage.setItem("bdcadetes", JSON.stringify(storedBd));
      }

      setIsProcessing(false);
      onPaymentRegistered?.(payment);
      onCancel();
      document.getElementById("employeeId")?.focus();
    }, 2000);
  };

  const handleCancelConfirmation = () => {
    onCancel();
    document.getElementById("employeeId")?.focus();
  };

  return (
    <div className="np-modal-overlay">
      {confirmPayment && pendingPayment ? (
        isProcessing ? (
          <div className="modal-confirm">
            <div className="modal-confirm-header"><p>OPERADOR</p></div>
            <div className="modal-confirm-body">
              <p>Registrando pago...</p>
              <div className="spinner" />
            </div>
          </div>
        ) : (
          <div className="modal-confirm">
            <div className="modal-confirm-header"><p>OPERADOR</p></div>
            <h2>{`Recibiste: $${pendingPayment.monto}`}</h2>
            <p>Este importe se computará como un pago en efectivo en el sistema.</p>
            <div className="modal-confirm-actions">
              <button onClick={handleConfirmPayment}>SI, LO RECIBÍ</button>
              <button onClick={handleCancelConfirmation}>CERRAR</button>
            </div>
          </div>
        )
      ) : (
        <div className="np-modal">
          <div className="np-modal-header"><h2>Nuevo Pago</h2></div>
          <div className="np-modal-body">
            <div className="np-input-container">
              <label>Ingrese su id/móvil:</label>
              <input
                type="text"
                id="employeeId"
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
                onKeyDown={handleIdKeyDown}
                ref={idInputRef}
                style={idError ? { borderColor: "red" } : {}}
              />
              {idError && <p style={{ color: "red", margin: "0.5em 0 0" }}>{idError}</p>}
            </div>
            <div className="np-input-container">
              <label>Ingrese el monto a pagar:</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={handleAmountKeyDown}
                ref={amountInputRef}
              />
            </div>
            {showDetails && (
              <div className="np-input-container">
                <label>Detalles del Pago:</label>
                <input
                  type="text"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Ej. Trámite fallido"
                  ref={detailsInputRef}
                  onKeyDown={handleDetailsKeyDown}
                />
              </div>
            )}
            <div className="np-modal-actions">
              <button ref={submitButtonRef} onClick={initPagamento}>
                Registrar Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⬇️ NUEVO: Modal de Observaciones cuando el ID está bloqueado */}
      {cadeteObservado && activeModal === "observaciones" && (
        <ModalObservaciones
          empleado={cadeteObservado}
          onClose={() => {
            setCadeteObservado(null);
            setActiveModal(null);
            // devuelve foco al campo ID para reintentar
            setTimeout(() => idInputRef.current?.focus(), 0);
          }}
        />
      )}
    </div>
  );
};

export default ModalNuevoPago;
