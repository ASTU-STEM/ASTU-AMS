import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, MapPin, Briefcase, Phone, Mail, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";

import electricLabs from "../assets/images/electriclabs.jpeg";
import gc7 from "../assets/images/gc7.jpg";
import arcImage from "../assets/images/arc.jpg";

const featuredEmployers = [
  { name: "Ethio Telecom", area: "Telecom & Cloud", openings: "Graduate roles and internships", image: electricLabs },
  { name: "Ethiopian Airlines", area: "Aviation Technology", openings: "Internship tracks", image: gc7 },
  { name: "INSA", area: "Cybersecurity", openings: "Research placements", image: arcImage },
  { name: "Huawei Ethiopia", area: "Network Engineering", openings: "Certification paths", image: arcImage },
  { name: "Safaricom", area: "Mobile Financial Services", openings: "Technology roles", image: electricLabs },
  { name: "Commercial Bank of Ethiopia", area: "Banking Technology", openings: "Graduate openings", image: gc7 },
];

const partnerCompanies = [
  { name: "Ethio Telecom", industry: "Telecom & Cloud", location: "Ethiopia" },
  { name: "INSA", industry: "Cybersecurity", location: "Addis Ababa" },
  { name: "Ethiopian Airlines", industry: "Aviation Technology", location: "Ethiopia" },
  { name: "Safaricom", industry: "Mobile Services", location: "Ethiopia" },
  { name: "Huawei Ethiopia", industry: "Network Engineering", location: "Addis Ababa" },
  { name: "Commercial Bank of Ethiopia", industry: "Banking", location: "Ethiopia" },
  { name: "Meta Finetec PLC", industry: "Technology Solutions", location: "Addis Ababa" },
  { name: "Summit Devs", industry: "Software Development", location: "Adama" },
];

const faqItems = [
  { question: "Who can use ASTU-AMS?", answer: "Verified alumni, employers, registrar teams, departments, and system administrators each access role-specific services." },
  { question: "How are tracer studies used?", answer: "Responses support employment analytics, skill-gap reviews, curriculum updates, and accreditation evidence." },
  { question: "Can employers register events?", answer: "Employer partners can coordinate job posts, internships, campus recruitment events, interviews, and feedback reports." },
  { question: "How do I verify alumni credentials?", answer: "Registrar officers can validate alumni credentials against SIS records through the verification centre." },
  { question: "What services are available for departments?", answer: "Department heads can monitor graduate employment outcomes, identify skill gaps, and generate accreditation-ready reports." },
  { question: "How do alumni update their profiles?", answer: "Alumni can maintain their professional profiles, complete tracer surveys, and access verified job listings after login." },
];

export default function EmployersPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    const nodes = document.querySelectorAll(".reveal");
    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="app-shell min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-200">
      <Navbar />

      <header className="border-b border-outline-variant bg-[var(--bg-card)] dark:bg-slate-900/90 dark:border-slate-800 transition-colors">
        <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Employer Network</p>
          <h1 className="mt-2 text-3xl font-bold text-astu-navy dark:text-white">Featured Employers and Partners</h1>
          <p className="mt-2 max-w-2xl text-sm text-on-surface-variant dark:text-slate-400">
            Organisations collaborating with ASTU on graduate recruitment, internships, and industry feedback.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/partners")}
              className="inline-flex items-center gap-2 rounded-lg bg-astu-navy px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 shadow-sm"
            >
              Partner with ASTU <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("/employers/register")}
              className="inline-flex items-center gap-2 rounded-lg border border-outline-variant dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-astu-navy dark:text-blue-300 hover:bg-surface-container-low dark:hover:bg-slate-800"
            >
              Register as Employer
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-12 md:px-8">
        <section className="mb-16">
          <div className="mb-8 reveal">
            <h2 className="text-2xl font-bold text-astu-navy">Featured Employers</h2>
            <p className="mt-2 text-sm text-on-surface-variant">Leading organisations hiring ASTU graduates</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredEmployers.map((employer) => (
              <article key={employer.name} className="reveal rounded-xl border border-outline-variant bg-[var(--bg-card)] p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                {employer.image && (
                  <img src={employer.image} alt={employer.name} className="h-40 w-full rounded-lg object-cover" />
                )}
                <div className="mt-4">
                  <h3 className="font-semibold text-astu-navy">{employer.name}</h3>
                  <p className="mt-1 text-xs text-on-surface-variant">{employer.area}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <Briefcase className="h-3 w-3 text-astu-green" />
                    <span className="text-on-surface-variant">{employer.openings}</span>
                  </div>
                  <button
                    onClick={() => navigate("/partners")}
                    className="mt-4 rounded-md bg-astu-navy px-3 py-2 text-xs font-semibold text-white hover:brightness-110"
                  >
                    Learn About Partnership
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-8 reveal">
            <h2 className="text-2xl font-bold text-astu-navy">Partner Companies</h2>
            <p className="mt-2 text-sm text-on-surface-variant">Institutional partners supporting employability, accreditation feedback, internships, and research collaboration.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {partnerCompanies.map((company) => (
              <div key={company.name} className="reveal rounded-xl border border-outline-variant bg-[var(--bg-card)] p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-lg bg-astu-navy/10 mb-3">
                  <Building2 className="h-7 w-7 text-astu-navy" />
                </div>
                <h4 className="font-semibold text-astu-navy">{company.name}</h4>
                <p className="mt-1 text-xs text-on-surface-variant">{company.industry}</p>
                <div className="mt-2 flex items-center justify-center gap-1 text-xs text-on-surface-variant">
                  <MapPin className="h-3 w-3" />
                  <span>{company.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-8 reveal">
            <h2 className="text-2xl font-bold text-astu-navy">Frequently Asked Questions</h2>
            <p className="mt-2 text-sm text-on-surface-variant">Common questions about ASTU-AMS</p>
          </div>
          <div className="max-w-4xl space-y-4">
            {faqItems.map((item, idx) => (
              <div key={idx} className="reveal border-b border-outline-variant pb-4">
                <h3 className="font-semibold text-astu-navy">{item.question}</h3>
                <p className="mt-2 text-sm text-on-surface-variant">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-8 reveal">
            <h2 className="text-2xl font-bold text-astu-navy">Contact Us</h2>
            <p className="mt-2 text-sm text-on-surface-variant">Connect with the ASTU Alumni Relations Office</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            <div className="reveal text-center p-6 rounded-xl border border-outline-variant bg-[var(--bg-card)]">
              <MapPin className="h-8 w-8 mx-auto text-astu-navy mb-3" />
              <h4 className="font-semibold text-astu-navy">Address</h4>
              <p className="mt-1 text-xs text-on-surface-variant">Adama, Oromia, Ethiopia</p>
            </div>
            <div className="reveal text-center p-6 rounded-xl border border-outline-variant bg-[var(--bg-card)]">
              <Phone className="h-8 w-8 mx-auto text-astu-navy mb-3" />
              <h4 className="font-semibold text-astu-navy">Phone</h4>
              <p className="mt-1 text-xs text-on-surface-variant">+251-221-110000</p>
            </div>
            <div className="reveal text-center p-6 rounded-xl border border-outline-variant bg-[var(--bg-card)]">
              <Mail className="h-8 w-8 mx-auto text-astu-navy mb-3" />
              <h4 className="font-semibold text-astu-navy">Email</h4>
              <p className="mt-1 text-xs text-on-surface-variant">irccd@astu.edu.et</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
