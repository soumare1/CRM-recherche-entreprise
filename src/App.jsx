import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PipelinePage from './pages/PipelinePage';
import ImportPage from './pages/ImportPage';
import ProspectsPage from './pages/ProspectsPage';
import RelancesPage from './pages/RelancesPage';
import AgendaPage from './pages/AgendaPage';
import RecherchePage from './pages/RecherchePage';
import SettingsPage from './pages/SettingsPage';
import { useSettingsStore } from './stores/settingsStore';

import useTheme from './hooks/useTheme';

// Wrapper pour l'application dynamique du thème (Dark/Light & Accent Color)
function ThemeWrapper({ children }) {
  useTheme();
  return children;
}

// Route protégée : redirige vers /login si non connecté
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="pipeline" element={<PipelinePage />} />
        <Route path="prospects" element={<ProspectsPage />} />
        <Route path="relances" element={<RelancesPage />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="recherche" element={<RecherchePage />} />
        <Route path="import" element={<ImportPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeWrapper>
          <AppRoutes />
        </ThemeWrapper>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
