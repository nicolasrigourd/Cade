/*
// src/Components/GestionarCadetes.jsx
import React, { useRef, useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Imput from "./Imput";
import CadeteList from "./CadeteList";
import ModalDeuda from "./ModalDeuda";
import ModalEfectivo from "./ModalEfectivo";
import ModalNuevoPago from "./ModalNuevoPago"; // Asegúrate de tener este componente

const GestionarCadetes = () => {
  const inputRef = useRef(null);
  const [bdCadetes, setBdCadetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deployMessage, setDeployMessage] = useState("");
  const [habilitados, setHabilitados] = useState(() => {
    const stored = localStorage.getItem("habilitados");
    return stored ? JSON.parse(stored) : [];
  });
  
  // Estado para cadete con deuda, para mostrar el modal
  const [cadeteConDeuda, setCadeteConDeuda] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  
  // Estado para mostrar el modal de nuevo pago
  const [showModalNuevoPago, setShowModalNuevoPago] = useState(false);

  const fetchCadetes = async () => {
    try {
      const localData = localStorage.getItem("bdcadetes");
      if (localData) {
        const data = JSON.parse(localData);
        setBdCadetes(data);
        console.log("Cargando cadetes desde localStorage:", data);
        setDeployMessage("deploy existente");
      } else {
        // Si no existe "bdcadetes", se consulta Firestore y se crean "bdcadetes", "baseDia" y "pagos"
        const querySnapshot = await getDocs(collection(db, "cadetes"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBdCadetes(data);
        localStorage.setItem("bdcadetes", JSON.stringify(data));

        // Generar una fecha fija a partir del momento actual (fecha de creación)
        const today = new Date();
        const day = today.getDate().toString().padStart(2, "0");
        const month = (today.getMonth() + 1).toString().padStart(2, "0");
        const year = today.getFullYear();
        const fullDateStr = `${day}-${month}-${year}`; // Esta es la fecha fija de creación

        // Crear "baseDia" a partir de la información inicial de cadetes
        const baseDiaObj = {
          fecha: fullDateStr,
          base: data
            .map((cadete) => ({
              id: cadete.id,
              "nombre y apellido": cadete["nombre y apellido"],
              deuda: cadete.deuda,
              base: cadete.base || 0,
              total: Number(cadete.base || 0) + Number(cadete.deuda || 0),
              multa: cadete.multa || 0,
            }))
            .sort((a, b) => Number(a.id) - Number(b.id)),
        };
        localStorage.setItem("baseDia", JSON.stringify(baseDiaObj));

        // Inicializar "pagos" con la fecha fija, con un array vacío
        const pagosObj = { [fullDateStr]: [] };
        localStorage.setItem("pagos", JSON.stringify(pagosObj));

        console.log("La base de datos se trajo correctamente desde Firestore:", data);
        setDeployMessage("deploy confirmado");
      }

      // Si ya existe "baseDia" en localStorage, se utiliza sin modificarla
      const storedBaseDia = localStorage.getItem("baseDia");
      if (storedBaseDia) {
        setBaseDia(JSON.parse(storedBaseDia));
      }
    } catch (error) {
      console.error("Error fetching cadetes:", error);
    } finally {
      // Mostrar el spinner durante 3 segundos
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    }
  };

  useEffect(() => {
    fetchCadetes();
  }, []);

  // Devuelve el foco al Imput cada vez que se actualice el listado de cadetes habilitados
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focusInput();
    }
  }, [habilitados]);

  // Listener global para detectar la tecla "." y abrir el modal de nuevo pago
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === ".") {
        e.preventDefault();
        setShowModalNuevoPago(true);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  const handleIdSubmit = (id) => {
    const trimmedId = id.trim();
    console.log("ID ingresado:", trimmedId);
    const foundCadete = bdCadetes.find((c) => c.id.toString() === trimmedId);
    console.log("Cadete encontrado:", foundCadete);
    if (!foundCadete) {
      alert("Empleado no encontrado");
      inputRef.current && inputRef.current.focusInput();
      return;
    }
    if (foundCadete.deuda === 0 && foundCadete.multa === 0) {
      if (habilitados.some((c) => c.id.toString() === foundCadete.id.toString())) {
        alert("El empleado ya está validado");
      } else {
        const validatedCadete = {
          ...foundCadete,
          horario: new Date().toLocaleTimeString(),
        };
        const nuevosHabilitados = [...habilitados, validatedCadete];
        setHabilitados(nuevosHabilitados);
        localStorage.setItem("habilitados", JSON.stringify(nuevosHabilitados));
        console.log("Empleado validado:", validatedCadete);
      }
      inputRef.current && inputRef.current.focusInput();
    } else {
      // Si tiene deuda o multa, se abre el modal de deuda y se quita el foco del Imput
      setCadeteConDeuda(foundCadete);
      setActiveModal("deuda");
      if (inputRef.current && inputRef.current.blurInput) {
        inputRef.current.blurInput();
      }
    }
  };

  // Función para remover cadetes del listado habilitados y decrementar el contador si corresponde
  const removeHabilitadoLocal = (id) => {
    // Actualizar la lista de habilitados
    const updated = habilitados.filter((item) => item.id.toString() !== id.toString());
    setHabilitados(updated);
    localStorage.setItem("habilitados", JSON.stringify(updated));

    // Actualizar bdcadetes para decrementar el contador si existe
    const storedBdCadetes = localStorage.getItem("bdcadetes");
    if (storedBdCadetes) {
      let bdCadetesData = JSON.parse(storedBdCadetes);
      const index = bdCadetesData.findIndex((c) => c.id.toString() === id.toString());
      if (index !== -1 && bdCadetesData[index].contador) {
        bdCadetesData[index].contador = Number(bdCadetesData[index].contador) - 1;
        if (bdCadetesData[index].contador <= 0) {
          bdCadetesData[index].deuda = bdCadetesData[index].deudaPendiente;
          delete bdCadetesData[index].contador;
          delete bdCadetesData[index].deudaPendiente;
        }
        localStorage.setItem("bdcadetes", JSON.stringify(bdCadetesData));
        // Actualizamos el estado bdCadetes para sincronizar
        setBdCadetes(bdCadetesData);
      }
    }
  };

  // Efecto para remover automáticamente de la lista de habilitados a los cadetes cuyo contador sea 0 o menor
  useEffect(() => {
    const filteredHabilitados = habilitados.filter((cadete) => {
      // Si no tiene contador, se asume que es válido
      if (cadete.contador === undefined) return true;
      // Si tiene contador, se mantiene solo si es mayor a 0
      return Number(cadete.contador) > 0;
    });
    if (filteredHabilitados.length !== habilitados.length) {
      setHabilitados(filteredHabilitados);
      localStorage.setItem("habilitados", JSON.stringify(filteredHabilitados));
    }
  }, [habilitados]);

  // Callback para devolver el foco al input después de eliminar
  const focusOnInput = () => {
    inputRef.current && inputRef.current.focusInput();
  };

  if (loading) {
    return (
      <div className="spinner-container" style={{ textAlign: "center", marginTop: "2rem" }}>
        <h2>deploy dataBase</h2>
        <p>{deployMessage}</p>
        <div style={{
          margin: "auto",
          border: "8px solid #f3f3f3",
          borderTop: "8px solid #555",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          animation: "spin 1s linear infinite"
        }} />
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div className="gestionar-cadetes">
      <Imput onIdSubmit={handleIdSubmit} ref={inputRef} />
      <CadeteList
        data={habilitados}
        removeHabilitado={removeHabilitadoLocal}
        onFocusAfterDelete={focusOnInput}
      />

      {cadeteConDeuda && activeModal === "deuda" && (
        <ModalDeuda
          empleado={cadeteConDeuda}
          onClose={() => {
            setCadeteConDeuda(null);
            setActiveModal(null);
            inputRef.current && inputRef.current.focusInput();
          }}
          onOptionSelected={(option) => {
            if (option === "efectivo") setActiveModal("efectivo");
          }}
          onModalOpen={() => {
            inputRef.current && inputRef.current.blurInput();
          }}
        />
      )}

      {cadeteConDeuda && activeModal === "efectivo" && (
        <ModalEfectivo
          empleado={cadeteConDeuda}
          onClose={() => {
            setCadeteConDeuda(null);
            setActiveModal(null);
            inputRef.current && inputRef.current.focusInput();
          }}
          onConfirm={(importe) => {
            console.log("Confirmar pago:", importe);
            // Luego de confirmar el pago parcial, actualizamos bdCadetes y sincronizamos habilitados
            const storedBdCadetes = localStorage.getItem("bdcadetes");
            if (storedBdCadetes) {
              const updatedBdCadetes = JSON.parse(storedBdCadetes);
              setBdCadetes(updatedBdCadetes);
              const updatedHabilitados = habilitados.map((cadete) => {
                const updatedCadete = updatedBdCadetes.find(
                  (c) => c.id.toString() === cadete.id.toString()
                );
                return updatedCadete ? updatedCadete : cadete;
              });
              setHabilitados(updatedHabilitados);
              localStorage.setItem("habilitados", JSON.stringify(updatedHabilitados));
            }
            inputRef.current && inputRef.current.focusInput();
          }}
        />
      )}

      {showModalNuevoPago && (
        <ModalNuevoPago
          onCancel={() => setShowModalNuevoPago(false)}
          onPaymentRegistered={(payment) => {
            console.log("Pago registrado:", payment);
          }}
        />
      )}
    </div>
  );
};

export default GestionarCadetes;
*/
// src/Components/GestionarCadetes.jsx
import React, { useRef, useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Imput from "./Imput";
import CadeteList from "./CadeteList";
import ModalDeuda from "./ModalDeuda";
import ModalEfectivo from "./ModalEfectivo";
import ModalNuevoPago from "./ModalNuevoPago"; // Asegúrate de tener este componente

const GestionarCadetes = () => {
  const inputRef = useRef(null);
  const [bdCadetes, setBdCadetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deployMessage, setDeployMessage] = useState("");
  const [habilitados, setHabilitados] = useState(() => {
    const stored = localStorage.getItem("habilitados");
    return stored ? JSON.parse(stored) : [];
  });
  
  // Estado para cadete con deuda, para mostrar el modal
  const [cadeteConDeuda, setCadeteConDeuda] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  
  // Estado para mostrar el modal de nuevo pago
  const [showModalNuevoPago, setShowModalNuevoPago] = useState(false);

  // Obtener el usuario logueado y el operador (username)
  const loggedUser = localStorage.getItem("loggedUser")
    ? JSON.parse(localStorage.getItem("loggedUser"))
    : null;
  const operador = loggedUser ? loggedUser.username : "Desconocido";

  const fetchCadetes = async () => {
    try {
      const localData = localStorage.getItem("bdcadetes");
      if (localData) {
        const data = JSON.parse(localData);
        setBdCadetes(data);
        console.log("Cargando cadetes desde localStorage:", data);
        setDeployMessage("deploy existente");
      } else {
        // Si no existe "bdcadetes", se consulta Firestore y se crean "bdcadetes", "baseDia" y "pagos"
        const querySnapshot = await getDocs(collection(db, "cadetes"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBdCadetes(data);
        localStorage.setItem("bdcadetes", JSON.stringify(data));

        // Generar una fecha fija a partir del momento actual (fecha de creación)
        const today = new Date();
        const day = today.getDate().toString().padStart(2, "0");
        const month = (today.getMonth() + 1).toString().padStart(2, "0");
        const year = today.getFullYear();
        const fullDateStr = `${day}-${month}-${year}`; // Esta es la fecha fija de creación

        // Crear "baseDia" a partir de la información inicial de cadetes
        const baseDiaObj = {
          fecha: fullDateStr,
          base: data
            .map((cadete) => ({
              id: cadete.id,
              "nombre y apellido": cadete["nombre y apellido"],
              deuda: cadete.deuda,
              base: cadete.base || 0,
              total: Number(cadete.base || 0) + Number(cadete.deuda || 0),
              multa: cadete.multa || 0,
            }))
            .sort((a, b) => Number(a.id) - Number(b.id)),
        };
        localStorage.setItem("baseDia", JSON.stringify(baseDiaObj));

        // Inicializar "pagos" con la fecha fija, con un array vacío
        const pagosObj = { [fullDateStr]: [] };
        localStorage.setItem("pagos", JSON.stringify(pagosObj));

        console.log("La base de datos se trajo correctamente desde Firestore:", data);
        setDeployMessage("deploy confirmado");
      }

      // Si ya existe "baseDia" en localStorage, se utiliza sin modificarla
      const storedBaseDia = localStorage.getItem("baseDia");
      if (storedBaseDia) {
        setBaseDia(JSON.parse(storedBaseDia));
      }
    } catch (error) {
      console.error("Error fetching cadetes:", error);
    } finally {
      // Mostrar el spinner durante 3 segundos
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    }
  };

  useEffect(() => {
    fetchCadetes();
  }, []);

  // Devuelve el foco al Imput cada vez que se actualice el listado de cadetes habilitados
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focusInput();
    }
  }, [habilitados]);

  // Listener global para detectar la tecla "." y abrir el modal de nuevo pago
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === ".") {
        e.preventDefault();
        setShowModalNuevoPago(true);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  const handleIdSubmit = (id) => {
    const trimmedId = id.trim();
    console.log("ID ingresado:", trimmedId);
    const foundCadete = bdCadetes.find((c) => c.id.toString() === trimmedId);
    console.log("Cadete encontrado:", foundCadete);
    if (!foundCadete) {
      alert("Empleado no encontrado");
      inputRef.current && inputRef.current.focusInput();
      return;
    }
    if (foundCadete.deuda === 0 && foundCadete.multa === 0) {
      if (habilitados.some((c) => c.id.toString() === foundCadete.id.toString())) {
        alert("El empleado ya está validado");
      } else {
        const validatedCadete = {
          ...foundCadete,
          horario: new Date().toLocaleTimeString(),
        };
        const nuevosHabilitados = [...habilitados, validatedCadete];
        setHabilitados(nuevosHabilitados);
        localStorage.setItem("habilitados", JSON.stringify(nuevosHabilitados));
        console.log("Empleado validado:", validatedCadete);
      }
      inputRef.current && inputRef.current.focusInput();
    } else {
      // Si tiene deuda o multa, se abre el modal de deuda y se quita el foco del Imput
      setCadeteConDeuda(foundCadete);
      setActiveModal("deuda");
      if (inputRef.current && inputRef.current.blurInput) {
        inputRef.current.blurInput();
      }
    }
  };

  // Función para remover cadetes del listado habilitados y decrementar el contador si corresponde
  const removeHabilitadoLocal = (id) => {
    // Actualizar la lista de habilitados
    const updated = habilitados.filter((item) => item.id.toString() !== id.toString());
    setHabilitados(updated);
    localStorage.setItem("habilitados", JSON.stringify(updated));

    // Actualizar bdcadetes para decrementar el contador si existe
    const storedBdCadetes = localStorage.getItem("bdcadetes");
    if (storedBdCadetes) {
      let bdCadetesData = JSON.parse(storedBdCadetes);
      const index = bdCadetesData.findIndex((c) => c.id.toString() === id.toString());
      if (index !== -1 && bdCadetesData[index].contador) {
        bdCadetesData[index].contador = Number(bdCadetesData[index].contador) - 1;
        if (bdCadetesData[index].contador <= 0) {
          bdCadetesData[index].deuda = bdCadetesData[index].deudaPendiente;
          delete bdCadetesData[index].contador;
          delete bdCadetesData[index].deudaPendiente;
        }
        localStorage.setItem("bdcadetes", JSON.stringify(bdCadetesData));
        // Actualizamos el estado bdCadetes para sincronizar
        setBdCadetes(bdCadetesData);
      }
    }
  };

  // Efecto para remover automáticamente de la lista de habilitados a los cadetes cuyo contador sea 0 o menor
  useEffect(() => {
    const filteredHabilitados = habilitados.filter((cadete) => {
      // Si no tiene contador, se asume que es válido
      if (cadete.contador === undefined) return true;
      // Si tiene contador, se mantiene solo si es mayor a 0
      return Number(cadete.contador) > 0;
    });
    if (filteredHabilitados.length !== habilitados.length) {
      setHabilitados(filteredHabilitados);
      localStorage.setItem("habilitados", JSON.stringify(filteredHabilitados));
    }
  }, [habilitados]);

  // Callback para devolver el foco al input después de eliminar
  const focusOnInput = () => {
    inputRef.current && inputRef.current.focusInput();
  };

  if (loading) {
    return (
      <div className="spinner-container" style={{ textAlign: "center", marginTop: "2rem" }}>
        <h2>deploy dataBase</h2>
        <p>{deployMessage}</p>
        <div style={{
          margin: "auto",
          border: "8px solid #f3f3f3",
          borderTop: "8px solid #555",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          animation: "spin 1s linear infinite"
        }} />
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div className="gestionar-cadetes">
      <Imput onIdSubmit={handleIdSubmit} ref={inputRef} />
      <CadeteList
        data={habilitados}
        removeHabilitado={removeHabilitadoLocal}
        onFocusAfterDelete={focusOnInput}
      />

      {cadeteConDeuda && activeModal === "deuda" && (
        <ModalDeuda
          empleado={cadeteConDeuda}
          onClose={() => {
            setCadeteConDeuda(null);
            setActiveModal(null);
            inputRef.current && inputRef.current.focusInput();
          }}
          onOptionSelected={(option) => {
            if (option === "efectivo") setActiveModal("efectivo");
          }}
          onModalOpen={() => {
            inputRef.current && inputRef.current.blurInput();
          }}
        />
      )}

      {cadeteConDeuda && activeModal === "efectivo" && (
        <ModalEfectivo
          empleado={cadeteConDeuda}
          onClose={() => {
            setCadeteConDeuda(null);
            setActiveModal(null);
            inputRef.current && inputRef.current.focusInput();
          }}
          onConfirm={(importe) => {
            console.log("Confirmar pago:", importe);
            // Luego de confirmar el pago parcial, actualizamos bdCadetes y sincronizamos habilitados
            const storedBdCadetes = localStorage.getItem("bdcadetes");
            if (storedBdCadetes) {
              const updatedBdCadetes = JSON.parse(storedBdCadetes);
              setBdCadetes(updatedBdCadetes);
              const updatedHabilitados = habilitados.map((cadete) => {
                const updatedCadete = updatedBdCadetes.find(
                  (c) => c.id.toString() === cadete.id.toString()
                );
                return updatedCadete ? updatedCadete : cadete;
              });
              setHabilitados(updatedHabilitados);
              localStorage.setItem("habilitados", JSON.stringify(updatedHabilitados));
            }
            inputRef.current && inputRef.current.focusInput();
          }}
        />
      )}

      {showModalNuevoPago && (
        <ModalNuevoPago
          operador={operador}  // Se pasa el operador al modal para que registre el pago con el username
          onCancel={() => setShowModalNuevoPago(false)}
          onPaymentRegistered={(payment) => {
            console.log("Pago registrado:", payment);
          }}
        />
      )}
    </div>
  );
};

export default GestionarCadetes;
