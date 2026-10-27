import React, { useEffect, useState } from 'react';
import ReceiptReviewPanel from '../components/ReceiptReviewPanel';
import FeeRateManager from '../components/FeeRateManager';
import InvoiceManager from '../components/InvoiceManager';
import RegistrationInvoiceManager from '../components/RegistrationInvoiceManager';
import {
  CreditCard,
  DollarSign,
  Receipt,
  AlertCircle,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  FileText,
  MoreVertical,
  MoreHorizontal,
  Edit2,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';

interface Transaction {
  id: number;
  name: string;
  appId: string;
  programme: 'IJMB' | 'JAMB' | 'WAEC' | '—';
  paymentType: 'Registration Fee' | 'Lesson Fee' | 'Hostel Fee' | 'Exam Fee' | 'Other Fee';
  amount: string;
  date: string;
  status: 'Paid' | 'Pending' | 'Failed';
  proofValid: boolean;
  avatar: string;
}


export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState('Transactions');
  const [feeTab, setFeeTab] = useState('Registration Revenue (unavailable)');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedProgramme, setSelectedProgramme] = useState('All Programmes');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [searchFilter, setSearchFilter] = useState('');

  const [summary,setSummary]=useState<{invoiceCount:number;billedNgn:number;paidNgn:number;outstandingNgn:number;unpaid:number;partial:number;settled:number}|null>(null);
  const [summaryError,setSummaryError]=useState('');
  useEffect(()=>{
    const controller=new AbortController();
    const token=sessionStorage.getItem('upec_staff_token');
    if(!token)return;
    fetch((import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'')+'/api/staff/finance/summary',{headers:{Authorization:'Bearer '+token},signal:controller.signal})
    .then(async res=>{const data=await res.json();if(!res.ok)throw new Error(data.error||'Could not load summary');return data;})
    .then(data=>{if(!controller.signal.aborted)setSummary(data);})
    .catch(err=>{if(!controller.signal.aborted)setSummaryError(err instanceof Error?err.message:'Summary unavailable');});
    return()=>controller.abort();
  },[]);
  const money=(value:number)=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(value);
  const [transactions,setTransactions]=useState<Transaction[]>([]);
  const [ledgerError,setLedgerError]=useState('');
  const [ledgerLoading,setLedgerLoading]=useState(true);
  useEffect(()=>{
    const controller=new AbortController();
    const token=sessionStorage.getItem('upec_staff_token');
    if(!token){setLedgerError('Staff login required.');setLedgerLoading(false);return;}
    fetch((import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'')+'/api/staff/finance/payment-ledger',{headers:{Authorization:'Bearer '+token},signal:controller.signal})
      .then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error||'Unable to load payments.');return data;})
      .then(data=>{if(!controller.signal.aborted)setTransactions((data.entries||[]).map((entry:{id:string;type:string;amount_ngn:number;recorded_at:string;invoice?:{programme_code?:string}},index:number)=>({
        id:index+1,name:'Verified payment',appId:entry.id,
        programme:(entry.invoice?.programme_code||'—') as Transaction['programme'],
        paymentType:entry.type==='registration'?'Registration Fee':'Lesson Fee',
        amount:new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN'}).format(entry.amount_ngn),
        date:new Date(entry.recorded_at).toLocaleDateString('en-NG'),status:'Paid',proofValid:false,avatar:''
      })));})
      .catch(error=>{if(!controller.signal.aborted)setLedgerError(error instanceof Error?error.message:'Unable to load payments.');})
      .finally(()=>{if(!controller.signal.aborted)setLedgerLoading(false);});
    return()=>controller.abort();
  },[]);
  const filtered = transactions.filter((t) => {
    if (selectedType !== 'All Types' && t.paymentType !== selectedType) return false;
    if (selectedProgramme !== 'All Programmes' && t.programme !== selectedProgramme) return false;
    if (selectedStatus !== 'All Status' && t.status !== selectedStatus) return false;
    if (
      searchFilter &&
      !t.name.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !t.appId.toLowerCase().includes(searchFilter.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getPaymentTypeBadge = (type: Transaction['paymentType']) => {
    switch (type) {
      case 'Registration Fee':
        return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">Registration Fee</span>;
      case 'Lesson Fee':
        return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Lesson Fee</span>;
      case 'Hostel Fee':
        return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Hostel Fee</span>;
      case 'Exam Fee':
        return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">Exam Fee</span>;
      default:
        return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Other Fee</span>;
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'Paid':
        return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Paid</span>;
      case 'Pending':
        return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
      case 'Failed':
        return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Failed</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111A43] tracking-tight">Finance &amp; Payments</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all payments, fees, invoices, and financial records.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm text-xs">
            <Calendar size={15} className="text-[#111A43]" />
            <div>
              <p className="font-bold text-[#111A43]">2025/2026 Academic Session</p>
              <p className="text-[10px] text-slate-400">Current Session</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 ml-1" />
          </div>
          <button className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#C62839] hover:bg-[#b02232] text-white rounded-xl shadow-md transition-all">
            <Plus size={15} />
            Record Payment &gt;
          </button>
        </div>
      </div>

      {summaryError&&<p role="alert" className="text-sm text-rose-700">{summaryError}</p>}
      <p className="text-xs text-slate-500">Summary figures cover monthly lesson invoices only, across all available billing months.</p>
      <InvoiceManager />
      <RegistrationInvoiceManager />
      <FeeRateManager />
      <ReceiptReviewPanel />
      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-lg font-black text-[#111A43] leading-none">{summary?money(summary.billedNgn):'—'}</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Monthly Fees Billed</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">Monthly invoices</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
            <Receipt size={20} />
          </div>
          <div>
            <p className="text-lg font-black text-[#111A43] leading-none">—</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Registration Fees</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">Not included in monthly summary</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-lg font-black text-[#111A43] leading-none">{summary?money(summary.paidNgn):'—'}</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Monthly Fees Received</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">Recorded monthly payments</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-lg font-black text-[#111A43] leading-none">{summary?money(summary.outstandingNgn):'—'}</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Monthly Fees Outstanding</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">Monthly invoice balances</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-rose-600 flex items-center justify-center text-white shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">{summary?summary.unpaid+summary.partial:'—'}</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Unpaid / Partial Invoices</p>
            <p className="text-[10px] font-semibold text-rose-600 mt-0.5">Monthly invoice statuses</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">{summary&&summary.billedNgn>0?Math.round(summary.paidNgn/summary.billedNgn*100)+'%':'—'}</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Monthly Fee Collection Rate</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">Monthly billed vs paid</p>
          </div>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="border-b border-slate-200 bg-white px-3 rounded-t-2xl shadow-sm">
        <div className="flex items-center gap-6 overflow-x-auto text-xs font-semibold text-slate-500 no-scrollbar">
          {['Transactions', 'Fee Structure', 'Invoices & Receipts', 'Pending Payments', 'Refunds', 'Financial Reports'].map((tab) => {
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

      {/* Search & Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, application ID, invoice..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none"
          >
            <option value="All Types">Payment Type: All Types</option>
            <option value="Registration Fee">Registration Fee</option>
            <option value="Lesson Fee">Lesson Fee</option>
            <option value="Hostel Fee">Hostel Fee</option>
            <option value="Exam Fee">Exam Fee</option>
            <option value="Other Fee">Other Fee</option>
          </select>

          <select
            value={selectedProgramme}
            onChange={(e) => setSelectedProgramme(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none"
          >
            <option value="All Programmes">Programme: All Programmes</option>
            <option value="IJMB">IJMB</option>
            <option value="JAMB">JAMB</option>
            <option value="WAEC">WAEC</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none"
          >
            <option value="All Status">Status: All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600">
            <Calendar size={13} className="text-slate-400" />
            <span>01 Jul 2025 - 14 Jul 2025</span>
          </div>

          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#111A43] text-white rounded-xl hover:bg-[#1a275e]">
            Filter
          </button>
        </div>
      </div>

      <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{ledgerLoading?'Loading verified transactions…':ledgerError||'Transaction table displays recorded payments only. Other finance figures are placeholders.'}</p>
      {/* Mid Section: Transactions Table + Fee Structure Card */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Transactions Table */}
        <div className="xl:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-3 w-8 text-center">#</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Application ID</th>
                  <th className="py-3 px-2">Programme</th>
                  <th className="py-3 px-3">Payment Type</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-center">Payment Proof</th>
                  <th className="py-3 px-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={t.avatar || undefined}
                          alt={t.name}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <span className="font-semibold text-[#111A43] whitespace-nowrap">{t.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{t.appId}</td>
                    <td className="py-3 px-2 font-bold text-slate-700">{t.programme}</td>
                    <td className="py-3 px-3">{getPaymentTypeBadge(t.paymentType)}</td>
                    <td className="py-3 px-3 font-bold text-[#111A43]">{t.amount}</td>
                    <td className="py-3 px-2 text-slate-500 whitespace-nowrap">{t.date}</td>
                    <td className="py-3 px-2">{getStatusBadge(t.status)}</td>
                    <td className="py-3 px-2 text-center">
                      <button className={`p-1.5 rounded-lg border ${t.proofValid ? 'text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-100' : 'text-rose-600 border-rose-200 bg-rose-50/50 hover:bg-rose-100'}`}>
                        <FileText size={14} />
                      </button>
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
              Showing <span className="font-semibold text-slate-700">{filtered.length}</span> verified records
            </div>
            <div className="flex items-center gap-1.5">
              <button className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                <ChevronLeft size={14} />
              </button>
              <button className="w-6 h-6 rounded-lg bg-[#111A43] text-white font-bold text-xs flex items-center justify-center">1</button>
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">2</button>
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">3</button>
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">4</button>
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">5</button>
              <span className="text-slate-400">...</span>
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">125</button>
              <button className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <select className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white text-slate-600">
                <option>10 per page</option>
                <option>25 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Current Fee Structure & Monthly Lesson Fees */}
        <div className="xl:col-span-4 space-y-5">
          {/* Current Fee Structure */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt size={16} className="text-[#111A43]" />
                <h3 className="text-sm font-bold text-[#111A43]">Current Fee Structure</h3>
              </div>
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">Manage Fees</button>
            </div>

            {/* Subtabs */}
            <div className="border-b border-slate-200">
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                {['Registration Fees', 'Monthly Lesson Fees', 'Other Fees'].map((tab) => {
                  const isActive = feeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setFeeTab(tab)}
                      className={`pb-2 transition-colors relative ${
                        isActive ? 'text-[#C62839] font-bold' : 'hover:text-slate-700'
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

            <div className="space-y-2.5 text-xs">
              {[
                { prog: 'IJMB Programme', amount: '₦15,000' },
                { prog: 'JAMB Programme', amount: '₦15,000' },
                { prog: 'WAEC Programme', amount: '₦15,000' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="font-semibold text-[#111A43]">{item.prog}</p>
                    <p className="text-[11px] text-slate-400">Fixed Registration Fee</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#111A43]">{item.amount}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                    <button className="p-1 text-slate-400 hover:text-slate-600"><Edit2 size={12} /></button>
                    <button className="p-1 text-slate-400 hover:text-slate-600"><MoreHorizontal size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Row: Revenue Trend + Payment Status + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Revenue Trend */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111A43]">Revenue Trend</h3>
            <select className="text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-slate-600">
              <option>This Session</option>
            </select>
          </div>

          {/* Bar Chart Representation */}
          <div className="flex items-end justify-between gap-3 h-40 px-2 pt-4 border-b border-slate-100">
            {[
              { month: 'Jan', h1: 40, h2: 20, h3: 10 },
              { month: 'Feb', h1: 55, h2: 25, h3: 15 },
              { month: 'Mar', h1: 65, h2: 30, h3: 18 },
              { month: 'Apr', h1: 75, h2: 35, h3: 20 },
              { month: 'May', h1: 85, h2: 40, h3: 25 },
              { month: 'Jun', h1: 90, h2: 45, h3: 28 },
              { month: 'Jul', h1: 95, h2: 50, h3: 30 },
            ].map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="flex items-end gap-1 w-full justify-center">
                  <div className="w-2.5 bg-[#111A43] rounded-t" style={{ height: `${m.h1}%` }} />
                  <div className="w-2.5 bg-[#C62839] rounded-t" style={{ height: `${m.h2}%` }} />
                  <div className="w-2.5 bg-amber-500 rounded-t" style={{ height: `${m.h3}%` }} />
                </div>
                <span className="text-[10px] font-medium text-slate-500 mt-1">{m.month}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-[#111A43]" />
              <span className="text-slate-600">Registration</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-[#C62839]" />
              <span className="text-slate-600">Lesson Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span className="text-slate-600">Other Fees</span>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111A43]">Payment Status</h3>
            <select className="text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-slate-600">
              <option>This Session</option>
            </select>
          </div>

          <div className="space-y-2 text-xs">
            <p className="text-slate-500">Monthly lesson invoices · all available months</p>
            <p className="text-lg font-bold text-[#111A43]">{summary?money(summary.billedNgn):'—'} billed</p>
            <p className="text-emerald-700">{summary?money(summary.paidNgn):'—'} received</p>
            <p className="text-amber-700">{summary?money(summary.outstandingNgn):'—'} outstanding</p>
            <p className="text-slate-600">{summary?summary.settled:'—'} paid · {summary?summary.partial:'—'} partial · {summary?summary.unpaid:'—'} unpaid</p>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111A43]">Recent Activities</h3>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
          </div>

          <div className="space-y-2 text-xs">
            {transactions.length===0?<p className="text-slate-500">No recorded payment activity available.</p>:transactions.slice(0,5).map(t=><div key={t.id} className="border-b border-slate-100 py-2">
              <p className="font-semibold text-[#111A43]">{t.paymentType} · {t.amount}</p>
              <p className="text-slate-500">{t.appId} · {t.date}</p>
            </div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
