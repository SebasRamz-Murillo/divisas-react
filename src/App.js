import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider } from './context/AuthContext';

import LoginForm, { SignUpForm } from './components/Login';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProtectedLayout from './components/layout/ProtectedLayout';
import BarbersPage from './pages/Admin/BarberPage';
import ServicesPage from './pages/Admin/ServicesPage';
import AppointmentsPage from './pages/Barber/AppointmentsPage';
import SchedulePage from './pages/Barber/SchedulePage';
import ClientAppointments from './pages/Client/ClientAppointments';
import NewAppointment from './pages/Client/NewAppointment';
import { ServicesProvider } from './context/ServiceContext';
import { Toaster } from 'react-hot-toast';
import { DashboardProvider } from './context/DashboardContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#f77f7f',
    },
    secondary: {
      main: '#4caf50',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
  },
});

function App() {
  // Simular un estado de autenticación

  const router = createBrowserRouter([
    {
      path: '/',
      element: <LoginForm  />,
    },
    {
      path: '/signup',
      element: <SignUpForm  />,
    },
    {
      element: <ProtectedLayout />,
      children: [
        {
          path: '/dashboard',
          element: <AdminDashboard />,
        },
        {
          path: '/barbers',
          element: <BarbersPage />,
        },
        {
          path: '/services',
          element: <ServicesPage />,
        },
        {
          path: '/appointments',
          element: <AppointmentsPage />,
        },
        {
          path: '/schedule',
          element: <SchedulePage />,
        },
        {
          path: '/my-appointments',
          element: <ClientAppointments />,
        },
        {
          path: '/new-appointment',
          element: <NewAppointment />,
        },
      ],
    },
  ]);

  return (
    <AuthProvider>
      <ServicesProvider>
        <DashboardProvider>
        <ThemeProvider theme={theme}>
          <RouterProvider router={router} />
          <Toaster position="top-right" />
        </ThemeProvider>
        </DashboardProvider>
      </ServicesProvider>
    </AuthProvider>
  );
}

export default App;
