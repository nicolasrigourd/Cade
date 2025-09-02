/*
// src/Components/ModalDeuda.jsx
import React, { useEffect, useState } from "react";

const ModalDeuda = ({ empleado, onClose, onOptionSelected, onModalOpen }) => {
  const [showServicioModal, setShowServicioModal] = useState(false);

  const deuda = Number(empleado.deuda) || 0;
  const multa = Number(empleado.multa) || 0;
  const base = Number(empleado.base) || 0;
  const totalDeuda = deuda + multa + base;

  useEffect(() => {
    if (onModalOpen) {
      onModalOpen();
    }
  }, [onModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "2") {
        setShowServicioModal((prev) => !prev);
        return;
      }
      if (showServicioModal) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "1") {
        onOptionSelected("efectivo");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onOptionSelected, showServicioModal]);

  useEffect(() => {
    if (!showServicioModal) return;

    const handleEnterKey = (e) => {
      if (e.key === "Enter") {
        setShowServicioModal(false);
      }
    };

    window.addEventListener("keydown", handleEnterKey);
    return () => window.removeEventListener("keydown", handleEnterKey);
  }, [showServicioModal]);

  return (
    <div className="modal-deuda-overlay">
      <div className="modal-deuda">
        <div className="modal-deuda-header">
          <p>
            <strong>ID:</strong> {empleado.id} | {empleado["nombre y apellido"]}
          </p>
        </div>

        <h2>Su deuda actual es:</h2>
        <p><strong>Deuda:</strong> ${deuda}</p>
        <p><strong>Multa:</strong> ${multa}</p>
        <p><strong>Base:</strong> ${base}</p>
        <h3>Total: ${totalDeuda}</h3>

        <hr />
        <p>Elija una de las siguientes opciones:</p>

        <div className="modal-deuda-botones">
          <div className="opcion">
            <p>Presione tecla 1</p>
            <button onClick={() => onOptionSelected("efectivo")} className="boton-efectivo">
              Pago en Efectivo
            </button>
          </div>
          <div className="opcion">
            <p>Presione tecla 2</p>
            <button
              onClick={() => setShowServicioModal((prev) => !prev)}
              className="boton-mercadopago"
            >
              Pago con MercadoPago
            </button>
          </div>
        </div>

        <button className="modal-cerrar" onClick={onClose}>
          Cerrar
        </button>
      </div>

      {showServicioModal && (
        <div className="modal-deuda-overlay">
          <div className="modal-deuda" style={{ textAlign: "center" }}>
            <h2>Momentáneamente fuera de servicio</h2>
            <p>Presione Enter para cerrar</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalDeuda;
*/
// src/Components/ModalDeuda.jsx
import React, { useEffect, useState } from "react";

const ModalDeuda = ({ empleado, onClose, onOptionSelected, onModalOpen }) => {
  const [showServicioModal, setShowServicioModal] = useState(false);

  const deuda = Number(empleado.deuda) || 0;
  const multa = Number(empleado.multa) || 0;
  const base  = Number(empleado.base)  || 0;

  // ✅ Total a pagar = deuda + multa (la base NO se suma)
  const totalAPagar = deuda + multa;

  useEffect(() => {
    if (onModalOpen) onModalOpen();
  }, [onModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "2") {
        setShowServicioModal((prev) => !prev);
        return;
      }
      if (showServicioModal) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "1") {
        onOptionSelected("efectivo");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onOptionSelected, showServicioModal]);

  useEffect(() => {
    if (!showServicioModal) return;
    const handleEnterKey = (e) => {
      if (e.key === "Enter") setShowServicioModal(false);
    };
    window.addEventListener("keydown", handleEnterKey);
    return () => window.removeEventListener("keydown", handleEnterKey);
  }, [showServicioModal]);

  return (
    <div className="modal-deuda-overlay">
      <div className="modal-deuda">
        <div className="modal-deuda-header">
          <p>
            <strong>ID:</strong> {empleado.id} | {empleado["nombre y apellido"]}
          </p>
        </div>

        <h2>Detalle de deuda</h2>
        <p><strong>Deuda:</strong> ${deuda}</p>
        <p><strong>Multa:</strong> ${multa}</p>
        <p><strong>Base:</strong> ${base}</p>

        {/* 👇 Cambiamos el rótulo para dejar claro que la base no se suma */}
        <h3>Total a pagar (Deuda + Multa): ${totalAPagar}</h3>

        <hr />
        <p>Elija una de las siguientes opciones:</p>

        <div className="modal-deuda-botones">
          <div className="opcion">
            <p>Presione tecla 1</p>
            <button onClick={() => onOptionSelected("efectivo")} className="boton-efectivo">
              Pago en Efectivo
            </button>
          </div>
          <div className="opcion">
            <p>Presione tecla 2</p>
            <button
              onClick={() => setShowServicioModal((prev) => !prev)}
              className="boton-mercadopago"
            >
              Pago con MercadoPago
            </button>
          </div>
        </div>

        <button className="modal-cerrar" onClick={onClose}>
          Cerrar
        </button>
      </div>

      {showServicioModal && (
        <div className="modal-deuda-overlay">
          <div className="modal-deuda" style={{ textAlign: "center" }}>
            <h2>Momentáneamente fuera de servicio</h2>
            <p>Presione Enter para cerrar</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalDeuda;
