import React, { useState } from 'react';
import { Card, Button, Input } from './ui';
import { User, Lock, Mail, Scissors, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="flex justify-center">
        <Scissors className="w-12 h-12 text-blue-600" />
      </div>
      <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
        {title}
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        {subtitle}
      </p>
    </div>
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      {children}
    </div>
  </div>
);

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
      // Manejar error
      console.error('Error:', error);
      toast.error(error.message || 'Error al iniciar sesión');


    }
  };

  return (
    <AuthLayout 
      title="Bienvenido de nuevo"
      subtitle="Ingresa a tu cuenta para continuar"
    >
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-4">
          <Input
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            prefix={<User className="w-5 h-5 text-gray-400" />}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            prefix={<Lock className="w-5 h-5 text-gray-400" />}
            required
          />

          <div>
            <Button type="submit" fullWidth>
              Iniciar Sesión
            </Button>
          </div>

          <div className="text-sm text-center">
            <a href="/signup" className="text-blue-600 hover:text-blue-500">
              ¿No tienes una cuenta? Regístrate
            </a>
          </div>
        </form>
      </Card>
    </AuthLayout>
  );
};

const SignUpForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: '',
    username: '',
    password: '',
    role_id: 4 // Asumiendo que 3 es el ID para clientes
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      await register(formData);
      toast.success('Registro exitoso');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Error al registrar usuario');
      console.error('Error de registro:', error);
    }
  };

  return (
    <AuthLayout 
      title="Crear una cuenta"
      subtitle="Regístrate para agendar tus citas"
    >
      <Card>
        <div className="p-4">
          <a href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver al inicio
          </a>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Nombre"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Input
                label="Apellido"
                value={formData.lastname}
                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                required
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              prefix={<Mail className="w-5 h-5 text-gray-400" />}
              required
            />

            <Input
              label="Usuario"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              prefix={<User className="w-5 h-5 text-gray-400" />}
              required
            />

            <Input
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              prefix={<Lock className="w-5 h-5 text-gray-400" />}
              error={errors.password}
              required
            />


            <Button type="submit" fullWidth>
              Crear Cuenta
            </Button>

            <div className="text-sm text-center">
              <a href="/" className="text-blue-600 hover:text-blue-500">
                ¿Ya tienes una cuenta? Inicia sesión
              </a>
            </div>
          </form>
        </div>
      </Card>
    </AuthLayout>
  );
};

export { LoginForm as default, SignUpForm };