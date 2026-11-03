export interface DetailPageSection {
  id?: string;
  heading: string;
  body: string;
  active?: boolean;
  image?: string;
  badge?: string;
  linkText?: string;
  linkUrl?: string;
}

export interface DetailPageStat {
  id?: string;
  label: string;
  value: string;
  desc?: string;
}

export interface DetailPageFaq {
  id?: string;
  question: string;
  answer: string;
}

export interface DetailPageItem {
  slug: string;
  title: string;
  subtitle: string;
  iconName?: string;
  image: string;
  badge?: string;
  sections: DetailPageSection[];
  stats?: DetailPageStat[];
  faqs?: DetailPageFaq[];
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export const defaultDetailPages: Record<string, DetailPageItem> = {
  overview: {
    slug: 'overview',
    title: 'ASTU-AMS Overview',
    subtitle: 'An integrated Alumni Management System connecting graduates, employers, and departments. Developed in-house by ASTU to enable longitudinal employment tracking and accreditation compliance.',
    iconName: 'Trophy',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'OV-1', heading: 'What is ASTU-AMS?', body: 'ASTU-AMS is a comprehensive alumni management platform designed to bridge the gap between Adama Science and Technology University graduates, employers, and academic departments. With nearly three decades since ASTU\'s establishment, the platform connects registered alumni across fields of study succeeding in business ventures, national and international companies, research institutes, and leadership positions.', active: true },
      { id: 'OV-2', heading: 'Background & Rationale', body: 'ASTU previously lacked a centralized, automated system to track graduate career trajectories. Graduate data was fragmented across departments and the Registrar\'s office. Without a unified digital ecosystem, the university remained unable to perform meaningful longitudinal analysis or maintain continuous relationships with its alumni network. The ASTU-AMS solves this by providing a centralized alumni database integrated with the Registrar and ERP systems.', active: true },
      { id: 'OV-3', heading: 'Core Mission', body: 'To foster professional growth, streamline talent acquisition, and drive academic innovation through data-driven insights and seamless connectivity between all stakeholders. The system provides verified tracer study data required by the Education and Training Authority (ETA) and international accreditation bodies.', active: true },
      { id: 'OV-4', heading: 'Key Modules', body: 'Alumni Registration & Verification, Profile Management, Automated Tracer Engine & Survey Logic, Event Calendar & RSVP, Mentorship & Job Board, Employer Portal & Analytics Dashboards, Messaging & Notifications, and Document Request Services.', active: true },
      { id: 'OV-5', heading: 'Technical Architecture', body: 'Built with React.js frontend and Node.js/PostgreSQL backend with RESTful APIs. Integrated with Google Sheets API, Telebirr, and institutional Email/SMS APIs. Analytics dashboards power accreditation readiness. Hosted on secure university servers with role-based access and data security protocols.', active: true },
      { id: 'OV-6', heading: 'Our Legacy', body: 'ASTU alumni are the university\'s lasting legacy and strongest voice. The Alumni Association works to build an engaged membership base, giving alumni ways to reconnect, give back to ASTU, and serve as a springboard for further involvement.', active: true },
    ],
  },
  'impact-numbers': {
    slug: 'impact-numbers',
    title: 'Impact Numbers',
    subtitle: 'Key statistics demonstrating ASTU-AMS reach, graduate employment success, and institutional effectiveness.',
    iconName: 'LineChart',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'IN-1', heading: 'Registered Alumni Members', body: 'Registered alumni actively connected through the platform, spanning diverse industries and leadership positions worldwide. Live count updates from the alumni database.', active: true },
      { id: 'IN-2', heading: 'Fields of Study', body: 'Comprehensive coverage across Applied Engineering, Natural Sciences, Technology, Business, and Specialized Research programs.', active: true },
      { id: 'IN-3', heading: 'Partner Organizations', body: 'Employers and institutions partnering with ASTU for talent acquisition, internships, and applied industry-research collaboration.', active: true },
      { id: 'IN-4', heading: 'Global Alumni Network', body: 'A thriving network of ASTU graduates spread across government agencies, multinational enterprises, and startups worldwide.', active: true },
      { id: 'IN-5', heading: 'Graduate Employment Rate', body: 'Graduate employment rate tracked through comprehensive tracer studies and employer feedback at 6, 12, and 24-month intervals.', active: true },
      { id: 'IN-6', heading: 'Digital Service Requests', body: 'Transcript, degree certificate, and credential validation requests processed digitally through the registrar portal.', active: true },
    ],
  },
  accreditation: {
    slug: 'accreditation',
    title: 'Accreditation & Quality Assurance',
    subtitle: 'Data-driven quality assurance framework ensuring academic excellence and global industry alignment.',
    iconName: 'ShieldCheck',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'AC-1', heading: 'Data-Driven Accreditation', body: 'ASTU-AMS provides verified tracer data, employment analytics, and employer feedback essential for ETA accreditation and university leadership audits.', active: true },
      { id: 'AC-2', heading: 'Global Standards', body: 'Build transparent, audited institutional reports that meet international engineering accreditation criteria (ABET/ETA standards).', active: true },
      { id: 'AC-3', heading: 'Curriculum Alignment', body: 'Employer competency feedback and graduate outcome metrics feed directly into biennial curriculum modernization across all engineering schools.', active: true },
      { id: 'AC-4', heading: 'Longitudinal Tracer Surveys', body: 'Automated survey distribution at 6-month, 1-year, and 3-year milestones gives departments empirical insight into career progression.', active: true },
    ],
  },
  achievements: {
    slug: 'achievements',
    title: 'University Achievements',
    subtitle: 'Awards, recognitions, innovations, and institutional milestones of Adama Science and Technology University.',
    iconName: 'Award',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c7f1?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'AV-1', heading: 'Research Excellence', body: '1,240+ research publications and 38 startup showcases demonstrating ASTU\'s commitment to innovation and applied science.', active: true },
      { id: 'AV-2', heading: 'Industry Partnerships', body: '72 active industry projects and 80+ enterprise partners collaborating on research, student internships, and practical labs.', active: true },
      { id: 'AV-3', heading: 'National Recognition', body: 'ASTU consistently ranks among Ethiopia\'s premier science and technology institutions, with multiple national innovation trophies.', active: true },
      { id: 'AV-4', heading: 'High-Fidelity Tracking', body: 'Over 90% accuracy rate in tracking graduate geographic distribution, time-to-hire metrics, and industry salary benchmarks.', active: true },
    ],
  },
  'campus-life': {
    slug: 'campus-life',
    title: 'Campus Life at ASTU',
    subtitle: 'Experience a vibrant university community with modern engineering labs, research centers, student innovation, and recreation.',
    iconName: 'Star',
    image: '/images/campus-2.jpeg',
    badge: 'ASTU Student Life & Campus Culture',
    primaryCtaText: 'Explore Media Gallery',
    primaryCtaLink: '/gallery',
    secondaryCtaText: 'Campus Events & Activities',
    secondaryCtaLink: '/events',
    sections: [
      {
        id: 'CL-1',
        heading: 'Modern Laboratories & Research Arc',
        body: 'ASTU features 12+ specialized research centers and modern engineering laboratories, providing hands-on training from robotics and embedded systems to software engineering and biotechnology.',
        image: '/images/electriclabs.jpeg',
        badge: 'Applied Labs',
        linkText: 'Explore Research Arc',
        linkUrl: '/info/facilities',
        active: true,
      },
      {
        id: 'CL-2',
        heading: 'Student Clubs & Innovation Teams',
        body: 'Join vibrant student chapters including IEEE, Google Developer Student Club (GDSC), robotics teams, and coding hackathons that foster leadership and real-world problem solving.',
        image: '/images/campus-2.jpeg',
        badge: 'Innovation Teams',
        linkText: 'View Activities & Events',
        linkUrl: '/events',
        active: true,
      },
      {
        id: 'CL-3',
        heading: 'Sports & Recreational Facilities',
        body: 'Comprehensive athletics facilities including Olympic-standard tracks, basketball and volleyball courts, football grounds, and student lounges to balance rigorous academics with healthy campus life.',
        image: '/images/astu-building.jpg',
        badge: 'Sports & Athletics',
        linkText: 'Recreation Facilities',
        linkUrl: '/info/facilities',
        active: true,
      },
      {
        id: 'CL-4',
        heading: 'Housing, Digital Libraries & Dining',
        body: 'Fully managed student dormitories, high-speed digital library access with 24/7 research repositories, campus dining halls, and health centers serving the ASTU university community.',
        image: '/images/arc.jpg',
        badge: 'Student Services',
        linkText: 'Campus Services Guide',
        linkUrl: '/about',
        active: true,
      },
      {
        id: 'CL-5',
        heading: 'Alumni & Industry Connections',
        body: 'Annual alumni reunions, engineering symposiums, industry visits, and mentorship sessions bridging campus learning directly to international careers.',
        image: '/images/gc7.jpg',
        badge: 'Career Bridges',
        linkText: 'Connect with Alumni',
        linkUrl: '/community',
        active: true,
      },
    ],
  },
  facilities: {
    slug: 'facilities',
    title: 'University Facilities & Infrastructure',
    subtitle: 'State-of-the-art engineering laboratories, research arcs, libraries, student services, and employer interview suites.',
    iconName: 'Building2',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'FC-1', heading: 'Modern Laboratories & Research Arc', body: 'Over 12 specialized research centers and engineering laboratories equipped for robotics, embedded systems, biotechnology, materials science, and civil infrastructure testing.', active: true },
      { id: 'FC-2', heading: 'Innovation Hubs & Incubation Spaces', body: 'High-tech maker spaces, computing clusters, and student startup incubation suites designed for interdisciplinary innovation, hackathons, and software engineering.', active: true },
      { id: 'FC-3', heading: 'Digital Libraries & Knowledge Repositories', body: '24/7 access to international academic journals, digital archives, quiet study spaces, and high-speed campus fiber networking.', active: true },
      { id: 'FC-4', heading: 'Employer Interview Suites & Conference Rooms', body: 'Dedicated professional meeting spaces and seminar halls tailored for corporate recruitment, employer interviews, tracer focus groups, and executive presentations.', active: true },
      { id: 'FC-5', heading: 'Sports, Athletics & Recreation Complexes', body: 'Olympic-standard sports facilities including running tracks, indoor gyms, basketball and tennis courts, and university recreation centers.', active: true },
      { id: 'FC-6', heading: 'Student Housing, Health Center & Services', body: 'Comprehensive residential dormitories, campus dining halls, university healthcare center, and student welfare offices serving the ASTU community.', active: true },
    ],
  },
  events: {
    slug: 'events',
    title: 'Events & Activities',
    subtitle: 'Stay informed about upcoming ASTU events, alumni reunions, career fairs, hackathons, and campus activities.',
    iconName: 'CalendarDays',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'EV-1', heading: 'ASTU Alumni Carnival 2026', body: 'April 25–26, 2026 — Main Campus. A homecoming event uniting graduates, academic staff, current students, and stakeholders to celebrate ASTU\'s legacy and achievements.', active: true },
      { id: 'EV-2', heading: 'Career Fairs & Recruitment Days', body: 'Bi-annual career fairs bringing 50+ employer partners on campus for direct recruitment, internship placements, and graduate trainee programs.', active: true },
      { id: 'EV-3', heading: 'DAAD Alumni Workshop', body: 'March 2026 — ASTU Research Center. A five-day workshop hosted in collaboration with the German Academic Exchange Service (DAAD) for research and academic networking.', active: true },
      { id: 'EV-4', heading: 'Student Hackathons & Innovation Challenges', body: 'Competitive coding challenges, hardware hackathons, and design sprints where student teams solve real-world engineering problems in 24–48 hours.', active: true },
      { id: 'EV-5', heading: 'Cultural & Sports Events', body: 'Inter-university sports competitions, cultural festivals, ASTU talent shows, and graduation ceremonies celebrating academic milestones.', active: true },
    ],
  },
  gallery: {
    slug: 'gallery',
    title: 'ASTU Museums & Photo Gallery',
    subtitle: 'A visual journey through ASTU\'s campus life, research achievements, events, and vibrant student community.',
    iconName: 'GalleryHorizontal',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'GL-1', heading: 'Campus Architecture & Landmarks', body: 'Stunning aerial and ground-level photography showcasing ASTU\'s modern campus infrastructure, iconic buildings, green spaces, and research arcs.', active: true },
      { id: 'GL-2', heading: 'Graduation & Award Ceremonies', body: 'Memorable moments from ASTU graduation events, award presentations, and recognition ceremonies celebrating student and faculty achievements.', active: true },
      { id: 'GL-3', heading: 'Research & Laboratory Snapshots', body: 'Behind-the-scenes photography from ASTU\'s world-class research labs, engineering workshops, and innovation centers in action.', active: true },
      { id: 'GL-4', heading: 'Campus Life & Student Activities', body: 'Candid photos of student clubs, sports events, cultural festivals, volunteering, and the everyday vibrancy of ASTU campus life.', active: true },
    ],
  },
  'video-gallery': {
    slug: 'video-gallery',
    title: 'Video Gallery',
    subtitle: 'Video highlights · Research presentations, event recordings, innovation demos, and university video archives.',
    iconName: 'PlayCircle',
    image: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'VG-1', heading: 'Research Showcases', body: 'Watch applied engineering research presentations, robotics demonstrations, and faculty interviews.', active: true },
      { id: 'VG-2', heading: 'Event Recordings', body: 'Access recordings of career expos, alumni carnivals, graduation ceremonies, and guest lectures.', active: true },
      { id: 'VG-3', heading: 'Campus Virtual Tours', body: 'Virtual tours of ASTU campuses, engineering workshops, laboratories, and student incubation centers.', active: true },
    ],
  },
  mentorship: {
    slug: 'mentorship',
    title: 'Mentorship Program',
    subtitle: 'Connect with experienced alumni mentors across industry leaders to guide your career journey.',
    iconName: 'GraduationCap',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'MT-1', heading: 'Find a Mentor', body: 'Browse available mentors by industry, department, graduation year, or technical skill. Send direct connection requests.', active: true },
      { id: 'MT-2', heading: 'Become a Mentor', body: 'Experienced alumni can sign up to guide current students and recent graduates, sharing insights into industry workplace dynamics.', active: true },
      { id: 'MT-3', heading: 'Mentorship Benefits', body: 'Mentees gain personalized career advice, resume reviews, technical interview prep, and professional referrals.', active: true },
    ],
  },
  'career-fair': {
    slug: 'career-fair',
    title: 'Career Fair & Placement',
    subtitle: 'Job opportunities, employer networking, and direct recruitment events for ASTU alumni and students.',
    iconName: 'Briefcase',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'CF-1', heading: 'Annual Career Expo', body: 'Meet 50+ enterprise employers, participate in on-the-spot interviews, and discover graduate trainee tracks.', active: true },
      { id: 'CF-2', heading: 'On-Campus Recruitment', body: 'Top employers conduct screening tests and information sessions throughout the academic calendar.', active: true },
      { id: 'CF-3', heading: 'Smart Job Matching', body: 'The AMS platform automatically matches candidate profiles and skills with verified employer job openings.', active: true },
    ],
  },
  'alumni-portal': {
    slug: 'alumni-portal',
    title: 'Alumni Portal',
    subtitle: 'Career tracking, networking, mentorship, and tracer survey participation for ASTU graduates.',
    iconName: 'GraduationCap',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0d6440?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'AP-1', heading: 'Professional Profile', body: 'Create and maintain a verified digital profile showcasing degree credentials, work experience, skills, and portfolio projects.', active: true },
      { id: 'AP-2', heading: 'Job & Internship Board', body: 'Access exclusive job postings from ASTU corporate partners curated specifically for university graduates.', active: true },
      { id: 'AP-3', heading: 'Tracer Survey Engine', body: 'Participate in accredited tracer surveys to help the university improve engineering curricula and retain international standards.', active: true },
      { id: 'AP-4', heading: 'Alumni Directory', body: 'Search and connect with fellow graduates across different graduation years, industries, and countries.', active: true },
    ],
  },
  'employer-portal': {
    slug: 'employer-portal',
    title: 'Employer Portal',
    subtitle: 'Talent recruitment, job posting, and competency feedback tools for enterprise partner companies.',
    iconName: 'Briefcase',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1800&q=80',
    badge: 'Enterprise Talent Sourcing',
    primaryCtaText: 'Register as Employer',
    primaryCtaLink: '/employers/register',
    secondaryCtaText: 'Employer Login',
    secondaryCtaLink: '/login',
    stats: [
      { id: 'EPS-1', value: '—', label: 'Partner Enterprises', desc: 'Active recruiters on AMS' },
      { id: 'EPS-2', value: '—', label: 'Verified Candidates', desc: 'Engineers & scientists' },
      { id: 'EPS-3', value: '—', label: 'Employment Rate', desc: 'Tracked across cohorts' },
      { id: 'EPS-4', value: '48 hrs', label: 'Average Verification', desc: 'Fast institutional review' },
    ],
    sections: [
      { id: 'EP-1', heading: 'Post Opportunities', body: 'Publish job vacancies, internships, and graduate development programs directly to thousands of verified graduates.', badge: 'Hiring Pipeline', active: true },
      { id: 'EP-2', heading: 'Alumni Talent Search', body: 'Filter verified candidates by GPA, graduation year, engineering department, and technical skills.', badge: 'Candidate Match', active: true },
      { id: 'EP-3', heading: 'Competency Feedback', body: 'Submit structured employer feedback regarding graduate competencies to directly influence ASTU curriculum development.', badge: 'ETA Alignment', active: true },
      { id: 'EP-4', heading: 'On-Campus Recruitment Drives', body: 'Coordinate interview suites, campus recruitment expos, and graduate tech talk days directly with ASTU leadership.', badge: 'Direct Engagement', active: true },
    ],
    faqs: [
      { id: 'EPF-1', question: 'How can our company register on the ASTU Employer Portal?', answer: 'Click "Register as Employer", submit your corporate details and TIN verification. The ASTU Corporate Relations office approves verified accounts within 24–48 hours.' },
      { id: 'EPF-2', question: 'Are candidate degrees and graduation records verified?', answer: 'Yes, all alumni profiles on ASTU-AMS are directly cross-referenced against official university registrar records.' },
      { id: 'EPF-3', question: 'Can employers participate in curriculum reviews?', answer: 'Absolutely. Registered partners provide biennial competency feedback surveys that directly influence curriculum updates across all 5 engineering schools.' },
    ],
  },
  'registrar-portal': {
    slug: 'registrar-portal',
    title: 'Registrar Portal',
    subtitle: 'Document verification, transcript processing, and graduate academic records management.',
    iconName: 'FileText',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'RP-1', heading: 'Credential Verification', body: 'Verify student graduation status and authenticate official degree documents seamlessly with SIS integration.', active: true },
      { id: 'RP-2', heading: 'Digital Document Processing', body: 'Process official transcript requests, certificate re-issuances, and medium of instruction letters online.', active: true },
      { id: 'RP-3', heading: 'Tracer Study Compliance', body: 'Track graduate response rates and export verified cohort records for quality assurance deans.', active: true },
    ],
  },
  'department-portal': {
    slug: 'department-portal',
    title: 'Department Portal',
    subtitle: 'Program analytics, graduate outcome metrics, and accreditation readiness for department heads.',
    iconName: 'BarChart3',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'DP-1', heading: 'Graduate Outcomes Tracking', body: 'Monitor employment rates, top hiring sectors, and average starting salaries for your department graduates.', active: true },
      { id: 'DP-2', heading: 'Accreditation Evidence Repository', body: 'Instantly generate audit-ready tracer study evidence packages required for university accreditation.', active: true },
      { id: 'DP-3', heading: 'Industry Competency Gaps', body: 'Analyze real-time employer survey responses to pinpoint emerging technological skill requirements in curricula.', active: true },
    ],
  },
  'featured-employers': {
    slug: 'featured-employers',
    title: 'Featured Employers',
    subtitle: 'Verified partner companies actively recruiting, providing internships, and collaborating with ASTU.',
    iconName: 'Building2',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=80',
    badge: 'Verified Corporate Alliances',
    primaryCtaText: 'Register as Corporate Employer',
    primaryCtaLink: '/employers/register',
    secondaryCtaText: 'Explore Partner Hub',
    secondaryCtaLink: '/partners',
    stats: [
      { id: 'FES-1', value: '—', label: 'Partner Companies', desc: 'In Ethiopia & internationally' },
      { id: 'FES-2', value: '—', label: 'Active Jobs', desc: 'Live openings on AMS' },
      { id: 'FES-3', value: '—', label: 'Placement Rate', desc: 'Graduate tracer benchmark' },
      { id: 'FES-4', value: '100%', label: 'Verified Credentials', desc: 'Official SIS validation' },
    ],
    sections: [
      { id: 'FE-1', heading: 'Strategic Talent Pipelines', body: 'Partner organizations collaborate with ASTU on graduate hiring tracks, internships, and specialist development programs.', badge: 'Strategic Partner', active: true },
      { id: 'FE-2', heading: 'Industry & Systems Collaboration', body: 'Aviation, telecom, banking, and technology partners run dedicated internship and cadet programs with ASTU.', badge: 'Industry Linkage', active: true },
      { id: 'FE-3', heading: 'Research & Security Partnerships', body: 'Cybersecurity, cryptography, and applied research placements for advanced graduates with national institutions.', badge: 'Research', active: true },
      { id: 'FE-4', heading: 'Technology Academies & Certification', body: 'ICT academy certification pipelines and hands-on technology training for engineering students.', badge: 'Technology', active: true },
    ],
    faqs: [
      { id: 'FEF-1', question: 'How are featured employers chosen?', answer: 'Featured employers are vetted enterprise institutions maintaining active hiring agreements, internship pipelines, or joint research with ASTU.' },
      { id: 'FEF-2', question: 'Can our enterprise become a featured employer?', answer: 'Yes! Registered employers who post verified openings and engage in university campus days are featured across the platform and student portal.' },
      { id: 'FEF-3', question: 'How do students apply to these employers?', answer: 'ASTU students and alumni apply directly via the AMS job board with authenticated digital credential portfolios.' },
    ],
  },
  announcements: {
    slug: 'announcements',
    title: 'Official Announcements',
    subtitle: 'Latest university notices, academic calendars, registrar alerts, and institutional communications.',
    iconName: 'Bell',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0d6440?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'AN-1', heading: 'Institutional Notices', body: 'Official communications from ASTU President Directorate, Academic VP Office, and Registrar regarding semester schedules.', active: true },
      { id: 'AN-2', heading: 'Tracer Survey Windows', body: 'Deadlines and participation details for graduate outcome surveys and accreditation quality assurance reporting.', active: true },
      { id: 'AN-3', heading: 'Career & Partnership Updates', body: 'Announcements regarding upcoming corporate recruitment drives, internships, and research grants.', active: true },
    ],
  },
  faq: {
    slug: 'faq',
    title: 'Frequently Asked Questions',
    subtitle: 'Common questions for alumni, employers, registrar services, and department coordinators.',
    iconName: 'HelpCircle',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'FQ-1', heading: 'Who can use ASTU-AMS?', body: 'Verified alumni, employers, registrar teams, departments, and system administrators each access role-specific services through dedicated portals.', active: true },
      { id: 'FQ-2', heading: 'How are tracer studies used?', body: 'Responses support employment analytics, skill-gap reviews, curriculum updates, and accreditation evidence collection.', active: true },
      { id: 'FQ-3', heading: 'Can employers register events?', body: 'Employer partners can coordinate job posts, internships, campus recruitment events, interviews, and feedback reports.', active: true },
      { id: 'FQ-4', heading: 'How do I update my profile?', body: 'Go to your Dashboard and navigate to the Profile tab to update education, work experience, and skills.', active: true },
    ],
  },
  contact: {
    slug: 'contact',
    title: 'Contact Us',
    subtitle: 'Reach ASTU alumni relations, registrar support, and employer partnership teams.',
    iconName: 'Building2',
    image: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'CT-1', heading: 'Main Address', body: 'Adama Science and Technology University, Adama, Oromia, Ethiopia', active: true },
      { id: 'CT-2', heading: 'Postal Box', body: 'P.O. Box 1888, Adama, Ethiopia', active: true },
      { id: 'CT-3', heading: 'Phone & Support Lines', body: '+251-221-110000 / +251-221-110400', active: true },
      { id: 'CT-4', heading: 'Official Email', body: 'irccd@astu.edu.et / alumni@astu.edu.et', active: true },
      { id: 'CT-5', heading: 'Office Hours', body: 'Monday to Friday, 8:00 AM – 5:00 PM (East Africa Time)', active: true },
      { id: 'CT-6', heading: 'Social Media Channels', body: 'Facebook: /adamaastu | Telegram: @Adama_STU_Almuni', active: true },
    ],
  },
  'community-feed': {
    slug: 'community-feed',
    title: 'Community Feed',
    subtitle: 'Stay connected with alumni discussions, stories, employer announcements, and networking updates.',
    iconName: 'Users',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'CFE-1', heading: 'Alumni Discussions & Updates', body: 'Engage with fellow alumni, share career milestones, and stay informed about university developments.', active: true },
      { id: 'CFE-2', heading: 'Employer Announcements', body: 'Partner companies post job openings, internship opportunities, and recruitment event notifications.', active: true },
      { id: 'CFE-3', heading: 'Networking & Peer Advice', body: 'Exchange industry advice, mentorship connections, and collaborate on technological initiatives.', active: true },
    ],
  },
  research: {
    slug: 'research',
    title: 'Research Publications',
    subtitle: 'Academic research outputs, patent filings, and applied science highlights from ASTU faculties.',
    iconName: 'BookOpen',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'RS-1', heading: 'Research Database', body: 'Browse 1,240+ research publications across engineering, natural sciences, and computational technology.', active: true },
      { id: 'RS-2', heading: 'Applied Engineering Projects', body: 'Explore 72 industry projects and applied laboratory outcomes solving regional infrastructure challenges.', active: true },
      { id: 'RS-3', heading: 'Joint Innovation Grants', body: 'Opportunities for alumni researchers and international institutions to co-publish and apply for research grants.', active: true },
    ],
  },
  innovation: {
    slug: 'innovation',
    title: 'Innovation Hub & Startups',
    subtitle: 'Student and faculty technology ventures driving Ethiopian industrialization and digital growth.',
    iconName: 'Lightbulb',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'IH-1', heading: 'Startup Incubation', body: 'ASTU provides seed prototyping, mentorship, and workspace for student and alumni entrepreneurs.', active: true },
      { id: 'IH-2', heading: 'Specialized Centers', body: '12+ dedicated research centers covering Artificial Intelligence, Renewable Energy, and Smart Manufacturing.', active: true },
      { id: 'IH-3', heading: 'Technology Transfer', body: 'Connecting academic patent discoveries directly to local industrial manufacturers and startups.', active: true },
    ],
  },
  'alumni-stories': {
    slug: 'alumni-stories',
    title: 'Alumni Success Stories',
    subtitle: 'Inspiring career journeys and achievements of Adama Science and Technology University graduates making global impact.',
    iconName: 'Trophy',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0d6440?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'AS-1', heading: 'Celebrating Nearly Three Decades of Excellence', body: 'With its establishment spanning nearly three decades, ASTU boasts a proud tradition of graduates excelling in high-impact ventures, multinational technology corporations, leading research institutes, and executive leadership positions worldwide.', active: true },
      { id: 'AS-2', heading: 'Dr. Ruth Alemu — AI Research Scientist', body: 'Graduating from ASTU Computer Science, Dr. Ruth joined a premier AI research lab, publishing 18 applied machine learning papers. She continues to actively mentor current ASTU engineering scholars through the AMS mentorship portal.', active: true },
      { id: 'AS-3', heading: 'Yonas Bekele — Founder of GreenGrid Labs', body: 'Inspired by ASTU renewable energy laboratories, Yonas launched GreenGrid Labs — now delivering clean, decentralized energy infrastructure to over 12 industrial parks in East Africa, employing over 200 skilled engineers.', active: true },
      { id: 'AS-4', heading: 'Kalkidan Tadesse — Cloud Engineering Lead, Ethio Telecom', body: 'Kalkidan credits ASTU\'s rigorous hands-on laboratory curriculum for her rapid career trajectory. She now spearheads enterprise cloud migration projects across regional public and private entities.', active: true },
      { id: 'AS-5', heading: 'Share Your Story', body: 'Are you an ASTU graduate with an achievement or milestone to share? Reach out to the Alumni Relations Directorate at irccd@astu.edu.et or submit your story through the AMS alumni portal.', active: true },
    ],
  },
  community: {
    slug: 'community',
    title: 'ASTU Alumni Community',
    subtitle: 'Your networks around the world — connecting graduates, faculty, and industry leaders across all disciplines.',
    iconName: 'Users',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'CM-1', heading: 'A Global Network of Graduates', body: 'The ASTU Alumni Community unites active registered alumni across major fields of study, building regional chapters and professional circles across Ethiopia, East Africa, North America, Europe, and Asia.', active: true },
      { id: 'CM-2', heading: 'Distinguished Global Alumni Leaders', body: 'Our graduates hold influential leadership roles worldwide, including Samson Arega Bekele (Group Vice President Customer Experience, Ethiopian Airlines Group), Zenebe Mideksa Abebe (Supply Chain Specialist, The Boeing Company), Dr. Tadesse G. Wakjira (Adjunct Faculty, Idaho State University, USA), and Melaku Assefa (Global Operational Excellence Director, High-Tech Startup Germany).', active: true },
      { id: 'CM-3', heading: 'National Leadership & Public Service', body: 'ASTU alumni drive key public and engineering institutions, including Aderajew Shumet Tamirat, PhD (Senior Advisor to the State Minister, Ministry of Finance), Tibebu Tegegne Bekele (Deputy Team Leader, Niras Germany / KfW), and Eng. Assefa Dida (General Manager, Assefa Dida General & Water Work Contractor).', active: true },
      { id: 'CM-4', heading: 'Academic & Technological Innovation at ASTU', body: 'Many distinguished alumni continue their impact within ASTU faculty and research centers, such as Dr. Tafesse Asrat Abera (College of Electrical Engineering & Computing, Gold Medalist 2001), Dr. Habtamu Beri (Manufacturing Technology), Alemayehu Wakjira, PhD (Automotive Engineering), and Mr. Niguse Assefa.', active: true },
      { id: 'CM-5', heading: 'Annual Alumni Carnival', body: 'In celebration of university heritage, ASTU hosts the flagship Alumni Carnival on April 25 and 26. This gathering serves as a vibrant homecoming platform uniting former graduates, faculty, current students, and industrial partners.', active: true },
      { id: 'CM-6', heading: 'Mentorship, Giving Back & Knowledge Transfer', body: 'Senior alumni return to lead masterclasses, resume reviews, and career readiness workshops, ensuring current students transition smoothly into modern engineering and tech careers.', active: true },
    ],
  },
  news: {
    slug: 'news',
    title: 'ASTU Alumni News & Updates',
    subtitle: 'The latest developments, partnerships, workshops, and achievements from the ASTU Alumni Association.',
    iconName: 'FileText',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'NW-1', heading: 'Alumni Association Inspires Graduating Class with Career Tips', body: 'Former ASTU graduates and industry specialists conducted intensive workshops on Navigating the Transition: Labor Market Tips, preparing final-year students ahead of the annual campus Job Expo.', active: true },
      { id: 'NW-2', heading: 'Five-Day DAAD Alumni Workshop on Sustainable Water & Environmental Protection', body: 'ASTU hosted delegates from Germany, Kenya, Uganda, Tanzania, and sister Ethiopian universities in an international symposium advancing capacity for sustainable East African water infrastructure.', active: true },
      { id: 'NW-3', heading: 'ASTU Alumni Serving at International Fora', body: 'Recognizing ASTU alumni serving as secretariats for Model United Nations and international engineering symposiums, demonstrating global leadership.', active: true },
      { id: 'NW-4', heading: 'Upcoming Career Expos & Industry Days', body: 'Join partner organizations including Ethio Telecom, Ethiopian Airlines, INSA, and Huawei for on-campus talent recruitment drives throughout the academic calendar.', active: true },
    ],
  },
  stakeholders: {
    slug: 'stakeholders',
    title: 'Stakeholders & Industry Collaborators',
    subtitle: 'Strategic enterprise, governmental, and academic alliances driving innovation, talent placement, and technological advancement.',
    iconName: 'Building2',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=80',
    badge: 'Industry & Government Alliances',
    primaryCtaText: 'Initiate Corporate Partnership',
    primaryCtaLink: '/employers/register',
    secondaryCtaText: 'Contact Relations Directorate',
    secondaryCtaLink: '/info/contact',
    stats: [
      { id: 'SHS-1', value: '—', label: 'Enterprise Allies', desc: 'MoU signed & active partners' },
      { id: 'SHS-2', value: '—', label: 'Active Jobs', desc: 'Live openings on AMS' },
      { id: 'SHS-3', value: '—', label: 'Fields of Study', desc: 'Academic departments' },
      { id: 'SHS-4', value: '—', label: 'Registered Alumni', desc: 'Verified network members' },
    ],
    sections: [
      { id: 'SH-1', heading: 'Enterprise & Corporate Partners', body: 'Partner organizations collaborate with ASTU on talent pipelines, internships, and applied technology initiatives across telecom, aviation, cybersecurity, banking, and ICT sectors.', badge: 'Corporate Tier', active: true },
      { id: 'SH-2', heading: 'Academic & Research Consortia', body: 'Partnering with German Academic Exchange Service (DAAD), regional universities, and national research institutes on applied engineering projects, faculty development, and international grants.', badge: 'International Consortia', active: true },
      { id: 'SH-3', heading: 'Curriculum & Competency Alignment', body: 'Stakeholder advisory boards meet regularly to evaluate industry skill trends, feeding data from graduate tracer surveys directly into university curriculum reforms.', badge: 'Accreditation Readiness', active: true },
      { id: 'SH-4', heading: 'Partner With ASTU', body: 'Organizations interested in recruitment partnerships, research sponsorships, or technology transfer can contact the Corporate Relations Office at irccd@astu.edu.et.', badge: 'Collaboration Gateway', active: true },
    ],
    faqs: [
      { id: 'SHF-1', question: 'How do organizations establish an institutional MoU with ASTU?', answer: 'Contact the Industry Relations and Corporate Communications Directorate (IRCCD) via irccd@astu.edu.et or register your organization via the Employer Portal to initiate formal cooperation agreements.' },
      { id: 'SHF-2', question: 'What areas of joint research are available?', answer: 'ASTU has 12 specialized research arcs spanning AI, robotics, renewable energy systems, biotechnology, materials science, and civil infrastructure.' },
      { id: 'SHF-3', question: 'Can international institutions collaborate with ASTU?', answer: 'Yes. ASTU hosts active collaborative programs with international entities including DAAD Germany, JAICA, and regional African science bodies.' },
    ],
  },
  campuses: {
    slug: 'campuses',
    title: 'ASTU Campuses & Facilities',
    subtitle: 'Explore the modern academic, research, and residential infrastructure of Adama Science and Technology University.',
    iconName: 'Building2',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'CP-1', heading: 'Main Campus — Adama', body: 'Located in the vibrant industrial corridor of Adama, Oromia, Ethiopia, the ASTU main campus encompasses state-of-the-art academic complexes, modern auditoriums, athletics centers, and residential quarters.', active: true },
      { id: 'CP-2', heading: 'Advanced Research Arc & Specialized Labs', body: '12+ dedicated research centers equipped for robotics, renewable energy systems, materials testing, biotechnology, and advanced software computing.', active: true },
      { id: 'CP-3', heading: 'Digital Knowledge Centers & Incubation Hubs', body: 'High-speed campus fiber networking, digital repositories, and startup incubation suites providing students and alumni with resources to prototype and commercialize innovations.', active: true },
    ],
  },
  'career-opportunities': {
    slug: 'career-opportunities',
    title: 'Career Opportunities & Talent Placement',
    subtitle: 'Connecting qualified ASTU graduates with top employers, internships, and graduate trainee positions.',
    iconName: 'Briefcase',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1800&q=80',
    sections: [
      { id: 'CO-1', heading: 'Direct Graduate Trainee Tracks', body: 'Access verified job openings curated specifically for ASTU engineering, technology, and applied science graduates from over 500 partner employers.', active: true },
      { id: 'CO-2', heading: 'Internships & Practical Training', body: 'Undergraduate and recent graduate internship placements designed to provide real-world industry experience before and immediately following graduation.', active: true },
      { id: 'CO-3', heading: 'Skill Matching & Automated Tracer Engine', body: 'Our intelligent AMS platform matches candidate skills and degree credentials with partner employer requirements for streamlined hiring.', active: true },
    ],
  },
};

