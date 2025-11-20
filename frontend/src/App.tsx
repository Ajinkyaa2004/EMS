import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import ProjectDetail from './pages/admin/ProjectDetail';
import EmployeeDashboard from './pages/employee/Dashboard';
import FreelancerDashboard from './pages/freelancer/Dashboard';
import TraineeDashboard from './pages/trainee/Dashboard';
import ClientDashboard from './pages/client/Dashboard';
import HackathonPlayerDashboard from './pages/hackathon/HackathonPlayerDashboard';
import HackathonAdminDashboard from './pages/hackathon/HackathonAdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Router>
          <Routes>
            <Route path="/" element={<RoleSelection />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin Routes */}
            <Route
              path="/admin/project/:id"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ProjectDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Employee Routes */}
            <Route
              path="/employee/*"
              element={
                <ProtectedRoute requiredRole="employee">
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Freelancer Routes */}
            <Route
              path="/freelancer/*"
              element={
                <ProtectedRoute requiredRole="freelancer">
                  <FreelancerDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Trainee Routes */}
            <Route
              path="/trainee/*"
              element={
                <ProtectedRoute requiredRole="trainee">
                  <TraineeDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Client Routes */}
            <Route
              path="/client/*"
              element={
                <ProtectedRoute requiredRole="client">
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Hackathon Routes */}
            <Route path="/hackathon/player" element={<HackathonPlayerDashboard />} />
            <Route path="/hackathon/admin" element={<HackathonAdminDashboard />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
