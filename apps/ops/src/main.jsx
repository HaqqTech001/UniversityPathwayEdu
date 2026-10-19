import React from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';

function App(){
  return <main className="shell">
    <section className="panel">
      <span className="eyebrow">UNIVERSITY PATHWAY · OPERATIONS</span>
      <h1>Staff Administration</h1>
      <p>This is the separate UPEC operations application. Staff sign-in and privileged actions remain unavailable until server-verified permissions are configured.</p>
      <div className="notice" role="status">Protected access is being configured. Student accounts do not provide administrative access.</div>
      <a href={import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5173'}>Return to public website</a>
    </section>
  </main>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
