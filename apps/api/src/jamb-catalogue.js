const isYear=value=>Number.isInteger(value)&&value>=2026&&value<=2100;
const isName=value=>typeof value==='string'&&value.trim().length>=2&&value.trim().length<=160;
const isSubjectList=value=>Array.isArray(value)&&value.every(item=>typeof item==='string'&&item.trim().length>=2&&item.trim().length<=100)&&new Set(value.map(item=>item.trim().toLowerCase())).size===value.length;
const isSubjectGroupList=groups=>Array.isArray(groups)&&groups.every(group=>
 group&&typeof group==='object'&&!Array.isArray(group)&&isName(group.name)&&
 Array.isArray(group.subjects)&&isSubjectList(group.subjects)&&Number.isInteger(group.choose)&&
 group.choose>=1&&group.choose<=group.subjects.length
)&&new Set(groups.map(group=>group.name.trim().toLowerCase())).size===groups.length;
const normalizeGroups=groups=>(Array.isArray(groups)?groups:[]).map(group=>({name:String(group.name||'').trim().toLowerCase(),choose:group.choose,subjects:[...(group.subjects||[])].map(subject=>String(subject).trim().toLowerCase()).sort()})).sort((a,b)=>a.name.localeCompare(b.name));

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
 const groupsValid=Array.isArray(value.subject_group_rules)&&value.subject_group_rules.every(group=>
  group&&typeof group==='object'&&!Array.isArray(group)&&isName(group.name)&&
  Array.isArray(group.subjects)&&isSubjectList(group.subjects)&&Number.isInteger(group.choose)&&
  group.choose>=1&&group.choose<=group.subjects.length
 );
 const groupedSlots=Array.isArray(value.subject_group_rules)?value.subject_group_rules.reduce((sum,group)=>sum+(Number.isInteger(group?.choose)?group.choose:0),0):0;
 return isYear(value.exam_year)&&isName(value.institution_name)&&isName(value.programme_name)&&
  value.english_language_required===true&&isSubjectList(value.required_subjects)&&
  isSubjectList(value.alternative_subjects)&&Number.isInteger(value.alternative_subject_count)&&
  value.alternative_subject_count>=0&&value.alternative_subject_count<=3&&
  value.required_subjects.length+value.alternative_subject_count+groupedSlots===3&&
  (value.alternative_subject_count===0?value.alternative_subjects.length===0:value.alternative_subjects.length>=value.alternative_subject_count)&&
  groupsValid&&new Set(value.subject_group_rules.map(group=>group.name.trim().toLowerCase())).size===value.subject_group_rules.length&&
  (value.alternative_subject_count===0?value.alternative_subjects.length===0:value.alternative_subjects.length>=value.alternative_subject_count)&&
  (()=>{const selected=[...value.required_subjects,...value.alternative_subjects,...value.subject_group_rules.flatMap(group=>group.subjects)].map(subject=>subject.trim().toLowerCase());return new Set(selected).size===selected.length;})()&&
  typeof value.additional_notes==='string'&&value.additional_notes.length<=2000&&
  typeof value.source_reference==='string'&&value.source_reference.length>=8&&value.source_reference.length<=500&&
  typeof value.active==='boolean';
}

