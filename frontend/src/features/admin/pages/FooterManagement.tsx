import React, { useCallback, useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  Facebook,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';

interface FooterLink {
  id: string;
  label: string;
  href: string;
}

interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

const initialSections: FooterSection[] = [
  { id: 'FS-01', title: 'Portal Services', links: [
    { id: 'FL-01', label: 'Alumni', href: '/info/alumni-portal' },
    { id: 'FL-02', label: 'Employer', href: '/info/employer-portal' },
    { id: 'FL-03', label: 'Registrar', href: '/info/registrar-portal' },
    { id: 'FL-04', label: 'Department', href: '/info/department-portal' },
  ]},
  { id: 'FS-02', title: 'About ASTU', links: [
    { id: 'FL-05', label: 'University Overview', href: '/' },
    { id: 'FL-06', label: 'Impact & Accreditation', href: '#impact' },
    { id: 'FL-07', label: 'Research Highlights', href: '#research' },
  ]},
  { id: 'FS-03', title: 'Resources', links: [
    { id: 'FL-08', label: 'Events', href: '#events' },
    { id: 'FL-09', label: 'Workshops', href: '#workshops' },
    { id: 'FL-10', label: 'Career Opportunities', href: '#career-opportunities' },
    { id: 'FL-11', label: 'FAQ', href: '#faq' },
  ]},
  { id: 'FS-04', title: 'Connect', links: [
    { id: 'FL-12', label: 'Contact Us', href: '#contact' },
    { id: 'FL-13', label: 'Photo Gallery', href: '#gallery' },
    { id: 'FL-14', label: 'Community Feed', href: '#community' },
    { id: 'FL-15', label: 'Join Alumni', href: '/register' },
  ]},
];

const initialSocial: SocialLink[] = [
  { id: 'SL-01', platform: 'Facebook', url: 'https://web.facebook.com/adamaastu/', icon: 'Facebook' },
  { id: 'SL-02', platform: 'Telegram', url: 'https://t.me/Adama_STU_Almuni', icon: 'Send' },
  { id: 'SL-03', platform: 'LinkedIn', url: 'https://linkedin.com', icon: 'Linkedin' },
];

export default function FooterManagement() {
  const [sections, setSections] = useState<FooterSection[]>(initialSections);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(initialSocial);
  const [contactInfo, setContactInfo] = useState({
    address: 'Adama Science and Technology University, Adama, Ethiopia',
    poBox: 'P.O. Box: 1888 Adama, Ethiopia',
    phone: '+251-221-110000',
    email: 'irccd@astu.edu.et',
  });
  const [copyright, setCopyright] = useState('© 2026 Adama Science and Technology University. All rights reserved.');
  const [credit, setCredit] = useState('Designed by ASTU-BADA');
  const [editSection, setEditSection] = useState<string | null>(null);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkHref, setNewLinkHref] = useState('');

  const addLink = useCallback((sectionId: string) => {
    if (!newLinkLabel.trim() || !newLinkHref.trim()) { toast.error('Label and URL are required'); return; }
    setSections(prev => prev.map(s => s.id === sectionId ? {
      ...s, links: [...s.links, { id: `FL-${Date.now()}`, label: newLinkLabel.trim(), href: newLinkHref.trim() }]
    } : s));
    setNewLinkLabel('');
    setNewLinkHref('');
    toast.success('Link added');
  }, [newLinkLabel, newLinkHref]);

  const removeLink = useCallback((sectionId: string, linkId: string) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, links: s.links.filter(l => l.id !== linkId) } : s));
    toast.success('Link removed');
  }, []);

  const saveAll = useCallback(() => {
    toast.success('Footer settings saved successfully');
  }, []);

  return (
    <div className="space-y-6">
      <style>{`@keyframes fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } .fade-up { animation: fade-up 0.35s ease-out both; }`}</style>

      <AdminPageHeader
        title="Footer Management"
        subtitle="Edit footer navigation sections, social media links, contact information, and copyright."
        breadcrumbs={[{ label: 'CMS' }, { label: 'Footer' }]}
        actions={
          <button onClick={saveAll} className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] px-3 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all shadow-sm">
            <Save className="h-3.5 w-3.5" /> Save All
          </button>
        }
      />

      {/* Link Sections */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {sections.map(section => (
          <div key={section.id} className="fade-up rounded-[12px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">{section.title}</h3>
              <button onClick={() => setEditSection(editSection === section.id ? null : section.id)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 transition-all">
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-3 space-y-1.5">
              {section.links.map(link => (
                <div key={link.id} className="group flex items-center justify-between rounded-[8px] bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <span className="truncate">{link.label}</span>
                  <button onClick={() => removeLink(section.id, link.id)}
                    className="shrink-0 ml-1 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-all">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            {editSection === section.id && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                <input value={newLinkLabel} onChange={e => setNewLinkLabel(e.target.value)} placeholder="Link label" className="w-full rounded-[6px] border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-[#003580]" />
                <input value={newLinkHref} onChange={e => setNewLinkHref(e.target.value)} placeholder="URL or #id" className="w-full rounded-[6px] border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-[#003580]" />
                <button onClick={() => addLink(section.id)} className="inline-flex items-center gap-1 rounded-[6px] bg-[#003580] px-2 py-1.5 text-[10px] font-semibold text-white hover:brightness-110 transition-all">
                  <Plus className="h-3 w-3" /> Add Link
                </button>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Social + Contact + Copyright */}
      <section className="grid gap-4 xl:grid-cols-2">
        {/* Social Links */}
        <div className="fade-up rounded-[12px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h3 className="text-sm font-semibold text-slate-900">Social Media Links</h3>
          <p className="mt-1 text-xs text-slate-500">Manage social platform URLs displayed in the footer.</p>
          <div className="mt-4 space-y-3">
            {socialLinks.map(social => (
              <div key={social.id} className="flex items-center gap-3 rounded-[10px] border border-slate-100 bg-slate-50/50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#003580]/10 text-[#003580]">
                  {social.platform === 'Facebook' ? <Facebook className="h-4 w-4" /> :
                   social.platform === 'Telegram' ? <Send className="h-4 w-4" /> : <Linkedin className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">{social.platform}</p>
                  <input value={social.url} onChange={e => setSocialLinks(prev => prev.map(s => s.id === social.id ? { ...s, url: e.target.value } : s))}
                    className="mt-1 w-full rounded-[6px] border border-slate-200 px-2 py-1 text-xs outline-none focus:border-[#003580]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Copyright */}
        <div className="fade-up rounded-[12px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h3 className="text-sm font-semibold text-slate-900">Contact & Copyright</h3>
          <p className="mt-1 text-xs text-slate-500">Edit the contact details and footer branding.</p>
          <div className="mt-4 space-y-3">
            {[
              { label: 'Address', icon: MapPin, value: contactInfo.address, key: 'address' as const },
              { label: 'P.O. Box', icon: Globe, value: contactInfo.poBox, key: 'poBox' as const },
              { label: 'Phone', icon: Phone, value: contactInfo.phone, key: 'phone' as const },
              { label: 'Email', icon: Mail, value: contactInfo.email, key: 'email' as const },
            ].map(field => (
              <div key={field.key} className="flex items-center gap-3 rounded-[8px] bg-slate-50 px-3 py-2">
                <field.icon className="h-4 w-4 text-[#1D9E75] shrink-0" />
                <input value={field.value} onChange={e => setContactInfo(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="flex-1 bg-transparent text-sm text-slate-700 outline-none" />
              </div>
            ))}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500 w-20">Copyright:</span>
                <input value={copyright} onChange={e => setCopyright(e.target.value)} className="flex-1 rounded-[6px] border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-[#003580]" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500 w-20">Credit:</span>
                <input value={credit} onChange={e => setCredit(e.target.value)} className="flex-1 rounded-[6px] border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-[#003580]" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
