import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './admin/context/AuthContext';
import { useAuth } from './admin/context/AuthContext';
import ProtectedRoute from './admin/components/ProtectedRoute';

import Home from './visitor/pages/Home';
import Verify from './visitor/pages/Verify';
import Photo from './visitor/pages/Photo';
import Details from './visitor/pages/Details';
import Waiting from './visitor/pages/Waiting';
import Pass from './visitor/pages/Pass';
import RecoverPass from './visitor/pages/RecoverPass';

import AdminLayout from './admin/components/AdminLayout';
import Login from './admin/pages/Login';
import Dashboard from './admin/pages/Dashboard';
import Scanner from './admin/pages/Scanner';
import History from './admin/pages/History';
import Hosts from './admin/pages/Hosts';
import ChangePassword from './admin/pages/ChangePassword';
import PublicScanner from './admin/pages/Scanner';

function RoleBasedRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/admin/login" replace />;
  return <Navigate to="dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Visitor portal — public */}
          <Route path="/" element={<Home />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/photo" element={<Photo />} />
          <Route path="/details" element={<Details />} />
          <Route path="/waiting/:id" element={<Waiting />} />
          <Route path="/pass/:visitId" element={<Pass />} />
          <Route path="/recover-pass" element={<RecoverPass />} />

          {/* Public scanner */}
          <Route path="/scanner" element={<PublicScanner />} />

          {/* Admin login — public */}
          <Route path="/admin/login" element={<Login />} />

          {/* Change password — authenticated but not role-restricted */}
          <Route path="/change-password" element={
            <ProtectedRoute skipMustChangeCheck>
              <ChangePassword />
            </ProtectedRoute>
          } />

          {/* Admin portal — protected */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['OWNER', 'HOST']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<RoleBasedRedirect />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="scanner" element={<Scanner />} />
            <Route path="history" element={<History />} />
            <Route path="hosts" element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <Hosts />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
