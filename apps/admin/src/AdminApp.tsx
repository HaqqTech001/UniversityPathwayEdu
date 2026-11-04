import React, { useCallback, useEffect, useState } from 'react';
import AdminPortalApp from '../../../src/admin/AdminPortalApp';

// Reuse the existing Admin Desk sign-in UI and its existing staff-auth API.
// @ts-ignore -- this shared component is maintained as JavaScript in apps/ops.
import StaffLogin from '../../../apps/ops/src/StaffLogin.jsx';
// @ts-ignore -- shared JavaScript auth client used by the existing Admin Desk.
import { clearOpsToken, getOpsToken, opsRequest } from '../../../apps/ops/src/api.js';
import '../../../apps/ops/src/style.css';

type StaffProfile = {
  role: string;
  permissions: string[];
  [key: string]: unknown;
};

function clearAdminSession() {
  clearOpsToken();
  for (const key of ['upec_staff_token', 'upec_admin_token', 'upec_ops_session']) {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  }
}

export default function AdminApp() {
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [checking, setChecking] = useState<boolean>(() => Boolean(getOpsToken()));

  const verifyStaffSession = useCallback(async () => {
    setChecking(true);
    try {
      const token = getOpsToken();
      if (!token) throw new Error('No staff session found.');

      // Validate the same token with the same staff endpoint used by Admin Desk.
      const result = await opsRequest('/me');
      if (!result?.role || !Array.isArray(result.permissions)) {
        throw new Error('The staff service returned an invalid profile.');
      }

      // Existing AdminPortalApp pages read this key. Keep it as an alias of
      // the verified Admin Desk token; do not create a second authentication flow.
      sessionStorage.setItem('upec_staff_token', token);
      setProfile(result as StaffProfile);
    } catch {
      clearAdminSession();
      setProfile(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (getOpsToken()) {
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
    return <StaffLogin onSuccess={verifyStaffSession} />;
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
    />
  );
}
