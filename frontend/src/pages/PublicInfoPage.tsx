import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
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
} from "lucide-react";
import Navbar from "../components/Navbar";

const pages = {
  announcements: {
    title: "Announcements",
    subtitle: "Official ASTU-AMS notices, public updates, and institutional alerts.",
    icon: Bell,
    items: [
      "Tracer Study 2026 response window is open",
      "Employer partner registration for campus recruitment week",
      "Graduate verification batch import schedule",
      "AI for Engineering Research workshop registration",
      "Emergency contact and campus service directory updated",
    ],
  },
  "quick-links": {
    title: "Quick Links",
    subtitle: "Fast access to the most-used services and public resources.",
    icon: FileText,
    items: ["Library", "E-Learning", "Campus Life", "Alumni Portal", "Meet Employers", "Registrar Services"],
  },
  about: {
    title: "About & Impact",
    subtitle: "ASTU-AMS connects alumni, employers, registrar services, departments, and institutional analytics.",
    icon: Trophy,
    items: ["ASTU-AMS Overview", "Impact Numbers", "Accreditation Support", "University Achievements"],
  },
  services: {
    title: "Platform Services",
    subtitle: "Role-based services for alumni, employers, registrar teams, departments, and administrators.",
    icon: GraduationCap,
    items: ["Alumni Portal", "Employer Portal", "Registrar Services", "Department Analytics", "Admin Console"],
  },
  events: {
    title: "Community & Events",
    subtitle: "Events, workshops, community updates, career programs, and partner engagement.",
    icon: CalendarDays,
    items: ["Upcoming Events", "Upcoming Workshops", "Community Feed", "Partner Companies", "Career Opportunities"],
  },
  media: {
    title: "Media & Research",
    subtitle: "Campus galleries, videos, research highlights, innovation stories, and testimonials.",
    icon: GalleryHorizontal,
    items: ["Photo Gallery", "Video Gallery", "Research & Innovation", "Campus Life", "Campuses", "Testimonials"],
  },
  faq: {
    title: "FAQ",
    subtitle: "Common questions for alumni, employers, registrar services, and department users.",
    icon: HelpCircle,
    items: ["Who can use ASTU-AMS?", "How are tracer studies used?", "Can employers register events?"],
  },
  contact: {
    title: "Contact",
    subtitle: "Reach ASTU alumni relations, registrar support, and employer partnership teams.",
    icon: Building2,
    items: ["Adama, Oromia, Ethiopia", "+251-221-110000", "alumni.office@astu.edu.et"],
  },
} as const;

const iconMap = [BookOpen, Users, Briefcase, PlayCircle, Lightbulb];

export default function PublicInfoPage() {
  const navigate = useNavigate();
  const { slug = "announcements" } = useParams();
  const page = pages[slug as keyof typeof pages] ?? pages.announcements;
  const Icon = page.icon;

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />
      <main>
        <section className="bg-astu-navy px-4 py-14 text-white md:px-8">
          <div className="mx-auto max-w-[1200px]">
            <button className="text-sm font-semibold text-white/75 hover:text-white" onClick={() => navigate("/")}>
              Home / {page.title}
            </button>
            <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <Icon className="h-10 w-10 text-astu-green" />
                <h1 className="mt-4 text-4xl font-bold tracking-tight">{page.title}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80">{page.subtitle}</p>
              </div>
              <button className="rounded-md bg-white px-5 py-3 text-sm font-bold text-astu-navy" onClick={() => navigate("/login")}>
                Portal Access
              </button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-4 py-12 md:px-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {page.items.map((item, index) => {
              const CardIcon = iconMap[index % iconMap.length];
              return (
                <article key={item} className="rounded-xl border border-outline-variant bg-white p-5 shadow-sm">
                  <CardIcon className="h-6 w-6 text-astu-navy" />
                  <h2 className="mt-4 text-base font-bold text-astu-navy">{item}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                    Managed through ASTU-AMS with role-based workflows, approvals, analytics, and official reporting.
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
