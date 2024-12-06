import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:3333/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('barber_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('barber_token');
      localStorage.removeItem('barber_user');
      //window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials) {
    try {
      const { data } = await api.post('/auth/login', credentials);
      console.log(data);
      localStorage.setItem('barber_token', data.data.token);
      localStorage.setItem('barber_user', JSON.stringify(data.data.user));
      return data.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async register(userData) {
    try {
      const { data } = await api.post('/v1/users', userData);
      return data.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('barber_token');
      localStorage.removeItem('barber_user');
    } catch (error) {
      console.error('Error durante el logout:', error);
    }
  },

  async getProfile() {
    try {
      const { data } = await api.get('/auth/me');
      return data.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('barber_token');
  },

  getUser() {
    const user = localStorage.getItem('barber_user');
    return user ? JSON.parse(user) : null;
  }
};

// Servicios para cada entidad
export const servicesApi = {
  async getAll() {
    const { data } = await api.get('/v1/services');
    return data.data;
  },

  async getById(id) {
    const { data } = await api.get(`/v1/services/${id}`);
    return data.data;
  },

  async create(serviceData) {
    const { data } = await api.post('/v1/services', serviceData);
    return data.data;
  },

  async update(id, serviceData) {
    const { data } = await api.patch(`/v1/services/${id}`, serviceData);
    return data.data;
  },

  async delete(id) {
    await api.delete(`/v1/services/${id}`);
  }
};

export const appointmentsApi = {
  async getAll() {
    const { data } = await api.get('/v1/appointments');
    return data.data;
  },

  async getById(id) {
    const { data } = await api.get(`/v1/appointments/${id}`);
    return data.data;
  },

  async create(appointmentData) {
    const { data } = await api.post('/v1/appointments', appointmentData);
    return data.data;
  },

  async update(id, appointmentData) {
    const { data } = await api.patch(`/v1/appointments/${id}`, appointmentData);
    return data.data;
  },

  async delete(id) {
    await api.delete(`/v1/appointments/${id}`);
  }
};

export const schedulesApi = {
  async getAll() {
    const { data } = await api.get('/v1/schedules');
    return data.data;
  },

  async getById(id) {
    const { data } = await api.get(`/v1/schedules/${id}`);
    return data.data;
  },

  async create(scheduleData) {
    const { data } = await api.post('/v1/schedules', scheduleData);
    return data.data;
  },

  async update(id, scheduleData) {
    const { data } = await api.patch(`/v1/schedules/${id}`, scheduleData);
    return data.data;
  },

  async delete(id) {
    await api.delete(`/v1/schedules/${id}`);
  }
};

export default api;