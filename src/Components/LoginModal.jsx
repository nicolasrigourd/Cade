/*import React, { useState } from "react";


const LoginModal = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Obtén el array de usuarios almacenado en localStorage (clave "users")
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const userFound = users.find(
      (user) => user.username === username && user.password === password
    );
    if (userFound) {
      onLogin(userFound);
    } else {
      setError("Credenciales inválidas. Intenta nuevamente.");
    }
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal-content">
        
        <img
          src="./public/logo-cadeteexpress.png"
          alt="Logo"
          className="login-modal-image"
        />
        <form onSubmit={handleSubmit} className="login-modal-form">
          <div className="login-modal-field">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuario"
            />
          </div>
          <div className="login-modal-field">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Clave"
            />
          </div>
          {error && <p className="login-modal-error">{error}</p>}
          <button type="submit" className="login-modal-button">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
*/
/*
import React, { useState } from "react";

const LoginModal = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Depuración: muestra el contenido de "users" en localStorage
    const storedUsers = localStorage.getItem("users");
    console.log("Stored users:", storedUsers);
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    console.log("Parsed users:", users);
    console.log("Credenciales ingresadas:", username, password);

    const userFound = users.find(
      (user) => user.username === username && user.password === password
    );
    
    if (userFound) {
      onLogin(userFound);
    } else {
      setError("Credenciales inválidas. Intenta nuevamente.");
      console.error("No se encontró usuario para las credenciales ingresadas");
    }
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal-content">
        
        <img
          src="/logo-cadeteexpress.png"
          alt="Logo"
          className="login-modal-image"
        />
        <form onSubmit={handleSubmit} className="login-modal-form">
          <div className="login-modal-field">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuario"
            />
          </div>
          <div className="login-modal-field">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Clave"
            />
          </div>
          {error && <p className="login-modal-error">{error}</p>}
          <button type="submit" className="login-modal-button">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
*/
import React, { useState } from "react";

const LoginModal = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Depuración: muestra el contenido de "users" en localStorage
    const storedUsers = localStorage.getItem("users");
    console.log("Stored users:", storedUsers);
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    console.log("Parsed users:", users);
    console.log("Credenciales ingresadas:", username, password);

    const userFound = users.find(
      (user) => user.username === username && user.password === password
    );
    
    if (userFound) {
      // Al iniciar sesión, eliminamos la bandera de "caja cerrada"
      sessionStorage.removeItem("cajaCerrada_" + userFound.username);
      onLogin(userFound);
    } else {
      setError("Credenciales inválidas. Intenta nuevamente.");
      console.error("No se encontró usuario para las credenciales ingresadas");
    }
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal-content">
        <img
          src="/logo-cadeteexpress.png"
          alt="Logo"
          className="login-modal-image"
        />
        <form onSubmit={handleSubmit} className="login-modal-form">
          <div className="login-modal-field">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuario"
            />
          </div>
          <div className="login-modal-field">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Clave"
            />
          </div>
          {error && <p className="login-modal-error">{error}</p>}
          <button type="submit" className="login-modal-button">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
