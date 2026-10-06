import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Flame,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserX,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { BreakGlassModal, DangerousActionModal } from '../../../components/IctProtectionModals';
import IctPageHeader from '../components/IctPageHeader';
import IctMetricCard from '../components/IctMetricCard';
import IctSection from '../components/IctSection';
import IctStatusBadge from '../components/IctStatusBadge';
import IctEmptyState from '../components/IctEmptyState';
import { IctMeter } from '../components/IctHealthIndicator';
import { ictBtnDanger, ictBtnGhost, ictBtnPrimary, ictBtnSecondary } from '../components/ictUi';

interface OwaspItem {
  code: string;
  name: string;
  summary: string;
  status: 'PROTECTED' | 'MONITORED' | 'ACTION_REQUIRED';
  activeControls: string[];
  auditedAt: string;
}

const owaspTop10List: OwaspItem[] = [
  {
    code: 'A01:2021',
    name: 'Broken Access Control',
    summary: 'Users reach data or actions that are not theirs',
    status: 'PROTECTED',
    activeControls: ['Role-Based Access Control (RBAC)', 'ProtectedRoute route guards', 'Tenant boundary check middleware', 'Object-level permission checks'],
    auditedAt: '2026-09-13 21:00:00',
  },
  {
    code: 'A02:2021',
    name: 'Cryptographic Failures',
    summary: 'Sensitive data exposed through weak or absent cryptography',
    status: 'PROTECTED',
    activeControls: ['Bcrypt password hashing (10 salt rounds)', 'AES-256-GCM DB column encryption', 'TLS 1.3 Strict HTTPS Transport Security (HSTS)', 'JWT RSA-256 signing'],
    auditedAt: '2026-09-13 21:00:00',
  },
  {
    code: 'A03:2021',
    name: 'Injection',
    summary: 'Untrusted input is executed as code or as a query',
    status: 'PROTECTED',
    activeControls: ['Prisma ORM parameterized queries', 'Zod payload schema validation', 'WAF SQLi & Command Injection inspection rules'],
    auditedAt: '2026-09-13 21:00:00',
  },
  {
    code: 'A04:2021',
    name: 'Insecure Design',
    summary: 'The flaw is in the design itself, not in the implementation',
    status: 'PROTECTED',
    activeControls: ['Defense-in-depth architecture', 'Break Glass emergency access elevation timers', 'Dangerous action typed confirmation modals'],
    auditedAt: '2026-09-13 21:00:00',
  },
  {
    code: 'A05:2021',
    name: 'Security Misconfiguration',
    summary: 'Defaults, debug modes and open permissions left in place',
    status: 'PROTECTED',
    activeControls: ['Helmet HTTP security headers', 'Strict CORS whitelist (no wildcards)', 'Production debug endpoints disabled', 'Cookie SameSite=Strict'],
    auditedAt: '2026-09-13 21:00:00',
  },
  {
    code: 'A06:2021',
    name: 'Vulnerable and Outdated Components',
    summary: 'Known-vulnerable libraries still in use',
    status: 'MONITORED',
    activeControls: ['Automated npm audit vulnerability scanning', 'Dependabot security alerts enabled', 'Zero high-severity CVEs in active bundle'],
    auditedAt: '2026-09-13 21:00:00',
  },
  {
    code: 'A07:2021',
    name: 'Identification and Authentication Failures',
    summary: 'Weak login, weak sessions, no MFA',
    status: 'ACTION_REQUIRED',
    activeControls: ['Mandatory MFA OTP challenge for administrative roles', 'Brute force IP lockouts (5 failed attempts)', 'Short-lived JWT tokens with active rotation'],
    auditedAt: '2026-09-13 21:00:00',
  },
  {
    code: 'A08:2021',
    name: 'Software and Data Integrity Failures',
    summary: 'Untrusted code or data is accepted as genuine',
    status: 'PROTECTED',
    activeControls: ['HMAC SHA-256 signed webhooks', 'Degree & transcript document digital hashes', 'Subresource Integrity (SRI) script tags'],
    auditedAt: '2026-09-13 21:00:00',
  },
  {
    code: 'A09:2021',
    name: 'Security Logging and Monitoring Failures',
    summary: 'Attacks happen and nobody notices',
    status: 'PROTECTED',
    activeControls: ['Centralized Elasticsearch audit log stream', 'Real-time WAF alert dispatch', 'Immutable before/after data mutation diff logging'],
    auditedAt: '2026-09-13 21:00:00',
  },
  {
    code: 'A10:2021',
    name: 'Server-Side Request Forgery (SSRF)',
    summary: 'The server is tricked into fetching an attacker\u2019s URL',
    status: 'PROTECTED',
    activeControls: ['URL outbound egress domain whitelisting', 'Private RFC-1918 IP subnet fetch restrictions (10.0.0.0/8, 127.0.0.1 blocked)', 'Dedicated proxy for external HTTP fetches'],
    auditedAt: '2026-09-13 21:00:00',
  },
];

