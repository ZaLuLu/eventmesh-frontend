import { Event, Registration, Certificate, Announcement, Notification, AuditLog } from '../../contracts'

export const SEED_EVENTS: Event[] = [
  {
    "id": "evt-1",
    "slug": "grand-turing-hackathon-2026",
    "orgId": "org-1",
    "organizerId": "club-cp",
    "organizerName": "CP Club",
    "organizerColor": "#2F4BD6",
    "club": {
      "id": "club-cp",
      "name": "CP Club",
      "color": "#2F4BD6",
      "verified": true
    },
    "isSignature": true,
    "title": "THE GRAND TURING HACKATHON 2026",
    "subtitle": "Annual 48-Hour Systems & Algorithmic Endurance Hackathon",
    "category": "hackathon",
    "type": "hackathon",
    "tags": [
      "Algorithms",
      "Systems",
      "Distributed",
      "Cash Prize",
      "Flagship"
    ],
    "description": "The premier algorithmic hackathon of the Autumn edition. 48 hours of relentless engineering where 60 curated teams build distributed protocols, high-frequency execution engines, and algorithmic intelligence. Peer-reviewed evaluation by industry staff engineers and research faculty.",
    "poster": "/images/events/event-1.webp",
    "banner": "/images/events/event-1.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Central Academic Complex, Engineering Pavilion",
      "mapUrl": "https://maps.google.com"
    },
    "startsAt": "2026-10-24T09:00:00Z",
    "endsAt": "2026-10-26T12:00:00Z",
    "eligibility": "Open to all engineering cohorts and verified developers. Teams of 2 to 4.",
    "capacity": 250,
    "seatsLeft": 34,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-10-22T23:59:00Z",
    "schedule": [
      {
        "time": "09:00 AM · DAY 1",
        "title": "Curatorial Keynote & Problem Space Reveal"
      },
      {
        "time": "11:00 AM · DAY 1",
        "title": "Hacking Commences & Architecture Checkpoints"
      },
      {
        "time": "02:00 AM · DAY 2",
        "title": "Midnight Algorithmic Stress Benchmark"
      },
      {
        "time": "09:00 AM · DAY 3",
        "title": "Code Freeze & Jury Deliberation"
      },
      {
        "time": "12:00 PM · DAY 3",
        "title": "Grand Exhibition & Award Conferment"
      }
    ],
    "people": [
      {
        "name": "Dr. Vikramaditya Sen",
        "role": "judge",
        "bio": "Distributed Systems Chair & Principal Investigator."
      },
      {
        "name": "Tara Venkatesh",
        "role": "judge",
        "bio": "Staff Systems Architect at Global Scale Compute."
      }
    ],
    "rules": [
      "All production code and repositories must be initiated during the hackathon hours.",
      "Open-source libraries and public frameworks are permitted; commercial APIs must be declared.",
      "Submissions require reproducible unit test coverage and architecture documentation."
    ],
    "contact": {
      "name": "Sameer Kulkarni",
      "phone": "+91 98450 12345",
      "email": "lead@cpclub.org"
    },
    "certificateInfo": "Verifiable Certificate of Distinction and Cash Grant awarded to winners.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": true
    },
    "teamConfig": {
      "minSize": 2,
      "maxSize": 4
    },
    "formSchema": [
      {
        "id": "f-github",
        "type": "text",
        "label": "GitHub Organization or Profile URL",
        "required": true
      },
      {
        "id": "f-track",
        "type": "select",
        "label": "Preferred Track",
        "options": [
          "Distributed Protocols",
          "AI & Neural Engines",
          "Security & Cryptography"
        ],
        "required": true
      },
      {
        "id": "f-exp",
        "type": "longtext",
        "label": "Prior Systems or Competitive Coding Background",
        "required": false
      }
    ],
    "status": "published",
    "results": [],
    "photos": [],
    "promotion": {
      "label": "Promoted",
      "priority": 5,
      "startsAt": "2026-10-01T00:00:00Z",
      "endsAt": "2026-11-01T00:00:00Z"
    },
    "publishedAt": "2026-10-08T09:00:00Z",
    "registrationsCount": 216,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T10:00:00Z"
  },
  {
    "id": "evt-2",
    "slug": "neural-frontiers-symposium-2026",
    "orgId": "org-1",
    "organizerId": "club-ai",
    "organizerName": "AIONAI",
    "organizerColor": "#7B63A8",
    "club": {
      "id": "club-ai",
      "name": "AIONAI",
      "color": "#7B63A8",
      "verified": true
    },
    "isSignature": true,
    "title": "NEURAL FRONTIERS RESEARCH SYMPOSIUM",
    "subtitle": "State of Frontier Generative Models, Interpretability & Multimodal Vision",
    "category": "talk",
    "type": "talk",
    "tags": [
      "AI",
      "Research",
      "Keynote",
      "Symposium",
      "Flagship"
    ],
    "description": "A full-day scholarly dialogue bringing together neural architects, foundation model researchers, and compute practitioners. Deep dive presentations on mechanistic interpretability, diffusion formulations, and efficient model alignment.",
    "poster": "/images/events/event-2.webp",
    "banner": "/images/events/event-2.webp",
    "venue": {
      "name": "Turing Computer Lab & Main Stage",
      "address": "Computing Pavilion, Floor 3",
      "mapUrl": "https://maps.google.com"
    },
    "startsAt": "2026-10-18T09:30:00Z",
    "endsAt": "2026-10-18T18:00:00Z",
    "eligibility": "Open to researchers, students, and engineers.",
    "capacity": 180,
    "seatsLeft": 12,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-10-16T23:59:00Z",
    "schedule": [
      {
        "time": "09:30 AM",
        "title": "Opening Remarks & Compute Landscape Address"
      },
      {
        "time": "11:00 AM",
        "title": "Mechanistic Circuits in Large Language Decoders"
      },
      {
        "time": "02:00 PM",
        "title": "Hardware Acceleration & Speculative Sampling Salon"
      },
      {
        "time": "04:30 PM",
        "title": "Curatorial Panel: The Trajectory of Open Weights"
      }
    ],
    "people": [
      {
        "name": "Dr. Leena Varma",
        "role": "speaker",
        "bio": "Faculty Chair, Neural Systems Laboratory."
      }
    ],
    "rules": [
      "Chatham House Rule applies during closed-door breakout forums."
    ],
    "contact": {
      "name": "Nikhil Menon",
      "email": "chair@aionai.org"
    },
    "certificateInfo": "Verifiable Certificate of Scholarly Attendance.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [
      {
        "id": "f-inst",
        "type": "text",
        "label": "Academic Department or Laboratory Affiliation",
        "required": true
      },
      {
        "id": "f-interest",
        "type": "text",
        "label": "Primary Research Domain",
        "required": true
      }
    ],
    "status": "published",
    "results": [],
    "photos": [],
    "promotion": {
      "label": "Promoted",
      "priority": 4,
      "startsAt": "2026-10-01T00:00:00Z",
      "endsAt": "2026-11-01T00:00:00Z"
    },
    "publishedAt": "2026-10-07T14:30:00Z",
    "registrationsCount": 168,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T10:00:00Z"
  },
  {
    "id": "evt-3",
    "slug": "biomimetic-swarm-kinematics-workshop",
    "orgId": "org-1",
    "organizerId": "club-birds",
    "organizerName": "BIRDS",
    "organizerColor": "#6F8468",
    "club": {
      "id": "club-birds",
      "name": "BIRDS",
      "color": "#6F8468",
      "verified": true
    },
    "isSignature": false,
    "title": "BIOMIMETIC SWARM KINEMATICS WORKSHOP",
    "subtitle": "Hands-on Autonomous Micro-Robotics & Insect Flight Mechanics",
    "category": "workshop",
    "type": "workshop",
    "tags": [
      "Robotics",
      "Bio-inspired",
      "Hardware",
      "Sensors"
    ],
    "description": "Construct and calibrate bio-inspired flapping-wing autonomous systems. Includes real-time sensor fusion using micro-optical flow cameras and custom brushless motor speed controllers.",
    "poster": "/images/events/event-3.webp",
    "venue": {
      "name": "Mechatronics Pavilion Flight Arena",
      "address": "Aeronautics Block B"
    },
    "startsAt": "2026-10-21T10:00:00Z",
    "endsAt": "2026-10-21T17:00:00Z",
    "eligibility": "Intermediate hardware proficiency recommended.",
    "capacity": 90,
    "seatsLeft": 4,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-10-19T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Piezoelectric Actuators & Wing Dynamics Theory"
      },
      {
        "time": "01:00 PM",
        "title": "Soldering & Microcontroller Firmware Flashing"
      },
      {
        "time": "03:30 PM",
        "title": "Indoor Autonomous Arena Obstacle Trials"
      }
    ],
    "people": [
      {
        "name": "Tara Nair",
        "role": "instructor",
        "bio": "Robotics Lead & Autonomous Flight Researcher."
      }
    ],
    "rules": [
      "Safety goggles mandatory in the arena at all times."
    ],
    "contact": {
      "name": "Karthik Balan",
      "email": "lead@birds.org"
    },
    "certificateInfo": "Hardware Lab Certification Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "promotion": {
      "label": "Promoted",
      "priority": 3,
      "startsAt": "2026-10-01T00:00:00Z",
      "endsAt": "2026-11-01T00:00:00Z"
    },
    "publishedAt": "2026-10-06T11:00:00Z",
    "registrationsCount": 86,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T10:00:00Z"
  },
  {
    "id": "evt-4",
    "slug": "zero-day-exploit-ctf-2026",
    "orgId": "org-1",
    "organizerId": "club-cyberguard",
    "organizerName": "CyberGuard",
    "organizerColor": "#1F5F5B",
    "club": {
      "id": "club-cyberguard",
      "name": "CyberGuard",
      "color": "#1F5F5B",
      "verified": true
    },
    "isSignature": true,
    "title": "ZERO-DAY PROTOCOL CTF 2026",
    "subtitle": "Competitive Offensive Security & Reverse Engineering Tournament",
    "category": "competition",
    "type": "competition",
    "tags": [
      "Security",
      "Reverse Engineering",
      "CTF",
      "Pwn",
      "Cryptography"
    ],
    "description": "12-hour high-tempo offensive security showdown. Challenges cover heap exploitation, ARM firmware vulnerabilities, post-quantum cryptographic primitives, and smart contract protocol re-entrancy.",
    "poster": "/images/events/event-4.webp",
    "venue": {
      "name": "Cybersecurity Isolation Lab",
      "address": "Security Complex, Floor 1"
    },
    "startsAt": "2026-10-28T09:00:00Z",
    "endsAt": "2026-10-28T21:00:00Z",
    "eligibility": "Solo or duos.",
    "capacity": 200,
    "seatsLeft": 5,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-10-26T23:59:00Z",
    "schedule": [
      {
        "time": "09:00 AM",
        "title": "Network Access Release & Environment Brief"
      },
      {
        "time": "09:30 AM",
        "title": "Flags Live: Jeopardy & Attack-Defense Board"
      },
      {
        "time": "08:30 PM",
        "title": "Scoreboard Freeze & Solution Validation"
      }
    ],
    "people": [
      {
        "name": "Pranav Nair",
        "role": "judge",
        "bio": "CTF Captain & Kernel Security Specialist."
      }
    ],
    "rules": [
      "Denial of service against competition scoring infrastructure is strictly forbidden.",
      "Flag sharing between distinct registered teams disqualifies both."
    ],
    "contact": {
      "name": "Divya Krishnan",
      "email": "lead@cyberguard.org"
    },
    "certificateInfo": "Verifiable Proof-of-Skill Certificate of Distinction.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": true
    },
    "teamConfig": {
      "minSize": 1,
      "maxSize": 2
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "promotion": {
      "label": "Promoted",
      "priority": 2,
      "startsAt": "2026-10-01T00:00:00Z",
      "endsAt": "2026-11-01T00:00:00Z"
    },
    "publishedAt": "2026-10-05T16:00:00Z",
    "registrationsCount": 195,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T10:00:00Z"
  },
  {
    "id": "evt-5",
    "slug": "devcraft-architecture-retreat",
    "orgId": "org-1",
    "organizerId": "club-devcraft",
    "organizerName": "DevCraft",
    "organizerColor": "#C66A4A",
    "club": {
      "id": "club-devcraft",
      "name": "DevCraft",
      "color": "#C66A4A",
      "verified": true
    },
    "isSignature": false,
    "title": "DEVCRAFT ARCHITECTURE RETREAT",
    "subtitle": "High-Concurrency Distributed Systems & Resilient Infrastructure",
    "category": "workshop",
    "type": "workshop",
    "tags": [
      "Architecture",
      "Distributed Systems",
      "Kafka",
      "Golang"
    ],
    "description": "Masterclass on event-driven architectures, write-ahead logs, and database sharding under multi-million message throughputs. Practical implementations built in Go and RocksDB.",
    "poster": "/images/events/event-5.webp",
    "venue": {
      "name": "Distributed Systems Studio",
      "address": "Software Engineering Annex"
    },
    "startsAt": "2026-10-30T10:00:00Z",
    "endsAt": "2026-10-31T18:00:00Z",
    "eligibility": "Engineers with familiarity with backend concurrency primitives.",
    "capacity": 120,
    "seatsLeft": 8,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-10-28T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM · DAY 1",
        "title": "Consensus Engines: Raft vs Multi-Paxos"
      },
      {
        "time": "02:00 PM · DAY 1",
        "title": "LSM-Trees and Lockless Ring Buffer Optimization"
      },
      {
        "time": "10:00 AM · DAY 2",
        "title": "Network Partition Simulation & Split-Brain Drills"
      }
    ],
    "people": [
      {
        "name": "Siddharth Roy",
        "role": "instructor",
        "bio": "Core Infrastructure Lead at DevCraft."
      }
    ],
    "rules": [
      "Bring your own Unix-like dev environment."
    ],
    "contact": {
      "name": "Siddharth Roy",
      "email": "lead@devcraft.org"
    },
    "certificateInfo": "Advanced Systems Specialization Credential Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": true,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "promotion": {
      "label": "Promoted",
      "priority": 1,
      "startsAt": "2026-10-01T00:00:00Z",
      "endsAt": "2026-11-01T00:00:00Z"
    },
    "publishedAt": "2026-10-04T10:00:00Z",
    "registrationsCount": 112,
    "isFree": false,
    "price": 299,
    "createdAt": "2026-10-01T10:00:00Z"
  },
  {
    "id": "evt-6",
    "slug": "combat-robotics-arena-qualifiers",
    "orgId": "org-1",
    "organizerId": "club-robocrafters",
    "organizerName": "Robocrafters",
    "organizerColor": "#B85D19",
    "club": {
      "id": "club-robocrafters",
      "name": "Robocrafters",
      "color": "#B85D19",
      "verified": false
    },
    "isSignature": false,
    "title": "COMBAT ROBOTICS ARENA QUALIFIERS",
    "subtitle": "Kinetic Weapon Systems & Heavyweight Chassis Showdown",
    "category": "competition",
    "type": "competition",
    "tags": [
      "Robotics",
      "Hardware",
      "Combat",
      "Fabrication"
    ],
    "description": "Qualifying rounds for the 15kg featherweight combat arena. Dual-drum spinners, titanium chassis wedges, and remote telemetry fail-safes tested in bulletproof Lexan containment.",
    "poster": "/images/events/event-6.webp",
    "venue": {
      "name": "Outdoor Fabrication Courtyard",
      "address": "Mech Annex 1"
    },
    "startsAt": "2026-11-02T13:00:00Z",
    "endsAt": "2026-11-02T19:00:00Z",
    "eligibility": "Registered mechatronics collectives.",
    "capacity": 150,
    "seatsLeft": 22,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-05T00:00:00Z",
    "registrationClosesAt": "2026-10-30T23:59:00Z",
    "schedule": [
      {
        "time": "01:00 PM",
        "title": "Safety Inspections & Weapon Lock Verification"
      }
    ],
    "people": [
      {
        "name": "Vikram Seth",
        "role": "judge",
        "bio": "Combat Robotics Lead."
      }
    ],
    "rules": [
      "Active fail-safe radio kill switch mandatory."
    ],
    "contact": {
      "name": "Vikram Seth",
      "email": "lead@robocrafters.org"
    },
    "certificateInfo": "Tournament Merit Certificate Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": true
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-03T09:00:00Z",
    "registrationsCount": 128,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T10:00:00Z"
  },
  {
    "id": "evt-7",
    "slug": "pervasive-lorawan-sensor-mesh",
    "orgId": "org-1",
    "organizerId": "club-nexiot",
    "organizerName": "NexIoT",
    "organizerColor": "#E3A12F",
    "club": {
      "id": "club-nexiot",
      "name": "NexIoT",
      "color": "#E3A12F",
      "verified": false
    },
    "isSignature": false,
    "title": "PERVASIVE LORAWAN SENSOR MESH",
    "subtitle": "Deploying Sub-Gigahertz Long-Range Telemetry Nodes Across Campus",
    "category": "workshop",
    "type": "workshop",
    "tags": [
      "IoT",
      "LoRaWAN",
      "Embedded",
      "Hardware"
    ],
    "description": "Field deployment workshop configuring solar-harvesting ESP32 nodes communicating via 868MHz LoRa packets to a centralized Grafana dashboard over The Things Network.",
    "poster": "/images/events/event-7.webp",
    "venue": {
      "name": "Embedded Communications Lab",
      "address": "Electrical Sciences Block"
    },
    "startsAt": "2026-11-05T10:00:00Z",
    "endsAt": "2026-11-05T16:00:00Z",
    "eligibility": "All students with basic C++ or MicroPython experience.",
    "capacity": 80,
    "seatsLeft": 18,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-05T00:00:00Z",
    "registrationClosesAt": "2026-11-03T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Sub-GHz RF Propagation & Antenna Tuning"
      }
    ],
    "people": [
      {
        "name": "Harsh Vardhan",
        "role": "instructor",
        "bio": "NexIoT Lead."
      }
    ],
    "rules": [
      "Equipment provided in lab kit."
    ],
    "contact": {
      "name": "Harsh Vardhan",
      "email": "lead@nexiot.org"
    },
    "certificateInfo": "IoT Engineering Certificate Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-02T12:00:00Z",
    "registrationsCount": 62,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T10:00:00Z"
  },
  {
    "id": "evt-8",
    "slug": "generative-graphics-and-shader-lab",
    "orgId": "org-1",
    "organizerId": "club-pixelforge",
    "organizerName": "PixelForge",
    "organizerColor": "#5B2A4A",
    "club": {
      "id": "club-pixelforge",
      "name": "PixelForge",
      "color": "#5B2A4A",
      "verified": true
    },
    "isSignature": false,
    "title": "GENERATIVE GRAPHICS & SHADER LAB",
    "subtitle": "Creative Coding in GLSL, Raymarching, and Signed Distance Fields",
    "category": "workshop",
    "type": "workshop",
    "tags": [
      "Creative Coding",
      "Design",
      "Shaders",
      "WebGL"
    ],
    "description": "Learn raymarching mathematics, volumetric lighting, fractal repetition, and post-processing filters rendered in real-time inside WebGL fragment shaders.",
    "poster": "/images/events/event-8.webp",
    "venue": {
      "name": "Design Pavilion Studio 4",
      "address": "Arts & Media Wing"
    },
    "startsAt": "2026-11-08T14:00:00Z",
    "endsAt": "2026-11-08T19:00:00Z",
    "eligibility": "Open to designers and developers.",
    "capacity": 75,
    "seatsLeft": 3,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-05T00:00:00Z",
    "registrationClosesAt": "2026-11-06T23:59:00Z",
    "schedule": [
      {
        "time": "02:00 PM",
        "title": "Math as Canvas: Vector Fields and SDFs"
      }
    ],
    "people": [
      {
        "name": "Aryan Kapoor",
        "role": "instructor",
        "bio": "PixelForge Lead."
      }
    ],
    "rules": [
      "Modern WebGL2-compatible laptop required."
    ],
    "contact": {
      "name": "Aryan Kapoor",
      "email": "lead@pixelforge.org"
    },
    "certificateInfo": "Creative Technology Credential Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-01T15:00:00Z",
    "registrationsCount": 72,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T10:00:00Z"
  },
  {
    "id": "evt-9",
    "slug": "software-freedom-day-kernel-salon",
    "orgId": "org-1",
    "organizerId": "club-foss",
    "organizerName": "FOSS Society",
    "organizerColor": "#A32828",
    "club": {
      "id": "club-foss",
      "name": "FOSS Society",
      "color": "#A32828",
      "verified": true
    },
    "isSignature": false,
    "title": "SOFTWARE FREEDOM DAY & KERNEL SALON",
    "subtitle": "Linux Kernel Patching, eBPF Observability & Open Firmware",
    "category": "talk",
    "type": "talk",
    "tags": [
      "Open Source",
      "Linux",
      "Kernel",
      "eBPF"
    ],
    "description": "Community unconference celebrating open source infrastructure. Discussions on submitting upstream kernel patches, eBPF tracepoints, and building non-proprietary computing stacks.",
    "poster": "/images/events/event-9.webp",
    "venue": {
      "name": "Open Source Amphitheater",
      "address": "Computing Block Garden"
    },
    "startsAt": "2026-11-12T11:00:00Z",
    "endsAt": "2026-11-12T17:00:00Z",
    "eligibility": "Open to the public.",
    "capacity": 200,
    "seatsLeft": 84,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-05T00:00:00Z",
    "registrationClosesAt": "2026-11-11T23:59:00Z",
    "schedule": [
      {
        "time": "11:00 AM",
        "title": "Why Copyleft Matters for AI Foundations"
      }
    ],
    "people": [
      {
        "name": "Varun Swaminathan",
        "role": "speaker",
        "bio": "FOSS Lead."
      }
    ],
    "rules": [
      "Respect open source code of conduct."
    ],
    "contact": {
      "name": "Varun Swaminathan",
      "email": "lead@foss.org"
    },
    "certificateInfo": "Participation Certificate Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-09-28T10:00:00Z",
    "registrationsCount": 116,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T10:00:00Z"
  },
  {
    "id": "evt-10",
    "slug": "quantum-computing-algorithms-draft",
    "orgId": "org-1",
    "organizerId": "club-cp",
    "organizerName": "CP Club",
    "organizerColor": "#2F4BD6",
    "club": {
      "id": "club-cp",
      "name": "CP Club",
      "color": "#2F4BD6",
      "verified": true
    },
    "isSignature": false,
    "title": "QUANTUM GATES & SHOR ALGORITHM LAB (DRAFT)",
    "subtitle": "Qiskit Simulation of Fault-Tolerant Factoring",
    "category": "workshop",
    "type": "workshop",
    "tags": [
      "Quantum",
      "Algorithms",
      "Draft"
    ],
    "description": "Upcoming draft event undergoing internal review by club coordinators.",
    "poster": "",
    "venue": {
      "name": "Turing Computer Lab"
    },
    "startsAt": "2026-12-01T10:00:00Z",
    "endsAt": "2026-12-01T16:00:00Z",
    "eligibility": "All students",
    "capacity": 50,
    "seatsLeft": 50,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-11-15T00:00:00Z",
    "registrationClosesAt": "2026-11-30T23:59:00Z",
    "schedule": [],
    "people": [],
    "rules": [],
    "contact": {
      "name": "Sameer Kulkarni",
      "email": "lead@cpclub.org"
    },
    "certificateInfo": "Certificate upon completion",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "draft",
    "results": [],
    "photos": [],
    "publishedAt": "2026-09-20T10:00:00Z",
    "registrationsCount": 0,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T10:00:00Z"
  },
  {
    "id": "evt-11",
    "slug": "graph-theory-heuristic-search-salon",
    "orgId": "org-1",
    "organizerId": "club-birds",
    "organizerName": "BIRDS",
    "organizerColor": "#6F8468",
    "club": {
      "id": "club-birds",
      "name": "BIRDS",
      "color": "#6F8468",
      "verified": true
    },
    "isSignature": false,
    "title": "GRAPH THEORY & HEURISTIC SEARCH SALON",
    "subtitle": "Curated by BIRDS",
    "category": "workshop",
    "type": "workshop",
    "tags": [
      "BIRDS",
      "WORKSHOP"
    ],
    "description": "Exploration of A* optimization, min-cut max-flow variants, and planar graphs.",
    "poster": "/images/events/event-10.webp",
    "banner": "/images/events/event-10.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-02T10:00:00Z",
    "endsAt": "2026-11-02T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 60,
    "seatsLeft": 2,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-birds.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-01T10:00:00Z",
    "registrationsCount": 30,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-12",
    "slug": "latency-critical-rust-engine-build",
    "orgId": "org-1",
    "organizerId": "club-devcraft",
    "organizerName": "DevCraft",
    "organizerColor": "#C66A4A",
    "club": {
      "id": "club-devcraft",
      "name": "DevCraft",
      "color": "#C66A4A",
      "verified": true
    },
    "isSignature": false,
    "title": "LATENCY-CRITICAL RUST ENGINE BUILD",
    "subtitle": "Curated by DevCraft",
    "category": "workshop",
    "type": "workshop",
    "tags": [
      "DevCraft",
      "WORKSHOP"
    ],
    "description": "Zero-cost abstractions, memory fences, and lock-free ring buffers in modern Rust.",
    "poster": "/images/events/event-11.webp",
    "banner": "/images/events/event-11.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-03T10:00:00Z",
    "endsAt": "2026-11-03T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 75,
    "seatsLeft": 16,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-devcraft.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": true,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-02T10:00:00Z",
    "registrationsCount": 47,
    "isFree": false,
    "price": 199,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-13",
    "slug": "deep-generative-audio-synthesis",
    "orgId": "org-1",
    "organizerId": "club-robocrafters",
    "organizerName": "Robocrafters",
    "organizerColor": "#B85D19",
    "club": {
      "id": "club-robocrafters",
      "name": "Robocrafters",
      "color": "#B85D19",
      "verified": false
    },
    "isSignature": false,
    "title": "DEEP GENERATIVE AUDIO SYNTHESIS",
    "subtitle": "Curated by Robocrafters",
    "category": "talk",
    "type": "talk",
    "tags": [
      "Robocrafters",
      "TALK"
    ],
    "description": "State-space diffusion models applied to parametric music and speech synthesis.",
    "poster": "/images/events/event-12.webp",
    "banner": "/images/events/event-12.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-04T10:00:00Z",
    "endsAt": "2026-11-04T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 90,
    "seatsLeft": 17,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-robocrafters.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-03T10:00:00Z",
    "registrationsCount": 64,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-14",
    "slug": "biomimetic-flight-sensors-showcase",
    "orgId": "org-1",
    "organizerId": "club-cyberguard",
    "organizerName": "CyberGuard",
    "organizerColor": "#1F5F5B",
    "club": {
      "id": "club-cyberguard",
      "name": "CyberGuard",
      "color": "#1F5F5B",
      "verified": true
    },
    "isSignature": false,
    "title": "BIOMIMETIC FLIGHT SENSORS SHOWCASE",
    "subtitle": "Curated by CyberGuard",
    "category": "club_events",
    "type": "other",
    "tags": [
      "CyberGuard",
      "CLUB_EVENTS"
    ],
    "description": "Demonstration of strain-gauge synthetic insect wings and optical feedback control.",
    "poster": "/images/events/event-13.webp",
    "banner": "/images/events/event-13.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-05T10:00:00Z",
    "endsAt": "2026-11-05T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 105,
    "seatsLeft": 18,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-cyberguard.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-04T10:00:00Z",
    "registrationsCount": 81,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-15",
    "slug": "kubernetes-at-scale-crash-drill",
    "orgId": "org-1",
    "organizerId": "club-nexiot",
    "organizerName": "NexIoT",
    "organizerColor": "#E3A12F",
    "club": {
      "id": "club-nexiot",
      "name": "NexIoT",
      "color": "#E3A12F",
      "verified": false
    },
    "isSignature": false,
    "title": "KUBERNETES AT SCALE CRASH DRILL",
    "subtitle": "Curated by NexIoT",
    "category": "workshop",
    "type": "workshop",
    "tags": [
      "NexIoT",
      "WORKSHOP"
    ],
    "description": "Hands-on cluster chaos testing with Cilium eBPF network observability.",
    "poster": "/images/events/event-14.webp",
    "banner": "/images/events/event-14.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-06T10:00:00Z",
    "endsAt": "2026-11-06T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 120,
    "seatsLeft": 19,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-nexiot.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-05T10:00:00Z",
    "registrationsCount": 98,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-16",
    "slug": "autonomous-submersible-navigation",
    "orgId": "org-1",
    "organizerId": "club-pixelforge",
    "organizerName": "PixelForge",
    "organizerColor": "#5B2A4A",
    "club": {
      "id": "club-pixelforge",
      "name": "PixelForge",
      "color": "#5B2A4A",
      "verified": true
    },
    "isSignature": false,
    "title": "AUTONOMOUS SUBMERSIBLE NAVIGATION",
    "subtitle": "Curated by PixelForge",
    "category": "workshop",
    "type": "workshop",
    "tags": [
      "PixelForge",
      "WORKSHOP"
    ],
    "description": "Acoustic positioning and visual SLAM underwater navigation algorithms.",
    "poster": "/images/events/event-15.webp",
    "banner": "/images/events/event-15.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-07T10:00:00Z",
    "endsAt": "2026-11-07T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 135,
    "seatsLeft": 20,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-pixelforge.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-06T10:00:00Z",
    "registrationsCount": 115,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-17",
    "slug": "zero-knowledge-proof-circuit-lab",
    "orgId": "org-1",
    "organizerId": "club-foss",
    "organizerName": "FOSS Society",
    "organizerColor": "#A32828",
    "club": {
      "id": "club-foss",
      "name": "FOSS Society",
      "color": "#A32828",
      "verified": true
    },
    "isSignature": false,
    "title": "ZERO-KNOWLEDGE PROOF CIRCUIT LAB",
    "subtitle": "Curated by FOSS Society",
    "category": "workshop",
    "type": "workshop",
    "tags": [
      "FOSS Society",
      "WORKSHOP"
    ],
    "description": "Writing Circom circuits for verifiable computations and Groth16 zk-SNARK proofs.",
    "poster": "/images/events/event-16.webp",
    "banner": "/images/events/event-16.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-08T10:00:00Z",
    "endsAt": "2026-11-08T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 150,
    "seatsLeft": 21,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-foss.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": true,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-07T10:00:00Z",
    "registrationsCount": 132,
    "isFree": false,
    "price": 499,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-18",
    "slug": "smart-power-grid-telemetry-forum",
    "orgId": "org-1",
    "organizerId": "club-cp",
    "organizerName": "CP Club",
    "organizerColor": "#2F4BD6",
    "club": {
      "id": "club-cp",
      "name": "CP Club",
      "color": "#2F4BD6",
      "verified": true
    },
    "isSignature": false,
    "title": "SMART POWER GRID TELEMETRY FORUM",
    "subtitle": "Curated by CP Club",
    "category": "talk",
    "type": "talk",
    "tags": [
      "CP Club",
      "TALK"
    ],
    "description": "Edge processing for distributed photovoltaic load estimation and phase balancing.",
    "poster": "/images/events/event-17.webp",
    "banner": "/images/events/event-17.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-09T10:00:00Z",
    "endsAt": "2026-11-09T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 165,
    "seatsLeft": 2,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-cp.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-01T10:00:00Z",
    "registrationsCount": 149,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-19",
    "slug": "variable-font-design-workshop",
    "orgId": "org-1",
    "organizerId": "club-ai",
    "organizerName": "AIONAI",
    "organizerColor": "#7B63A8",
    "club": {
      "id": "club-ai",
      "name": "AIONAI",
      "color": "#7B63A8",
      "verified": true
    },
    "isSignature": false,
    "title": "VARIABLE FONT DESIGN WORKSHOP",
    "subtitle": "Curated by AIONAI",
    "category": "workshop",
    "type": "workshop",
    "tags": [
      "AIONAI",
      "WORKSHOP"
    ],
    "description": "Drawing bezier axes, designing optical weights, and compiling OpenType font binaries.",
    "poster": "",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-10T10:00:00Z",
    "endsAt": "2026-11-10T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 180,
    "seatsLeft": 23,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-ai.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-02T10:00:00Z",
    "registrationsCount": 166,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-20",
    "slug": "self-hosted-matrix-chat-federation",
    "orgId": "org-1",
    "organizerId": "club-birds",
    "organizerName": "BIRDS",
    "organizerColor": "#6F8468",
    "club": {
      "id": "club-birds",
      "name": "BIRDS",
      "color": "#6F8468",
      "verified": true
    },
    "isSignature": false,
    "title": "SELF-HOSTED MATRIX CHAT FEDERATION",
    "subtitle": "Curated by BIRDS",
    "category": "workshop",
    "type": "workshop",
    "tags": [
      "BIRDS",
      "WORKSHOP"
    ],
    "description": "Decentralized communication infrastructure setup using Synapse and Rust conduits.",
    "poster": "/images/events/event-19.webp",
    "banner": "/images/events/event-19.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-11T10:00:00Z",
    "endsAt": "2026-11-11T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 195,
    "seatsLeft": 24,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-birds.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-03T10:00:00Z",
    "registrationsCount": 183,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-21",
    "slug": "icpc-regional-warmup-contest",
    "orgId": "org-1",
    "organizerId": "club-devcraft",
    "organizerName": "DevCraft",
    "organizerColor": "#C66A4A",
    "club": {
      "id": "club-devcraft",
      "name": "DevCraft",
      "color": "#C66A4A",
      "verified": true
    },
    "isSignature": false,
    "title": "ICPC REGIONAL WARMUP CONTEST",
    "subtitle": "Curated by DevCraft",
    "category": "competition",
    "type": "competition",
    "tags": [
      "DevCraft",
      "COMPETITION"
    ],
    "description": "5-hour 12-problem contest with live scoreboard and post-contest editorial analysis.",
    "poster": "/images/events/event-20.webp",
    "banner": "/images/events/event-20.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-12T10:00:00Z",
    "endsAt": "2026-11-12T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 60,
    "seatsLeft": 25,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-devcraft.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-04T10:00:00Z",
    "registrationsCount": 200,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-22",
    "slug": "embedded-vision-with-edge-tpus",
    "orgId": "org-1",
    "organizerId": "club-robocrafters",
    "organizerName": "Robocrafters",
    "organizerColor": "#B85D19",
    "club": {
      "id": "club-robocrafters",
      "name": "Robocrafters",
      "color": "#B85D19",
      "verified": false
    },
    "isSignature": false,
    "title": "EMBEDDED VISION WITH EDGE TPUs",
    "subtitle": "Curated by Robocrafters",
    "category": "workshop",
    "type": "workshop",
    "tags": [
      "Robocrafters",
      "WORKSHOP"
    ],
    "description": "Real-time object segmentation on Google Coral and Hailo-8 acceleration chips.",
    "poster": "/images/events/event-21.webp",
    "banner": "/images/events/event-21.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-13T10:00:00Z",
    "endsAt": "2026-11-13T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 75,
    "seatsLeft": 26,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-robocrafters.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-05T10:00:00Z",
    "registrationsCount": 37,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-23",
    "slug": "firmware-reverse-engineering-masterclass",
    "orgId": "org-1",
    "organizerId": "club-cyberguard",
    "organizerName": "CyberGuard",
    "organizerColor": "#1F5F5B",
    "club": {
      "id": "club-cyberguard",
      "name": "CyberGuard",
      "color": "#1F5F5B",
      "verified": true
    },
    "isSignature": false,
    "title": "FIRMWARE REVERSE ENGINEERING MASTERCLASS",
    "subtitle": "Curated by CyberGuard",
    "category": "workshop",
    "type": "workshop",
    "tags": [
      "CyberGuard",
      "WORKSHOP"
    ],
    "description": "Dumping SPI flash, Ghidra decompilation of ARM Cortex-M microcode.",
    "poster": "/images/events/event-22.webp",
    "banner": "/images/events/event-22.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-14T10:00:00Z",
    "endsAt": "2026-11-14T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 90,
    "seatsLeft": 27,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-cyberguard.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": true,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-06T10:00:00Z",
    "registrationsCount": 54,
    "isFree": false,
    "price": 349,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-24",
    "slug": "pneumatic-high-pressure-combat-weapons",
    "orgId": "org-1",
    "organizerId": "club-nexiot",
    "organizerName": "NexIoT",
    "organizerColor": "#E3A12F",
    "club": {
      "id": "club-nexiot",
      "name": "NexIoT",
      "color": "#E3A12F",
      "verified": false
    },
    "isSignature": false,
    "title": "PNEUMATIC HIGH-PRESSURE COMBAT WEAPONS",
    "subtitle": "Curated by NexIoT",
    "category": "workshop",
    "type": "workshop",
    "tags": [
      "NexIoT",
      "WORKSHOP"
    ],
    "description": "Machining high-flow solenoid valves and nitrogen tank safety protocols.",
    "poster": "/images/events/event-23.webp",
    "banner": "/images/events/event-23.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-15T10:00:00Z",
    "endsAt": "2026-11-15T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 105,
    "seatsLeft": 28,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-nexiot.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-07T10:00:00Z",
    "registrationsCount": 71,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-25",
    "slug": "brutalist-web-architecture-symposium",
    "orgId": "org-1",
    "organizerId": "club-pixelforge",
    "organizerName": "PixelForge",
    "organizerColor": "#5B2A4A",
    "club": {
      "id": "club-pixelforge",
      "name": "PixelForge",
      "color": "#5B2A4A",
      "verified": true
    },
    "isSignature": false,
    "title": "BRUTALIST WEB ARCHITECTURE SYMPOSIUM",
    "subtitle": "Curated by PixelForge",
    "category": "talk",
    "type": "talk",
    "tags": [
      "PixelForge",
      "TALK"
    ],
    "description": "Architectural dialogue on semantic minimalism, zero JavaScript fallbacks, and craft.",
    "poster": "",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-16T10:00:00Z",
    "endsAt": "2026-11-16T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 120,
    "seatsLeft": 2,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-pixelforge.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-01T10:00:00Z",
    "registrationsCount": 88,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-26",
    "slug": "open-science-data-reproducibility-day",
    "orgId": "org-1",
    "organizerId": "club-foss",
    "organizerName": "FOSS Society",
    "organizerColor": "#A32828",
    "club": {
      "id": "club-foss",
      "name": "FOSS Society",
      "color": "#A32828",
      "verified": true
    },
    "isSignature": false,
    "title": "OPEN SCIENCE DATA REPRODUCIBILITY DAY",
    "subtitle": "Curated by FOSS Society",
    "category": "club_events",
    "type": "other",
    "tags": [
      "FOSS Society",
      "CLUB_EVENTS"
    ],
    "description": "Publishing reproducible Jupyter notebooks, Nix flakes, and Zenodo DOI registries.",
    "poster": "/images/events/event-1.webp",
    "banner": "/images/events/event-1.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-17T10:00:00Z",
    "endsAt": "2026-11-17T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 135,
    "seatsLeft": 30,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-foss.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-02T10:00:00Z",
    "registrationsCount": 105,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-27",
    "slug": "distributed-consensus-raft-algorithms",
    "orgId": "org-1",
    "organizerId": "club-cp",
    "organizerName": "CP Club",
    "organizerColor": "#2F4BD6",
    "club": {
      "id": "club-cp",
      "name": "CP Club",
      "color": "#2F4BD6",
      "verified": true
    },
    "isSignature": false,
    "title": "DISTRIBUTED CONSENSUS RAFT ALGORITHMS",
    "subtitle": "Curated by CP Club",
    "category": "workshop",
    "type": "workshop",
    "tags": [
      "CP Club",
      "WORKSHOP"
    ],
    "description": "Implementing leader election, log replication, and split-brain recovery from scratch.",
    "poster": "/images/events/event-2.webp",
    "banner": "/images/events/event-2.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-18T10:00:00Z",
    "endsAt": "2026-11-18T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 150,
    "seatsLeft": 31,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-cp.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "draft",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-03T10:00:00Z",
    "registrationsCount": 122,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-28",
    "slug": "neural-text-decoder-benchmark-sprint",
    "orgId": "org-1",
    "organizerId": "club-ai",
    "organizerName": "AIONAI",
    "organizerColor": "#7B63A8",
    "club": {
      "id": "club-ai",
      "name": "AIONAI",
      "color": "#7B63A8",
      "verified": true
    },
    "isSignature": false,
    "title": "NEURAL TEXT DECODER BENCHMARK SPRINT",
    "subtitle": "Curated by AIONAI",
    "category": "hackathon",
    "type": "hackathon",
    "tags": [
      "AIONAI",
      "HACKATHON"
    ],
    "description": "24-hour sprint to build the fastest speculative decoding inference engine.",
    "poster": "/images/events/event-3.webp",
    "banner": "/images/events/event-3.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-19T10:00:00Z",
    "endsAt": "2026-11-19T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 165,
    "seatsLeft": 32,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-ai.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-04T10:00:00Z",
    "registrationsCount": 139,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-29",
    "slug": "robotic-arm-inverse-kinematics-critique",
    "orgId": "org-1",
    "organizerId": "club-birds",
    "organizerName": "BIRDS",
    "organizerColor": "#6F8468",
    "club": {
      "id": "club-birds",
      "name": "BIRDS",
      "color": "#6F8468",
      "verified": true
    },
    "isSignature": false,
    "title": "ROBOTIC ARM INVERSE KINEMATICS CRITIQUE",
    "subtitle": "Curated by BIRDS",
    "category": "completed",
    "type": "other",
    "tags": [
      "BIRDS",
      "COMPLETED"
    ],
    "description": "Evaluation of 6-DoF Stewart platforms and closed-loop PID control loops.",
    "poster": "/images/events/event-4.webp",
    "banner": "/images/events/event-4.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-08-14T10:00:00Z",
    "endsAt": "2026-08-14T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 180,
    "seatsLeft": 0,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-birds.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "completed",
    "results": [
      {
        "position": "1st Place",
        "winnerName": "Lead Participant",
        "projectTitle": "Exemplary Technical Submission"
      }
    ],
    "photos": [],
    "publishedAt": "2026-10-05T10:00:00Z",
    "registrationsCount": 156,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-30",
    "slug": "cybersecurity-forensics-memory-dumps",
    "orgId": "org-1",
    "organizerId": "club-devcraft",
    "organizerName": "DevCraft",
    "organizerColor": "#C66A4A",
    "club": {
      "id": "club-devcraft",
      "name": "DevCraft",
      "color": "#C66A4A",
      "verified": true
    },
    "isSignature": false,
    "title": "CYBERSECURITY FORENSICS & MEMORY DUMPS",
    "subtitle": "Curated by DevCraft",
    "category": "completed",
    "type": "workshop",
    "tags": [
      "DevCraft",
      "COMPLETED"
    ],
    "description": "Volatility framework analysis of memory dumps during active rootkit execution.",
    "poster": "/images/events/event-5.webp",
    "banner": "/images/events/event-5.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-08-14T10:00:00Z",
    "endsAt": "2026-08-14T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 195,
    "seatsLeft": 0,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-devcraft.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "completed",
    "results": [
      {
        "position": "1st Place",
        "winnerName": "Lead Participant",
        "projectTitle": "Exemplary Technical Submission"
      }
    ],
    "photos": [],
    "publishedAt": "2026-10-06T10:00:00Z",
    "registrationsCount": 173,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-31",
    "slug": "post-quantum-lattice-cryptography-roundtable",
    "orgId": "org-1",
    "organizerId": "club-robocrafters",
    "organizerName": "Robocrafters",
    "organizerColor": "#B85D19",
    "club": {
      "id": "club-robocrafters",
      "name": "Robocrafters",
      "color": "#B85D19",
      "verified": false
    },
    "isSignature": false,
    "title": "POST-QUANTUM LATTICE CRYPTOGRAPHY ROUNDTABLE",
    "subtitle": "Curated by Robocrafters",
    "category": "talk",
    "type": "talk",
    "tags": [
      "Robocrafters",
      "TALK"
    ],
    "description": "Kyber and Dilithium mathematical foundations and NIST standardization roadmaps.",
    "poster": "/images/events/event-6.webp",
    "banner": "/images/events/event-6.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-22T10:00:00Z",
    "endsAt": "2026-11-22T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 60,
    "seatsLeft": 35,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-robocrafters.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-07T10:00:00Z",
    "registrationsCount": 190,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-32",
    "slug": "hardware-accelerated-ray-tracing-sprint",
    "orgId": "org-1",
    "organizerId": "club-cyberguard",
    "organizerName": "CyberGuard",
    "organizerColor": "#1F5F5B",
    "club": {
      "id": "club-cyberguard",
      "name": "CyberGuard",
      "color": "#1F5F5B",
      "verified": true
    },
    "isSignature": false,
    "title": "HARDWARE ACCELERATED RAY TRACING SPRINT",
    "subtitle": "Curated by CyberGuard",
    "category": "hackathon",
    "type": "hackathon",
    "tags": [
      "CyberGuard",
      "HACKATHON"
    ],
    "description": "Building custom BVH traversal cores in SystemVerilog for FPGA simulation.",
    "poster": "/images/events/event-7.webp",
    "banner": "/images/events/event-7.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-23T10:00:00Z",
    "endsAt": "2026-11-23T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 75,
    "seatsLeft": 2,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-cyberguard.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-01T10:00:00Z",
    "registrationsCount": 207,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-33",
    "slug": "micro-frontends-island-architectures",
    "orgId": "org-1",
    "organizerId": "club-nexiot",
    "organizerName": "NexIoT",
    "organizerColor": "#E3A12F",
    "club": {
      "id": "club-nexiot",
      "name": "NexIoT",
      "color": "#E3A12F",
      "verified": false
    },
    "isSignature": false,
    "title": "MICRO-FRONTENDS & ISLAND ARCHITECTURES",
    "subtitle": "Curated by NexIoT",
    "category": "workshop",
    "type": "workshop",
    "tags": [
      "NexIoT",
      "WORKSHOP"
    ],
    "description": "Decomposing colossal web codebases using Module Federation and web components.",
    "poster": "/images/events/event-8.webp",
    "banner": "/images/events/event-8.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-24T10:00:00Z",
    "endsAt": "2026-11-24T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 90,
    "seatsLeft": 37,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-nexiot.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-02T10:00:00Z",
    "registrationsCount": 44,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-34",
    "slug": "biological-neural-networks-synapse-chips",
    "orgId": "org-1",
    "organizerId": "club-pixelforge",
    "organizerName": "PixelForge",
    "organizerColor": "#5B2A4A",
    "club": {
      "id": "club-pixelforge",
      "name": "PixelForge",
      "color": "#5B2A4A",
      "verified": true
    },
    "isSignature": false,
    "title": "BIOLOGICAL NEURAL NETWORKS & SYNAPSE CHIPS",
    "subtitle": "Curated by PixelForge",
    "category": "talk",
    "type": "talk",
    "tags": [
      "PixelForge",
      "TALK"
    ],
    "description": "Neuromorphic spike timing-dependent plasticity modeled on Loihi neuromorphic silicon.",
    "poster": "/images/events/event-9.webp",
    "banner": "/images/events/event-9.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-25T10:00:00Z",
    "endsAt": "2026-11-25T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 105,
    "seatsLeft": 38,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-pixelforge.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-03T10:00:00Z",
    "registrationsCount": 61,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-35",
    "slug": "speed-coding-lightning-duel-iii",
    "orgId": "org-1",
    "organizerId": "club-foss",
    "organizerName": "FOSS Society",
    "organizerColor": "#A32828",
    "club": {
      "id": "club-foss",
      "name": "FOSS Society",
      "color": "#A32828",
      "verified": true
    },
    "isSignature": false,
    "title": "SPEED-CODING LIGHTNING DUEL III",
    "subtitle": "Curated by FOSS Society",
    "category": "competition",
    "type": "competition",
    "tags": [
      "FOSS Society",
      "COMPETITION"
    ],
    "description": "Single-elimination speed coding bracket tournament under intense spectator commentary.",
    "poster": "/images/events/event-10.webp",
    "banner": "/images/events/event-10.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-26T10:00:00Z",
    "endsAt": "2026-11-26T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 120,
    "seatsLeft": 39,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-foss.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-04T10:00:00Z",
    "registrationsCount": 78,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-36",
    "slug": "offensive-web-reconnaissance-at-scale",
    "orgId": "org-1",
    "organizerId": "club-cp",
    "organizerName": "CP Club",
    "organizerColor": "#2F4BD6",
    "club": {
      "id": "club-cp",
      "name": "CP Club",
      "color": "#2F4BD6",
      "verified": true
    },
    "isSignature": false,
    "title": "OFFENSIVE WEB RECONNAISSANCE AT SCALE",
    "subtitle": "Curated by CP Club",
    "category": "workshop",
    "type": "workshop",
    "tags": [
      "CP Club",
      "WORKSHOP"
    ],
    "description": "Automating mass ASN mapping, sub-domain discovery pipelines, and cloud bucket audits.",
    "poster": "/images/events/event-11.webp",
    "banner": "/images/events/event-11.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-02T10:00:00Z",
    "endsAt": "2026-11-02T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 135,
    "seatsLeft": 40,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-cp.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": true,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-05T10:00:00Z",
    "registrationsCount": 95,
    "isFree": false,
    "price": 249,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-37",
    "slug": "accessible-type-color-dynamics-salon",
    "orgId": "org-1",
    "organizerId": "club-ai",
    "organizerName": "AIONAI",
    "organizerColor": "#7B63A8",
    "club": {
      "id": "club-ai",
      "name": "AIONAI",
      "color": "#7B63A8",
      "verified": true
    },
    "isSignature": false,
    "title": "ACCESSIBLE TYPE & COLOR DYNAMICS SALON",
    "subtitle": "Curated by AIONAI",
    "category": "talk",
    "type": "talk",
    "tags": [
      "AIONAI",
      "TALK"
    ],
    "description": "APCA contrast algorithms, WCAG 3.0 perceptual color spaces, and variable typeface optics.",
    "poster": "",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-03T10:00:00Z",
    "endsAt": "2026-11-03T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 150,
    "seatsLeft": 41,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-ai.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-06T10:00:00Z",
    "registrationsCount": 112,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "evt-38",
    "slug": "energy-harvesting-smart-mesh-drill",
    "orgId": "org-1",
    "organizerId": "club-birds",
    "organizerName": "BIRDS",
    "organizerColor": "#6F8468",
    "club": {
      "id": "club-birds",
      "name": "BIRDS",
      "color": "#6F8468",
      "verified": true
    },
    "isSignature": false,
    "title": "ENERGY-HARVESTING SMART MESH DRILL",
    "subtitle": "Curated by BIRDS",
    "category": "club_events",
    "type": "other",
    "tags": [
      "BIRDS",
      "CLUB_EVENTS"
    ],
    "description": "Field testing thermo-electric and piezoelectric power modules for outdoor sensor swarms.",
    "poster": "/images/events/event-13.webp",
    "banner": "/images/events/event-13.webp",
    "venue": {
      "name": "Campus Main Auditorium",
      "address": "Academic Quadrangle"
    },
    "startsAt": "2026-11-04T10:00:00Z",
    "endsAt": "2026-11-04T16:00:00Z",
    "eligibility": "Open to all registered student collectives",
    "capacity": 165,
    "seatsLeft": 42,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-20T23:59:00Z",
    "schedule": [
      {
        "time": "10:00 AM",
        "title": "Curatorial Introduction & Technical Scope"
      }
    ],
    "people": [
      {
        "name": "Lead Curator",
        "role": "instructor",
        "bio": "Technical Association Fellow."
      }
    ],
    "rules": [
      "All engineering artifacts must be reproducible and open."
    ],
    "contact": {
      "name": "Club Lead",
      "email": "lead@club-birds.org"
    },
    "certificateInfo": "Verifiable Certificate of Participation Issued.",
    "features": {
      "certificate": true,
      "checkin": true,
      "paid": false,
      "team": false
    },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "publishedAt": "2026-10-07T10:00:00Z",
    "registrationsCount": 129,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  }
]

