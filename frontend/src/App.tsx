import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/auth';
import { Role } from './types';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientPage } from './pages/PatientPage';
import { NewVisitPage } from './pages/NewVisitPage';
import { ReportPage } from './pages/ReportPage';
import { ReportsPage } from './pages/ReportsPage';
import { RegisterPatientPage } from './pages/RegisterPatientPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { doctor, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;
  if (!doctor) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRoute({ children, roles }: { children: React.ReactNode; roles: Role[] }) {
  const { doctor, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;
  if (!doctor) return <Navigate to="/login" replace />;
  if (!roles.includes(doctor.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const { init } = useAuth();
  useEffect(() => { init(); }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="patients/:id" element={<PatientPage />} />
        <Route path="patients/register" element={<RegisterPatientPage />} />
        <Route path="visits/new" element={
          <RoleRoute roles={['ADMIN', 'DOCTOR']}><NewVisitPage /></RoleRoute>
        } />
        <Route path="visits/:id" element={
          <RoleRoute roles={['ADMIN', 'DOCTOR']}><ReportPage /></RoleRoute>
        } />
        <Route path="reports" element={
          <RoleRoute roles={['ADMIN', 'DOCTOR']}><ReportsPage /></RoleRoute>
        } />
      </Route>
    </Routes>
  );
}
