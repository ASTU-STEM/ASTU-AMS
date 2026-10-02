import { useState } from "react";
import { HiChevronDown, HiMagnifyingGlass, HiXMark } from "react-icons/hi2";
import {
  MdEmail,
  MdPhone,
  MdBookOnline,
  MdSchool,
  MdWork,
  MdDescription,
  MdGroups,
  MdEventNote,
  MdQuiz,
  MdFeedback,
} from "react-icons/md";
import { FaQuestionCircle } from "react-icons/fa";

interface FAQ {
  question: string;
  answer: string;
}

interface HelpSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  faqs: FAQ[];
}

const sections: HelpSection[] = [
  {
    title: "Account & Profile",
    icon: MdSchool,
    faqs: [
      {
        question: "How do I register as an alumni?",
        answer: `Click "Join Network" on the top navigation bar, fill in your student ID, personal details, and graduation information. After submission, check your email for an activation link to verify your account.`,
      },
      {
        question: "How do I update my profile?",
        answer: `Login to your alumni dashboard, navigate to the "Profile" tab, and click "Edit Profile." You can update your contact info, employment history, education, and profile photo. Don't forget to save changes.`,
      },
      {
        question: "I forgot my password. What should I do?",
        answer: `On the login page, click "Forgot Password" and enter your registered email address. You'll receive a password reset link within a few minutes. If you don't see it, check your spam folder.`,
      },
      {
        question: "How do I change my email address?",
        answer: `Go to your Profile > Settings > Account. Enter your new email and verify it through the confirmation link sent to both your old and new email addresses.`,
      },
    ],
  },
  {
    title: "Jobs & Careers",
    icon: MdWork,
    faqs: [
      {
        question: "How do I search for jobs?",
        answer: `Go to the "Jobs" section in your dashboard. You can filter by industry, location, job type (full-time, internship, contract), and keywords. Click on any job to view details and apply directly.`,
      },
      {
        question: "How do employers post jobs?",
        answer: `Employers can register on the platform, verify their company, and post job openings through the Employer Dashboard. Jobs are reviewed before being published to ensure quality.`,
      },
      {
        question: "Can I get notified about new job postings?",
        answer: `Yes! Enable job alerts in your Settings > Notifications. You can set preferences for specific industries, job types, and frequency of alerts.`,
      },
    ],
  },
  {
    title: "Mentorship",
    icon: MdGroups,
    faqs: [
      {
        question: "How do I find a mentor?",
        answer: `Browse the "Mentorship" section to view available mentors. You can filter by industry, expertise, and availability. Send a connection request with a brief message about why you'd like to connect.`,
      },
      {
        question: "How do I become a mentor?",
        answer: `Any alumni with 3+ years of professional experience can apply to be a mentor. Go to the Mentorship tab, click "Become a Mentor," and fill out your profile, expertise areas, and availability.`,
      },
      {
        question: "How are mentor-mentee matches made?",
        answer: `You can browse and request any mentor directly. Alternatively, our system suggests matches based on your career interests, industry, and skills. You're free to accept or decline suggestions.`,
      },
    ],
  },
  {
    title: "Documents & Transcripts",
    icon: MdDescription,
    faqs: [
      {
        question: "How do I request my transcript?",
        answer: `Navigate to "Document Services" in your dashboard. Select "Transcript Request," fill in the required details (number of copies, delivery method), and submit. Track the status in your requests tab.`,
      },
      {
        question: "How long does document processing take?",
        answer: `Standard processing takes 5-7 business days. Expedited processing (2-3 business days) is available for an additional fee. Delivery time depends on your chosen method (pickup or mail).`,
      },
      {
        question: "What documents can I request online?",
        answer: `You can request transcripts, degree verification letters, enrollment certificates, and replacement diplomas through the Document Services portal.`,
      },
    ],
  },
  {
    title: "Tracer Surveys",
    icon: MdQuiz,
    faqs: [
      {
        question: "What is a tracer survey?",
        answer: `Tracer surveys help ASTU track graduate outcomes — employment status, further education, skills alignment with industry needs, and overall career progression. Your responses directly inform curriculum improvements.`,
      },
      {
        question: "Is the survey mandatory?",
        answer: `While not mandatory, your participation greatly helps the university maintain accreditation standards (ABET, ETA) and improve programs for future students. Most surveys take 5-10 minutes.`,
      },
      {
        question: "How often do I need to complete surveys?",
        answer: `Typically once per year around your graduation anniversary. You may receive additional targeted surveys based on specific accreditation cycles or program reviews.`,
      },
    ],
  },
  {
    title: "Events & Networking",
    icon: MdEventNote,
    faqs: [
      {
        question: "How do I register for events?",
        answer: `Browse the Events section in your dashboard or on the homepage. Click on an event to view details, then click "Register." You'll receive a confirmation and reminder emails.`,
      },
      {
        question: "Can I host an alumni event?",
        answer: `Absolutely! Contact the Alumni Relations office through the Help Center or email irccd@astu.edu.et with your proposal. Events can be virtual, on-campus, or regional meetups.`,
      },
      {
        question: "Are there virtual networking opportunities?",
        answer: `Yes! We host virtual networking sessions, webinars, and workshops throughout the year. Check the Events calendar and the "Workshops" section for upcoming sessions.`,
      },
    ],
  },
  {
    title: "Technical Support",
    icon: MdFeedback,
    faqs: [
      {
        question: "The website is not loading properly. What should I do?",
        answer: `Try clearing your browser cache and cookies, then refresh the page. If the issue persists, try a different browser (Chrome or Firefox recommended) or disable browser extensions.`,
      },
      {
        question: "I'm getting an error when submitting a form.",
        answer: `Ensure all required fields are filled and your internet connection is stable. Try submitting again. If the error continues, take a screenshot and email it to our support team.`,
      },
      {
        question: "How do I report a bug?",
        answer: `Use the "Report Issue" option in your dashboard's Help Center, or email support@astu.edu.et with a description of the issue, steps to reproduce, and any screenshots.`,
      },
    ],
  },
];