export const SEED_REGISTRATIONS: Registration[] = [
  {
    id: 'reg-1',
    eventId: 'evt-1',
    userId: 'usr-att',
    userEmail: 'attendee@example.com',
    userName: 'Aditya Narayan',
    answers: {
      'f-github': 'https://github.com/aditya-narayan',
      'f-track': 'Distributed Protocols',
      'f-exp': '3 years building in Go and Rust; active open source contributor.',
    },
    team: {
      teamName: 'ConsensusCore',
      leaderName: 'Aditya Narayan',
      leaderEmail: 'attendee@example.com',
      members: [
        { name: 'Aditya Narayan', email: 'attendee@example.com', role: 'Protocol Lead' },
        { name: 'Kavya Raman', email: 'kavya@example.com', role: 'Systems Engineer' },
      ],
    },
    status: 'registered',
    ticketCode: 'TKT-884192',
    createdAt: '2026-10-02T14:30:00Z',
    eventTitle: 'THE GRAND TURING HACKATHON 2026',
    eventSlug: 'grand-turing-hackathon-2026',
    organizerName: 'CP Club',
    organizerColor: '#2F4BD6',
    eventStartsAt: '2026-10-24T09:00:00Z',
  },
  {
    id: 'reg-2',
    eventId: 'evt-2',
    userId: 'usr-att',
    userEmail: 'attendee@example.com',
    userName: 'Aditya Narayan',
    answers: {
      'f-inst': 'Department of Computing',
      'f-interest': 'Mechanistic Interpretability',
    },
    status: 'registered',
    ticketCode: 'TKT-771204',
    createdAt: '2026-10-03T11:00:00Z',
    eventTitle: 'NEURAL FRONTIERS RESEARCH SYMPOSIUM',
    eventSlug: 'neural-frontiers-symposium-2026',
    organizerName: 'AIONAI',
    organizerColor: '#7B63A8',
    eventStartsAt: '2026-10-18T09:30:00Z',
  },
  {
    id: 'reg-3',
    eventId: 'evt-4',
    userId: 'usr-att',
    userEmail: 'attendee@example.com',
    userName: 'Aditya Narayan',
    answers: {},
    status: 'checked_in',
    ticketCode: 'TKT-993411',
    createdAt: '2026-09-01T10:00:00Z',
    checkedInAt: '2026-09-12T09:45:00Z',
    checkedInBy: 'usr-vol',
    eventTitle: 'ZERO-DAY PROTOCOL CTF 2026',
    eventSlug: 'zero-day-exploit-ctf-2026',
    organizerName: 'CyberGuard',
    organizerColor: '#1F5F5B',
    eventStartsAt: '2026-09-12T10:00:00Z',
  },
]

