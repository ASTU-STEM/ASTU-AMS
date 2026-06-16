import { useState, useEffect, useRef, useCallback } from "react";
import { surveyService } from '../services/survey.service';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type SurveyType = "6-Month" | "12-Month" | "24-Month" | "Custom";

type QuestionType =
  | "short-text"
  | "long-text"
  | "single-choice"
  | "multiple-choice"
  | "dropdown"
  | "rating"
  | "yes-no"
  | "scale"
  | "date"
  | "email";

type SurveyStatus = "DRAFT" | "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";

interface SurveyQuestionOption {
  id: string;
  label: string;
  value: string;
}

interface SurveyQuestion {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: SurveyQuestionOption[];
  placeholder?: string;
  helperText?: string;
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
}

interface Survey {
  id: number;
  title: string;
  description: string;
  deadline: string;
  type: SurveyType;
  status: SurveyStatus;
  questions: SurveyQuestion[];
  responses: number;
  sent: number;
  scheduledDate: string | null;
  createdAt: string;
}

interface ToastState {
  visible: boolean;
  message: string;
  type: "success" | "error" | "info";
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUESTION TYPE CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const QUESTION_TYPE_CONFIG: Record<
  QuestionType,
  { label: string; icon: string; description: string; color: string; bg: string; category: string }
> = {
  "short-text": {
    label: "Short Text",
    icon: "Aa",
    description: "Single-line text answer",
    color: "#3B82F6",
    bg: "#EFF6FF",
    category: "Text",
  },
  "long-text": {
    label: "Long Text",
    icon: "¶",
    description: "Multi-line paragraph answer",
    color: "#6366F1",
    bg: "#EEF2FF",
    category: "Text",
  },
  "single-choice": {
    label: "Single Choice",
    icon: "◉",
    description: "Pick one option from a list",
    color: "#EC4899",
    bg: "#FDF2F8",
    category: "Choice",
  },
  "multiple-choice": {
    label: "Multiple Choice",
    icon: "☑",
    description: "Select multiple options",
    color: "#8B5CF6",
    bg: "#F5F3FF",
    category: "Choice",
  },
  dropdown: {
    label: "Dropdown",
    icon: "▾",
    description: "Choose from a dropdown menu",
    color: "#F59E0B",
    bg: "#FFFBEB",
    category: "Choice",
  },
  rating: {
    label: "Star Rating",
    icon: "★",
    description: "Rate on a 1–5 star scale",
    color: "#F59E0B",
    bg: "#FEF3C7",
    category: "Rating",
  },
  "yes-no": {
    label: "Yes / No",
    icon: "Y/N",
    description: "Simple yes or no answer",
    color: "#10B981",
    bg: "#ECFDF5",
    category: "Choice",
  },
  scale: {
    label: "Linear Scale",
    icon: "1-10",
    description: "Rate on a numeric range",
    color: "#0EA5E9",
    bg: "#F0F9FF",
    category: "Rating",
  },
  date: {
    label: "Date",
    icon: "D",
    description: "Pick a calendar date",
    color: "#14B8A6",
    bg: "#F0FDFA",
    category: "Text",
  },
  email: {
    label: "Email",
    icon: "@",
    description: "Email address input",
    color: "#EF4444",
    bg: "#FEF2F2",
    category: "Text",
  },
};

const QUESTION_CATEGORIES = ["All", "Text", "Choice", "Rating"];

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════

const MOCK_SURVEYS: Survey[] = [
  {
    id: 1,
    title: "6-Month Employment Tracer Survey",
    description:
      "Tracks graduate employment outcomes six months after graduation for ABET accreditation compliance.",
    deadline: "2025-08-15",
    type: "6-Month",
    status: "IN_PROGRESS",
    createdAt: "2025-06-01",
    questions: [
      {
        id: "q1",
        text: "Are you currently employed?",
        type: "single-choice",
        required: true,
        options: [
          { id: "o1", label: "Yes, full-time", value: "full-time" },
          { id: "o2", label: "Yes, part-time", value: "part-time" },
          { id: "o3", label: "Self-employed", value: "self-employed" },
          { id: "o4", label: "No, seeking employment", value: "seeking" },
          { id: "o5", label: "No, not seeking", value: "not-seeking" },
        ],
      },
      {
        id: "q2",
        text: "What is your current job title?",
        type: "short-text",
        required: true,
        placeholder: "e.g. Software Engineer",
      },
      {
        id: "q3",
        text: "How relevant is your job to your degree?",
        type: "rating",
        required: true,
      },
      {
        id: "q4",
        text: "Describe your overall job satisfaction",
        type: "long-text",
        required: false,
        placeholder: "Share your thoughts about your current role...",
      },
      {
        id: "q5",
        text: "What is your monthly salary range?",
        type: "dropdown",
        required: true,
        options: [
          { id: "o1", label: "Below 5,000 ETB", value: "<5000" },
          { id: "o2", label: "5,000 – 10,000 ETB", value: "5000-10000" },
          { id: "o3", label: "10,000 – 20,000 ETB", value: "10000-20000" },
          { id: "o4", label: "20,000 – 50,000 ETB", value: "20000-50000" },
          { id: "o5", label: "Above 50,000 ETB", value: ">50000" },
        ],
      },
      {
        id: "q6",
        text: "Would you recommend ASTU to prospective students?",
        type: "yes-no",
        required: true,
      },
    ],
    responses: 134,
    sent: 200,
    scheduledDate: "2025-07-01",
  },
  {
    id: 2,
    title: "12-Month Graduate Outcomes Survey",
    description:
      "Annual survey measuring career progression and further education of graduates.",
    deadline: "2025-09-30",
    type: "12-Month",
    status: "PENDING",
    createdAt: "2025-07-15",
    questions: [
      {
        id: "q1",
        text: "What is your current employment status?",
        type: "single-choice",
        required: true,
        options: [
          { id: "o1", label: "Employed", value: "employed" },
          { id: "o2", label: "Unemployed", value: "unemployed" },
          { id: "o3", label: "Further Studies", value: "studies" },
        ],
      },
      {
        id: "q2",
        text: "Have you pursued further education since graduation?",
        type: "yes-no",
        required: true,
      },
      {
        id: "q3",
        text: "Rate your career satisfaction (1-10)",
        type: "scale",
        required: true,
        scaleMin: 1,
        scaleMax: 10,
        scaleMinLabel: "Not satisfied",
        scaleMaxLabel: "Very satisfied",
      },
    ],
    responses: 0,
    sent: 0,
    scheduledDate: null,
  },
  {
    id: 3,
    title: "24-Month Career Progress Survey",
    description:
      "Longitudinal study assessing long-term career impact and graduate satisfaction.",
    deadline: "2025-06-01",
    type: "24-Month",
    status: "COMPLETED",
    createdAt: "2025-01-10",
    questions: [
      {
        id: "q1",
        text: "Describe your career trajectory since graduation",
        type: "long-text",
        required: true,
        placeholder: "Tell us about your career journey...",
      },
      {
        id: "q2",
        text: "Rate your overall satisfaction with ASTU education",
        type: "rating",
        required: true,
      },
      {
        id: "q3",
        text: "Would you recommend ASTU to others?",
        type: "single-choice",
        required: true,
        options: [
          { id: "o1", label: "Definitely yes", value: "def-yes" },
          { id: "o2", label: "Probably yes", value: "prob-yes" },
          { id: "o3", label: "Not sure", value: "not-sure" },
          { id: "o4", label: "Probably no", value: "prob-no" },
          { id: "o5", label: "Definitely no", value: "def-no" },
        ],
      },
      {
        id: "q4",
        text: "Which skills from ASTU were most valuable?",
        type: "multiple-choice",
        required: false,
        options: [
          { id: "o1", label: "Technical Skills", value: "technical" },
          { id: "o2", label: "Problem Solving", value: "problem-solving" },
          { id: "o3", label: "Communication", value: "communication" },
          { id: "o4", label: "Teamwork", value: "teamwork" },
          { id: "o5", label: "Leadership", value: "leadership" },
        ],
      },
      {
        id: "q5",
        text: "How many times have you changed jobs since graduation?",
        type: "dropdown",
        required: true,
        options: [
          { id: "o1", label: "0 (same job)", value: "0" },
          { id: "o2", label: "1 time", value: "1" },
          { id: "o3", label: "2 times", value: "2" },
          { id: "o4", label: "3 or more", value: "3+" },
        ],
      },
    ],
    responses: 312,
    sent: 340,
    scheduledDate: "2025-01-15",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// STATUS / TYPE CONFIGS
// ═══════════════════════════════════════════════════════════════════════════════

const statusConfig: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  DRAFT: { label: "Draft", bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" },
  PENDING: { label: "Pending", bg: "#FEF3C7", color: "#92400E", dot: "#F59E0B" },
  IN_PROGRESS: { label: "In Progress", bg: "#DBEAFE", color: "#1E40AF", dot: "#3B82F6" },
  COMPLETED: { label: "Completed", bg: "#D1FAE5", color: "#065F46", dot: "#10B981" },
  ARCHIVED: { label: "Archived", bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" },
};

const typeConfig: Record<string, { bg: string; color: string }> = {
  "6-Month": { bg: "#EDE9FE", color: "#5B21B6" },
  "12-Month": { bg: "#D1FAE5", color: "#065F46" },
  "24-Month": { bg: "#E0E7FF", color: "#3730A3" },
  Custom: { bg: "#FEF3C7", color: "#92400E" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 700,
        background: bg,
        color,
        letterSpacing: "0.03em",
        border: "1px solid rgba(0,0,0,0.04)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const c = statusConfig[status] || statusConfig.PENDING;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 700,
        background: c.bg,
        color: c.color,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: c.dot,
          display: "inline-block",
        }}
      />
      {c.label}
    </span>
  );
}

function ProgressBar({
  value,
  max,
  color = "#E53935",
  height = 6,
}: {
  value: number;
  max: number;
  color?: string;
  height?: number;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          flex: 1,
          height,
          background: "#F3F4F6",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${color}, ${color}CC)`,
            borderRadius: 99,
            transition: "width 0.6s ease",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#6B7280",
          minWidth: 34,
          textAlign: "right",
        }}
      >
        {pct}%
      </span>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #F3F4F6",
        borderRadius: 16,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 80,
          height: 80,
          borderRadius: "0 16px 0 80px",
          background: accent + "10",
        }}
      />
      {icon && (
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: accent + "15",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          {icon}
        </div>
      )}
      <div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "#111827",
            lineHeight: 1.1,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#6B7280",
            marginTop: 2,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </div>
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: accent, fontWeight: 600 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: "#6B7280",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
        {required && <span style={{ color: "#EF4444", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1.5px solid #E5E7EB",
  fontSize: 13,
  outline: "none",
  background: "#F9FAFB",
  color: "#111827",
  boxSizing: "border-box",
  transition: "border-color 0.2s, box-shadow 0.2s",
  fontFamily: "inherit",
};

// ═══════════════════════════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════════════════════════

function Toast({
  message,
  type,
  visible,
}: {
  message: string;
  type: string;
  visible: boolean;
}) {
  const colors: Record<string, string> = {
    success: "#10B981",
    error: "#EF4444",
    info: "#3B82F6",
  };
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 9999,
        background: "#111827",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.3s ease",
        pointerEvents: "none",
      }}
    >
      <span style={{ color: colors[type] || colors.info, fontSize: 16 }}>
        {type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}
      </span>
      {message}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════════════════════════════════════

function Modal({
  show,
  onClose,
  title,
  subtitle,
  width = 620,
  children,
}: {
  show: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: number;
  children: React.ReactNode;
}) {
  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(17,24,39,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth: width,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          animation: "popIn 0.25s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px 16px",
            borderBottom: "1px solid #F3F4F6",
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 2,
            borderRadius: "20px 20px 0 0",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 800,
                color: "#111827",
              }}
            >
              {title}
            </h3>
            {subtitle && (
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 12,
                  color: "#9CA3AF",
                  fontWeight: 500,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "#F3F4F6",
              color: "#6B7280",
              width: 32,
              height: 32,
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              transition: "all 0.15s",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: "20px 24px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUESTION PREVIEW — renders a live preview of each question type
// ═══════════════════════════════════════════════════════════════════════════════

function QuestionPreview({ question }: { question: SurveyQuestion }) {
  const config = QUESTION_TYPE_CONFIG[question.type];

  const renderInput = () => {
    switch (question.type) {
      case "short-text":
        return (
          <input
            placeholder={question.placeholder || "Type your answer..."}
            disabled
            style={{
              ...inputStyle,
              background: "#fff",
              cursor: "default",
            }}
          />
        );

      case "long-text":
        return (
          <textarea
            placeholder={question.placeholder || "Type your detailed answer..."}
            disabled
            rows={3}
            style={{
              ...inputStyle,
              background: "#fff",
              cursor: "default",
              resize: "none",
            }}
          />
        );

      case "single-choice":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(question.options || []).map((opt) => (
              <label
                key={opt.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 14px",
                  background: "#F9FAFB",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 13,
                  color: "#374151",
                  fontWeight: 500,
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: "2px solid #D1D5DB",
                    flexShrink: 0,
                  }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        );

      case "multiple-choice":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(question.options || []).map((opt) => (
              <label
                key={opt.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 14px",
                  background: "#F9FAFB",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 13,
                  color: "#374151",
                  fontWeight: 500,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    border: "2px solid #D1D5DB",
                    flexShrink: 0,
                  }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        );

      case "dropdown":
        return (
          <select
            disabled
            style={{
              ...inputStyle,
              background: "#fff",
              cursor: "default",
              color: "#9CA3AF",
            }}
          >
            <option>Select an option...</option>
            {(question.options || []).map((opt) => (
              <option key={opt.id}>{opt.label}</option>
            ))}
          </select>
        );

      case "rating":
        return (
          <div style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <div
                key={star}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "#FEF3C7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  cursor: "pointer",
                  border: "1.5px solid #FDE68A",
                  transition: "all 0.15s",
                }}
              >
                ★
              </div>
            ))}
          </div>
        );

      case "yes-no":
        return (
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { label: "Yes", bg: "#ECFDF5", border: "#A7F3D0", color: "#065F46" },
              { label: "No", bg: "#FEF2F2", border: "#FECACA", color: "#991B1B" },
            ].map((opt) => (
              <div
                key={opt.label}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: opt.bg,
                  border: `1.5px solid ${opt.border}`,
                  borderRadius: 10,
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  color: opt.color,
                  cursor: "pointer",
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        );

      case "scale": {
        const min = question.scaleMin || 1;
        const max = question.scaleMax || 10;
        const scaleItems = [];
        for (let i = min; i <= max; i++) scaleItems.push(i);
        return (
          <div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {scaleItems.map((n) => (
                <div
                  key={n}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "#F0F9FF",
                    border: "1.5px solid #BAE6FD",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#0369A1",
                    cursor: "pointer",
                  }}
                >
                  {n}
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 6,
              }}
            >
              <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600 }}>
                {question.scaleMinLabel || min}
              </span>
              <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600 }}>
                {question.scaleMaxLabel || max}
              </span>
            </div>
          </div>
        );
      }

      case "date":
        return (
          <input
            type="date"
            disabled
            style={{
              ...inputStyle,
              background: "#fff",
              cursor: "default",
            }}
          />
        );

      case "email":
        return (
          <input
            type="email"
            placeholder="example@email.com"
            disabled
            style={{
              ...inputStyle,
              background: "#fff",
              cursor: "default",
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        background: "#FAFBFC",
        border: "1px solid #F3F4F6",
        borderRadius: 12,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14 }}>{config.icon}</span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#111827",
          }}
        >
          {question.text}
        </span>
        {question.required && (
          <span style={{ color: "#EF4444", fontSize: 12, fontWeight: 700 }}>
            *
          </span>
        )}
      </div>
      {question.helperText && (
        <span style={{ fontSize: 11, color: "#9CA3AF", marginTop: -4 }}>
          {question.helperText}
        </span>
      )}
      {renderInput()}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUESTION BUILDER CARD
// ═══════════════════════════════════════════════════════════════════════════════

function QuestionBuilderCard({
  question,
  index,
  onRemove,
  onToggleRequired,
}: {
  question: SurveyQuestion;
  index: number;
  onRemove: () => void;
  onToggleRequired: () => void;
}) {
  const config = QUESTION_TYPE_CONFIG[question.type];

  return (
    <div
      style={{
        background: "#fff",
        border: "1.5px solid #E5E7EB",
        borderRadius: 14,
        overflow: "hidden",
        animation: "fadeUp 0.2s ease",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = config.color + "60";
        el.style.boxShadow = `0 2px 12px ${config.color}15`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "#E5E7EB";
        el.style.boxShadow = "none";
      }}
    >
      {/* Question Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          background: config.bg,
          borderBottom: "1px solid #F3F4F6",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: 7,
              background: config.color,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            {index + 1}
          </span>
          <span style={{ fontSize: 14 }}>{config.icon}</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: config.color,
            }}
          >
            {config.label}
          </span>
          {question.required && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#EF4444",
                background: "#FEF2F2",
                padding: "1px 6px",
                borderRadius: 4,
              }}
            >
              REQUIRED
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={onToggleRequired}
            title={question.required ? "Make optional" : "Make required"}
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              border: "none",
              background: question.required ? "#FEE2E2" : "#F3F4F6",
              color: question.required ? "#EF4444" : "#9CA3AF",
              cursor: "pointer",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              transition: "all 0.15s",
            }}
          >
            *
          </button>
          <button
            onClick={onRemove}
            title="Remove question"
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              border: "none",
              background: "#FEE2E2",
              color: "#B91C1C",
              cursor: "pointer",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              transition: "all 0.15s",
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Question Preview */}
      <div style={{ padding: "12px 14px" }}>
        <QuestionPreview question={question} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUESTION TYPE SELECTOR GRID
// ═══════════════════════════════════════════════════════════════════════════════

function QuestionTypeSelector({
  onSelect,
  category,
  setCategory,
}: {
  onSelect: (type: QuestionType) => void;
  category: string;
  setCategory: (c: string) => void;
}) {
  const types = Object.entries(QUESTION_TYPE_CONFIG).filter(
    ([_, cfg]) => category === "All" || cfg.category === category
  );

  return (
    <div>
      {/* Category Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {QUESTION_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: "5px 14px",
              borderRadius: 8,
              border: "1.5px solid",
              borderColor: category === cat ? "#E53935" : "#E5E7EB",
              background: category === cat ? "#E53935" : "#fff",
              color: category === cat ? "#fff" : "#6B7280",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Type Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 8,
        }}
      >
        {types.map(([type, cfg]) => (
          <button
            key={type}
            onClick={() => onSelect(type as QuestionType)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              padding: "14px 10px",
              background: "#fff",
              border: `1.5px solid #E5E7EB`,
              borderRadius: 12,
              cursor: "pointer",
              transition: "all 0.2s",
              textAlign: "center",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = cfg.color + "80";
              el.style.background = cfg.bg;
              el.style.transform = "translateY(-2px)";
              el.style.boxShadow = `0 4px 12px ${cfg.color}20`;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "#E5E7EB";
              el.style.background = "#fff";
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: cfg.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              {cfg.icon}
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#374151",
              }}
            >
              {cfg.label}
            </span>
            <span
              style={{
                fontSize: 10,
                color: "#9CA3AF",
                lineHeight: 1.3,
              }}
            >
              {cfg.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUESTION EDITOR FORM
// ═══════════════════════════════════════════════════════════════════════════════

interface QuestionDraft {
  text: string;
  type: QuestionType;
  required: boolean;
  placeholder: string;
  helperText: string;
  options: SurveyQuestionOption[];
  scaleMin: number;
  scaleMax: number;
  scaleMinLabel: string;
  scaleMaxLabel: string;
}

function QuestionEditorForm({
  draft,
  setDraft,
  onAdd,
  onCancel,
}: {
  draft: QuestionDraft;
  setDraft: (d: QuestionDraft | ((prev: QuestionDraft) => QuestionDraft)) => void;
  onAdd: () => void;
  onCancel: () => void;
}) {
  const config = QUESTION_TYPE_CONFIG[draft.type];
  const needsOptions = ["single-choice", "multiple-choice", "dropdown"].includes(draft.type);
  const isScale = draft.type === "scale";

  const addOption = () => {
    setDraft((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          id: `opt-${Date.now()}`,
          label: "",
          value: "",
        },
      ],
    }));
  };

  const updateOption = (id: string, field: "label" | "value", val: string) => {
    setDraft((prev) => ({
      ...prev,
      options: prev.options.map((o) =>
        o.id === id ? { ...o, [field]: val, value: field === "label" ? val.toLowerCase().replace(/\s+/g, "-") : o.value } : o
      ),
    }));
  };

  const removeOption = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      options: prev.options.filter((o) => o.id !== id),
    }));
  };

  const canAdd =
    draft.text.trim() &&
    (!needsOptions || draft.options.filter((o) => o.label.trim()).length >= 2);

  return (
    <div
      style={{
        background: "#fff",
        border: `2px solid ${config.color}40`,
        borderRadius: 16,
        overflow: "hidden",
        animation: "popIn 0.2s ease",
      }}
    >
      {/* Editor Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 18px",
          background: config.bg,
          borderBottom: `1px solid ${config.color}20`,
        }}
      >
        <span style={{ fontSize: 20 }}>{config.icon}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: config.color }}>
            New {config.label} Question
          </div>
          <div style={{ fontSize: 11, color: config.color + "99", fontWeight: 500 }}>
            {config.description}
          </div>
        </div>
      </div>

      <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Question Text */}
        <FormField label="Question Text" required>
          <input
            style={inputStyle}
            value={draft.text}
            onChange={(e) => setDraft((prev) => ({ ...prev, text: e.target.value }))}
            placeholder="e.g. What is your current employment status?"
            autoFocus
          />
        </FormField>

        {/* Placeholder & Helper (for text types) */}
        {["short-text", "long-text", "email"].includes(draft.type) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Placeholder">
              <input
                style={inputStyle}
                value={draft.placeholder}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, placeholder: e.target.value }))
                }
                placeholder="e.g. Type here..."
              />
            </FormField>
            <FormField label="Helper Text">
              <input
                style={inputStyle}
                value={draft.helperText}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, helperText: e.target.value }))
                }
                placeholder="Optional hint"
              />
            </FormField>
          </div>
        )}

        {/* Scale Settings */}
        {isScale && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 10,
            }}
          >
            <FormField label="Min Value">
              <input
                type="number"
                style={inputStyle}
                value={draft.scaleMin}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    scaleMin: parseInt(e.target.value) || 1,
                  }))
                }
              />
            </FormField>
            <FormField label="Max Value">
              <input
                type="number"
                style={inputStyle}
                value={draft.scaleMax}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    scaleMax: parseInt(e.target.value) || 10,
                  }))
                }
              />
            </FormField>
            <FormField label="Min Label">
              <input
                style={inputStyle}
                value={draft.scaleMinLabel}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, scaleMinLabel: e.target.value }))
                }
                placeholder="e.g. Poor"
              />
            </FormField>
            <FormField label="Max Label">
              <input
                style={inputStyle}
                value={draft.scaleMaxLabel}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, scaleMaxLabel: e.target.value }))
                }
                placeholder="e.g. Excellent"
              />
            </FormField>
          </div>
        )}

        {/* Options Editor */}
        {needsOptions && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#6B7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Answer Options *
              </span>
              <button
                onClick={addOption}
                style={{
                  padding: "4px 12px",
                  borderRadius: 7,
                  border: `1.5px solid ${config.color}40`,
                  background: config.bg,
                  color: config.color,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                + Add Option
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {draft.options.map((opt, i) => (
                <div
                  key={opt.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    animation: "fadeUp 0.15s ease",
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: draft.type === "multiple-choice" ? 4 : "50%",
                      border: "2px solid #D1D5DB",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      color: "#9CA3AF",
                      fontWeight: 700,
                    }}
                  >
                    {draft.type === "multiple-choice" ? "" : ""}
                  </span>
                  <input
                    style={{
                      ...inputStyle,
                      flex: 1,
                      padding: "8px 12px",
                    }}
                    value={opt.label}
                    onChange={(e) => updateOption(opt.id, "label", e.target.value)}
                    placeholder={`Option ${i + 1}`}
                  />
                  <button
                    onClick={() => removeOption(opt.id)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      border: "none",
                      background: "#FEE2E2",
                      color: "#B91C1C",
                      cursor: "pointer",
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      flexShrink: 0,
                      transition: "all 0.15s",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {draft.options.length < 2 && (
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 11,
                  color: "#EF4444",
                  fontWeight: 600,
                }}
              >
                Please add at least 2 options
              </p>
            )}
          </div>
        )}

        {/* Required Toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            background: "#F9FAFB",
            borderRadius: 10,
            border: "1px solid #F3F4F6",
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
              Required question
            </div>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>
              Respondents must answer this question
            </div>
          </div>
          <button
            onClick={() =>
              setDraft((prev) => ({ ...prev, required: !prev.required }))
            }
            style={{
              width: 42,
              height: 24,
              borderRadius: 12,
              border: "none",
              background: draft.required ? config.color : "#D1D5DB",
              cursor: "pointer",
              position: "relative",
              transition: "background 0.2s",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#fff",
                position: "absolute",
                top: 3,
                left: draft.required ? 21 : 3,
                transition: "left 0.2s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
              }}
            />
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: 10,
              border: "1.5px solid #E5E7EB",
              background: "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              color: "#374151",
              transition: "all 0.15s",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onAdd}
            disabled={!canAdd}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: 10,
              border: "none",
              background: canAdd ? `linear-gradient(135deg, ${config.color}, ${config.color}CC)` : "#F3F4F6",
              color: canAdd ? "#fff" : "#9CA3AF",
              fontWeight: 800,
              fontSize: 13,
              cursor: canAdd ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              boxShadow: canAdd ? `0 4px 14px ${config.color}30` : "none",
            }}
          >
            ✓ Add Question
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════════

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "56px 24px" }}>
          <div style={{ fontSize: 52, marginBottom: 14, opacity: 0.15, fontWeight: 900, color: "#9CA3AF" }}>No Data</div>
      <p
        style={{
          fontWeight: 700,
          color: "#374151",
          fontSize: 15,
          marginBottom: 6,
        }}
      >
        No surveys found
      </p>
      <p style={{ color: "#9CA3AF", fontSize: 13, marginBottom: 24 }}>
        Adjust your filters or create your first survey.
      </p>
      <button
        onClick={onCreateClick}
        style={{
          padding: "10px 24px",
          borderRadius: 10,
          border: "none",
          background: "linear-gradient(135deg, #E53935, #B71C1C)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(229,57,53,0.3)",
        }}
      >
        + Create Survey
      </button>
    </div>
  );
}

// ─── Type mapping helpers ─────────────────────────────────────────────────────

const FRONTEND_TO_BACKEND_TYPE: Record<string, string> = {
  'short-text': 'TEXT',
  'long-text': 'TEXTAREA',
  'single-choice': 'RADIO',
  'multiple-choice': 'CHECKBOX',
  dropdown: 'SELECT',
  rating: 'RATING',
  'yes-no': 'RADIO',
  scale: 'NUMBER',
  date: 'DATE',
  email: 'TEXT',
};

const BACKEND_TO_FRONTEND_TYPE: Record<string, QuestionType> = {
  TEXT: 'short-text',
  TEXTAREA: 'long-text',
  RADIO: 'single-choice',
  CHECKBOX: 'multiple-choice',
  SELECT: 'dropdown',
  RATING: 'rating',
  NUMBER: 'scale',
  DATE: 'date',
};

const SURVEY_TYPE_TO_BACKEND: Record<string, string> = {
  '6-Month': 'SIX_MONTH',
  '12-Month': 'TWELVE_MONTH',
  '18-Month': 'EIGHTEEN_MONTH',
  '24-Month': 'TWENTY_FOUR_MONTH',
  Custom: 'CUSTOM',
};

const BACKEND_TO_SURVEY_TYPE: Record<string, SurveyType> = {
  SIX_MONTH: '6-Month',
  TWELVE_MONTH: '12-Month',
  EIGHTEEN_MONTH: '12-Month',
  TWENTY_FOUR_MONTH: '24-Month',
  CUSTOM: 'Custom',
};

function mapBackendSurvey(s: any): Survey {
  const questions: SurveyQuestion[] = [
    ...(s.questions ?? []).map((q: any) => ({
      id: q.id,
      text: q.questionText,
      type: (BACKEND_TO_FRONTEND_TYPE[q.questionType] ?? 'short-text') as QuestionType,
      required: q.required ?? false,
      placeholder: q.placeholder,
      helperText: q.helpText,
      options: Array.isArray(q.options) && q.options.length > 0
        ? q.options.map((o: string, i: number) => ({ id: `${q.id}-o${i}`, label: o, value: o }))
        : undefined,
    })),
    ...(s.sections ?? []).flatMap((sec: any) =>
      (sec.questions ?? []).map((q: any) => ({
        id: q.id,
        text: q.questionText,
        type: (BACKEND_TO_FRONTEND_TYPE[q.questionType] ?? 'short-text') as QuestionType,
        required: q.required ?? false,
        placeholder: q.placeholder,
        helperText: q.helpText,
        options: Array.isArray(q.options) && q.options.length > 0
          ? q.options.map((o: string, i: number) => ({ id: `${q.id}-o${i}`, label: o, value: o }))
          : undefined,
      }))
    ),
  ];

  const responsesCount = s._count?.responses ?? 0;
  const assignmentsCount = s._count?.assignments ?? 0;

  let status: SurveyStatus = 'DRAFT';
  if (s.isArchived) status = 'ARCHIVED';
  else if (!s.isActive) status = 'DRAFT';
  else if (responsesCount > 0 && responsesCount >= assignmentsCount && assignmentsCount > 0) status = 'COMPLETED';
  else if (responsesCount > 0 || assignmentsCount > 0) status = 'IN_PROGRESS';
  else if (s.scheduledAt) status = 'PENDING';
  else status = 'DRAFT';

  return {
    id: s.id as any,
    title: s.title,
    description: s.description ?? '',
    deadline: s.scheduledAt ? new Date(s.scheduledAt).toISOString().split('T')[0] : '',
    type: BACKEND_TO_SURVEY_TYPE[s.type] ?? 'Custom',
    status,
    questions,
    responses: responsesCount,
    sent: assignmentsCount,
    scheduledDate: s.scheduledAt ? new Date(s.scheduledAt).toISOString().split('T')[0] : null,
    createdAt: new Date(s.createdAt).toISOString().split('T')[0],
  };
}

function mapQuestionToBackend(q: SurveyQuestion, index: number) {
  return {
    questionText: q.text,
    questionType: FRONTEND_TO_BACKEND_TYPE[q.type] ?? 'TEXT',
    required: q.required,
    placeholder: q.placeholder,
    helpText: q.helperText,
    options: q.options?.map(o => o.label) ?? [],
    order: index,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function SurveyManagement() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [companyStats, setCompanyStats] = useState<any[]>([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [selectedAnalysisSurvey, setSelectedAnalysisSurvey] = useState<string | null>(null);
  const [responsesData, setResponsesData] = useState<any[]>([]);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [responsesModalTitle, setResponsesModalTitle] = useState('');
  const [completionReport, setCompletionReport] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    type: "All",
    status: "All",
    search: "",
  });
  const [showCreate, setShowCreate] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showDetail, setShowDetail] = useState<Survey | null>(null);
  const [selectedId, setSelectedId] = useState<any>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: "",
    type: "success",
  });
  const [activeTab, setActiveTab] = useState<"list" | "analytics">("list");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Create wizard state
  const [step, setStep] = useState(1);
  const [newSurvey, setNewSurvey] = useState({
    title: "",
    description: "",
    deadline: "",
    type: "6-Month" as SurveyType,
    questions: [] as SurveyQuestion[],
  });

  // Question builder state
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [typeCategory, setTypeCategory] = useState("All");
  const [questionDraft, setQuestionDraft] = useState<QuestionDraft>({
    text: "",
    type: "short-text",
    required: true,
    placeholder: "",
    helperText: "",
    options: [],
    scaleMin: 1,
    scaleMax: 10,
    scaleMinLabel: "",
    scaleMaxLabel: "",
  });

  // ─── Load surveys from API on mount ─────────────────────────────────────────
  useEffect(() => {
    loadSurveys();
    loadCompanyStats();
    loadCompletionReport();
  }, []);

  const loadSurveys = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await surveyService.getSurveys();
      setSurveys((data ?? []).map(mapBackendSurvey));
    } catch (e: any) {
      setApiError(e.message ?? 'Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyStats = async () => {
    try {
      const stats = await surveyService.getCompanyHiringStats();
      setCompanyStats(stats ?? []);
    } catch { /* not critical */ }
  };

  const loadCompletionReport = async () => {
    try {
      const report = await surveyService.getCompletionReport();
      setCompletionReport(report ?? []);
    } catch { /* not critical */ }
  };

  const loadAnalysis = async (surveyId: string, surveyTitle: string) => {
    setAnalysisLoading(true);
    setSelectedAnalysisSurvey(surveyTitle);
    try {
      const data = await surveyService.getSurveyAnalysis(surveyId);
      setAnalysisData(data);
    } catch { setAnalysisData(null); }
    finally { setAnalysisLoading(false); }
  };

  const loadResponses = async (surveyId: string, surveyTitle: string) => {
    setResponsesModalTitle(surveyTitle);
    setShowResponsesModal(true);
    try {
      const data = await surveyService.getResponsesBySurvey(surveyId);
      setResponsesData(data ?? []);
    } catch { setResponsesData([]); }
  };


  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ visible: true, message, type });
    toastTimer.current = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      3000
    );
  };

  const filteredSurveys = surveys.filter((s) => {
    if (filters.type !== "All" && s.type !== filters.type) return false;
    if (filters.status !== "All" && s.status !== filters.status) return false;
    if (
      filters.search &&
      !s.title.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });

  const handleSelectQuestionType = (type: QuestionType) => {
    const needsOptions = ["single-choice", "multiple-choice", "dropdown"].includes(type);
    setQuestionDraft({
      text: "",
      type,
      required: true,
      placeholder: "",
      helperText: "",
      options: needsOptions
        ? [
          { id: `opt-${Date.now()}-1`, label: "", value: "" },
          { id: `opt-${Date.now()}-2`, label: "", value: "" },
        ]
        : [],
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: "",
      scaleMaxLabel: "",
    });
    setShowTypeSelector(false);
    setIsEditingQuestion(true);
  };

  const handleAddQuestion = () => {
    if (!questionDraft.text.trim()) return;

    const q: SurveyQuestion = {
      id: `q-${Date.now()}`,
      text: questionDraft.text,
      type: questionDraft.type,
      required: questionDraft.required,
      placeholder: questionDraft.placeholder || undefined,
      helperText: questionDraft.helperText || undefined,
      options:
        questionDraft.options.filter((o) => o.label.trim()).length > 0
          ? questionDraft.options
            .filter((o) => o.label.trim())
            .map((o) => ({ ...o, value: o.value || o.label.toLowerCase().replace(/\s+/g, "-") }))
          : undefined,
      scaleMin: questionDraft.type === "scale" ? questionDraft.scaleMin : undefined,
      scaleMax: questionDraft.type === "scale" ? questionDraft.scaleMax : undefined,
      scaleMinLabel: questionDraft.type === "scale" ? questionDraft.scaleMinLabel || undefined : undefined,
      scaleMaxLabel: questionDraft.type === "scale" ? questionDraft.scaleMaxLabel || undefined : undefined,
    };

    setNewSurvey((s) => ({ ...s, questions: [...s.questions, q] }));

    // Reset draft
    setQuestionDraft({
      text: "",
      type: "short-text",
      required: true,
      placeholder: "",
      helperText: "",
      options: [],
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: "",
      scaleMaxLabel: "",
    });
    setIsEditingQuestion(false);

    showToast("Question added!", "success");
  };

  const handleRemoveQuestion = (id: string) => {
    setNewSurvey((s) => ({
      ...s,
      questions: s.questions.filter((q) => q.id !== id),
    }));
  };

  const handleToggleRequired = (id: string) => {
    setNewSurvey((s) => ({
      ...s,
      questions: s.questions.map((q) =>
        q.id === id ? { ...q, required: !q.required } : q
      ),
    }));
  };

  const handleCreateSurvey = async () => {
    if (!newSurvey.title || !newSurvey.deadline || newSurvey.questions.length === 0)
      return;
    try {
      const payload = {
        title: newSurvey.title,
        description: newSurvey.description || 'No description provided.',
        type: SURVEY_TYPE_TO_BACKEND[newSurvey.type] ?? 'CUSTOM',
        scheduledAt: newSurvey.deadline ? new Date(newSurvey.deadline).toISOString() : null,
        isActive: false,
        questions: newSurvey.questions.map(mapQuestionToBackend),
      };
      await surveyService.createSurvey(payload);
      await loadSurveys();
      setShowCreate(false);
      setNewSurvey({ title: '', description: '', deadline: '', type: '6-Month', questions: [] });
      setStep(1);
      setShowTypeSelector(false);
      setIsEditingQuestion(false);
      showToast('Survey created successfully!');
    } catch (e: any) {
      showToast(e.message ?? 'Failed to create survey', 'error');
    }
  };

  const handleSchedule = async () => {
    if (!selectedId || !scheduleDate) return;
    try {
      await surveyService.updateSurvey(String(selectedId), {
        scheduledAt: new Date(scheduleDate).toISOString(),
        isActive: true,
      });
      await loadSurveys();
      setShowSchedule(false);
      setScheduleDate('');
      setSelectedId(null);
      showToast('Survey scheduled and activated!');
    } catch (e: any) {
      showToast(e.message ?? 'Failed to schedule survey', 'error');
    }
  };

  const handleDelete = async (id: any) => {
    try {
      await surveyService.deleteSurvey(String(id));
      setSurveys((s) => s.filter((sv) => sv.id !== id));
      showToast('Survey archived.', 'info');
    } catch (e: any) {
      showToast(e.message ?? 'Failed to archive survey', 'error');
    }
  };

  const handleToggleActive = async (id: any, currentlyActive: boolean) => {
    try {
      if (currentlyActive) {
        await surveyService.deactivateSurvey(String(id));
        showToast('Survey deactivated.', 'info');
      } else {
        await surveyService.activateSurvey(String(id));
        showToast('Survey activated!', 'success');
      }
      await loadSurveys();
    } catch (e: any) {
      showToast(e.message ?? 'Failed to update survey', 'error');
    }
  };

  const handleExport = (_id: any, format: string) => {
    showToast(`Exported survey as ${format}`, 'info');
  };

  // Analytics
  const totalSent = surveys.reduce((a, s) => a + s.sent, 0);
  const totalResponses = surveys.reduce((a, s) => a + s.responses, 0);
  const totalQuestions = surveys.reduce((a, s) => a + s.questions.length, 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .sm-root { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        @keyframes popIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideDown { from { max-height: 0; opacity: 0; } to { max-height: 800px; opacity: 1; } }
        .sm-row { transition: all 0.15s ease; }
        .sm-row:hover { background: #FAFBFC !important; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
        .sm-tab-active { color: #E53935 !important; border-bottom: 2.5px solid #E53935; }
        .sm-tab { color: #9CA3AF; border-bottom: 2.5px solid transparent; padding-bottom: 8px; cursor: pointer; font-weight: 700; font-size: 13px; background: none; border-left: none; border-right: none; border-top: none; transition: color 0.2s; }
        .sm-tab:hover { color: #6B7280; }
        .filter-select { padding: 8px 12px; border-radius: 9px; border: 1.5px solid #E5E7EB; font-size: 12px; font-family: inherit; background: #F9FAFB; color: #374151; font-weight: 600; outline: none; cursor: pointer; transition: border-color 0.2s; }
        .filter-select:focus { border-color: #E53935; }
        .icon-btn { width: 32px; height: 32px; border-radius: 8px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; transition: all 0.15s; }
        .icon-btn:hover { transform: scale(1.1); }
        textarea { resize: vertical; }
        .sm-root input:focus, .sm-root select:focus, .sm-root textarea:focus { border-color: #E53935 !important; box-shadow: 0 0 0 3px rgba(229,57,53,0.08); }
        .sm-root input[type=date]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
        .sm-root ::-webkit-scrollbar { width: 6px; }
        .sm-root ::-webkit-scrollbar-track { background: transparent; }
        .sm-root ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }
      `}</style>

      <div
        className="sm-root"
        style={{
          width: "100%",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 0,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #E53935, #B71C1C)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  boxShadow: "0 4px 12px rgba(229,57,53,0.3)",
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>SM</span>
              </div>
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 23,
                    fontWeight: 900,
                    color: "#111827",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Survey Management
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: "#9CA3AF",
                    fontWeight: 500,
                  }}
                >
                  Create, schedule, and monitor graduate tracer surveys for ABET
                  accreditation
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setShowCreate(true);
              setStep(1);
              setShowTypeSelector(false);
            }}
            style={{
              padding: "11px 24px",
              background: "linear-gradient(135deg, #E53935, #B71C1C)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 16px rgba(229,57,53,0.35)",
              transition: "all 0.2s",
              letterSpacing: "0.01em",
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Create Survey
          </button>
        </div>

        {/* ── Stats ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
            gap: 0,
            marginBottom: 0,
          }}
        >
          <StatCard
            icon=""
            label="Total Surveys"
            value={surveys.length}
            accent="#6366F1"
          />
          <StatCard
            icon=""
            label="Pending"
            value={surveys.filter((s) => s.status === "PENDING").length}
            sub="Awaiting launch"
            accent="#F59E0B"
          />
          <StatCard
            icon=""
            label="Completed"
            value={surveys.filter((s) => s.status === "COMPLETED").length}
            sub="All responses in"
            accent="#10B981"
          />
          <StatCard
            icon=""
            label="Responses"
            value={totalResponses.toLocaleString()}
            sub={`${totalSent} sent total`}
            accent="#3B82F6"
          />
          <StatCard
            icon=""
            label="Questions"
            value={totalQuestions}
            sub="Across all surveys"
            accent="#8B5CF6"
          />
        </div>

        {/* ── Tabs ── */}
        <div
        style={{
          display: "flex",
          gap: 28,
          marginBottom: 0,
          borderBottom: "1px solid #F3F4F6",
        }}
        >
          {(["list", "analytics"] as const).map((t) => (
            <button
              key={t}
              className={`sm-tab ${activeTab === t ? "sm-tab-active" : ""}`}
              onClick={() => setActiveTab(t)}
              style={{ textTransform: "capitalize" }}
            >
              {t === "list" ? "Surveys" : "Analytics"}
            </button>
          ))}
        </div>

        {activeTab === "list" && (
          <>
            {/* Loading / Error */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9CA3AF', fontSize: 14, fontWeight: 600 }}>
                <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.3 }}>⟳</div>
                Loading surveys...
              </div>
            )}
            {apiError && !loading && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 18px', color: '#B91C1C', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                ⚠ {apiError} — <button onClick={loadSurveys} style={{ background: 'none', border: 'none', color: '#E53935', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Retry</button>
              </div>
            )}
            {!loading && (
            <>
            {/* ── Filters ── */}
            <div
              style={{
                background: "#fff",
                border: "none",
                borderBottom: "1px solid #F3F4F6",
                borderRadius: 0,
                padding: "8px 18px",
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 0,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#9CA3AF",
                  marginRight: 2,
                  letterSpacing: "0.06em",
                }}
              >
                FILTER
              </span>
              <select
                className="filter-select"
                value={filters.type}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, type: e.target.value }))
                }
              >
                <option value="All">All Types</option>
                <option value="6-Month">6-Month</option>
                <option value="12-Month">12-Month</option>
                <option value="24-Month">24-Month</option>
                <option value="Custom">Custom</option>
              </select>
              <select
                className="filter-select"
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, status: e.target.value }))
                }
              >
                <option value="All">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <input
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                placeholder="Search surveys..."
                style={{
                  ...inputStyle,
                  flex: 1,
                  minWidth: 160,
                  padding: "8px 12px",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  color: "#9CA3AF",
                  fontWeight: 600,
                }}
              >
                {filteredSurveys.length} result
                {filteredSurveys.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* ── Survey Cards ── */}
            {filteredSurveys.length === 0 ? (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #F3F4F6",
                  borderRadius: 16,
                }}
              >
                <EmptyState
                  onCreateClick={() => {
                    setShowCreate(true);
                    setStep(1);
                  }}
                />
              </div>
            ) : (
              <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      background: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
              >
                {filteredSurveys.map((s, i) => {
                  const tc = typeConfig[s.type] || typeConfig.Custom;
                  const isLast = i === filteredSurveys.length - 1;
                  return (
                    <div
                      key={s.id}
                      className="sm-row"
                      style={{
                        background: "#fff",
                        borderBottom: isLast ? "none" : "1px solid #F3F4F6",
                        padding: "14px 20px",
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: 14,
                        alignItems: "center",
                        animation: `fadeUp 0.2s ease ${i * 0.04}s both`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        {/* Title Row */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 800,
                              color: "#111827",
                            }}
                          >
                            {s.title}
                          </span>
                          <Badge
                            label={s.type}
                            bg={tc.bg}
                            color={tc.color}
                          />
                          <StatusBadge status={s.status} />
                        </div>

                        {/* Description */}
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            color: "#6B7280",
                            lineHeight: 1.5,
                            maxWidth: 520,
                          }}
                        >
                          {s.description}
                        </p>

                        {/* Meta row */}
                        <div
                          style={{
                            display: "flex",
                            gap: 18,
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              color: "#9CA3AF",
                              fontWeight: 600,
                            }}
                          >
                            Deadline:{" "}
                            <b style={{ color: "#374151" }}>{s.deadline}</b>
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: "#9CA3AF",
                              fontWeight: 600,
                            }}
                          >
                            Questions:{" "}
                            <b style={{ color: "#374151" }}>
                              {s.questions.length}
                            </b>
                          </span>
                          {s.questions.some(
                            (q) =>
                              q.type === "single-choice" ||
                              q.type === "multiple-choice" ||
                              q.type === "dropdown"
                          ) && (
                              <span
                                style={{
                                  fontSize: 11,
                                  color: "#9CA3AF",
                                  fontWeight: 600,
                                }}
                              >
                                <b style={{ color: "#374151" }}>
                                  {
                                    s.questions.filter(
                                      (q) =>
                                        q.type === "single-choice" ||
                                        q.type === "multiple-choice" ||
                                        q.type === "dropdown"
                                    ).length
                                  }
                                </b>{" "}
                                choice-based
                              </span>
                            )}
                          {s.scheduledDate && (
                            <span
                              style={{
                                fontSize: 11,
                                color: "#9CA3AF",
                                fontWeight: 600,
                              }}
                            >
                              Scheduled:{" "}
                              <b style={{ color: "#374151" }}>
                                {s.scheduledDate}
                              </b>
                            </span>
                          )}
                          {s.sent > 0 && (
                            <span
                              style={{
                                fontSize: 11,
                                color: "#9CA3AF",
                                fontWeight: 600,
                              }}
                            >
                              Responses:{" "}
                              <b style={{ color: "#374151" }}>
                                {s.responses}/{s.sent}
                              </b>{" "}
                              responses
                            </span>
                          )}
                        </div>

                        {/* Response bar */}
                        {s.sent > 0 && (
                          <div style={{ maxWidth: 320 }}>
                            <ProgressBar
                              value={s.responses}
                              max={s.sent}
                              color="#E53935"
                            />
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            title="View details"
                            className="icon-btn"
                            onClick={() => setShowDetail(s)}
                            style={{ background: '#EDE9FE', color: '#6D28D9' }}
                          >
                            <span style={{ fontSize: 11, fontWeight: 700 }}>👁</span>
                          </button>
                          <button
                            title="Analyze responses"
                            className="icon-btn"
                            onClick={() => { setActiveTab('analytics'); loadAnalysis(String(s.id), s.title); }}
                            style={{ background: '#D1FAE5', color: '#065F46' }}
                          >
                            <span style={{ fontSize: 11, fontWeight: 700 }}>📊</span>
                          </button>
                          <button
                            title="View individual responses"
                            className="icon-btn"
                            onClick={() => loadResponses(String(s.id), s.title)}
                            style={{ background: '#E0E7FF', color: '#3730A3' }}
                          >
                            <span style={{ fontSize: 11, fontWeight: 700 }}>📋</span>
                          </button>
                          <button
                            title={s.status === 'DRAFT' ? 'Activate Survey' : 'Schedule'}
                            className="icon-btn"
                            onClick={() => { setSelectedId(s.id); setShowSchedule(true); }}
                            style={{ background: '#DBEAFE', color: '#1D4ED8' }}
                          >
                            <span style={{ fontSize: 11, fontWeight: 700 }}>📅</span>
                          </button>
                          <button
                            title={s.status === 'ARCHIVED' ? 'Archived' : 'Archive'}
                            className="icon-btn"
                            onClick={() => handleDelete(s.id)}
                            style={{ background: '#FEE2E2', color: '#B91C1C' }}
                          >
                            <span style={{ fontSize: 11, fontWeight: 700 }}>🗑</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </>
            )}
          </>
        )}

        {/* ── Analytics Tab ── */}
        {activeTab === "analytics" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ── Survey Selector for Drill-Down ── */}
            <div style={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 16, padding: '18px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#374151' }}>Per-Survey Question Analysis</h4>
                {analysisLoading && <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>Loading...</span>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {surveys.map((s) => (
                  <button
                    key={String(s.id)}
                    onClick={() => loadAnalysis(String(s.id), s.title)}
                    style={{
                      padding: '6px 14px', borderRadius: 9, border: '1.5px solid',
                      borderColor: selectedAnalysisSurvey === s.title ? '#E53935' : '#E5E7EB',
                      background: selectedAnalysisSurvey === s.title ? '#E53935' : '#fff',
                      color: selectedAnalysisSurvey === s.title ? '#fff' : '#374151',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >{s.title}</button>
                ))}
              </div>
              {analysisData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{analysisData.surveyTitle}</span>
                    <span style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>
                      {analysisData.totalResponses} responses
                    </span>
                  </div>
                  {(analysisData.questionAnalytics ?? []).map((qa: any) => (
                    <div key={qa.questionId} style={{ background: '#FAFBFC', border: '1px solid #F3F4F6', borderRadius: 12, padding: '14px 16px' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginBottom: 10 }}>{qa.questionText}</div>
                      {Object.keys(qa.distribution).length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {Object.entries(qa.distribution)
                            .sort(([, a], [, b]) => (b as number) - (a as number))
                            .slice(0, 8)
                            .map(([ans, cnt]) => {
                              const pct = qa.totalAnswers > 0 ? Math.round(((cnt as number) / qa.totalAnswers) * 100) : 0;
                              return (
                                <div key={ans} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <span style={{ fontSize: 11, color: '#374151', minWidth: 120, fontWeight: 600 }}>{ans}</span>
                                  <div style={{ flex: 1, height: 8, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
                                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#E53935,#F87171)', borderRadius: 99, transition: 'width 0.5s ease' }} />
                                  </div>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', minWidth: 38, textAlign: 'right' }}>{cnt as number} ({pct}%)</span>
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: '#9CA3AF' }}>{qa.totalAnswers} text responses</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                !analysisLoading && <div style={{ textAlign: 'center', padding: '24px', color: '#9CA3AF', fontSize: 12, fontWeight: 600 }}>Select a survey above to view question analytics</div>
              )}
            </div>

            {/* ── Two-column: Response Rate + Status ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Response Rate Per Survey */}
              <div style={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 16, padding: 22 }}>
                <h4 style={{ margin: '0 0 18px', fontSize: 14, fontWeight: 800, color: '#374151' }}>Response Rate by Survey</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {completionReport.length > 0 ? completionReport.map((r: any) => (
                    <div key={r.surveyId}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{r.surveyTitle}</span>
                        <span style={{ fontSize: 11, color: '#6B7280' }}>{r.completed} / {r.totalAssigned}</span>
                      </div>
                      <ProgressBar value={r.completed} max={r.totalAssigned || 1} color="#E53935" />
                    </div>
                  )) : surveys.filter((s) => s.sent > 0).map((s) => (
                    <div key={String(s.id)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{s.title}</span>
                        <span style={{ fontSize: 11, color: '#6B7280' }}>{s.responses} / {s.sent}</span>
                      </div>
                      <ProgressBar value={s.responses} max={s.sent} color={s.type === '6-Month' ? '#6366F1' : s.type === '12-Month' ? '#10B981' : '#3B82F6'} />
                    </div>
                  ))}
                  {surveys.filter(s => s.sent > 0).length === 0 && completionReport.length === 0 && (
                    <div style={{ color: '#9CA3AF', fontSize: 12, textAlign: 'center', padding: '16px 0' }}>No survey responses yet</div>
                  )}
                </div>
              </div>

              {/* Status Breakdown */}
              <div style={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 16, padding: 22 }}>
                <h4 style={{ margin: '0 0 18px', fontSize: 14, fontWeight: 800, color: '#374151' }}>Status Breakdown</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Object.entries(statusConfig).map(([key, c]) => {
                    const count = surveys.filter((s) => s.status === key).length;
                    if (count === 0) return null;
                    return (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: c.bg, borderRadius: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: c.color }}>{c.label}</span>
                        <span style={{ fontSize: 18, fontWeight: 800, color: c.color }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Top Companies Hiring ASTU Graduates ── */}
            <div style={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 16, padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#374151' }}>🏢 Top Companies Hiring ASTU Graduates</h4>
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>Extracted from alumni employer responses across all surveys</p>
                </div>
                <button onClick={loadCompanyStats} style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #E5E7EB', background: '#F9FAFB', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: '#374151' }}>↻ Refresh</button>
              </div>
              {companyStats.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                  {companyStats.map((c, i) => (
                    <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: i < 3 ? 'linear-gradient(135deg,#FFF7ED,#FFFBEB)' : '#FAFBFC', border: `1.5px solid ${i < 3 ? '#FED7AA' : '#F3F4F6'}`, borderRadius: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? '#F59E0B' : i === 1 ? '#6B7280' : i === 2 ? '#B45309' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                        #{i + 1}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>{c.count} hire{c.count !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: '#9CA3AF', fontSize: 12, fontWeight: 600 }}>
                  No company data yet. Alumni employer fields from submitted surveys will appear here.
                </div>
              )}
            </div>

          </div>
        )}

        {/* ─── Individual Responses Modal ─── */}
        <Modal
          show={showResponsesModal}
          onClose={() => { setShowResponsesModal(false); setResponsesData([]); }}
          title="Individual Responses"
          subtitle={responsesModalTitle}
          width={720}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {responsesData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#9CA3AF', fontSize: 13, fontWeight: 600 }}>
                <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.2 }}>📋</div>
                No responses submitted yet for this survey.
              </div>
            ) : responsesData.map((resp: any, ri: number) => (
              <div key={resp.id || ri} style={{ background: '#FAFBFC', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: '#F3F4F6', borderBottom: '1px solid #E5E7EB' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#374151' }}>Response #{ri + 1}</span>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {resp.isDraft && <span style={{ fontSize: 10, background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>Draft</span>}
                    <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>
                      {resp.submittedAt ? new Date(resp.submittedAt).toLocaleString() : '—'}
                    </span>
                  </div>
                </div>
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(resp.answers ?? []).map((ans: any, ai: number) => (
                    <div key={ans.id || ai} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '8px 0', borderBottom: ai < (resp.answers.length - 1) ? '1px solid #F3F4F6' : 'none' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>
                        {ans.question?.questionText ?? `Question ${ai + 1}`}
                      </span>
                      <span style={{ fontSize: 12, color: '#111827', fontWeight: 500, wordBreak: 'break-word' }}>
                        {ans.answerText || <em style={{ color: '#9CA3AF' }}>No answer</em>}
                      </span>
                    </div>
                  ))}
                  {(!resp.answers || resp.answers.length === 0) && (
                    <span style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' }}>No answers recorded</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Modal>

        {/* ═══════════════════════════════════════════════════════════════
            CREATE SURVEY MODAL
            ═══════════════════════════════════════════════════════════════ */}
        <Modal
          show={showCreate}

          onClose={() => {
            setShowCreate(false);
            setStep(1);
            setShowTypeSelector(false);
            setIsEditingQuestion(false);
          }}
          title="Create New Survey"
          subtitle="Build a graduate tracer survey with custom question types"
          width={680}
        >
          {/* Step Indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
              justifyContent: "center",
            }}
          >
            {[
              { n: 1, label: "Details" },
              { n: 2, label: "Questions" },
              { n: 3, label: "Preview" },
            ].map(({ n, label }) => (
              <div
                key={n}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    background: step >= n ? "#E53935" : "#F3F4F6",
                    color: step >= n ? "#fff" : "#9CA3AF",
                    transition: "all 0.3s",
                  }}
                >
                  {n}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: step >= n ? "#E53935" : "#9CA3AF",
                  }}
                >
                  {label}
                </span>
                {n < 3 && (
                  <div
                    style={{
                      width: 36,
                      height: 2,
                      background: step > n ? "#E53935" : "#E5E7EB",
                      borderRadius: 1,
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ── Step 1: Details ── */}
          {step === 1 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <FormField label="Survey Title" required>
                <input
                  style={inputStyle}
                  value={newSurvey.title}
                  onChange={(e) =>
                    setNewSurvey((s) => ({ ...s, title: e.target.value }))
                  }
                  placeholder="e.g. 6-Month Employment Tracer Survey"
                />
              </FormField>
              <FormField label="Description">
                <textarea
                  style={{ ...inputStyle, height: 80 }}
                  value={newSurvey.description}
                  onChange={(e) =>
                    setNewSurvey((s) => ({
                      ...s,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe the purpose and goals of this survey..."
                />
              </FormField>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <FormField label="Survey Type" required>
                  <select
                    style={{ ...inputStyle, cursor: "pointer" }}
                    value={newSurvey.type}
                    onChange={(e) =>
                      setNewSurvey((s) => ({
                        ...s,
                        type: e.target.value as SurveyType,
                      }))
                    }
                  >
                    <option value="6-Month">6-Month Tracer</option>
                    <option value="12-Month">12-Month Tracer</option>
                    <option value="24-Month">24-Month Tracer</option>
                    <option value="Custom">Custom Survey</option>
                  </select>
                </FormField>
                <FormField label="Deadline" required>
                  <input
                    type="date"
                    style={inputStyle}
                    value={newSurvey.deadline}
                    onChange={(e) =>
                      setNewSurvey((s) => ({
                        ...s,
                        deadline: e.target.value,
                      }))
                    }
                  />
                </FormField>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 8,
                }}
              >
                <button
                  onClick={() => setShowCreate(false)}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: 10,
                    border: "1.5px solid #E5E7EB",
                    background: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    color: "#374151",
                    transition: "all 0.15s",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!newSurvey.title || !newSurvey.deadline}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: 10,
                    border: "none",
                    background:
                      newSurvey.title && newSurvey.deadline
                        ? "linear-gradient(135deg, #E53935, #B71C1C)"
                        : "#F3F4F6",
                    color:
                      newSurvey.title && newSurvey.deadline
                        ? "#fff"
                        : "#9CA3AF",
                    fontWeight: 800,
                    fontSize: 13,
                    cursor:
                      newSurvey.title && newSurvey.deadline
                        ? "pointer"
                        : "not-allowed",
                    boxShadow:
                      newSurvey.title && newSurvey.deadline
                        ? "0 4px 14px rgba(229,57,53,0.3)"
                        : "none",
                  }}
                >
                  Next → Add Questions
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Questions ── */}
          {step === 2 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Survey Info Banner */}
              <div
                style={{
                  background: "linear-gradient(135deg, #FFF7ED, #FEF3C7)",
                  border: "1px solid #FED7AA",
                  borderRadius: 12,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: "#92400E",
                      fontWeight: 700,
                    }}
                  >
                    {newSurvey.title}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      color: "#B45309",
                      fontWeight: 500,
                    }}
                  >
                    {newSurvey.type} · Due {newSurvey.deadline} ·{" "}
                    {newSurvey.questions.length} question
                    {newSurvey.questions.length !== 1 ? "s" : ""} added
                  </p>
                </div>
              </div>

              {/* Existing Questions */}
              {newSurvey.questions.length > 0 && (
                <div>
                  <p
                    style={{
                      margin: "0 0 10px",
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#6B7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Added Questions ({newSurvey.questions.length})
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {newSurvey.questions.map((q, i) => (
                      <QuestionBuilderCard
                        key={q.id}
                        question={q}
                        index={i}
                        onRemove={() => handleRemoveQuestion(q.id)}
                        onToggleRequired={() => handleToggleRequired(q.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Add Question Area */}
              {showTypeSelector ? (
                <div
                  style={{
                    background: "#F9FAFB",
                    border: "1.5px dashed #D1D5DB",
                    borderRadius: 14,
                    padding: 16,
                    animation: "popIn 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#374151",
                      }}
                    >
                      Choose Question Type
                    </span>
                    <button
                      onClick={() => setShowTypeSelector(false)}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 6,
                        border: "none",
                        background: "#F3F4F6",
                        color: "#6B7280",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <QuestionTypeSelector
                    onSelect={handleSelectQuestionType}
                    category={typeCategory}
                    setCategory={setTypeCategory}
                  />
                </div>
              ) : isEditingQuestion ? (
                <QuestionEditorForm
                  draft={questionDraft}
                  setDraft={setQuestionDraft}
                  onAdd={handleAddQuestion}
                  onCancel={() => {
                    setIsEditingQuestion(false);
                    setQuestionDraft((prev) => ({ ...prev, text: "" }));
                  }}
                />
              ) : (
                <button
                  onClick={() => setShowTypeSelector(true)}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: 14,
                    border: "2px dashed #D1D5DB",
                    background: "#FAFBFC",
                    color: "#6B7280",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.2s",
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "#E53935",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      fontWeight: 800,
                    }}
                  >
                    +
                  </span>
                  Add Question
                </button>
              )}

              {/* Navigation */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 4,
                }}
              >
                <button
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: 10,
                    border: "1.5px solid #E5E7EB",
                    background: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    color: "#374151",
                    transition: "all 0.15s",
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={newSurvey.questions.length === 0}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: 10,
                    border: "none",
                    background:
                      newSurvey.questions.length > 0
                        ? "linear-gradient(135deg, #3B82F6, #1D4ED8)"
                        : "#F3F4F6",
                    color:
                      newSurvey.questions.length > 0 ? "#fff" : "#9CA3AF",
                    fontWeight: 800,
                    fontSize: 13,
                    cursor:
                      newSurvey.questions.length > 0
                        ? "pointer"
                        : "not-allowed",
                    boxShadow:
                      newSurvey.questions.length > 0
                        ? "0 4px 14px rgba(59,130,246,0.3)"
                        : "none",
                    transition: "all 0.2s",
                  }}
                >
                  Preview Survey →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Preview ── */}
          {step === 3 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Survey Header Preview */}
              <div
                style={{
                  background: "linear-gradient(135deg, #1E3A5F, #0F172A)",
                  borderRadius: 14,
                  padding: "20px 22px",
                  color: "#fff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <Badge
                    label={newSurvey.type}
                    bg="rgba(255,255,255,0.15)"
                    color="#fff"
                  />
                  <Badge
                    label={`${newSurvey.questions.length} Questions`}
                    bg="rgba(255,255,255,0.15)"
                    color="#fff"
                  />
                </div>
                <h3
                  style={{
                    margin: "0 0 6px",
                    fontSize: 18,
                    fontWeight: 800,
                  }}
                >
                  {newSurvey.title}
                </h3>
                {newSurvey.description && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: "rgba(255,255,255,0.7)",
                      lineHeight: 1.5,
                    }}
                  >
                    {newSurvey.description}
                  </p>
                )}
                <p
                  style={{
                    margin: "10px 0 0",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.5)",
                    fontWeight: 600,
                  }}
                >
                  Deadline: {newSurvey.deadline}
                </p>
              </div>

              {/* Questions Preview */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {newSurvey.questions.map((q, i) => (
                  <div key={q.id} style={{ animation: `fadeUp 0.2s ease ${i * 0.05}s both` }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: "#E53935",
                        }}
                      >
                        Q{i + 1}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          color: "#9CA3AF",
                          background: "#F3F4F6",
                          padding: "1px 8px",
                          borderRadius: 99,
                          fontWeight: 600,
                        }}
                      >
                        {QUESTION_TYPE_CONFIG[q.type].label}
                      </span>
                      {q.required && (
                        <span
                          style={{
                            fontSize: 10,
                            color: "#EF4444",
                            fontWeight: 700,
                          }}
                        >
                          Required
                        </span>
                      )}
                    </div>
                    <QuestionPreview question={q} />
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 8,
                }}
              >
                <button
                  onClick={() => setStep(2)}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: 10,
                    border: "1.5px solid #E5E7EB",
                    background: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    color: "#374151",
                    transition: "all 0.15s",
                  }}
                >
                  ← Edit Questions
                </button>
                <button
                  onClick={handleCreateSurvey}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: 10,
                    border: "none",
                    background:
                      "linear-gradient(135deg, #10B981, #059669)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
                    transition: "all 0.2s",
                  }}
                >
                  ✓ Create Survey
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* ── Schedule Modal ── */}
        <Modal
          show={showSchedule}
          onClose={() => setShowSchedule(false)}
          title="Schedule Survey"
          subtitle="Set a launch date for automatic activation"
          width={440}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                background: "#EFF6FF",
                borderRadius: 10,
                padding: "12px 16px",
                border: "1px solid #BFDBFE",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: "#1E40AF",
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}
              >
                Set the date to automatically activate this survey and
                send notifications to graduates.
              </p>
            </div>
            <FormField label="Scheduled Launch Date" required>
              <input
                type="date"
                style={inputStyle}
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </FormField>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowSchedule(false)}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: 10,
                  border: "1.5px solid #E5E7EB",
                  background: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  color: "#374151",
                  transition: "all 0.15s",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                disabled={!scheduleDate}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: 10,
                  border: "none",
                  background: scheduleDate
                    ? "linear-gradient(135deg, #1E3A5F, #0F172A)"
                    : "#F3F4F6",
                  color: scheduleDate ? "#fff" : "#9CA3AF",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: scheduleDate ? "pointer" : "not-allowed",
                  boxShadow: scheduleDate
                    ? "0 4px 14px rgba(30,58,95,0.3)"
                    : "none",
                  transition: "all 0.2s",
                }}
              >
                Schedule →
              </button>
            </div>
          </div>
        </Modal>

        {/* ── Detail Modal ── */}
        <Modal
          show={!!showDetail}
          onClose={() => setShowDetail(null)}
          title="Survey Details"
          subtitle={showDetail?.title}
          width={580}
        >
          {showDetail && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <Badge
                  label={showDetail.type}
                  bg={typeConfig[showDetail.type]?.bg || "#F3F4F6"}
                  color={typeConfig[showDetail.type]?.color || "#6B7280"}
                />
                <StatusBadge status={showDetail.status} />
                <Badge
                  label={`Created: ${showDetail.createdAt}`}
                  bg="#F3F4F6"
                  color="#6B7280"
                />
              </div>
              <div>
                <p
                  style={{
                    margin: "0 0 6px",
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  {showDetail.title}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: "#6B7280",
                    lineHeight: 1.5,
                  }}
                >
                  {showDetail.description}
                </p>
              </div>

              {/* Stats Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 10,
                }}
              >
                {[
                  {
                    label: "Responses",
                    value: showDetail.responses,
                    color: "#3B82F6",
                  },
                  {
                    label: "Sent",
                    value: showDetail.sent,
                    color: "#6366F1",
                  },
                  {
                    label: "Questions",
                    value: showDetail.questions.length,
                    color: "#8B5CF6",
                  },
                  {
                    label: "Response Rate",
                    value:
                      showDetail.sent > 0
                        ? `${Math.round(
                          (showDetail.responses / showDetail.sent) * 100
                        )}%`
                        : "—",
                    color: "#10B981",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      background: "#F9FAFB",
                      borderRadius: 10,
                      padding: "10px 14px",
                      textAlign: "center",
                      border: "1px solid #F3F4F6",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: stat.color,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#9CA3AF",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {showDetail.sent > 0 && (
                <div>
                  <p
                    style={{
                      margin: "0 0 6px",
                      fontSize: 11,
                      color: "#9CA3AF",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Response Progress
                  </p>
                  <ProgressBar
                    value={showDetail.responses}
                    max={showDetail.sent}
                    color="#E53935"
                  />
                </div>
              )}

              {/* Questions List */}
              <div>
                <p
                  style={{
                    margin: "0 0 10px",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#6B7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Questions ({showDetail.questions.length})
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {showDetail.questions.map((q, i) => {
                    const qConfig = QUESTION_TYPE_CONFIG[q.type];
                    return (
                      <div
                        key={q.id}
                        style={{
                          display: "flex",
                          gap: 10,
                          padding: "10px 14px",
                          background: "#F9FAFB",
                          borderRadius: 10,
                          alignItems: "center",
                          border: "1px solid #F3F4F6",
                        }}
                      >
                        <span
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            background: qConfig.color + "20",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 800,
                            color: qConfig.color,
                            flexShrink: 0,
                          }}
                        >
                          {i + 1}
                        </span>
                        <span style={{ fontSize: 13 }}>{qConfig.icon}</span>
                        <span
                          style={{
                            fontSize: 12,
                            color: "#374151",
                            flex: 1,
                            fontWeight: 500,
                          }}
                        >
                          {q.text}
                        </span>
                        {q.required && (
                          <span
                            style={{
                              fontSize: 9,
                              color: "#EF4444",
                              fontWeight: 700,
                              background: "#FEF2F2",
                              padding: "1px 5px",
                              borderRadius: 3,
                            }}
                          >
                            REQ
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: 10,
                            color: qConfig.color,
                            fontWeight: 700,
                            background: qConfig.bg,
                            padding: "2px 8px",
                            borderRadius: 99,
                          }}
                        >
                          {qConfig.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Export Buttons */}
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                {["CSV", "PDF", "JSON"].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => handleExport(showDetail.id, fmt)}
                      style={{
                        flex: 1,
                        padding: "9px",
                        borderRadius: 9,
                        border: "1.5px solid #E5E7EB",
                        background: "#fff",
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: "pointer",
                        color: "#374151",
                        transition: "all 0.15s",
                      }}
                    >
                      {fmt}
                    </button>
                ))}
              </div>
            </div>
          )}
        </Modal>

        {/* ── Toast ── */}
        <Toast
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
        />
      </div>
    </>
  );
}