const departmentSections: HelpSection[] = [
  {
    title: "Department Portal",
    icon: MdSchool,
    faqs: [
      {
        question: "What data can I see as a department head?",
        answer:
          "The portal loads live data for your assigned department only: alumni directory, employment stats, insights derived from alumni profiles, and surveys you create or institutional milestones you can dispatch.",
      },
      {
        question: "Why is my dashboard empty?",
        answer:
          "Empty charts mean no alumni are linked to your department yet, or your account is not assigned a Department Head profile. Contact an administrator to assign your department.",
      },
      {
        question: "I forgot my password. What should I do?",
        answer:
          'On the login page, click "Forgot Password" and enter your registered email. Use the reset link from your inbox (check spam if needed).',
      },
    ],
  },
  {
    title: "Graduates & Employment",
    icon: MdWork,
    faqs: [
      {
        question: "How do I export graduate lists?",
        answer:
          "Open Graduates or Employment, apply filters if needed, then use Export to download a CSV of the current filtered results from the live department alumni API.",
      },
      {
        question: "Where do employment rates come from?",
        answer:
          "Rates and filters are computed from your department alumni records returned by /departments/my-alumni and /departments/my-stats — not demo numbers.",
      },
    ],
  },
  {
    title: "Surveys",
    icon: MdQuiz,
    faqs: [
      {
        question: "Who receives surveys I dispatch?",
        answer:
          "Dispatch targets eligible alumni in your department. The preview shows department alumni; the final count may be lower if some are already assigned or not yet eligible.",
      },
      {
        question: "Can I edit institutional milestone surveys?",
        answer:
          "You can view and dispatch 6/12/18/24-month milestones to your alumni. Creating, editing, or archiving those templates is reserved for Admin/Registrar. You fully manage your own custom department surveys.",
      },
    ],
  },
  {
    title: "Technical Support",
    icon: MdFeedback,
    faqs: [
      {
        question: "The website is not loading properly. What should I do?",
        answer:
          "Clear your browser cache, try Chrome or Firefox, and confirm you are signed in with a real department-head account (not a demo session).",
      },
      {
        question: "How do I report a bug?",
        answer:
          "Email support@astu.edu.et with the page, steps to reproduce, and screenshots. Include your department code if known.",
      },
    ],
  },
];