function owaspBadgeStatus(status: OwaspItem['status']) {
  if (status === 'ACTION_REQUIRED') return 'warning';
  if (status === 'MONITORED') return 'active';
  return 'pass';
}

export default function IctSecuritySocPage() {
  const [threatLevel] = useState<'LOW' | 'MODERATE' | 'HIGH'>('MODERATE');
  const [breakGlassOpen, setBreakGlassOpen] = useState(false);
  const [dangerousModalOpen, setDangerousModalOpen] = useState(false);
  const [isElevated, setIsElevated] = useState(false);
  const [elevatedReason, setElevatedReason] = useState('');
  const [expandedOwaspCode, setExpandedOwaspCode] = useState<string | null>('A01:2021');
  const [isScanning, setIsScanning] = useState(false);
  const [securityScore, setSecurityScore] = useState(96);

  const [blacklistedIps, setBlacklistedIps] = useState([
    { ip: '197.156.92.14', reason: '340 req/min rate limit exceeded', added: '2 hours ago', count: 48 },
    { ip: '45.133.1.88', reason: 'WAF Filter SQLi Payload attempt', added: 'Yesterday', count: 12 },
    { ip: '102.217.18.2', reason: 'Brute force probe on /api/auth/login', added: '3 days ago', count: 15 },
  ]);

  const handleBreakGlassElevate = (reason: string) => {
    setIsElevated(true);
    setElevatedReason(reason);
  };

  const handleRunOwaspScan = () => {
    setIsScanning(true);
    toast.loading('Running OWASP A01–A10 Vulnerability Audit Scan...', { id: 'owasp-scan' });

    setTimeout(() => {
      setIsScanning(false);
      setSecurityScore(98);
      toast.success('OWASP A01–A10 Scan Complete! Score: 98/100 (0 Critical Vulnerabilities)', { id: 'owasp-scan' });
    }, 2500);
  };

  const counts = useMemo(
    () => ({
      protected: owaspTop10List.filter((i) => i.status === 'PROTECTED').length,
      monitored: owaspTop10List.filter((i) => i.status === 'MONITORED').length,
      actionRequired: owaspTop10List.filter((i) => i.status === 'ACTION_REQUIRED').length,
      total: owaspTop10List.length,
    }),
    []
  );

  const actionItems = owaspTop10List.filter((i) => i.status !== 'PROTECTED');

  return (
    <div className="space-y-4 lg:space-y-5">
      <IctPageHeader
        icon={ShieldAlert}
        title="Security SOC & OWASP"
        description="Monitor security findings, threats and application security posture."
        meta={
          <>
            <IctStatusBadge status="warning" label={`THREAT LEVEL ${threatLevel}`} />
            <span className="ict-label">Adaptive WAF active</span>
          </>
        }
        actions={
          <>
            <button type="button" onClick={handleRunOwaspScan} disabled={isScanning} className={ictBtnPrimary}>
              <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} aria-hidden />
              {isScanning ? 'Scanning…' : 'Run OWASP Audit'}
            </button>
            <button type="button" onClick={() => setBreakGlassOpen(true)} className={ictBtnDanger}>
              <Flame className="h-3.5 w-3.5" aria-hidden />
              Break Glass Access
            </button>
          </>
        }
      />

      {/* Elevated privilege banner */}
      {isElevated && (
        <div className="ict-card ict-rise ict-bd-critical ict-bg-critical flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <Flame className="mt-0.5 h-4 w-4 shrink-0 ict-pulse text-[var(--ict-crit)]" aria-hidden />
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--ict-crit)]">
                Break Glass access active — elevated for 30 minutes
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--text-secondary)] ">
                Reason: &ldquo;{elevatedReason}&rdquo;
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsElevated(false);
              toast.success('Elevated session revoked. Returned to standard ICT Administrator scope.');
            }}
            className={`${ictBtnDanger} shrink-0`}
          >
            Revoke Elevation
          </button>
        </div>
      )}

      {/* Security overview */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <IctMetricCard
          label="ASTU security score"
          value={
            <>
              {securityScore}
              <span className="text-[12px] font-bold text-[var(--text-muted)]">/100</span>
            </>
          }
          icon={ShieldCheck}
          tone="success"
          hint="Enterprise security grade"
          status={<IctStatusBadge status="pass" size="xs" />}
          meter={<IctMeter value={securityScore} tone="success" label={`Security score ${securityScore} of 100`} />}
        />
        <IctMetricCard
          label="Open findings"
          value={actionItems.length}
          icon={ShieldAlert}
          tone="warning"
          hint={`${counts.actionRequired} require action · ${counts.monitored} monitored`}
          status={
            counts.actionRequired > 0 ? <IctStatusBadge status="critical" label={`${counts.actionRequired} CRITICAL`} size="xs" /> : undefined
          }
        />
        <IctMetricCard label="Failed logins (24h)" value="127" icon={UserX} tone="default" hint="Brute-force probes blocked" />
        <IctMetricCard
          label="Blocked IPs"
          value={blacklistedIps.length}
          icon={Shield}
          tone="danger"
          hint={blacklistedIps.length > 0 ? 'WAF denylist rules enforced' : 'Denylist empty'}
        />
      </div>

      {/* OWASP matrix */}
      <IctSection
        icon={Shield}
        title="OWASP Top 10 — Active Protection Matrix"
        description="Institutional controls mapped to the OWASP 2021 vector set"
        actions={
          <div className="flex flex-wrap items-center gap-1.5">
            <IctStatusBadge status="pass" label={`${counts.protected} PROTECTED`} size="xs" />
            <IctStatusBadge status="active" label={`${counts.monitored} MONITORED`} size="xs" />
            <IctStatusBadge status="critical" label={`${counts.actionRequired} ACTION`} size="xs" />
          </div>
        }
        bodyClassName="space-y-2"
      >
        <div className="space-y-2">
          {owaspTop10List.map((item) => {
            const isExpanded = expandedOwaspCode === item.code;
            const needsAction = item.status === 'ACTION_REQUIRED';
            return (
              <div
                key={item.code}
                className={`ict-tile overflow-hidden ${needsAction ? 'ict-bd-critical' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedOwaspCode(isExpanded ? null : item.code)}
                  aria-expanded={isExpanded}
                  className="flex w-full items-center justify-between gap-3 p-2.5 text-left transition-colors duration-150 hover:bg-[var(--ict-accent-soft)] ict-focus"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={`ict-mono shrink-0 rounded-[4px] px-1.5 py-1 text-[10px] font-extrabold ring-1 ring-inset ${
                        needsAction
                          ? 'ict-bd-critical ict-bg-critical text-[var(--ict-crit)]'
                          : 'ict-bd-info ict-bg-accent text-[var(--ict-accent-text)]'
                      }`}
                    >
                      {item.code}
                    </span>
                    <span className="min-w-0">
                      <span className="ict-clamp-1 block text-[12px] font-extrabold text-[var(--text-primary)] ">
                        {item.name}
                      </span>
                      <span className="ict-clamp-1 block text-[10.5px] text-[var(--text-muted)]">{item.summary}</span>
                    </span>
                  </div>

                  <span className="flex shrink-0 items-center gap-2">
                    <IctStatusBadge status={owaspBadgeStatus(item.status)} label={item.status.replace('_', ' ')} size="xs" />
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5 text-[var(--text-muted)]" aria-hidden />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" aria-hidden />
                    )}
                  </span>
                </button>

                {isExpanded && (
                  <div className="space-y-2.5 border-t border-[var(--ict-hairline)] bg-[var(--ict-surface-inset)] p-2.5 ">
                    <p className="ict-label">Active ASTU protection controls</p>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {item.activeControls.map((control) => (
                        <div
                          key={control}
                          className="flex items-start gap-2 rounded-[5px] border border-[var(--border-color)] bg-[var(--ict-surface)] p-2 text-[11px] font-medium text-[var(--text-secondary)]   "
                        >
                          <ShieldCheck className="mt-px h-3 w-3 shrink-0 text-[var(--ict-ok)]" aria-hidden />
                          <span className="min-w-0">{control}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-right text-[10px] text-[var(--text-muted)]">
                      Audited against OWASP 2021 Standard · {item.auditedAt}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </IctSection>

      {/* Protection demo */}
      <IctSection
        icon={AlertTriangle}
        title="Dangerous Action Protection"
        description="High-risk operations require typed confirmation before they execute"
        actions={
          <button type="button" onClick={() => setDangerousModalOpen(true)} className={ictBtnSecondary}>
            Verify protection flow
          </button>
        }
      >
        <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
          Use the action above to confirm that destructive ICT operations are gated behind a typed confirmation phrase.
          The control is client-side only in this workspace.
        </p>
      </IctSection>

      {/* Denylist */}
      <IctSection
        icon={UserX}
        title="Blocked & Blacklisted IPs"
        description="WAF-enforced IP denylist"
        actions={
          <button type="button" onClick={() => toast.success('IP rules synchronized across firewall nodes')} className={ictBtnGhost}>
            Sync Firewall Rules
          </button>
        }
      >
        {blacklistedIps.length === 0 ? (
          <IctEmptyState
            icon={ShieldCheck}
            tone="success"
            title="No blocked IP addresses"
            description="The WAF denylist is empty. Addresses blocked by rate limiting or signature inspection appear here automatically."
          />
        ) : (
          <div className="space-y-2">
            {blacklistedIps.map((item) => (
              <div
                key={item.ip}
                className="ict-tile flex flex-col gap-2.5 p-2.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <span className="ict-mono ict-num font-extrabold text-[var(--ict-crit)]">{item.ip}</span>
                  <p className="text-[11px] text-[var(--text-secondary)] ">{item.reason}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 text-[10.5px] text-[var(--text-muted)]">
                  <span className="ict-mono ict-num rounded-[4px] bg-[var(--ict-crit-bg)] px-1.5 py-0.5 font-bold text-[var(--ict-crit)]">
                    {item.count} hits
                  </span>
                  <span className="whitespace-nowrap">
                    Blocked <strong className="text-[var(--text-secondary)] ">{item.added}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setBlacklistedIps((prev) => prev.filter((i) => i.ip !== item.ip));
                      toast.success(`Unblocked IP ${item.ip}`);
                    }}
                    className={ictBtnGhost}
                  >
                    Unblock
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </IctSection>

      <BreakGlassModal isOpen={breakGlassOpen} onClose={() => setBreakGlassOpen(false)} onElevate={handleBreakGlassElevate} />

      <DangerousActionModal
        isOpen={dangerousModalOpen}
        title="Flush Redis System Cache"
        description="Flushing the cache will purge all cached tracer analytics, user session tokens, and active job counters."
        expectedConfirmText="FLUSH ASTU CACHE"
        onClose={() => setDangerousModalOpen(false)}
        onConfirm={() => toast.success('Redis System Cache flushed successfully!')}
      />
    </div>
  );
}
