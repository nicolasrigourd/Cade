
// src/Components/ModalDeuda.jsx
import React, { useEffect } from "react";

const ModalDeuda = ({ empleado, onClose, onOptionSelected, onModalOpen }) => {
  const totalDeuda = empleado.deuda + empleado.multa;

  // Efecto para llamar onModalOpen (si se pasa) al montar el modal, de modo que se desactive el foco en el Imput
  useEffect(() => {
    if (onModalOpen) {
      onModalOpen();
    }
  }, [onModalOpen]);

  // Listener para teclas: Esc cierra; 1, 2, 3 para seleccionar opción
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "1") {
        onOptionSelected("efectivo");
      } else if (e.key === "2") {
        onOptionSelected("mercadopago");
      } else if (e.key === "3") {
        onOptionSelected("prorroga");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onOptionSelected]);

  return (
    <div className="modal-deuda-overlay">
      <div className="modal-deuda">
        <div className="modal-deuda-header">
          <p>
            <strong>ID:</strong> {empleado.id} | <strong>Nombre:</strong>{" "}
            {empleado.nombre} {empleado.apellido}
          </p>
        </div>
        <h2>Su deuda actual es:</h2>
        <p>
          <strong>Deuda:</strong> ${empleado.deuda}
        </p>
        <p>
          <strong>Multa:</strong> ${empleado.multa}
        </p>
        <h3>Total: ${totalDeuda}</h3>
        <hr />
        <p>Elija una de las siguientes opciones:</p>
        <div className="modal-deuda-botones">
          <div className="opcion">
            <p>Presione tecla 1</p>
            <button onClick={() => onOptionSelected("efectivo")}>
              Pago en Efectivo
            </button>
          </div>
          <div className="opcion">
            <p>Presione tecla 2</p>
            <button onClick={() => onOptionSelected("mercadopago")}>
              Pago con MercadoPago
            </button>
          </div>
          <div className="opcion">
            <p>Presione tecla 3</p>
            <button onClick={() => onOptionSelected("prorroga")}>
              Solicitar Prórroga
            </button>
          </div>
        </div>
        <button className="modal-cerrar" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default ModalDeuda;
