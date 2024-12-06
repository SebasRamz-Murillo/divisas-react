import axios from 'axios';

// Map to store the last request time for each endpoint
const requestTimestamps = new Map();
const CACHE_DURATION = 30000; // 10 seconds in milliseconds

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:3333/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to manage cache
const cacheManager = {
  setCache(key, data) {
    const cacheEntry = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(`barber_cache_${key}`, JSON.stringify(cacheEntry));
    requestTimestamps.set(key, Date.now());
  },

  getCache(key) {
    const cached = localStorage.getItem(`barber_cache_${key}`);
    if (!cached) return null;

    const cacheEntry = JSON.parse(cached);
    const now = Date.now();

    if (now - cacheEntry.timestamp < CACHE_DURATION) {
      return cacheEntry.data;
    }

    localStorage.removeItem(`barber_cache_${key}`);
    return null;
  },

  clearCache(key) {
    if (key) {
      localStorage.removeItem(`barber_cache_${key}`);
      requestTimestamps.delete(key);
    } else {
      // Clear all cache if no key is provided
      for (const key in localStorage) {
        if (key.startsWith('barber_cache_')) {
          localStorage.removeItem(key);
        }
      }
      requestTimestamps.clear();
    }
  }
};

// Interceptor for authentication token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('barber_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for authentication errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('barber_token');
      localStorage.removeItem('barber_user');
      cacheManager.clearCache(); // Clear all cache on authentication error
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials) {
    try {
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('barber_token', data.data.token);
      const user = await this.getProfile();
      localStorage.setItem('barber_user', JSON.stringify(user));
      localStorage.setItem('barber_role', user.role.id);
      cacheManager.clearCache(); // Clear all cache on login
      return user;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async register(userData) {
    const { data } = await api.post('/v1/users', userData);
    return data.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('barber_token');
      localStorage.removeItem('barber_user');
      cacheManager.clearCache(); // Clear all cache on logout
    } catch (error) {
      console.error('Error durante el logout:', error);
    }
  },

  async getProfile() {
    const cacheKey = 'auth/me';
    const cachedData = cacheManager.getCache(cacheKey);
    if (cachedData) return cachedData;

    const { data } = await api.get('/auth/me');
    cacheManager.setCache(cacheKey, data.data);
    return data.data;
  },

  isAuthenticated() {
    return !!localStorage.getItem('barber_token');
  },

  getUser() {
    const user = localStorage.getItem('barber_user');
    return user ? JSON.parse(user) : null;
  }
};

export const servicesApi = {
  async getAll() {
    const cacheKey = 'services/getAll';
    const cachedData = cacheManager.getCache(cacheKey);
    if (cachedData) return cachedData;

    const { data } = await api.get('/v1/services');
    cacheManager.setCache(cacheKey, data.data);
    return data.data;
  },

  async getById(id) {
    const cacheKey = `services/get/${id}`;
    const cachedData = cacheManager.getCache(cacheKey);
    if (cachedData) return cachedData;

    const { data } = await api.get(`/v1/services/${id}`);
    cacheManager.setCache(cacheKey, data.data);
    return data.data;
  },

  async create(serviceData) {
    const { data } = await api.post('/v1/services', serviceData);
    cacheManager.clearCache('services/getAll'); // Clear list cache on create
    return data.data;
  },

  async update(id, serviceData) {
    const { data } = await api.patch(`/v1/services/${id}`, serviceData);
    // Clear relevant caches
    cacheManager.clearCache('services/getAll');
    cacheManager.clearCache(`services/get/${id}`);
    return data.data;
  },

  async delete(id) {
    await api.delete(`/v1/services/${id}`);
    // Clear relevant caches
    cacheManager.clearCache('services/getAll');
    cacheManager.clearCache(`services/get/${id}`);
  }
};

export const appointmentsApi = {
  async getAll() {
    const cacheKey = 'appointments/getAll';
    const cachedData = cacheManager.getCache(cacheKey);
    if (cachedData) return cachedData;

    const { data } = await api.get('/v1/appointments');
    cacheManager.setCache(cacheKey, data.data);
    return data.data;
  },

  async getById(id) {
    const cacheKey = `appointments/get/${id}`;
    const cachedData = cacheManager.getCache(cacheKey);
    if (cachedData) return cachedData;

    const { data } = await api.get(`/v1/appointments/${id}`);
    cacheManager.setCache(cacheKey, data.data);
    return data.data;
  },

  async create(appointmentData) {
    const { data } = await api.post('/v1/appointments', appointmentData);
    cacheManager.clearCache('appointments/getAll');
    return data.data;
  },

  async update(id, appointmentData) {
    const { data } = await api.patch(`/v1/appointments/${id}`, appointmentData);
    cacheManager.clearCache('appointments/getAll');
    cacheManager.clearCache(`appointments/get/${id}`);
    return data.data;
  },

  async delete(id) {
    await api.delete(`/v1/appointments/${id}`);
    cacheManager.clearCache('appointments/getAll');
    cacheManager.clearCache(`appointments/get/${id}`);
  }
};

export const schedulesApi = {
  async getAll() {
    const cacheKey = 'schedules/getAll';
    const cachedData = cacheManager.getCache(cacheKey);
    if (cachedData) return cachedData;

    const { data } = await api.get('/v1/schedules');
    cacheManager.setCache(cacheKey, data.data);
    return data.data;
  },

  async getById(id) {
    const cacheKey = `schedules/get/${id}`;
    const cachedData = cacheManager.getCache(cacheKey);
    if (cachedData) return cachedData;

    const { data } = await api.get(`/v1/schedules/${id}`);
    cacheManager.setCache(cacheKey, data.data);
    return data.data;
  },

  async create(scheduleData) {
    const { data } = await api.post('/v1/schedules', scheduleData);
    cacheManager.clearCache('schedules/getAll');
    return data.data;
  },

  async update(id, scheduleData) {
    const { data } = await api.patch(`/v1/schedules/${id}`, scheduleData);
    cacheManager.clearCache('schedules/getAll');
    cacheManager.clearCache(`schedules/get/${id}`);
    return data.data;
  },

  async delete(id) {
    await api.delete(`/v1/schedules/${id}`);
    cacheManager.clearCache('schedules/getAll');
    cacheManager.clearCache(`schedules/get/${id}`);
  }
};


export const barbersApi = {
  async getAll() {
    const cacheKey = 'barbers/getAll';
    const cachedData = cacheManager.getCache(cacheKey);
    if (cachedData) return cachedData;

    const { data } = await api.get('/v1/users');
    console.log(data);
    data.data = data.data.filter(user => user.role.name === 'BARBER');
    cacheManager.setCache(cacheKey, data.data);
    return data.data;
  },

  async getById(id) {
    const cacheKey = `barbers/get/${id}`;
    const cachedData = cacheManager.getCache(cacheKey);
    if (cachedData) return cachedData;

    const { data } = await api.get(`/v1/users/${id}`);
    cacheManager.setCache(cacheKey, data.data);
    return data.data;
  },

  async create(barberData) {
    const { data } = await api.post('/v1/users', barberData);
    cacheManager.clearCache('barbers/getAll');
    return data.data;
  },

  async update(id, barberData) {
    const { data } = await api.patch(`/v1/users/${id}`, barberData);
    cacheManager.clearCache('barbers/getAll');
    cacheManager.clearCache(`barbers/get/${id}`);
    return data.data;
  },

  async delete(id) {
    await api.delete(`/v1/users/${id}`);
    cacheManager.clearCache('barbers/getAll');
    cacheManager.clearCache(`barbers/get/${id}`);
  }
};

export default api;