import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';

// Dashboard
import { DashboardPage } from '@/pages/dashboard/DashboardPage';

// Workers Pages
import { WorkersListPage } from '@/pages/workers/WorkersListPage';
import { WorkerDetailPage } from '@/pages/workers/WorkerDetailPage';

// Documents Pages
import { PendingDocumentsPage } from '@/pages/documents/PendingDocumentsPage';
import { DocumentReviewPage } from '@/pages/documents/DocumentReviewPage';

// Clients Pages
import { ClientsListPage } from '@/pages/clients/ClientsListPage';

// Not Found
import { NotFoundPage } from '@/pages/NotFoundPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Private Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Workers */}
        <Route path="/workers" element={<WorkersListPage />} />
        <Route path="/workers/:id" element={<WorkerDetailPage />} />
        
        {/* Documents */}
        <Route path="/documents">
          <Route path="pending" element={<PendingDocumentsPage />} />
          <Route path="review/:workerId" element={<DocumentReviewPage />} />
        </Route>
        
        {/* Clients */}
        <Route path="/clients" element={<ClientsListPage />} />
      </Route>

      {/* Not Found - debe ir al final */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};