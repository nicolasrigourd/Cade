
import React from 'react';

const Ticket = ({ empleado }) => {
  const fechaActual = new Date().toLocaleDateString('es-AR', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });

  const lineaPunteada = {
    flex: 1,
    borderBottom: '1px dotted #000',
    marginLeft: '5px'
  };

  const lineaContainer = {
    display: 'flex',
    alignItems: 'flex-end',
    marginBottom: '15px'
  };

  return (
    <div style={{
      width: '300px',
      padding: '10px',
      border: '1px solid #000',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#ffffff',
      color: '#000',
      fontSize: '14px'
    }}>
      <img
        src="/logocadeteria.png"
        crossOrigin="anonymous"
        alt="Logo"
        style={{ width: '40%', margin: '0 auto 10px', display: 'block' }}
      />

      <p><strong>Fecha:</strong> {fechaActual}</p>
      <p><strong>ID Repartidor:</strong> {empleado.id}</p>

      <hr style={{ borderTop: '1px dashed #000', margin: '10px 0' }} />

      <div style={{ marginTop: '10px' }}>
        <div style={lineaContainer}>
          <strong>Cliente:</strong><div style={lineaPunteada}></div>
        </div>

        <div style={lineaContainer}>
          <strong>Desde:</strong><div style={lineaPunteada}></div>
        </div>

        <div style={lineaContainer}>
          <strong>Dinero:</strong><div style={lineaPunteada}></div>
        </div>

        <div style={lineaContainer}>
          <strong>Valor Trámite $:</strong><div style={lineaPunteada}></div>
        </div>
        
        <p style={{ fontWeight: 'bold', textAlign: 'center', margin: '15px 0' }}>
          Lea la parte de atrás las indicaciones
        </p>

        <p style={{ fontSize: '11px', marginTop: '20px', textAlign: 'center' }}>
          Sr. Cliente EXIJA SIEMPRE ESTE cupón. Si transporta dinero, COMUNICAR al operador de turno, caso contrario la empresa no se responsabiliza por dinero NO DECLARADO.
        </p>
      </div>

      <hr style={{ borderTop: '1px dashed #000', margin: '5px 0' }} />

      <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '15px' }}>
        <p><strong>Contacto:</strong> 422-9292 </p>
        <p><strong>WhatsApp:</strong> 385 5707199</p>
       
      </div>

      <hr style={{ borderTop: '1px dashed #000', margin: '5px 0' }} />

      <img
        src="/logotapioca.png"
        crossOrigin="anonymous"
        alt="Logo Tapioca"
        style={{ width: '50%', display: 'block' }}
      />

    </div>
  );
};

export default Ticket;
