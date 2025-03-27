/*
// src/Components/GestionarCadetes.jsx
import React, { useRef, useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Imput from "./Imput";
import CadeteList from "./CadeteList";
import ModalDeuda from "./ModalDeuda";
import ModalEfectivo from "./ModalEfectivo";

const GestionarCadetes = () => {
  const inputRef = useRef(null);
  const [bdCadetes, setBdCadetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [habilitados, setHabilitados] = useState(() => {
    const stored = localStorage.getItem("habilitados");
    return stored ? JSON.parse(stored) : [];
  });
  
  // Estado para cadete con deuda, para mostrar el modal
  const [cadeteConDeuda, setCadeteConDeuda] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  const fetchCadetes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "cadetes"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBdCadetes(data);
      localStorage.setItem("bdcadetes", JSON.stringify(data));
      console.log("La base de datos se trajo correctamente:", data);
    } catch (error) {
      console.error("Error fetching cadetes:", error);
    } finally {
      setLoading(false);
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

  // Función para remover cadetes del listado habilitado
  const removeHabilitadoLocal = (id) => {
    const updated = habilitados.filter((item) => item.id.toString() !== id.toString());
    setHabilitados(updated);
    localStorage.setItem("habilitados", JSON.stringify(updated));
  };

  // Callback para devolver el foco al input después de eliminar
  const focusOnInput = () => {
    inputRef.current && inputRef.current.focusInput();
  };

  if (loading) return <p>Cargando cadetes...</p>;

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
            // Aquí podrías implementar la confirmación del pago
            console.log("Confirmar pago:", importe);
            inputRef.current && inputRef.current.focusInput();
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
      const querySnapshot = await getDocs(collection(db, "cadetes"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBdCadetes(data);
      localStorage.setItem("bdcadetes", JSON.stringify(data));
      console.log("La base de datos se trajo correctamente:", data);
    } catch (error) {
      console.error("Error fetching cadetes:", error);
    } finally {
      setLoading(false);
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

  // Función para remover cadetes del listado habilitado
  const removeHabilitadoLocal = (id) => {
    const updated = habilitados.filter((item) => item.id.toString() !== id.toString());
    setHabilitados(updated);
    localStorage.setItem("habilitados", JSON.stringify(updated));
  };

  // Callback para devolver el foco al input después de eliminar
  const focusOnInput = () => {
    inputRef.current && inputRef.current.focusInput();
  };

  if (loading) return <p>Cargando cadetes...</p>;

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
