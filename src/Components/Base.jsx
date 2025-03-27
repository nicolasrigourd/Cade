
// src/Components/Base.jsx
import React, { useState, useEffect, useRef } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const Base = () => {
  const [cadetes, setCadetes] = useState([]);
  const [baseDia, setBaseDia] = useState(null);
  const [pagos, setPagos] = useState({});

  // Para edición (solo admin)
  const [isEditing, setIsEditing] = useState(false);
  const [editableBase, setEditableBase] = useState([]);

  // Para previsualización
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // Referencia para imprimir
  const printRef = useRef();

  // Genera la fecha completa en formato DD-MM-YYYY para baseDia
  const today = new Date();
  const day = today.getDate().toString().padStart(2, "0");
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const year = today.getFullYear();
  const fullDateStr = `${day}-${month}-${year}`;

  // Para mostrar el día de la semana
  const weekday = today.toLocaleDateString("es-ES", { weekday: "long" });

  // Función para formatear la fecha según tu formato de pagos ("26/3/2025")
  const formatDateKey = (date) => {
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  // Obtenemos el usuario logueado para determinar si es admin
  const loggedUser = localStorage.getItem("loggedUser")
    ? JSON.parse(localStorage.getItem("loggedUser"))
    : null;
  const isAdmin = loggedUser && loggedUser.role === "admin";

  useEffect(() => {
    // Cargar "bdcadetes" desde localStorage y ordenarlos
    const storedCadetes = localStorage.getItem("bdcadetes");
    let cadetesData = [];
    if (storedCadetes) {
      cadetesData = JSON.parse(storedCadetes);
      cadetesData.sort((a, b) => Number(a.id) - Number(b.id));
      setCadetes(cadetesData);
    }

    // Verificar si ya existe "baseDia" para la fecha actual
    let storedBaseDia = localStorage.getItem("baseDia");
    let baseDiaObj = null;
    if (storedBaseDia) {
      baseDiaObj = JSON.parse(storedBaseDia);
      if (baseDiaObj.fecha !== fullDateStr) {
        baseDiaObj = null;
      }
    }
    if (!baseDiaObj) {
      baseDiaObj = {
        fecha: fullDateStr,
        base: cadetesData
          .map((cadete) => ({
            id: cadete.id,
            nombre: cadete["nombre y apellido"],
            deuda: cadete.deuda,
            base: cadete.base,
            total: Number(cadete.base) + Number(cadete.deuda),
            multa: cadete.multa || 0, // si manejas también la multa
          }))
          .sort((a, b) => Number(a.id) - Number(b.id)),
      };
      localStorage.setItem("baseDia", JSON.stringify(baseDiaObj));
    }
    setBaseDia(baseDiaObj);
  }, [fullDateStr]);

  useEffect(() => {
    if (baseDia && baseDia.base) {
      setEditableBase(baseDia.base);
    }
  }, [baseDia]);

  useEffect(() => {
    const storedPagos = localStorage.getItem("pagos");
    if (storedPagos) {
      try {
        const parsedPagos = JSON.parse(storedPagos);
        setPagos(parsedPagos);
      } catch (e) {
        console.error("Error al parsear 'pagos':", e);
        setPagos({});
      }
    }
  }, []);

  const getWeekday = (fecha) => {
    const parts = fecha.split("-");
    if (parts.length !== 3) return "";
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    const dateObj = new Date(y, m, d);
    return dateObj.toLocaleDateString("es-ES", { weekday: "long" });
  };

  // Función para subir la base (sin previsualización)
  const handleSubirBase = async () => {
    if (window.confirm("¿Está seguro de subir la base?")) {
      if (!baseDia) {
        alert("No hay registro de base diario para subir");
        return;
      }
      try {
        await setDoc(doc(db, "bases", fullDateStr), baseDia, { merge: true });
        alert("Base subida exitosamente");
      } catch (error) {
        console.error("Error al subir la base:", error);
        alert("Error al subir la base");
      }
    }
  };

  const handleInputChange = (id, field, value) => {
    setEditableBase((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleSaveChanges = () => {
    const updatedBase = editableBase.map((cadete) => ({
      ...cadete,
      total: Number(cadete.deuda) + Number(cadete.base),
    }));
    const newBaseDia = { ...baseDia, base: updatedBase };
    setBaseDia(newBaseDia);
    localStorage.setItem("baseDia", JSON.stringify(newBaseDia));
    setIsEditing(false);
  };

  // Función para previsualizar: calcular la deuda pendiente según pagos del día
  const handlePreview = () => {
    const paymentsKey = formatDateKey(today);
    const previewArray = editableBase.map((cadete) => {
      const originalTotal = Number(cadete.base) + Number(cadete.deuda);
      let sumPayments = 0;
      if (pagos && pagos[paymentsKey]) {
        pagos[paymentsKey].forEach((payment) => {
          if (String(payment.id) === String(cadete.id)) {
            sumPayments += parseFloat(payment.monto) || 0;
          }
        });
      }
      let remainder = originalTotal - sumPayments;
      if (remainder < 0) remainder = 0;
      return {
        ...cadete,
        sumPayments,
        newDeuda: remainder,
      };
    });
    setPreviewData(previewArray);
    setShowPreview(true);
  };

  // Función para subir la base desde la previsualización y limpiar el localStorage
  const handleUploadPreview = async () => {
    const updatedBaseArray = previewData.map((cadete) => ({
      ...cadete,
      deuda: cadete.newDeuda,
      total: Number(cadete.base) + Number(cadete.newDeuda),
    }));

    const paymentsKey = formatDateKey(today);
    const pagosDia = pagos[paymentsKey] || [];

    const updatedBaseDia = {
      ...baseDia,
      base: updatedBaseArray,
      pagos: pagosDia,
    };

    setBaseDia(updatedBaseDia);
    localStorage.setItem("baseDia", JSON.stringify(updatedBaseDia));

    try {
      await setDoc(doc(db, "bases", fullDateStr), updatedBaseDia, { merge: true });
      alert("Base subida exitosamente");
      // Vaciar las claves correspondientes en localStorage
      localStorage.removeItem("baseDia");
      if (pagos[paymentsKey]) {
        delete pagos[paymentsKey];
        localStorage.setItem("pagos", JSON.stringify(pagos));
      }
      setShowPreview(false);
    } catch (error) {
      console.error("Error al subir la base:", error);
      alert("Error al subir la base");
    }
  };

  // Función para imprimir la base (se imprime la sección de base-left)
  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open("", "", "height=600,width=400"); // 80mm aprox = 3.15 pulgadas, 400px puede funcionar; ajusta según sea necesario
    printWindow.document.write("<html><head><title>Imprimir Base</title>");
    // Puedes agregar estilos específicos para impresión aquí
    printWindow.document.write(`
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 10px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 5px; text-align: left; }
      </style>
    `);
    printWindow.document.write("</head><body>");
    printWindow.document.write(printContents);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="base-container">
      <div className="base-left" ref={printRef}>
        <h2>Base Diaria</h2>
        <p className="base-date">
          {weekday.charAt(0).toUpperCase() + weekday.slice(1)} - {fullDateStr}
        </p>
        {baseDia && editableBase && editableBase.length > 0 ? (
          <table className="base-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre y Apellido</th>
                <th>Deuda</th>
                <th>Base</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {editableBase.map((cadete) => (
                <tr key={cadete.id}>
                  <td>{cadete.id}</td>
                  <td>{cadete.nombre}</td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        value={cadete.deuda}
                        onChange={(e) =>
                          handleInputChange(cadete.id, "deuda", e.target.value)
                        }
                      />
                    ) : (
                      cadete.deuda
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        value={cadete.base}
                        onChange={(e) =>
                          handleInputChange(cadete.id, "base", e.target.value)
                        }
                      />
                    ) : (
                      cadete.base
                    )}
                  </td>
                  <td>{Number(cadete.deuda) + Number(cadete.base)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay datos de cadetes disponibles.</p>
        )}
      </div>

      <div className="base-right">
        <h2>Pagos</h2>
        {Object.keys(pagos).length === 0 ? (
          <p>No hay pagos registrados.</p>
        ) : (
          Object.keys(pagos).map((fecha) => {
            const weekdayPago = getWeekday(fecha);
            return (
              <div key={fecha} className="pagos-day">
                <h3>
                  {weekdayPago.charAt(0).toUpperCase() +
                    weekdayPago.slice(1)} - {fecha}
                </h3>
                <table className="pagos-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Monto</th>
                      <th>Hora</th>
                      <th>Tipo de Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagos[fecha].map((pago, index) => (
                      <tr key={index}>
                        <td>{pago.id}</td>
                        <td>{pago.monto}</td>
                        <td>{pago.hora}</td>
                        <td>{pago.tipo || "efectivo"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </div>

      <div className="base-footer">
        
        <button className="subir-base-btn" onClick={handlePrint}>
          Imprimir Base
        </button>
        
        {isAdmin && (
          <>
            <button className="subir-base-btn" onClick={handleSubirBase}>
              Subir Base
            </button>
            {isEditing ? (
              <button className="subir-base-btn" onClick={handleSaveChanges}>
                Guardar Cambios
              </button>
            ) : (
              <button
                className="subir-base-btn"
                onClick={() => setIsEditing(true)}
              >
                Habilitar Edición
              </button>
            )}
            <button className="subir-base-btn" onClick={handlePreview}>
              Previsualizar
            </button>
          </>
        )}
      </div>

      
      {showPreview && (
        <div className="modal-overlay">
          <div className="modal" style={{ padding: "20px", textAlign: "center" }}>
            <h2>Previsualización de Base</h2>
            <table
              style={{ width: "100%", borderCollapse: "collapse", margin: "10px 0" }}
            >
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Total Original</th>
                  <th>Pagado</th>
                  <th>Deuda Pendiente</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((cadete) => (
                  <tr key={cadete.id} style={{ borderBottom: "1px solid #ccc" }}>
                    <td>{cadete.id}</td>
                    <td>{cadete.nombre}</td>
                    <td>{Number(cadete.base) + Number(cadete.deuda)}</td>
                    <td>{cadete.sumPayments}</td>
                    <td>{cadete.newDeuda}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="subir-base-btn" onClick={handleUploadPreview}>
              Subir Base
            </button>
            <button className="subir-base-btn" onClick={() => setShowPreview(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Base;

