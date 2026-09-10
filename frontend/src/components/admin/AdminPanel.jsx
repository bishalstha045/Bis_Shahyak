import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminVerification from './AdminVerification';
import AdminUsers from './AdminUsers';
import AdminReports from './AdminReports';
import AdminContent from './AdminContent';
import AdminActivity from './AdminActivity';
import AdminSettings from './AdminSettings';
import AdminAuthGate from './AdminAuthGate';

export default function AdminPanel({ auth, onExitToManufacturer }) {
  // Parse sub-route from URL pathname or hash e.g. /admin/verification or #admin/verification
  const getInitialSubRoute = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      if (path.includes('/admin/verification') || hash.includes('verification')) return 'verification';
      if (path.includes('/admin/users') || hash.includes('users')) return 'users';
      if (path.includes('/admin/reports') || hash.includes('reports')) return 'reports';
      if (path.includes('/admin/content') || hash.includes('content')) return 'content';
      if (path.includes('/admin/activity') || hash.includes('activity')) return 'activity';
      if (path.includes('/admin/settings') || hash.includes('settings')) return 'settings';
      if (path.includes('/admin/dashboard') || hash.includes('dashboard')) return 'dashboard';
    }
    return 'dashboard';
  };

  const [activeSubRoute, setActiveSubRoute] = useState(getInitialSubRoute);

  // Sync sub-route with browser URL history
  const handleSubRouteChange = (newSubRoute) => {
    setActiveSubRoute(newSubRoute);
    if (typeof window !== 'undefined') {
      const targetPath = `/admin/${newSubRoute}`;
      window.history.pushState({ subRoute: newSubRoute }, '', targetPath);
    }
  };

  // Listen to popstate for browser back/forward navigation within /admin
  useEffect(() => {
    const handlePopState = () => {
      setActiveSubRoute(getInitialSubRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const currentUser = auth?.user;
  const role = (currentUser?.role || '').toLowerCase();
  const isAdmin = Boolean(
    currentUser?.is_admin === true ||
    role === 'admin' ||
    role === 'administrator' ||
    role === 'director' ||
    role === 'officer'
  );

  // If user is not authenticated OR authenticated as normal user: render AdminAuthGate
  if (!currentUser || !isAdmin) {
    return (
      <AdminAuthGate
        auth={auth}
        onExitToManufacturer={onExitToManufacturer}
        onAdminAuthenticated={() => setActiveSubRoute('dashboard')}
      />
    );
  }

  return (
    <AdminLayout
      activeSubRoute={activeSubRoute}
      onSubRouteChange={handleSubRouteChange}
      onExitToManufacturer={onExitToManufacturer}
      onLogout={auth.logout}
      adminUser={currentUser}
    >
      {activeSubRoute === 'dashboard' && (
        <AdminDashboard onNavigate={handleSubRouteChange} />
      )}
      {activeSubRoute === 'verification' && (
        <AdminVerification />
      )}
      {activeSubRoute === 'users' && (
        <AdminUsers />
      )}
      {activeSubRoute === 'reports' && (
        <AdminReports />
      )}
      {activeSubRoute === 'content' && (
        <AdminContent />
      )}
      {activeSubRoute === 'activity' && (
        <AdminActivity />
      )}
      {activeSubRoute === 'settings' && (
        <AdminSettings />
      )}
    </AdminLayout>
  );
}
