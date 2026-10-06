import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  FileText,
  GalleryHorizontal,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  PlayCircle,
  Trophy,
  Users,
  LineChart,
  ShieldCheck,
  Star,
  Globe,
  Handshake,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import Navbar from "../components/Navbar";
import publicStatsService from "../features/public/services/publicStats.service";

interface PageConfig {
  title: string;
  subtitle: string;
  icon: any;
  image: string;
  sections: { heading: string; body: string }[];
  /**
   * When set, the page renders these entries using figures fetched from
   * /content/public-stats instead of the static `sections` above. Keys with no
   * real rows are omitted, so nothing unmeasured is ever shown.
   */
  liveStats?: { key: string; heading: string; body: string }[];
}

const pages: Record<string, PageConfig> = {
  overview: {
    title: "ASTU-AMS Overview",
    subtitle: "An integrated Alumni Management System connecting graduates, employers, and departments. Developed in-house by ASTU to enable longitudinal employment tracking and accreditation compliance.",
    icon: Trophy,
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1800&q=80",
    sections: [
      { heading: "What is ASTU-AMS?", body: "ASTU-AMS is a comprehensive alumni management platform designed to bridge the gap between Adama Science and Technology University graduates, employers, and academic departments. With nearly three decades since ASTU's establishment, the platform connects our registered alumni across the university's fields of study, supporting graduates succeeding in business ventures, national and international companies, research institutes, and leadership positions." },
      { heading: "Background & Rationale", body: "ASTU previously lacked a centralized, automated system to track graduate career trajectories. Graduate data was fragmented across departments and the Registrar's office. Without a unified digital ecosystem, the university remained unable to perform meaningful longitudinal analysis or maintain continuous relationships with its alumni network. The ASTU-AMS solves this by providing a centralized alumni database integrated with the Registrar and ERP systems." },
      { heading: "Core Mission", body: "To foster professional growth, streamline talent acquisition, and drive academic innovation through data-driven insights and seamless connectivity between all stakeholders. The system provides verified tracer study data required by the Education and Training Authority (ETA) and international accreditation bodies." },
      { heading: "Key Modules", body: "Alumni Registration & Verification, Profile Management, Automated Tracer Engine & Survey Logic, Event Calendar & RSVP, Mentorship & Job Board, Employer Portal & Analytics Dashboards, Messaging & Notifications, and Document Request Services." },
      { heading: "Technical Architecture", body: "Built with React.js frontend and Django/Node.js backend with RESTful APIs. Database: PostgreSQL. Integrated with Google Sheets API, Telebirr, Email/SMS APIs. Analytics powered by Power BI and Metabase. Hosted on secure university servers with SSL, role-based access, and GDPR-compliant protocols." },
      { heading: "Our Legacy", body: "ASTU alumni are the university's lasting legacy and strongest voice. The Alumni Association works to build an engaged membership base, giving alumni ways to reconnect, give back to ASTU, and serve as a springboard for further involvement." },
    ],
  },
  "impact-numbers": {
    title: "Impact Numbers",
    subtitle: "Live figures counted directly from ASTU-AMS records.",
    icon: LineChart,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1800&q=80",
    sections: [],
    liveStats: [
      { key: "alumni", heading: "Active Alumni Members", body: "Graduates with an active ASTU-AMS account, connected to the network and reachable by their department." },
      { key: "departments", heading: "Departments", body: "Academic departments running their own portal for graduate tracking, employment outcomes and tracer studies." },
      { key: "jobs", heading: "Open Roles", body: "Live job openings posted to the board by registered and verified employer partners." },
      { key: "employers", heading: "Verified Partner Employers", body: "Organisations that completed verification and are permitted to post roles and request CVs." },
    ],
  },
  accreditation: {
    title: "Accreditation",
    subtitle: "Quality assurance framework ensuring academic excellence and industry alignment.",
    icon: ShieldCheck,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1800&q=80",
    sections: [
      { heading: "Data-Driven Accreditation", body: "ASTU-AMS provides verified tracer data, employment analytics, and employer feedback essential for accreditation agencies and university management." },
      { heading: "Global Standards", body: "Build transparent, audited institutional reports that meet international accreditation standards and quality assurance requirements." },
      { heading: "Curriculum Alignment", body: "Employer feedback and graduate outcome data feed directly into curriculum updates, ensuring programs remain relevant to industry needs." },
    ],
  },
  achievements: {
    title: "University Achievements",
    subtitle: "Awards, recognitions, and milestones of Adama Science and Technology University.",
    icon: Award,
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c7f1?auto=format&fit=crop&w=1800&q=80",
    sections: [
      { heading: "Research Excellence", body: "Research output and startup showcases demonstrating ASTU's commitment to innovation and knowledge creation." },
      { heading: "Industry Partnerships", body: "ASTU collaborates with industry partners on research, internships, and curriculum development to keep programmes aligned with labour-market needs." },
      { heading: "National Recognition", body: "ASTU is recognised among Ethiopia's leading science and technology universities, with a strong record in engineering education and applied research." },
      { heading: "Expected Outcomes", body: "High-fidelity alumni tracking that supports clear maps of graduate distribution, employment pathways, and programme-level outcomes for accreditation and planning." },
      { heading: "Accreditation Readiness", body: "An audit-ready repository of tracer study reports that supports ETA requirements and data-informed curriculum review." },
    ],
  },
  faq: {
    title: "FAQ",
    subtitle: "Common questions for alumni, employers, registrar services, and department users.",
    icon: HelpCircle,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1800&q=80",
    sections: [
      { heading: "Who can use ASTU-AMS?", body: "Verified alumni, employers, registrar teams, departments, and system administrators each access role-specific services through dedicated portals." },
      { heading: "How are tracer studies used?", body: "Responses support employment analytics, skill-gap reviews, curriculum updates, and accreditation evidence collection." },
      { heading: "Can employers register events?", body: "Employer partners can coordinate job posts, internships, campus recruitment events, interviews, and feedback reports." },
      { heading: "How do I update my profile?", body: "Go to your Dashboard and navigate to the Profile tab to update education, work experience, and skills." },
      { heading: "What is the tracer survey deadline?", body: "The 6-Month Post-Graduation Tracer Study typically closes within 30 days of the deadline. Check your Surveys tab." },
    ],
  },
  contact: {
    title: "Contact Us",
    subtitle: "Reach ASTU alumni relations, registrar support, and employer partnership teams.",
    icon: Building2,
    image: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=1800&q=80",
    sections: [
      { heading: "Address", body: "Adama Science and Technology University, Adama, Oromia, Ethiopia" },
      { heading: "P.O. Box", body: "1888 Adama, Ethiopia" },
      { heading: "Phone", body: "+251-221-110000" },
      { heading: "Email", body: "irccd@astu.edu.et" },
      { heading: "Office Hours", body: "Monday to Friday, 8:00 AM - 5:00 PM (EAT)" },
      { heading: "Social Media", body: "Facebook: /adamaastu | Telegram: @Adama_STU_Alumni" },
    ],
  },
  "community-feed": {
    title: "Community Feed",
    subtitle: "Stay connected with alumni stories, employer announcements, and career opportunities.",
    icon: Users,
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1800&q=80",
    sections: [
      { heading: "Alumni Discussions & Updates", body: "Engage with fellow alumni, share achievements, and stay informed about university developments." },
      { heading: "Employer Announcements", body: "Partner companies post job openings, internship opportunities, and recruitment event notifications." },
      { heading: "Career Opportunities", body: "Browse curated job listings matched to your skills, department, and career interests." },
      { heading: "Networking & Mentorship", body: "Connect with experienced alumni mentors and expand your professional network." },
    ],
  },
  events: {
    title: "Events Calendar",
    subtitle: "Workshops, reunions, conferences, and professional development opportunities.",
    icon: CalendarDays,
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1800&q=80",
    sections: [
      { heading: "ASTU Alumni Carnival 2026", body: "April 25-26, 2026 - Main Campus. A homecoming event uniting graduates, academic staff, current students, and stakeholders to celebrate ASTU's legacy and achievements over the past thirty years." },
      { heading: "DAAD Alumni Workshop", body: "March 2026 - ASTU Research Center. A five-day workshop hosted in collaboration with the German Academic Exchange Service (DAAD) for research and academic networking." },
      { heading: "Career Tips & Mentorship", body: "ASTU Alumni Association regularly inspires graduating classes with career tips, interview preparation, and professional networking sessions." },
      { heading: "Model UN Secretariat", body: "ASTU alumni actively serve as model United Nations secretariats, showcasing leadership and diplomatic skills on international platforms." },
    ],
  },
  mentorship: {
    title: "Mentorship Program",
    subtitle: "Connect with experienced alumni mentors to guide your career journey.",
    icon: GraduationCap,
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1800&q=80",
    sections: [
      { heading: "Find a Mentor", body: "Browse available mentors by industry, department, or expertise area. Send connection requests directly." },
      { heading: "Become a Mentor", body: "Experienced alumni can sign up to mentor current students and recent graduates, sharing industry insights." },
      { heading: "Mentorship Benefits", body: "Mentees gain career guidance, industry connections, and professional development support." },
    ],
  },
  "career-fair": {
    title: "Career Fair",
    subtitle: "Job opportunities, networking, and recruitment events for ASTU alumni and students.",
    icon: Briefcase,
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1800&q=80",
    sections: [
      { heading: "Annual Career Expo", body: "Meet employer partners, attend workshops, and apply for open positions at ASTU's flagship career event." },
      { heading: "On-Campus Recruitment", body: "Employers conduct interviews and information sessions throughout the academic year." },
      { heading: "Job Matching", body: "AI-powered job matching connects your skills and preferences with relevant opportunities." },
    ],
  },
  gallery: {
    title: "Photo Gallery",
    subtitle: "Campus life, events, and memorable moments at ASTU.",
    icon: GalleryHorizontal,
    image: "https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?auto=format&fit=crop&w=1800&q=80",
    sections: [
      { heading: "Campus Life", body: "Explore vibrant campus life through photographs of academic buildings, labs, and student activities." },
      { heading: "Graduation Ceremonies", body: "Relive memorable graduation moments captured across years of ASTU history." },
      { heading: "Events & Conferences", body: "Photo coverage of career expos, workshops, research symposiums, and alumni reunions." },
    ],
  },
  "video-gallery": {
    title: "Video Gallery",
    subtitle: "Research presentations, event recordings, and university highlights.",
    icon: PlayCircle,
    image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1800&q=80",
    sections: [
      { heading: "Research Showcases", body: "Watch research presentations, innovation demos, and faculty interviews." },
      { heading: "Event Recordings", body: "Access recordings of career expos, workshops, graduation ceremonies, and guest lectures." },
      { heading: "Campus Tours", body: "Virtual tours of ASTU campuses, laboratories, and innovation centers." },
    ],
  },
  research: {
    title: "Research Publications",
    subtitle: "Academic research outputs and innovation highlights from ASTU.",
    icon: BookOpen,
    image: "https://images.unsplash.com/photo-1504711434969-e33886168d6c?auto=format&fit=crop&w=1800&q=80",
    sections: [
      { heading: "Research Database", body: "Browse research publications across engineering, natural sciences, and technology fields." },
      { heading: "Innovation Hub", body: "Explore startup showcases and industry projects emerging from ASTU research programmes." },
      { heading: "Collaboration Opportunities", body: "Connect with research centers and explore partnership opportunities for joint projects." },
    ],
  },
  innovation: {
    title: "Innovation Hub",
    subtitle: "Student and faculty innovations driving technological advancement.",
    icon: Lightbulb,
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1800&q=80",
    sections: [
      { heading: "Startup Incubation", body: "ASTU supports student and alumni startups through incubation programs, funding access, and mentorship." },
      { heading: "Research Centers", body: "Specialised research centres focusing on AI, renewable energy, biotechnology, and applied engineering." },
      { heading: "Industry Collaboration", body: "Industry partners collaborate on applied research, technology transfer, and innovation projects with ASTU departments." },
    ],
  },
  "alumni-portal": {
    title: "Alumni Portal",
    subtitle: "Career tracking, networking, mentorship, and tracer surveys for ASTU graduates.",
    icon: GraduationCap,
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0d6440?auto=format&fit=crop&w=1800&q=80",
    sections: [
      { heading: "Professional Profile", body: "Create and maintain a rich professional profile showcasing your education, work experience, skills, and achievements." },
      { heading: "Job & Internship Matching", body: "Access verified job listings and internship opportunities matched to your skills, department, and career goals." },
      { heading: "Tracer Surveys", body: "Complete tracer surveys to help guide curriculum development, accreditation reporting, and university improvement." },
      { heading: "Mentorship & Networking", body: "Connect with fellow alumni, mentor current students, and expand your professional network." },
    ],
  },
  "employer-portal": {
    title: "Employer Portal",
    subtitle: "Talent recruitment, job posting, and feedback tools for employer partners.",
    icon: Briefcase,
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1800&q=80",
    sections: [
      { heading: "Post Opportunities", body: "Publish job openings, internships, and graduate trainee positions to reach qualified ASTU alumni." },
      { heading: "Talent Search", body: "Search alumni profiles by department, graduation year, skills, and experience to find ideal candidates." },
      { heading: "Event Coordination", body: "Register for career fairs, campus recruitment events, and information sessions." },
      { heading: "Feedback & Analytics", body: "Provide employer feedback on graduate performance to help shape curriculum and accreditation." },
    ],
  },
  "registrar-portal": {
    title: "Registrar Portal",
    subtitle: "Document verification, transcript processing, and graduate data management.",
    icon: FileText,
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1800&q=80",
    sections: [
      { heading: "Credential Verification", body: "Validate alumni academic credentials against the Student Information System (SIS)." },
      { heading: "Document Processing", body: "Process transcript requests, certificate issuances, and ID card services efficiently." },
      { heading: "Tracer Study Management", body: "Send tracer study reminders, track response rates, and audit submission data." },
      { heading: "Data Reporting", body: "Generate graduate employment reports, accreditation evidence, and institutional analytics." },
    ],
  },
  "department-portal": {
    title: "Department Portal",
    subtitle: "Program analytics, graduate outcomes, and accreditation readiness for department heads.",
    icon: BarChart3,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1800&q=80",
    sections: [
      { heading: "Graduate Outcomes", body: "Monitor employment rates, industry placement, and skill gaps for your department's graduates." },
      { heading: "Accreditation Reports", body: "Generate data-rich reports with verified tracer evidence for accreditation and quality assurance." },
      { heading: "Industry Feedback", body: "Review employer feedback mapped to your programs and identify curriculum improvement areas." },
      { heading: "Analytics Dashboard", body: "Access KPIs, trends, and comparative data to drive program-level decisions." },
    ],
  },
  "featured-employers": {
    title: "Featured Employers",
    subtitle: "Verified partner companies supporting jobs, internships, and campus recruitment.",
    icon: Building2,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=80",
    sections: [
      { heading: "Ethio Telecom", body: "Telecom & Cloud - 14 graduate roles available for ASTU alumni." },
      { heading: "Ethiopian Airlines", body: "Aviation Technology - 8 internship tracks for engineering graduates." },
      { heading: "INSA", body: "Cybersecurity - 6 research placements for advanced degree holders." },
      { heading: "Huawei Ethiopia", body: "Network Engineering - 11 certification paths and job opportunities." },
    ],
  },
};

