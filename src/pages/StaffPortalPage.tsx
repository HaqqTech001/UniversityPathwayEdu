import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Receipt,
  ClipboardCheck,
  MessageSquareText,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Check,
  X,
  FileCheck,
  GraduationCap,
  Calendar,
  Lock,
  LogIn,
  Eye,
  AlertCircle,
} from 'lucide-react';

interface PageProps {
  onNavigate: (path: string) => void;
}

interface StudentRecord {
  id: string;
  name: string;
  programme: string;
  phone: string;
  appliedDate: string;
  paymentStatus: 'Verified' | 'Pending Review';
  admissionStatus: 'Approved' | 'Under Review';
  regNo: string;
}

const mockStudents: StudentRecord[] = [
  {
    id: 'APP-2025-0842',
    name: 'Amina Bello',
    programme: 'JAMB (UTME) - Sciences',
    phone: '09133903600',
    appliedDate: 'Oct 10, 2024',
    paymentStatus: 'Verified',
    admissionStatus: 'Approved',
    regNo: 'UPEC/2025/0842',
  },
  {
    id: 'APP-2025-0843',
    name: 'Tunde Adebayo',
    programme: 'WAEC / NECO Remedial',
    phone: '08088387657',
    appliedDate: 'Oct 09, 2024',
    paymentStatus: 'Verified',
    admissionStatus: 'Approved',
    regNo: 'UPEC/2025/0843',
  },
  {
    id: 'APP-2025-0844',
    name: 'Fatima Yusuf',
    programme: 'JUPEB Direct Entry',
    phone: '09166664266',
    appliedDate: 'Oct 09, 2024',
    paymentStatus: 'Verified',
    admissionStatus: 'Approved',
    regNo: 'UPEC/2025/0844',
  },
  {
    id: 'APP-2025-0845',
    name: 'Ibrahim Olatunji',
    programme: 'JAMB (UTME) - Commercial',
    phone: '08123456789',
    appliedDate: 'Oct 08, 2024',
    paymentStatus: 'Pending Review',
    admissionStatus: 'Under Review',
    regNo: 'Pending Assignment',
  },
  {
    id: 'APP-2025-0846',
    name: 'Zainab Mohammed',
    programme: 'IELTS Academic Preparation',
    phone: '08098765432',
    appliedDate: 'Oct 08, 2024',
    paymentStatus: 'Pending Review',
    admissionStatus: 'Under Review',
    regNo: 'Pending Assignment',
  },
];

