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


type FinanceTab = 'Overview' | 'Transactions' | 'Fee Structure' | 'Invoices & Receipts' | 'Pending Payments' | 'Refunds' | 'Financial Reports';
const financeTabs: FinanceTab[] = ['Overview','Transactions','Fee Structure','Invoices & Receipts','Pending Payments','Refunds','Financial Reports'];
export default function AdminFinancePage() {
  const [activeTab,setActiveTab]=useState<FinanceTab>('Overview');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedProgramme, setSelectedProgramme] = useState('All Programmes');
  const [searchFilter, setSearchFilter] = useState('');
  const [page,setPage]=useState(1);
  const [pageSize,setPageSize]=useState(10);

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
    if (
      searchFilter &&
      !t.name.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !t.appId.toLowerCase().includes(searchFilter.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const pageCount=Math.max(1,Math.ceil(filtered.length/pageSize));
  const safePage=Math.min(page,pageCount);
  const pageRows=filtered.slice((safePage-1)*pageSize,safePage*pageSize);
  useEffect(()=>{setPage(1);},[selectedType,selectedProgramme,searchFilter,pageSize]);
  const exportLedger=()=>{
    const rows=[['Payment record ID','Programme','Payment type','Amount (NGN)','Date','Status'],
      ...filtered.map(t=>[t.appId,t.programme,t.paymentType,t.amount,t.date,t.status])];
    const csv=rows.map(row=>row.map(value=>'"'+String(value).replace(/"/g,'""')+'"').join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='recorded-payments.csv';a.click();URL.revokeObjectURL(url);
  };
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
        </div>
      </div>

      {summaryError&&<p role="alert" className="text-sm text-rose-700">{summaryError}</p>}
      <p className="text-xs text-slate-500">Summary figures cover monthly lesson invoices only, across all available billing months.</p>
      <nav aria-label="Finance sections" className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">{financeTabs.map(tab=><button key={tab} type="button" onClick={()=>setActiveTab(tab)} aria-current={activeTab===tab?'page':undefined} className={activeTab===tab?'rounded-lg bg-[#111A43] px-4 py-2 text-xs font-bold text-white':'rounded-lg border bg-white px-4 py-2 text-xs font-semibold text-slate-600'}>{tab}</button>)}</nav>
      {activeTab==='Overview'&&<section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"><h2 className="text-lg font-bold text-[#111A43]">Finance workspace</h2><p className="mt-1 text-sm text-slate-600">Choose a financial task below. Payment records and management tools stay in their dedicated sections.</p><div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">{financeTabs.filter(tab=>tab!=='Overview').map(tab=><button key={tab} type="button" onClick={()=>setActiveTab(tab)} className="min-w-0 rounded-xl border border-slate-200 bg-[#F7F8FC] px-4 py-4 text-left text-sm font-semibold text-[#111A43] transition hover:border-[#C62839] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C62839]">{tab} <span aria-hidden="true" className="float-right text-[#C62839]">→</span></button>)}</div></section>}
      {activeTab==='Fee Structure'&&<FeeRateManager />}
      {activeTab==='Invoices & Receipts'&&<><InvoiceManager /><RegistrationInvoiceManager /><ReceiptReviewPanel /></>}
      {activeTab==='Pending Payments'&&<><p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Pending receipts are not confirmed payments. Review evidence below.</p><ReceiptReviewPanel /></>}
      {activeTab==='Refunds'&&<section className="rounded-xl border bg-white p-5"><h2 className="font-bold">Refunds</h2><p className="text-sm text-slate-600">Refund processing is not yet implemented. No refund actions are enabled.</p></section>}
      {activeTab==='Financial Reports'&&<p className="rounded-lg bg-slate-50 p-4 text-sm">Monthly invoice summaries are available below. Full institutional reporting is not yet implemented.</p>}
      {(activeTab==='Overview'||activeTab==='Financial Reports')&&<>
      {/* 6 KPI Cards */}
      <div className="grid grid-cols-1 min-[440px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3.5">
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

      <div className="flex justify-end"><button type="button" onClick={exportLedger} disabled={ledgerLoading||Boolean(ledgerError)||filtered.length===0} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-[#111A43] disabled:opacity-50">Export filtered payments (CSV)</button></div>
      </>}
      {activeTab==='Transactions'&&<>
      {/* Search & Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search recorded payment reference or invoice ID"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex min-w-0 items-center gap-2 flex-wrap">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="min-w-0 flex-1 sm:flex-none px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none"
          >
            <option value="All Types">Payment Type: All Types</option>
            <option value="Registration Fee">Registration Fee</option>
            <option value="Lesson Fee">Lesson Fee</option>
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


        </div>
      </div>

      <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{ledgerLoading?'Loading verified transactions…':ledgerError||'Showing recorded payments only; receipt review and invoicing are managed above.'}</p>
      {/* Mid Section: Transactions Table + Fee Structure Card */}
      <div className="grid min-w-0 grid-cols-1 gap-4 items-start">
        {/* Left Column: Transactions Table */}
        <div className="min-w-0 w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="w-full max-w-full overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[780px] text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-3 w-8 text-center">#</th>
                  <th className="py-3 px-3">Record</th>
                  <th className="py-3 px-3">Payment record ID</th>
                  <th className="py-3 px-2">Programme</th>
                  <th className="py-3 px-3">Payment Type</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageRows.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">{(safePage-1)*pageSize+idx+1}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#111A43] whitespace-nowrap">{t.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{t.appId}</td>
                    <td className="py-3 px-2 font-bold text-slate-700">{t.programme}</td>
                    <td className="py-3 px-3">{getPaymentTypeBadge(t.paymentType)}</td>
                    <td className="py-3 px-3 font-bold text-[#111A43]">{t.amount}</td>
                    <td className="py-3 px-2 text-slate-500 whitespace-nowrap">{t.date}</td>
                    <td className="py-3 px-2">{getStatusBadge(t.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <span>Showing {filtered.length===0?0:(safePage-1)*pageSize+1}–{Math.min(safePage*pageSize,filtered.length)} of {filtered.length} recorded payments (latest 100 returned by API)</span>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" disabled={safePage===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="rounded-lg border px-2 py-1 disabled:opacity-40" aria-label="Previous page">Previous</button>
              <span>Page {safePage} of {pageCount}</span>
              <button type="button" disabled={safePage>=pageCount} onClick={()=>setPage(p=>Math.min(pageCount,p+1))} className="rounded-lg border px-2 py-1 disabled:opacity-40" aria-label="Next page">Next</button>
              <select aria-label="Records per page" value={pageSize} onChange={e=>setPageSize(Number(e.target.value))} className="rounded-lg border p-1"><option value={10}>10 per page</option><option value={25}>25 per page</option><option value={50}>50 per page</option></select>
            </div>
          </div>
        </div>

      </div>

      </>}
      {(activeTab==='Transactions'||activeTab==='Financial Reports')&&<>
      {/* Bottom Row: Revenue Trend + Payment Status + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 items-start">
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
      </>}
    </div>
  );
}
