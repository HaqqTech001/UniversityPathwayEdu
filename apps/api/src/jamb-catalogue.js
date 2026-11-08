const isYear=value=>Number.isInteger(value)&&value>=2026&&value<=2100;
const isName=value=>typeof value==='string'&&value.trim().length>=2&&value.trim().length<=160;
const isSubjectList=value=>Array.isArray(value)&&value.every(item=>typeof item==='string'&&item.trim().length>=2&&item.trim().length<=100)&&new Set(value.map(item=>item.trim().toLowerCase())).size===value.length;

export function jambCombinationPayload(value={}){
 return {
  exam_year:value.examYear,
  institution_name:typeof value.institutionName==='string'?value.institutionName.trim():'',
  institution_code:typeof value.institutionCode==='string'&&value.institutionCode.trim()?value.institutionCode.trim().toUpperCase():null,
  programme_name:typeof value.programmeName==='string'?value.programmeName.trim():'',
  programme_code:typeof value.programmeCode==='string'&&value.programmeCode.trim()?value.programmeCode.trim().toUpperCase():null,
  english_language_required:value.englishLanguageRequired!==false,
  required_subjects:Array.isArray(value.requiredSubjects)?value.requiredSubjects.map(item=>String(item).trim()):[],
  alternative_subjects:Array.isArray(value.alternativeSubjects)?value.alternativeSubjects.map(item=>String(item).trim()):[],
  alternative_subject_count:value.alternativeSubjectCount??0,
  subject_group_rules:Array.isArray(value.subjectGroupRules)?value.subjectGroupRules:[],
  additional_notes:typeof value.additionalNotes==='string'?value.additionalNotes.trim():'',
  source_reference:typeof value.sourceReference==='string'?value.sourceReference.trim():'',
  source_verified:false,
  active:value.active!==false
 };
}

export function validateJambCombination(value){
 return isYear(value.exam_year)&&isName(value.institution_name)&&isName(value.programme_name)&&
  value.english_language_required===true&&isSubjectList(value.required_subjects)&&
  isSubjectList(value.alternative_subjects)&&Number.isInteger(value.alternative_subject_count)&&
  value.alternative_subject_count>=0&&value.alternative_subject_count<=3&&
  value.required_subjects.length+value.alternative_subject_count===3&&
  (value.alternative_subject_count===0?value.alternative_subjects.length===0:value.alternative_subjects.length>=value.alternative_subject_count)&&
  Array.isArray(value.subject_group_rules)&&value.subject_group_rules.every(group=>
   group&&typeof group==='object'&&!Array.isArray(group)&&typeof group.name==='string'&&
   Array.isArray(group.subjects)&&isSubjectList(group.subjects)&&Number.isInteger(group.choose)&&
   group.choose>=1&&group.choose<=group.subjects.length
  )&&typeof value.additional_notes==='string'&&value.additional_notes.length<=2000&&
  typeof value.source_reference==='string'&&value.source_reference.length>=8&&value.source_reference.length<=500&&
  typeof value.active==='boolean';
}

export function validateJambVerification(existing,input={}){
 const year=Number(input.examYear),institution=String(input.institutionName||'').trim(),programme=String(input.programmeName||'').trim();
 if(year!==existing.exam_year||institution.toLowerCase()!==existing.institution_name.toLowerCase()||programme.toLowerCase()!==existing.programme_name.toLowerCase())return {valid:false,error:'Verification must confirm the exact saved examination year, institution and programme.'};
 const sourceUrl=typeof input.sourceReference==='string'?input.sourceReference.trim():'';
 let source;try{source=new URL(sourceUrl);}catch{return {valid:false,error:'Provide the official JAMB IBASS source URL.'};}
 if(source.protocol!=='https:'||!['eligibility.jamb.gov.ng','ibass.jamb.gov.ng','jamb.gov.ng','www.jamb.gov.ng'].includes(source.hostname.toLowerCase()))return {valid:false,error:'Verification requires an official JAMB HTTPS source.'};
 const notes=typeof input.verificationNotes==='string'?input.verificationNotes.trim():'';
 if(notes.length<20||notes.length>2000)return {valid:false,error:'Record at least 20 characters describing the exact IBASS institution/course check.'};
 const required=Array.isArray(input.requiredSubjects)?input.requiredSubjects.map(x=>String(x).trim()):[];
 const alternatives=Array.isArray(input.alternativeSubjects)?input.alternativeSubjects.map(x=>String(x).trim()):[];
 if(!isSubjectList(required)||!isSubjectList(alternatives)||JSON.stringify([...required].sort())!==JSON.stringify([...existing.required_subjects].sort())||JSON.stringify([...alternatives].sort())!==JSON.stringify([...existing.alternative_subjects].sort()))return {valid:false,error:'The IBASS-checked subjects do not match the saved combination. Update the provisional combination first.'};
 if(existing.english_language_required!==true||required.length+existing.alternative_subject_count!==3)return {valid:false,error:'The saved combination does not satisfy the JAMB subject structure.'};
 return {valid:true,sourceUrl,notes,required,alternatives};
}
