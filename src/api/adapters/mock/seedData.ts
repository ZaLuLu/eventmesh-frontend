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
  id: 'org-1',
  name: 'Technical Association',
  slug: 'technical-association',
  tagline: 'Federation of 9 Autonomous Engineering & Scientific Collectives',
  vision:
    'To foster high-conviction engineering rigor, open inquiry, and technological excellence across disciplines.',
  mission:
    'Empower autonomous student collectives to host rigorous hackathons, peer symposiums, and research workshops that advance technical mastery.',
  objectives: [
    'Sustain a permanent culture of building and shipping verifiable software and hardware artifacts.',
    'Cultivate cross-disciplinary collaboration across computational intelligence, systems, design, and cryptography.',
    'Provide uninhibited access to mentorship, high-performance computing labs, and industry fellowships.',
    'Publish open research, reproducible code, and curatorial proceedings from all association symposiums.',
  ],
  coordinators: [
    {
      name: 'Dr. Vikramaditya Sen',
      role: 'Staff Director & Chair',
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
      name: 'Aarav Deshmukh',
      role: 'President',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'Final-year Systems Engineering fellow; core Linux kernel contributor.',
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
    'Organized 120+ peer-reviewed technical workshops and hackathons in the last academic year.',
    'Over 14,000 verified attendee certificates issued across autonomous member clubs.',
    'First prize in the National Algorithmic Olympiad and Autonomous Drone Grand Prix.',
    'Published 18 open-source repositories with over 4,500 GitHub community stars.',
  ],
  stats: {
    events: 30,
    registrations: 4820,
    certificates: 3190,
    clubs: 9,
  },
  labels: {
    organizer: 'Club',
    member: 'Student',
    audienceSegments: [
      'Technical Faculty',
      'Core Members',
      'Junior Cohort',
      'Senior Fellows',
      'Open Collective',
    ],
  },
  settings: {
    requireEventApproval: false,
    defaultCurrency: 'INR',
    allowPaidEvents: false,
  },
}

