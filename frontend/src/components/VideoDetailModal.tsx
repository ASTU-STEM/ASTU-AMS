import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowRight,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileText,
  ListVideo,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  PlayCircle,
  Radio,
  RotateCcw,
  RotateCw,
  Share2,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
  X,
  Youtube,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ShareModal, { ShareItem } from './ShareModal';

export interface VideoSpeaker {
  name: string;
  title: string;
  role?: string;
  avatar?: string;
}

export interface VideoChapter {
  time: string;
  seconds: number;
  title: string;
  desc?: string;
}

export interface VideoItem {
  id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  duration?: string;
  category?: string;
  link?: string;
  date?: string;
  views?: string;
  venue?: string;
  producer?: string;
  speakers?: VideoSpeaker[];
  chapters?: VideoChapter[];
  transcript?: string;
  highlights?: string[];
  tags?: string[];
}

interface VideoDetailModalProps {
  video: VideoItem | null;
  onClose: () => void;
  onSelectRelatedVideo?: (video: VideoItem) => void;
  relatedVideos?: VideoItem[];
}

// Convert "MM:SS" or "HH:MM:SS" string to total seconds
function parseTimeToSeconds(timeStr?: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map((p) => parseInt(p, 10));
  if (parts.length === 2) {
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  }
  if (parts.length === 3) {
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }
  return 0;
}

// Format seconds into "MM:SS"
function formatSecondsToTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const getEmbedVideoUrl = (link?: string) => {
  if (!link) return null;
  const ytMatch = link.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
  }
  const vimeoMatch = link.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }
  return link;
};

