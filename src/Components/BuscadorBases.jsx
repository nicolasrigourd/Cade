// BuscadorBases.jsx
import React, { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';


const BuscadorBases = () => {
  const [fecha, setFecha] = useState('');          // "YYYY-MM-DD"
  const [resultados, setResultados] = useState([]); // Documentos de Firestore
  const [mostrarTabla, setMostrarTabla] = useState(false);

  // Convierte "YYYY-MM-DD" a "DD-MM-YYYY"
  const formatearFecha = (fechaYMD) => {
    const [year, month, day] = fechaYMD.split('-');
    return `${day}-${month}-${year}`;
  };

  const handleBuscar = async () => {
    try {
      if (!fecha) {
        alert('Por favor, selecciona una fecha');
        return;
      }
      const fechaFormateada = formatearFecha(fecha);

      // Colección "bases" en Firestore
      const coleccionRef = collection(db, 'bases');

      // Consulta por el campo 'fecha' == fechaFormateada
      const q = query(coleccionRef, where('fecha', '==', fechaFormateada));
      const querySnapshot = await getDocs(q);

      const documentos = [];
      querySnapshot.forEach((doc) => {
        documentos.push({
          idDoc: doc.id,
          ...doc.data(),
        });
      });

      setResultados(documentos);
      setMostrarTabla(true);
    } catch (error) {
      console.error('Error al buscar documentos:', error);
    }
  };

  const handleCerrar = () => {
    setMostrarTabla(false);
    setResultados([]);
  };

  return (
    <div className="buscador-bases__container">
      <div className="buscador-bases__header">
        <h2>Buscador de Bases</h2>
        
        {/* Input de fecha y botón Buscar */}
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          style={{ marginRight: '8px' }}
        />
        <button className="buscador-bases__button" onClick={handleBuscar}>
          Buscar
        </button>
      </div>

      {/* Sección de resultados */}
      {mostrarTabla && (
        <div className="buscador-bases__table-container">
          {/* Botón para cerrar la tabla */}
          <button
            className={`buscador-bases__button buscador-bases__close-button`}
            onClick={handleCerrar}
          >
            Cerrar
          </button>

          {/* Si no hay documentos, avisamos al usuario */}
          {resultados.length === 0 ? (
            <p>No hay resultados para esta fecha.</p>
          ) : (
            // Mapeamos cada documento
            resultados.map((doc) => (
              <div key={doc.idDoc} style={{ marginBottom: '2rem' }}>
                <h3>Documento ID: {doc.idDoc}</h3>
                <p>Fecha en Firestore: {doc.fecha}</p>

                {/* ================== TABLA DE BASE ================== */}
                {Array.isArray(doc.base) && doc.base.length > 0 ? (
                  <>
                    <h4>Datos de la Base</h4>
                    <table className="buscador-bases__table">
                      <thead>
                        <tr>
                          {/* Ajusta las columnas según tus campos reales */}
                          <th className="buscador-bases__th">base</th>
                          <th className="buscador-bases__th">deuda</th>
                          <th className="buscador-bases__th">id</th>
                          <th className="buscador-bases__th">multa</th>
                          <th className="buscador-bases__th">newDeuda</th>
                          <th className="buscador-bases__th">nombre</th>
                          <th className="buscador-bases__th">sumPayments</th>
                          <th className="buscador-bases__th">total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doc.base.map((item, index) => (
                          <tr key={index}>
                            <td className="buscador-bases__td">{item.base}</td>
                            <td className="buscador-bases__td">{item.deuda}</td>
                            <td className="buscador-bases__td">{item.id}</td>
                            <td className="buscador-bases__td">{item.multa}</td>
                            <td className="buscador-bases__td">{item.newDeuda}</td>
                            <td className="buscador-bases__td">{item.nombre}</td>
                            <td className="buscador-bases__td">{item.sumPayments}</td>
                            <td className="buscador-bases__td">{item.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <p>No hay datos en el array <em>base</em>.</p>
                )}

                {/* ================== TABLA DE PAGOS ================== */}
                {Array.isArray(doc.pagos) && doc.pagos.length > 0 ? (
                  <>
                    <h4>Datos de Pagos</h4>
                    <table className="buscador-bases__table">
                      <thead>
                        <tr>
                          <th className="buscador-bases__th">detalles</th>
                          <th className="buscador-bases__th">fecha</th>
                          <th className="buscador-bases__th">hora</th>
                          <th className="buscador-bases__th">id</th>
                          <th className="buscador-bases__th">monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doc.pagos.map((pago, idx) => (
                          <tr key={idx}>
                            <td className="buscador-bases__td">{pago.detalles}</td>
                            <td className="buscador-bases__td">{pago.fecha}</td>
                            <td className="buscador-bases__td">{pago.hora}</td>
                            <td className="buscador-bases__td">{pago.id}</td>
                            <td className="buscador-bases__td">{pago.monto}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <p>No hay datos en el array <em>pagos</em>.</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default BuscadorBases;
