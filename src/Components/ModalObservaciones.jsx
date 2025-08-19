import React, { useEffect, useRef } from "react";

const ModalObservaciones = ({ empleado, onClose }) => {
  if (!empleado) return null;

  const mensaje =
    (empleado.observaciones && String(empleado.observaciones).trim()) ||
    "Este cadete se encuentra bloqueado. Comuníquese con administración.";

  // Cerrar con Enter o Esc
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Enfoque inicial en el botón Aceptar
  const aceptarRef = useRef(null);
  useEffect(() => {
    aceptarRef.current?.focus();
  }, []);

  return (
    <div className="modalobservaciones-overlay">
      <div
        className="modalobservaciones"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalobservaciones-title"
      >
        <div className="modalobservaciones-header">
          <p id="modalobservaciones-title">BLOQUEADO</p>
        </div>

        <div className="modalobservaciones-body">
          <h3 className="modalobservaciones-subtitle">
            {(empleado["nombre y apellido"] || "Cadete")} (ID: {empleado.id})
          </h3>
          <p className="modalobservaciones-text">{mensaje}</p>
        </div>

        <div className="modalobservaciones-actions">
          <button ref={aceptarRef} onClick={onClose}>Aceptar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalObservaciones;