// Initial Verifiable Certificates
export const SEED_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-1',
    certificateId: 'TA-2026-001245',
    eventId: 'evt-4',
    registrationId: 'reg-3',
    recipientName: 'Aditya Narayan',
    recipientEmail: 'attendee@example.com',
    eventTitle: 'ZERO-DAY PROTOCOL CTF 2026',
    organizerName: 'CyberGuard',
    templateId: 'standard_editorial',
    issuedAt: '2026-09-14T12:00:00Z',
    verifyUrl: 'https://eventmesh.xyz/verify/TA-2026-001245',
    status: 'valid',
    metadata: {
      role: 'Participant & Flag Solver',
      meritLevel: 'Top 10 Percentile Distinction',
    },
  },
  {
    id: 'cert-2',
    certificateId: 'TA-2026-001246',
    eventId: 'evt-4',
    registrationId: 'reg-demo-2',
    recipientName: 'Priya Sundaram',
    recipientEmail: 'priya@example.com',
    eventTitle: 'ZERO-DAY PROTOCOL CTF 2026',
    organizerName: 'CyberGuard',
    templateId: 'merit_distinction',
    issuedAt: '2026-09-14T12:00:00Z',
    verifyUrl: 'https://eventmesh.xyz/verify/TA-2026-001246',
    status: 'valid',
    metadata: {
      role: 'First Place Winner',
      meritLevel: 'Champion of Binary Exploitation',
    },
  },
]

