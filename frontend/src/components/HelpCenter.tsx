import React, { useState } from "react";
import { HiChevronDown, HiMagnifyingGlass, HiXMark } from "react-icons/hi2";
import {
  MdEmail,
  MdPhone,
  MdBookOnline,
  MdSchool,
  MdWork,
  MdDescription,
  MdGroups,
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
    icon: MdGroups,
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

const quickLinks = [
  { label: "Registration Guide", icon: MdBookOnline, desc: "Step-by-step registration" },
  { label: "Job Search Tips", icon: MdWork, desc: "Optimize your job hunt" },
  { label: "Resume Templates", icon: MdDescription, desc: "Professional templates" },
  { label: "Mentorship Guide", icon: MdGroups, desc: "Get the most out of mentorship" },
  { label: "FAQ", icon: FaQuestionCircle, desc: "Common questions answered" },
];

export default function HelpCenter({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openSection, setOpenSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSection = (title: string) => {
    setOpenSection(openSection === title ? null : title);
  };

  const filteredSections = searchQuery.trim()
    ? sections
      .map((s) => ({
        ...s,
        faqs: s.faqs.filter(
          (f) =>
            f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((s) => s.faqs.length > 0)
    : sections;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-12 pb-8 px-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl animate-[mega-menu-fade-in_150ms_ease-out_both] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant shrink-0">
          <div>
            <h2 className="text-xl font-bold text-astu-navy">Help Center</h2>
            <p className="text-sm text-on-surface-variant/70 mt-0.5">
              Find answers, guides, and support resources
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-astu-navy/5 text-on-surface-variant hover:text-astu-navy transition-colors"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-outline-variant/50 shrink-0">
          <div className="relative">
            <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-outline-variant bg-surface-container-low py-3 pl-11 pr-4 text-sm focus:border-astu-navy focus:outline-none focus:ring-2 focus:ring-astu-navy/20 transition-all"
              placeholder="Search help topics..."
              type="text"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Quick Links */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">
              Quick Links
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickLinks.map((link) => {
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
                    className="flex items-start gap-3 rounded-xl border border-outline-variant/60 p-3 text-left hover:border-astu-navy/30 hover:bg-astu-navy/5 transition-all group"
                  >
                    <Icon className="h-5 w-5 text-astu-navy/60 group-hover:text-astu-navy shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-astu-navy">{link.label}</p>
                      <p className="text-xs text-on-surface-variant/60">{link.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {filteredSections.length === 0 ? (
            <div className="text-center py-12">
              <MdFeedback className="h-12 w-12 text-on-surface-variant/30 mx-auto mb-3" />
              <p className="text-on-surface-variant font-semibold">No results found</p>
              <p className="text-sm text-on-surface-variant/60 mt-1">
                Try different keywords or browse the categories below
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 text-sm font-bold text-astu-navy hover:underline"
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
                    className="rounded-xl border border-outline-variant/60 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-astu-navy/5 transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-astu-navy/60" />
                        <span className="text-sm font-bold text-astu-navy">
                          {section.title}
                        </span>
                        <span className="text-[11px] text-on-surface-variant/50 font-semibold bg-astu-navy/5 px-2 py-0.5 rounded-full">
                          {section.faqs.length}
                        </span>
                      </span>
                      <HiChevronDown
                        className={`h-4 w-4 text-on-surface-variant transition-transform duration-200 ${isSectionOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                    {isSectionOpen && (
                      <div className="border-t border-outline-variant/40 px-4 py-2 space-y-1">
                        {section.faqs.map((faq, i) => (
                          <div
                            key={i}
                            className="rounded-lg px-3 py-3 hover:bg-astu-navy/5 transition-colors"
                          >
                            <p className="text-sm font-bold text-astu-navy mb-1">
                              {faq.question}
                            </p>
                            <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
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
          <div className="mt-6 rounded-xl bg-gradient-to-r from-astu-navy to-astu-navy/90 p-5 text-white">
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
