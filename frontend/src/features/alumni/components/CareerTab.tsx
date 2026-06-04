import React, { useState } from 'react';
import { CareerEvent, JobMatch, SkillPathway, Mentor } from '../types/alumni.types';
import toast from 'react-hot-toast';
import { CalendarDays, MapPin, Users, TrendingUp, Award, FileText, BarChart3, Target, CheckCircle2, AlertCircle, BookOpen, Briefcase, GraduationCap, Rocket, Lightbulb, Code2, Cloud, Shield, Smartphone, Star, ThumbsUp, ExternalLink } from 'lucide-react';
import { AnalyticsChart } from '../../../components/AnalyticsChart';
import { getSkillPathways, getJobMatches, getMentors } from '../services/mockAlumniData';

interface CareerTabProps {
  events: CareerEvent[];
  onRegisterEvent: (eventId: number) => void;
}

export const CareerTab: React.FC<CareerTabProps> = ({ events, onRegisterEvent }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [showAllMentors, setShowAllMentors] = useState(false);

  const featuredJobs = getJobMatches().slice(0, showAllJobs ? undefined : 3);
  const featuredMentors = getMentors().slice(0, showAllMentors ? undefined : 3);

  const [selectedPathway, setSelectedPathway] = useState<number | null>(null);
  const skillPathways = getSkillPathways();

  const pathwayIcons: Record<string, React.ElementType> = {
    'Full-Stack Web Development': Code2,
    'AI & Machine Learning Engineering': Lightbulb,
    'Cloud & DevOps Engineering': Cloud,
    'Mobile App Development': Smartphone,
    'Cybersecurity Fundamentals': Shield,
  };

  const categories = ['All', 'Career Fair', 'Reunion', 'Workshop'];

  const filteredEvents = selectedCategory === 'All' 
    ? events 
    : events.filter(e => e.category === selectedCategory);

  const handleRegister = (eventId: number, title: string) => {
    onRegisterEvent(eventId);
    toast.success(`Successfully registered for: ${title}!`);
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-astu-navy via-indigo-900 to-purple-900 p-8 md:p-10 text-white shadow-xl">
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-astu-green/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/15 text-[#FFD700] text-xs font-bold uppercase tracking-wider rounded-full">ASTU Career Hub</span>
            <span className="px-3 py-1 bg-astu-green/20 text-astu-green text-xs font-bold uppercase tracking-wider rounded-full">Career Center</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Accelerate Your Professional Growth</h2>
          <p className="text-md opacity-90 leading-relaxed">
            Access premium career resources, skill development pathways, and exclusive networking events designed for ASTU engineering graduates in modern industries.
          </p>
        </div>
      </section>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-astu-navy/10 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-astu-navy" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Job Matches Available</p>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">127+</p>
          <p className="text-[10px] text-astu-green font-semibold mt-1">Updated daily from 500+ employers</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-astu-green/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-astu-green" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Skill Pathways</p>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">8</p>
          <p className="text-[10px] text-astu-navy font-semibold mt-1">Tech specialization tracks</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Alumni Mentors Online</p>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">347</p>
          <p className="text-[10px] text-purple-600 font-semibold mt-1">Ready for mentorship</p>
        </div>
      </div>

      {/* Main Grid: Resources (left) and Events (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Resources Checklist & Career Guides */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60 space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-astu-navy" />
              Career Resource Center
            </h3>

            <div className="space-y-4">
              {[
                {
                  title: 'Technical Resume Builder',
                  desc: 'ATS-optimized templates for engineering roles, with keyword guidance.',
                  icon: FileText,
                  color: 'text-astu-red',
                  stats: '12 pages',
                  downloads: '1.2K'
                },
                {
                  title: 'Live Coding Interview Prep',
                  desc: 'System design and algorithm problems from top tech companies.',
                  icon: BarChart3,
                  color: 'text-astu-green',
                  stats: '48 challenges',
                  downloads: '890'
                },
                {
                  title: 'Fintech Cover Letters',
                  desc: 'Templates for Chapa, Telebirr, and international fintech roles.',
                  icon: Award,
                  color: 'text-purple-600',
                  stats: '6 templates',
                  downloads: '654'
                },
                {
                  title: 'Salary Negotiation Guide',
                  desc: 'Negotiation frameworks for Ethiopian and remote positions.',
                  icon: Target,
                  color: 'text-amber-600',
                  stats: '8 sections',
                  downloads: '2.1K'
                }
              ].map((res, idx) => (
                <div 
                  key={idx}
                  onClick={() => toast.success(`Downloaded: "${res.title}" (${res.stats})`)}
                  className="flex items-start gap-4 p-4 hover:bg-gray-50 border border-gray-100 rounded-xl cursor-pointer transition-all hover:border-astu-navy/20 group"
                >
                  <div className={`p-2.5 rounded-xl bg-gray-50 group-hover:scale-105 transition-transform`}>
                    <res.icon className={`h-5 w-5 ${res.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 group-hover:text-astu-navy transition-colors">{res.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{res.desc}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px]">
                      <span className="text-astu-navy font-semibold">{res.stats}</span>
                      <span className="text-gray-400">{res.downloads} downloads</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Career Progress Tracker */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-astu-navy" />
              Career Readiness Score
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">Profile Strength</span>
                <span className="text-xs font-bold text-astu-navy">68%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-full w-2/3 bg-gradient-to-r from-astu-navy to-astu-green rounded-full"></div>
              </div>
              <p className="text-[10px] text-gray-500">Add skills and experience to boost employer visibility</p>
            </div>
          </div>
        </div>

        {/* Right Column: Events Portal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/60 space-y-6">
            
            {/* Header and Filter Category Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Alumni Events Portal</h3>
                <p className="text-sm text-gray-600">Register for exclusive recruitment workshops and technology reunions</p>
              </div>
              <div className="flex gap-1.5 overflow-x-auto py-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all border whitespace-nowrap ${
                      selectedCategory === cat 
                        ? 'bg-astu-navy border-astu-navy text-white shadow-md' 
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Event Cards Listing */}
            <div className="space-y-6">
              {filteredEvents.map(event => (
                <div 
                  key={event.id}
                  className="flex flex-col md:flex-row gap-6 p-5 border border-gray-200/70 rounded-2xl bg-gradient-to-r from-gray-50/50 to-white hover:shadow-md transition-all group"
                >
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="w-full md:w-44 h-32 object-cover rounded-xl shadow-sm group-hover:opacity-90 transition-opacity"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 bg-astu-navy/10 text-astu-navy text-[10px] font-extrabold uppercase tracking-widest rounded">
                          {event.category}
                        </span>
                        {event.registered && (
                          <span className="flex items-center gap-1 text-xs font-bold text-astu-green bg-astu-green/10 px-2.5 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Registered
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 group-hover:text-astu-navy transition-colors">{event.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">{event.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-2 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">calendar_month</span>
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">location_on</span>
                          {event.location.split(',')[0]}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRegister(event.id, event.title)}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          event.registered 
                            ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'bg-astu-navy hover:bg-astu-navy/90 text-white hover:scale-105'
                        }`}
                        disabled={event.registered}
                      >
                        {event.registered ? 'Registered' : 'Register Now'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredEvents.length === 0 && (
                <div className="p-8 text-center text-gray-500 italic">
                  No upcoming events listed in the "{selectedCategory}" category. Check back later!
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Featured Jobs Section */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/60 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-astu-navy" />
              Featured Job Openings
            </h3>
            <p className="text-sm text-gray-600 mt-1">Top matches based on your profile and skills</p>
          </div>
          <button
            onClick={() => setShowAllJobs(!showAllJobs)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-astu-navy hover:bg-astu-navy/5 border border-astu-navy/20 transition-all"
          >
            {showAllJobs ? 'Show Less' : 'View All'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => toast.success(`Applied to "${job.title}" — check Jobs tab for details!`)}
              className="rounded-2xl border border-gray-200 p-5 hover:border-astu-navy/30 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-astu-green/10">
                  <Briefcase className="h-5 w-5 text-astu-green" />
                </div>
                <span className="px-2 py-0.5 bg-astu-green/10 text-astu-green text-[10px] font-bold rounded-full">{job.matchPercentage}% match</span>
              </div>
              <h4 className="font-bold text-gray-900 group-hover:text-astu-navy transition-colors">{job.title}</h4>
              <p className="text-xs text-gray-500 mt-1">{job.company} • {job.location}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {job.skills.slice(0, 3).map((skill, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md">{skill}</span>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <span className="text-xs font-bold text-astu-green">{job.salary}</span>
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  Quick Apply
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Mentors Section */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/60 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Star className="h-5 w-5 text-astu-navy" />
              Top Alumni Mentors
            </h3>
            <p className="text-sm text-gray-600 mt-1">Connect with experienced alumni in your field</p>
          </div>
          <button
            onClick={() => setShowAllMentors(!showAllMentors)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-astu-navy hover:bg-astu-navy/5 border border-astu-navy/20 transition-all"
          >
            {showAllMentors ? 'Show Less' : 'View All'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredMentors.map((mentor) => (
            <div
              key={mentor.id}
              onClick={() => toast.success(`Mentorship request sent to ${mentor.name}!`)}
              className="rounded-2xl border border-gray-200 p-5 hover:border-astu-navy/30 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-astu-navy/10"
                />
                <div>
                  <h4 className="font-bold text-gray-900 group-hover:text-astu-navy transition-colors">{mentor.name}</h4>
                  <p className="text-xs text-gray-500">{mentor.title} at {mentor.company}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{mentor.bio}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="flex items-center gap-1 text-xs text-amber-600">
                  <Star className="h-3 w-3 fill-amber-500" />
                  {mentor.rating} ({mentor.reviewCount})
                </span>
                <span className="flex items-center gap-1 text-[10px] text-astu-green font-bold">
                  <Users className="h-3 w-3" />
                  {mentor.mentees}+ mentees
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skill Pathways Section */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/60 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-astu-navy" />
            Skill Development Pathways
          </h3>
          <p className="text-sm text-gray-600 mt-1">Recommended learning tracks based on your profile and market demand</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillPathways.map((pathway) => {
            const IconComponent = pathwayIcons[pathway.title] || Code2;
            return (
              <div
                key={pathway.id}
                onClick={() => setSelectedPathway(selectedPathway === pathway.id ? null : pathway.id)}
                className={`rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200 ${
                  selectedPathway === pathway.id
                    ? 'border-astu-navy bg-astu-navy/5 shadow-md'
                    : 'border-gray-200 hover:border-astu-navy/30 bg-white hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-astu-navy/10">
                    <IconComponent className="h-6 w-6 text-astu-navy" />
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    pathway.level === 'beginner' ? 'bg-green-100 text-green-700' :
                    pathway.level === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {pathway.level}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{pathway.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{pathway.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {pathway.skills.slice(0, 4).map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-md">{skill}</span>
                  ))}
                  {pathway.skills.length > 4 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[10px] font-bold rounded-md">+{pathway.skills.length - 4}</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    {pathway.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {pathway.popularity}% match
                  </span>
                </div>

                {selectedPathway === pathway.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-gray-500 mb-2">All Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {pathway.skills.map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 bg-astu-navy/10 text-astu-navy text-[10px] font-bold rounded-md">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-gray-500 mb-2">Target Roles</p>
                      <div className="space-y-1">
                        {pathway.jobs.map((job, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-astu-green"></span>
                            {job}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toast.success(`Enrolled in ${pathway.title} pathway!`); }}
                      className="w-full py-2.5 bg-gradient-to-r from-astu-navy to-[#004d99] text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all"
                    >
                      Enroll in Pathway
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
