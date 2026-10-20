export const moneyNGN=value=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN'}).format(Number(value));
export function lessonFeeChangeEmail({guardianName,studentName,programme,oldAmount,newAmount,effectiveMonth}){
 const greeting=guardianName?'Dear '+guardianName+',':'Dear Parent/Guardian,';
 const when=new Date(effectiveMonth+'T12:00:00Z').toLocaleDateString('en-NG',{month:'long',year:'numeric',timeZone:'UTC'});
 const subject='UPEC Notice: Monthly Lesson Fee Update — '+programme;
 const text=[greeting,'','NOTICE OF MONTHLY LESSON FEE ADJUSTMENT','', 'University Pathway Educational Consult (UPEC) wishes to inform you of a change to the monthly lesson fee for the programme registered by your child/ward.','',
 'Student: '+studentName,'Programme: '+programme,'Previous monthly fee: '+moneyNGN(oldAmount),'New monthly fee: '+moneyNGN(newAmount),'Effective from: '+when,'',
 'This adjustment applies from the effective month stated above. Previously issued fee records are not changed automatically.','',
 'For clarification, please contact UPEC administration before making any payment. Please rely on official payment instructions provided through the institution.','',
 'Thank you for your continued trust and support.','', 'Admissions & Accounts Office','University Pathway Educational Consult','23 Olaiya Street, Sawmill Garage, Ilorin, Kwara State.'].join('\n');
 return {subject,text};
}
