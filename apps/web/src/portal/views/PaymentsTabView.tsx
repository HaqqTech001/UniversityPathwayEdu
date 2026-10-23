import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Copy,
  UploadCloud,
  FileText,
  DollarSign,
  Calendar,
  HelpCircle,
  Building,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { StudentUser } from '../../context/AuthContext';
import { getStudentToken } from '../../context/AuthContext';
import StudentPaymentHistory from '../StudentPaymentHistory';
import StudentFeeStatement from '../StudentFeeStatement';
import StudentRegistrationFees from '../StudentRegistrationFees';
import StudentMonthlyFees from '../StudentMonthlyFees';

interface PaymentsTabViewProps {
  currentUser: StudentUser;
  onNavigateTab: (tab: string) => void;
}

interface PaymentRecord {
  id: string;
  reference: string;
  category: string;
  channel: string;
  amount: number;
  date: string;
  status: 'verified' | 'pending';
}

export default function PaymentsTabView({
  currentUser,
  onNavigateTab,
}: PaymentsTabViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'history' | 'channels' | 'evidence' | 'statement'>('history');
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Evidence Form State
  const [evidenceAmount, setEvidenceAmount] = useState('');
  const [evidenceBank, setEvidenceBank] = useState('');
  const [evidenceRef, setEvidenceRef] = useState('');
  const [evidenceSuccess, setEvidenceSuccess] = useState('');

  const payments: PaymentRecord[] = []; // Show no transactions until the billing service supplies authenticated records.

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 3000);
  };

  const handleEvidenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEvidenceSuccess('Payment evidence upload is not yet connected. No evidence has been submitted.');

    setTimeout(() => setEvidenceSuccess(''), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl border border-[#dce5f0] p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-[#111A43] tracking-tight">
            Student Billing &amp; Payments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track tuition schedules, payment history, official receipts and financial clearance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveSubTab('evidence')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c62839] hover:bg-[#a51b2b] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <UploadCloud size={14} />
            <span>+ Upload Payment Evidence</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Metric Cards (Matching Mockup) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Fees */}
        <div className="bg-white rounded-2xl border border-[#dce5f0] p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Programme Fees
          </span>
          <strong className="text-2xl font-black text-[#111A43] block mt-1">
            Not available
          </strong>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Full Session (IJMB 2026/2027)
          </span>
        </div>

        {/* Card 2: Amount Paid */}
        <div className="bg-white rounded-2xl border border-[#dce5f0] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Amount Paid
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              65%
            </span>
          </div>
          <strong className="text-2xl font-black text-emerald-700 block mt-1">
            Not available
          </strong>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-emerald-500 h-full rounded-full w-[65%]" />
          </div>
        </div>

        {/* Card 3: Outstanding Balance */}
        <div className="bg-white rounded-2xl border border-[#dce5f0] p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Outstanding Balance
          </span>
          <strong className="text-2xl font-black text-[#c62839] block mt-1">
            Not available
          </strong>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Second Instalment Balance
          </span>
        </div>

        {/* Card 4: Next Payment Due */}
        <div className="bg-white rounded-2xl border border-[#dce5f0] p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Next Payment Due
          </span>
          <strong className="text-2xl font-black text-[#111A43] block mt-1">
            15 Nov 2026
          </strong>
          <span className="text-[11px] font-semibold text-amber-700 mt-1 block">
            Due in 23 Days
          </span>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-2 border-b border-[#dce5f0] pb-2">
        {[
          { id: 'history', label: 'Payment History' },
          { id: 'channels', label: 'Approved Payment Channels' },
          { id: 'evidence', label: 'Upload Payment Evidence' },
          { id: 'statement', label: 'Fee Statement & Schedule' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === tab.id
                ? 'bg-[#111A43] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Left (Active Subtab Content), Right (Reminders, FAQs, Support) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Subtab 1: Payment History */}
          {activeSubTab === 'history' && (
            <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-sm font-extrabold text-[#111A43]">
                  Recorded Payment History
                </h2>
                <span className="text-xs text-slate-400">Official Transactions</span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[550px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Reference</th>
                      <th className="py-2.5">Category</th>
                      <th className="py-2.5">Channel</th>
                      <th className="py-2.5">Amount</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 text-slate-500">{p.date}</td>
                        <td className="py-3.5 font-mono font-bold text-[#111A43]">{p.reference}</td>
                        <td className="py-3.5 text-slate-700 font-medium">{p.category}</td>
                        <td className="py-3.5 text-slate-500">{p.channel}</td>
                        <td className="py-3.5 font-bold text-[#111A43]">
                          ₦{p.amount.toLocaleString()}
                        </td>
                        <td className="py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'verified'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {p.status === 'verified' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                            <span className="capitalize">{p.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => alert(`Downloading official PDF receipt for ${p.reference}`)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#c62839] hover:underline cursor-pointer"
                          >
                            <Download size={13} />
                            <span>PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Connected real component fallback if backend data exists */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <StudentPaymentHistory />
              </div>
            </div>
          )}

          {/* Subtab 2: Approved Payment Channels */}
          {activeSubTab === 'channels' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <Building size={20} className="text-[#c62839]" />
                  <div>
                    <h2 className="text-sm font-extrabold text-[#111A43]">
                      Official Institutional Bank Account Details
                    </h2>
                    <p className="text-xs text-slate-500">
                      Remit all tuition and application fees exclusively to the official UPEC corporate accounts
                    </p>
                  </div>
                </div>

                <div className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-[#f8faff] to-[#eef3ff] border border-blue-200/60 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">
                        Bank Name
                      </span>
                      <strong className="text-sm font-bold text-[#111A43] block mt-0.5">
                        Moniepoint Microfinance Bank
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">
                        Account Name
                      </span>
                      <strong className="text-sm font-bold text-[#111A43] block mt-0.5">
                        University Pathway Educational Consult
                      </strong>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">
                        Account Number
                      </span>
                      <div className="flex items-center gap-3 mt-1">
                        <strong className="text-xl font-mono font-black text-[#111A43] tracking-wider">
                          8234567890
                        </strong>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('8234567890')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#111A43] hover:bg-slate-50 shadow-xs cursor-pointer"
                        >
                          {copiedAccount ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          <span>{copiedAccount ? 'Copied!' : 'Copy Number'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-blue-200/50 text-xs text-[#1e3a6a] flex items-start gap-2">
                    <ShieldCheck size={16} className="text-[#2456a0] shrink-0 mt-0.5" />
                    <span>
                      <strong>Payment Narration Rule:</strong> Always specify your Student ID (or Application Reference) and Surname in your bank transfer narration to enable immediate automated verification.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subtab 3: Upload Payment Evidence */}
          {activeSubTab === 'evidence' && (
            <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <UploadCloud size={20} className="text-[#c62839]" />
                <div>
                  <h2 className="text-sm font-extrabold text-[#111A43]">
                    Submit Bank Transfer Receipt / Teller
                  </h2>
                  <p className="text-xs text-slate-500">
                    Upload your proof of payment for bursary clearance and official receipt generation
                  </p>
                </div>
              </div>

              {evidenceSuccess && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{evidenceSuccess}</span>
                </div>
              )}

              <form onSubmit={handleEvidenceSubmit} className="mt-5 space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-[#111A43] mb-1">
                    Amount Paid (NGN)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 100000"
                    value={evidenceAmount}
                    onChange={(e) => setEvidenceAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#111A43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111A43] mb-1">
                    Bank Used for Transfer
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GTBank / Access Bank / Kuda"
                    value={evidenceBank}
                    onChange={(e) => setEvidenceBank(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#111A43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111A43] mb-1">
                    Bank Transaction Reference / Session ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 000013241023120000123"
                    value={evidenceRef}
                    onChange={(e) => setEvidenceRef(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#111A43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111A43] mb-1">
                    Upload Transfer Screenshot or Receipt (PDF/JPG)
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50">
                    <input type="file" className="text-xs" accept=".pdf,.jpg,.jpeg,.png" />
                    <p className="text-[10px] text-slate-400 mt-1">Maximum 5 MB file size</p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#c62839] hover:bg-[#a51b2b] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  Submit Payment Evidence
                </button>
              </form>
            </div>
          )}

          {/* Subtab 4: Statement */}
          {activeSubTab === 'statement' && (
            <div className="space-y-6">
              <StudentFeeStatement />
              <StudentRegistrationFees />
              <StudentMonthlyFees />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Sidebar Widgets */}
        <div className="space-y-6">
          {/* Payment Reminders Card */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Calendar size={18} className="text-[#c62839]" />
              <h3 className="text-sm font-extrabold text-[#111A43]">
                Payment Reminder
              </h3>
            </div>
            <div className="mt-3 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-[#111A43]">
              <strong className="block text-amber-900 font-bold mb-1">Second Tuition Instalment</strong>
              <p className="text-slate-700 leading-relaxed">
                The balance of Not available for the first semester is due by <strong>November 15, 2026</strong>. Late clearance incurs administrative review.
              </p>
            </div>
          </div>

          {/* Stamped Receipt Info */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
            <h3 className="text-sm font-extrabold text-[#111A43] pb-3 border-b border-slate-100">
              Need an Official Stamped Receipt?
            </h3>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              Official physical stamped receipts can be collected from the Bursary desk during campus clearance upon presenting your bank transfer alert or portal invoice.
            </p>
          </div>

          {/* FAQs */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
            <h3 className="text-sm font-extrabold text-[#111A43] pb-3 border-b border-slate-100">
              Payment FAQs
            </h3>
            <div className="mt-3 space-y-2.5 text-xs text-slate-600">
              <div>
                <strong className="text-[#111A43] block">How long does verification take?</strong>
                <span className="text-[11px] text-slate-500">24–48 business hours after evidence submission.</span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <strong className="text-[#111A43] block">Can fees be paid in instalments?</strong>
                <span className="text-[11px] text-slate-500">Yes, according to the approved 2-part payment schedule.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
