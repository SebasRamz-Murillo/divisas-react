import React, { createContext, useContext, useState, useEffect } from 'react';
import { appointmentsApi, servicesApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
        const appointments = await appointmentsApi.getAll();
        const services = await servicesApi.getAll();
        const today = new Date().toISOString().split('T')[0];
      
      const processedData = {
        stats: {
          todayAppointments: appointments.filter(apt => 
            apt.appointment_date.startsWith(today)
          ).length,
          activeBarbers: appointments.reduce((acc, apt) => {
            if (!acc.includes(apt.user_barber_id)) acc.push(apt.user_barber_id);
            return acc;
          }, []).length,
          activeServices: services.filter(service => service.active).length
        },
        appointments: appointments
          .filter(apt => apt.appointment_date.startsWith(today))
          .map(apt => ({
            id: apt.id,
            clientName: `${apt.user_customer.name} ${apt.user_customer.lastname}`,
            serviceName: apt.service.name,
            time: new Date(apt.appointment_date).toLocaleTimeString('es', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            barberName: `${apt.user_barber.name}`
          })),
        popularServices: services.map(service => ({
          name: service.name,
          appointments: appointments.filter(apt => 
            apt.service_id === service.id
          ).length
        })).sort((a, b) => b.appointments - a.appointments).slice(0, 4),
        alerts: [] // Aquí puedes agregar la lógica para las alertas
      };

      setDashboardData(processedData);
    } catch (error) {
      toast.error('Error al cargar los datos del dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  return (
    <DashboardContext.Provider value={{
      dashboardData,
      loading,
      refreshDashboard: loadDashboardData
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard debe ser usado dentro de un DashboardProvider');
  }
  return context;
};