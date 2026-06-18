import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, ChevronDown } from "lucide-react";
import {
  LANGUAGE_NAMES,
  LANGUAGE_SHORT,
  LANGUAGE_FLAGS,
  type SupportedLanguage,
} from "../i18n/i18n";

interface LanguageSwitcherProps {
  variant?: "default" | "minimal";
  align?: "left" | "right";
}

const LANGUAGES: SupportedLanguage[] = ["en", "am", "om"];

function CurrentFlag({ lng }: { lng: SupportedLanguage }) {
  const flags: Record<SupportedLanguage, string> = {
    en: "🇬🇧",
    am: "🇪🇹",
    om: "🇪🇹",
  };
  return <span className="text-base leading-none">{flags[lng] || "🌐"}</span>;
}

export default function LanguageSwitcher({
  variant = "default",
  align = "right",
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = (i18n.language?.split("-")[0] || "en") as SupportedLanguage;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lng: SupportedLanguage) => {
    i18n.changeLanguage(lng);
    setOpen(false);
    if (lng === "am") {
      document.documentElement.style.fontFamily =
        "'Noto Sans Ethiopic', 'Nyala', sans-serif";
    } else {
      document.documentElement.style.fontFamily = "";
    }
  };

  const sharedDropdown = (
    <div
      className={`absolute top-full mt-1.5 z-50 min-w-[170px] overflow-hidden rounded-xl border shadow-xl ${
        align === "right" ? "right-0" : "left-0"
      } ${
        variant === "minimal"
          ? "border-slate-200/80 bg-white dark:border-slate-700 dark:bg-[#1a1f2e]"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="p-1">
        {LANGUAGES.map((lng) => {
          const isActive = currentLang === lng;
          return (
            <button
              key={lng}
              onClick={() => changeLanguage(lng)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                isActive
                  ? variant === "minimal"
                    ? "bg-blue-50 font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                    : "bg-[#003580]/5 font-semibold text-[#003580]"
                  : variant === "minimal"
                    ? "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold uppercase leading-none tracking-wide">
                {LANGUAGE_SHORT[lng]}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {LANGUAGE_NAMES[lng]}
                </span>
              </div>
              {isActive && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (variant === "minimal") {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          title="Switch language"
        >
          <Globe className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{LANGUAGE_SHORT[currentLang]}</span>
          <ChevronDown
            className={`h-3 w-3 text-white/50 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
        {open && sharedDropdown}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {LANGUAGE_SHORT[currentLang]}
          </span>
        </div>
        <span className="text-slate-400">|</span>
        <span>{LANGUAGE_NAMES[currentLang]}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && sharedDropdown}
    </div>
  );
}
