import test from 'node:test';
import assert from 'node:assert/strict';
import {jambCombinationPayload,validateJambCombination,validateJambVerification,validateJambProgrammeVerification,validateJambEntryRequirements,buildStudentJambProgramme,validateJambProgrammeDiscovery} from '../src/jamb-catalogue.js';

const valid={
 examYear:2027,institutionName:'University A',programmeName:'Computer Science',
 englishLanguageRequired:true,requiredSubjects:['Mathematics','Physics','Chemistry'],
 alternativeSubjects:[],alternativeSubjectCount:0,
 sourceReference:'https://ibass.jamb.gov.ng/brochure-courses?id=101&school=UNIVERSITY+A',additionalNotes:''
};

test('accepts an institution and course-specific combination with English plus three subjects',()=>{
 const row=jambCombinationPayload(valid);
 assert.equal(validateJambCombination(row),true);
 assert.equal(row.english_language_required,true);
 assert.equal(row.source_verified,false);
});

test('rejects combinations that omit compulsory English Language',()=>{
 assert.equal(validateJambCombination(jambCombinationPayload({...valid,englishLanguageRequired:false})),false);
});

test('rejects fewer or more than three remaining subject slots',()=>{
 assert.equal(validateJambCombination(jambCombinationPayload({...valid,requiredSubjects:['Mathematics','Physics']})),false);
 assert.equal(validateJambCombination(jambCombinationPayload({...valid,requiredSubjects:['Mathematics','Physics','Chemistry','Biology']})),false);
});

test('supports alternative-subject slots while keeping three remaining selections',()=>{
 const row=jambCombinationPayload({...valid,requiredSubjects:['Mathematics','Physics'],alternativeSubjects:['Chemistry','Biology'],alternativeSubjectCount:1});
 assert.equal(validateJambCombination(row),true);
});

test('rejects duplicate subjects and missing institution/course/source',()=>{
 assert.equal(validateJambCombination(jambCombinationPayload({...valid,requiredSubjects:['Mathematics','mathematics','Chemistry']})),false);
 assert.equal(validateJambCombination(jambCombinationPayload({...valid,institutionName:''})),false);
 assert.equal(validateJambCombination(jambCombinationPayload({...valid,programmeName:''})),false);
 assert.equal(validateJambCombination(jambCombinationPayload({...valid,sourceReference:''})),false);
});

test('new combinations are always provisional regardless of client verification input',()=>{
 assert.equal(jambCombinationPayload({...valid,sourceVerified:true}).source_verified,false);
});

const saved={exam_year:2027,institution_name:'University A',programme_name:'Computer Science',english_language_required:true,required_subjects:['Mathematics','Physics','Chemistry'],alternative_subjects:[],alternative_subject_count:0,subject_group_rules:[]};
const verification={examYear:2027,institutionName:'University A',programmeName:'Computer Science',sourceReference:'https://ibass.jamb.gov.ng/brochure-courses?id=101&school=UNIVERSITY+A',verificationNotes:'Checked exact University A Computer Science listing for the 2027 UTME year.',requiredSubjects:['Mathematics','Physics','Chemistry'],alternativeSubjects:[],subjectGroupRules:[]};

test('accepts verification evidence only for the exact saved institution, programme and year',()=>{
 assert.equal(validateJambVerification(saved,verification).valid,true);
 assert.equal(validateJambVerification(saved,{...verification,programmeName:'Software Engineering'}).valid,false);
 assert.equal(validateJambVerification(saved,{...verification,examYear:2026}).valid,false);
});

test('rejects non-JAMB, insecure and malformed verification source URLs',()=>{
 assert.equal(validateJambVerification(saved,{...verification,sourceReference:'http://eligibility.jamb.gov.ng/'}).valid,false);
 assert.equal(validateJambVerification(saved,{...verification,sourceReference:'https://example.com/'}).valid,false);
 assert.equal(validateJambVerification(saved,{...verification,sourceReference:'not-a-url'}).valid,false);
});

test('rejects UTME verification against another institution IBASS brochure',()=>{
 const otherSource='https://ibass.jamb.gov.ng/brochure-courses?id=371&school=UNIVERSITY+B';
 assert.equal(validateJambVerification(saved,verification,'https://ibass.jamb.gov.ng/brochure-courses?id=101&school=UNIVERSITY+A').valid,true);
 assert.equal(validateJambVerification(saved,verification,otherSource).valid,false);
});
test('rejects checked subjects that differ from the saved provisional rule',()=>{
 assert.equal(validateJambVerification(saved,{...verification,requiredSubjects:['Mathematics','Physics','Biology']}).valid,false);
});

test('requires meaningful source verification notes',()=>{
 assert.equal(validateJambVerification(saved,{...verification,verificationNotes:'checked'}).valid,false);
});

