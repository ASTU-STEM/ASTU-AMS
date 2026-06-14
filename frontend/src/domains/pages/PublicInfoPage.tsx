import React from "react";
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
import Navbar from "../../shared/components/Navbar";

const pages: Record<string, {
  title: string;
  subtitle: string;
  icon: any;
  image: string;
  sections: { heading: string; body: string }[];
}> = {
  overview: {
    title: "ASTU-AMS Overview",
    subtitle: "An integrated Alumni Management System connecting graduates, employers, and departments. Developed in-house by ASTU to enable longitudinal employment tracking and accreditation compliance.",
    icon: Trophy,
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1800&q=80",
    sections: [
      { heading: "What is ASTU-AMS?", body: "ASTU-AMS is a comprehensive alumni management platform designed to bridge the gap between Adama Science and Technology University graduates, employers, and academic departments. With nearly three decades since ASTU's establishment, the platform boasts 1,238+ alumni members across 5 fields of study succeeding in business ventures, national and international companies, research institutes, and leadership positions." },
      { heading: "Background & Rationale", body: "ASTU previously lacked a centralized, automated system to track graduate career trajectories. Graduate data was fragmented across departments and the Registrar's office. Without a unified digital ecosystem, the university remained unable to perform meaningful longitudinal analysis or maintain continuous relationships with its alumni network. The ASTU-AMS solves this by providing a centralized alumni database integrated with the Registrar and ERP systems." },
      { heading: "Core Mission", body: "To foster professional growth, streamline talent acquisition, and drive academic innovation through data-driven insights and seamless connectivity between all stakeholders. The system provides verified tracer study data required by the Education and Training Authority (ETA) and international accreditation bodies." },
      { heading: "Key Modules", body: "Alumni Registration & Verification, Profile Management, Automated Tracer Engine & Survey Logic, Event Calendar & RSVP, Mentorship & Job Board, Employer Portal & Analytics Dashboards, Messaging & Notifications, and Document Request Services." },
      { heading: "Technical Architecture", body: "Built with React.js frontend and Django/Node.js backend with RESTful APIs. Database: PostgreSQL. Integrated with Google Sheets API, Telebirr, Email/SMS APIs. Analytics powered by Power BI and Metabase. Hosted on secure university servers with SSL, role-based access, and GDPR-compliant protocols." },
      { heading: "Our Legacy", body: "ASTU alumni are the university's lasting legacy and strongest voice. The Alumni Association works to build an engaged membership base, giving alumni ways to reconnect, give back to ASTU, and serve as a springboard for further involvement." },
    ],
  },
  "impact-numbers": {
    title: "Impact Numbers",
    subtitle: "Key statistics demonstrating ASTU-AMS reach and effectiveness.",
    icon: LineChart,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1800&q=80",
    sections: [
      { heading: "1,238+ Alumni Members", body: "Registered alumni actively connected through the platform, spanning diverse industries and leadership positions." },
      { heading: "5 Fields of Study", body: "Comprehensive coverage across Engineering, Natural Sciences, Technology, Business, and Research programs." },
      { heading: "500+ Partner Organizations", body: "Employers and institutions partnering with ASTU for talent acquisition, internships, and research collaboration." },
      { heading: "24,000+ Global Alumni", body: "A thriving network of ASTU graduates spread across industries worldwide, staying connected through the platform." },
      { heading: "87% Employment Rate", body: "Graduate employment rate tracked through comprehensive tracer studies and employer feedback." },
      { heading: "6,000+ Digital Requests", body: "Annual transcript, certificate, and document processing requests handled through the registrar portal." },
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
      { heading: "Research Excellence", body: "1,240+ research publications and 38 startup showcases demonstrating ASTU's commitment to innovation and knowledge creation." },
      { heading: "Industry Partnerships", body: "72 active industry projects and 80+ industry partners collaborating on research, internships, and curriculum development." },
      { heading: "National Recognition", body: "ASTU consistently ranks among Ethiopia's top science and technology universities, with multiple awards in engineering education." },
      { heading: "Expected Outcomes", body: "High-fidelity alumni tracking with 90%+ accuracy rate in graduate tracking, providing clear maps of alumni geographic distribution, salary benchmarks, and time-to-hire metrics across all programs." },
      { heading: "Accreditation Readiness", body: "Robust, audit-ready repository of tracer study reports fulfilling ETA requirements, enabling data-driven curriculum evolution with updates every two years based on industrial trends." },
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
      { heading: "Social Media", body: "Facebook: /adamaastu | Telegram: @Adama_STU_Almuni" },
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
      { heading: "Annual Career Expo", body: "Meet 50+ employers, attend workshops, and apply for open positions at our flagship career event." },
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
      { heading: "Research Database", body: "Browse 1,240+ research publications across engineering, natural sciences, and technology fields." },
      { heading: "Innovation Hub", body: "Explore 38 startup showcases and 72 industry projects emerging from ASTU research." },
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
      { heading: "Research Centers", body: "12+ specialized research centers focusing on AI, renewable energy, biotechnology, and more." },
      { heading: "Industry Collaboration", body: "80+ industry partners collaborate on applied research, technology transfer, and innovation projects." },
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

const fallbackPage = {
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

  return (
    <div className="min-h-screen bg-background text-on-surface">
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
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-astu-navy shadow-lg hover:bg-slate-100 transition-all hover:scale-105"
              >
                <GraduationCap className="h-4 w-4" />
                Portal Access
              </button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-4 py-12 md:px-8 md:py-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {page.sections.map((section, index) => {
              const icons = [BookOpen, Users, Briefcase, PlayCircle, Lightbulb, Globe, ShieldCheck, Star, Handshake, MapPin, Phone, Mail, Award, CalendarDays, Trophy];
              const SectionIcon = icons[index % icons.length];
              return (
                <article
                  key={section.heading}
                  className="group rounded-xl border border-outline-variant bg-white p-6 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-astu-navy/5 text-astu-navy group-hover:bg-astu-navy/10 transition-colors">
                    <SectionIcon className="h-5 w-5" />
                  </div>
                  <h2 className="text-base font-bold text-astu-navy">{section.heading}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{section.body}</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}