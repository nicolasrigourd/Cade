import React, { useState, useContext } from "react";
import { AlarmContext } from "../Context/AlarmContext";

const Recordatorio = () => {
  const { scheduleAlarm } = useContext(AlarmContext);
  const [alarmTime, setAlarmTime] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedTime = new Date(alarmTime);
    const now = new Date();
    const delay = selectedTime.getTime() - now.getTime();
    if (delay <= 0) {
      alert("La fecha y hora deben ser futuras.");
      return;
    }
    scheduleAlarm({ time: selectedTime, message }, delay);
    // Limpiar campos para nueva entrada
    setAlarmTime("");
    setMessage("");
  };

  return (
    <div>
      <form className="recordatorio-form" onSubmit={handleSubmit}>
        <h2>Crear Recordatorio</h2>
        <div>
          <label>Fecha y hora:</label>
          <input
            type="datetime-local"
            value={alarmTime}
            onChange={(e) => setAlarmTime(e.target.value)}
          />
        </div>
        <div>
          <label>Mensaje:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <button className="recordatorio-submit" type="submit">
          Programar Alarma
        </button>
      </form>
    </div>
  );
};

export default Recordatorio;
