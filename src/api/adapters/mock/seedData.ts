import {
  Organization,
  Organizer,
  Event,
  Registration,
  Certificate,
  Announcement,
  Notification,
  AuditLog,
  UserSession,
} from '../../contracts'

export const SEED_ORGANIZATION: Organization = {
  id: 'ctu-main',
  name: 'Central Technological University',
  slug: 'central-technological-university',
  tagline: 'Autonomous Premier Engineering & Research Institution',
  vision:
    'To foster high-conviction engineering rigor, open inquiry, and technological excellence across disciplines.',
  mission:
    'Empower autonomous student collectives to host rigorous hackathons, peer symposiums, and research workshops that advance technical mastery.',
  objectives: [
    'Sustain a permanent culture of building and shipping verifiable software and hardware artifacts.',
    'Cultivate cross-disciplinary collaboration across computational intelligence, systems, design, and cryptography.',
    'Provide uninhibited access to mentorship, high-performance computing labs, and industry fellowships.',
    'Publish open research, reproducible code, and curatorial proceedings from all university symposiums.',
  ],
  coordinators: [
    {
      name: 'Dr. Vikramaditya Sen, Ph.D.',
      role: 'Director & Academic Chair',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'Professor of Distributed Systems & Principal Investigator.',
    },
    {
      name: 'Prof. Maya Nambiar',
      role: 'Faculty Advisor',
      photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      bio: 'Chair of Embedded Architectures & Systems Lab.',
    },
  ],
  officeBearers: [
    {
      name: 'Suraj Naik',
      role: 'Student Body President & Lead Fellow',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'Final-year Systems Engineering fellow; lead organizer of campus hackathons.',
    },
    {
      name: 'Ananya Raghavan',
      role: 'Vice President & Head of Operations',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      bio: 'Robotics lead and organizer of the annual Grand Turing Hackathon.',
    },
    {
      name: 'Kabir Mehta',
      role: 'Technical Secretary',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      bio: 'Applied cryptography researcher and algorithmic competition finalist.',
    },
  ],
  achievements: [
    'NAAC Grade A++ Accredited Autonomous Technical Campus.',
    'Over 4,500 active engineering scholars across 8 departments and 14 advanced research labs.',
    'Ranked in the NIRF Top 10 Technical Institutes for student-led innovation.',
    'Host to the annual flagship Inter-Campus Hackathon and Robotics Grand Prix.',
  ],
  stats: {
    events: 30,
    registrations: 4820,
    certificates: 3190,
    clubs: 3,
  },
  labels: {
    organizer: 'Society',
    member: 'Student',
    audienceSegments: [
      'Faculty',
      'Core Guild',
      'Undergraduate Cohort',
      'Senior Fellows',
      'Open Collective',
    ],
  },
  settings: {
    requireEventApproval: false,
    defaultCurrency: 'INR',
    allowPaidEvents: true,
  },
}

export const SEED_CLUBS: Organizer[] = [
  {
    id: 'club-acm',
    orgId: 'ctu-main',
    name: 'CTU Association for Computing Machinery (ACM Chapter)',
    slug: 'ctu-acm-chapter',
    color: '#7C3AED', // Royal Purple
    about:
      'Premier collegiate computing collective dedicated to systems architecture, autonomous AI, compiler theory, and competitive programming.',
    whatWeDo:
      'Annual 36-hour hackathons, algorithmic symposiums, Linux systems workshops, and open-source marathons.',
    coordinators: [
      { name: 'Dr. Vikramaditya Sen', role: 'Faculty Mentor' },
      { name: 'Aarav Deshmukh', role: 'Student Chair' },
    ],
    studentCoordinators: [
      { name: 'Suraj Naik', role: 'Lead Technical Fellow' },
    ],
    achievements: [
      'Ranked #1 Regional Chapter in the International Collegiate Programming Contest.',
      'Organizer of the Flagship Annual Inter-Campus Hackathon.',
    ],
    gallery: [
      {
        id: 'g-acm-1',
        url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',
        caption: 'Annual Speed-Coding Arena finals.',
      },
    ],
    joinMode: 'open',
    followersCount: 420,
    isFollowed: true,
  },
  {
    id: 'club-robotics',
    orgId: 'ctu-main',
    name: 'Apex Robotics & Autonomous Systems Guild',
    slug: 'apex-robotics-guild',
    color: '#2563EB', // Cobalt Blue
    about:
      'Interdisciplinary engineering laboratory advancing autonomous quadcopters, micro-rovers, ROS2 robotics stacks, and precision PCB fabrication.',
    whatWeDo:
      'Autonomous drone combat, robotic rover testing, embedded firmware workshops, and hardware hackathons.',
    coordinators: [
      { name: 'Prof. Maya Nambiar', role: 'Faculty Mentor' },
      { name: 'Ananya Raghavan', role: 'Guild Lead' },
    ],
    studentCoordinators: [
      { name: 'Kabir Mehta', role: 'Hardware Architect' },
    ],
    achievements: [
      'National Champions at the Autonomous Aerial Robotics Challenge.',
      'Custom flight-controller board designed and fabricated in-house.',
    ],
    gallery: [
      {
        id: 'g-rob-1',
        url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
        caption: 'Autonomous drone telemetry testing.',
      },
    ],
    joinMode: 'open',
    followersCount: 310,
    isFollowed: false,
  },
  {
    id: 'club-design',
    orgId: 'ctu-main',
    name: 'The Design & Creative Media Society',
    slug: 'design-creative-society',
    color: '#EC4899', // Pink / Coral
    about:
      'Design laboratory exploring digital typography, product interface architecture, generative 3D visual art, and editorial filmmaking.',
    whatWeDo:
      'UI/UX design sprints, generative motion critique, interactive web exhibitions, and annual design jams.',
    coordinators: [
      { name: 'Prof. Elena Rostova', role: 'Design Mentor' },
      { name: 'Tanvi Joshi', role: 'Creative Director' },
    ],
    studentCoordinators: [
      { name: 'Devika Nair', role: 'Editorial Lead' },
    ],
    achievements: [
      'Winner of the Global Student Design Systems Award.',
      'Designed official event visual identities for all CTU flagship festivals.',
    ],
    gallery: [
      {
        id: 'g-des-1',
        url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80',
        caption: 'Typography and spatial design exhibition.',
      },
    ],
    joinMode: 'open',
    followersCount: 240,
    isFollowed: false,
  },
]

export const SEED_DEMO_USERS: UserSession[] = [
  {
    id: 'usr-suraj',
    name: 'Suraj Naik',
    email: 'ceosuraj@email.com',
    role: 'org_admin',
    orgId: 'ctu-main',
    clubId: 'club-acm',
    clubName: 'CTU ACM Chapter',
    registrationNumber: 'CTU-2026-0814',
    degreeBranch: 'B.Tech Computer Science & Engineering',
    semester: 6,
    campus: 'Central Technological University (CTU Main Campus)',
    bloodGroup: 'O+',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
]
