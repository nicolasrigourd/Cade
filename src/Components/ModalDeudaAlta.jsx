import React, { useState, useEffect, useRef } from "react";
import ModalEfectivoConfirm from "./ModalEfectivoConfirm";

const ModalDeudaAlta = ({ empleado, onClose, onMontoValido }) => {
  const [inputMonto, setInputMonto] = useState("");
  const [error, setError] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const inputRef = useRef(null);

  const montoMinimo = empleado?.montoPermitido ?? 0;

  useEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, []);

  const handleAceptar = () => {
    const monto = parseFloat(inputMonto);
    if (isNaN(monto) || monto < montoMinimo) {
      setError("⚠️ El monto ingresado debe ser mayor o igual al requerido.");
      return;
    }
    setError("");
    setConfirmando(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAceptar();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!empleado) return null;

  return (
    <div className="modal-deuda-alta-overlay">
      <div className="modal-deuda-alta">
        <div className="modal-deuda-alta-header">
          <p>
            <strong>ID:</strong> {empleado.id} | {empleado["nombre y apellido"]}
          </p>
        </div>

        <h2>DEUDA TOTAL: ${Number(empleado.deuda) + Number(empleado.multa) + Number(empleado.base)}</h2>
        <p className="modal-deuda-alta-warning">
          Este ID presenta deudas altas y reiteradas. Perdió el beneficio de pagos parciales.
        </p>
        <p>
          Para habilitarse deberá abonar como mínimo:
        </p>
        <p className="modal-deuda-alta-minimo">${montoMinimo}</p>

        <input
          ref={inputRef}
          type="number"
          placeholder={`Monto mínimo: $${montoMinimo}`}
          value={inputMonto}
          onChange={(e) => setInputMonto(e.target.value)}
          onKeyDown={handleKeyDown}
          className="modal-deuda-alta-input"
        />
        {error && <p className="modal-deuda-alta-error">{error}</p>}

        <div className="modal-deuda-alta-actions">
          <button className="btn-aceptar" onClick={handleAceptar}>
            Aceptar
          </button>
          <button className="btn-cerrar" onClick={onClose}>
            Cerrar
          </button>
        </div>

        {confirmando && (
          <ModalEfectivoConfirm
            empleado={empleado}
            amount={inputMonto}
            type="obligatorio"
            onConfirm={(amt) => {
              if (onMontoValido) onMontoValido(amt);
              setConfirmando(false);
            }}
            onCancel={() => setConfirmando(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ModalDeudaAlta;
