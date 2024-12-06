// src/context/BarbersContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { barbersApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const BarbersContext = createContext(null);

export const BarbersProvider = ({ children }) => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadBarbers = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await barbersApi.getAll();
      setBarbers(data);
    } catch (error) {
      toast.error('Error al cargar los barberos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBarbers();
  }, [user]);

  const createBarber = async (barberData) => {
    try {
      const newBarber = await barbersApi.create(barberData);
      setBarbers([...barbers, newBarber]);
      toast.success('Barbero creado exitosamente');
      return newBarber;
    } catch (error) {
      toast.error('Error al crear el barbero');
      throw error;
    }
  };

  const updateBarber = async (id, barberData) => {
    try {
      const updatedBarber = await barbersApi.update(id, barberData);
      setBarbers(barbers.map(barber =>
        barber.id === id ? updatedBarber : barber
      ));
      toast.success('Barbero actualizado exitosamente');
      return updatedBarber;
    } catch (error) {
      toast.error('Error al actualizar el barbero');
      throw error;
    }
  };

  const deleteBarber = async (id) => {
    try {
      await barbersApi.delete(id);
      setBarbers(barbers.filter(barber => barber.id !== id));
      toast.success('Barbero eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar el barbero');
      throw error;
    }
  };

  const toggleBarberStatus = async (id) => {
    try {
      const barber = barbers.find(b => b.id === id);
      if (!barber) return;
      const updatedBarber = await barbersApi.update(id, {
        active: !barber.active
      });
      setBarbers(barbers.map(b =>
        b.id === id ? updatedBarber : b
      ));
      toast.success('Estado del barbero actualizado');
    } catch (error) {
      toast.error('Error al actualizar el estado del barbero');
      throw error;
    }
  };

  return (
    <BarbersContext.Provider value={{
      barbers,
      loading,
      createBarber,
      updateBarber,
      deleteBarber,
      toggleBarberStatus,
      refreshBarbers: loadBarbers
    }}>
      {children}
    </BarbersContext.Provider>
  );
};

export const useBarbers = () => {
  const context = useContext(BarbersContext);
  if (!context) {
    throw new Error('useBarbers debe ser usado dentro de un BarbersProvider');
  }
  return context;
};