export const programmeOptions = [
  {value:'utme',label:'UTME / JAMB preparation'},
  {value:'olevel',label:'WAEC / NECO / NABTEB'},
  {value:'jupeb',label:'JUPEB'},
  {value:'ijmb',label:'IJMB'},
  {value:'diploma',label:'Diploma / Direct Entry guidance'},
  {value:'international',label:'International examination preparation'},
  {value:'computer',label:'Computer training'},
  {value:'other',label:'Other / not sure yet'},
];
export const initialRegistration = Object.freeze({
  firstName:'',lastName:'',email:'',phone:'',programme:'',dateOfBirth:'',guardianName:'',guardianPhone:'',consent:false
});
export function validateRegistration(form) {
  const errors={};
  if (!form.firstName.trim()) errors.firstName='First name is required';
  if (!form.lastName.trim()) errors.lastName='Last name is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email='Enter a valid email';
  if (!/^\+?[\d\s()-]{10,20}$/.test(form.phone.trim())) errors.phone='Enter a valid phone number';
  if (!programmeOptions.some(p=>p.value===form.programme)) errors.programme='Choose a programme';
  if (!form.consent) errors.consent='Consent is required';
  return errors;
}
