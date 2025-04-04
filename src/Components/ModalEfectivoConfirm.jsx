
import React from "react";

const ModalEfectivoConfirm = ({ empleado, amount, type, onConfirm, onCancel }) => {
  if (!empleado) {
    console.error("Empleado no definido en ModalEfectivoConfirm");
    return null;
  }

  // Función para formatear la fecha a "DD-MM-YYYY"
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleConfirm = async () => {
    const now = new Date();
    const fechaEstandar = formatDate(now); // Ejemplo: "03-04-2025"
    const fechaAlternativa = now.toLocaleDateString(); // Ejemplo: "3/4/2025"
    
    // Obtener el operador desde localStorage (suponiendo que está guardado en "loggedUser")
    const loggedUser = localStorage.getItem("loggedUser")
      ? JSON.parse(localStorage.getItem("loggedUser"))
      : {};
    const operador = loggedUser.username || "Desconocido";

    const hora = now.toLocaleTimeString(); // Ej.: "14:22:35"
    
    // Crear el objeto de pago con la propiedad operador
    const newPayment = {
      id: empleado.id,
      monto: amount,
      fecha: fechaEstandar, // Usaremos el formato estándar si es posible
      hora,
      detalles: "",
      operador
    };

    // Registro de pagos en localStorage bajo la clave "pagos"
    const storedPayments = localStorage.getItem("pagos");
    let pagos = storedPayments ? JSON.parse(storedPayments) : {};

    // Determinar la clave a usar:
    // Si ya existe una entrada en formato estándar, usarla.
    // Sino, si existe en formato alternativo, usar esa.
    // Sino, crear la clave con el formato estándar.
    let keyUsar = "";
    if (pagos[fechaEstandar]) {
      keyUsar = fechaEstandar;
    } else if (pagos[fechaAlternativa]) {
      keyUsar = fechaAlternativa;
    } else {
      keyUsar = fechaEstandar;
    }
    
    if (pagos[keyUsar]) {
      pagos[keyUsar].push(newPayment);
    } else {
      pagos[keyUsar] = [newPayment];
    }
    localStorage.setItem("pagos", JSON.stringify(pagos));

    const totalDeuda = Number(empleado.deuda) + Number(empleado.multa);
    const pago = parseFloat(amount);

    try {
      // Actualización en localStorage de bdcadetes (en vez de actualizar Firestore)
      const storedBdCadetes = localStorage.getItem("bdcadetes");
      if (storedBdCadetes) {
        let bdCadetes = JSON.parse(storedBdCadetes);
        const index = bdCadetes.findIndex(
          (c) => c.id.toString() === empleado.id.toString()
        );
        if (index !== -1) {
          if (pago >= totalDeuda) {
            // Pago total: se establecen deuda y multa en 0
            bdCadetes[index].deuda = 0;
            bdCadetes[index].multa = 0;
            // Opcional: eliminar campos temporales si existiesen
            delete bdCadetes[index].contador;
            delete bdCadetes[index].deudaPendiente;
          } else {
            // Pago parcial: se calcula el remanente y se asigna el contador
            const remainingDebt = Number(empleado.deuda) - pago;
            bdCadetes[index].deuda = 0; // se deja 0 para permitir la validación
            bdCadetes[index].contador = 3; // contador inicial para validación
            bdCadetes[index].deudaPendiente = remainingDebt;
          }
          localStorage.setItem("bdcadetes", JSON.stringify(bdCadetes));
        }
      }

      if (onConfirm) {
        onConfirm(amount);
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
