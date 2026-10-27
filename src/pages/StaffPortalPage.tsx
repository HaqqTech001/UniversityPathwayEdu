import React, { useEffect, useState } from 'react';
import AdminPortalApp from '../admin/AdminPortalApp';

const apiRoot = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');
export const getStaffToken = () => sessionStorage.getItem('upec_staff_token');

interface PageProps { onNavigate: (path: string) => void; }

export default function StaffPortalPage({ onNavigate }: PageProps) {
  const [token, setToken] = useState<string | null>(getStaffToken);
  const [checking, setChecking] = useState(Boolean(token));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) { setChecking(false); return; }
    const controller = new AbortController();
    setChecking(true);
    fetch(apiRoot + '/api/staff/me', { headers: { Authorization: 'Bearer ' + token }, signal: controller.signal })
      .then(async response => { if (!response.ok) throw Error('Your staff session has expired. Please sign in again.'); })
      .catch(err => {
        if (controller.signal.aborted) return;
        sessionStorage.removeItem('upec_staff_token');
        setToken(null);
        setError(err instanceof Error ? err.message : 'Unable to verify staff access.');
      })
      .finally(() => { if (!controller.signal.aborted) setChecking(false); });
    return () => controller.abort();
  }, [token]);

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch(apiRoot + '/api/staff/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json();
      if (!response.ok || !result.token) throw Error(result.error || 'Unable to sign in.');
      sessionStorage.setItem('upec_staff_token', result.token);
      setPassword('');
      setToken(result.token);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in.'); }
    finally { setBusy(false); }
  };

  if (checking) return <main className="min-h-screen grid place-items-center bg-[#F7F8FC] text-[#111A43]">Verifying staff access…</main>;
  if (!token) return <main className="min-h-screen grid place-items-center bg-[#F7F8FC] p-4">
    <form onSubmit={signIn} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl space-y-5">
      <h1 className="text-2xl font-extrabold text-[#111A43]">Staff sign in</h1>
      <p className="text-sm text-slate-600">University Pathway Educational Consult administration</p>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <label className="block text-sm font-semibold text-[#111A43]">Email<input required type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border p-3" /></label>
      <label className="block text-sm font-semibold text-[#111A43]">Password<input required type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border p-3" /></label>
      <button disabled={busy} className="w-full rounded-lg bg-[#C62839] p-3 font-bold text-white disabled:opacity-50">{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  </main>;
  return <AdminPortalApp onNavigate={onNavigate} />;
}
