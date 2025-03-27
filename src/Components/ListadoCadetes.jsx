
// src/Components/ListadoCadetes.jsx
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, deleteDoc, updateDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";


const ListadoCadetes = () => {
  const [cadetes, setCadetes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para edición
  const [editingCadeteId, setEditingCadeteId] = useState(null);
  const [editedCadete, setEditedCadete] = useState({});
  
  // Estado para agregar nuevo cadete
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCadete, setNewCadete] = useState({
    id: "",
    "nombre y apellido": "",
    domicilio: "",
    dni: "",
    telefono: "",
    movilidad: "",
    deuda: 0,
    multa: 0,
    observaciones: "",
    base: 4500,      // Campo "base" agregado con valor fijo
    bloqueado: false,
  });

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "cadetes"),
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setCadetes(data);
        setLoading(false);
        // Actualizamos localStorage con "bdcadetes"
        localStorage.setItem("bdcadetes", JSON.stringify(data));
      },
      (error) => {
        console.error("Error al obtener cadetes:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Función para eliminar un cadete con confirmación
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("¿Estás seguro que deseas eliminar este cadete?");
    if (!confirmDelete) return;
    try {
      await deleteDoc(doc(db, "cadetes", id));
    } catch (error) {
      console.error("Error al eliminar cadete:", error);
    }
  };

  // Función para bloquear o desbloquear un cadete
  const handleToggleBloqueo = async (cadete) => {
    try {
      const newStatus = !cadete.bloqueado;
      await updateDoc(doc(db, "cadetes", cadete.id), { bloqueado: newStatus });
    } catch (error) {
      console.error("Error al actualizar bloqueo:", error);
    }
  };

  // Funciones para editar cadete
  const handleEdit = (cadete) => {
    setEditingCadeteId(cadete.id);
    setEditedCadete(cadete);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedCadete({
      ...editedCadete,
      [name]: (name === "deuda" || name === "multa") ? Number(value) : value
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      const { id: _, ...dataToUpdate } = editedCadete;
      await updateDoc(doc(db, "cadetes", id), dataToUpdate);
      setEditingCadeteId(null);
      setEditedCadete({});
    } catch (error) {
      console.error("Error al guardar edición:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCadeteId(null);
    setEditedCadete({});
  };

  // Funciones para agregar nuevo cadete
  const handleNewCadeteInputChange = (e) => {
    const { name, value } = e.target;
    setNewCadete({
      ...newCadete,
      [name]: (name === "deuda" || name === "multa") ? Number(value) : value
    });
  };

  const handleAddCadete = async (e) => {
    e.preventDefault();
    if (!newCadete.id) {
      alert("Debes ingresar un ID para el nuevo cadete");
      return;
    }
    try {
      await setDoc(doc(db, "cadetes", newCadete.id), newCadete);
      setShowAddForm(false);
      setNewCadete({
        id: "",
        "nombre y apellido": "",
        domicilio: "",
        dni: "",
        telefono: "",
        movilidad: "",
        deuda: 0,
        multa: 0,
        observaciones: "",
        base: 4500,
        bloqueado: false,
      });
    } catch (error) {
      console.error("Error al agregar cadete:", error);
    }
  };

  if (loading) return <div className="lc-loading">Cargando cadetes...</div>;

  return (
    <div className="lc-container">
      <div className="add-button-container">
        <button className="btn btn-add" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancelar Agregar" : "Agregar Cadete"}
        </button>
      </div>

      {showAddForm && (
        <div className="cadete-card">
          <h3>Agregar Nuevo Cadete</h3>
          <form className="cadete-details" onSubmit={handleAddCadete}>
            <div>
              <strong>ID:</strong>
              <input
                type="text"
                name="id"
                value={newCadete.id}
                onChange={handleNewCadeteInputChange}
                required
              />
            </div>
            <div>
              <strong>Nombre y Apellido:</strong>
              <input
                type="text"
                name="nombre y apellido"
                value={newCadete["nombre y apellido"]}
                onChange={handleNewCadeteInputChange}
                required
              />
            </div>
            <div>
              <strong>Domicilio:</strong>
              <input
                type="text"
                name="domicilio"
                value={newCadete.domicilio}
                onChange={handleNewCadeteInputChange}
                required
              />
            </div>
            <div>
              <strong>DNI:</strong>
              <input
                type="text"
                name="dni"
                value={newCadete.dni}
                onChange={handleNewCadeteInputChange}
                required
              />
            </div>
            <div>
              <strong>Teléfono:</strong>
              <input
                type="text"
                name="telefono"
                value={newCadete.telefono}
                onChange={handleNewCadeteInputChange}
                required
              />
            </div>
            <div>
              <strong>Movilidad:</strong>
              <input
                type="text"
                name="movilidad"
                value={newCadete.movilidad}
                onChange={handleNewCadeteInputChange}
                required
              />
            </div>
            <div>
              <strong>Deuda:</strong>
              <input
                type="number"
                name="deuda"
                value={newCadete.deuda}
                onChange={handleNewCadeteInputChange}
                required
              />
            </div>
            <div>
              <strong>Multa:</strong>
              <input
                type="number"
                name="multa"
                value={newCadete.multa}
                onChange={handleNewCadeteInputChange}
                required
              />
            </div>
            <div>
              <strong>Observaciones:</strong>
              <input
                type="text"
                name="observaciones"
                value={newCadete.observaciones}
                onChange={handleNewCadeteInputChange}
              />
            </div>
            {/* Se eliminó el campo "estado" */}
            <div className="button-container">
              <button className="btn btn-save" type="submit">
                Guardar
              </button>
              <button className="btn btn-cancel" type="button" onClick={() => setShowAddForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="lc-cards-container">
        {cadetes.length === 0 ? (
          <ItemSinMoviles />
        ) : (
          cadetes.map((cadete) =>
            editingCadeteId === cadete.id ? (
              <div className="cadete-card" key={cadete.id}>
                <h3>Editar Cadete (ID: {cadete.id})</h3>
                <div className="cadete-details">
                  <div>
                    <strong>Nombre y Apellido:</strong>
                    <input
                      type="text"
                      name="nombre y apellido"
                      value={editedCadete["nombre y apellido"] || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <strong>Domicilio:</strong>
                    <input
                      type="text"
                      name="domicilio"
                      value={editedCadete.domicilio || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <strong>DNI:</strong>
                    <input
                      type="text"
                      name="dni"
                      value={editedCadete.dni || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <strong>Teléfono:</strong>
                    <input
                      type="text"
                      name="telefono"
                      value={editedCadete.telefono || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <strong>Movilidad:</strong>
                    <input
                      type="text"
                      name="movilidad"
                      value={editedCadete.movilidad || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <strong>Deuda:</strong>
                    <input
                      type="number"
                      name="deuda"
                      value={editedCadete.deuda || 0}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <strong>Multa:</strong>
                    <input
                      type="number"
                      name="multa"
                      value={editedCadete.multa || 0}
                      onChange={handleInputChange}
                    />
                  </div>
                  {/* Se eliminó el campo "estado" en el formulario de edición */}
                </div>
                <div className="button-container">
                  <button className="btn btn-save" onClick={() => handleSaveEdit(cadete.id)}>
                    Guardar
                  </button>
                  <button className="btn btn-cancel" onClick={handleCancelEdit}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="cadete-card" key={cadete.id}>
                <h3>{cadete["nombre y apellido"]} (ID: {cadete.id})</h3>
                <div className="cadete-details">
                  <div><strong>Domicilio:</strong> {cadete.domicilio}</div>
                  <div><strong>DNI:</strong> {cadete.dni}</div>
                  <div><strong>Teléfono:</strong> {cadete.telefono}</div>
                  <div><strong>Movilidad:</strong> {cadete.movilidad}</div>
                  <div><strong>Deuda:</strong> {cadete.deuda}</div>
                  <div><strong>Multa:</strong> {cadete.multa}</div>
                  <div><strong>Bloqueado:</strong> {cadete.bloqueado ? "Sí" : "No"}</div>
                </div>
                <div className="button-container">
                  <button className="btn btn-edit" onClick={() => handleEdit(cadete)}>
                    Editar
                  </button>
                  <button className="btn btn-delete" onClick={() => handleDelete(cadete.id)}>
                    Eliminar
                  </button>
                  <button className="btn btn-toggle" onClick={() => handleToggleBloqueo(cadete)}>
                    {cadete.bloqueado ? "Desbloquear" : "Bloquear"}
                  </button>
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
};

export default ListadoCadetes;
