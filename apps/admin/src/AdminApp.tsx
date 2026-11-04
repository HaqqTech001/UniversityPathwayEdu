import React from 'react';
import AdminPortalApp from '../../../src/admin/AdminPortalApp';

export default function AdminApp() {
  return <AdminPortalApp onNavigate={(path) => {
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  }} onLogout={() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('upec_staff_token');
      localStorage.removeItem('upec_staff_token');
      sessionStorage.removeItem('upec_admin_token');
      localStorage.removeItem('upec_admin_token');
      sessionStorage.removeItem('upec_ops_session');
      localStorage.removeItem('upec_ops_session');
      window.location.href = '/staff/login';
    }
  }} />;
}
