import React from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

function App() {
  return <main className="shell"><section className="panel"><p className="eyebrow">UNIVERSITY PATHWAY EDUCATIONAL CONSULT</p><h1>Administration workspace</h1><p>This independent administration application is being prepared. Staff sign-in and student records will be enabled only after secure Supabase authentication and role policies are implemented and tested.</p><p className="status">Access not yet enabled</p></section></main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
