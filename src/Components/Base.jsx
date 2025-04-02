/*
// src/Components/Base.jsx
import React, { useState, useEffect, useRef } from "react";
import { doc, setDoc, updateDoc } from "firebase/firestore";
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

  // Función para obtener el día de la semana (formato "DD-MM-YYYY")
  const getCurrentWeekday = (fechaStr) => {
    const parts = fechaStr.split("-");
    if (parts.length !== 3) return "";
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    const dateObj = new Date(y, m, d);
    return dateObj.toLocaleDateString("es-ES", { weekday: "long" });
  };

  // Formateo de fecha para los pagos
  const formatDateKey = (date) => {
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  // Normaliza cualquier string de fecha al formato "DD-MM-YYYY"
  const normalizeDateKey = (dateStr) => {
    if (!dateStr) return "";
    dateStr = dateStr.trim();
    const parts = dateStr.split(/[\/-]/);
    if (parts.length === 3) {
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2];
      return `${day}-${month}-${year}`;
    }
    return dateStr;
  };

  const loggedUser = localStorage.getItem("loggedUser")
    ? JSON.parse(localStorage.getItem("loggedUser"))
    : null;
  const isAdmin = loggedUser && loggedUser.role === "admin";

  useEffect(() => {
    const storedCadetes = localStorage.getItem("bdcadetes");
    let cadetesData = [];
    if (storedCadetes) {
      cadetesData = JSON.parse(storedCadetes);
      cadetesData.sort((a, b) => Number(a.id) - Number(b.id));
      setCadetes(cadetesData);
    }

    const storedBaseDia = localStorage.getItem("baseDia");
    if (storedBaseDia) {
      setBaseDia(JSON.parse(storedBaseDia));
    } else {
      const today = new Date();
      const day = today.getDate().toString().padStart(2, "0");
      const month = (today.getMonth() + 1).toString().padStart(2, "0");
      const year = today.getFullYear();
      const fullDateStr = `${day}-${month}-${year}`;
      const newBaseDia = {
        fecha: fullDateStr,
        base: cadetesData
          .map((cadete) => ({
            id: cadete.id,
            "nombre y apellido": cadete["nombre y apellido"],
            deuda: cadete.deuda,
            base: cadete.base,
            total: Number(cadete.base) + Number(cadete.deuda),
            multa: cadete.multa || 0,
          }))
          .sort((a, b) => Number(a.id) - Number(b.id)),
      };
      localStorage.setItem("baseDia", JSON.stringify(newBaseDia));
      setBaseDia(newBaseDia);
    }
  }, []);

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

  const noPagosRegistrados =
    Object.keys(pagos).length === 0 ||
    Object.keys(pagos).every((key) => pagos[key].length === 0);

  // Función para el botón "Subir Base" fuera del modal (actualiza la colección "bases")
  const handleSubirBase = async () => {
    if (window.confirm("¿Está seguro de subir la base?")) {
      if (!baseDia) {
        alert("No hay registro de base diario para subir");
        return;
      }
      const dateKey = baseDia.fecha;
      let pagosDia = [];
      for (const key in pagos) {
        if (normalizeDateKey(key) === dateKey) {
          pagosDia = pagosDia.concat(pagos[key]);
        }
      }
      const dataToUpload = {
        base: baseDia.base,
        pagos: pagosDia,
      };
      try {
        await setDoc(doc(db, "bases", dateKey), dataToUpload, { merge: true });
        alert("Base y pagos subidos exitosamente.");
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

  // Función de previsualización: calcula la deuda pendiente sumando los pagos de todas las claves
  const handlePreview = () => {
    const paymentsKey = baseDia && baseDia.fecha ? baseDia.fecha : formatDateKey(new Date());
    const previewArray = editableBase.map((cadete) => {
      const originalTotal = Number(cadete.base) + Number(cadete.deuda);
      let sumPayments = 0;
      // Acumula todos los pagos cuyo valor normalizado coincida con paymentsKey
      for (const key in pagos) {
        if (normalizeDateKey(key) === paymentsKey) {
          pagos[key].forEach((payment) => {
            if (String(payment.id) === String(cadete.id)) {
              sumPayments += parseFloat(payment.monto) || 0;
            }
          });
          // Eliminamos el break para acumular de todas las claves coincidentes
        }
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

  
  const handleUploadPreview = async () => {
    try {
      for (const cadete of previewData) {
        const { id, base, newDeuda, multa } = cadete;
        const docRef = doc(db, "cadetes", id);
        await updateDoc(docRef, {
          deuda: newDeuda,
          base: base,
          multa: multa || 0,
        });
      }
      alert("Cadetes actualizados en Firestore correctamente.");
      setShowPreview(false);
    } catch (error) {
      console.error("Error actualizando cadetes en Firestore:", error);
      alert("Ocurrió un error al actualizar los cadetes en Firestore.");
    }
  };

  // Función para imprimir la base
  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open("", "", "height=600,width=400");
    printWindow.document.write("<html><head><title>Imprimir Base</title>");
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
          {baseDia && baseDia.fecha
            ? `${getCurrentWeekday(baseDia.fecha).charAt(0).toUpperCase() +
                getCurrentWeekday(baseDia.fecha).slice(1)} - ${baseDia.fecha}`
            : (() => {
                const today = new Date();
                const day = today.getDate().toString().padStart(2, "0");
                const month = (today.getMonth() + 1).toString().padStart(2, "0");
                const year = today.getFullYear();
                const fullDateStr = `${day}-${month}-${year}`;
                return `${getCurrentWeekday(fullDateStr).charAt(0).toUpperCase() +
                  getCurrentWeekday(fullDateStr).slice(1)} - ${fullDateStr}`;
              })()}
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
                  <td>{cadete["nombre y apellido"]}</td>
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
        {noPagosRegistrados ? (
          <p>No hay pagos registrados.</p>
        ) : (
          (() => {
            const fechas = Object.keys(pagos).filter(
              (key) => pagos[key].length > 0
            );
            if (fechas.length === 1) {
              const fecha = fechas[0];
              const weekdayPago = getCurrentWeekday(normalizeDateKey(fecha));
              return (
                <div className="pagos-day">
                  <h3>
                    {weekdayPago.charAt(0).toUpperCase() + weekdayPago.slice(1)} -{" "}
                    {normalizeDateKey(fecha)}
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
            } else {
              return fechas.map((fecha) => {
                const weekdayPago = getCurrentWeekday(normalizeDateKey(fecha));
                return (
                  <div key={fecha} className="pagos-day">
                    <h3>
                      {weekdayPago.charAt(0).toUpperCase() + weekdayPago.slice(1)} -{" "}
                      {normalizeDateKey(fecha)}
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
              });
            }
          })()
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
            <table style={{ width: "100%", borderCollapse: "collapse", margin: "10px 0" }}>
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
                    <td>{cadete["nombre y apellido"]}</td>
                    <td>{Number(cadete.base) + Number(cadete.deuda)}</td>
                    <td>{cadete.sumPayments}</td>
                    <td>{cadete.newDeuda}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="subir-base-btn" onClick={handleUploadPreview}>
              Actualizar Firestore
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
*/
// src/Components/Base.jsx
import React, { useState, useEffect, useRef } from "react";
import { doc, setDoc, updateDoc } from "firebase/firestore";
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

  // Estado para saber si ya se subió la base (fuera del modal)
  const [isBaseUploaded, setIsBaseUploaded] = useState(false);

  // Referencia para imprimir
  const printRef = useRef();

  // Función para obtener el día de la semana (formato "DD-MM-YYYY")
  const getCurrentWeekday = (fechaStr) => {
    const parts = fechaStr.split("-");
    if (parts.length !== 3) return "";
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    const dateObj = new Date(y, m, d);
    return dateObj.toLocaleDateString("es-ES", { weekday: "long" });
  };

  // Formateo de fecha para los pagos
  const formatDateKey = (date) => {
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  // Normaliza cualquier string de fecha al formato "DD-MM-YYYY"
  const normalizeDateKey = (dateStr) => {
    if (!dateStr) return "";
    dateStr = dateStr.trim();
    const parts = dateStr.split(/[\/-]/);
    if (parts.length === 3) {
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2];
      return `${day}-${month}-${year}`;
    }
    return dateStr;
  };

  const loggedUser = localStorage.getItem("loggedUser")
    ? JSON.parse(localStorage.getItem("loggedUser"))
    : null;
  const isAdmin = loggedUser && loggedUser.role === "admin";

  useEffect(() => {
    const storedCadetes = localStorage.getItem("bdcadetes");
    let cadetesData = [];
    if (storedCadetes) {
      cadetesData = JSON.parse(storedCadetes);
      cadetesData.sort((a, b) => Number(a.id) - Number(b.id));
      setCadetes(cadetesData);
    }

    const storedBaseDia = localStorage.getItem("baseDia");
    if (storedBaseDia) {
      setBaseDia(JSON.parse(storedBaseDia));
    } else {
      const today = new Date();
      const day = today.getDate().toString().padStart(2, "0");
      const month = (today.getMonth() + 1).toString().padStart(2, "0");
      const year = today.getFullYear();
      const fullDateStr = `${day}-${month}-${year}`;
      const newBaseDia = {
        fecha: fullDateStr,
        base: cadetesData
          .map((cadete) => ({
            id: cadete.id,
            "nombre y apellido": cadete["nombre y apellido"],
            deuda: cadete.deuda,
            base: cadete.base,
            total: Number(cadete.base) + Number(cadete.deuda),
            multa: cadete.multa || 0,
          }))
          .sort((a, b) => Number(a.id) - Number(b.id)),
      };
      localStorage.setItem("baseDia", JSON.stringify(newBaseDia));
      setBaseDia(newBaseDia);
    }
  }, []);

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

  const noPagosRegistrados =
    Object.keys(pagos).length === 0 ||
    Object.keys(pagos).every((key) => pagos[key].length === 0);

  // Botón "Subir Base" (fuera del modal) sube la base y marca que se subió
  const handleSubirBase = async () => {
    if (window.confirm("¿Está seguro de subir la base?")) {
      if (!baseDia) {
        alert("No hay registro de base diario para subir");
        return;
      }
      const dateKey = baseDia.fecha;
      let pagosDia = [];
      for (const key in pagos) {
        if (normalizeDateKey(key) === dateKey) {
          pagosDia = pagosDia.concat(pagos[key]);
        }
      }
      const dataToUpload = {
        base: baseDia.base,
        pagos: pagosDia,
      };
      try {
        await setDoc(doc(db, "bases", dateKey), dataToUpload, { merge: true });
        alert("Base y pagos subidos exitosamente.");
        // Una vez subida la base, habilitamos el botón de previsualización
        setIsBaseUploaded(true);
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

  // Función de previsualización: acumula todos los pagos cuyo valor normalizado coincida con la fecha
  const handlePreview = () => {
    const paymentsKey = baseDia && baseDia.fecha ? baseDia.fecha : formatDateKey(new Date());
    const previewArray = editableBase.map((cadete) => {
      const originalTotal = Number(cadete.base) + Number(cadete.deuda);
      let sumPayments = 0;
      for (const key in pagos) {
        if (normalizeDateKey(key) === paymentsKey) {
          pagos[key].forEach((payment) => {
            if (String(payment.id) === String(cadete.id)) {
              sumPayments += parseFloat(payment.monto) || 0;
            }
          });
        }
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

  /**
   * Función para el botón "Subir Base" del modal de previsualización.
   * Actualiza cada cadete en la colección "cadetes" de Firestore actualizando los campos:
   * deuda, base y multa.
   */
  const handleUploadPreview = async () => {
    try {
      for (const cadete of previewData) {
        const { id, base, newDeuda, multa } = cadete;
        const docRef = doc(db, "cadetes", id);
        await updateDoc(docRef, {
          deuda: newDeuda,
          base: base,
          multa: multa || 0,
        });
      }
      alert("Cadetes actualizados en Firestore correctamente.");
      setShowPreview(false);
    } catch (error) {
      console.error("Error actualizando cadetes en Firestore:", error);
      alert("Ocurrió un error al actualizar los cadetes en Firestore.");
    }
  };

  // Función para imprimir la base
  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open("", "", "height=600,width=400");
    printWindow.document.write("<html><head><title>Imprimir Base</title>");
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
          {baseDia && baseDia.fecha
            ? `${getCurrentWeekday(baseDia.fecha).charAt(0).toUpperCase() +
                getCurrentWeekday(baseDia.fecha).slice(1)} - ${baseDia.fecha}`
            : (() => {
                const today = new Date();
                const day = today.getDate().toString().padStart(2, "0");
                const month = (today.getMonth() + 1).toString().padStart(2, "0");
                const year = today.getFullYear();
                const fullDateStr = `${day}-${month}-${year}`;
                return `${getCurrentWeekday(fullDateStr).charAt(0).toUpperCase() +
                  getCurrentWeekday(fullDateStr).slice(1)} - ${fullDateStr}`;
              })()}
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
                  <td>{cadete["nombre y apellido"]}</td>
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
        {noPagosRegistrados ? (
          <p>No hay pagos registrados.</p>
        ) : (
          (() => {
            const fechas = Object.keys(pagos).filter((key) => pagos[key].length > 0);
            if (fechas.length === 1) {
              const fecha = fechas[0];
              const weekdayPago = getCurrentWeekday(normalizeDateKey(fecha));
              return (
                <div className="pagos-day">
                  <h3>
                    {weekdayPago.charAt(0).toUpperCase() + weekdayPago.slice(1)} - {normalizeDateKey(fecha)}
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
            } else {
              return fechas.map((fecha) => {
                const weekdayPago = getCurrentWeekday(normalizeDateKey(fecha));
                return (
                  <div key={fecha} className="pagos-day">
                    <h3>
                      {weekdayPago.charAt(0).toUpperCase() + weekdayPago.slice(1)} - {normalizeDateKey(fecha)}
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
              });
            }
          })()
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
              <button className="subir-base-btn" onClick={() => setIsEditing(true)}>
                Habilitar Edición
              </button>
            )}
            <button 
              className="subir-base-btn" 
              onClick={handlePreview}
              disabled={!isBaseUploaded}  // Deshabilitado hasta que se suba la base
              title={!isBaseUploaded ? "Debes subir la base primero" : ""}
            >
              Previsualizar
            </button>
          </>
        )}
      </div>

      {showPreview && (
        <div className="modal-overlay">
          <div className="modal" style={{ padding: "20px", textAlign: "center" }}>
            <h2>Previsualización de Base</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", margin: "10px 0" }}>
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
                    <td>{cadete["nombre y apellido"]}</td>
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
