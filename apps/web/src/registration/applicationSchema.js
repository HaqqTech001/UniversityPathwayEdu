// Owner-provided four-page application form: presentation schema only.
// This module does not send, store or collect real applications.
export const applicationSteps=[
 {title:'Student biodata',description:'Personal and contact details',fields:[
  {name:'surname',label:'Surname',required:true},{name:'firstName',label:'First name',required:true},{name:'middleName',label:'Middle / other name'},
  {name:'dateOfBirth',label:'Date of birth',type:'date',required:true},{name:'placeOfBirth',label:'Place of birth'},
  {name:'gender',label:'Gender',options:['Male','Female','Prefer not to say']},
  {name:'stateOfOrigin',label:'State of origin'},{name:'lga',label:'Local government area'},{name:'nationality',label:'Nationality'},
  {name:'email',label:'Email',type:'email'},{name:'phone',label:'Phone number',type:'tel',required:true},
  {name:'alternatePhone',label:'Alternative phone',type:'tel'},
  {name:'currentAddress',label:'Current address',multiline:true,required:true},
  {name:'permanentAddress',label:'Permanent address',multiline:true},
 ]},
 {title:'Guardian & emergency',description:'Contact details and emergency support',fields:[
  {name:'guardianRelationship',label:'Guardian relationship',options:['Father','Mother','Step-father','Step-mother','Uncle','Aunt','Foster parent','Legal guardian','Other']},
  {name:'guardianName',label:'Parent / guardian full name',required:true},
  {name:'guardianOccupation',label:'Guardian occupation'},{name:'guardianWorkplace',label:'Guardian workplace'},
  {name:'guardianEmail',label:'Guardian email',type:'email'},{name:'guardianPhone',label:'Guardian phone',type:'tel',required:true},
  {name:'guardianAlternatePhone',label:'Guardian alternate phone',type:'tel'},
  {name:'guardianAddress',label:'Guardian address',multiline:true},
  {name:'emergencyName',label:'Emergency contact name',required:true},
  {name:'emergencyRelationship',label:'Emergency contact relationship',required:true},
  {name:'emergencyPhone',label:'Emergency contact phone',type:'tel',required:true},
  {name:'emergencyAddress',label:'Emergency contact address',multiline:true},
 ]},
 {title:'Education & programme',description:'Choose the learning pathway and preferred sessions',fields:[
  {name:'currentSchool',label:'Current / most recent school'},
  {name:'currentClass',label:'Current class'},
  {name:'schoolAddress',label:'School address',multiline:true},
  {name:'programmeCategory',label:'Programme category',options:['UTME (JAMB)','SSCE','JSSCE','Private tutor'],required:true},
  {name:'preferredSession',label:'Preferred session',options:['Morning','Afternoon','Evening','Any available'],required:true},
  {name:'department',label:'SSCE department (if applicable)',options:['Science','Arts','Social Science']},
  {name:'duration',label:'Preferred duration (subject to confirmation)',options:['1 month','2 months','3 months','4 months','6 months','1 year','More than 1 year']},
  {name:'utmeSubject2',label:'UTME subject 2 (English is compulsory)'},
  {name:'utmeSubject3',label:'UTME subject 3'},
  {name:'utmeSubject4',label:'UTME subject 4'},
 ]},
 {title:'Review & declaration',description:'Confirm the details before formal submission',fields:[]}
];
export function validateStep(step,values){
 const errors={};
 for(const field of applicationSteps[step].fields){
  const value=String(values[field.name]??'').trim();
  if(field.required&&!value) errors[field.name]='This field is required';
  if(value&&field.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))errors[field.name]='Enter a valid email';
  if(value&&field.type==='tel'&&!/^\+?[0-9 ()-]{10,20}$/.test(value))errors[field.name]='Enter a valid phone number';
 }
 return errors;
}