export default function VideoDetailModal({
  video,
  onClose,
  onSelectRelatedVideo,
  relatedVideos = [],
}: VideoDetailModalProps) {
  // Player mode: 'stream' (Direct Interactive Campus HD Stream) | 'embed' (External YouTube/Vimeo)
  const [playerMode, setPlayerMode] = useState<'stream' | 'embed'>('stream');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'chapters' | 'transcript' | 'related'>('overview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareItem, setShareItem] = useState<ShareItem | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const totalDurationSeconds = useMemo(() => {
    return parseTimeToSeconds(video?.duration) || 522; // default ~08:42
  }, [video?.duration]);

  // Synthesis of rich ASTU ceremonial/academic metadata when missing
  const enrichedMetadata = useMemo(() => {
    const titleLower = (video?.title || '').toLowerCase();
    const isGraduation = titleLower.includes('graduation') || titleLower.includes('commencement');
    const isResearch = titleLower.includes('research') || titleLower.includes('innovation') || titleLower.includes('forum');
    const isRobotics = titleLower.includes('robotics') || titleLower.includes('mechatronics') || titleLower.includes('lab');
    const isIncubator = titleLower.includes('incubator') || titleLower.includes('startup') || titleLower.includes('pitch');
    const isDaad = titleLower.includes('daad') || titleLower.includes('workshop');

    const defaultVenue = isGraduation
      ? 'ASTU Main Campus Grand Auditorium, Adama'
      : isResearch
      ? 'Center of Excellence & Research Amphitheater, Block B'
      : isRobotics
      ? 'Advanced Mechatronics & Industry 4.0 Lab Rig'
      : isIncubator
      ? 'ASTU Innovation & Technology Incubation Hub'
      : 'ASTU Main Campus Media & Conference Hall';

    const defaultProducer = isGraduation
      ? 'ASTU Corporate Communications & Graduation Steering Directorate'
      : isResearch
      ? 'ASTU Research & Technology Transfer Directorate (RTTD)'
      : 'ASTU Media Services & Public Relations';

    const defaultSpeakers: VideoSpeaker[] = isGraduation
      ? [
          { name: 'Dr. Lemi Guta', title: 'President, ASTU', role: 'Presidential Commencement Address' },
          { name: 'Prof. Bekele Tsegaye', title: 'VP Academic Affairs', role: 'Conferral of Academic Degrees' },
          { name: 'Yohannes Melese', title: 'Gold Medalist (Dual Major CGPA 3.98)', role: 'Valedictory Keynote Address' },
          { name: 'Eng. Selamawit Bekele', title: 'Alumni Association Chair', role: 'Alumni Network Induction' },
        ]
      : isResearch
      ? [
          { name: 'Dr. Abebe Tadesse', title: 'Director of Applied Research', role: 'Keynote Speaker' },
          { name: 'Eng. Dawit Alemu', title: 'Lead Architect, Safaricom', role: 'Industry Keynote' },
          { name: 'Dr. Bethlehem Tadesse', title: 'AI Research Lead', role: 'Autonomous Systems Lead' },
        ]
      : [
          { name: 'University Directorate', title: 'ASTU Academic Council', role: 'Campus Broadcaster' },
          { name: 'Student Union Leadership', title: 'Class Representatives', role: 'Community Showcase' },
        ];

    const defaultChapters: VideoChapter[] = isGraduation
      ? [
          { time: '00:00', seconds: 0, title: 'Academic Processional & Welcome Protocol', desc: 'University senate, deans, and honorary faculty entrance.' },
          { time: '02:15', seconds: 135, title: 'Presidential Keynote Address', desc: 'Vision for technological self-reliance and STEM excellence.' },
          { time: '04:30', seconds: 270, title: 'Gold Medalist & Academic Distinction Awards', desc: 'Honoring top achievers across all engineering schools.' },
          { time: '06:10', seconds: 370, title: 'Conferral of Undergraduate & Postgraduate Degrees', desc: 'Official presentation of graduating class cohorts.' },
          { time: '07:45', seconds: 465, title: 'Valedictorian Address & Alumni Induction Oath', desc: 'Inspiring reflections by gold medalist Yohannes Melese.' },
        ]
      : [
          { time: '00:00', seconds: 0, title: 'Session Introduction & Context', desc: 'Opening statement and objectives overview.' },
          { time: '02:00', seconds: 120, title: 'Applied Showcase & Technology Highlights', desc: 'Deep dive into practical lab demonstrations.' },
          { time: '04:15', seconds: 255, title: 'Key Findings & Industry Q&A Panel', desc: 'Interactions between researchers and alumni executives.' },
          { time: '06:00', seconds: 360, title: 'Actionable Takeaways & Next Steps', desc: 'Future research roadmap and collaborative initiatives.' },
        ];

    const defaultHighlights: string[] = isGraduation
      ? [
          '1,215+ Graduates Recognized across 8 Applied Engineering Departments',
          '47 Academic Gold Medalists Honored with Corporate Fellowships',
          '99.7% Verified National Accreditation & SIS Clearance Rate',
          'Strategic Partnerships with 500+ National & Multinational Enterprises',
        ]
      : [
          'Direct University-to-Industry Applied Research Translation',
          'Showcase of High-Performance Prototype Engineering',
          'Mentorship and Internship Pathways for Undergraduates',
        ];

    const defaultTranscript = isGraduation
      ? `[00:00] Master of Ceremonies: "Honorable members of the university senate, distinguished government dignitaries, proud families, faculty, and above all, the graduating Class of 2026: Welcome to the 33rd Commencement Ceremony of Adama Science and Technology University."

[02:15] Dr. Lemi Guta (President, ASTU): "Today, we send forth a generation of engineers and applied scientists equipped not merely with theoretical formulas, but with the practical resilience and ethical discipline to solve the grandest technological challenges facing Ethiopia and our continent. Remember that an ASTU degree is a lifelong commitment to national transformation."

[04:30] VP Academic Affairs: "By the authority vested in the senate of Adama Science and Technology University, we confer upon these candidates their respective degrees in Software Engineering, Electrical and Computer Engineering, Mechanical Engineering, Civil Engineering, and Applied Natural Sciences."

[07:45] Yohannes Melese (Valedictorian): "To my fellow graduates: let us build infrastructures that endure, write algorithms that empower, and serve our communities with unyielding integrity. Wherever our careers lead us, ASTU remains our home."`
      : `[00:00] Moderator: "Welcome to this official broadcast from Adama Science and Technology University. Today we review landmark breakthroughs in applied science, student innovation, and corporate partnerships."

[02:00] Lead Presenter: "Our engineering laboratories have unified computational research with tangible physical prototypes, delivering accelerated outcomes for national industry partners."`;

    return {
      venue: video?.venue || defaultVenue,
      producer: video?.producer || defaultProducer,
      speakers: video?.speakers && video.speakers.length > 0 ? video.speakers : defaultSpeakers,
      chapters: video?.chapters && video.chapters.length > 0 ? video.chapters : defaultChapters,
      highlights: video?.highlights && video.highlights.length > 0 ? video.highlights : defaultHighlights,
      transcript: video?.transcript || defaultTranscript,
    };
  }, [video]);

  // Simulated live playback timer for Campus HD Stream
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlaying && playerMode === 'stream') {
      interval = setInterval(() => {
        setCurrentSeconds((prev) => {
          if (prev >= totalDurationSeconds) {
            setIsPlaying(false);
            return totalDurationSeconds;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playerMode, playbackSpeed, totalDurationSeconds]);

  const handleTogglePlay = () => {
    if (currentSeconds >= totalDurationSeconds) {
      setCurrentSeconds(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const handleSeek = (newSeconds: number) => {
    const clamped = Math.max(0, Math.min(totalDurationSeconds, newSeconds));
    setCurrentSeconds(clamped);
  };

  const handleChapterClick = (seconds: number) => {
    handleSeek(seconds);
    setPlayerMode('stream');
    setIsPlaying(true);
    toast.success(`Jumped to chapter at ${formatSecondsToTime(seconds)}`);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleShare = () => {
    if (!video) return;
    setShareItem({
      id: video.id,
      title: video.title,
      subtitle: video.subtitle || 'ASTU Video Highlight',
      text: video.description || video.subtitle || video.title,
      url: video.link || (typeof window !== 'undefined' ? window.location.href : undefined),
      image: video.image,
      badge: 'Video',
      type: 'video',
    });
    setShareOpen(true);
  };

  if (!video) return null;

  const videoPoster = video.image || '/images/gc7.jpg';
  const embedUrl = getEmbedVideoUrl(video.link);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header Bar ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-600/20 text-rose-500 ring-1 ring-rose-500/30">
              <PlayCircle className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">{video.title}</h3>
              <p className="text-[11px] text-slate-400 truncate flex items-center gap-2">
                <span>{video.category || 'Event Recordings'}</span>
                <span>•</span>
                <span>{enrichedMetadata.venue}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Stream Mode Switcher */}
            <div className="hidden sm:inline-flex items-center rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setPlayerMode('stream')}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                  playerMode === 'stream'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Direct Campus High-Definition Stream with interactive playback"
              >
                <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                <span>Campus HD Stream</span>
              </button>
              <button
                type="button"
                onClick={() => setPlayerMode('embed')}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                  playerMode === 'embed'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="External YouTube Video Player"
              >
                <Youtube className="h-3 w-3" />
                <span>YouTube Embed</span>
              </button>
            </div>

            <button
              type="button"
              aria-label="Close video player"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── Main Video Player Viewport ── */}
        <div ref={playerContainerRef} className="relative aspect-video w-full bg-black shrink-0 overflow-hidden">
          {playerMode === 'embed' && embedUrl ? (
            <div className="relative w-full h-full">
              <iframe
                src={embedUrl}
                title={video.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <div className="absolute top-2 left-2 z-10">
                <button
                  type="button"
                  onClick={() => setPlayerMode('stream')}
                  className="rounded-lg bg-slate-900/90 hover:bg-sky-600 text-white text-[11px] font-bold px-3 py-1.5 backdrop-blur-md border border-white/20 shadow-md transition-all flex items-center gap-1.5"
                >
                  <Radio className="h-3 w-3 text-emerald-400" />
                  <span>Switch to Campus HD Stream</span>
                </button>
              </div>
            </div>
          ) : (
            /* Direct Interactive Campus HD Stream Player */
            <div className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden group select-none">
              {/* Video Poster Image with Ambient Lighting */}
              <img
                src={videoPoster}
                alt={video.title}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                  isPlaying ? 'opacity-70 scale-102' : 'opacity-40 scale-100'
                }`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/astu-building.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />

              {/* Top Stream Badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    LIVE HD 1080p · 60fps
                  </span>
                  <span className="rounded-full bg-sky-950/80 backdrop-blur-md border border-sky-500/30 px-2.5 py-0.5 text-[10px] font-bold text-sky-300">
                    ASTU Media Stream
                  </span>
                </div>
                <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-slate-300">
                  {video.category || 'Official Broadcast'}
                </span>
              </div>

              {/* Big Central Play / Pause Button */}
              <button
                type="button"
                onClick={handleTogglePlay}
                className="relative z-20 flex h-20 w-20 items-center justify-center rounded-full bg-rose-600/90 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-rose-500 cursor-pointer"
                aria-label={isPlaying ? 'Pause broadcast' : 'Play broadcast'}
              >
                {isPlaying ? (
                  <Pause className="h-9 w-9 fill-current" />
                ) : (
                  <Play className="h-9 w-9 fill-current ml-1" />
                )}
              </button>

              {/* Bottom Video Controls Overlay */}
              <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black via-black/90 to-transparent p-4 pt-8 transition-opacity duration-300">
                {/* Scrubbing Timeline Bar */}
                <div
                  className="relative h-1.5 w-full rounded-full bg-white/20 hover:h-2.5 transition-all cursor-pointer mb-3"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percent = Math.max(0, Math.min(1, clickX / rect.width));
                    handleSeek(percent * totalDurationSeconds);
                  }}
                >
                  <div
                    className="h-full rounded-full bg-rose-500 relative transition-all"
                    style={{ width: `${(currentSeconds / totalDurationSeconds) * 100}%` }}
                  >
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-md scale-0 group-hover:scale-100 transition-transform" />
                  </div>
                </div>

                {/* Control Icons Row */}
                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleTogglePlay}
                      className="hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSeek(currentSeconds - 10)}
                      className="hover:text-slate-300 transition-colors cursor-pointer"
                      title="Rewind 10 seconds"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSeek(currentSeconds + 10)}
                      className="hover:text-slate-300 transition-colors cursor-pointer"
                      title="Forward 10 seconds"
                    >
                      <RotateCw className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-1 font-mono text-[11px] text-slate-300 pl-2">
                      <span>{formatSecondsToTime(currentSeconds)}</span>
                      <span>/</span>
                      <span>{formatSecondsToTime(totalDurationSeconds)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Volume Mute */}
                    <button
                      type="button"
                      onClick={() => setIsMuted((prev) => !prev)}
                      className="hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
                    </button>

                    {/* Speed Selector */}
                    <button
                      type="button"
                      onClick={() => {
                        const speeds = [1, 1.25, 1.5, 2];
                        const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
                        setPlaybackSpeed(next);
                        toast.success(`Speed set to ${next}x`);
                      }}
                      className="rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-bold hover:bg-white/20 transition-all cursor-pointer"
                      title="Playback Speed"
                    >
                      {playbackSpeed}x
                    </button>

                    {/* Fullscreen */}
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="hover:text-slate-300 transition-colors cursor-pointer"
                      title="Toggle Fullscreen"
                    >
                      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Tabs & Details Navigation Bar ── */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 pt-3 shrink-0">
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { key: 'overview', label: 'Overview & Highlights', icon: FileText },
              { key: 'chapters', label: `Chapters (${enrichedMetadata.chapters.length})`, icon: Clock },
              { key: 'transcript', label: 'Official Transcript', icon: Award },
              { key: 'related', label: `Related (${relatedVideos.length || 3})`, icon: ListVideo },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'border-sky-500 text-sky-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/20 hover:border-sky-400 transition-all cursor-pointer"
              title="Share video via Telegram, LinkedIn, WhatsApp, or copy link"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* ── Scrollable Tab Content Body ── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-200 text-xs sm:text-sm">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Event Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">About This Broadcast</h4>
                <p className="text-slate-300 leading-relaxed text-sm">
                  {video.subtitle || video.description || 'Official media highlight and documentary recording from Adama Science and Technology University.'}
                </p>
              </div>

              {/* Key Highlights */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Ceremony & Broadcast Highlights</h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {enrichedMetadata.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-xl bg-slate-900 border border-slate-800 p-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-200 font-medium">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keynote Speakers & Figures */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Keynote Speakers & Officials</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {enrichedMetadata.speakers.map((speaker, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 flex items-center gap-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-950 text-sky-400 font-bold border border-sky-800">
                        {speaker.name.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-xs truncate">{speaker.name}</p>
                        <p className="text-[10px] text-sky-400 truncate">{speaker.title}</p>
                        {speaker.role && <p className="text-[9px] text-slate-400 truncate">{speaker.role}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Production Metadata Strip */}
              <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  <span>Production: <strong className="text-slate-200">{enrichedMetadata.producer}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>Date: <strong className="text-slate-200">{video.date || '2026 Academic Year'}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-slate-500" />
                  <span>Reach: <strong className="text-slate-200">{video.views || '4.8K views'}</strong></span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chapters' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-400">Interactive Chapter Timestamps</span>
                <span className="text-[11px] text-sky-400">Click any chapter to jump the player</span>
              </div>
              <div className="space-y-2">
                {enrichedMetadata.chapters.map((ch, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChapterClick(ch.seconds)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:border-sky-500/50 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-14 shrink-0 items-center justify-center rounded-md bg-rose-600/20 text-rose-400 font-mono text-xs font-bold border border-rose-500/30 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                        {ch.time}
                      </span>
                      <div>
                        <p className="font-bold text-white text-xs sm:text-sm group-hover:text-sky-300 transition-colors">
                          {ch.title}
                        </p>
                        {ch.desc && <p className="text-[11px] text-slate-400 mt-0.5">{ch.desc}</p>}
                      </div>
                    </div>
                    <Play className="h-4 w-4 text-slate-500 group-hover:text-rose-400 transition-colors shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'transcript' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Official Ceremony Transcript</span>
                <span className="rounded-md bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800">
                  Verified Archive
                </span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                {enrichedMetadata.transcript}
              </div>
            </div>
          )}

          {activeTab === 'related' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">More official broadcasts and video archives from ASTU:</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(relatedVideos.length > 0
                  ? relatedVideos
                  : [
                      {
                        title: 'Annual Applied Research & Innovation Forum',
                        category: 'Research Showcases',
                        duration: '06:15',
                        image: '/images/arc.jpg',
                      },
                      {
                        title: 'Advanced Robotics & Mechatronics Lab Showcase',
                        category: 'Research Showcases',
                        duration: '05:50',
                        image: '/images/electriclabs.jpeg',
                      },
                      {
                        title: 'ASTU Tech Incubator & Startup Pitch Day',
                        category: 'Innovation',
                        duration: '09:12',
                        image: '/images/astusteam.jpg',
                      },
                    ]
                ).map((rel, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (onSelectRelatedVideo) onSelectRelatedVideo(rel as any);
                    }}
                    className="group rounded-xl border border-slate-800 bg-slate-900 overflow-hidden cursor-pointer hover:border-sky-500/50 transition-all flex flex-col justify-between"
                  >
                    <div className="relative h-28 w-full bg-slate-800">
                      <img src={rel.image || '/images/astu-building.jpg'} alt={rel.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play className="h-6 w-6 text-white group-hover:scale-120 transition-transform" />
                      </div>
                      <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/80 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        {rel.duration || '05:00'}
                      </span>
                    </div>
                    <div className="p-3">
                      <h5 className="font-bold text-white text-xs line-clamp-1 group-hover:text-sky-300 transition-colors">
                        {rel.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 mt-1 block">{rel.category || 'Highlights'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} item={shareItem} />
    </div>
  );
}
