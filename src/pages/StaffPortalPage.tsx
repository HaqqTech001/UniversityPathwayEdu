import React from 'react';
import AdminPortalApp from '../admin/AdminPortalApp';

interface PageProps {
  onNavigate: (path: string) => void;
}

export default function StaffPortalPage({ onNavigate }: PageProps) {
  return <AdminPortalApp onNavigate={onNavigate} />;
}