export function validateJambVerification(existing,input={},institutionSourceReference=''){
 const year=Number(input.examYear),institution=String(input.institutionName||'').trim(),programme=String(input.programmeName||'').trim();
 if(year!==existing.exam_year||institution.toLowerCase()!==existing.institution_name.toLowerCase()||programme.toLowerCase()!==existing.programme_name.toLowerCase())return {valid:false,error:'Verification must confirm the exact saved examination year, institution and programme.'};
 const sourceUrl=typeof input.sourceReference==='string'?input.sourceReference.trim():'';
 let source;try{source=new URL(sourceUrl);}catch{return {valid:false,error:'Provide the official JAMB IBASS source URL.'};}
 if(source.protocol!=='https:'||!['eligibility.jamb.gov.ng','ibass.jamb.gov.ng','jamb.gov.ng','www.jamb.gov.ng'].includes(source.hostname.toLowerCase()))return {valid:false,error:'Verification requires an official JAMB HTTPS source.'};
 let institutionSource;try{institutionSource=new URL(institutionSourceReference);}catch{return {valid:false,error:'The saved institution does not have a valid official IBASS source.'};}
 if(institutionSource.protocol!=='https:'||institutionSource.hostname.toLowerCase()!=='ibass.jamb.gov.ng'||institutionSource.pathname!=='/brochure-courses'||source.protocol!=='https:'||source.hostname.toLowerCase()!=='ibass.jamb.gov.ng'||source.pathname!=='/brochure-courses'||source.searchParams.get('id')!==institutionSource.searchParams.get('id'))return {valid:false,error:'The combination source must be the official IBASS brochure page for this exact institution.'};
 const notes=typeof input.verificationNotes==='string'?input.verificationNotes.trim():'';
 if(notes.length<20||notes.length>2000)return {valid:false,error:'Record at least 20 characters describing the exact IBASS institution/course check.'};
 const required=Array.isArray(input.requiredSubjects)?input.requiredSubjects.map(x=>String(x).trim()):[];
 const alternatives=Array.isArray(input.alternativeSubjects)?input.alternativeSubjects.map(x=>String(x).trim()):[];
 const groups=Array.isArray(input.subjectGroupRules)?input.subjectGroupRules:[];
 if(!isSubjectList(required)||!isSubjectList(alternatives)||!isSubjectGroupList(groups)||JSON.stringify([...required].map(x=>x.toLowerCase()).sort())!==JSON.stringify([...(existing.required_subjects||[])].map(x=>x.toLowerCase()).sort())||JSON.stringify([...alternatives].map(x=>x.toLowerCase()).sort())!==JSON.stringify([...(existing.alternative_subjects||[])].map(x=>x.toLowerCase()).sort()))return {valid:false,error:'The IBASS-checked subjects do not match the saved combination. Update the provisional combination first.'};
 if(!Array.isArray(existing.subject_group_rules)||JSON.stringify(normalizeGroups(groups))!==JSON.stringify(normalizeGroups(existing.subject_group_rules)))return {valid:false,error:'The IBASS-checked subject groups do not match the saved combination. Update the provisional combination first.'};
 if(existing.english_language_required!==true||required.length+(existing.alternative_subject_count||0)+groups.reduce((sum,group)=>sum+group.choose,0)!==3)return {valid:false,error:'The saved combination does not satisfy the JAMB subject structure.'};
 return {valid:true,sourceUrl,notes,required:existing.required_subjects,alternatives:existing.alternative_subjects,groups:existing.subject_group_rules||[]};
}


export function validateJambProgrammeVerification(existing,input={},institutionSourceReference=''){
 const year=Number(input.examYear),name=String(input.programmeName||'').trim(),institutionId=String(input.institutionId||'').trim();
 if(year!==existing.exam_year||name.toLowerCase()!==String(existing.programme_name||'').toLowerCase()||institutionId!==existing.institution_id)return {valid:false,error:'Verification must match the exact saved institution, programme and admission year.'};
 const sourceUrl=typeof input.sourceReference==='string'?input.sourceReference.trim():'';
 let source;try{source=new URL(sourceUrl);}catch{return {valid:false,error:'Provide the official JAMB IBASS programme source URL.'};}
 if(source.protocol!=='https:'||source.hostname.toLowerCase()!=='ibass.jamb.gov.ng'||!source.pathname.startsWith('/brochure-courses'))return {valid:false,error:'Programme verification requires the official JAMB IBASS brochure course page.'};
 let institutionSource;try{institutionSource=new URL(institutionSourceReference);}catch{return {valid:false,error:'The saved institution does not have a valid official IBASS source.'};}
 if(institutionSource.protocol!=='https:'||institutionSource.hostname.toLowerCase()!=='ibass.jamb.gov.ng'||institutionSource.pathname!=='/brochure-courses'||source.searchParams.get('id')!==institutionSource.searchParams.get('id'))return {valid:false,error:'The programme source must belong to the selected institution’s official IBASS brochure page.'};
 const notes=typeof input.verificationNotes==='string'?input.verificationNotes.trim():'';
 if(notes.length<30||notes.length>2000)return {valid:false,error:'Explain how the exact programme and admission year were checked (at least 30 characters).'};
 return {valid:true,sourceUrl,notes};
}
