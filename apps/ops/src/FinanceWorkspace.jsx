import React, { useState } from 'react';
import FinanceSummary from './FinanceSummary';
import BankAccounts from './BankAccounts';
import ProgrammeFees from './ProgrammeFees';
import RegistrationBilling from './RegistrationBilling';
import FeeBilling from './FeeBilling';
import PaymentLedger from './PaymentLedger';

const TABS = [
  { key: 'overview', label: 'Financial Overview' },
  { key: 'bank', label: 'University Bank Accounts' },
  { key: 'fees', label: 'Fee Structure' },
  { key: 'registration', label: 'Registration Billing' },
  { key: 'monthly', label: 'Monthly Programme Billing' },
  { key: 'ledger', label: 'Payment Verification / Ledger' },
];

export default function FinanceWorkspace() {
  const [tab, setTab] = useState('overview');
  return (
    <section className="finance-workspace" style={{ marginTop: 24 }}>
      <nav className="finance-tabs" role="tablist" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #d9dde8',
              background: tab === t.key ? '#111A43' : '#F7F8FC',
              color: tab === t.key ? '#F7F8FC' : '#111A43',
              cursor: 'pointer',
              fontWeight: tab === t.key ? 600 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <div role="tabpanel">
        {tab === 'overview' && <FinanceSummary />}
        {tab === 'bank' && <BankAccounts />}
        {tab === 'fees' && <ProgrammeFees />}
        {tab === 'registration' && <RegistrationBilling />}
        {tab === 'monthly' && <FeeBilling />}
        {tab === 'ledger' && <PaymentLedger />}
      </div>
    </section>
  );
}