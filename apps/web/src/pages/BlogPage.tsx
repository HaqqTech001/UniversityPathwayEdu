import NewsPage from './NewsPage';
import EducationNews from '../components/EducationNews';
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, Clock3, Copy, Search, X } from 'lucide-react';

type PageProps = { onNavigate: (path: string) => void };
type Category = 'Study Strategies' | 'Exam Preparation' | 'Admissions Guidance';
type Article = { slug: string; category: Category; title: string; excerpt: string; minutes: number; sections: { heading: string; body: string }[] };
const articles: Article[] = [
  { slug:'build-a-realistic-study-plan', category:'Study Strategies', title:'How to build a study plan you can actually follow', excerpt:'Organise your subjects, revision sessions and breaks without overwhelming yourself.', minutes:4, sections:[
    {heading:'Identify what needs attention',body:'List your subjects and the topics you find difficult. Use your class notes, syllabus and feedback from practice questions to identify learning gaps.'},
    {heading:'Schedule realistic sessions',body:'Assign specific topics to manageable study periods. Allow time for rest, school activities and changes to your routine. Consistency matters more than an overfilled timetable.'},
    {heading:'Practise active recall',body:'After reading a topic, close your notes and try explaining it in your own words. Attempt relevant practice questions and review what you missed.'},
    {heading:'Adjust every week',body:'Check what you completed and what still needs attention. Update your next study plan based on progress rather than trying to follow an unrealistic schedule.'}
  ]},
  { slug:'prepare-for-exam-day', category:'Exam Preparation', title:'A practical checklist for the days before an examination', excerpt:'Prepare for exam day with a calm, practical routine and reliable information.', minutes:3, sections:[
    {heading:'Check official instructions',body:'Confirm your timetable, venue, identification requirements and permitted materials through the relevant examination body or institution. Avoid relying on forwarded messages.'},
    {heading:'Revise strategically',body:'Focus on key ideas, topics you have found difficult and common mistakes. Practise under reasonable time limits without exhausting yourself.'},
    {heading:'Prepare the essentials',body:'Organise the items you are permitted to bring and plan your journey to the venue. Make room for unexpected delays.'},
    {heading:'Take care of yourself',body:'Get adequate rest, eat appropriately and arrive with enough time to settle. Read each question carefully and keep an eye on the available time.'}
  ]},
  { slug:'questions-before-choosing-a-programme', category:'Admissions Guidance', title:'Questions to ask before choosing an academic programme', excerpt:'A framework for comparing study options and confirming details from trustworthy sources.', minutes:4, sections:[
    {heading:'Understand your goal',body:'Consider what you want to study and which skills or qualifications the programme is designed to develop.'},
    {heading:'Verify eligibility',body:'Check current entry requirements, subject combinations and accepted qualifications directly with the institution or relevant official body. Requirements may change.'},
    {heading:'Ask about learning support',body:'Find out about the teaching approach, assessments, study resources and available guidance before making a decision.'},
    {heading:'Confirm dates and costs',body:'Request current written information on schedules, fees, deadlines and policies before committing to a programme.'}
  ]},
  { slug:'learn-from-practice-questions', category:'Study Strategies', title:'How to learn more from practice questions', excerpt:'Use mistakes and feedback to make each revision session more useful.', minutes:3, sections:[
    {heading:'Try the questions first',body:'Attempt a small set of relevant questions before checking answers. This reveals what you understand without assistance.'},
    {heading:'Find the reason for mistakes',body:'Decide whether you misunderstood the concept, misread the question or struggled with time management. Record the reason.'},
    {heading:'Revisit the underlying topic',body:'Return to the relevant notes or textbook, then try a similar question. Focus on understanding the method rather than memorising one answer.'},
    {heading:'Check again later',body:'Reattempt challenging topics after a gap to see whether you can still explain and apply what you learned.'}
  ]}
];
const categories = ['All articles', 'Admissions Guidance', 'Exam Preparation', 'Study Strategies'] as const;
const cardTones = ['bg-[#e9edf7]', 'bg-[#f9eee8]', 'bg-[#edf2e9]', 'bg-[#f3eaf2]'];

