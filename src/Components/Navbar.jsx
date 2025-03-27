/*
import React from "react";
import { Link } from "react-router-dom";

const NavBar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      
      <div className="navbar-logo">
        <img src="./public/logocadeteria.png" alt="Logo" />
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/">Inicio</Link>
        </li>
        <li>
          <Link to="/listado">Listado Cadetes</Link>
        </li>
        <li>
          <Link to="/Base">Base Diaria</Link>
        </li>
        <li>
          <Link to="/Caja">Caja</Link>
        </li>
        
        <li>
        <li>
  <a
    href="https://www.google.com/maps/place/Santiago+del+Estero,+Argentina"
    target="_blank"
    rel="noopener noreferrer"
  >
    GoogleMaps
  </a>
</li>

</li>

        <li>
          <Link to="/help">Ayuda</Link>
        </li>
      </ul>
      <div className="navbar-profile">
        {user ? (
          <div className="profile-info">
            <span className="profile-name">{user.username}</span>
            <button className="logout-button" onClick={onLogout}>
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <Link to="/login">
            <img src="/profile-icon.png" alt="Perfil" />
          </Link>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
*/
import React from "react";
import { Link } from "react-router-dom";

const NavBar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      {/* Logo a la izquierda */}
      <div className="navbar-logo">
        <img src="./public/logocadeteria.png" alt="Logo" />
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/">Inicio</Link>
        </li>
        <li>
          <Link to="/listado">Listado Cadetes</Link>
        </li>
        <li>
          <Link to="/Base">Base Diaria</Link>
        </li>
        <li>
          <Link to="/Caja">Caja</Link>
        </li>
        <li>
          <a
            href="https://www.google.com/maps/place/Santiago+del+Estero,+Argentina"
            target="_blank"
            rel="noopener noreferrer"
          >
            GoogleMaps
          </a>
        </li>
        <li>
          <Link to="/Recordatorio">Alarmas</Link>
        </li>
      </ul>
      <div className="navbar-profile">
        {user ? (
          <div className="profile-info">
            <span className="profile-name">{user.username}</span>
            <button className="logout-button" onClick={onLogout}>
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <Link to="/login">
            <img src="/profile-icon.png" alt="Perfil" />
          </Link>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
