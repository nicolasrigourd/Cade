import React from "react";

const BotonSolicitarProrroga = ({ empleado }) => {
  const handleSolicitarProrroga = () => {
    alert(`Solicitud de prórroga enviada para ${empleado.nombre}`);
  };

  return <button className="boton-prorroga" onClick={handleSolicitarProrroga}>Solicitar Prórroga</button>;
};

export default BotonSolicitarProrroga;