// Initial Announcements
export const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    orgId: 'org-1',
    kind: 'notice',
    title: 'Autumn 2026 Curatorial Event Schedule Published',
    body: 'The Technical Association federation has published the official calendar across all 9 member clubs. 30 symposiums, masterclasses, and hackathons are now open for registration.',
    pinned: true,
    publishedAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'ann-2',
    orgId: 'org-1',
    organizerId: 'club-cp',
    organizerName: 'CP Club',
    organizerColor: '#2F4BD6',
    kind: 'deadline',
    title: 'The Grand Turing Hackathon 2026: Team Applications Closing in 14 Days',
    body: 'Only 34 team slots remain for the 48-hour systems hackathon. High-throughput distributed track entries require repository profiles.',
    pinned: false,
    publishedAt: '2026-10-06T12:30:00Z',
  },
  {
    id: 'ann-3',
    orgId: 'org-1',
    organizerId: 'club-ai',
    organizerName: 'AIONAI',
    organizerColor: '#7B63A8',
    kind: 'result',
    title: 'Neural Frontiers Poster Track Selected Works Announced',
    body: '14 research papers accepted for exhibition during the Neural Frontiers Research Symposium proceedings.',
    pinned: false,
    publishedAt: '2026-10-05T15:00:00Z',
  },
]

