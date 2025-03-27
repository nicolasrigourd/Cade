
// src/Components/ModalEfectivoConfirm.jsx
import React from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const ModalEfectivoConfirm = ({ empleado, amount, type, onConfirm, onCancel }) => {
  // Verificamos que se haya pasado el empleado
  if (!empleado) {
    console.error("Empleado no definido en ModalEfectivoConfirm");
    return null;
  }

  const handleConfirm = async () => {
    const now = new Date();
    const fecha = now.toLocaleDateString(); // Ej.: "31/03/2025"
    const hora = now.toLocaleTimeString();   // Ej.: "14:22:35"

    const newPayment = {
      id: empleado.id,
      monto: amount,
      fecha,
      hora,
    };

    // Registro de pagos en localStorage bajo la clave "pagos"
    const storedPayments = localStorage.getItem("pagos");
    let pagos = storedPayments ? JSON.parse(storedPayments) : {};
    if (pagos[fecha]) {
      pagos[fecha].push(newPayment);
    } else {
      pagos[fecha] = [newPayment];
    }
    localStorage.setItem("pagos", JSON.stringify(pagos));

    // Actualizar Firestore: se calcula el total pendiente y se actualizan deuda y multa
    const totalDeuda = Number(empleado.deuda) + Number(empleado.multa);
    const pago = parseFloat(amount);
    let newDeuda, newMulta;
    if (pago >= totalDeuda) {
      newDeuda = 0;
      newMulta = 0;
    } else {
      newDeuda = empleado.deuda - pago;
      if (newDeuda < 0) newDeuda = 0;
      newMulta = empleado.multa; // Aquí podrías ajustar la lógica si quieres modificar la multa en pagos parciales
    }
    try {
      await updateDoc(doc(db, "cadetes", empleado.id), {
        deuda: newDeuda,
        multa: newMulta,
      });
      if (onConfirm) {
        onConfirm(amount);
      } else {
        
      }
      onCancel();
    } catch (error) {
      console.error("Error updating cadete payment:", error);
      alert("Error al actualizar el pago, por favor inténtalo de nuevo.");
    }
  };

  return (
    <div className="modal-confirm-overlay">
      <div className="modal-confirm">
        <div className="modal-confirm-header">
          <p>OPERADOR</p>
        </div>
        <h2>
          {type === "total"
            ? `Recibiste el importe de: $${amount}`
            : `Recibiste: $${amount}`}
        </h2>
        <p>Este importe se computará como un pago en efectivo en el sistema.</p>
        <div className="modal-confirm-actions">
          <button onClick={handleConfirm}>SI, LO RECIBÍ</button>
          <button onClick={onCancel}>CERRAR</button>
        </div>
      </div>
    </div>
  );
};

export default ModalEfectivoConfirm;
