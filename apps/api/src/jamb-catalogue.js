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