// Initial Notifications Log
export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    orgId: 'org-1',
    organizerId: 'club-cp',
    organizerName: 'CP Club',
    eventId: 'evt-1',
    eventTitle: 'THE GRAND TURING HACKATHON 2026',
    title: 'Invitational: Registration Open for Grand Turing 2026',
    body: 'Applications for the 48-hour Systems & Algorithmic Endurance Hackathon are officially open. Review tracks and eligibility.',
    audience: {
      type: 'all',
      description: 'All subscribed association members',
    },
    includes: {
      poster: true,
      registrationLink: true,
      contact: true,
    },
    channel: 'email',
    sentAt: '2026-10-01T10:00:00Z',
    sentBy: 'Sameer Kulkarni (CP Club Admin)',
    stats: {
      recipientsCount: 2450,
      deliveredCount: 2432,
      openedCount: 1680,
    },
  },
]

// Initial Audit Log
export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    actorId: 'usr-cluba',
    actorName: 'Sameer Kulkarni',
    actorRole: 'club_admin',
    action: 'event.publish',
    entity: 'event',
    entityId: 'evt-1',
    diff: { status: 'published' },
    at: '2026-10-01T10:00:00Z',
  },
  {
    id: 'aud-2',
    actorId: 'usr-org',
    actorName: 'Aarav Deshmukh',
    actorRole: 'org_admin',
    action: 'announcement.create',
    entity: 'announcement',
    entityId: 'ann-1',
    diff: { title: 'Autumn 2026 Curatorial Event Schedule Published' },
    at: '2026-10-01T08:00:00Z',
  },
]
