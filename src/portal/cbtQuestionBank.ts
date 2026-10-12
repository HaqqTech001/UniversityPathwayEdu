export interface CbtQuestion {
  id: string;
  subject: string;
  topic: string;
  passage?: string;
  prompt: string;
  options: string[];
  answer: number; // 0=A, 1=B, 2=C, 3=D
  explanation: string;
}

export const CBT_QUESTION_BANK: CbtQuestion[] = [
  // 1. USE OF ENGLISH (Compulsory)
  {
    id: 'eng-01',
    subject: 'Use of English',
    topic: 'Comprehension & Vocabulary',
    passage:
      'Global education paradigms are transforming rapidly. Technological integration in secondary schooling is no longer a luxury; it has become an indispensable vehicle for equitable human capital development.',
    prompt:
      'According to the passage, why has technological integration become essential in modern schooling?',
    options: [
      'It completely replaces human instructors in classroom management.',
      'It acts as an indispensable vehicle for equitable human capital development.',
      'It reduces the cost of textbooks to zero for all private schools.',
      'It guarantees immediate university matriculation for all candidates.',
    ],
    answer: 1,
    explanation:
      'The author explicitly states that technological integration has become an "indispensable vehicle for equitable human capital development."',
  },
  {
    id: 'eng-02',
    subject: 'Use of English',
    topic: 'Lexis & Structure',
    prompt:
      'Choose the option that is nearest in meaning to the italicized word: "The principal’s address was remarkably *concise*."',
    options: ['Lengthy and detailed', 'Brief and comprehensive', 'Obscure and difficult', 'Careless and hasty'],
    answer: 1,
    explanation:
      '“Concise” means expressing much in few words; brief and to the point without sacrificing clarity.',
  },
  {
    id: 'eng-03',
    subject: 'Use of English',
    topic: 'Subject-Verb Concord',
    prompt: 'Choose the sentence that demonstrates correct grammatical concord:',
    options: [
      'Neither the principal nor the tutors is responsible for the schedule.',
      'Neither the principal nor the tutors are responsible for the schedule.',
      'Neither the principal or the tutors was responsible for the schedule.',
      'Neither the principal nor the tutors has been responsible for the schedule.',
    ],
    answer: 1,
    explanation:
      'In a correlative construction with “neither... nor”, the verb agrees in number with the closer subject (“the tutors” is plural, requiring “are”).',
  },
  {
    id: 'eng-04',
    subject: 'Use of English',
    topic: 'Antonyms',
    prompt:
      'Choose the option opposite in meaning to the word in capitals: "The scholar’s argument was thoroughly METICULOUS."',
    options: ['Painstaking', 'Scrupulous', 'Slipshod', 'Exhaustive'],
    answer: 2,
    explanation:
      '“Meticulous” means showing great attention to detail. Its direct opposite is “slipshod” (careless or untidy).',
  },
  {
    id: 'eng-05',
    subject: 'Use of English',
    topic: 'Oral Forms',
    prompt: 'Identify the word with the same vowel sound as in "seat":',
    options: ['Sit', 'Key', 'Set', 'Sat'],
    answer: 1,
    explanation:
      'The word “seat” has the long vowel /iː/, which is also the vowel sound in “key” /kiː/.',
  },

  // 2. MATHEMATICS
  {
    id: 'math-01',
    subject: 'Mathematics',
    topic: 'Algebra & Linear Equations',
    prompt: 'Solve for x in the equation: 4x - 7 = 2x + 9.',
    options: ['x = 6', 'x = 8', 'x = 7', 'x = 9'],
    answer: 1,
    explanation:
      'Subtract 2x from both sides: 2x - 7 = 9. Add 7: 2x = 16. Divide by 2: x = 8.',
  },
  {
    id: 'math-02',
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    prompt: 'What are the roots of the quadratic equation: x² - 5x + 6 = 0?',
    options: ['x = -2, -3', 'x = 2, 3', 'x = 1, 6', 'x = -1, -6'],
    answer: 1,
    explanation:
      'Factoring gives (x - 2)(x - 3) = 0. Therefore, the roots are x = 2 and x = 3.',
  },
  {
    id: 'math-03',
    subject: 'Mathematics',
    topic: 'Logarithms & Indices',
    prompt: 'Evaluate log₁₀(1000) - log₁₀(10):',
    options: ['1', '2', '3', '100'],
    answer: 1,
    explanation:
      'log₁₀(1000) = 3 and log₁₀(10) = 1. Therefore, 3 - 1 = 2 (or log₁₀(1000/10) = log₁₀(100) = 2).',
  },
  {
    id: 'math-04',
    subject: 'Mathematics',
    topic: 'Trigonometry',
    prompt: 'In a right-angled triangle, if sin θ = 3/5, what is the value of cos θ (where 0° < θ < 90°)?',
    options: ['4/5', '3/4', '5/3', '5/4'],
    answer: 0,
    explanation:
      'By Pythagoras: adjacent² = 5² - 3² = 25 - 9 = 16. Adjacent = 4. Hence, cos θ = adjacent / hypotenuse = 4/5.',
  },
  {
    id: 'math-05',
    subject: 'Mathematics',
    topic: 'Statistics & Probability',
    prompt: 'A fair six-sided die is rolled once. What is the probability of obtaining a prime number?',
    options: ['1/6', '1/3', '1/2', '2/3'],
    answer: 2,
    explanation:
      'The prime outcomes from {1, 2, 3, 4, 5, 6} are {2, 3, 5} (3 outcomes). P(prime) = 3/6 = 1/2.',
  },

  // 3. BIOLOGY
  {
    id: 'bio-01',
    subject: 'Biology',
    topic: 'Cell Biology',
    prompt: 'Which cellular organelle is responsible for generating adenosine triphosphate (ATP) during aerobic cellular respiration?',
    options: ['Ribosome', 'Mitochondrion', 'Golgi apparatus', 'Endoplasmic reticulum'],
    answer: 1,
    explanation:
      'Mitochondria are the powerhouses of eukaryotic cells where the Krebs cycle and oxidative phosphorylation take place to yield ATP.',
  },
  {
    id: 'bio-02',
    subject: 'Biology',
    topic: 'Genetics',
    prompt: 'If a pure-breeding tall pea plant (TT) is crossed with a pure-breeding short pea plant (tt), what is the phenotypic ratio in the F1 generation?',
    options: ['100% tall', '3 tall : 1 short', '1 tall : 1 short', '100% short'],
    answer: 0,
    explanation:
      'All offspring in the F1 generation possess the genotype Tt. Because tallness (T) is dominant, 100% of the F1 generation are tall.',
  },
  {
    id: 'bio-03',
    subject: 'Biology',
    topic: 'Ecology & Nutrient Cycles',
    prompt: 'Which group of organisms plays the primary ecological role in returning nitrates to atmospheric nitrogen gas?',
    options: ['Nitrosomonas', 'Nitrifying bacteria', 'Denitrifying bacteria', 'Rhizobium leguminosarum'],
    answer: 2,
    explanation:
      'Denitrifying bacteria (e.g., Pseudomonas) convert nitrates (NO₃⁻) into nitrogen gas (N₂), completing the nitrogen cycle.',
  },
  {
    id: 'bio-04',
    subject: 'Biology',
    topic: 'Human Physiology',
    prompt: 'Which hormone is secreted by the beta cells of the islets of Langerhans in the pancreas to lower blood glucose concentration?',
    options: ['Glucagon', 'Adrenaline', 'Insulin', 'Thyroxine'],
    answer: 2,
    explanation:
      'Insulin is produced by pancreatic beta cells and stimulates cellular uptake and glycogenesis to decrease blood sugar levels.',
  },
  {
    id: 'bio-05',
    subject: 'Biology',
    topic: 'Plant Nutrition',
    prompt: 'What tissue in vascular plants is specialized for the bidirectional translocation of manufactured sucrose and amino acids?',
    options: ['Xylem vessels', 'Phloem sieve tubes', 'Cambium', 'Epidermis'],
    answer: 1,
    explanation:
      'Phloem sieve tube elements conduct organic food products (translocation) from photosynthetic source regions to sink organs.',
  },

  // 4. CHEMISTRY
  {
    id: 'chem-01',
    subject: 'Chemistry',
    topic: 'Gas Laws',
    prompt: 'According to Boyle’s Law, how does the volume of a given mass of gas change when the pressure is tripled at constant temperature?',
    options: ['It triples', 'It decreases to one-third', 'It remains constant', 'It increases by ninefold'],
    answer: 1,
    explanation:
      'Boyle’s Law states that P₁V₁ = P₂V₂. If pressure is tripled (P₂ = 3P₁), volume decreases to V₁/3.',
  },
  {
    id: 'chem-02',
    subject: 'Chemistry',
    topic: 'Periodic Table & Atomic Structure',
    prompt: 'What is the electronic configuration of an element with atomic number 17 (Chlorine)?',
    options: ['1s² 2s² 2p⁶ 3s¹', '1s² 2s² 2p⁶ 3s² 3p⁵', '1s² 2s² 2p⁶ 3s² 3p⁶', '1s² 2s² 2p⁶ 3d⁷'],
    answer: 1,
    explanation:
      'Chlorine has 17 electrons: 1s² 2s² 2p⁶ 3s² 3p⁵ (Group 7, Period 3 halogen).',
  },
  {
    id: 'chem-03',
    subject: 'Chemistry',
    topic: 'Acids, Bases & Salts',
    prompt: 'What is the pH of a 0.01 mol/dm³ solution of hydrochloric acid (HCl)?',
    options: ['pH = 1', 'pH = 2', 'pH = 7', 'pH = 12'],
    answer: 1,
    explanation:
      'HCl is a strong monoprotic acid: [H⁺] = 0.01 M = 10⁻² M. pH = -log₁₀[H⁺] = -log₁₀(10⁻²) = 2.',
  },
  {
    id: 'chem-04',
    subject: 'Chemistry',
    topic: 'Organic Chemistry',
    prompt: 'Which homologous series has the general molecular formula CₙH₂ₙ₊₂?',
    options: ['Alkenes', 'Alkynes', 'Alkanes', 'Alkanols'],
    answer: 2,
    explanation:
      'Alkanes are saturated hydrocarbons with the general formula CₙH₂ₙ₊₂ (e.g., Methane CH₄, Ethane C₂H₆).',
  },
  {
    id: 'chem-05',
    subject: 'Chemistry',
    topic: 'Electrochemistry',
    prompt: 'During the electrolysis of dilute copper(II) sulfate using inert carbon electrodes, what gas is liberated at the anode?',
    options: ['Hydrogen gas (H₂)', 'Oxygen gas (O₂)', 'Sulfur dioxide (SO₂)', 'Nitrogen gas (N₂)'],
    answer: 1,
    explanation:
      'Hydroxide ions (OH⁻) from water are discharged in preference to sulfate ions (SO₄²⁻), releasing oxygen gas at the anode: 4OH⁻ → 2H₂O + O₂ + 4e⁻.',
  },

  // 5. PHYSICS
  {
    id: 'phy-01',
    subject: 'Physics',
    topic: 'Mechanics',
    prompt: 'A vehicle accelerates uniformly from rest at 2.5 m/s² for 10 seconds. What is the total distance covered?',
    options: ['25 m', '50 m', '125 m', '250 m'],
    answer: 2,
    explanation:
      'Using s = ut + 0.5at²: since u = 0, s = 0.5 × 2.5 × 10² = 0.5 × 2.5 × 100 = 125 meters.',
  },
  {
    id: 'phy-02',
    subject: 'Physics',
    topic: 'Optics',
    prompt: 'What type of lens is prescribed by an ophthalmologist to correct myopia (short-sightedness)?',
    options: ['Convex (converging) lens', 'Concave (diverging) lens', 'Cylindrical lens', 'Bifocal lens'],
    answer: 1,
    explanation:
      'A concave (diverging) lens diverges light rays before entering the eye, shifting the focused image backward onto the retina.',
  },
  {
    id: 'phy-03',
    subject: 'Physics',
    topic: 'Electricity & Magnetism',
    prompt: 'Three resistors of resistances 2Ω, 3Ω, and 6Ω are connected in parallel. What is their equivalent resistance?',
    options: ['1Ω', '2Ω', '6Ω', '11Ω'],
    answer: 0,
    explanation:
      '1/R = 1/2 + 1/3 + 1/6 = 3/6 + 2/6 + 1/6 = 6/6 = 1. Therefore, R = 1Ω.',
  },
  {
    id: 'phy-04',
    subject: 'Physics',
    topic: 'Thermal Physics',
    prompt: 'The specific latent heat of vaporization of water is substantially greater than its specific latent heat of fusion because:',
    options: [
      'Molecules completely overcome intermolecular bonds to form gas.',
      'Ice is denser than liquid water.',
      'Temperature drops during boiling.',
      'Water has a lower boiling point than mercury.',
    ],
    answer: 0,
    explanation:
      'Vaporization requires complete separation of molecules against attractive hydrogen bonds, requiring vastly more energy than merely loosening the solid crystal lattice.',
  },
  {
    id: 'phy-05',
    subject: 'Physics',
    topic: 'Waves & Sound',
    prompt: 'What is the speed of a sound wave with a frequency of 256 Hz and a wavelength of 1.3 meters in air?',
    options: ['196.9 m/s', '332.8 m/s', '340.0 m/s', '512.0 m/s'],
    answer: 1,
    explanation:
      'Using the wave equation v = f × λ: v = 256 Hz × 1.3 m = 332.8 m/s.',
  },
];