test('rejects verification when English Language is not fixed in the saved rule',()=>{
 assert.equal(validateJambVerification({...saved,english_language_required:false},verification).valid,false);
});

test('normalizes verified subject order to the saved rule for database evidence checks',()=>{
 const result=validateJambVerification(saved,{...verification,requiredSubjects:['Chemistry','Mathematics','Physics']});
 assert.equal(result.valid,true);
 assert.deepEqual(result.required,saved.required_subjects);
});

test('supports official IBASS subject groups within the three remaining subject slots',()=>{
 const row=jambCombinationPayload({...valid,requiredSubjects:['Mathematics','Physics'],subjectGroupRules:[{name:'Biological science option',subjects:['Biology','Agricultural Science'],choose:1}]});
 assert.equal(validateJambCombination(row),true);
});
test('rejects subject groups that exceed the three remaining subject slots',()=>{
 const row=jambCombinationPayload({...valid,requiredSubjects:['Mathematics','Physics'],subjectGroupRules:[{name:'Options',subjects:['Biology','Agricultural Science'],choose:2}]});
 assert.equal(validateJambCombination(row),false);
});
test('rejects duplicate subject-group names and malformed group rules',()=>{
 const duplicate=jambCombinationPayload({...valid,requiredSubjects:['Mathematics'],subjectGroupRules:[{name:'Options',subjects:['Biology','Agricultural Science'],choose:1},{name:'options',subjects:['Chemistry','Physics'],choose:1}]});
 const malformed=jambCombinationPayload({...valid,requiredSubjects:['Mathematics','Physics'],subjectGroupRules:[{name:'Options',subjects:['Biology'],choose:0}]});
 assert.equal(validateJambCombination(duplicate),false);
 assert.equal(validateJambCombination(malformed),false);
});
test('requires exact subject-group evidence before recording IBASS verification',()=>{
 const existing={...saved,required_subjects:['Mathematics','Physics'],subject_group_rules:[{name:'Options',subjects:['Biology','Agricultural Science'],choose:1}]};
 const checked={...verification,requiredSubjects:['Mathematics','Physics'],subjectGroupRules:[{name:'Options',subjects:['Agricultural Science','Biology'],choose:1}]};
 assert.equal(validateJambVerification(existing,checked).valid,true);
 assert.equal(validateJambVerification(existing,{...checked,subjectGroupRules:[{name:'Options',subjects:['Biology','Chemistry'],choose:1}]}).valid,false);
});

test('requires enough alternative subjects for the declared choice count',()=>{
 const row=jambCombinationPayload({...valid,requiredSubjects:['Mathematics','Physics'],alternativeSubjects:['Chemistry'],alternativeSubjectCount:2});
 assert.equal(validateJambCombination(row),false);
});
test('rejects subject duplication across required, alternative and grouped choices',()=>{
 const requiredAlternative=jambCombinationPayload({...valid,requiredSubjects:['Mathematics','Physics'],alternativeSubjects:['Mathematics','Chemistry'],alternativeSubjectCount:1});
 const requiredGroup=jambCombinationPayload({...valid,requiredSubjects:['Mathematics','Physics'],subjectGroupRules:[{name:'Options',subjects:['Physics','Biology'],choose:1}]});
 const duplicateGroups=jambCombinationPayload({...valid,requiredSubjects:['Mathematics'],subjectGroupRules:[{name:'First',subjects:['Biology','Chemistry'],choose:1},{name:'Second',subjects:['Chemistry','Agriculture'],choose:1}]});
 assert.equal(validateJambCombination(requiredAlternative),false);
 assert.equal(validateJambCombination(requiredGroup),false);
 assert.equal(validateJambCombination(duplicateGroups),false);
});

const savedProgramme={id:'programme-1',institution_id:'institution-1',exam_year:2027,programme_name:'Software Engineering'};
const programmeEvidence={institutionId:'institution-1',examYear:2027,programmeName:'Software Engineering',sourceReference:'https://ibass.jamb.gov.ng/brochure-courses?id=101&school=UNIVERSITY+OF+BENIN',verificationNotes:'Checked the exact programme name under the selected institution and confirmed its admission-year applicability in IBASS.'};
test('accepts programme verification only for the exact institution, programme, year and IBASS page',()=>{
 assert.equal(validateJambProgrammeVerification(savedProgramme,programmeEvidence,'https://ibass.jamb.gov.ng/brochure-courses?id=101&school=UNIVERSITY+OF+BENIN').valid,true);
 assert.equal(validateJambProgrammeVerification(savedProgramme,{...programmeEvidence,institutionId:'institution-2'},'https://ibass.jamb.gov.ng/brochure-courses?id=101').valid,false);
 assert.equal(validateJambProgrammeVerification(savedProgramme,{...programmeEvidence,examYear:2026},'https://ibass.jamb.gov.ng/brochure-courses?id=101').valid,false);
 assert.equal(validateJambProgrammeVerification(savedProgramme,{...programmeEvidence,programmeName:'Computer Science'},'https://ibass.jamb.gov.ng/brochure-courses?id=101').valid,false);
});
test('rejects non-IBASS programme verification URLs and incomplete evidence',()=>{
 assert.equal(validateJambProgrammeVerification(savedProgramme,{...programmeEvidence,sourceReference:'https://jamb.gov.ng/FAQ'},'https://ibass.jamb.gov.ng/brochure-courses?id=101').valid,false);
 assert.equal(validateJambProgrammeVerification(savedProgramme,{...programmeEvidence,sourceReference:'http://ibass.jamb.gov.ng/brochure-courses?id=101'},'https://ibass.jamb.gov.ng/brochure-courses?id=101').valid,false);
 assert.equal(validateJambProgrammeVerification(savedProgramme,{...programmeEvidence,verificationNotes:'listed'},'https://ibass.jamb.gov.ng/brochure-courses?id=101').valid,false);
});

