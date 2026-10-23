import {notifyPortal} from '../../components/PortalToasts';
import React, { useState } from 'react';
import {
  Settings,
  Lock,
  Bell,
  ShieldCheck,
  User,
  Smartphone,
  Eye,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Download,
  Key,
  Globe,
  Check,
  X,
} from 'lucide-react';
import { StudentUser } from '../../context/AuthContext';

interface SettingsTabViewProps {
  currentUser: StudentUser;
  onNavigateTab: (tab: string) => void;
  onSignOut: () => void;
}

export default function SettingsTabView({
  currentUser,
  onNavigateTab,
  onSignOut,
}: SettingsTabViewProps) {
  // Toast banner simulation matching mockup
  const [showToast, setShowToast] = useState(false);

  // Password state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);

  // Notification toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [portalAlerts, setPortalAlerts] = useState(true);
  const [marketingAlerts, setMarketingAlerts] = useState(false);

  // Privacy toggles
  const [shareGuardian, setShareGuardian] = useState(true);
  const [classmateVisible, setClassmateVisible] = useState(false);

  // Contact prefs
  const [contactChannel, setContactChannel] = useState<'email' | 'phone' | 'whatsapp'>('whatsapp');
  const [contactWindow, setContactWindow] = useState<'morning' | 'afternoon'>('afternoon');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 6) {
      setPasswordNotice('Password must be at least 6 characters long.');
      return;
    }
    if (newPass !== confirmPass) {
      setPasswordNotice('New password and confirmation do not match.');
      return;
    }
    setPasswordNotice('Password changes are unavailable here until the secure account endpoint is connected. No password was changed.');
    notifyPortal('warning','Password was not changed. Secure password updates are not yet available.');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setPasswordNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner (Faithful to Mockup) */}
      {showToast && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between shadow-xs text-xs text-emerald-900">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Check size={14} strokeWidth={3} />
            </span>
            <div>
              <strong className="font-bold block">Settings preferences active</strong>
              <span className="text-emerald-700">Your profile preferences and security configurations are up to date.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowToast(false)}
            className="text-emerald-600 hover:text-emerald-800 p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl border border-[#dce5f0] p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-[#111A43] tracking-tight">
            Account Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your account security, passwords, notification preferences and device sessions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Account Security High</span>
          </span>
        </div>
      </div>

      {/* Main Grid: 2x3 Grid of Settings Cards + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* LEFT COLUMN: 2x3 Settings Grid */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Account Particulars */}
            <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <User size={18} className="text-[#c62839]" />
                  <h2 className="text-sm font-extrabold text-[#111A43]">
                    Account Particulars
                  </h2>
                </div>
                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Full Name</span>
                    <strong className="text-[#111A43] block mt-0.5">{currentUser.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Student ID / Reference</span>
                    <strong className="text-[#111A43] font-mono block mt-0.5">
                      {currentUser.regNumber || currentUser.application?.referenceNumber || 'UPEC/2026/0148'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Linked Email</span>
                    <strong className="text-[#111A43] block mt-0.5">{currentUser.email}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Mobile Phone</span>
                    <strong className="text-[#111A43] block mt-0.5">{currentUser.phone || '+234 812 345 6789'}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onNavigateTab('profile')}
                  className="text-xs font-bold text-[#c62839] hover:underline cursor-pointer"
                >
                  Edit Profile Particulars →
                </button>
              </div>
            </div>

            {/* Card 2: Password & Security */}
            <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Lock size={18} className="text-[#2456a0]" />
                <h2 className="text-sm font-extrabold text-[#111A43]">
                  Password &amp; Security
                </h2>
              </div>

              {passwordNotice && (
                <div className="mt-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px]">
                  {passwordNotice}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#111A43]"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#111A43]"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#111A43]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#111A43] hover:bg-[#1c3275] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Update Password
                </button>
              </form>
            </div>

            {/* Card 3: Notification Preferences */}
            <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Bell size={18} className="text-[#c62839]" />
                <h2 className="text-sm font-extrabold text-[#111A43]">
                  Notification Preferences
                </h2>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <strong className="block text-[#111A43]">Email Alerts</strong>
                    <span className="text-[11px] text-slate-400">Application and fee updates</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 text-[#c62839] rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <strong className="block text-[#111A43]">SMS Notifications</strong>
                    <span className="text-[11px] text-slate-400">Time-sensitive examination alerts</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4 text-[#c62839] rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <strong className="block text-[#111A43]">Portal Notice Board Alerts</strong>
                    <span className="text-[11px] text-slate-400">Timetable &amp; venue updates</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={portalAlerts}
                    onChange={(e) => setPortalAlerts(e.target.checked)}
                    className="w-4 h-4 text-[#c62839] rounded"
                  />
                </label>
              </div>
            </div>

            {/* Card 4: Privacy Settings */}
            <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <ShieldCheck size={18} className="text-emerald-700" />
                <h2 className="text-sm font-extrabold text-[#111A43]">
                  Privacy &amp; Data Sharing
                </h2>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <strong className="block text-[#111A43]">Share Scores with Guardian</strong>
                    <span className="text-[11px] text-slate-400">Weekly CBT practice performance</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={shareGuardian}
                    onChange={(e) => setShareGuardian(e.target.checked)}
                    className="w-4 h-4 text-[#c62839] rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <strong className="block text-[#111A43]">Profile Visibility to Cohort</strong>
                    <span className="text-[11px] text-slate-400">Visible in class study groups</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={classmateVisible}
                    onChange={(e) => setClassmateVisible(e.target.checked)}
                    className="w-4 h-4 text-[#c62839] rounded"
                  />
                </label>
              </div>
            </div>

            {/* Card 5: Contact Preferences */}
            <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Smartphone size={18} className="text-[#2456a0]" />
                <h2 className="text-sm font-extrabold text-[#111A43]">
                  Contact Preferences
                </h2>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block mb-1">Preferred Channel</span>
                  <div className="grid grid-cols-3 gap-2">
                    {['whatsapp', 'email', 'phone'].map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setContactChannel(ch as any)}
                        className={`py-1.5 rounded-lg font-bold capitalize transition-colors ${
                          contactChannel === ch ? 'bg-[#111A43] text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block mb-1">Best Contact Window</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'morning', label: 'Morning (9am–12pm)' },
                      { id: 'afternoon', label: 'Afternoon (12pm–5pm)' },
                    ].map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setContactWindow(w.id as any)}
                        className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition-colors ${
                          contactWindow === w.id ? 'bg-[#111A43] text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 6: Session & Device Settings */}
            <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Globe size={18} className="text-[#c62839]" />
                <h2 className="text-sm font-extrabold text-[#111A43]">
                  Active Session &amp; Devices
                </h2>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <strong className="text-[#111A43]">Chrome Browser</strong>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                      Current Device
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Lagos, Nigeria · Last authenticated today
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => notifyPortal('warning','Session revocation is not yet available. No sessions were changed.')}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#111A43] text-xs font-bold transition-colors cursor-pointer"
                >
                  Sign Out Other Devices
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Actions & Security Recommendations */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
            <h3 className="text-sm font-extrabold text-[#111A43] pb-3 border-b border-slate-100">
              Quick Actions
            </h3>
            <div className="mt-4 space-y-2.5 text-xs">
              <button
                type="button"
                onClick={() => notifyPortal('warning','Student data export is not yet connected. Nothing was downloaded.')}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-left font-bold text-[#111A43] flex items-center justify-between cursor-pointer"
              >
                <span>Download Account Data (PDF)</span>
                <Download size={14} className="text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => {window.location.reload();}}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-left font-bold text-[#111A43] flex items-center justify-between cursor-pointer"
              >
                <span>Clear Local Cache</span>
                <Settings size={14} className="text-slate-400" />
              </button>

              <button
                type="button"
                onClick={onSignOut}
                className="w-full p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-left font-bold text-[#c62839] flex items-center justify-between cursor-pointer border border-red-200"
              >
                <span>Sign Out of Portal</span>
                <LogOut size={14} className="text-[#c62839]" />
              </button>
            </div>
          </div>

          {/* Security Checklist */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck size={18} className="text-emerald-700" />
              <h3 className="text-sm font-extrabold text-[#111A43]">
                Security Checklist
              </h3>
            </div>
            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 size={15} className="text-emerald-600" />
                <span>Strong password configured</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 size={15} className="text-emerald-600" />
                <span>Primary email address verified</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 size={15} className="text-emerald-600" />
                <span>Guardian contact linked</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
