
// src/Components/Imput.jsx
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";

const Imput = forwardRef(({ onIdSubmit }, ref) => {
  const [employeeId, setEmployeeId] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const inputRef = useRef(null);

  // Exponer funciones para devolver el foco, quitar el foco y limpiar el input
  useImperativeHandle(ref, () => ({
    focusInput: () => {
      if (inputRef.current) inputRef.current.focus();
    },
    blurInput: () => {
      if (inputRef.current) inputRef.current.blur();
    },
    clearInput: () => {
      setEmployeeId("");
    }
  }));

  // Enfoca el input al montar el componente
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Actualiza la hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    setEmployeeId(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (employeeId.trim() === "") return;
    if (onIdSubmit) onIdSubmit(employeeId);
    setEmployeeId("");
    if (inputRef.current) inputRef.current.focus();
  };

  // Formateo de la fecha y hora, ejemplo: "lunes 31/03/25 14:22:35hs"
  const options = {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  };
  const formattedTime = currentTime.toLocaleString("es-ES", options) + "hs";

  return (
    <div className="imput-container">
      <div className="time-display">{formattedTime}</div>
      <form onSubmit={handleSubmit} className="input-field" autoComplete="off">
        <input
          type="text"
          id="employeeId"
          name="employeeId"
          ref={inputRef}
          value={employeeId}
          onChange={handleChange}
          placeholder="Ingresa el ID"
          autoComplete="off"
        />
      </form>
    </div>
  );
});

export default Imput;