test('rejects an IBASS programme page belonging to a different institution',()=>{
 const otherInstitution='https://ibass.jamb.gov.ng/brochure-courses?id=371&school=GREENFIELD+UNIVERSITY';
 assert.equal(validateJambProgrammeVerification(savedProgramme,programmeEvidence,'https://ibass.jamb.gov.ng/brochure-courses?id=101&school=UNIVERSITY+OF+BENIN').valid,true);
 assert.equal(validateJambProgrammeVerification(savedProgramme,programmeEvidence,'https://ibass.jamb.gov.ng/brochure-courses?id=371&school=GREENFIELD+UNIVERSITY').valid,false);
 assert.ok(otherInstitution.includes('id=371'));
});


const entryProgramme={institution_id:'institution-1',exam_year:2027,programme_name:'Computer Science',source_verified:true};
const entryInstitutionSource='https://ibass.jamb.gov.ng/brochure-courses?id=101&school=UNIVERSITY+A';
const validEntry={institutionId:'institution-1',examYear:2027,programmeName:'Computer Science',olevelRequirements:{requiredSubjects:['English Language','Mathematics'],subjectGroups:[{name:'Science subject',subjects:['Physics','Chemistry','Biology'],choose:2}]},directEntryRequirements:{requiredSubjects:['Mathematics'],subjectGroups:[],acceptedQualifications:['A-Level passes in relevant subjects']},sourceReference:entryInstitutionSource,verificationNotes:'Checked the exact Computer Science row and entry requirements on the selected institution IBASS brochure.'};
test('validates O-Level and Direct Entry requirements independently from UTME combinations',()=>{
 const result=validateJambEntryRequirements(entryProgramme,validEntry,entryInstitutionSource);
 assert.equal(result.valid,true);
 assert.deepEqual(result.olevel,validEntry.olevelRequirements);
 assert.deepEqual(result.direct,validEntry.directEntryRequirements);
});
test('rejects entry requirement verification for a different institution or year',()=>{
 assert.equal(validateJambEntryRequirements(entryProgramme,{...validEntry,institutionId:'institution-2'},entryInstitutionSource).valid,false);
 assert.equal(validateJambEntryRequirements(entryProgramme,{...validEntry,examYear:2026},entryInstitutionSource).valid,false);
});
test('rejects entry requirements from another institution IBASS page',()=>{
 assert.equal(validateJambEntryRequirements(entryProgramme,{...validEntry,sourceReference:'https://ibass.jamb.gov.ng/brochure-courses?id=371'},entryInstitutionSource).valid,false);
});
test('rejects unverified programme listings and malformed O-Level subject groups',()=>{
 assert.equal(validateJambEntryRequirements({...entryProgramme,source_verified:false},validEntry,entryInstitutionSource).valid,false);
 assert.equal(validateJambEntryRequirements(entryProgramme,{...validEntry,olevelRequirements:{requiredSubjects:[],subjectGroups:[{name:'Choose one',subjects:['Biology'],choose:2}]}},entryInstitutionSource).valid,false);
});


