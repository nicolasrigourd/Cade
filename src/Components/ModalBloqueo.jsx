import React, { useEffect, useMemo, useRef, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const ModalBloqueo = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // operador e isAdmin desde el storage
  const loggedUser = localStorage.getItem("loggedUser")
    ? JSON.parse(localStorage.getItem("loggedUser"))
    : null;
  const operador = loggedUser?.username || "Desconocido";
  const isAdmin = loggedUser?.role === "admin";

  const [idInput, setIdInput] = useState("");
  const [found, setFound] = useState(null); // cadete encontrado (objeto de bdcadetes) o null
  const [statusText, setStatusText] = useState(""); // texto de estado
  const [obsText, setObsText] = useState(""); // observaciones que se anexan
  const [isBusy, setIsBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const idRef = useRef(null);
  const primaryBtnRef = useRef(null);

  // util fecha-hora corta
  const nowStamp = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const isBlocked = useMemo(() => Boolean(found?.bloqueado), [found]);

  // buscar en local por ID
  const buscar = () => {
    setErrorMsg("");
    const trimmed = idInput.trim();
    if (!trimmed) {
      setFound(null);
      setStatusText("Ingresá un ID y presioná Enter");
      return;
    }
    const arr = JSON.parse(localStorage.getItem("bdcadetes") || "[]");
    const cad = arr.find((c) => String(c.id) === String(trimmed));
    if (!cad) {
      setFound(null);
      setStatusText("No existe un cadete con ese ID en la base local");
      return;
    }
    setFound(cad);
    setStatusText(cad.bloqueado ? "BLOQUEADO" : "NO BLOQUEADO");
    setObsText(""); // se limpia al cambiar de cadete
    // enfocar botón primario luego de un tick
    setTimeout(() => primaryBtnRef.current?.focus(), 0);
  };

  // Enter en el input de ID dispara búsqueda
  const onIdKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      buscar();
    }
  };

  // Esc cierra el modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    // foco inicial
    idRef.current?.focus();
    setStatusText("Ingresá un ID y presioná Enter");
  }, []);

  const mergeObservaciones = (prev, accion, extra) => {
    const linea = `[${nowStamp()}] ${accion} por ${operador}${extra ? `: ${extra}` : ""}`;
    return prev && String(prev).trim().length
      ? `${prev}\n${linea}`
      : linea;
  };

  // toggle bloqueado optimista con rollback
  const toggleBloqueo = async (nextState) => {
    if (!found) return;
    if (nextState === true && !obsText.trim()) {
      setErrorMsg("Para BLOQUEAR, el campo Observaciones es obligatorio.");
      return;
    }

    setErrorMsg("");
    setIsBusy(true);

    const arr = JSON.parse(localStorage.getItem("bdcadetes") || "[]");
    const idx = arr.findIndex((c) => String(c.id) === String(found.id));
    if (idx === -1) {
      setIsBusy(false);
      setErrorMsg("El cadete no existe en la base local.");
      return;
    }

    // estado anterior (para rollback)
    const prevBloqueado = Boolean(arr[idx].bloqueado);
    const prevObs = arr[idx].observaciones || "";

    // mutación local optimista (solo ese registro)
    const accion = nextState ? "BLOQUEADO" : "DESBLOQUEADO";
    const mergedObs = mergeObservaciones(prevObs, accion, obsText.trim());
    arr[idx].bloqueado = nextState;
    arr[idx].observaciones = mergedObs;
    localStorage.setItem("bdcadetes", JSON.stringify(arr));
    setFound({ ...arr[idx] }); // refresca UI

    try {
      // nube: Firestore
      const ref = doc(db, "cadetes", String(found.id));
      await updateDoc(ref, {
        bloqueado: nextState,
        observaciones: mergedObs,
      });

      // evento opcional para que otras pantallas refresquen si escuchan
      window.dispatchEvent(new Event("bdcadetes-updated"));

      setIsBusy(false);
      onClose?.(); // cerramos al completar
    } catch (err) {
      console.error("Error actualizando Firestore:", err);
      // rollback local
      arr[idx].bloqueado = prevBloqueado;
      arr[idx].observaciones = prevObs;
      localStorage.setItem("bdcadetes", JSON.stringify(arr));
      setFound({ ...arr[idx] });
      setIsBusy(false);
      setErrorMsg("No se pudo sincronizar con la nube. Se revirtió el cambio local.");
    }
  };

  return (
    <div className="modalbloqueo-overlay">
      <div
        className="modalbloqueo"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalbloqueo-title"
      >
        <div className="modalbloqueo-header">
          <p id="modalbloqueo-title">Bloquear / Desbloquear (Admin)</p>
        </div>

        {!isAdmin && (
          <div className="modalbloqueo-body">
            <p style={{ color: "#ffb3b3" }}>
              No tenés permisos para usar esta herramienta.
            </p>
            <div className="modalbloqueo-actions">
              <button onClick={onClose}>Cerrar</button>
            </div>
          </div>
        )}

        {isAdmin && (
          <>
            <div className="modalbloqueo-body">
              <div className="modalbloqueo-row">
                <label htmlFor="bloqueo-id">ID del cadete</label>
                <input
                  id="bloqueo-id"
                  ref={idRef}
                  type="text"
                  value={idInput}
                  onChange={(e) => setIdInput(e.target.value)}
                  onKeyDown={onIdKeyDown}
                  placeholder="Ej: 123"
                />
                <small className={`modalbloqueo-status ${isBlocked ? "blocked" : "unblocked"}`}>
                  {statusText}
                </small>
              </div>

              {found && (
                <>
                  <div className="modalbloqueo-info">
                    <div>
                      <strong>Nombre:</strong>{" "}
                      {found["nombre y apellido"] || "—"}
                    </div>
                    <div>
                      <strong>ID:</strong> {found.id}
                    </div>
                    <div>
                      <strong>Estado:</strong>{" "}
                      {found.bloqueado ? "BLOQUEADO" : "NO BLOQUEADO"}
                    </div>
                  </div>

                  <div className="modalbloqueo-obssnippet">
                    <label>Observaciones actuales</label>
                    <pre>{String(found.observaciones || "—")}</pre>
                  </div>

                  <div className="modalbloqueo-row">
                    <label htmlFor="bloqueo-obs">
                      {isBlocked
                        ? "Agregar nota (opcional al desbloquear)"
                        : "Motivo (obligatorio al bloquear)"}
                    </label>
                    <textarea
                      id="bloqueo-obs"
                      value={obsText}
                      onChange={(e) => setObsText(e.target.value)}
                      placeholder={
                        isBlocked
                          ? "Ej: Verificado y regularizado."
                          : "Ej: Incumplimiento de normas."
                      }
                      rows={3}
                    />
                    {!!errorMsg && <small className="modalbloqueo-error">{errorMsg}</small>}
                  </div>
                </>
              )}
            </div>

            <div className="modalbloqueo-actions">
              {found && (
                <button
                  ref={primaryBtnRef}
                  className={isBlocked ? "primary-unblock" : "primary-block"}
                  disabled={isBusy}
                  onClick={() => toggleBloqueo(!isBlocked)}
                >
                  {isBusy
                    ? "Actualizando…"
                    : isBlocked
                    ? "Desbloquear"
                    : "Bloquear"}
                </button>
              )}
              <button disabled={isBusy} onClick={onClose}>Cancelar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModalBloqueo;
