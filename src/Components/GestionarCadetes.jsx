/*
// src/Components/GestionarCadetes.jsx
import React, { useRef, useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Imput from "./Imput";
import CadeteList from "./CadeteList";
import ModalDeuda from "./ModalDeuda";
import ModalEfectivo from "./ModalEfectivo";
import ModalNuevoPago from "./ModalNuevoPago";

const GestionarCadetes = () => {
  const inputRef = useRef(null);

  const [bdCadetes, setBdCadetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deployMessage, setDeployMessage] = useState("");
  const [habilitados, setHabilitados] = useState(() => {
    const stored = localStorage.getItem("habilitados");
    return stored ? JSON.parse(stored) : [];
  });

  // Modal deuda / efectivo
  const [cadeteConDeuda, setCadeteConDeuda] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  // Modal para nuevo pago
  const [showModalNuevoPago, setShowModalNuevoPago] = useState(false);

  // Usuario
  const loggedUser = localStorage.getItem("loggedUser")
    ? JSON.parse(localStorage.getItem("loggedUser"))
    : null;
  const operador = loggedUser ? loggedUser.username : "Desconocido";

  // Carga inicial de cadetes
  const fetchCadetes = async () => {
    try {
      const localData = localStorage.getItem("bdcadetes");
      if (localData) {
        const data = JSON.parse(localData);
        setBdCadetes(data);
        setDeployMessage("deploy existente");
      } else {
        const snap = await getDocs(collection(db, "cadetes"));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setBdCadetes(data);
        localStorage.setItem("bdcadetes", JSON.stringify(data));

        const today = new Date();
        const d = String(today.getDate()).padStart(2, "0");
        const m = String(today.getMonth() + 1).padStart(2, "0");
        const y = today.getFullYear();
        const fullDateStr = `${d}-${m}-${y}`;

        const baseDiaObj = {
          fecha: fullDateStr,
          base: data.map(c => ({
            id: c.id,
            "nombre y apellido": c["nombre y apellido"],
            deuda: c.deuda,
            base: c.base || 0,
            total: Number(c.base || 0) + Number(c.deuda || 0),
            multa: c.multa || 0,
          })).sort((a, b) => Number(a.id) - Number(b.id))
        };
        localStorage.setItem("baseDia", JSON.stringify(baseDiaObj));
        localStorage.setItem("pagos", JSON.stringify({ [fullDateStr]: [] }));
        setDeployMessage("deploy confirmado");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 3000);
    }
  };

  useEffect(() => {
    fetchCadetes();
  }, []);

  // refocus al input cuando cambian habilitados
  useEffect(() => {
    inputRef.current?.focusInput();
  }, [habilitados]);

  // tecla "." abre modal de nuevo pago
  useEffect(() => {
    const onKey = e => {
      if (e.key === ".") {
        e.preventDefault();
        setShowModalNuevoPago(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Handler cuando se confirma un pago desde ModalNuevoPago
  const handleNewPayment = payment => {
    setShowModalNuevoPago(false);
    // refrescar bdCadetes
    const updatedBd = JSON.parse(localStorage.getItem("bdcadetes") || "[]");
    setBdCadetes(updatedBd);
    // actualizar habilitados con la versión actualizada
    const updatedHab = habilitados.map(h =>
      updatedBd.find(b => b.id.toString() === h.id.toString()) || h
    );
    setHabilitados(updatedHab);
    inputRef.current && inputRef.current.focusInput();
  };

  // Handler de confirmación desde ModalEfectivoConfirm
  const handlePartialPaymentConfirm = importe => {
    // tras actualizar localStorage en ModalEfectivoConfirm, refrescamos estados
    const updatedBd = JSON.parse(localStorage.getItem("bdcadetes") || "[]");
    setBdCadetes(updatedBd);
    const updatedHab = habilitados.map(h =>
      updatedBd.find(b => b.id.toString() === h.id.toString()) || h
    );
    setHabilitados(updatedHab);
    // cerrar modal deuda/efectivo
    setCadeteConDeuda(null);
    setActiveModal(null);
    inputRef.current && inputRef.current.focusInput();
  };

  // Envío de ID en el input principal
  const handleIdSubmit = id => {
    const trimmed = id.trim();
    const found = bdCadetes.find(c => c.id.toString() === trimmed);
    if (!found) {
      alert("Empleado no encontrado");
      inputRef.current?.focusInput();
      return;
    }
    if (found.deuda === 0 && found.multa === 0) {
      if (habilitados.some(h => h.id.toString() === found.id.toString())) {
        alert("El empleado ya está validado");
      } else {
        const validated = { ...found, horario: new Date().toLocaleTimeString() };
        const nuevos = [...habilitados, validated];
        setHabilitados(nuevos);
        localStorage.setItem("habilitados", JSON.stringify(nuevos));
      }
      inputRef.current?.focusInput();
    } else {
      setCadeteConDeuda(found);
      setActiveModal("deuda");
      inputRef.current?.blurInput?.();
    }
  };

  // Remover habilitado y decrementar contador
  const removeHabilitadoLocal = id => {
    const filtered = habilitados.filter(h => h.id.toString() !== id.toString());
    setHabilitados(filtered);
    localStorage.setItem("habilitados", JSON.stringify(filtered));

    const storedBd = JSON.parse(localStorage.getItem("bdcadetes") || "[]");
    const idx = storedBd.findIndex(c => c.id.toString() === id.toString());
    if (idx !== -1 && storedBd[idx].contador) {
      storedBd[idx].contador--;
      if (storedBd[idx].contador <= 0) {
        storedBd[idx].deuda = storedBd[idx].deudaPendiente;
        delete storedBd[idx].contador;
        delete storedBd[idx].deudaPendiente;
      }
      localStorage.setItem("bdcadetes", JSON.stringify(storedBd));
      setBdCadetes(storedBd);
    }
  };

  // Filtrar habilitados con contador > 0
  useEffect(() => {
    const filtered = habilitados.filter(h =>
      h.contador === undefined ? true : Number(h.contador) > 0
    );
    if (filtered.length !== habilitados.length) {
      setHabilitados(filtered);
      localStorage.setItem("habilitados", JSON.stringify(filtered));
    }
  }, [habilitados]);

  const focusOnInput = () => {
    inputRef.current?.focusInput();
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
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
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
            inputRef.current?.focusInput();
          }}
          onOptionSelected={opt => {
            if (opt === "efectivo") setActiveModal("efectivo");
          }}
          onModalOpen={() => inputRef.current?.blurInput()}
        />
      )}

      {cadeteConDeuda && activeModal === "efectivo" && (
        <ModalEfectivo
          empleado={cadeteConDeuda}
          onClose={() => {
            setCadeteConDeuda(null);
            setActiveModal(null);
            inputRef.current?.focusInput();
          }}
          onConfirm={handlePartialPaymentConfirm}
        />
      )}

      {showModalNuevoPago && (
        <ModalNuevoPago
          operador={operador}
          onCancel={() => setShowModalNuevoPago(false)}
          onPaymentRegistered={handleNewPayment}
          showDetails={false}
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
import ModalNuevoPago from "./ModalNuevoPago";

const GestionarCadetes = () => {
  const inputRef = useRef(null);

  const [bdCadetes, setBdCadetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deployMessage, setDeployMessage] = useState("");
  const [habilitados, setHabilitados] = useState(() => {
    const stored = localStorage.getItem("habilitados");
    return stored ? JSON.parse(stored) : [];
  });

  // Modal deuda / efectivo
  const [cadeteConDeuda, setCadeteConDeuda] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  // Modal para nuevo pago
  const [showModalNuevoPago, setShowModalNuevoPago] = useState(false);

  // Usuario
  const loggedUser = localStorage.getItem("loggedUser")
    ? JSON.parse(localStorage.getItem("loggedUser"))
    : null;
  const operador = loggedUser ? loggedUser.username : "Desconocido";

  // Inicializar estadísticas diarias en localStorage
  useEffect(() => {
    const raw = localStorage.getItem("cadeteStats");
    const stats = raw ? JSON.parse(raw) : {};
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${d}`;
    if (!stats[key]) {
      stats[key] = {};
      localStorage.setItem("cadeteStats", JSON.stringify(stats));
    }
  }, []);

  // Carga inicial de cadetes y setup de baseDia y pagos
  const fetchCadetes = async () => {
    try {
      const localData = localStorage.getItem("bdcadetes");
      if (localData) {
        const data = JSON.parse(localData);
        setBdCadetes(data);
        setDeployMessage("deploy existente");
      } else {
        const snap = await getDocs(collection(db, "cadetes"));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setBdCadetes(data);
        localStorage.setItem("bdcadetes", JSON.stringify(data));

        const today = new Date();
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const yyyy = today.getFullYear();
        const fullDateStr = `${dd}-${mm}-${yyyy}`;

        const baseDiaObj = {
          fecha: fullDateStr,
          base: data
            .map(c => ({
              id: c.id,
              "nombre y apellido": c["nombre y apellido"],
              deuda: c.deuda,
              base: c.base || 0,
              total: Number(c.base || 0) + Number(c.deuda || 0),
              multa: c.multa || 0,
            }))
            .sort((a, b) => Number(a.id) - Number(b.id)),
        };
        localStorage.setItem("baseDia", JSON.stringify(baseDiaObj));
        localStorage.setItem("pagos", JSON.stringify({ [fullDateStr]: [] }));
        setDeployMessage("deploy confirmado");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 3000);
    }
  };

  useEffect(() => {
    fetchCadetes();
  }, []);

  // Refocus al input cuando cambian habilitados
  useEffect(() => {
    inputRef.current?.focusInput();
  }, [habilitados]);

  // Tecla "." abre modal de nuevo pago
  useEffect(() => {
    const onKey = e => {
      if (e.key === ".") {
        e.preventDefault();
        setShowModalNuevoPago(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Handler tras confirmar pago en ModalNuevoPago
  const handleNewPayment = payment => {
    setShowModalNuevoPago(false);
    const updatedBd = JSON.parse(localStorage.getItem("bdcadetes") || "[]");
    setBdCadetes(updatedBd);
    const updatedHab = habilitados.map(h =>
      updatedBd.find(b => b.id.toString() === h.id.toString()) || h
    );
    setHabilitados(updatedHab);
    inputRef.current?.focusInput();
  };

  // Handler tras pago parcial en ModalEfectivoConfirm
  const handlePartialPaymentConfirm = importe => {
    const updatedBd = JSON.parse(localStorage.getItem("bdcadetes") || "[]");
    setBdCadetes(updatedBd);
    const updatedHab = habilitados.map(h =>
      updatedBd.find(b => b.id.toString() === h.id.toString()) || h
    );
    setHabilitados(updatedHab);
    setCadeteConDeuda(null);
    setActiveModal(null);
    inputRef.current?.focusInput();
  };

  // Envío de ID en el input principal
  const handleIdSubmit = id => {
    const trimmed = id.trim();
    const found = bdCadetes.find(c => c.id.toString() === trimmed);
    if (!found) {
      alert("Empleado no encontrado");
      inputRef.current?.focusInput();
      return;
    }
    if (found.deuda === 0 && found.multa === 0) {
      if (habilitados.some(h => h.id.toString() === found.id.toString())) {
        alert("El empleado ya está validado");
      } else {
        const validated = { ...found, horario: new Date().toLocaleTimeString() };
        const nuevos = [...habilitados, validated];
        setHabilitados(nuevos);
        localStorage.setItem("habilitados", JSON.stringify(nuevos));
      }
      inputRef.current?.focusInput();
    } else {
      setCadeteConDeuda(found);
      setActiveModal("deuda");
      inputRef.current?.blurInput?.();
    }
  };

  // Remover habilitado y decrementar contador
  const removeHabilitadoLocal = id => {
    const filtered = habilitados.filter(h => h.id.toString() !== id.toString());
    setHabilitados(filtered);
    localStorage.setItem("habilitados", JSON.stringify(filtered));

    const storedBd = JSON.parse(localStorage.getItem("bdcadetes") || "[]");
    const idx = storedBd.findIndex(c => c.id.toString() === id.toString());
    if (idx !== -1 && storedBd[idx].contador) {
      storedBd[idx].contador--;
      if (storedBd[idx].contador <= 0) {
        storedBd[idx].deuda = storedBd[idx].deudaPendiente;
        delete storedBd[idx].contador;
        delete storedBd[idx].deudaPendiente;
      }
      localStorage.setItem("bdcadetes", JSON.stringify(storedBd));
      setBdCadetes(storedBd);
    }
  };

  // Filtrar habilitados con contador > 0
  useEffect(() => {
    const filtered = habilitados.filter(h =>
      h.contador === undefined ? true : Number(h.contador) > 0
    );
    if (filtered.length !== habilitados.length) {
      setHabilitados(filtered);
      localStorage.setItem("habilitados", JSON.stringify(filtered));
    }
  }, [habilitados]);

  const focusOnInput = () => {
    inputRef.current?.focusInput();
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
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
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
            inputRef.current?.focusInput();
          }}
          onOptionSelected={opt => {
            if (opt === "efectivo") setActiveModal("efectivo");
          }}
          onModalOpen={() => inputRef.current?.blurInput()}
        />
      )}

      {cadeteConDeuda && activeModal === "efectivo" && (
        <ModalEfectivo
          empleado={cadeteConDeuda}
          onClose={() => {
            setCadeteConDeuda(null);
            setActiveModal(null);
            inputRef.current?.focusInput();
          }}
          onConfirm={handlePartialPaymentConfirm}
        />
      )}

      {showModalNuevoPago && (
        <ModalNuevoPago
          operador={operador}
          onCancel={() => setShowModalNuevoPago(false)}
          onPaymentRegistered={handleNewPayment}
          showDetails={false}
        />
      )}
    </div>
  );
};

export default GestionarCadetes;
