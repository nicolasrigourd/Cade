/*
// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./Components/Navbar";
import GestionarCadetes from "./Components/GestionarCadetes";
import ListadoCadetes from "./Components/ListadoCadetes";
import Footer from "./Components/Footer";
import { HabilitadosProvider } from "./Context/HabilitadosContext";
import Base from "./Components/Base";
import Caja from "./Components/Caja";
import LoginModal from "./Components/LoginModal";
import Recordatorio from "./Components/Recordatorio";
import { AlarmProvider } from "./Context/AlarmContext";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  // Verifica si en localStorage existe la clave "users"
  useEffect(() => {
    if (!localStorage.getItem("users")) {
      const initialUsers = [
        { id: 1, username: "operador", password: "operador123" },
        { id: 2, username: "admin", password: "admin456" }
      ];
      localStorage.setItem("users", JSON.stringify(initialUsers));
    }
    // También puedes verificar si hay un usuario logueado previamente:
    const storedUser = localStorage.getItem("loggedUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (loggedUser) => {
    setUser(loggedUser);
    localStorage.setItem("loggedUser", JSON.stringify(loggedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("loggedUser");
  };

  return (
    <Router>
      <AlarmProvider>
        <HabilitadosProvider>
          <div className="app-container">
            <NavBar user={user} onLogout={handleLogout} />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<GestionarCadetes />} />
                <Route path="/listado" element={<ListadoCadetes />} />
                <Route path="/Base" element={<Base />} />
                <Route path="/Caja" element={<Caja />} />
                <Route path="/Recordatorio" element={<Recordatorio />} />
              </Routes>
            </main>
            <Footer />
            {!user && <LoginModal onLogin={handleLogin} />}
          </div>
        </HabilitadosProvider>
      </AlarmProvider>
    </Router>
  );
}

export default App;
*/
// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./Components/Navbar";
import GestionarCadetes from "./Components/GestionarCadetes";
import ListadoCadetes from "./Components/ListadoCadetes";
import Base from "./Components/Base";
import Caja from "./Components/Caja";
import Recordatorio from "./Components/Recordatorio";
import Estadisticas from "./Components/Estadisticas"; // ← nuevo
import Footer from "./Components/Footer";
import LoginModal from "./Components/LoginModal";
import { HabilitadosProvider } from "./Context/HabilitadosContext";
import { AlarmProvider } from "./Context/AlarmContext";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  // Inicializa usuarios y sesión
  useEffect(() => {
    if (!localStorage.getItem("users")) {
      const initialUsers = [
        { id: 1, username: "operador", password: "operador123", role: "operador" },
        { id: 2, username: "admin", password: "admin456", role: "admin" }
      ];
      localStorage.setItem("users", JSON.stringify(initialUsers));
    }
    const stored = localStorage.getItem("loggedUser");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogin = (loggedUser) => {
    setUser(loggedUser);
    localStorage.setItem("loggedUser", JSON.stringify(loggedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("loggedUser");
  };

  return (
    <Router>
      <AlarmProvider>
        <HabilitadosProvider>
          <div className="app-container">
            <NavBar user={user} onLogout={handleLogout} />

            <main className="main-content">
              <Routes>
                <Route path="/" element={<GestionarCadetes />} />
                <Route path="/listado" element={<ListadoCadetes />} />
                <Route path="/Base" element={<Base />} />
                <Route path="/Caja" element={<Caja />} />
                <Route path="/Recordatorio" element={<Recordatorio />} />
                {/* Ruta de estadísticas, el NavBar controla el enlace */}
                <Route path="/estadisticas" element={<Estadisticas />} />
              </Routes>
            </main>

            <Footer />

            {!user && <LoginModal onLogin={handleLogin} />}
          </div>
        </HabilitadosProvider>
      </AlarmProvider>
    </Router>
  );
}

export default App;
