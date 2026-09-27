import React, { useCallback, useEffect, useState } from 'react';
import {
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
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '../components/AdminPageHeader';
import footerCmsService, {
  FooterCmsConfig,
  FooterSection,
  FooterSocialLink,
  defaultFooterConfig,
} from '../services/footerCms.service';

export default function FooterManagement() {
  const [sections, setSections] = useState<FooterSection[]>(defaultFooterConfig.sections);
  const [socialLinks, setSocialLinks] = useState<FooterSocialLink[]>(defaultFooterConfig.socialLinks);
  const [contactInfo, setContactInfo] = useState(defaultFooterConfig.contactInfo);
  const [copyright, setCopyright] = useState(defaultFooterConfig.copyright);
  const [credit, setCredit] = useState(defaultFooterConfig.credit);
  const [newsletterTitle, setNewsletterTitle] = useState(defaultFooterConfig.newsletterTitle || '');
  const [newsletterSubtitle, setNewsletterSubtitle] = useState(defaultFooterConfig.newsletterSubtitle || '');
  const [editSection, setEditSection] = useState<string | null>(null);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkHref, setNewLinkHref] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const local = footerCmsService.getSettings();
    applyConfig(local);
    footerCmsService.fetchFromApi().then(applyConfig).catch(() => undefined);
  }, []);

  const applyConfig = (config: FooterCmsConfig) => {
    if (config.sections?.length) setSections(config.sections);
    if (config.socialLinks?.length) setSocialLinks(config.socialLinks);
    if (config.contactInfo) setContactInfo(config.contactInfo);
    if (config.copyright) setCopyright(config.copyright);
    if (config.credit) setCredit(config.credit);
    if (config.newsletterTitle) setNewsletterTitle(config.newsletterTitle);
    if (config.newsletterSubtitle) setNewsletterSubtitle(config.newsletterSubtitle);
  };

  const addLink = useCallback((sectionId: string) => {
    if (!newLinkLabel.trim() || !newLinkHref.trim()) {
      toast.error('Label and URL are required');
      return;
    }
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              links: [...s.links, { id: `FL-${Date.now()}`, label: newLinkLabel.trim(), href: newLinkHref.trim() }],
            }
          : s
      )
    );
    setNewLinkLabel('');
    setNewLinkHref('');
    toast.success('Link added');
  }, [newLinkLabel, newLinkHref]);

  const removeLink = useCallback((sectionId: string, linkId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, links: s.links.filter((l) => l.id !== linkId) } : s))
    );
    toast.success('Link removed');
  }, []);

  const saveAll = useCallback(() => {
    setSaving(true);
    const config: FooterCmsConfig = {
      sections,
      socialLinks,
      contactInfo,
      copyright,
      credit,
      newsletterTitle,
      newsletterSubtitle,
    };
    footerCmsService.saveSettings(config);
    toast.success('Footer settings saved — homepage will use this content.');
    setSaving(false);
  }, [sections, socialLinks, contactInfo, copyright, credit, newsletterTitle, newsletterSubtitle]);

  return (
    <div className="space-y-6">
      <style>{`@keyframes fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } .fade-up { animation: fade-up 0.35s ease-out both; }`}</style>

      <AdminPageHeader
        title="Footer Management"
        subtitle="Edit footer navigation, social links, and contact info. Changes appear on the public homepage."
        breadcrumbs={[{ label: 'CMS' }, { label: 'Footer' }]}
        actions={
          <button
            onClick={saveAll}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] px-3 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all shadow-sm disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" /> {saving ? 'Saving…' : 'Save All'}
          </button>
        }
      />

      <section className="fade-up rounded-[12px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Newsletter Banner</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            value={newsletterTitle}
            onChange={(e) => setNewsletterTitle(e.target.value)}
            placeholder="Newsletter title"
            className="rounded-[6px] border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 text-sm outline-none focus:border-[#003580]"
          />
          <input
            value={newsletterSubtitle}
            onChange={(e) => setNewsletterSubtitle(e.target.value)}
            placeholder="Newsletter subtitle"
            className="rounded-[6px] border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 text-sm outline-none focus:border-[#003580]"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {sections.map((section) => (
          <div
            key={section.id}
            className="fade-up rounded-[12px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{section.title}</h3>
              <button
                onClick={() => setEditSection(editSection === section.id ? null : section.id)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-3 space-y-1.5">
              {section.links.map((link) => (
                <div
                  key={link.id}
                  className="group flex items-center justify-between rounded-[8px] bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-600 dark:text-slate-300"
                >
                  <span className="truncate">{link.label}</span>
                  <button
                    onClick={() => removeLink(section.id, link.id)}
                    className="shrink-0 ml-1 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-all"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            {editSection === section.id && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <input
                  value={newLinkLabel}
                  onChange={(e) => setNewLinkLabel(e.target.value)}
                  placeholder="Link label"
                  className="w-full rounded-[6px] border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-2 py-1.5 text-xs outline-none focus:border-[#003580]"
                />
                <input
                  value={newLinkHref}
                  onChange={(e) => setNewLinkHref(e.target.value)}
                  placeholder="URL or #id"
                  className="w-full rounded-[6px] border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-2 py-1.5 text-xs outline-none focus:border-[#003580]"
                />
                <button
                  onClick={() => addLink(section.id)}
                  className="inline-flex items-center gap-1 rounded-[6px] bg-[#003580] px-2 py-1.5 text-[10px] font-semibold text-white hover:brightness-110 transition-all"
                >
                  <Plus className="h-3 w-3" /> Add Link
                </button>
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="fade-up rounded-[12px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Social Media Links</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Manage social platform URLs displayed in the footer.</p>
          <div className="mt-4 space-y-3">
            {socialLinks.map((social) => (
              <div
                key={social.id}
                className="flex items-center gap-3 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#003580]/10 text-[#003580]">
                  {social.platform === 'Facebook' ? (
                    <Facebook className="h-4 w-4" />
                  ) : social.platform === 'Telegram' ? (
                    <Send className="h-4 w-4" />
                  ) : (
                    <Linkedin className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{social.platform}</p>
                  <input
                    value={social.url}
                    onChange={(e) =>
                      setSocialLinks((prev) =>
                        prev.map((s) => (s.id === social.id ? { ...s, url: e.target.value } : s))
                      )
                    }
                    className="mt-1 w-full rounded-[6px] border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-2 py-1 text-xs outline-none focus:border-[#003580]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fade-up rounded-[12px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Contact &amp; Copyright</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Edit the contact details and footer branding.</p>
          <div className="mt-4 space-y-3">
            {(
              [
                { label: 'Address', icon: MapPin, value: contactInfo.address, key: 'address' as const },
                { label: 'P.O. Box', icon: Globe, value: contactInfo.poBox, key: 'poBox' as const },
                { label: 'Phone', icon: Phone, value: contactInfo.phone, key: 'phone' as const },
                { label: 'Email', icon: Mail, value: contactInfo.email, key: 'email' as const },
              ] as const
            ).map((field) => (
              <div key={field.key} className="flex items-center gap-3 rounded-[8px] bg-slate-50 dark:bg-slate-800 px-3 py-2">
                <field.icon className="h-4 w-4 text-[#1D9E75] shrink-0" />
                <input
                  value={field.value}
                  onChange={(e) => setContactInfo((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>
            ))}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-20">Copyright:</span>
                <input
                  value={copyright}
                  onChange={(e) => setCopyright(e.target.value)}
                  className="flex-1 rounded-[6px] border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-2 py-1.5 text-xs outline-none focus:border-[#003580]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-20">Credit:</span>
                <input
                  value={credit}
                  onChange={(e) => setCredit(e.target.value)}
                  className="flex-1 rounded-[6px] border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-2 py-1.5 text-xs outline-none focus:border-[#003580]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
