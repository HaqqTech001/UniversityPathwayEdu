import React from 'react';
import AdminPortalApp from '../../../src/admin/AdminPortalApp';

export default function AdminApp() {
  return <AdminPortalApp onNavigate={(path) => {
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  }} />;
}
