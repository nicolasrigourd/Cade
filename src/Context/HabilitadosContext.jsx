// src/Context/HabilitadosContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const HabilitadosContext = createContext();

export const HabilitadosProvider = ({ children }) => {
  const [habilitados, setHabilitados] = useState(() => {
    const stored = localStorage.getItem("habilitados");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("habilitados", JSON.stringify(habilitados));
  }, [habilitados]);

  const addHabilitado = (cadete) => {
    setHabilitados((prev) => {
      if (prev.some(c => c.id.toString() === cadete.id.toString())) return prev;
      return [...prev, cadete];
    });
  };

  const removeHabilitado = (cadeteId) => {
    setHabilitados((prev) =>
      prev.filter(c => c.id.toString() !== cadeteId.toString())
    );
  };

  return (
    <HabilitadosContext.Provider value={{ habilitados, addHabilitado, removeHabilitado }}>
      {children}
    </HabilitadosContext.Provider>
  );
};
