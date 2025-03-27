// src/Components/BotonPagoEfectivo.jsx
import React from "react";

const BotonPagoEfectivo = ({ empleado, onClick }) => {
  return (
    <button className="boton-efectivo" onClick={onClick}>
       Efectivo
    </button>
  );
};

export default BotonPagoEfectivo;