const quickLinks = [
  { label: "Registration Guide", icon: MdBookOnline, desc: "Step-by-step registration" },
  { label: "Job Search Tips", icon: MdWork, desc: "Optimize your job hunt" },
  { label: "Resume Templates", icon: MdDescription, desc: "Professional templates" },
  { label: "Mentorship Guide", icon: MdGroups, desc: "Get the most out of mentorship" },
  { label: "FAQ", icon: FaQuestionCircle, desc: "Common questions answered" },
];

const departmentQuickLinks = [
  { label: "Dashboard", icon: MdBookOnline, desc: "Live department outcomes" },
  { label: "Graduates", icon: MdSchool, desc: "Search and export alumni" },
  { label: "Employment", icon: MdWork, desc: "Placement analytics" },
  { label: "Surveys", icon: MdQuiz, desc: "Create and dispatch surveys" },
  { label: "FAQ", icon: FaQuestionCircle, desc: "Department help topics" },
];

export default function HelpCenter({
  isOpen,
  onClose,
  darkMode = false,
  audience = "default",
}: {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
  audience?: "default" | "department";
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openSection, setOpenSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeSections = audience === "department" ? departmentSections : sections;
  const activeQuickLinks = audience === "department" ? departmentQuickLinks : quickLinks;

  const toggleSection = (title: string) => {
    setOpenSection(openSection === title ? null : title);
  };

  const filteredSections = searchQuery.trim()
    ? activeSections
        .map((s) => ({
          ...s,
          faqs: s.faqs.filter(
            (f) =>
              f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              f.answer.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((s) => s.faqs.length > 0)
    : activeSections;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-12 pb-8 px-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative w-full max-w-3xl rounded-2xl shadow-2xl animate-[mega-menu-fade-in_150ms_ease-out_both] flex flex-col max-h-[90vh] ${
        darkMode ? 'bg-slate-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-5 border-b shrink-0 ${
          darkMode ? 'border-slate-700' : 'border-outline-variant'
        }`}>
          <div>
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-astu-navy'}`}>Help Center</h2>
            <p className={`text-sm mt-0.5 ${darkMode ? 'text-slate-400' : 'text-on-surface-variant/70'}`}>
              Find answers, guides, and support resources
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              darkMode ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-on-surface-variant hover:bg-astu-navy/5 hover:text-astu-navy'
            }`}
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className={`px-6 py-4 border-b shrink-0 ${
          darkMode ? 'border-slate-700/50' : 'border-outline-variant/50'
        }`}>
          <div className="relative">
            <HiMagnifyingGlass className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${
              darkMode ? 'text-slate-400' : 'text-on-surface-variant'
            }`} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm transition-all ${
                darkMode
                  ? 'border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20'
                  : 'border-outline-variant bg-surface-container-low focus:border-astu-navy focus:ring-2 focus:ring-astu-navy/20'
              } focus:outline-none`}
              placeholder="Search help topics..."
              type="text"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Quick Links */}
          <div className="mb-6">
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${
              darkMode ? 'text-slate-400' : 'text-on-surface-variant'
            }`}>
              Quick Links
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {activeQuickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.label}
                    onClick={() => {
                      const section = sections.find((s) =>
                        s.faqs.some((f) =>
                          f.question
                            .toLowerCase()
                            .includes(link.label.toLowerCase().replace("guide", "").trim())
                        )
                      );
                      if (section) {
                        setOpenSection(section.title);
                        setSearchQuery("");
                      }
                    }}
                    className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all group ${
                      darkMode
                        ? 'border-slate-700 hover:border-blue-500/30 hover:bg-blue-500/5'
                        : 'border-outline-variant/60 hover:border-astu-navy/30 hover:bg-astu-navy/5'
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${
                      darkMode ? 'text-blue-400/60 group-hover:text-blue-300' : 'text-astu-navy/60 group-hover:text-astu-navy'
                    }`} />
                    <div>
                      <p className={`text-sm font-bold ${darkMode ? 'text-blue-300' : 'text-astu-navy'}`}>{link.label}</p>
                      <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-on-surface-variant/60'}`}>{link.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {filteredSections.length === 0 ? (
            <div className="text-center py-12">
              <MdFeedback className={`h-12 w-12 mx-auto mb-3 ${darkMode ? 'text-slate-600' : 'text-on-surface-variant/30'}`} />
              <p className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-on-surface-variant'}`}>No results found</p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-slate-500' : 'text-on-surface-variant/60'}`}>
                Try different keywords or browse the categories below
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className={`mt-3 text-sm font-bold hover:underline ${
                  darkMode ? 'text-blue-400' : 'text-astu-navy'
                }`}
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSections.map((section) => {
                const Icon = section.icon;
                const isSectionOpen = openSection === section.title;
                return (
                  <div
                    key={section.title}
                    className={`rounded-xl border overflow-hidden ${
                      darkMode ? 'border-slate-700' : 'border-outline-variant/60'
                    }`}
                  >
                    <button
                      onClick={() => toggleSection(section.title)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors ${
                        darkMode ? 'hover:bg-white/5' : 'hover:bg-astu-navy/5'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${darkMode ? 'text-blue-400/60' : 'text-astu-navy/60'}`} />
                        <span className={`text-sm font-bold ${darkMode ? 'text-blue-300' : 'text-astu-navy'}`}>
                          {section.title}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          darkMode ? 'text-slate-400 bg-white/5' : 'text-on-surface-variant/50 bg-astu-navy/5'
                        }`}>
                          {section.faqs.length}
                        </span>
                      </span>
                      <HiChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          darkMode ? 'text-slate-400' : 'text-on-surface-variant'
                        } ${isSectionOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isSectionOpen && (
                      <div className={`border-t px-4 py-2 space-y-1 ${
                        darkMode ? 'border-slate-700/40' : 'border-outline-variant/40'
                      }`}>
                        {section.faqs.map((faq, i) => (
                          <div
                            key={i}
                            className={`rounded-lg px-3 py-3 transition-colors ${
                              darkMode ? 'hover:bg-white/5' : 'hover:bg-astu-navy/5'
                            }`}
                          >
                            <p className={`text-sm font-bold mb-1 ${
                              darkMode ? 'text-blue-300' : 'text-astu-navy'
                            }`}>
                              {faq.question}
                            </p>
                            <p className={`text-sm leading-relaxed whitespace-pre-line ${
                              darkMode ? 'text-slate-400' : 'text-on-surface-variant'
                            }`}>
                              {faq.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Contact Support */}
          <div className="mt-6 rounded-xl bg-gradient-to-r from-[#003366] to-[#003366]/90 p-5 text-white">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/70 mb-3">
              Still need help?
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <a
                href="mailto:irccd@astu.edu.et"
                className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3 hover:bg-white/20 transition-colors"
              >
                <MdEmail className="h-5 w-5 text-white/70" />
                <div>
                  <p className="text-sm font-bold">Email Support</p>
                  <p className="text-xs text-white/60">irccd@astu.edu.et</p>
                </div>
              </a>
              <a
                href="tel:+251221110000"
                className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3 hover:bg-white/20 transition-colors"
              >
                <MdPhone className="h-5 w-5 text-white/70" />
                <div>
                  <p className="text-sm font-bold">Phone Support</p>
                  <p className="text-xs text-white/60">+251-221-110000</p>
                </div>
              </a>
            </div>
            <p className="text-xs text-white/50 mt-3 text-center">
              Response time: within 1 business day
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
