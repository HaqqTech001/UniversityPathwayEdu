export const moneyNGN=value=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN'}).format(Number(value));
const monthLabel=value=>new Date(value+'T12:00:00Z').toLocaleDateString('en-NG',{month:'long',year:'numeric',timeZone:'UTC'});
function compose({name,studentName,programme,oldAmount,newAmount,effectiveMonth,guardian}){
 const subject='Important Notice: Monthly Lesson Fee Adjustment — '+programme;
 const greeting=name?'Dear '+name+',':guardian?'Dear Parent/Guardian,':'Dear Student,';
 const introduction=guardian
 ?'We hope this message finds you and your family well. The management of University Pathway Educational Consult is writing to formally notify you of an adjustment to the monthly lesson fees for your ward, '+studentName+'.'
 :'We hope this message finds you well. The management of University Pathway Educational Consult is writing to inform you of an adjustment to the monthly lesson fees for your registered programme.';
 const lines=[greeting,'','NOTICE OF MONTHLY LESSON FEE ADJUSTMENT','',introduction,'',
 'Student: '+studentName,'Registered programme: '+programme,
 'Previous monthly lesson fee: '+(oldAmount===null?'Not previously set':moneyNGN(oldAmount)),
 'Revised monthly lesson fee: '+moneyNGN(newAmount),
 'Effective from: '+monthLabel(effectiveMonth),'',
 'The revised fee will apply from the effective month stated above. Charges already issued for previous months will not be changed automatically.','',
 'We understand that adjustments to educational expenses require planning. We appreciate your understanding and continued commitment to quality education.',
 'If you need clarification, kindly contact the UPEC Admissions & Accounts Office through the institution’s official channels. Please use only officially confirmed payment instructions.','',
 'Thank you for your continued trust in University Pathway Educational Consult.','',
 'Yours faithfully,','Admissions & Accounts Office','University Pathway Educational Consult','23 Olaiya Street, Sawmill Garage, Ilorin, Kwara State.'];
 return {subject,text:lines.join('\n')};
}
export function lessonFeeChangeEmail(input){return compose({...input,guardian:true});}
export function studentLessonFeeChangeEmail(input){return compose({...input,guardian:false});}