export const SEED_CLUBS: Organizer[] = [
  {
    id: 'club-cp',
    orgId: 'org-1',
    name: 'CP Club',
    slug: 'cp-club',
    color: '#2F4BD6', // Cobalt
    about:
      'The Competitive Programming Club is dedicated to extreme algorithmic problem solving, graph theory, combinatorics, and preparation for premier global programming contests.',
    whatWeDo:
      'Weekly code battles, editorial breakdowns of ICPC problems, masterclasses on dynamic programming, and high-stakes speed-coding sprints.',
    coordinators: [
      { name: 'Dr. Rajesh Rao', role: 'Chief Mentor' },
      { name: 'Sameer Kulkarni', role: 'Club Lead' },
    ],
    studentCoordinators: [
      { name: 'Rhea Sen', role: 'Contest Director' },
      { name: 'Dev Sharma', role: 'Problem Setter' },
    ],
    achievements: [
      'World Finalists in ICPC Asia-West Regional for 3 consecutive years.',
      '12 Grandmasters and International Masters on Codeforces.',
    ],
    gallery: [
      {
        id: 'g-cp-1',
        url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',
        caption: 'Annual Speed-Coding Arena finals.',
      },
    ],
    joinMode: 'open',
    followersCount: 1420,
    isFollowed: true,
  },
  {
    id: 'club-ai',
    orgId: 'org-1',
    name: 'AIONAI',
    slug: 'aionai',
    color: '#7B63A8', // Muted Violet
    about:
      'Artificial Intelligence & Neural Architecture Institute. Exploring frontier generative models, transformer interpretability, reinforcement learning, and compute-efficient vision systems.',
    whatWeDo:
      'Compute sprints on GPU clusters, paper reading groups, model alignment workshops, and hackathons focused on applied machine intelligence.',
    coordinators: [
      { name: 'Dr. Leena Varma', role: 'Faculty Chair' },
      { name: 'Nikhil Menon', role: 'Club Lead' },
    ],
    studentCoordinators: [
      { name: 'Tanvi Joshi', role: 'Research Lead' },
      { name: 'Arjun Das', role: 'Hackathon Director' },
    ],
    achievements: [
      'Published 4 papers at NeurIPS Workshop and CVPR student tracks.',
      'Built open multilingual speech models with 500k+ downloads.',
    ],
    gallery: [
      {
        id: 'g-ai-1',
        url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
        caption: 'Neural Architecture Sprint in the Turing Cluster.',
      },
    ],
    joinMode: 'open',
    followersCount: 1890,
    isFollowed: false,
  },
  {
    id: 'club-birds',
    orgId: 'org-1',
    name: 'BIRDS',
    slug: 'birds',
    color: '#6F8468', // Deep Sage
    about:
      'Bioinformatics, Intelligent Robotics & Distributed Systems. Merging computational biology, bio-inspired autonomous kinematics, and evolutionary swarm optimization.',
    whatWeDo:
      'Autonomous drone flight algorithms, biomimetic robot construction, CRISPR sequence analysis workshops, and sensor-fusion experiments.',
    coordinators: [
      { name: 'Prof. Maya Nambiar', role: 'Principal Mentor' },
      { name: 'Karthik Balan', role: 'Club Lead' },
    ],
    studentCoordinators: [
      { name: 'Tara Nair', role: 'Robotics Lead' },
      { name: 'Zaid Khan', role: 'Bioinformatics Lead' },
    ],
    achievements: [
      'National Champions in the Aerial Swarm Robotics Invitational.',
      'Developed low-cost prosthetic hand controlled via electromyography.',
    ],
    gallery: [
      {
        id: 'g-birds-1',
        url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
        caption: 'Swarm drone indoor testing inside the Robotics Arena.',
      },
    ],
    joinMode: 'open',
    followersCount: 1120,
    isFollowed: true,
  },
  {
    id: 'club-devcraft',
    orgId: 'org-1',
    name: 'DevCraft',
    slug: 'devcraft',
    color: '#C66A4A', // Terracotta
    about:
      'Full-stack engineering, distributed backend systems, web architecture, and production engineering.',
    whatWeDo:
      'Production-grade app development sprints, Kubernetes microservices workshops, database indexing masterclasses, and open-source contribution drives.',
    coordinators: [
      { name: 'Prof. Vinay Kumar', role: 'Advisor' },
      { name: 'Siddharth Roy', role: 'Club Lead' },
    ],
    studentCoordinators: [
      { name: 'Pooja Hegde', role: 'Frontend Lead' },
      { name: 'Rohan Gupta', role: 'DevOps Lead' },
    ],
    achievements: [
      'Engineered campus-wide platforms serving 10,000 daily active requests.',
      'Over 20 pull requests merged into upstream React and Node ecosystems.',
    ],
    gallery: [
      {
        id: 'g-dev-1',
        url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        caption: 'DevCraft 48-Hour Architecture Sprint.',
      },
    ],
    joinMode: 'open',
    followersCount: 1640,
    isFollowed: false,
  },
  {
    id: 'club-robocrafters',
    orgId: 'org-1',
    name: 'Robocrafters',
    slug: 'robocrafters',
    color: '#B85D19', // Burnt Ochre
    about:
      'Mechatronics, micro-controllers, industrial automation, and competitive combat robotics.',
    whatWeDo:
      'Hardware fabrication, PCB design in KiCad, ROS2 workshops, and high-velocity combat robotics competitions.',
    coordinators: [
      { name: 'Dr. Anand Prabhu', role: 'Mentor' },
      { name: 'Vikram Seth', role: 'Club Lead' },
    ],
    studentCoordinators: [
      { name: 'Aditi Chawla', role: 'Hardware Architect' },
      { name: 'Mohit Verma', role: 'Embedded Firmware Lead' },
    ],
    achievements: [
      'Heavyweight Combat Robot Champion in the National Tech Expo.',
      'Designed custom dual-motor BLDC ESC used across 8 engineering teams.',
    ],
    gallery: [
      {
        id: 'g-robo-1',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        caption: 'Machining chassis parts in the fabrication facility.',
      },
    ],
    joinMode: 'open',
    followersCount: 980,
    isFollowed: false,
  },
  {
    id: 'club-cyberguard',
    orgId: 'org-1',
    name: 'CyberGuard',
    slug: 'cyberguard',
    color: '#1F5F5B', // Deep Teal
    about:
      'Offensive security, binary exploitation, zero-day vulnerability analysis, post-quantum cryptography, and blue-team defense systems.',
    whatWeDo:
      'Capture The Flag (CTF) tournaments, reverse engineering bootcamps, secure code audits, and fuzzing workshops.',
    coordinators: [
      { name: 'Dr. Alok Nath', role: 'Faculty Mentor' },
      { name: 'Divya Krishnan', role: 'Club Lead' },
    ],
    studentCoordinators: [
      { name: 'Pranav Nair', role: 'CTF Captain' },
      { name: 'Kavita Pillai', role: 'Crypto Researcher' },
    ],
    achievements: [
      'Ranked #3 nationally on CTFtime in academic team category.',
      'Reported 14 CVE vulnerabilities recognized by leading software vendors.',
    ],
    gallery: [
      {
        id: 'g-cyber-1',
        url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
        caption: '24-hour Red Team vs Blue Team CTF war room.',
      },
    ],
    joinMode: 'open',
    followersCount: 1310,
    isFollowed: false,
  },
  {
    id: 'club-nexiot',
    orgId: 'org-1',
    name: 'NexIoT',
    slug: 'nexiot',
    color: '#E3A12F', // Saffron
    about:
      'Pervasive sensor networks, low-power edge computing, LoRaWAN mesh communication, and smart infrastructure.',
    whatWeDo:
      'ESP32 / Raspberry Pi IoT builds, energy-harvesting hardware prototyping, and environmental telemetry deployments.',
    coordinators: [
      { name: 'Prof. Geeta Rao', role: 'Mentor' },
      { name: 'Harsh Vardhan', role: 'Club Lead' },
    ],
    studentCoordinators: [
      { name: 'Deepa Iyer', role: 'Edge AI Lead' },
      { name: 'Rahul Bose', role: 'Protocol Specialist' },
    ],
    achievements: [
      'Deployed 50-node air quality monitoring mesh spanning the municipal corridor.',
      'Published open-hardware low-power telemetry board schematics.',
    ],
    gallery: [
      {
        id: 'g-iot-1',
        url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        caption: 'Soldering high-precision sensor breakout boards.',
      },
    ],
    joinMode: 'open',
    followersCount: 890,
    isFollowed: false,
  },
  {
    id: 'club-pixelforge',
    orgId: 'org-1',
    name: 'PixelForge',
    slug: 'pixelforge',
    color: '#5B2A4A', // Plum
    about:
      'Design systems, editorial typography, creative coding, generative graphics, and human-computer interface research.',
    whatWeDo:
      'Shaders and WebGL masterclasses, typography critique salons, design token system engineering, and interactive exhibition curation.',
    coordinators: [
      { name: 'Prof. Shweta Murthy', role: 'Advisor' },
      { name: 'Aryan Kapoor', role: 'Club Lead' },
    ],
    studentCoordinators: [
      { name: 'Simran Kaur', role: 'Design Director' },
      { name: 'Neil Dsouza', role: 'Creative Tech Lead' },
    ],
    achievements: [
      'Curated national digital art exhibition featured in international design journals.',
      'Designed EventMesh editorial brand architecture and type scale.',
    ],
    gallery: [
      {
        id: 'g-pixel-1',
        url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
        caption: 'Generative typography critique in the design pavilion.',
      },
    ],
    joinMode: 'open',
    followersCount: 1540,
    isFollowed: true,
  },
  {
    id: 'club-foss',
    orgId: 'org-1',
    name: 'FOSS Society',
    slug: 'foss-society',
    color: '#A32828', // Crimson Carbon
    about:
      'Free and Open Source Software advocacy, self-hosted infrastructure, Linux kernel tooling, and digital sovereignty.',
    whatWeDo:
      'Linux install fests, Git internal mechanics workshops, licensing and copyleft forums, and self-hosted cloud migrations.',
    coordinators: [
      { name: 'Dr. Santosh Pai', role: 'Faculty Mentor' },
      { name: 'Varun Swaminathan', role: 'Club Lead' },
    ],
    studentCoordinators: [
      { name: 'Meera Patel', role: 'Open Source Evangelist' },
      { name: 'Abhishek Roy', role: 'Systems Administrator' },
    ],
    achievements: [
      'Organized Software Freedom Day with 800+ attendees.',
      'Maintains association self-hosted compute and code mirrors.',
    ],
    gallery: [
      {
        id: 'g-foss-1',
        url: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80',
        caption: 'Linux kernel patch workshop and upstream contribution marathon.',
      },
    ],
    joinMode: 'open',
    followersCount: 1780,
    isFollowed: false,
  },
]

