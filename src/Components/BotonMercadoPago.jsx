import React from "react";

const BotonMercadoPago = ({ empleado }) => {
  const handleMercadoPago = () => {
    alert(`Generando enlace de pago para ${empleado.nombre}`);
  };

  return <button className="boton-mercadopago" onClick={handleMercadoPago}>MercadoPago</button>;
};

export default BotonMercadoPago;
