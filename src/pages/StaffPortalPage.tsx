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
  // Frontend-only stage: do not expose administrative records or simulated approvals
  // until a real server-verified staff session and role checks are implemented.
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
    <main className="min-h-screen bg-[#f5f7fc] px-4 py-10 text-[#0b1a42] sm:px-6 lg:py-20">
      <div className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_70px_rgba(8,22,59,0.08)]">
        <div className="bg-[#08163b] px-7 py-8 text-white sm:px-10">
          <div className="mb-5 inline-flex rounded-xl bg-white/10 p-3 text-[#f0bb5b]"><ShieldCheck size={28} /></div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f0bb5b]">University Pathway Operations</p>
          <h1 className="mt-3 font-serif text-3xl font-bold">Staff & Administration</h1>
          <p className="mt-3 text-sm leading-6 text-slate-200">A dedicated administrative workspace is being prepared for authorised UPEC personnel.</p>
        </div>
        <div className="px-7 py-8 sm:px-10">
          <div role="status" className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <Lock size={19} className="mt-0.5 shrink-0" />
            <p>Staff sign-in is not available yet. Administrative records and approval actions will be enabled only after secure role-based authentication and a backend are configured.</p>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" onClick={() => onNavigate('/')} className="rounded-xl bg-[#08163b] px-5 py-3 text-sm font-bold text-white hover:bg-[#132a61]">Return to Website</button>
            <button type="button" onClick={() => onNavigate('/contact')} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-[#08163b] hover:bg-slate-50">Contact UPEC</button>
          </div>
        </div>
      </div>
    </main>
  );
}
