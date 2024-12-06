import React, { createContext, useContext, useState, useEffect } from 'react';
import { servicesApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';


const ServicesContext = createContext(null);

export const ServicesProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await servicesApi.getAll();
      setServices(data);
    } catch (error) {
      toast.error('Error al cargar los servicios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const createService = async (serviceData) => {
    try {
      const newService = await servicesApi.create(serviceData);
      setServices([...services, newService]);
      toast.success('Servicio creado exitosamente');
      return newService;
    } catch (error) {
      toast.error('Error al crear el servicio');
      throw error;
    }
  };

  const updateService = async (id, serviceData) => {
    try {
      const updatedService = await servicesApi.update(id, serviceData);
      setServices(services.map(service => 
        service.id === id ? updatedService : service
      ));
      toast.success('Servicio actualizado exitosamente');
      return updatedService;
    } catch (error) {
      toast.error('Error al actualizar el servicio');
      throw error;
    }
  };

  const deleteService = async (id) => {
    try {
      await servicesApi.delete(id);
      setServices(services.filter(service => service.id !== id));
      toast.success('Servicio eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar el servicio');
      throw error;
    }
  };

  const toggleServiceStatus = async (id) => {
    try {
      const service = services.find(s => s.id === id);
      if (!service) return;
      const updatedService = await servicesApi.update(id, {
        active: !service.active
      });
      setServices(services.map(s => 
        s.id === id ? updatedService : s
      ));
      
      toast.success('Estado del servicio actualizado');
    } catch (error) {
      toast.error('Error al actualizar el estado del servicio');
      throw error;
    }
  };
  return (
    <ServicesContext.Provider value={{
      services,
      loading,
      createService,
      updateService,
      deleteService,
      toggleServiceStatus,
      refreshServices: loadServices
    }}>
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices debe ser usado dentro de un ServicesProvider');
  }
  return context;
};