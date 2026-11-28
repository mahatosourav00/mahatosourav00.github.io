// Labels for a paper's stage (publications.json `status`). Update the status as a paper moves along.
export const pubStatus = {
  'in-preparation': 'In preparation',
  submitted: 'Submitted',
  'in-review': 'In review',
  accepted: 'Accepted',
  published: 'Published',
} as const;

// Central place for your personal details. Edit here, it updates everywhere.
export const site = {
  name: 'Sourav Mahato',
  short: 'SM',
  role: 'Planetary researcher & instrument builder',
  tagline: 'I figure out how things work, from rocks floating in space to circuit boards on my desk.',
  description:
    'Sourav Mahato: planetary science researcher working on Chandrayaan-2 and Dawn spectroscopy, and a builder of low-cost scientific instruments. Open to PhD positions.',
  email: 'mahatosourav01@gmail.com',
  location: 'Bhubaneswar, India',
  coords: '20.18° N · 85.71° E',
  status: 'Open to PhD positions · 2027',
  // Default 1200×630 card shown when a page is shared on WhatsApp, LinkedIn, Slack, email…
  ogImage: '/og/default.jpg',
  affiliation: { name: 'National Institute of Science Education and Research (NISER)', url: 'https://www.niser.ac.in' },
  // Topics for search engines (schema.org knowsAbout)
  topics: ['Planetary science', 'Reflectance spectroscopy', 'Photometric correction', 'Hapke model', 'Chandrayaan-2 IIRS', 'Dawn VIR', 'Ceres', 'Scientific instrumentation'],
  links: [
    { label: 'GitHub', href: 'https://github.com/mahatosourav00' },
    // Add when ready:
    // { label: 'Google Scholar', href: 'https://scholar.google.com/...' },
    // { label: 'ORCID', href: 'https://orcid.org/...' },
    // { label: 'LinkedIn', href: 'https://linkedin.com/in/...' },
  ],
  nav: [
    { label: 'Research', href: '/research' },
    { label: 'Builds', href: '/projects' },
    { label: 'Hobbies', href: '/hobbies' },
    { label: 'Play', href: '/play' },
    { label: 'Notes', href: '/notes' },
    { label: 'Journey', href: '/journey' },
  ],
};
