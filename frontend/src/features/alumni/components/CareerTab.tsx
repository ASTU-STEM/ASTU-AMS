import React, { useState } from 'react';
import { CareerEvent } from '../types/alumni.types';
import toast from 'react-hot-toast';

interface CareerTabProps {
  events: CareerEvent[];
  onRegisterEvent: (eventId: number) => void;
}

export const CareerTab: React.FC<CareerTabProps> = ({ events, onRegisterEvent }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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
      {/* Overview Intro Banner */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-astu-navy rounded-3xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-72 h-72 bg-white/5 rounded-full blur-2xl"></div>
        <div className="max-w-3xl relative z-10 space-y-4">
          <span className="px-3 py-1 bg-white/15 text-[#FFD700] text-xs font-bold uppercase tracking-wider rounded-full">ASTU Career Hub</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Accelerate Your Professional Growth 🚀</h2>
          <p className="text-md opacity-90 leading-relaxed">
            Gain exclusive access to specialized resources, resume enhancement checklists, and premier networking events designed to elevate ASTU alumni in modern engineering and tech industries.
          </p>
        </div>
      </section>

      {/* Main Grid: Resources (left) and Events (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Resources Checklist & Career Guides */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/60 space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-astu-navy">auto_stories</span>
              Career Resource Center
            </h3>

            <div className="space-y-4">
              {[
                {
                  title: 'Technical Resume Builder',
                  desc: 'Checklist to align engineering CVs with automated Applicant Tracking Systems.',
                  icon: 'description',
                  color: 'text-astu-red bg-red-50'
                },
                {
                  title: 'Live Coding Interview Prep',
                  desc: 'Comprehensive study lists covering arrays, system design, and algorithmic optimization.',
                  icon: 'code',
                  color: 'text-astu-green bg-green-50'
                },
                {
                  title: 'Fintech Cover Letters',
                  desc: 'Proven templates designed to secure interviews at regional payment processors.',
                  icon: 'contact_mail',
                  color: 'text-purple-600 bg-purple-50'
                },
                {
                  title: 'Salary Negotiation Guide',
                  desc: 'Frameworks to evaluate benefits packages and negotiate entry and senior packages.',
                  icon: 'paid',
                  color: 'text-amber-600 bg-amber-50'
                }
              ].map((res, idx) => (
                <div 
                  key={idx}
                  onClick={() => toast.success(`Mock PDF Resource: "${res.title}" opened for download.`)}
                  className="flex items-start gap-4 p-4 hover:bg-gray-50 border border-gray-100 rounded-2xl cursor-pointer transition-all hover:border-astu-navy/20 group"
                >
                  <div className={`p-2.5 rounded-xl ${res.color} group-hover:scale-105 transition-transform`}>
                    <span className="material-symbols-outlined">{res.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-astu-navy transition-colors">{res.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{res.desc}</p>
                  </div>
                </div>
              ))}
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
    </div>
  );
};
