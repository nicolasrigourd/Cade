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
import ModalDeudaAlta from "./ModalDeudaAlta";
import ModalObservaciones from "./ModalObservaciones"; // ⬅️ NUEVO

const GestionarCadetes = () => {
  const inputRef = useRef(null);

  const [bdCadetes, setBdCadetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deployMessage, setDeployMessage] = useState("");
  const [habilitados, setHabilitados] = useState(() => {
    const stored = localStorage.getItem("habilitados");
    return stored ? JSON.parse(stored) : [];
  });

  const [cadeteConDeuda, setCadeteConDeuda] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [showModalNuevoPago, setShowModalNuevoPago] = useState(false);
  const [cadeteObservado, setCadeteObservado] = useState(null); // ⬅️ NUEVO

  const loggedUser = localStorage.getItem("loggedUser")
    ? JSON.parse(localStorage.getItem("loggedUser"))
    : null;
  const operador = loggedUser ? loggedUser.username : "Desconocido";

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

  useEffect(() => {
    inputRef.current?.focusInput();
  }, [habilitados]);

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

  const handleIdSubmit = id => {
    const trimmed = id.trim();
    const found = bdCadetes.find(c => c.id.toString() === trimmed);
    if (!found) {
      alert("Empleado no encontrado");
      inputRef.current?.focusInput();
      return;
    }

    // ⬇️ NUEVO: si está bloqueado, mostrar Observaciones y cortar el flujo
    const estaBloqueado = Boolean(found.bloqueado);
    if (estaBloqueado) {
      setCadeteObservado(found);
      setActiveModal("observaciones");
      inputRef.current?.blurInput?.();
      return;
    }

    // flujo original con casteo seguro
    const deudaNum = Number(found.deuda || 0);
    const multaNum = Number(found.multa || 0);

    if (deudaNum === 0 && multaNum === 0) {
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
      const deudaTotal = deudaNum + multaNum;
      if (deudaTotal > 7000) {
        const montoPermitido = (deudaTotal + Number(found.base || 0)) / 5;
        const conFlag = {
          ...found,
          esDeudaAlta: true,
          montoPermitido: Math.round(montoPermitido),
        };
        setCadeteConDeuda(conFlag);
        setActiveModal("deudaAlta");
      } else {
        setCadeteConDeuda(found);
        setActiveModal("deuda");
      }
      inputRef.current?.blurInput?.();
    }
  };

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

      
      {cadeteObservado && activeModal === "observaciones" && (
        <ModalObservaciones
          empleado={cadeteObservado}
          onClose={() => {
            setCadeteObservado(null);
            setActiveModal(null);
            inputRef.current?.focusInput();
          }}
        />
      )}

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

      {cadeteConDeuda && activeModal === "deudaAlta" && (
        <ModalDeudaAlta
          empleado={cadeteConDeuda}
          onClose={() => {
            setCadeteConDeuda(null);
            setActiveModal(null);
            inputRef.current?.focusInput();
          }}
          onMontoValido={(importe) => {
            handlePartialPaymentConfirm(importe);
          }}
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
import ModalDeudaAlta from "./ModalDeudaAlta"; // ⬅️ queda por compatibilidad si volvés al flujo anterior
import ModalObservaciones from "./ModalObservaciones"; // ⬅️ NUEVO

const GestionarCadetes = () => {
  const inputRef = useRef(null);

  const [bdCadetes, setBdCadetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deployMessage, setDeployMessage] = useState("");
  const [habilitados, setHabilitados] = useState(() => {
    const stored = localStorage.getItem("habilitados");
    return stored ? JSON.parse(stored) : [];
  });

  const [cadeteConDeuda, setCadeteConDeuda] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [showModalNuevoPago, setShowModalNuevoPago] = useState(false);
  const [cadeteObservado, setCadeteObservado] = useState(null); // ⬅️ NUEVO

  const loggedUser = localStorage.getItem("loggedUser")
    ? JSON.parse(localStorage.getItem("loggedUser"))
    : null;
  const operador = loggedUser ? loggedUser.username : "Desconocido";

  // Inicializa stats del día si no existe
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

  useEffect(() => {
    inputRef.current?.focusInput();
  }, [habilitados]);

  // Atajo "." para abrir nuevo pago manual
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

  const handlePartialPaymentConfirm = importe => {
    // No modifica deudas aquí; asume que el modal ya actualizó localStorage
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

  /**
   * FLUJO ACTUAL:
   * - Bloqueado: ModalObservaciones.
   * - deuda+multa === 0: habilita directo.
   * - deuda+multa > 0: SIEMPRE abre ModalDeuda (sin distinguir > 7000).
   *   👉 La base se muestra en el modal, pero NO se suma al total a pagar.
   *
   * (La lógica previa de > $7000 queda comentada más abajo por si querés reactivarla.)
   */
  const handleIdSubmit = id => {
    const trimmed = id.trim();
    const found = bdCadetes.find(c => c.id.toString() === trimmed);
    if (!found) {
      alert("Empleado no encontrado");
      inputRef.current?.focusInput();
      return;
    }

    // Bloqueado → Observaciones
    const estaBloqueado = Boolean(found.bloqueado);
    if (estaBloqueado) {
      setCadeteObservado(found);
      setActiveModal("observaciones");
      inputRef.current?.blurInput?.();
      return;
    }

    const deudaNum = Number(found.deuda || 0);
    const multaNum = Number(found.multa || 0);
    const deudaTotal = deudaNum + multaNum;

    // Sin deuda → habilita directo
    if (deudaTotal === 0) {
      if (habilitados.some(h => h.id.toString() === found.id.toString())) {
        alert("El empleado ya está validado");
      } else {
        const validated = { ...found, horario: new Date().toLocaleTimeString() };
        const nuevos = [...habilitados, validated];
        setHabilitados(nuevos);
        localStorage.setItem("habilitados", JSON.stringify(nuevos));
      }
      inputRef.current?.focusInput();
      return;
    }

    // CON DEUDA → abre ModalDeuda (pasamos el empleado tal cual)
    const payload = {
      ...found,
      requeridoPago: deudaTotal // informativo opcional
    };

    setCadeteConDeuda(payload);
    setActiveModal("deuda");
    inputRef.current?.blurInput?.();

    /* -----------------------------------------
     * LÓGICA ANTERIOR (> $7000) — hoy desactivada:
     *
     * if (deudaTotal > 7000) {
     *   const montoPermitido = (deudaTotal + Number(found.base || 0)) / 5;
     *   const conFlag = {
     *     ...found,
     *     esDeudaAlta: true,
     *     montoPermitido: Math.round(montoPermitido),
     *   };
     *   setCadeteConDeuda(conFlag);
     *   setActiveModal("deudaAlta");
     * } else {
     *   setCadeteConDeuda(found);
     *   setActiveModal("deuda");
     * }
     * ----------------------------------------- */
  };

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

  // Limpia habilitados con contador 0 (si existieran)
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

      {/* Modal observaciones cuando está bloqueado */}
      {cadeteObservado && activeModal === "observaciones" && (
        <ModalObservaciones
          empleado={cadeteObservado}
          onClose={() => {
            setCadeteObservado(null);
            setActiveModal(null);
            inputRef.current?.focusInput();
          }}
        />
      )}

      {/* NUEVO FLUJO: siempre ModalDeuda (Total = Deuda + Multa; Base no se suma) */}
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

      {/* Confirmación de pago en efectivo */}
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

      {/* Flujo anterior (deuda alta) — sin uso ahora */}
      {cadeteConDeuda && activeModal === "deudaAlta" && (
        <ModalDeudaAlta
          empleado={cadeteConDeuda}
          onClose={() => {
            setCadeteConDeuda(null);
            setActiveModal(null);
            inputRef.current?.focusInput();
          }}
          onMontoValido={(importe) => {
            handlePartialPaymentConfirm(importe);
          }}
        />
      )}

      {/* Atajo: nuevo pago manual con "." */}
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
