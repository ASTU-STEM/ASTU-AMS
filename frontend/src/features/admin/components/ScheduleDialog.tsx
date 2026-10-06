import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, Globe2, X } from 'lucide-react';
import AdminModal from './AdminModal';

export type ScheduleValue = {
  date: string;
  time: string;
  timezone: string;
  notifySubscribers: boolean;
  channels: ('email' | 'sms' | 'push')[];
};

export type ScheduleDialogProps = {
  open: boolean;
  initial?: Partial<ScheduleValue>;
  onClose: () => void;
  onConfirm: (value: ScheduleValue) => void;
  title?: string;
};

const TIMEZONES = [
  'Africa/Addis_Ababa (EAT, UTC+3)',
  'Africa/Nairobi (EAT, UTC+3)',
  'Africa/Cairo (EET, UTC+2)',
  'Europe/London (GMT, UTC+0)',
  'America/New_York (EST, UTC-5)',
  'UTC (UTC+0)',
];

const CHANNELS: Array<{ id: 'email' | 'sms' | 'push'; label: string }> = [
  { id: 'email', label: 'Email' },
  { id: 'sms', label: 'SMS' },
  { id: 'push', label: 'Push' },
];

const today = () => {
  const now = new Date();
  return now.toISOString().slice(0, 10);
};
const nowTime = () => {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
};

const formatPreview = (date: string, time: string, timezone: string) => {
  if (!date || !time) return '—';
  try {
    const dateObj = new Date(`${date}T${time}:00`);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(dateObj) + ' · ' + timezone.split(' ')[0];
  } catch (error) {
    return '—';
  }
};

export default function ScheduleDialog({
  open,
  initial,
  onClose,
  onConfirm,
  title = 'Schedule Publishing',
}: ScheduleDialogProps) {
  const [date, setDate] = useState(initial?.date ?? today());
  const [time, setTime] = useState(initial?.time ?? nowTime());
  const [timezone, setTimezone] = useState(initial?.timezone ?? TIMEZONES[0]);
  const [notifySubscribers, setNotifySubscribers] = useState(initial?.notifySubscribers ?? true);
  const [channels, setChannels] = useState<(typeof CHANNELS)[number]['id'][]>(
    initial?.channels ?? ['email', 'push']
  );

  useEffect(() => {
    if (open) {
      setDate(initial?.date ?? today());
      setTime(initial?.time ?? nowTime());
      setTimezone(initial?.timezone ?? TIMEZONES[0]);
      setNotifySubscribers(initial?.notifySubscribers ?? true);
      setChannels(initial?.channels ?? ['email', 'push']);
    }
  }, [open, initial]);

  const preview = useMemo(() => formatPreview(date, time, timezone), [date, time, timezone]);

  const toggleChannel = (channel: 'email' | 'sms' | 'push') => {
    setChannels((current) =>
      current.includes(channel) ? current.filter((c) => c !== channel) : [...current, channel]
    );
  };

  const submit = () => {
    onConfirm({ date, time, timezone, notifySubscribers, channels });
  };

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">Publishing happens server-side at the scheduled time.</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
            >
              <Calendar className="h-4 w-4" />
              Schedule
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              <Calendar className="mr-1 inline h-3 w-3" />
              Publish date
            </span>
            <input
              type="date"
              value={date}
              min={today()}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-[8px] border border-[var(--border-color)] px-3 py-2 text-sm outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              <Clock className="mr-1 inline h-3 w-3" />
              Publish time
            </span>
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="w-full rounded-[8px] border border-[var(--border-color)] px-3 py-2 text-sm outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10"
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            <Globe2 className="mr-1 inline h-3 w-3" />
            Timezone
          </span>
          <select
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            className="w-full rounded-[8px] border border-[var(--border-color)] px-3 py-2 text-sm outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz}>{tz}</option>
            ))}
          </select>
        </label>

        <div className="rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-page)] px-3 py-2 text-xs text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--text-secondary)]">Will publish:</span> {preview}
        </div>

        <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <input
            type="checkbox"
            checked={notifySubscribers}
            onChange={(event) => setNotifySubscribers(event.target.checked)}
            className="h-4 w-4 rounded border-[var(--border-color)] text-[#003580] focus:ring-[#003580]"
          />
          Notify subscribers on publish
        </label>

        <div>
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Notification channels
          </span>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map((channel) => {
              const active = channels.includes(channel.id);
              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => toggleChannel(channel.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                    active
                      ? 'border-[#003580] bg-[#003580] text-white'
                      : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[#003580]/40'
                  }`}
                >
                  {active ? '✓' : '+'} {channel.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </AdminModal>
  );
}