const fallbackPage: PageConfig = {
  title: "Page Not Found",
  subtitle: "The requested page is not available.",
  icon: HelpCircle,
  image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1800&q=80",
  sections: [{ heading: "Navigation", body: "Please use the navigation menu to find the information you need." }],
};

export default function PublicInfoPage() {
  const navigate = useNavigate();
  const { slug = "overview" } = useParams();
  const page = pages[slug] ?? fallbackPage;
  const Icon = page.icon;

  const [statValues, setStatValues] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!page.liveStats) return;
    let isMounted = true;
    publicStatsService.getStats().then((stats) => {
      if (!isMounted) return;
      setStatValues(
        stats.reduce<Record<string, number>>((acc, s) => {
          acc[s.key] = s.value;
          return acc;
        }, {})
      );
    });
    return () => {
      isMounted = false;
    };
  }, [slug, page.liveStats]);

  // Only entries backed by a real, non-zero count are rendered.
  const liveStatEntries = (page.liveStats ?? []).filter((e) => (statValues[e.key] ?? 0) > 0);

  return (
    <div className="app-shell min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-200">
      <Navbar />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              alt={page.title}
              className="h-full w-full object-cover"
              src={page.image}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-astu-navy/90 via-astu-navy/75 to-astu-navy/90" />
          </div>
          <div className="relative z-10 mx-auto max-w-[1200px] px-4 py-16 md:px-8 md:py-20">
            <button
              onClick={() => navigate("/")}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur-sm hover:bg-white/20 hover:text-white transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Home
            </button>
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                  <Icon className="h-8 w-8 text-astu-green" />
                </div>
                <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">{page.title}</h1>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
                  {page.subtitle}
                </p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-astu-navy shadow-lg hover:bg-[var(--bg-page)] transition-all hover:scale-105"
              >
                <GraduationCap className="h-4 w-4" />
                Portal Access
              </button>
            </div>
          </div>
        </section>

        {liveStatEntries.length > 0 ? (
          <section className="mx-auto max-w-[1200px] px-4 py-12 md:px-8 md:py-16">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {liveStatEntries.map((entry, index) => {
                const icons = [Users, Building2, Briefcase, Trophy];
                const SectionIcon = icons[index % icons.length];
                return (
                  <article
                    key={entry.key}
                    className="group rounded-xl border border-outline-variant dark:border-slate-800 bg-[var(--bg-card)] dark:bg-slate-900 p-6 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] transition-all"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-astu-navy/5 dark:bg-blue-900/30 text-astu-navy dark:text-blue-300 transition-colors group-hover:bg-astu-navy/10">
                      <SectionIcon className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl font-bold text-astu-navy dark:text-blue-200">
                      {statValues[entry.key].toLocaleString()}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-astu-navy dark:text-blue-300">{entry.heading}</p>
                    <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-slate-300">{entry.body}</p>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="mx-auto max-w-[1200px] px-4 py-12 md:px-8 md:py-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {page.sections.map((section, index) => {
              const icons = [BookOpen, Users, Briefcase, PlayCircle, Lightbulb, Globe, ShieldCheck, Star, Handshake, MapPin, Phone, Mail, Award, CalendarDays, Trophy];
              const SectionIcon = icons[index % icons.length];
              return (
                <article
                  key={section.heading}
                  className="group rounded-xl border border-outline-variant dark:border-slate-800 bg-[var(--bg-card)] dark:bg-slate-900 p-6 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] transition-all"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-astu-navy/5 dark:bg-blue-900/30 text-astu-navy dark:text-blue-300 group-hover:bg-astu-navy/10 transition-colors">
                    <SectionIcon className="h-5 w-5" />
                  </div>
                  <h2 className="text-base font-bold text-astu-navy dark:text-blue-200">{section.heading}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-slate-300">{section.body}</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}