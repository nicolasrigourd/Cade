
// src/Components/ModalEfectivo.jsx
import React, { useState, useEffect, useRef } from "react";
import ModalEfectivoConfirm from "./ModalEfectivoConfirm";

const ModalEfectivo = ({ empleado, onClose, onConfirm, onModalOpen }) => {
  const totalDeuda = Number(empleado.deuda) + Number(empleado.multa);
  const [inputEnabled, setInputEnabled] = useState(false);
  const [partialAmount, setPartialAmount] = useState("");
  const [confirmData, setConfirmData] = useState(null);
  const inputRef = useRef(null);

  // Llama a onModalOpen para quitar el foco del input (si se pasa)
  useEffect(() => {
    if (onModalOpen) {
      onModalOpen();
    }
  }, [onModalOpen]);

  const handleKeyDown = (e) => {
    if (confirmData) return;
    if (inputEnabled && e.key !== "Escape") return;
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "1") {
      // Opción 1: Pago total
      setConfirmData({ amount: totalDeuda, type: "total" });
    } else if (e.key === "2") {
      e.preventDefault();
      setInputEnabled(true);
      setPartialAmount("");
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmData, inputEnabled, totalDeuda]);

  useEffect(() => {
    if (inputEnabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputEnabled]);

  const handlePartialSubmit = (e) => {
    if (e.key === "Enter" && partialAmount !== "") {
      setConfirmData({ amount: partialAmount, type: "partial" });
    }
  };

  return (
    <div className="modal-deuda-overlay">
      <div className="modal-deuda">
        <div className="modal-deuda-header">
          <p>
            <strong>ID:</strong> {empleado.id} | <strong>Nombre:</strong>{" "}
            {empleado.nombre} {empleado.apellido}
          </p>
        </div>
        <h2>Pago en Efectivo</h2>
        <h3>Total a pagar: ${totalDeuda}</h3>
        <hr />
        <div className="modal-options">
          <div className="option">
            <p>Opción 1: Pago Total</p>
            <p>Total: ${totalDeuda}</p>
          </div>
          <div className="option">
            <p>Opción 2: Pago Parcial</p>
            <input
              ref={inputRef}
              type="number"
              value={partialAmount}
              onChange={(e) => setPartialAmount(e.target.value)}
              disabled={!inputEnabled}
              onKeyDown={handlePartialSubmit}
            />
          </div>
        </div>
        {inputEnabled ? (
          <p>Ingresa el monto a pagar</p>
        ) : (
          <p>Presiona la tecla 1 o 2 según la opción que elijas</p>
        )}
        <button className="modal-cerrar" onClick={onClose}>
          Cerrar
        </button>
      </div>
      {confirmData && (
        <ModalEfectivoConfirm
          empleado={empleado} // <== Aquí se pasa el objeto empleado
          amount={confirmData.amount}
          type={confirmData.type}
          onConfirm={(amt) => {
            if (onConfirm) onConfirm(amt);
            setConfirmData(null);
            onClose();
          }}
          onCancel={() => setConfirmData(null)}
        />
      )}
    </div>
  );
};

export default ModalEfectivo;
