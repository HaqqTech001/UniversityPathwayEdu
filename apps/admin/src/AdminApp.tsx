import React, { useEffect, useState } from 'react';
import AdminPortalApp from '../../../src/admin/AdminPortalApp';

const getStaffToken = () => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('upec_staff_token') || localStorage.getItem('upec_staff_token') ||
         sessionStorage.getItem('upec_admin_token') || localStorage.getItem('upec_admin_token');
};

const getLoginUrl = () => {
  if (typeof window === 'undefined') return '/staff/login';
  const { protocol, hostname } = window.location;
  // Main website runs on port 3000, standalone admin runs on port 3100
  return `${protocol}//${hostname}:3000/staff/login`;
};

export default function AdminApp() {
  const [hasToken, setHasToken] = useState<boolean>(() => Boolean(getStaffToken()));

  useEffect(() => {
    const token = getStaffToken();
    if (!token) {
      window.location.href = getLoginUrl();
    }
  }, []);

  if (!hasToken) {
    return (
      <main className="min-h-screen grid place-items-center bg-[#F7F8FC] text-[#111A43]">
        <p>Redirecting to staff sign in…</p>
      </main>
    );
  }

  return (
    <AdminPortalApp
      onNavigate={(path) => {
        if (typeof window !== 'undefined') {
          window.location.href = path;
        }
      }}
      onLogout={() => {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('upec_staff_token');
          localStorage.removeItem('upec_staff_token');
          sessionStorage.removeItem('upec_admin_token');
          localStorage.removeItem('upec_admin_token');
          sessionStorage.removeItem('upec_ops_session');
          localStorage.removeItem('upec_ops_session');
          setHasToken(false);
          window.location.href = getLoginUrl();
        }
      }}
    />
  );
}