export default function StaffPortalPage({ onNavigate }: PageProps) {
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState(false);
  const [staffId, setStaffId] = useState('');
  const [staffPin, setStaffPin] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'applications' | 'payments' | 'timetable' | 'notices'>('applications');
  const [students, setStudents] = useState<StudentRecord[]>(mockStudents);
  const [searchFilter, setSearchFilter] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const handleVerifyStudent = (id: string) => {
    setStudents(
      students.map((st) => {
        if (st.id === id) {
          const generatedReg = `UPEC/2025/${Math.floor(1000 + Math.random() * 9000)}`;
          return {
            ...st,
            paymentStatus: 'Verified',
            admissionStatus: 'Approved',
            regNo: generatedReg,
          };
        }
        return st;
      })
    );
    setNotification(`Candidate ${id} approved & registration number generated.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredStudents = students.filter(
    (st) =>
      st.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      st.programme.toLowerCase().includes(searchFilter.toLowerCase()) ||
      st.id.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <main className="w-full bg-[#f8fafd] text-[#0b1a42] min-h-[85vh]">
      {/* =========================================================================
          STAFF TOP BAR
          ========================================================================= */}
      <div className="bg-[#08163b] text-white py-6 px-5 sm:px-8 border-b border-[#0f2150]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-900/40 border border-red-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck size={26} className="text-[#c62839]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#f0bb5b]">
                  ADMINISTRATION &amp; STAFF WORKSPACE
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-white/15 text-slate-200">
                  Officer Role
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-black text-white mt-0.5">
                University Pathway Operations Desk
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 p-1 rounded-xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setIsStaffLoggedIn(!isStaffLoggedIn)}
              className="px-3 py-1.5 rounded-lg bg-white text-[#0b1a42] font-bold shadow-sm"
            >
              {isStaffLoggedIn ? 'Lock Session (Staff ID)' : 'Sign In as Officer'}
            </button>
          </div>
        </div>
      </div>

      {notification && (
        <div className="max-w-7xl mx-auto px-5 sm:px-8 mt-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 1: SIGN IN VIEW IF NOT LOGGED IN
          ========================================================================= */}
      {!isStaffLoggedIn ? (
        <section className="max-w-md mx-auto px-5 py-16">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-[#0b1a42]">
              <Lock size={26} />
            </div>
            <h2 className="font-serif text-xl font-bold text-[#0b1a42]">Officer Authentication</h2>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Enter your assigned staff credentials to manage applicant queues, verify bank transfers, and update schedules.
            </p>

            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 text-left">
                <AlertCircle size={15} className="shrink-0 text-red-600" />
                <span>{authError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setAuthError(null);
                if (staffId.trim().toUpperCase().startsWith('STAFF') || staffId.trim() === 'admin' || staffPin.length >= 4) {
                  setIsStaffLoggedIn(true);
                } else {
                  setAuthError('Invalid staff authorization ID or security key. Authorized staff only.');
                }
              }}
              className="space-y-4 text-left"
            >
              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">Staff Authorization ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STAFF-ILR-04"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">Access PIN / Passcode</label>
                <input
                  type="password"
                  required
                  placeholder="Officer security code"
                  value={staffPin}
                  onChange={(e) => setStaffPin(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0b1a42] hover:bg-[#c62839] text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                Access Staff Workspace
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setStaffId('STAFF-ILR-04');
                  setStaffPin('upec2025');
                  setIsStaffLoggedIn(true);
                }}
                className="text-[11px] text-[#c62839] hover:underline font-bold"
              >
                Sign in with Authorised Desk Demo Profile
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* =========================================================================
            VIEW 2: STAFF DASHBOARD
            ========================================================================= */
        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-8 space-y-6">
          {/* Operations Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Candidates Enrolled</span>
              <p className="text-3xl font-serif font-black text-[#0b1a42] mt-2">148</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">2025/2026 Academic Session</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bank Transfers Verified</span>
              <p className="text-3xl font-serif font-black text-[#0b1a42] mt-2">141</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">₦15,000 standard registration fee</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Officer Review</span>
              <p className="text-3xl font-serif font-black text-[#c62839] mt-2">2</p>
              <p className="text-[11px] text-[#c62839] font-semibold mt-1">Awaiting bank narration match</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active CBT Mock Batches</span>
              <p className="text-3xl font-serif font-black text-[#0b1a42] mt-2">4</p>
              <p className="text-[11px] text-blue-600 font-semibold mt-1">Saturday Ilorin CBT Lab</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            {[
              { id: 'applications', label: 'Admissions & Candidates Queue' },
              { id: 'payments', label: 'Bank Transfer Verification Desk' },
              { id: 'timetable', label: 'Center Cohort Management' },
              { id: 'notices', label: 'Publish Notices' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#0b1a42] text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: APPLICATIONS & CANDIDATES QUEUE */}
          {activeTab === 'applications' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#0b1a42]">
                    Candidate Admissions &amp; Enrollment Queue
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review candidate biodata, match payments, and issue official matriculation numbers.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search candidate name or ID..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                      <th className="py-3 px-4 font-bold">App ID</th>
                      <th className="py-3 px-4 font-bold">Student Name</th>
                      <th className="py-3 px-4 font-bold">Programme Track</th>
                      <th className="py-3 px-4 font-bold">Phone Number</th>
                      <th className="py-3 px-4 font-bold">Payment</th>
                      <th className="py-3 px-4 font-bold">Reg Number</th>
                      <th className="py-3 px-4 font-bold text-right">Officer Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{st.id}</td>
                        <td className="py-3.5 px-4 font-bold text-[#0b1a42]">{st.name}</td>
                        <td className="py-3.5 px-4 text-slate-600">{st.programme}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">{st.phone}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              st.paymentStatus === 'Verified'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {st.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold">
                          {st.regNo === 'Pending Assignment' ? (
                            <span className="text-slate-400 italic">Pending</span>
                          ) : (
                            <span className="text-[#0b1a42] font-bold">{st.regNo}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {st.admissionStatus === 'Approved' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                              <CheckCircle2 size={13} /> Active
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleVerifyStudent(st.id)}
                              className="px-3 py-1.5 rounded-lg bg-[#c62839] hover:bg-[#b01f30] text-white text-[11px] font-bold transition-colors shadow-xs"
                            >
                              Approve &amp; Assign Reg
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: BANK TRANSFER DESK */}
          {activeTab === 'payments' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4 animate-in fade-in">
              <h3 className="font-serif text-xl font-bold text-[#0b1a42]">
                Bank Transfer Narrative Matching Desk
              </h3>
              <p className="text-xs text-slate-500">
                Official institution account reconciliation: Match student teller slips and transfer receipts against bank alert records.
              </p>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <p className="font-bold text-[#0b1a42]">Official Registration Account</p>
                    <p className="text-slate-500">Moniepoint Microfinance Bank • Account Name: University Pathway Educational Consult</p>
                  </div>
                  <span className="px-3 py-1 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                    Live Feed Mock
                  </span>
                </div>
                <p className="text-slate-600">
                  Standard registration fee: <strong>₦15,000.00</strong> per applicant. All candidates who complete the 4-step wizard receive unique transaction references for reconciliation.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: COHORT TIMETABLE */}
          {activeTab === 'timetable' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4 animate-in fade-in">
              <h3 className="font-serif text-xl font-bold text-[#0b1a42]">
                Center Batch &amp; Room Allocation
              </h3>
              <p className="text-xs text-slate-500">
                23, Olaiya Street, Sawmill Garage Center classroom capacities and lecture roster.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <p className="font-bold text-[#0b1a42]">Hall 1: UTME Sciences</p>
                  <p className="text-slate-500 mt-1">Capacity: 45 Students • Morning Batch</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <p className="font-bold text-[#0b1a42]">Hall 2: O’Level &amp; Remedial</p>
                  <p className="text-slate-500 mt-1">Capacity: 35 Students • Full Time</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <p className="font-bold text-[#0b1a42]">Lab A: Computerized CBT Lab</p>
                  <p className="text-slate-500 mt-1">Capacity: 30 Workstations • Mock Drills</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PUBLISH NOTICES */}
          {activeTab === 'notices' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4 animate-in fade-in max-w-2xl">
              <h3 className="font-serif text-xl font-bold text-[#0b1a42]">
                Post Notice to Student Dashboards
              </h3>
              <p className="text-xs text-slate-500">
                Published announcements will immediately reflect on registered student portal dashboards.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setNotification('Official notice published to all student dashboards.');
                  setTimeout(() => setNotification(null), 3500);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1">Notice Headline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schedule for Biometric Capture"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1">Notice Content</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Enter full notice text for candidates..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Publish Announcement
                </button>
              </form>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
