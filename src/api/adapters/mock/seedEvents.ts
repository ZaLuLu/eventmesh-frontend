import { Event, Registration, Certificate, Announcement, Notification, AuditLog } from '../../contracts'

export const SEED_EVENTS: Event[] = [
  {
    "id": "evt-demo-1",
    "slug": "cyberpulse-autonomous-ai-hackathon-2026",
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
    "title": "CYBERPULSE: AUTONOMOUS AI HACKATHON 2026",
    "subtitle": "48-Hour Frontier Machine Intelligence & Neural Systems Sprint",
    "category": "hackathon",
    "type": "hackathon",
    "tags": ["AI Agents", "Transformers", "Neural Systems", "Flagship"],
    "description": "The campus flagship AI hackathon. 48 hours of collaborative engineering where teams train transformer models, build autonomous agent swarms, and develop edge AI pipelines on GPU clusters.",
    "poster": "/images/events/demo-cyberpulse.jpg",
    "banner": "/images/events/demo-cyberpulse.jpg",
    "venue": {
      "name": "Turing Supercomputing Pavilion",
      "address": "Floor 4, Advanced Computation Facility",
      "mapUrl": "https://maps.google.com"
    },
    "startsAt": "2026-10-24T09:00:00Z",
    "endsAt": "2026-10-26T12:00:00Z",
    "eligibility": "Open to all engineering students, graduate researchers, and verified builders. Teams of 2 to 4.",
    "capacity": 300,
    "seatsLeft": 45,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-10-23T23:59:00Z",
    "schedule": [
      { "time": "09:00 AM · DAY 1", "title": "Opening Keynote & GPU Cluster Access Distribution" },
      { "time": "11:00 AM · DAY 1", "title": "Neural Architecture Hacking Commences" },
      { "time": "02:00 AM · DAY 2", "title": "Midnight Latency & Inference Benchmark" },
      { "time": "10:00 AM · DAY 3", "title": "Project Showcase & Jury Deliberation" }
    ],
    "people": [
      { "name": "Dr. Leena Varma", "role": "judge", "bio": "Director of Computational Intelligence" },
      { "name": "Nikhil Menon", "role": "judge", "bio": "Staff Machine Learning Engineer" }
    ],
    "rules": [
      "Open source foundations and pre-trained weights permitted with disclosure.",
      "Live inference demonstration required during final jury evaluation.",
      "Hardware GPU allocations provided courtesy of Central Research Labs."
    ],
    "contact": { "name": "Nikhil Menon", "phone": "+91 98765 00001", "email": "lead@aionai.org" },
    "certificateInfo": "Verifiable Neural Systems Fellowship Certificate and INR 2,00,000 Cash Pool.",
    "features": { "certificate": true, "checkin": true, "paid": false, "team": true },
    "teamConfig": { "minSize": 2, "maxSize": 4 },
    "formSchema": [
      { "id": "f-team", "type": "text", "label": "Team Name", "required": true },
      { "id": "f-github", "type": "text", "label": "GitHub / Hugging Face Profile", "required": true },
      { "id": "f-track", "type": "select", "label": "Track Focus", "options": ["Autonomous Agents", "Transformer Optimization", "Edge Robotics"], "required": true }
    ],
    "status": "published",
    "results": [],
    "photos": [],
    "promotion": { "label": "Featured", "priority": 1, "startsAt": "2026-10-01T00:00:00Z", "endsAt": "2026-11-05T00:00:00Z" },
    "publishedAt": "2026-10-08T09:00:00Z",
    "registrationsCount": 255,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-01T10:00:00Z"
  },
  {
    "id": "evt-demo-2",
    "slug": "aerostrike-autonomous-drone-grand-prix",
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
    "isSignature": true,
    "title": "AEROSTRIKE: AUTONOMOUS DRONE GRAND PRIX",
    "subtitle": "High-Speed Autonomous Obstacle Navigation & Aerial Kinematics",
    "category": "contest",
    "type": "competition",
    "tags": ["Autonomous Drones", "Computer Vision", "Robotics", "Grand Prix"],
    "description": "Watch autonomous quadcopters race through an illuminated multi-tier aerial obstacle course with optical flow tracking, obstacle avoidance, and split-second acrobatic maneuvers.",
    "poster": "/images/events/demo-aerostrike.jpg",
    "banner": "/images/events/demo-aerostrike.jpg",
    "venue": {
      "name": "Indoor Flight Arena & Drone Cage",
      "address": "Robotics & Aeromechanical Hangar, South Campus",
      "mapUrl": "https://maps.google.com"
    },
    "startsAt": "2026-10-29T10:00:00Z",
    "endsAt": "2026-10-29T18:00:00Z",
    "eligibility": "Open to all student collectives, hardware developers, and autonomous aerial teams.",
    "capacity": 200,
    "seatsLeft": 38,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-10-28T18:00:00Z",
    "schedule": [
      { "time": "10:00 AM", "title": "Flight Inspection & Safety Gate Scrutineering" },
      { "time": "12:00 PM", "title": "Time Trials & Sensor Benchmark Qualifying" },
      { "time": "03:30 PM", "title": "Final Championship Head-to-Head Heats" },
      { "time": "05:30 PM", "title": "Grand Podium Ceremony & Trophy Handout" }
    ],
    "people": [
      { "name": "Prof. Maya Nambiar", "role": "judge", "bio": "Embedded Kinematics Chair" },
      { "name": "Karthik Balan", "role": "judge", "bio": "BIRDS President" }
    ],
    "rules": [
      "Quadcopter weight capped at 850 grams including battery payload.",
      "Zero manual pilot intervention during official timed gate runs."
    ],
    "contact": { "name": "Karthik Balan", "phone": "+91 98765 00002", "email": "lead@birds.org" },
    "certificateInfo": "Aeronautical Robotics Verified Distinction & Hardware Sponsorship.",
    "features": { "certificate": true, "checkin": true, "paid": false, "team": true },
    "teamConfig": { "minSize": 1, "maxSize": 3 },
    "formSchema": [
      { "id": "f-pilot", "type": "text", "label": "Flight Controller Spec (e.g. Betaflight, PX4)", "required": true },
      { "id": "f-team", "type": "text", "label": "Squad / Collectives Name", "required": true }
    ],
    "status": "published",
    "results": [],
    "photos": [],
    "promotion": { "label": "Promoted", "priority": 2, "startsAt": "2026-10-01T00:00:00Z", "endsAt": "2026-11-10T00:00:00Z" },
    "publishedAt": "2026-10-09T09:00:00Z",
    "registrationsCount": 162,
    "isFree": false,
    "price": 349,
    "createdAt": "2026-10-02T10:00:00Z"
  },
  {
    "id": "evt-demo-3",
    "slug": "prismatica-spatial-ui-ux-design-jam",
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
    "isSignature": true,
    "title": "PRISMATICA: SPATIAL INTERFACE & UI/UX DESIGN JAM",
    "subtitle": "48-Hour Spatial Computing, Shaders & Micro-Interaction Sprint",
    "category": "workshop",
    "type": "workshop",
    "tags": ["Design Systems", "Spatial UI", "Shaders", "WebGL", "Creative"],
    "description": "An intense, beautiful creative sprint challenging designers and creative technologists to produce tactile, iridescent, and spatial interface prototypes that break conventional flat UI norms.",
    "poster": "/images/events/demo-prismatica.jpg",
    "banner": "/images/events/demo-prismatica.jpg",
    "venue": {
      "name": "Design & Prototyping Atrium",
      "address": "Architecture & Industrial Design Block, Studio 3B",
      "mapUrl": "https://maps.google.com"
    },
    "startsAt": "2026-11-01T09:00:00Z",
    "endsAt": "2026-11-02T18:00:00Z",
    "eligibility": "Open to UI/UX designers, 3D artists, creative frontend engineers, and design cohorts.",
    "capacity": 150,
    "seatsLeft": 22,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-10-31T20:00:00Z",
    "schedule": [
      { "time": "09:00 AM · DAY 1", "title": "Design Brief & Spatial Design Token Library Release" },
      { "time": "02:00 PM · DAY 1", "title": "WebGL Shaders & Tactile Micro-Interactions Masterclass" },
      { "time": "03:00 PM · DAY 2", "title": "Gallery Walk, Peer Critiques & Interactive Demo Stalls" }
    ],
    "people": [
      { "name": "Aryan Kapoor", "role": "judge", "bio": "Creative Technologist & PixelForge Lead" },
      { "name": "Simran Kaur", "role": "judge", "bio": "Design Systems Specialist" }
    ],
    "rules": [
      "Prototypes must run live in browser via WebGL, Three.js, React, or interactive Figma prototypes.",
      "Focus on motion fluidity, haptic resonance, and editorial typography."
    ],
    "contact": { "name": "Aryan Kapoor", "phone": "+91 98765 00003", "email": "lead@pixelforge.org" },
    "certificateInfo": "Excellence in Spatial Interface Craftsmanship Certificate.",
    "features": { "certificate": true, "checkin": true, "paid": true, "team": true },
    "teamConfig": { "minSize": 1, "maxSize": 2 },
    "formSchema": [
      { "id": "f-portfolio", "type": "text", "label": "Portfolio or Dribbble/Figma Link", "required": true },
      { "id": "f-tool", "type": "select", "label": "Primary Toolkit", "options": ["Figma & Protopie", "Three.js / React Three Fiber", "Pure CSS / Canvas"], "required": true }
    ],
    "status": "published",
    "results": [],
    "photos": [],
    "promotion": { "label": "Featured", "priority": 3, "startsAt": "2026-10-01T00:00:00Z", "endsAt": "2026-11-15T00:00:00Z" },
    "publishedAt": "2026-10-10T09:00:00Z",
    "registrationsCount": 128,
    "isFree": false,
    "price": 199,
    "createdAt": "2026-10-03T10:00:00Z"
  },
  {
    "id": "evt-demo-4",
    "slug": "zeroday-protocol-red-team-ctf",
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
    "title": "ZERODAY PROTOCOL: RED TEAM CTF 2026",
    "subtitle": "36-Hour Binary Exploitation, Web Exploits & Cryptanalysis Tournament",
    "category": "contest",
    "type": "competition",
    "tags": ["Cybersecurity", "CTF", "Binary Exploitation", "Cryptography", "Reverse Engineering"],
    "description": "Jeopardy and Attack-Defense style Capture The Flag tournament. Penetrate hardening layers, analyze stripped binaries, break cryptographic signatures, and exploit real-world cloud architectures.",
    "poster": "/images/events/demo-zeroday.jpg",
    "banner": "/images/events/demo-zeroday.jpg",
    "venue": {
      "name": "SecOps Cyber Range & War Room",
      "address": "Floor 2, Information Security Building",
      "mapUrl": "https://maps.google.com"
    },
    "startsAt": "2026-11-06T18:00:00Z",
    "endsAt": "2026-11-08T06:00:00Z",
    "eligibility": "Open to all security researchers, red-team enthusiasts, and students globally.",
    "capacity": 350,
    "seatsLeft": 64,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-05T23:59:00Z",
    "schedule": [
      { "time": "06:00 PM · NOV 06", "title": "Infrastructure VPN Credentials & Target Network Launch" },
      { "time": "12:00 AM · NOV 07", "title": "Release of Insane-Tier Kernel Challenges" },
      { "time": "06:00 AM · NOV 08", "title": "Scoreboard Freeze & Writeup Verification" }
    ],
    "people": [
      { "name": "Divya Krishnan", "role": "judge", "bio": "Offensive Security Lead" },
      { "name": "Pranav Nair", "role": "judge", "bio": "CTF Captain & Binary Exploiter" }
    ],
    "rules": [
      "Attacking competition infrastructure or fellow team infrastructure outside declared IP ranges is strictly prohibited.",
      "Sharing flags or solutions between distinct teams results in immediate disqualification."
    ],
    "contact": { "name": "Divya Krishnan", "phone": "+91 98765 00004", "email": "lead@cyberguard.org" },
    "certificateInfo": "Verifiable Red Team Security Competency Credential.",
    "features": { "certificate": true, "checkin": true, "paid": true, "team": true },
    "teamConfig": { "minSize": 1, "maxSize": 4 },
    "formSchema": [
      { "id": "f-handle", "type": "text", "label": "CTFtime Handle or Alias", "required": true }
    ],
    "status": "published",
    "results": [],
    "photos": [],
    "promotion": { "label": "Promoted", "priority": 4, "startsAt": "2026-10-01T00:00:00Z", "endsAt": "2026-11-20T00:00:00Z" },
    "publishedAt": "2026-10-11T09:00:00Z",
    "registrationsCount": 286,
    "isFree": false,
    "price": 249,
    "createdAt": "2026-10-04T10:00:00Z"
  },
  {
    "id": "evt-demo-5",
    "slug": "neon-odyssey-electric-audiovisual-night",
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
    "isSignature": true,
    "title": "NEON ODYSSEY: ELECTRIC AUDIOVISUAL NIGHT",
    "subtitle": "Live Synthwave, Open-Source Generative Visuals & Campus Cultural Evening",
    "category": "cultural",
    "type": "other",
    "tags": ["Live Music", "Synthwave", "Generative Visuals", "Cultural", "Campus Night"],
    "description": "Celebrate the culmination of Autumn Tech Month with live modular synthesizer performances, code-driven laser projection mapping, and electronic soundscapes performed by student artists.",
    "poster": "/images/events/demo-neonodyssey.jpg",
    "banner": "/images/events/demo-neonodyssey.jpg",
    "venue": {
      "name": "Open Air Amphitheatre",
      "address": "Campus Lakeside Green, Western Promenade",
      "mapUrl": "https://maps.google.com"
    },
    "startsAt": "2026-11-12T18:30:00Z",
    "endsAt": "2026-11-12T23:00:00Z",
    "eligibility": "All students, faculty, and campus guests with valid digital passes.",
    "capacity": 800,
    "seatsLeft": 110,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-12T17:00:00Z",
    "schedule": [
      { "time": "06:30 PM", "title": "Gates Open & Ambient Electronic Prelude" },
      { "time": "07:30 PM", "title": "Generative Live Coding Visuals & Modular Synth Set" },
      { "time": "09:30 PM", "title": "Headlining Campus Electronic Collective" }
    ],
    "people": [
      { "name": "Varun Swaminathan", "role": "speaker", "bio": "FOSS Society Lead" }
    ],
    "rules": [
      "Digital student ID or mobile pass QR required at security access barriers.",
      "Eco-friendly campus protocol: zero single-use plastics permitted in the amphitheatre."
    ],
    "contact": { "name": "Varun Swaminathan", "phone": "+91 98765 00005", "email": "lead@foss.org" },
    "certificateInfo": "Digital Event Attendance Badge.",
    "features": { "certificate": false, "checkin": true, "paid": false, "team": false },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "promotion": { "label": "Featured", "priority": 5, "startsAt": "2026-10-01T00:00:00Z", "endsAt": "2026-11-25T00:00:00Z" },
    "publishedAt": "2026-10-12T09:00:00Z",
    "registrationsCount": 690,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-05T10:00:00Z"
  },
  {
    "id": "evt-demo-6",
    "slug": "voxelforge-48hr-indie-game-sprint",
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
    "isSignature": true,
    "title": "VOXELFORGE: 48-HOUR INDIE GAME SPRINT",
    "subtitle": "Game Mechanics, Procedural Shaders & Interactive 3D Graphics Marathon",
    "category": "hackathon",
    "type": "hackathon",
    "tags": ["Game Development", "Unity", "Godot", "Pixel Art", "Shaders"],
    "description": "Design and ship a complete playable indie game in 48 hours around a surprise theme announced at kickoff. Play arcade builds directly on the auditorium big screen during the closing showcase.",
    "poster": "/images/events/demo-voxelforge.jpg",
    "banner": "/images/events/demo-voxelforge.jpg",
    "venue": {
      "name": "Interactive Media & Game Development Lab",
      "address": "Floor 3, Creative Tech Pavilion",
      "mapUrl": "https://maps.google.com"
    },
    "startsAt": "2026-11-15T09:00:00Z",
    "endsAt": "2026-11-17T14:00:00Z",
    "eligibility": "Open to indie developers, game designers, soundtrack composers, and 3D animators.",
    "capacity": 220,
    "seatsLeft": 31,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-14T23:59:00Z",
    "schedule": [
      { "time": "09:00 AM · DAY 1", "title": "Secret Theme Reveal & Pitching Circles" },
      { "time": "12:00 AM · DAY 2", "title": "Playable Alpha Milestone Playtest" },
      { "time": "11:00 AM · DAY 3", "title": "Itch.io Release & Public Arcade Floor" }
    ],
    "people": [
      { "name": "Siddharth Roy", "role": "judge", "bio": "DevCraft Lead & Graphics Engineer" },
      { "name": "Pooja Hegde", "role": "judge", "bio": "Frontend & Interaction Architect" }
    ],
    "rules": [
      "Any game engine permitted (Godot, Unity, Unreal, Bevy, or WebGL custom engine).",
      "All game assets created during the 48 hours unless third-party assets are declared CC-0."
    ],
    "contact": { "name": "Siddharth Roy", "phone": "+91 98765 00006", "email": "lead@devcraft.org" },
    "certificateInfo": "Indie Game Developer Credential & Publisher Mentorship.",
    "features": { "certificate": true, "checkin": true, "paid": false, "team": true },
    "teamConfig": { "minSize": 1, "maxSize": 4 },
    "formSchema": [
      { "id": "f-engine", "type": "select", "label": "Engine / Framework", "options": ["Godot 4", "Unity", "Unreal Engine", "Custom WebGL / Canvas"], "required": true },
      { "id": "f-team", "type": "text", "label": "Studio / Team Name", "required": true }
    ],
    "status": "published",
    "results": [],
    "photos": [],
    "promotion": { "label": "Promoted", "priority": 6, "startsAt": "2026-10-01T00:00:00Z", "endsAt": "2026-11-30T00:00:00Z" },
    "publishedAt": "2026-10-13T09:00:00Z",
    "registrationsCount": 189,
    "isFree": true,
    "price": 0,
    "createdAt": "2026-10-06T10:00:00Z"
  },
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
    "id": "evt-city-1",
    "slug": "metropolis-indie-tech-summit-2026",
    "orgId": "org-city",
    "organizerId": "org-city-tech",
    "organizerName": "Bangalore Dev Community",
    "organizerColor": "#0052CC",
    "club": {
      "id": "org-city-tech",
      "name": "Bangalore Dev Community",
      "color": "#0052CC",
      "verified": true
    },
    "isSignature": true,
    "title": "METROPOLIS INDIE TECH & AI SUMMIT 2026",
    "subtitle": "City-Wide Engineering Summit on LLM Inference, Web3 Protocols & Rust",
    "category": "conference",
    "type": "other",
    "tags": ["AI Systems", "Rust", "LLM Inference", "City Event", "Summit"],
    "description": "Full-day premier engineering conference bringing together 500+ builders, indie researchers, and tech leads from top startups across the city.",
    "poster": "/images/events/demo-voxelforge.jpg",
    "banner": "/images/events/demo-voxelforge.jpg",
    "venue": {
      "name": "Koramangala Convention Centre",
      "address": "80 Feet Rd, 4th Block, Koramangala, Bengaluru",
      "mapUrl": "https://maps.google.com"
    },
    "startsAt": "2026-11-14T09:00:00Z",
    "endsAt": "2026-11-14T18:30:00Z",
    "eligibility": "Open to all software engineers, developers, and tech founders.",
    "capacity": 500,
    "seatsLeft": 38,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-13T23:59:00Z",
    "schedule": [
      { "time": "09:30 AM", "title": "Opening Keynote: State of Distributed Inference" },
      { "time": "02:00 PM", "title": "Rust in High-Frequency Systems Workshop" },
      { "time": "05:00 PM", "title": "Founder Networking & Panel" }
    ],
    "people": [
      { "name": "Varun Sethi", "role": "speaker", "bio": "Staff Infrastructure Architect" }
    ],
    "rules": ["All attendees must present QR pass at security gate."],
    "contact": { "name": "Varun Sethi", "email": "summit@bangaloredev.org" },
    "certificateInfo": "City Developer Summit Delegate Pass.",
    "features": { "certificate": true, "checkin": true, "paid": true, "team": false },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "promotion": { "label": "Featured", "priority": 1, "startsAt": "2026-10-01T00:00:00Z", "endsAt": "2026-11-20T00:00:00Z" },
    "publishedAt": "2026-10-12T09:00:00Z",
    "registrationsCount": 462,
    "isFree": false,
    "price": 499,
    "createdAt": "2026-10-05T10:00:00Z"
  },
  {
    "id": "evt-city-2",
    "slug": "sonic-horizons-indie-music-fest",
    "orgId": "org-city",
    "organizerId": "org-city-music",
    "organizerName": "Frontier Sound Collective",
    "organizerColor": "#8A2BE2",
    "club": {
      "id": "org-city-music",
      "name": "Frontier Sound Collective",
      "color": "#8A2BE2",
      "verified": true
    },
    "isSignature": true,
    "title": "SONIC HORIZONS: CITY INDIE MUSIC FEST",
    "subtitle": "Live Electronic, Synthwave & Ambient Visual Showcases",
    "category": "cultural",
    "type": "other",
    "tags": ["Live Music", "Synthwave", "Visuals", "City Festival"],
    "description": "An open-air evening celebrating indie electronic producers, synth-pop acts, and responsive generative visual artists.",
    "poster": "/images/events/demo-prismatica.jpg",
    "banner": "/images/events/demo-prismatica.jpg",
    "venue": {
      "name": "Indiranagar Open Amphitheatre",
      "address": "100 Feet Rd, Indiranagar, Bengaluru",
      "mapUrl": "https://maps.google.com"
    },
    "startsAt": "2026-11-21T17:30:00Z",
    "endsAt": "2026-11-21T23:00:00Z",
    "eligibility": "Open to all music enthusiasts and the general public.",
    "capacity": 400,
    "seatsLeft": 18,
    "waitlistEnabled": true,
    "registrationOpensAt": "2026-10-01T00:00:00Z",
    "registrationClosesAt": "2026-11-21T12:00:00Z",
    "schedule": [
      { "time": "05:30 PM", "title": "Gates Open & Ambient Audio Sets" },
      { "time": "08:00 PM", "title": "Headline Live Synthwave Performance" }
    ],
    "people": [
      { "name": "Maya Rao", "role": "guest", "bio": "Electronic Producer & Composer" }
    ],
    "rules": ["E-Ticket QR required for entry."],
    "contact": { "name": "Maya Rao", "email": "contact@frontiersound.io" },
    "certificateInfo": "VIP Concert Pass Credential.",
    "features": { "certificate": false, "checkin": true, "paid": true, "team": false },
    "formSchema": [],
    "status": "published",
    "results": [],
    "photos": [],
    "promotion": { "label": "Featured", "priority": 2, "startsAt": "2026-10-01T00:00:00Z", "endsAt": "2026-11-25T00:00:00Z" },
    "publishedAt": "2026-10-12T11:00:00Z",
    "registrationsCount": 382,
    "isFree": false,
    "price": 699,
    "createdAt": "2026-10-05T12:00:00Z"
  }
]

