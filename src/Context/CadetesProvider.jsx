// src/Context/CadetesProvider.jsx
import React, { createContext, useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Creamos el contexto
export const CadetesContext = createContext();

// El provider que provee los datos a sus hijos
export const CadetesProvider = ({ children }) => {
  const [cadetes, setCadetes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para obtener datos de Firebase
  const fetchCadetes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "cadetes"));
      const data = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      // Guardamos los datos en el estado y en localStorage
      setCadetes(data);
      localStorage.setItem("bdcadetes", JSON.stringify(data));
      console.log("Datos de cadetes descargados:", data);
    } catch (error) {
      console.error("Error fetching cadetes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCadetes();
  }, []);

  return (
    <CadetesContext.Provider value={{ cadetes, loading }}>
      {children}
    </CadetesContext.Provider>
  );
};