function ArticleCard({ article, index, onNavigate }: { article: Article; index: number; onNavigate: PageProps['onNavigate'] }) {
  return <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
    <button type="button" onClick={() => onNavigate('/blog/'+article.slug)} className="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C62839]">
      <div className={`flex h-44 items-center justify-center ${cardTones[index%cardTones.length]}`} aria-hidden="true"><BookOpen size={56} strokeWidth={1.2} className="text-[#111A43]/40"/></div>
      <div className="p-6"><span className="text-[11px] font-extrabold uppercase tracking-wider text-[#C62839]">{article.category}</span><h3 className="mt-3 text-xl font-extrabold leading-snug text-[#111A43] group-hover:text-[#C62839]">{article.title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{article.excerpt}</p><div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-[#111A43]"><span className="inline-flex items-center gap-2 text-slate-500"><Clock3 size={15}/>{article.minutes} min read</span><span className="inline-flex items-center gap-2">Read guide <ArrowRight size={16}/></span></div></div>
    </button>
  </article>;
}

export default function BlogPage({ onNavigate, initialSection='articles' }: PageProps & {initialSection?:'articles'|'news'}) {
  const [section,setSection]=useState<'articles'|'news'>(initialSection);
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState<string>('All articles');
  const [copied,setCopied]=useState(false);
  const [remotePosts,setRemotePosts]=useState<Article[]>([]);
  useEffect(()=>{
    const controller=new AbortController();
    fetch((import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'')+'/api/blog/posts',{signal:controller.signal})
      .then(r=>r.ok?r.json():Promise.reject(new Error('Blog unavailable')))
      .then(data=>{if(Array.isArray(data.posts))setRemotePosts(data.posts);})
      .catch(()=>{});
    return()=>controller.abort();
  },[]);
  const available=useMemo(()=>[...remotePosts,...articles.filter(item=>!remotePosts.some(post=>post.slug===item.slug))],[remotePosts]);
  const slug = typeof window !== 'undefined' ? decodeURIComponent(window.location.pathname.split('/').filter(Boolean)[1] || '') : '';
  const selected = available.find(a=>a.slug===slug);
  const filtered = useMemo(()=>available.filter(a=>(category==='All articles'||a.category===category)&&[a.title,a.excerpt,a.category].join(' ').toLowerCase().includes(query.trim().toLowerCase())),[query,category,available]);
  const navigate=(path:string)=>{setCopied(false);onNavigate(path)};
  if(slug&&!selected) return <main className="mx-auto max-w-4xl px-5 py-28 text-center"><h1 className="text-4xl font-extrabold text-[#111A43]">Article not found</h1><p className="mt-4 text-slate-600">This guide is unavailable or its address is incorrect.</p><button type="button" onClick={()=>navigate('/blog')} className="mt-7 font-bold text-[#C62839] underline">Back to academic insights</button></main>;
  if(selected) {
    const related=articles.filter(a=>a.slug!==selected.slug&&a.category===selected.category).slice(0,2);
    return <main className="bg-[#F7F8FC]"><div className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
      <button type="button" onClick={()=>navigate('/blog')} className="inline-flex items-center gap-2 text-sm font-bold text-[#C62839] hover:underline"><ArrowLeft size={16}/> Back to insights</button>
      <header className="mt-12"><span className="text-xs font-extrabold uppercase tracking-widest text-[#C62839]">{selected.category} · Sample guide</span><h1 className="mt-5 text-4xl font-extrabold leading-tight text-[#111A43] sm:text-5xl">{selected.title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{selected.excerpt}</p><div className="mt-7 flex flex-wrap items-center gap-6 border-y border-slate-200 py-5 text-sm text-slate-500"><span className="inline-flex items-center gap-2"><Clock3 size={16}/>{selected.minutes} min read</span><button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(window.location.href);setCopied(true)}catch{setCopied(false)}}} className="inline-flex items-center gap-2 font-semibold text-[#111A43] hover:text-[#C62839]">{copied?<Check size={16}/>:<Copy size={16}/>} {copied?'Link copied':'Copy link'}</button></div></header>
      <article className="mt-10 rounded-2xl bg-white px-6 py-10 shadow-sm sm:px-12">{selected.sections.map(s=><section key={s.heading} className="mb-9 last:mb-0"><h2 className="text-2xl font-bold text-[#111A43]">{s.heading}</h2><p className="mt-4 text-base leading-8 text-slate-700">{s.body}</p></section>)}<p className="mt-10 border-t border-slate-200 pt-6 text-sm leading-7 text-slate-500">Sample general educational guidance, not official admissions advice or examination policy. Confirm current requirements with the relevant institution or examination body.</p></article>
      {related.length>0&&<section className="mt-14"><h2 className="mb-6 text-2xl font-extrabold text-[#111A43]">Continue reading</h2><div className="grid gap-6 sm:grid-cols-2">{related.map((a,i)=><ArticleCard key={a.slug} article={a} index={i} onNavigate={navigate}/>)}</div></section>}
      <div className="mt-14 flex flex-wrap gap-3"><button type="button" onClick={()=>navigate('/contact')} className="rounded-full bg-[#C62839] px-6 py-3 text-sm font-bold text-white hover:bg-red-700">Speak with our team</button><button type="button" onClick={()=>navigate('/programmes')} className="rounded-full border border-[#111A43] px-6 py-3 text-sm font-bold text-[#111A43] hover:bg-white">Explore programmes</button></div>
    </div></main>;
  }
  return <main className="bg-[#F7F8FC]">
    <section className="relative overflow-hidden bg-[#111A43] px-5 py-20 text-white sm:px-8 sm:py-28"><div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border-[65px] border-white/5"/><div className="relative mx-auto max-w-7xl"><span className="text-xs font-extrabold uppercase tracking-[.25em] text-[#D5A75B]">Academic insights</span><h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-tight sm:text-6xl">Ideas, guidance & opportunities for your academic journey.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">Practical study strategies, examination preparation tips and guidance for choosing your next academic step.</p><p className="mt-6 text-xs font-semibold text-[#D5A75B]">Sample educational guides · Not official announcements</p></div></section>
    <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8"><div className="flex flex-wrap gap-3 rounded-2xl border border-[#dce4ef] bg-white p-2 shadow-sm" role="tablist" aria-label="Blog content categories"><button type="button" role="tab" aria-selected={section==='articles'} onClick={()=>setSection('articles')} className={`min-w-[145px] flex-1 rounded-xl px-5 py-3 text-sm font-bold transition-all duration-200 ${section==='articles'?'bg-[#111A43] text-white shadow-md':'text-[#111A43] hover:bg-[#f2f5fb]'}`}>Articles & Guides</button><button type="button" role="tab" aria-selected={section==='news'} onClick={()=>setSection('news')} className={`min-w-[145px] flex-1 rounded-xl px-5 py-3 text-sm font-bold transition-all duration-200 ${section==='news'?'bg-[#C62839] text-white shadow-md':'text-[#111A43] hover:bg-[#fff2f3]'}`}>Education News & Updates</button></div></div>
    {section==='news'?<div className="mx-auto max-w-7xl px-5 py-8 sm:px-8" role="tabpanel"><NewsPage onNavigate={navigate} embedded/></div>:<div className="mx-auto max-w-7xl px-5 py-16 sm:px-8" role="tabpanel"><div className="mb-8 flex items-center gap-3"><span className="h-1 w-9 bg-[#C62839]"/><span className="text-xs font-extrabold uppercase tracking-widest text-[#C62839]">Featured guide</span></div><button type="button" onClick={()=>navigate('/blog/'+articles[0].slug)} className="group grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition hover:shadow-lg md:grid-cols-2"><div className="flex min-h-64 items-center justify-center bg-[#e9edf7]" aria-hidden="true"><BookOpen size={100} strokeWidth={1} className="text-[#111A43]/35"/></div><div className="flex flex-col justify-center p-8 sm:p-12"><span className="text-xs font-extrabold uppercase tracking-widest text-[#C62839]">{articles[0].category}</span><h2 className="mt-4 text-3xl font-extrabold leading-tight text-[#111A43] group-hover:text-[#C62839]">{articles[0].title}</h2><p className="mt-5 leading-8 text-slate-600">{articles[0].excerpt}</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#C62839]">Read featured guide <ArrowRight size={17}/></span></div></button>
      <section className="mt-20" aria-labelledby="articles-heading"><span className="text-xs font-extrabold uppercase tracking-widest text-[#C62839]">Knowledge centre</span><h2 id="articles-heading" className="mt-3 text-3xl font-extrabold text-[#111A43] sm:text-4xl">Explore our articles</h2><p className="mt-3 text-slate-600">Find a guide for your learning journey.</p><div className="mt-8 flex flex-col gap-5"><label className="relative block max-w-xl"><Search size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"/><span className="sr-only">Search articles</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search guides and topics" className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-5 text-sm text-[#111A43] outline-none focus:border-[#C62839] focus:ring-2 focus:ring-[#C62839]/20"/></label><div className="flex flex-wrap gap-2" aria-label="Filter articles by category">{categories.map(c=><button type="button" key={c} aria-pressed={category===c} onClick={()=>setCategory(c)} className={`rounded-full border px-4 py-2 text-sm font-bold transition ${category===c?'border-[#111A43] bg-[#111A43] text-white':'border-slate-300 bg-white text-slate-700 hover:border-[#111A43]'}`}>{c}</button>)}</div></div><p className="my-6 text-sm text-slate-500" aria-live="polite">Showing {filtered.length} {filtered.length===1?'guide':'guides'}</p>{filtered.length?<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{filtered.map((a,i)=><ArticleCard key={a.slug} article={a} index={i} onNavigate={navigate}/>)}</div>:<div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center"><Search size={35} className="mx-auto text-slate-400"/><h3 className="mt-4 text-xl font-bold text-[#111A43]">No matching guides</h3><p className="mt-2 text-slate-600">Try another search or category.</p><button type="button" onClick={()=>{setQuery('');setCategory('All articles')}} className="mt-5 inline-flex items-center gap-2 font-bold text-[#C62839]"><X size={16}/>Clear filters</button></div>}</section>
      <section className="mt-20 rounded-3xl bg-[#111A43] px-8 py-12 text-white sm:px-12"><h2 className="text-3xl font-extrabold">Need guidance on your next step?</h2><p className="mt-4 max-w-2xl leading-8 text-white/75">Explore available academic preparation options or contact our team with your questions.</p><div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={()=>navigate('/contact')} className="rounded-full bg-[#C62839] px-6 py-3 text-sm font-bold text-white hover:bg-red-700">Contact our team</button><button type="button" onClick={()=>navigate('/programmes')} className="rounded-full border border-white/40 px-6 py-3 text-sm font-bold text-white hover:bg-white/10">Explore programmes</button></div></section>
    </div>}
  </main>;
}
