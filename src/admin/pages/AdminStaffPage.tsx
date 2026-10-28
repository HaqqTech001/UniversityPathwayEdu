import LiveStaffDirectory from '../components/LiveStaffDirectory';
import React, { useState } from 'react';
import {
  Users,
  Shield,
  UserPlus,
  UserCheck,
  Clock,
  Calendar,
  ChevronDown,
  Search,
  Filter,
  MoreVertical,
  Send,
  Lock,
  Mail,
  Smartphone,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Eye,
  Settings,
} from 'lucide-react';

interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  lastLogin: string;
  status: 'Active' | 'Inactive';
  avatar: string;
}

const mockStaff: StaffMember[] = [
  {
    id: 1,
    name: 'Dr. Ahmed Bello',
    email: 'ahmed.bello@pathway.edu.ng',
    role: 'Administrator',
    department: 'Management',
    lastLogin: '14 Jul 2025, 10:24 AM',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 2,
    name: 'Mrs. Aisha Mohammed',
    email: 'aisha.mohammed@pathway.edu.ng',
    role: 'Academic Staff',
    department: 'Academics',
    lastLogin: '14 Jul 2025, 09:15 AM',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 3,
    name: 'Mr. Yusuf Lawal',
    email: 'yusuf.lawal@pathway.edu.ng',
    role: 'CBT Officer',
    department: 'Examinations',
    lastLogin: '13 Jul 2025, 04:22 PM',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 4,
    name: 'Mrs. Fatimah Okafor',
    email: 'fatimah.okafor@pathway.edu.ng',
    role: 'Admissions Officer',
    department: 'Admissions',
    lastLogin: '13 Jul 2025, 02:18 PM',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 5,
    name: 'Mr. Ibrahim Musa',
    email: 'ibrahim.musa@pathway.edu.ng',
    role: 'Finance Officer',
    department: 'Finance',
    lastLogin: '12 Jul 2025, 11:30 AM',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 6,
    name: 'Mrs. Zainab Aliyu',
    email: 'zainab.aliyu@pathway.edu.ng',
    role: 'Hostel Officer',
    department: 'Student Affairs',
    lastLogin: '12 Jul 2025, 09:45 AM',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 7,
    name: 'Mr. Daniel Okafor',
    email: 'daniel.okafor@pathway.edu.ng',
    role: 'Support Staff',
    department: 'ICT Support',
    lastLogin: '11 Jul 2025, 05:21 PM',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 8,
    name: 'Mrs. Khadijah Bello',
    email: 'khadijah.bello@pathway.edu.ng',
    role: 'Academic Staff',
    department: 'Academics',
    lastLogin: '11 Jul 2025, 03:10 PM',
    status: 'Inactive',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80',
  },
];

