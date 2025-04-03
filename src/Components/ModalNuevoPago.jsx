/*
import React, { useState, useEffect, useRef } from "react";

const ModalNuevoPago = ({ onCancel, onPaymentRegistered, showDetails }) => {
  const [idInput, setIdInput] = useState("");
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState(""); // Estado para detalles
  const [confirmPayment, setConfirmPayment] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const idInputRef = useRef(null);
  const amountInputRef = useRef(null);
  const detailsInputRef = useRef(null); // Referencia al input de detalles
  const submitButtonRef = useRef(null); // Referencia al botón de submit

  // Enfocar el input de ID al montar el modal
  useEffect(() => {
    if (idInputRef.current) {
      idInputRef.current.focus();
    }
  }, []);

  // Cerrar el modal al presionar ESC y devolver el foco al input principal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        onCancel();
        document.getElementById("employeeId")?.focus();
      }
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [onCancel]);

  const handleIdKeyDown = (e) => {
    if (e.key === "Enter" && amountInputRef.current) {
      amountInputRef.current.focus();
    }
  };

  const handleAmountKeyDown = (e) => {
    if (e.key === "Enter") {
      // Si showDetails es falso, pasa al botón directamente
      if (!showDetails && submitButtonRef.current) {
        submitButtonRef.current.click();
      } else if (detailsInputRef.current) {
        detailsInputRef.current.focus();
      }
    }
  };

  const handleDetailsKeyDown = (e) => {
    if (e.key === "Enter") {
      initiateConfirmation();
    }
  };

  // Prepara el objeto de pago y muestra la vista de confirmación
  const initiateConfirmation = () => {
    if (!idInput || !amount || (showDetails && !details)) {
      alert("Por favor, complete todos los campos");
      return;
    }
    const now = new Date();
    const fecha = now.toLocaleDateString(); // Ej.: "31/03/2025"
    const hora = now.toLocaleTimeString();   // Ej.: "14:22:35"
    const newPayment = {
      id: idInput,
      monto: amount,
      fecha,
      hora,
      detalles: details, // Guardar detalles solo si showDetails es true
    };
    setPendingPayment(newPayment);
    setConfirmPayment(true);
  };

  // Al confirmar, muestra el spinner por 2 segundos y luego registra el pago en localStorage
  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const { id, monto, fecha, detalles } = pendingPayment;
      const storedPayments = localStorage.getItem("pagos");
      let pagos = storedPayments ? JSON.parse(storedPayments) : {};
      if (pagos[fecha]) {
        pagos[fecha].push(pendingPayment);
      } else {
        pagos[fecha] = [pendingPayment];
      }
      localStorage.setItem("pagos", JSON.stringify(pagos));
      setIsProcessing(false);
      if (onPaymentRegistered) onPaymentRegistered(pendingPayment);
      onCancel(); // Cierra el modal
      document.getElementById("employeeId")?.focus(); // Devuelve el foco al input principal
    }, 2000);
  };

  const handleCancelConfirmation = () => {
    onCancel();
    document.getElementById("employeeId")?.focus(); // Devuelve el foco al input principal
  };

  return (
    <div className="np-modal-overlay">
      {confirmPayment && pendingPayment ? (
        isProcessing ? (
          <div className="modal-confirm">
            <div className="modal-confirm-header">
              <p>OPERADOR</p>
            </div>
            <div className="modal-confirm-body">
              <p>Registrando pago...</p>
              <div className="spinner"></div>
            </div>
          </div>
        ) : (
          <div className="modal-confirm">
            <div className="modal-confirm-header">
              <p>OPERADOR</p>
            </div>
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
          <div className="np-modal-header">
            <h2>Nuevo Pago</h2>
          </div>
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
              />
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
                  onKeyDown={handleDetailsKeyDown} // Agregamos el manejador de "Enter"
                />
              </div>
            )}

            <div className="np-modal-actions">
              <button
                ref={submitButtonRef} // ref único para disparar el clic desde el teclado
                onClick={initiateConfirmation}
              >
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

const ModalNuevoPago = ({ onCancel, onPaymentRegistered, showDetails, operador }) => {
  const [idInput, setIdInput] = useState("");
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState(""); // Estado para detalles
  const [confirmPayment, setConfirmPayment] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const idInputRef = useRef(null);
  const amountInputRef = useRef(null);
  const detailsInputRef = useRef(null); // Referencia al input de detalles
  const submitButtonRef = useRef(null); // Referencia al botón de submit

  // Enfocar el input de ID al montar el modal
  useEffect(() => {
    if (idInputRef.current) {
      idInputRef.current.focus();
    }
  }, []);

  // Cerrar el modal al presionar ESC y devolver el foco al input principal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        onCancel();
        document.getElementById("employeeId")?.focus();
      }
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [onCancel]);

  const handleIdKeyDown = (e) => {
    if (e.key === "Enter" && amountInputRef.current) {
      amountInputRef.current.focus();
    }
  };

  const handleAmountKeyDown = (e) => {
    if (e.key === "Enter") {
      // Si showDetails es falso, pasa al botón directamente
      if (!showDetails && submitButtonRef.current) {
        submitButtonRef.current.click();
      } else if (detailsInputRef.current) {
        detailsInputRef.current.focus();
      }
    }
  };

  const handleDetailsKeyDown = (e) => {
    if (e.key === "Enter") {
      initiateConfirmation();
    }
  };

  // Prepara el objeto de pago y muestra la vista de confirmación
  const initiateConfirmation = () => {
    if (!idInput || !amount || (showDetails && !details)) {
      alert("Por favor, complete todos los campos");
      return;
    }
    const now = new Date();
    const fecha = now.toLocaleDateString(); // Ej.: "31/03/2025"
    const hora = now.toLocaleTimeString();   // Ej.: "14:22:35"
    const newPayment = {
      id: idInput,
      monto: amount,
      fecha,
      hora,
      detalles: details, // Guardar detalles solo si showDetails es true
      operador, // Se agrega el operador recibido por prop
    };
    setPendingPayment(newPayment);
    setConfirmPayment(true);
  };

  // Al confirmar, muestra el spinner por 2 segundos y luego registra el pago en localStorage
  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const { id, monto, fecha, detalles } = pendingPayment;
      const storedPayments = localStorage.getItem("pagos");
      let pagos = storedPayments ? JSON.parse(storedPayments) : {};
      if (pagos[fecha]) {
        pagos[fecha].push(pendingPayment);
      } else {
        pagos[fecha] = [pendingPayment];
      }
      localStorage.setItem("pagos", JSON.stringify(pagos));
      setIsProcessing(false);
      if (onPaymentRegistered) onPaymentRegistered(pendingPayment);
      onCancel(); // Cierra el modal
      document.getElementById("employeeId")?.focus(); // Devuelve el foco al input principal
    }, 2000);
  };

  const handleCancelConfirmation = () => {
    onCancel();
    document.getElementById("employeeId")?.focus(); // Devuelve el foco al input principal
  };

  return (
    <div className="np-modal-overlay">
      {confirmPayment && pendingPayment ? (
        isProcessing ? (
          <div className="modal-confirm">
            <div className="modal-confirm-header">
              <p>OPERADOR</p>
            </div>
            <div className="modal-confirm-body">
              <p>Registrando pago...</p>
              <div className="spinner"></div>
            </div>
          </div>
        ) : (
          <div className="modal-confirm">
            <div className="modal-confirm-header">
              <p>OPERADOR</p>
            </div>
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
          <div className="np-modal-header">
            <h2>Nuevo Pago</h2>
          </div>
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
              />
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

            {/* Campo de detalles, solo visible si showDetails es true */}
            {showDetails && (
              <div className="np-input-container">
                <label>Detalles del Pago:</label>
                <input
                  type="text"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Ej. Trámite fallido"
                  ref={detailsInputRef}
                  onKeyDown={handleDetailsKeyDown} // Manejador de "Enter"
                />
              </div>
            )}

            <div className="np-modal-actions">
              <button
                ref={submitButtonRef} // ref para disparar el clic desde el teclado
                onClick={initiateConfirmation}
              >
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
