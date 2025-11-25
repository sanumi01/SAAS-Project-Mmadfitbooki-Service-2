import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { AppView, type AppViewType } from './constants';
const ChatWidget = React.lazy(() => import('./components/ChatWidget').then(m => ({ default: m.ChatWidget })));
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { Toast } from './components/common/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Spinner } from './components/common/Spinner';
import * as authService from './services/authService';
import type { User } from './types';

// Keep lazy list small to reduce surface for errors
const BookingView = lazy(() => import('./views/BookingView').then(m => ({ default: m.BookingView })));
const CustomerDashboardView = lazy(() => import('./views/CustomerDashboardView').then(m => ({ default: m.CustomerDashboardView })));
const LoginView = lazy(() => import('./views/LoginView').then(m => ({ default: m.LoginView })));
const ManagementView = lazy(() => import('./views/AdminView').then(m => ({ default: m.ManagementView })));
const StaffDashboardView = lazy(() => import('./views/StaffDashboardView').then(m => ({ default: m.StaffDashboardView })));

const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(n => (
        <Toast key={n.id} message={n.message} type={n.type} onClose={() => removeNotification(n.id)} />
      ))}
    </div>
  );
};

const getDefaultView = (user: User | null): AppViewType => {
  if (!user) return AppView.BOOKING;
  switch (user.role) {
    case 'CUSTOMER': return AppView.CUSTOMER_DASHBOARD;
    case 'STAFF': return AppView.STAFF_DASHBOARD;
    case 'ADMIN': return AppView.MANAGEMENT;
    default: return AppView.BOOKING;
  }
};

const AppInner: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<AppViewType>(() => getDefaultView(authService.getCurrentUser()));

  useEffect(() => {
    if (!isLoading) {
      setCurrentView(getDefaultView(currentUser ?? null));
    }
     
  }, [currentUser, isLoading]);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-background-dark">
        <Spinner size="16" />
      </div>
    );
  }

  const renderView = () => {
    if (!currentUser) {
      if (currentView === AppView.LOGIN) return (
        <Suspense fallback={<Spinner size="16" />}>
          <LoginView />
        </Suspense>
      );
      return (
        <Suspense fallback={<Spinner size="16" />}>
          <BookingView setView={setCurrentView} />
        </Suspense>
      );
    }

    // Logged-in customer
    if (currentUser.role === 'CUSTOMER') {
      return (
        <Suspense fallback={<Spinner size="16" />}>
          <CustomerDashboardView setView={setCurrentView} />
        </Suspense>
      );
    }

    // Staff dashboard
    if (currentUser.role === 'STAFF') {
      return (
        <Suspense fallback={<Spinner size="16" />}>
          <StaffDashboardView setView={setCurrentView} />
        </Suspense>
      );
    }

    // Admin/management
    if (currentUser.role === 'ADMIN' || currentView === AppView.MANAGEMENT) {
      return (
        <Suspense fallback={<Spinner size="16" />}>
          <ManagementView />
        </Suspense>
      );
    }

    // Fallback to booking for other roles
    return (
      <Suspense fallback={<Spinner size="16" />}>
        <BookingView setView={setCurrentView} />
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen bg-background-dark text-text-primary font-sans">
      <Header currentView={currentView} setView={setCurrentView} />
      <main className="container mx-auto px-4 py-8">
        {renderView()}
      </main>
      <footer className="text-center py-4 border-t border-border-dark mt-8">
            <p className="text-text-primary/80 text-sm">&copy; {new Date().getFullYear()} MMAD FitBooki. All rights reserved.</p>
      </footer>
      <React.Suspense fallback={null}>
        <ChatWidget />
      </React.Suspense>
      <ToastContainer />
    </div>
  );
};

const App: React.FC = () => (
  <NotificationProvider>
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  </NotificationProvider>
);

export default App;