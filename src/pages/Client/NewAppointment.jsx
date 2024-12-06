import React, { useState, useEffect } from 'react';
import { Card, Button, LoadingSpinner } from '../../components/ui';
import { Calendar, Clock, User, Scissors, ArrowRight, Check } from 'lucide-react';
import { useServices } from '../../context/ServiceContext';

const StepIndicator = ({ currentStep }) => {
  const steps = [
    { title: 'Servicio', icon: Scissors },
    { title: 'Barbero', icon: User },
    { title: 'Fecha y Hora', icon: Clock },
    { title: 'Confirmación', icon: Check }
  ];

  return (
    <div className="flex justify-between items-center mb-8">
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        const isActive = index === currentStep;
        const isPast = index < currentStep;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <div className={`flex-1 h-1 ${isPast ? 'bg-blue-500' : 'bg-gray-200'}`} />
            )}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : isPast
                    ? 'bg-blue-100 text-blue-500'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <StepIcon className="w-5 h-5" />
              </div>
              <span className={`text-sm ${isActive ? 'text-blue-500 font-medium' : 'text-gray-500'}`}>
                {step.title}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
const ServiceSelection = ({ selectedService, onSelect }) => {
  const { services, loading } = useServices();
   const activeServices = services.filter(service => service.active);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      {activeServices.map(service => (
        <Card
          key={service.id}
          className={`cursor-pointer transition-all ${
            selectedService?.id === service.id
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : 'hover:bg-gray-50'
          }`}
          onClick={() => onSelect(service)}
        >
          <div className="p-4 flex justify-between items-center">
            <div>
              <h3 className="font-medium">{service.name}</h3>
              <p className="text-sm text-gray-600">{service.description}</p>
              <p className="text-lg font-semibold mt-2">${service.price.toFixed(2)}</p>
            </div>
            {selectedService?.id === service.id && (
              <Check className="w-6 h-6 text-blue-500" />
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

const BarberSelection = ({ barbers, selectedBarber, onSelect }) => (
  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
    {barbers.map(barber => (
      <Card
        key={barber.id}
        className={`cursor-pointer transition-all ${
          selectedBarber?.id === barber.id
            ? 'ring-2 ring-blue-500 bg-blue-50'
            : 'hover:bg-gray-50'
        }`}
        onClick={() => onSelect(barber)}
      >
        <div className="p-4 flex justify-between items-center">
          <div>
            <h3 className="font-medium">{barber.name} {barber.lastname}</h3>
            <div className="flex gap-2 mt-2">
              {barber.available && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded">
                  Disponible Hoy
                </span>
              )}
            </div>
          </div>
          {selectedBarber?.id === barber.id && (
            <Check className="w-6 h-6 text-blue-500" />
          )}
        </div>
      </Card>
    ))}
  </div>
);

const DateTimeSelection = ({ selectedDate, selectedTime, availableTimes, onDateSelect, onTimeSelect }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Selecciona una fecha
      </label>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateSelect(e.target.value)}
        min={new Date().toISOString().split('T')[0]}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>

    {selectedDate && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Horarios disponibles
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {availableTimes.map((time) => (
            <button
              key={time}
              onClick={() => onTimeSelect(time)}
              className={`p-2 text-center rounded-md transition-colors ${
                selectedTime === time
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
);

const ConfirmationStep = ({ service, barber, date, time }) => (
  <Card className="p-6">
    <h3 className="text-lg font-medium mb-4">Resumen de tu cita</h3>
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Scissors className="w-5 h-5 text-gray-500" />
        <div>
          <p className="font-medium">{service.name}</p>
          <p className="text-gray-600">${service.price}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <User className="w-5 h-5 text-gray-500" />
        <div>
          <p className="font-medium">{barber.name} {barber.lastname}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-gray-500" />
        <p className="font-medium">{date}</p>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-gray-500" />
        <p className="font-medium">{time}</p>
      </div>
    </div>
  </Card>
);

const NewAppointment = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [barbers, setBarbers] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  useEffect(() => {
    // Simulación de carga de barberos - esto debería venir de tu API
    setTimeout(() => {
      setBarbers([
        {
          id: 1,
          name: 'Carlos',
          lastname: 'García',
          available: true
        },
        {
          id: 2,
          name: 'Ana',
          lastname: 'Martínez',
          available: true
        },
        {
          id: 3,
          name: 'Luis',
          lastname: 'Rodríguez',
          available: false
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Aquí iría la lógica para crear la cita usando appointmentsApi
      console.log('Crear cita', {
        service: selectedService,
        barber: selectedBarber,
        date: selectedDate,
        time: selectedTime
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nueva Cita</h1>
        <p className="text-gray-600">Agenda tu próxima cita en simples pasos</p>
      </div>

      <StepIndicator currentStep={currentStep} />

      <div className="min-h-[400px]">
        {currentStep === 0 && (
          <ServiceSelection
            selectedService={selectedService}
            onSelect={setSelectedService}
          />
        )}

        {/* Los otros pasos permanecen iguales */}
        {currentStep === 1 && (
          <BarberSelection
            barbers={barbers}
            selectedBarber={selectedBarber}
            onSelect={setSelectedBarber}
          />
        )}

        {currentStep === 2 && (
          <DateTimeSelection
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            availableTimes={availableTimes}
            onDateSelect={setSelectedDate}
            onTimeSelect={setSelectedTime}
          />
        )}

        {currentStep === 3 && (
          <ConfirmationStep
            service={selectedService}
            barber={selectedBarber}
            date={selectedDate}
            time={selectedTime}
          />
        )}
      </div>

      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Atrás
        </Button>
        <Button
          onClick={handleNext}
          disabled={
            (currentStep === 0 && !selectedService) ||
            (currentStep === 1 && !selectedBarber) ||
            (currentStep === 2 && (!selectedDate || !selectedTime))
          }
        >
          {currentStep === 3 ? 'Confirmar Cita' : 'Siguiente'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default NewAppointment;