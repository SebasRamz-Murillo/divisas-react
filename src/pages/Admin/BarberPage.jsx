import React, { useState } from 'react';
import { Card, Button, Input, LoadingSpinner } from '../../components/ui';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { useBarbers } from '../../context/BarbersContext';

const BarberDialog = ({ barber, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    barber || {
      name: '',
      lastname: '',
      email: '',
      username: '',
      password: '',
      active: true
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {barber ? 'Editar Barbero' : 'Nuevo Barbero'}
            </h2>
            <button 
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

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

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Usuario"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />

          {!barber && (
            <Input
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {barber ? 'Guardar Cambios' : 'Crear Barbero'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const BarberCard = ({ barber, onEdit, onToggleActive, onDelete }) => (
  <Card className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 space-y-4 md:space-y-0">
    <div className="flex-1">
      <h3 className="font-semibold text-lg">
        {barber.name} {barber.lastname}
      </h3>
      <p className="text-gray-600">{barber.email}</p>
      <p className="text-sm text-gray-500">@{barber.username}</p>
    </div>

    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
      <Button 
        variant={barber.active ? "secondary" : "primary"}
        onClick={() => onToggleActive(barber.id)}
        size="sm"
      >
        {barber.active ? (
          <span className="flex items-center gap-1">
            <Check size={16} /> Activo
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <X size={16} /> Inactivo
          </span>
        )}
      </Button>

      <Button
        variant="outline"
        onClick={() => onEdit(barber)}
        size="sm"
      >
        <Edit size={16} />
      </Button>

      <Button
        variant="danger"
        onClick={() => onDelete(barber.id)}
        size="sm"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  </Card>
);

const BarbersPage = () => {
  const { barbers, loading, createBarber, updateBarber, deleteBarber, toggleBarberStatus } = useBarbers();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(null);

  const handleSave = async (barberData) => {
    console.log('Saving:', barberData); 
    try {
      if (selectedBarber) {
        await updateBarber(selectedBarber.id, barberData);
      } else {
        await createBarber(barberData);
      }
      setShowDialog(false);
      setSelectedBarber(null);
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleEdit = (barber) => {
    setSelectedBarber(barber);
    setShowDialog(true);
  };

  const handleDelete = async (barberId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este barbero?')) {
      try {
        await deleteBarber(barberId);
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Barberos</h1>
        <Button
          onClick={() => {
            setSelectedBarber(null);
            setShowDialog(true);
          }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Barbero
        </Button>
      </div>

      <div className="grid gap-4">
        {barbers.map(barber => (
          <BarberCard
            key={barber.id}
            barber={barber}
            onEdit={handleEdit}
            onToggleActive={toggleBarberStatus}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {showDialog && (
        <BarberDialog
          barber={selectedBarber}
          onClose={() => {
            setShowDialog(false);
            setSelectedBarber(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default BarbersPage;