export const SEED_DEMO_USERS: UserSession[] = [
  {
    id: 'usr-plat',
    name: 'Sovereign Administrator',
    email: 'admin@platform.com',
    role: 'platform_admin',
    orgId: 'org-1',
  },
  {
    id: 'usr-org',
    name: 'Aarav Deshmukh (Association President)',
    email: 'president@ta.org',
    role: 'org_admin',
    orgId: 'org-1',
  },
  {
    id: 'usr-cluba',
    name: 'Sameer Kulkarni (CP Club Admin)',
    email: 'lead@cpclub.org',
    role: 'club_admin',
    orgId: 'org-1',
    clubId: 'club-cp',
    clubName: 'CP Club',
    clubColor: '#2F4BD6',
  },
  {
    id: 'usr-clubb',
    name: 'Nikhil Menon (AIONAI Admin)',
    email: 'lead@aionai.org',
    role: 'club_admin',
    orgId: 'org-1',
    clubId: 'club-ai',
    clubName: 'AIONAI',
    clubColor: '#7B63A8',
  },
  {
    id: 'usr-vol',
    name: 'Maya Joshi (Check-in Volunteer)',
    email: 'volunteer@ta.org',
    role: 'volunteer',
    orgId: 'org-1',
    assignedEventIds: ['evt-1', 'evt-2', 'evt-3'],
  },
  {
    id: 'usr-att',
    name: 'Aditya Narayan (Registered Attendee)',
    email: 'attendee@example.com',
    role: 'attendee',
    orgId: 'org-1',
  },
]
