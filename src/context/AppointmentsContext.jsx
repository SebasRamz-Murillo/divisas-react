import React, { createContext, useContext, useState, useEffect } from 'react';
import { appointmentsApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const AppointmentsContext = createContext(null);

export const AppointmentsProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadAppointments = async (filters = {}) => {
    if (!user) return;
    try {
      setLoading(true);
      let data;
      // Cargar citas según el rol del usuario
      if (user.role === 'client') {
        data = await appointmentsApi.getByCustomer(user.id);
      } else if (user.role === 'barber') {
        data = await appointmentsApi.getByBarber(user.id);
      } else if (user.role === 'admin') {
        data = await appointmentsApi.getAll(filters);
      }
      setAppointments(data);
    } catch (error) {
      toast.error('Error al cargar las citas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const createAppointment = async (appointmentData) => {
    try {
      const newAppointment = await appointmentsApi.create({
        ...appointmentData,
        user_customer_id: user.id,
        status: 'pending'
      });
      setAppointments([...appointments, newAppointment]);
      toast.success('Cita agendada exitosamente');
      return newAppointment;
    } catch (error) {
      toast.error('Error al agendar la cita');
      throw error;
    }
  };

  const updateAppointment = async (id, appointmentData) => {
    try {
      const updatedAppointment = await appointmentsApi.update(id, appointmentData);
      setAppointments(appointments.map(appointment =>
        appointment.id === id ? updatedAppointment : appointment
      ));
      toast.success('Cita actualizada exitosamente');
      return updatedAppointment;
    } catch (error) {
      toast.error('Error al actualizar la cita');
      throw error;
    }
  };

  const cancelAppointment = async (id) => {
    try {
      await appointmentsApi.update(id, { status: 'cancelled' });
      setAppointments(appointments.map(appointment =>
        appointment.id === id ? { ...appointment, status: 'cancelled' } : appointment
      ));
      toast.success('Cita cancelada exitosamente');
    } catch (error) {
      toast.error('Error al cancelar la cita');
      throw error;
    }
  };

  const completeAppointment = async (id) => {
    try {
      await appointmentsApi.update(id, { status: 'completed' });
      setAppointments(appointments.map(appointment =>
        appointment.id === id ? { ...appointment, status: 'completed' } : appointment
      ));
      toast.success('Cita marcada como completada');
    } catch (error) {
      toast.error('Error al completar la cita');
      throw error;
    }
  };

  const getFilteredAppointments = (filters = {}) => {
    let filtered = [...appointments];

    if (filters.status) {
      filtered = filtered.filter(app => app.status === filters.status);
    }

    if (filters.date) {
      filtered = filtered.filter(app => 
        app.appointment_date.split('T')[0] === filters.date
      );
    }

    if (filters.barber_id) {
      filtered = filtered.filter(app => 
        app.user_barber_id === filters.barber_id
      );
    }

    return filtered;
  };

  const checkAvailability = async (barberId, date, time) => {
    try {
      const isAvailable = await appointmentsApi.checkAvailability(
        barberId,
        `${date} ${time}`
      );
      return isAvailable;
    } catch (error) {
      toast.error('Error al verificar disponibilidad');
      throw error;
    }
  };

  return (
    <AppointmentsContext.Provider value={{
      appointments,
      loading,
      createAppointment,
      updateAppointment,
      cancelAppointment,
      completeAppointment,
      refreshAppointments: loadAppointments,
      getFilteredAppointments,
      checkAvailability
    }}>
      {children}
    </AppointmentsContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentsContext);
  if (!context) {
    throw new Error('useAppointments debe ser usado dentro de un AppointmentsProvider');
  }
  return context;
};