import React from 'react';
import StaffPortalPage from '../../../src/pages/StaffPortalPage';

export default function AdminApp() {
  return <StaffPortalPage onNavigate={(path) => {
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  }} />;
}