export default function AdminStaffPage() {
  const [activeTab, setActiveTab] = useState('All Staff');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [searchFilter, setSearchFilter] = useState('');

  // Form states
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [department, setDepartment] = useState('');
  const [sendInvite, setSendInvite] = useState(true);

  // System Settings state
  const [allowRegistration, setAllowRegistration] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [inAppNotif, setInAppNotif] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30 minutes');
  const [passwordExpiry, setPasswordExpiry] = useState('90 days');
  const [loginLimit, setLoginLimit] = useState('5 attempts');

  const filteredStaff = mockStaff.filter((s) => {
    if (selectedRole !== 'All Roles' && s.role !== selectedRole) return false;
    if (selectedDept !== 'All Departments' && s.department !== selectedDept) return false;
    if (selectedStatus !== 'All Statuses' && s.status !== selectedStatus) return false;
    if (
      searchFilter &&
      !s.name.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !s.email.toLowerCase().includes(searchFilter.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Administrator':
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Administrator</span>;
      case 'Academic Staff':
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Academic Staff</span>;
      case 'CBT Officer':
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">CBT Officer</span>;
      case 'Admissions Officer':
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Admissions Officer</span>;
      case 'Finance Officer':
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Finance Officer</span>;
      case 'Hostel Officer':
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">Hostel Officer</span>;
      default:
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Support Staff</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111A43] tracking-tight">Staff &amp; Role Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage staff accounts, roles, permissions and system settings.</p>
        </div>
        <div className="flex items-center gap-2.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm text-xs">
          <Calendar size={15} className="text-[#111A43]" />
          <div>
            <p className="font-bold text-[#111A43]">2025/2026 Academic Session</p>
            <p className="text-[10px] text-slate-400">Current Session</p>
          </div>
          <ChevronDown size={14} className="text-slate-400 ml-1" />
        </div>
      </div>

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-1 min-[460px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">28</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Total Staff</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 12% <span className="font-normal text-slate-400">This Session</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#C62839] flex items-center justify-center text-white shrink-0">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">6</p>
            <p className="text-xs font-bold text-slate-700 mt-1">User Roles</p>
            <p className="text-[10px] text-slate-400 mt-0.5">— Active Roles</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0">
            <UserPlus size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">4</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Pending Invites</p>
            <p className="text-[10px] font-semibold text-rose-600 mt-0.5">↓ 20% <span className="font-normal text-slate-400">Awaiting Activation</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0">
            <UserCheck size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">92%</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Active Staff</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 6% <span className="font-normal text-slate-400">Account Activity</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">124</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Login Activities</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 18% <span className="font-normal text-slate-400">Last 30 Days</span></p>
          </div>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="border-b border-slate-200 bg-white px-3 rounded-t-2xl shadow-sm">
        <div className="flex items-center gap-6 overflow-x-auto text-xs font-semibold text-slate-500 no-scrollbar">
          {['All Staff', 'Roles & Permissions', 'Pending Invites', 'Access Logs', 'Settings'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3.5 whitespace-nowrap transition-colors relative ${
                  isActive ? 'text-[#C62839] font-bold' : 'hover:text-slate-800'
                }`}
              >
                {tab}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C62839] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab==='All Staff'?<LiveStaffDirectory />:<section className="rounded-2xl border bg-white p-5"><h2 className="font-bold text-[#111A43]">{activeTab}</h2><p className="mt-2 text-sm text-slate-600">This staff-management section is awaiting authorized backend actions. No account or permission changes are available here yet.</p></section>}
      {false&&<>
      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, role or department..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none"
          >
            <option value="All Roles">Role: All Roles</option>
            <option value="Administrator">Administrator</option>
            <option value="Academic Staff">Academic Staff</option>
            <option value="CBT Officer">CBT Officer</option>
            <option value="Admissions Officer">Admissions Officer</option>
            <option value="Finance Officer">Finance Officer</option>
            <option value="Hostel Officer">Hostel Officer</option>
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none"
          >
            <option value="All Departments">Department: All Departments</option>
            <option value="Management">Management</option>
            <option value="Academics">Academics</option>
            <option value="Examinations">Examinations</option>
            <option value="Admissions">Admissions</option>
            <option value="Finance">Finance</option>
            <option value="Student Affairs">Student Affairs</option>
            <option value="ICT Support">ICT Support</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none"
          >
            <option value="All Statuses">Status: All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#111A43] text-white rounded-xl hover:bg-[#1a275e]">
            <Filter size={13} />
            Filter
          </button>

          <button
            onClick={() => {
              setSelectedRole('All Roles');
              setSelectedDept('All Departments');
              setSelectedStatus('All Statuses');
              setSearchFilter('');
            }}
            className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Mid Section: Staff Table + Add New Staff Form */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Staff Table */}
        <div className="xl:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-3 w-8 text-center">#</th>
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-2">Role</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Last Login</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <span className="font-semibold text-[#111A43] whitespace-nowrap">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{s.email}</td>
                    <td className="py-3 px-2">{getRoleBadge(s.role)}</td>
                    <td className="py-3 px-3 text-slate-600">{s.department}</td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{s.lastLogin}</td>
                    <td className="py-3 px-2">
                      {s.status === 'Active' ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Inactive</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                        <MoreVertical size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <div className="p-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-700">1 - 8</span> of <span className="font-semibold text-slate-700">28</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                <ChevronLeft size={14} />
              </button>
              <button className="w-6 h-6 rounded-lg bg-[#111A43] text-white font-bold text-xs flex items-center justify-center">1</button>
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">2</button>
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">3</button>
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">4</button>
              <span className="text-slate-400">...</span>
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">4</button>
              <button className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <select className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white text-slate-600">
                <option>10 per page</option>
                <option>20 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Add New Staff Form */}
        <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <UserPlus size={16} className="text-[#111A43]" />
            <h3 className="text-sm font-bold text-[#111A43]">Add New Staff</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                placeholder="Enter email address"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Role</label>
              <select
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
              >
                <option value="">Select role</option>
                <option value="Administrator">Administrator</option>
                <option value="Academic Staff">Academic Staff</option>
                <option value="CBT Officer">CBT Officer</option>
                <option value="Admissions Officer">Admissions Officer</option>
                <option value="Finance Officer">Finance Officer</option>
                <option value="Hostel Officer">Hostel Officer</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
              >
                <option value="">Select department</option>
                <option value="Management">Management</option>
                <option value="Academics">Academics</option>
                <option value="Examinations">Examinations</option>
                <option value="Admissions">Admissions</option>
                <option value="Finance">Finance</option>
                <option value="Student Affairs">Student Affairs</option>
                <option value="ICT Support">ICT Support</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="font-semibold text-slate-700">Send Invite Email</span>
              <button
                type="button"
                onClick={() => setSendInvite(!sendInvite)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  sendInvite ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                    sendInvite ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button className="flex-1 py-2.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors">
                Cancel
              </button>
              <button className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold bg-[#C62839] hover:bg-[#b02232] text-white rounded-xl shadow-md transition-colors">
                <Send size={13} />
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: User Roles & Permissions + Recent Activity Log + System Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* User Roles & Permissions */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[#111A43]" />
              <h3 className="text-sm font-bold text-[#111A43]">User Roles &amp; Permissions</h3>
            </div>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">Manage Roles</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-2 px-1 w-5">#</th>
                  <th className="py-2 px-2">Role Name</th>
                  <th className="py-2 px-2">Description</th>
                  <th className="py-2 px-1 text-center">Users</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-1 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Administrator', desc: 'Full system access', users: 3 },
                  { name: 'Academic Staff', desc: 'Manage academic content', users: 8 },
                  { name: 'Admissions Officer', desc: 'Handle admissions', users: 4 },
                  { name: 'Finance Officer', desc: 'Manage payments & finance', users: 3 },
                  { name: 'CBT Officer', desc: 'Manage examinations', users: 2 },
                  { name: 'Hostel Officer', desc: 'Manage hostel & accommodation', users: 2 },
                ].map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2 px-1 text-slate-400 text-[11px]">{i + 1}</td>
                    <td className="py-2 px-2 font-semibold text-[#111A43] whitespace-nowrap">{r.name}</td>
                    <td className="py-2 px-2 text-slate-500 text-[11px]">{r.desc}</td>
                    <td className="py-2 px-1 text-center font-bold text-slate-700">{r.users}</td>
                    <td className="py-2 px-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                    </td>
                    <td className="py-2 px-1 text-center">
                      <button className="p-1 text-slate-400 hover:text-slate-600"><MoreVertical size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111A43]">Recent Activity Log</h3>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-2 px-1 w-5">#</th>
                  <th className="py-2 px-2">Activity</th>
                  <th className="py-2 px-2">User</th>
                  <th className="py-2 px-2">Date &amp; Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { act: 'Staff login', user: 'Dr. Ahmed Bello', time: '14 Jul 2025, 10:24 AM' },
                  { act: 'Notice created', user: 'Mrs. Aisha Mohammed', time: '14 Jul 2025, 09:18 AM' },
                  { act: 'Student record updated', user: 'Mr. Yusuf Lawal', time: '13 Jul 2025, 04:22 PM' },
                  { act: 'Payment verified', user: 'Mr. Ibrahim Musa', time: '13 Jul 2025, 02:15 PM' },
                  { act: 'CBT exam created', user: 'Mr. Yusuf Lawal', time: '12 Jul 2025, 11:30 AM' },
                  { act: 'Staff account deactivated', user: 'Admin User', time: '12 Jul 2025, 09:45 AM' },
                ].map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2 px-1 text-slate-400 text-[11px]">{i + 1}</td>
                    <td className="py-2 px-2 font-medium text-slate-700">{log.act}</td>
                    <td className="py-2 px-2 text-slate-600 whitespace-nowrap">{log.user}</td>
                    <td className="py-2 px-2 text-slate-400 whitespace-nowrap text-[11px]">{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Settings */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5">
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-[#111A43]" />
            <h3 className="text-sm font-bold text-[#111A43]">System Settings</h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* Allow Registration */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="pr-2">
                <p className="font-semibold text-slate-700">Allow Staff Registration</p>
                <p className="text-[10px] text-slate-400">Let staff create accounts (requires approval)</p>
              </div>
              <button
                type="button"
                onClick={() => setAllowRegistration(!allowRegistration)}
                className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                  allowRegistration ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                  allowRegistration ? 'left-4.5' : 'left-0.5'
                }`} />
              </button>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="pr-2">
                <p className="font-semibold text-slate-700">Email Notifications</p>
                <p className="text-[10px] text-slate-400">Send email notifications to staff</p>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotif(!emailNotif)}
                className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                  emailNotif ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                  emailNotif ? 'left-4.5' : 'left-0.5'
                }`} />
              </button>
            </div>

            {/* In-App Notifications */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="pr-2">
                <p className="font-semibold text-slate-700">In-App Notifications</p>
                <p className="text-[10px] text-slate-400">Enable in-app notifications</p>
              </div>
              <button
                type="button"
                onClick={() => setInAppNotif(!inAppNotif)}
                className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                  inAppNotif ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                  inAppNotif ? 'left-4.5' : 'left-0.5'
                }`} />
              </button>
            </div>

            {/* 2FA */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="pr-2">
                <p className="font-semibold text-slate-700">Two-Factor Authentication</p>
                <p className="text-[10px] text-slate-400">Require 2FA for admin accounts</p>
              </div>
              <button
                type="button"
                onClick={() => setTwoFactor(!twoFactor)}
                className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                  twoFactor ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                  twoFactor ? 'left-4.5' : 'left-0.5'
                }`} />
              </button>
            </div>

            {/* Session Timeout */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Session Timeout</span>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white text-slate-600"
              >
                <option>15 minutes</option>
                <option>30 minutes</option>
                <option>60 minutes</option>
              </select>
            </div>

            {/* Password Expiry */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Password Expiry</span>
              <select
                value={passwordExpiry}
                onChange={(e) => setPasswordExpiry(e.target.value)}
                className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white text-slate-600"
              >
                <option>30 days</option>
                <option>60 days</option>
                <option>90 days</option>
              </select>
            </div>

            {/* Login Attempt Limit */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Login Attempt Limit</span>
              <select
                value={loginLimit}
                onChange={(e) => setLoginLimit(e.target.value)}
                className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white text-slate-600"
              >
                <option>3 attempts</option>
                <option>5 attempts</option>
                <option>10 attempts</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      </>}
    </div>
  );
}
