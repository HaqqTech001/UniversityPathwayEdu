import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import StaffLogin from './StaffLogin';
import StaffDashboard from './StaffDashboard';
import {getOpsToken,clearOpsToken,opsRequest} from './api';
import './style.css';

function App(){
 const [profile,setProfile]=useState(null);
 const [checking,setChecking]=useState(true);
 const verify=async()=>{
  try{
   const result=await opsRequest('/me');
   if(!result.role||!Array.isArray(result.permissions))throw Error('Invalid staff profile');
   setProfile(result);
  }catch{clearOpsToken();setProfile(null);}
  finally{setChecking(false);}
 };
 useEffect(()=>{if(getOpsToken())void verify();else setChecking(false);},[]);
 if(checking)return <main className="shell"><p>Verifying staff access...</p></main>;
 if(!profile)return <StaffLogin onSuccess={verify}/>;
 return <StaffDashboard profile={profile} onLogout={()=>setProfile(null)}/>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
