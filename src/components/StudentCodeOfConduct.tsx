import React from 'react';

export const studentConductRules=[
 ['Be Punctual','Students must arrive early and attend all scheduled classes, tests, tutorials, and examinations.'],
 ['Respect Everyone','Students must respect teachers, staff, fellow students, and visitors. Fighting, bullying, abusive language, harassment, and disrespectful behaviour are strictly prohibited.'],
 ['Maintain Academic Discipline','Students must participate actively in lessons, complete assignments, and prepare adequately for examinations.'],
 ['No Examination Malpractice','Cheating, impersonation, copying, plagiarism, or assisting another student to cheat will attract serious disciplinary action.'],
 ['Use Mobile Phones Responsibly','Phones must be kept on silent mode during classes. Calls, social media, games, and videos are not allowed during lessons without permission.'],
 ['Dress Decently','Students must appear neat, clean, and properly dressed at all times.'],
 ['Protect School Property','Students must not damage chairs, tables, boards, electrical equipment, or any other property. Any damaged property may be repaired or replaced at the student’s expense.'],
 ['Keep the Environment Clean','Students must dispose of waste properly and help maintain a clean and conducive learning environment.'],
 ['No Dangerous or Illegal Items','Weapons, alcohol, cigarettes, illicit drugs, gambling materials, and other prohibited items are not allowed within the premises.'],
 ['No Unauthorised Movement','Students must not leave the centre during classes or scheduled activities without permission.'],
 ['Use Official Platforms Responsibly','Students must communicate respectfully on Pathway WhatsApp groups and other official platforms. Posting offensive, misleading, or unrelated content is prohibited.'],
 ['Obey Management Instructions','Students must comply with all academic, administrative, safety, and security instructions issued by the management.'],
 ['No Sexual or Romantic Relationships','Students are strictly prohibited from engaging in sexual intimacy, inappropriate physical contact, or boyfriend/girlfriend relationships within Pathway Educational Consults.'],
 ['Prompt Payment of Fees','All approved fees and other required payments must be paid immediately when they become due. Students are expected to meet all payment deadlines communicated by the Management. Failure to make payment as and when due may result in appropriate administrative action, including restriction from classes, tests, examinations, or other services until the outstanding payment is settled.']
] as const;

export default function StudentCodeOfConduct(){
 return <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-16" aria-labelledby="conduct-heading">
  <div className="rounded-3xl bg-[#111A43] px-6 py-9 text-white sm:px-10"><span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#f8c46b]">University Pathway Educational Consult</span><h1 id="conduct-heading" className="mt-3 font-serif text-3xl font-bold sm:text-4xl">Students’ Code of Conduct</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-slate-100">This Code of Conduct is established to promote discipline, academic excellence, mutual respect, safety, and responsible behaviour among all students of Pathway Educational Consults. All students are expected to maintain discipline, respect, and commitment to academic excellence at all times.</p></div>
  <ol className="mt-8 grid gap-4">{studentConductRules.map(([title,description],index)=><li key={title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#c62839]/10 font-extrabold text-[#c62839]">{index+1}</span><div><h2 className="font-bold text-[#111A43]">{title}</h2><p className="mt-1 text-sm leading-7 text-slate-700">{description}</p></div></li>)}</ol>
  <p className="mt-6 text-xs leading-6 text-slate-600">Source: UPEC Students’ Code of Conduct poster supplied by the institution. Policy text must be approved by management before formal acceptance records are collected.</p>
 </section>;
}
