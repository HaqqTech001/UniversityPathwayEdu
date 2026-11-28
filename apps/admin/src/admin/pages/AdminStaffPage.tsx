import React from 'react';
import { ShieldCheck, Users, UserPlus, ClipboardList, Settings } from 'lucide-react';
import LiveStaffDirectory from '../components/LiveStaffDirectory';

export default function AdminStaffPage() {
  const areas = [
    { title: 'Staff directory', description: 'View authenticated staff accounts, names, emails, roles and assigned permissions.', icon: Users, available: true },
    { title: 'Roles & permissions', description: 'Role changes and permission editing are not yet exposed by the staff API.', icon: ShieldCheck, available: false },
    { title: 'Pending invitations', description: 'Staff invitation creation and acceptance tracking are not yet available.', icon: UserPlus, available: false },
    { title: 'Access logs', description: 'A staff login and audit-history endpoint is not currently available.', icon: ClipboardList, available: false },
    { title: 'Security settings', description: 'Session, password and two-factor policies are controlled outside this Admin module.', icon: Settings, available: false },
  ];
  return <div className="min-w-0 space-y-5">
    <header><h1 className="text-xl font-extrabold tracking-tight text-[#111A43] sm:text-2xl">Staff &amp; Role Management</h1><p className="mt-1 text-xs text-slate-500">Manage staff visibility and review the capabilities currently supported by the staff backend.</p></header>
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {areas.map(({title,description,icon:Icon,available})=><article key={title} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F7F8FC] text-[#111A43]"><Icon size={18}/></span><h2 className="text-sm font-bold text-[#111A43]">{title}</h2></div><p className="mt-3 text-xs leading-relaxed text-slate-600">{description}</p><p className={`mt-3 text-[10px] font-bold ${available?'text-emerald-700':'text-amber-700'}`}>{available?'LIVE':'NOT IMPLEMENTED'}</p></article>)}
    </section>
    <LiveStaffDirectory/>
  </div>;
}
