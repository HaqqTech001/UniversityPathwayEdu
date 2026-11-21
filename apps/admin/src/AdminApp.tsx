import React, { useCallback, useEffect, useState } from 'react';
import AdminPortalApp from './admin/AdminPortalApp';

// Admin-owned sign-in and staff API client; no source imports from apps/ops.
// @ts-ignore -- login remains a small JSX component.
import StaffLogin from './auth/StaffLogin.jsx';
// @ts-ignore -- JavaScript API helper used by the admin authentication boundary.
import { clearStaffToken, getStaffToken, staffRequest } from './auth/api.js';
import './admin-login.css';

type StaffProfile = {
  role: string;
  permissions: string[];
  [key: string]: unknown;
};

function clearAdminSession() {
  clearStaffToken();
  for (const key of ['upec_staff_token', 'upec_admin_token', 'upec_ops_session']) {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  }
}

export default function AdminApp() {
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [checking, setChecking] = useState<boolean>(() => Boolean(getStaffToken()));

  const verifyStaffSession = useCallback(async () => {
    setChecking(true);
    try {
      const token = getStaffToken();
      if (!token) throw new Error('No staff session found.');

      // Validate the same token with the same staff endpoint used by Admin Desk.
      const result = await staffRequest('/me');
      if (!result?.role || !Array.isArray(result.permissions)) {
        throw new Error('The staff service returned an invalid profile.');
      }

      // Existing AdminPortalApp pages read this key. Keep it as an alias of
      // the verified Admin Desk token; do not create a second authentication flow.
      sessionStorage.setItem('upec_staff_token', token);
      setProfile(result as StaffProfile);
      return true;
    } catch {
      clearAdminSession();
      setProfile(null);
      return false;
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (getStaffToken()) {
      void verifyStaffSession();
    } else {
      setChecking(false);
    }
  }, [verifyStaffSession]);

  const handleLogout = () => {
    clearAdminSession();
    setProfile(null);
    setChecking(false);
    // Stay on the standalone admin origin and show its existing login again.
  };

  if (checking) {
    return (
      <main className="min-h-screen grid place-items-center bg-[#F7F8FC] text-[#111A43]">
        <p>Verifying staff access…</p>
      </main>
    );
  }

  if (!profile) {
    return <StaffLogin onSuccess={verifyStaffSession} logoSrc="/logo/pathway-footer.png" />;
  }

  return (
    <AdminPortalApp
      onNavigate={(path) => {
        if (typeof window === 'undefined') return;
        // These two actions intentionally leave the admin app for the public
        // student website. Authentication and admin navigation stay on :3100.
        const publicUrl = new URL(path, window.location.origin);
        publicUrl.port = '3000';
        window.location.assign(publicUrl.toString());
      }}
      onLogout={handleLogout}
      permissions={profile.permissions}
      role={profile.role}
    />
  );
}
