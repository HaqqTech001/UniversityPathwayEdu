import ScrollReveal from './ScrollReveal';

interface ExamItem {
  name: string;
  fullName: string;
  logo: string;
  className?: string;
  path: string;
}

const exams: ExamItem[] = [
  {
    name: 'JAMB',
    fullName: 'Joint Admissions and Matriculation Board',
    logo: '/images/exam-logos/jamb.png',
    className: 'h-13 w-auto',
    path: '/programmes#jamb',
  },
  {
    name: 'WAEC',
    fullName: 'West African Examinations Council',
    logo: '/images/exam-logos/waec.png',
    className: 'h-13 w-auto',
    path: '/programmes#olevel',
  },
  {
    name: 'NECO',
    fullName: 'National Examinations Council',
    logo: '/images/exam-logos/neco.svg',
    className: 'h-14 w-auto',
    path: '/programmes#olevel',
  },
  {
    name: 'NABTEB',
    fullName: 'National Business and Technical Examinations Board',
    logo: '/images/exam-logos/nabteb.png',
    className: 'h-13 w-auto',
    path: '/programmes#olevel',
  },
  {
    name: 'JUPEB',
    fullName: 'Joint Universities Preliminary Examinations Board',
    logo: '/images/exam-logos/jupeb.png',
    className: 'h-13 w-auto',
    path: '/programmes#alevel',
  },
  {
    name: 'Cambridge',
    fullName: 'Cambridge Assessment International Education',
    logo: '/images/exam-logos/cambridge.svg',
    className: 'h-9 w-auto',
    path: '/programmes#alevel',
  },
  {
    name: 'IELTS',
    fullName: 'International English Language Testing System',
    logo: '/images/exam-logos/ielts.svg',
    className: 'h-8 w-auto',
    path: '/programmes#international',
  },
  {
    name: 'TOEFL',
    fullName: 'Test of English as a Foreign Language',
    logo: '/images/exam-logos/toefl.svg',
    className: 'h-7 w-auto',
    path: '/programmes#international',
  },
  {
    name: 'GRE',
    fullName: 'Graduate Record Examinations',
    logo: '/images/exam-logos/gre.svg',
    className: 'h-7 w-auto',
    path: '/programmes#international',
  },
  {
    name: 'GMAT',
    fullName: 'Graduate Management Admission Test',
    logo: '/images/exam-logos/gmat.svg',
    className: 'h-7 w-auto',
    path: '/programmes#international',
  },
  {
    name: 'SAT',
    fullName: 'Scholastic Assessment Test (College Board)',
    logo: '/images/exam-logos/sat.svg',
    className: 'h-8 w-auto',
    path: '/programmes#international',
  },
];

interface ExamLogosStripProps {
  onNavigate?: (path: string) => void;
}

export default function ExamLogosStrip({ onNavigate }: ExamLogosStripProps) {
  const handleClick = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  return (
    <section className="bg-white py-14 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <ScrollReveal from="up">
          <div className="text-left mb-8">
            <p className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
              OUR PARTNERS &amp; EXAMS
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0b1a42] mt-2">
              We Prepare You For
            </h2>
          </div>
        </ScrollReveal>

        {/* Horizontal flex logo strip exactly matching the mockup */}
        <ScrollReveal from="up" delay={100}>
          <div className="flex flex-wrap items-center justify-between gap-6 sm:gap-8 py-4 px-2">
            {exams.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => handleClick(item.path)}
                title={`${item.fullName} (Click to view programme details)`}
                className="flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#c62839]/30 rounded-lg p-1 cursor-pointer select-none"
              >
                <img
                  src={item.logo}
                  alt={`${item.fullName} logo`}
                  className={`${item.className} object-contain`}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
