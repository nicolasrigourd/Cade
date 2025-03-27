import React, { createContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const AlarmContext = createContext();

export const AlarmProvider = ({ children }) => {
  const location = useLocation();
  const [alarms, setAlarms] = useState([]);       // Lista de alarmas programadas
  const [activeAlarm, setActiveAlarm] = useState(null); // Alarma actualmente activa (para modal global)
  const timersRef = useRef({});                   // Referencia a los timers, por id de alarma

  // Programa una nueva alarma
  const scheduleAlarm = (alarmData, delay) => {
    const newAlarm = {
      id: Date.now(), // Utilizamos el timestamp como id (único)
      time: alarmData.time,
      message: alarmData.message,
      active: false
    };
    setAlarms(prev => [...prev, newAlarm]);
    timersRef.current[newAlarm.id] = setTimeout(() => {
      // Cuando se cumple el tiempo, marcamos la alarma como activa y la asignamos a activeAlarm
      setActiveAlarm(newAlarm);
      setAlarms(prev =>
        prev.map(alarm =>
          alarm.id === newAlarm.id ? { ...alarm, active: true } : alarm
        )
      );
    }, delay);
  };

  // Pospone la alarma activa 10 minutos
  const postponeAlarm = () => {
    if (activeAlarm) {
      if (timersRef.current[activeAlarm.id]) {
        clearTimeout(timersRef.current[activeAlarm.id]);
      }
      const newTime = new Date(new Date().getTime() + 10 * 60 * 1000);
      const delay = newTime.getTime() - new Date().getTime();
      const updatedAlarm = { ...activeAlarm, time: newTime, active: false };
      setAlarms(prev =>
        prev.map(alarm => (alarm.id === activeAlarm.id ? updatedAlarm : alarm))
      );
      setActiveAlarm(null);
      timersRef.current[activeAlarm.id] = setTimeout(() => {
        setActiveAlarm(updatedAlarm);
        setAlarms(prev =>
          prev.map(alarm =>
            alarm.id === updatedAlarm.id ? { ...updatedAlarm, active: true } : alarm
          )
        );
      }, delay);
    }
  };

  // Acepta (o cierra) la alarma activa eliminándola
  const acceptAlarm = () => {
    if (activeAlarm) {
      if (timersRef.current[activeAlarm.id]) {
        clearTimeout(timersRef.current[activeAlarm.id]);
        delete timersRef.current[activeAlarm.id];
      }
      setAlarms(prev => prev.filter(alarm => alarm.id !== activeAlarm.id));
      setActiveAlarm(null);
    }
  };

  // Elimina una alarma de la lista (desde el listado en Recordatorio)
  const removeAlarm = (id) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    if (activeAlarm && activeAlarm.id === id) {
      setActiveAlarm(null);
    }
    setAlarms(prev => prev.filter(alarm => alarm.id !== id));
  };

  // Limpiar todos los timers al desmontar
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  return (
    <AlarmContext.Provider value={{
      alarms,
      activeAlarm,
      scheduleAlarm,
      postponeAlarm,
      acceptAlarm,
      removeAlarm
    }}>
      {children}
      {/* Modal global de alarma: se muestra en cualquier pantalla */}
      {activeAlarm && (
        <div className="recordatorio-overlay">
          <div className="recordatorio-modal">
            <p>{activeAlarm.message}</p>
            <div className="recordatorio-botones">
              <button className="recordatorio-button postpone" onClick={postponeAlarm}>
                Posponer
              </button>
              <button className="recordatorio-button accept" onClick={acceptAlarm}>
                Aceptar
              </button>
            </div>
            {/* Asegúrate de que la ruta del archivo de sonido sea la correcta */}
            <audio src="ruta_del_sonido.mp3" loop autoPlay />
          </div>
        </div>
      )}
      {/* Listado de alarmas: solo se muestra en la ruta "/Recordatorio" */}
      {location.pathname === "/Recordatorio" && alarms.length > 0 && (
        <div className="alarma-indicador">
          <h3>Listado de Alarmas</h3>
          {alarms.map(alarm => (
            <div key={alarm.id} className="alarma-item">
              <p><strong>Alarma programada para:</strong> {new Date(alarm.time).toLocaleString()}</p>
              <p><strong>Mensaje:</strong> {alarm.message}</p>
              <button
                className="recordatorio-button eliminar"
                onClick={() => removeAlarm(alarm.id)}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </AlarmContext.Provider>
  );
};