export const SEED_REGISTRATIONS: Registration[] = [
  {
    "id": "reg-1",
    "eventId": "evt-1",
    "userId": "usr-att",
    "userEmail": "attendee@example.com",
    "userName": "Aditya Narayan",
    "answers": {
      "f-github": "https://github.com/aditya-narayan",
      "f-track": "Distributed Protocols",
      "f-exp": "3 years building in Go and Rust; active open source contributor."
    },
    "team": {
      "teamName": "ConsensusCore",
      "leaderName": "Aditya Narayan",
      "leaderEmail": "attendee@example.com",
      "members": [
        {
          "name": "Aditya Narayan",
          "email": "attendee@example.com",
          "role": "Protocol Lead"
        },
        {
          "name": "Kavya Raman",
          "email": "kavya@example.com",
          "role": "Systems Engineer"
        }
      ]
    },
    "status": "registered",
    "ticketCode": "TKT-884192",
    "createdAt": "2026-10-02T14:30:00Z",
    "eventTitle": "THE GRAND TURING HACKATHON 2026",
    "eventSlug": "grand-turing-hackathon-2026",
    "organizerName": "CP Club",
    "organizerColor": "#0047FF",
    "eventStartsAt": "2026-10-24T09:00:00Z",
    "tierName": "General Hacker Pass"
  },
  {
    "id": "reg-2",
    "eventId": "evt-2",
    "userId": "usr-att",
    "userEmail": "attendee@example.com",
    "userName": "Aditya Narayan",
    "answers": {
      "f-inst": "Department of Computing",
      "f-interest": "Mechanistic Interpretability"
    },
    "status": "registered",
    "ticketCode": "TKT-771204",
    "createdAt": "2026-10-03T11:00:00Z",
    "eventTitle": "NEURAL FRONTIERS RESEARCH SYMPOSIUM",
    "eventSlug": "neural-frontiers-symposium-2026",
    "organizerName": "AIONAI",
    "organizerColor": "#C8BEFA",
    "eventStartsAt": "2026-10-18T09:30:00Z",
    "tierName": "Researcher Pass"
  },
  {
    "id": "reg-3",
    "eventId": "evt-4",
    "userId": "usr-att",
    "userEmail": "attendee@example.com",
    "userName": "Aditya Narayan",
    "answers": {},
    "status": "checked_in",
    "ticketCode": "TKT-993411",
    "createdAt": "2026-09-01T10:00:00Z",
    "checkedInAt": "2026-09-12T09:45:00Z",
    "checkedInBy": "usr-vol",
    "eventTitle": "ZERO-DAY PROTOCOL CTF 2026",
    "eventSlug": "zero-day-exploit-ctf-2026",
    "organizerName": "CyberGuard",
    "organizerColor": "#151130",
    "eventStartsAt": "2026-09-12T10:00:00Z",
    "tierName": "Security Operator Pass"
  },
  {
    "id": "reg-4",
    "eventId": "evt-1",
    "userId": "usr-4",
    "userEmail": "ananya.deshmukh@campus.edu.in",
    "userName": "Ananya Deshmukh",
    "answers": {
      "f-track": "AI & Autonomous Systems"
    },
    "team": {
      "teamName": "NeuralFoundry",
      "leaderName": "Ananya Deshmukh",
      "leaderEmail": "ananya.deshmukh@campus.edu.in",
      "members": [
        {
          "name": "Ananya Deshmukh",
          "email": "ananya.deshmukh@campus.edu.in",
          "role": "ML Lead"
        },
        {
          "name": "Devansh Mehta",
          "email": "devansh.mehta@campus.edu.in",
          "role": "Data Engineer"
        }
      ]
    },
    "status": "checked_in",
    "ticketCode": "TKT-104921",
    "createdAt": "2026-10-04T08:15:00Z",
    "checkedInAt": "2026-10-24T08:50:00Z",
    "checkedInBy": "usr-vol",
    "eventTitle": "THE GRAND TURING HACKATHON 2026",
    "eventSlug": "grand-turing-hackathon-2026",
    "organizerName": "CP Club",
    "organizerColor": "#0047FF",
    "eventStartsAt": "2026-10-24T09:00:00Z",
    "tierName": "Team Hacker Pass"
  },
  {
    "id": "reg-5",
    "eventId": "evt-1",
    "userId": "usr-5",
    "userEmail": "rohan.sharma@campus.edu.in",
    "userName": "Rohan Sharma",
    "answers": {
      "f-track": "High Performance Compute"
    },
    "status": "checked_in",
    "ticketCode": "TKT-203819",
    "createdAt": "2026-10-04T09:20:00Z",
    "checkedInAt": "2026-10-24T09:10:00Z",
    "checkedInBy": "usr-vol",
    "eventTitle": "THE GRAND TURING HACKATHON 2026",
    "eventSlug": "grand-turing-hackathon-2026",
    "organizerName": "CP Club",
    "organizerColor": "#0047FF",
    "eventStartsAt": "2026-10-24T09:00:00Z",
    "tierName": "General Hacker Pass"
  },
  {
    "id": "reg-6",
    "eventId": "evt-1",
    "userId": "usr-6",
    "userEmail": "siddharth.varma@campus.edu.in",
    "userName": "Siddharth Varma",
    "answers": {
      "f-track": "Web3 & Cryptography"
    },
    "status": "registered",
    "ticketCode": "TKT-319402",
    "createdAt": "2026-10-05T14:10:00Z",
    "eventTitle": "THE GRAND TURING HACKATHON 2026",
    "eventSlug": "grand-turing-hackathon-2026",
    "organizerName": "CP Club",
    "organizerColor": "#0047FF",
    "eventStartsAt": "2026-10-24T09:00:00Z",
    "tierName": "VIP Founder Pass"
  },
  {
    "id": "reg-7",
    "eventId": "evt-1",
    "userId": "usr-7",
    "userEmail": "priya.sundaram@campus.edu.in",
    "userName": "Priya Sundaram",
    "answers": {
      "f-track": "Mobile Platforms"
    },
    "status": "registered",
    "ticketCode": "TKT-492103",
    "createdAt": "2026-10-06T10:00:00Z",
    "eventTitle": "THE GRAND TURING HACKATHON 2026",
    "eventSlug": "grand-turing-hackathon-2026",
    "organizerName": "CP Club",
    "organizerColor": "#0047FF",
    "eventStartsAt": "2026-10-24T09:00:00Z",
    "tierName": "General Hacker Pass"
  },
  {
    "id": "reg-8",
    "eventId": "evt-1",
    "userId": "usr-8",
    "userEmail": "sneha.kulkarni@campus.edu.in",
    "userName": "Sneha Kulkarni",
    "answers": {},
    "status": "waitlisted",
    "ticketCode": "TKT-WL-001",
    "waitlistPosition": 1,
    "createdAt": "2026-10-07T16:30:00Z",
    "eventTitle": "THE GRAND TURING HACKATHON 2026",
    "eventSlug": "grand-turing-hackathon-2026",
    "organizerName": "CP Club",
    "organizerColor": "#0047FF",
    "eventStartsAt": "2026-10-24T09:00:00Z",
    "tierName": "General Hacker Pass"
  },
  {
    "id": "reg-9",
    "eventId": "evt-1",
    "userId": "usr-9",
    "userEmail": "vikram.malhotra@campus.edu.in",
    "userName": "Vikram Malhotra",
    "answers": {},
    "status": "waitlisted",
    "ticketCode": "TKT-WL-002",
    "waitlistPosition": 2,
    "createdAt": "2026-10-08T11:20:00Z",
    "eventTitle": "THE GRAND TURING HACKATHON 2026",
    "eventSlug": "grand-turing-hackathon-2026",
    "organizerName": "CP Club",
    "organizerColor": "#0047FF",
    "eventStartsAt": "2026-10-24T09:00:00Z",
    "tierName": "General Hacker Pass"
  },
  {
    "id": "reg-10",
    "eventId": "evt-1",
    "userId": "usr-10",
    "userEmail": "meera.nair@campus.edu.in",
    "userName": "Meera Nair",
    "answers": {},
    "status": "cancelled",
    "ticketCode": "TKT-582910",
    "createdAt": "2026-10-03T18:00:00Z",
    "eventTitle": "THE GRAND TURING HACKATHON 2026",
    "eventSlug": "grand-turing-hackathon-2026",
    "organizerName": "CP Club",
    "organizerColor": "#0047FF",
    "eventStartsAt": "2026-10-24T09:00:00Z",
    "tierName": "General Hacker Pass"
  },
  {
    "id": "reg-11",
    "eventId": "evt-2",
    "userId": "usr-11",
    "userEmail": "tanvi.joshi@campus.edu.in",
    "userName": "Tanvi Joshi",
    "answers": {
      "f-interest": "LLM Alignment & Safety"
    },
    "status": "registered",
    "ticketCode": "TKT-671829",
    "createdAt": "2026-10-06T12:00:00Z",
    "eventTitle": "NEURAL FRONTIERS RESEARCH SYMPOSIUM",
    "eventSlug": "neural-frontiers-symposium-2026",
    "organizerName": "AIONAI",
    "organizerColor": "#C8BEFA",
    "eventStartsAt": "2026-10-18T09:30:00Z",
    "tierName": "Researcher Pass"
  },
  {
    "id": "reg-12",
    "eventId": "evt-2",
    "userId": "usr-12",
    "userEmail": "rahul.bose@campus.edu.in",
    "userName": "Rahul Bose",
    "answers": {
      "f-interest": "Multimodal Reasoning"
    },
    "status": "checked_in",
    "ticketCode": "TKT-782910",
    "createdAt": "2026-10-07T09:40:00Z",
    "checkedInAt": "2026-10-18T09:15:00Z",
    "checkedInBy": "usr-vol",
    "eventTitle": "NEURAL FRONTIERS RESEARCH SYMPOSIUM",
    "eventSlug": "neural-frontiers-symposium-2026",
    "organizerName": "AIONAI",
    "organizerColor": "#C8BEFA",
    "eventStartsAt": "2026-10-18T09:30:00Z",
    "tierName": "Researcher Pass"
  },
  {
    "id": "reg-13",
    "eventId": "evt-3",
    "userId": "usr-13",
    "userEmail": "kabir.singhania@campus.edu.in",
    "userName": "Kabir Singhania",
    "answers": {
      "f-experience": "PX4 Flight Stack tuning"
    },
    "status": "registered",
    "ticketCode": "TKT-891024",
    "createdAt": "2026-10-08T15:10:00Z",
    "eventTitle": "AUTONOMOUS DRONE DERBY",
    "eventSlug": "autonomous-drone-derby-2026",
    "organizerName": "BIRDS",
    "organizerColor": "#7FD8B8",
    "eventStartsAt": "2026-10-28T14:00:00Z",
    "tierName": "Pilot Operator Pass"
  },
  {
    "id": "reg-14",
    "eventId": "evt-3",
    "userId": "usr-14",
    "userEmail": "aarohi.patel@campus.edu.in",
    "userName": "Aarohi Patel",
    "answers": {
      "f-experience": "Computer vision on quadcopters"
    },
    "status": "registered",
    "ticketCode": "TKT-902183",
    "createdAt": "2026-10-09T11:00:00Z",
    "eventTitle": "AUTONOMOUS DRONE DERBY",
    "eventSlug": "autonomous-drone-derby-2026",
    "organizerName": "BIRDS",
    "organizerColor": "#7FD8B8",
    "eventStartsAt": "2026-10-28T14:00:00Z",
    "tierName": "Spectator Pass"
  },
  {
    "id": "reg-15",
    "eventId": "evt-4",
    "userId": "usr-15",
    "userEmail": "ishaan.sengupta@campus.edu.in",
    "userName": "Ishaan Sengupta",
    "answers": {},
    "status": "checked_in",
    "ticketCode": "TKT-112233",
    "createdAt": "2026-09-02T14:00:00Z",
    "checkedInAt": "2026-09-12T09:50:00Z",
    "checkedInBy": "usr-vol",
    "eventTitle": "ZERO-DAY PROTOCOL CTF 2026",
    "eventSlug": "zero-day-exploit-ctf-2026",
    "organizerName": "CyberGuard",
    "organizerColor": "#151130",
    "eventStartsAt": "2026-09-12T10:00:00Z",
    "tierName": "Security Operator Pass"
  },
  {
    "id": "reg-16",
    "eventId": "evt-5",
    "userId": "usr-16",
    "userEmail": "tarun.khanna@campus.edu.in",
    "userName": "Tarun Khanna",
    "answers": {
      "f-track": "Embedded Firmware"
    },
    "status": "registered",
    "ticketCode": "TKT-223344",
    "createdAt": "2026-10-10T09:00:00Z",
    "eventTitle": "MICRO-ROBOTICS SUMMIT 2026",
    "eventSlug": "micro-robotics-summit-2026",
    "organizerName": "Robocrafters",
    "organizerColor": "#F2B84B",
    "eventStartsAt": "2026-10-22T10:00:00Z",
    "tierName": "Standard Pass"
  },
  {
    "id": "reg-17",
    "eventId": "evt-5",
    "userId": "usr-17",
    "userEmail": "diya.menon@campus.edu.in",
    "userName": "Diya Menon",
    "answers": {
      "f-track": "Sensor Fusion"
    },
    "status": "registered",
    "ticketCode": "TKT-334455",
    "createdAt": "2026-10-10T14:20:00Z",
    "eventTitle": "MICRO-ROBOTICS SUMMIT 2026",
    "eventSlug": "micro-robotics-summit-2026",
    "organizerName": "Robocrafters",
    "organizerColor": "#F2B84B",
    "eventStartsAt": "2026-10-22T10:00:00Z",
    "tierName": "Standard Pass"
  },
  {
    "id": "reg-18",
    "eventId": "evt-1",
    "userId": "usr-18",
    "userEmail": "kartik.sharma@campus.edu.in",
    "userName": "Kartik Sharma",
    "answers": {
      "f-track": "Database Kernels"
    },
    "status": "registered",
    "ticketCode": "TKT-445566",
    "createdAt": "2026-10-06T18:00:00Z",
    "eventTitle": "THE GRAND TURING HACKATHON 2026",
    "eventSlug": "grand-turing-hackathon-2026",
    "organizerName": "CP Club",
    "organizerColor": "#0047FF",
    "eventStartsAt": "2026-10-24T09:00:00Z",
    "tierName": "General Hacker Pass"
  },
  {
    "id": "reg-19",
    "eventId": "evt-1",
    "userId": "usr-19",
    "userEmail": "zoya.ahmed@campus.edu.in",
    "userName": "Zoya Ahmed",
    "answers": {
      "f-track": "Human-AI Interfaces"
    },
    "status": "registered",
    "ticketCode": "TKT-556677",
    "createdAt": "2026-10-07T12:00:00Z",
    "eventTitle": "THE GRAND TURING HACKATHON 2026",
    "eventSlug": "grand-turing-hackathon-2026",
    "organizerName": "CP Club",
    "organizerColor": "#0047FF",
    "eventStartsAt": "2026-10-24T09:00:00Z",
    "tierName": "General Hacker Pass"
  },
  {
    "id": "reg-20",
    "eventId": "evt-1",
    "userId": "usr-20",
    "userEmail": "arjun.kapoor@campus.edu.in",
    "userName": "Arjun Kapoor",
    "answers": {},
    "status": "cancelled",
    "ticketCode": "TKT-667788",
    "createdAt": "2026-10-05T09:00:00Z",
    "eventTitle": "THE GRAND TURING HACKATHON 2026",
    "eventSlug": "grand-turing-hackathon-2026",
    "organizerName": "CP Club",
    "organizerColor": "#0047FF",
    "eventStartsAt": "2026-10-24T09:00:00Z",
    "tierName": "General Hacker Pass"
  },
  {
    "id": "reg-21",
    "eventId": "evt-1",
    "userId": "usr-21",
    "userEmail": "neha.reddy@campus.edu.in",
    "userName": "Neha Reddy",
    "answers": {},
    "status": "waitlisted",
    "ticketCode": "TKT-WL-003",
    "waitlistPosition": 3,
    "createdAt": "2026-10-09T18:00:00Z",
    "eventTitle": "THE GRAND TURING HACKATHON 2026",
    "eventSlug": "grand-turing-hackathon-2026",
    "organizerName": "CP Club",
    "organizerColor": "#0047FF",
    "eventStartsAt": "2026-10-24T09:00:00Z",
    "tierName": "General Hacker Pass"
  },
  {
    "id": "reg-22",
    "eventId": "evt-1",
    "userId": "usr-22",
    "userEmail": "varun.chawla@campus.edu.in",
    "userName": "Varun Chawla",
    "answers": {},
    "status": "waitlisted",
    "ticketCode": "TKT-WL-004",
    "waitlistPosition": 4,
    "createdAt": "2026-10-10T10:00:00Z",
    "eventTitle": "THE GRAND TURING HACKATHON 2026",
    "eventSlug": "grand-turing-hackathon-2026",
    "organizerName": "CP Club",
    "organizerColor": "#0047FF",
    "eventStartsAt": "2026-10-24T09:00:00Z",
    "tierName": "General Hacker Pass"
  },
  {
    "id": "reg-25",
    "eventId": "evt-1",
    "userId": "usr-25",
    "userEmail": "manish.joshi@campus.edu.in",
    "userName": "Manish Joshi",
    "answers": {
      "f-track": "Applied Cryptography"
    },
    "status": "checked_in",
    "ticketCode": "TKT-990011",
    "createdAt": "2026-10-04T11:00:00Z",
    "checkedInAt": "2026-10-24T08:55:00Z",
    "checkedInBy": "usr-vol",
    "eventTitle": "THE GRAND TURING HACKATHON 2026",
    "eventSlug": "grand-turing-hackathon-2026",
    "organizerName": "CP Club",
    "organizerColor": "#0047FF",
    "eventStartsAt": "2026-10-24T09:00:00Z",
    "tierName": "General Hacker Pass"
  }
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