test('student JAMB projection returns only verified combinations for the exact programme and year',()=>{
 const programme={id:'programme-1',institution_id:'institution-1',exam_year:2027,programme_name:'Computer Science',programme_category:'Computing',entry_requirements_source_verified:false,olevel_requirements:{requiredSubjects:['English Language']},direct_entry_requirements:{requiredSubjects:['Mathematics']}};
 const base={id:'combination-1',institution_id:'institution-1',programme_id:'programme-1',exam_year:2027,active:true,source_verified:true,english_language_required:true,required_subjects:['Mathematics','Physics','Chemistry']};
 const result=buildStudentJambProgramme(programme,[base,{...base,id:'unverified',source_verified:false},{...base,id:'wrong-course',programme_id:'programme-2'},{...base,id:'wrong-year',exam_year:2026},{...base,id:'inactive',active:false}]);
 assert.equal(result.utmeCombinations.length,1);
 assert.equal(result.utmeCombinations[0].id,'combination-1');
 assert.equal(result.olevelRequirements,null);
 assert.equal(result.directEntryRequirements,null);
});
test('student JAMB projection exposes O-Level and Direct Entry only after independent verification',()=>{
 const programme={id:'programme-1',institution_id:'institution-1',exam_year:2027,programme_name:'Computer Science',entry_requirements_source_verified:true,olevel_requirements:{requiredSubjects:['English Language','Mathematics']},direct_entry_requirements:{acceptedQualifications:['A-Level']}};
 const result=buildStudentJambProgramme(programme,[]);
 assert.deepEqual(result.olevelRequirements,programme.olevel_requirements);
 assert.deepEqual(result.directEntryRequirements,programme.direct_entry_requirements);
 assert.deepEqual(result.utmeCombinations,[]);
});

const discoveryInstitution={id:'institution-1',active:true,source_verified:true,official_source_reference:'https://ibass.jamb.gov.ng/brochure-courses?id=101&school=UNIVERSITY+A'};
test('bulk IBASS discovery accepts exact institution page and de-duplicates programme names',()=>{
 const result=validateJambProgrammeDiscovery(discoveryInstitution,{examYear:2027,programmeNames:['Computer Science','Mathematics',' computer science '],sourceReference:discoveryInstitution.official_source_reference,discoveryNotes:'Copied course names from the official institution programme listing.'});
 assert.equal(result.valid,true);
 assert.deepEqual(result.programmeNames,['Computer Science','Mathematics']);
});
test('bulk IBASS discovery refuses unverified institutions and mismatched IBASS pages',()=>{
 assert.equal(validateJambProgrammeDiscovery({...discoveryInstitution,source_verified:false},{examYear:2027,programmeNames:['Computer Science'],sourceReference:discoveryInstitution.official_source_reference,discoveryNotes:'Copied from the programme listing.'}).valid,false);
 assert.equal(validateJambProgrammeDiscovery(discoveryInstitution,{examYear:2027,programmeNames:['Computer Science'],sourceReference:'https://ibass.jamb.gov.ng/brochure-courses?id=102',discoveryNotes:'Copied from the programme listing.'}).valid,false);
});
test('bulk IBASS discovery rejects empty, malformed, or oversized course lists',()=>{
 const base={examYear:2027,sourceReference:discoveryInstitution.official_source_reference,discoveryNotes:'Copied from the programme listing.'};
 assert.equal(validateJambProgrammeDiscovery(discoveryInstitution,{...base,programmeNames:[]}).valid,false);
 assert.equal(validateJambProgrammeDiscovery(discoveryInstitution,{...base,programmeNames:['x']}).valid,false);
 assert.equal(validateJambProgrammeDiscovery(discoveryInstitution,{...base,programmeNames:Array(501).fill('Computer Science')}).valid,false);
});

test('rejects English Language repeated inside required, alternative and grouped UTME subject slots',()=>{
 const required=jambCombinationPayload({...valid,requiredSubjects:['English Language','Mathematics','Physics']});
 const alternative=jambCombinationPayload({...valid,requiredSubjects:['Mathematics','Physics'],alternativeSubjects:['English Language','Biology'],alternativeSubjectCount:1});
 const grouped=jambCombinationPayload({...valid,requiredSubjects:['Mathematics','Physics'],subjectGroupRules:[{name:'Options',subjects:['English Language','Biology'],choose:1}]});
 assert.equal(validateJambCombination(required),false);
 assert.equal(validateJambCombination(alternative),false);
 assert.equal(validateJambCombination(grouped),false);
});
test('requires an exact IBASS brochure path and institution ID for programme verification',()=>{
 const existing={id:'p1',institution_id:'institution-1',exam_year:2027,programme_name:'Computer Science'};
 const base={institutionId:'institution-1',examYear:2027,programmeName:'Computer Science',sourceReference:'https://ibass.jamb.gov.ng/brochure-courses?id=101',verificationNotes:'Checked the exact Computer Science listing for this institution and year.'};
 const institutionSource='https://ibass.jamb.gov.ng/brochure-courses?id=101';
 assert.equal(validateJambProgrammeVerification(existing,base,institutionSource).valid,true);
 assert.equal(validateJambProgrammeVerification(existing,{...base,sourceReference:'https://ibass.jamb.gov.ng/brochure-courses/101?id=101'},institutionSource).valid,false);
 assert.equal(validateJambProgrammeVerification(existing,base,'https://ibass.jamb.gov.ng/brochure-courses?id=102').valid,false);
});
