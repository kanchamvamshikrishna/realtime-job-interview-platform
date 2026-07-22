import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRoute } from './components/RoleRoute';
import { useAuthBootstrap } from './features/auth/useAuthBootstrap';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { JobListPage } from './pages/JobListPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { JobFormPage } from './pages/JobFormPage';
import { MyJobsPage } from './pages/MyJobsPage';
import { ApplicantsPage } from './pages/ApplicantsPage';
import { MyApplicationsPage } from './pages/MyApplicationsPage';
import { ChatPage } from './pages/ChatPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { Spinner } from './components/Spinner';

function App() {
  const { isBootstrapping } = useAuthBootstrap();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route path="/jobs" element={<JobListPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:otherUserId" element={<ChatPage />} />

          <Route element={<RoleRoute roles={['candidate']} />}>
            <Route path="/my-applications" element={<MyApplicationsPage />} />
            <Route path="/dashboard/candidate" element={<CandidateDashboard />} />
          </Route>

          <Route element={<RoleRoute roles={['recruiter', 'admin']} />}>
            <Route path="/my-jobs" element={<MyJobsPage />} />
            <Route path="/my-jobs/new" element={<JobFormPage />} />
            <Route path="/jobs/:id/edit" element={<JobFormPage />} />
            <Route path="/jobs/:jobId/applicants" element={<ApplicantsPage />} />
            <Route path="/dashboard/recruiter" element={<RecruiterDashboard />} />
          </Route>

          <Route element={<RoleRoute roles={['admin']} />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
