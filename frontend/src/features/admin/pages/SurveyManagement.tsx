import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Eye,
  FilePlus2,
  GripVertical,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Save,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import AdminStatCard from '../components/AdminStatCard';

type SurveyStatus = 'Draft' | 'Active' | 'Closed' | 'Scheduled';
type SurveyType = '6-month' | '12-month' | '24-month' | 'Custom';
type QuestionType = 'Multiple Choice' | 'Yes/No' | 'Text' | 'Rating Scale' | 'Dropdown';
type WaveStatus = 'Scheduled' | 'Processing' | 'Sent';

type SurveyRecord = {
  id: string;
  name: string;
  targetBatch: string;
  type: SurveyType;
  sent: number;
  responded: number;
  completion: number;
  status: SurveyStatus;
  questions: string[];
};

type Question = {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
};

type SurveyWave = {
  id: string;
  batchYear: string;
  surveyType: SurveyType;
  scheduledDate: string;
  estimatedRecipients: number;
  status: WaveStatus;
};

const surveyRows: SurveyRecord[] = [
  {
    id: 'SUR-001',
    name: '6-Month Employment Tracer',
    targetBatch: '2024',
    type: '6-month',
    sent: 1240,
    responded: 842,
    completion: 67.9,
    status: 'Active',
    questions: [
      'Current employment status',
      'How long did it take to secure employment?',
      'What industry are you working in?',
      'How relevant was your ASTU program to your job?',
    ],
  },
  {
    id: 'SUR-002',
    name: '12-Month Career Alignment',
    targetBatch: '2023',
    type: '12-month',
    sent: 1168,
    responded: 987,
    completion: 84.5,
    status: 'Scheduled',
    questions: [
      'Current salary range',
      'Have you switched roles since graduation?',
      'Which skills are most useful in your work?',
    ],
  },
  {
    id: 'SUR-003',
    name: '24-Month Graduate Outcomes',
    targetBatch: '2022',
    type: '24-month',
    sent: 1112,
    responded: 912,
    completion: 82.0,
    status: 'Closed',
    questions: [
      'Employment progression since graduation',
      'Further study enrollment',
      'Would you recommend your program?',
    ],
  },
  {
    id: 'SUR-004',
    name: 'Campus Experience Review',
    targetBatch: '2025',
    type: 'Custom',
    sent: 0,
    responded: 0,
    completion: 0,
    status: 'Draft',
    questions: [
      'How would you rate support services?',
      'Would you recommend ASTU to others?',
    ],
  },
];

const overallCompletionData = [
  { name: 'Completed', value: 68, color: '#1D9E75' },
  { name: 'Incomplete', value: 32, color: '#E8A020' },
];

const responseRateData = [
  { month: 'Jan', rate: 42 },
  { month: 'Feb', rate: 51 },
  { month: 'Mar', rate: 57 },
  { month: 'Apr', rate: 63 },
  { month: 'May', rate: 68 },
  { month: 'Jun', rate: 72 },
];

const employmentStatusData = [
  { name: 'Employed Full-Time', value: 58, color: '#1D9E75' },
  { name: 'Self-Employed', value: 18, color: '#003580' },
  { name: 'Further Study', value: 14, color: '#E8A020' },
  { name: 'Seeking Work', value: 10, color: '#E24B4A' },
];

const salaryRangeData = [
  { range: 'Below 10k', value: 8 },
  { range: '10k-20k', value: 18 },
  { range: '20k-35k', value: 31 },
  { range: '35k-50k', value: 24 },
  { range: '50k+', value: 19 },
];

const industryData = [
  { industry: 'Telecom', value: 33 },
  { industry: 'Finance', value: 27 },
  { industry: 'Manufacturing', value: 20 },
  { industry: 'Government', value: 18 },
  { industry: 'Healthcare', value: 12 },
];

const waves: SurveyWave[] = [
  { id: 'WAV-001', batchYear: '2024', surveyType: '6-month', scheduledDate: '2026-06-05', estimatedRecipients: 1240, status: 'Scheduled' },
  { id: 'WAV-002', batchYear: '2023', surveyType: '12-month', scheduledDate: '2026-06-12', estimatedRecipients: 1168, status: 'Processing' },
  { id: 'WAV-003', batchYear: '2022', surveyType: '24-month', scheduledDate: '2026-06-20', estimatedRecipients: 1112, status: 'Sent' },
  { id: 'WAV-004', batchYear: '2025', surveyType: 'Custom', scheduledDate: '2026-07-01', estimatedRecipients: 860, status: 'Scheduled' },
];

const surveyTypeOptions: SurveyType[] = ['6-month', '12-month', '24-month', 'Custom'];
const batchOptions = ['2020', '2021', '2022', '2023', '2024'];
const questionTypes: QuestionType[] = ['Multiple Choice', 'Yes/No', 'Text', 'Rating Scale', 'Dropdown'];

function badgeVariant(status: SurveyStatus | WaveStatus) {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Closed':
      return 'neutral';
    case 'Draft':
      return 'warning';
    case 'Scheduled':
      return 'default';
    case 'Processing':
      return 'warning';
    case 'Sent':
      return 'success';
    default:
      return 'default';
  }
}

function statusClass(status: SurveyStatus | WaveStatus) {
  switch (status) {
    case 'Active':
    case 'Sent':
      return 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15';
    case 'Draft':
    case 'Processing':
      return 'bg-[#E8A020]/10 text-[#B87900] border-[#E8A020]/20';
    case 'Closed':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'Scheduled':
      return 'bg-[#003580]/10 text-[#003580] border-[#003580]/15';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function typeChip(type: SurveyType) {
  switch (type) {
    case '6-month':
      return 'bg-[#003580]/10 text-[#003580] border-[#003580]/15';
    case '12-month':
      return 'bg-[#E8A020]/10 text-[#B87900] border-[#E8A020]/20';
    case '24-month':
      return 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15';
    case 'Custom':
      return 'bg-violet-100 text-violet-700 border-violet-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function SurveyCardLabel({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-semibold">{children}</span>;
}

function SelectBox({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export default function SurveyManagement() {
  const [activeTab, setActiveTab] = useState<'all' | 'create' | 'analytics' | 'waves'>('all');
  const [expandedSurvey, setExpandedSurvey] = useState<string | null>(surveyRows[0]?.id ?? null);
  const [selectedSurveyType, setSelectedSurveyType] = useState<SurveyType>('6-month');
  const [selectedBatches, setSelectedBatches] = useState<string[]>(['2024']);
  const [surveyTitle, setSurveyTitle] = useState('ASTU 6-Month Employment Tracer');
  const [sendDate, setSendDate] = useState('2026-06-10');
  const [deadline, setDeadline] = useState('2026-06-25');
  const [questions, setQuestions] = useState<Question[]>([
    { id: 'q-1', text: 'What is your current employment status?', type: 'Multiple Choice', required: true },
    { id: 'q-2', text: 'How long did it take to secure your first role?', type: 'Dropdown', required: true },
    { id: 'q-3', text: 'What skills are you using most often?', type: 'Text', required: false },
  ]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const surveySummaryCards = [
    { title: 'Active Surveys', value: '12', icon: ClipboardList, tone: 'blue' as const, trend: '4 scheduled soon' },
    { title: 'Average Completion', value: '68.4%', icon: Sparkles, tone: 'green' as const, trend: '+5.2% vs last year' },
    { title: 'Scheduled Waves', value: '8', icon: CalendarDays, tone: 'gold' as const, trend: 'Next send in 5 days' },
    { title: 'Total Responses', value: '9,428', icon: Send, tone: 'purple' as const, trend: '+611 this week' },
  ];

  const overallCompletion = 68;
  const totalRecipients = 1240 + 1168 + 1112 + 860;

  const toggleBatch = (batch: string) => {
    setSelectedBatches((current) =>
      current.includes(batch) ? current.filter((item) => item !== batch) : [...current, batch]
    );
  };

  const addQuestion = () => {
    setQuestions((current) => [
      ...current,
      {
        id: `q-${Date.now()}`,
        text: '',
        type: 'Multiple Choice',
        required: true,
      },
    ]);
  };

  const updateQuestion = (id: string, patch: Partial<Question>) => {
    setQuestions((current) => current.map((question) => (question.id === id ? { ...question, ...patch } : question)));
  };

  const removeQuestion = (id: string) => {
    setQuestions((current) => current.filter((question) => question.id !== id));
  };

  const moveQuestion = (id: string, direction: 'up' | 'down') => {
    setQuestions((current) => {
      const index = current.findIndex((question) => question.id === id);
      if (index < 0) return current;
      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const clone = [...current];
      const [item] = clone.splice(index, 1);
      clone.splice(nextIndex, 0, item);
      return clone;
    });
  };

  const renderTabButton = (key: 'all' | 'create' | 'analytics' | 'waves', label: string) => {
    const isActive = activeTab === key;
    return (
      <button
        key={key}
        type="button"
        onClick={() => setActiveTab(key)}
        className={[
          'rounded-[8px] px-4 py-2 text-sm font-semibold transition-colors',
          isActive ? 'bg-[#003580] text-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]' : 'text-slate-600 hover:bg-slate-100',
        ].join(' ')}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Survey Management"
        subtitle="Create tracer surveys and monitor completion status."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Survey Management' }]}
        actions={<AdminBadge variant="success">Automation Ready</AdminBadge>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {surveySummaryCards.map((card) => (
          <AdminStatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            tone={card.tone}
            trend={card.trend}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 rounded-[10px] border border-slate-200 bg-white p-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        {renderTabButton('all', 'All Surveys')}
        {renderTabButton('create', 'Create Survey')}
        {renderTabButton('analytics', 'Survey Analytics')}
        {renderTabButton('waves', 'Scheduled Waves')}
      </div>

      {activeTab === 'all' && (
        <section className="rounded-[10px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Survey Name', 'Target Batch', 'Type', 'Sent', 'Responded', 'Completion%', 'Status', 'Actions'].map((header) => (
                    <th key={header} className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {surveyRows.map((survey) => {
                  const expanded = expandedSurvey === survey.id;
                  return (
                    <React.Fragment key={survey.id}>
                      <tr className="border-b border-slate-100 hover:bg-slate-50/70">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setExpandedSurvey(expanded ? null : survey.id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100"
                              aria-label={`Toggle ${survey.name}`}
                            >
                              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                            <div>
                              <div className="font-semibold text-slate-900">{survey.name}</div>
                              <div className="mt-1 text-xs text-slate-500">Tap to expand question list</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{survey.targetBatch}</td>
                        <td className="px-4 py-4">
                          <SurveyCardLabel>
                            <span className={typeChip(survey.type)}>{survey.type}</span>
                          </SurveyCardLabel>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{survey.sent.toLocaleString()}</td>
                        <td className="px-4 py-4 text-slate-600">{survey.responded.toLocaleString()}</td>
                        <td className="px-4 py-4 text-slate-600">{survey.completion.toFixed(1)}%</td>
                        <td className="px-4 py-4">
                          <AdminBadge variant={badgeVariant(survey.status)} className={statusClass(survey.status)}>
                            {survey.status}
                          </AdminBadge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-slate-500 hover:bg-slate-100">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-slate-500 hover:bg-slate-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expanded && (
                        <tr>
                          <td colSpan={8} className="border-b border-slate-100 bg-slate-50/50 px-4 py-4">
                            <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                              <div className="flex items-center gap-2">
                                <ClipboardList className="h-4 w-4 text-[#003580]" />
                                <h4 className="text-sm font-semibold text-slate-900">Questions</h4>
                              </div>
                              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                                {survey.questions.map((question, index) => (
                                  <li key={question} className="flex items-start gap-2">
                                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-500">
                                      {index + 1}
                                    </span>
                                    <span>{question}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'create' && (
        <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <SectionCard title="Survey Details" subtitle="Define the survey scope and delivery schedule.">
            <div className="space-y-4">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Survey title</span>
                <input
                  value={surveyTitle}
                  onChange={(event) => setSurveyTitle(event.target.value)}
                  className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
                />
              </label>

              <SelectBox label="Survey type">
                <select
                  value={selectedSurveyType}
                  onChange={(event) => setSelectedSurveyType(event.target.value as SurveyType)}
                  className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
                >
                  {surveyTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </SelectBox>

              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Target batch</span>
                <div className="grid grid-cols-2 gap-2">
                  {batchOptions.map((batch) => {
                    const selected = selectedBatches.includes(batch);
                    return (
                      <button
                        key={batch}
                        type="button"
                        onClick={() => toggleBatch(batch)}
                        className={[
                          'rounded-[8px] border px-3 py-2.5 text-sm font-medium',
                          selected ? 'border-[#003580] bg-[#003580]/5 text-[#003580]' : 'border-slate-200 text-slate-600 hover:bg-slate-50',
                        ].join(' ')}
                      >
                        {batch}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Send date</span>
                  <input
                    type="date"
                    value={sendDate}
                    onChange={(event) => setSendDate(event.target.value)}
                    className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Deadline</span>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(event) => setDeadline(event.target.value)}
                    className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
                  />
                </label>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Question Builder" subtitle="Build and order survey questions dynamically.">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AdminBadge variant="neutral">{questions.length} questions</AdminBadge>
                <AdminBadge variant="success">Draft Mode</AdminBadge>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="rounded-[8px] border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
                >
                  <Plus className="h-4 w-4" />
                  Add Question
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={question.id} className="rounded-[10px] border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-2 pt-1 text-slate-400">
                      <button type="button" className="cursor-grab rounded-md p-1 hover:bg-slate-100" aria-label="Drag question">
                        <GripVertical className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveQuestion(question.id, 'up')}
                        className="rounded-md p-1 hover:bg-slate-100"
                        aria-label="Move up"
                      >
                        <ChevronRight className="h-3.5 w-3.5 -rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveQuestion(question.id, 'down')}
                        className="rounded-md p-1 hover:bg-slate-100"
                        aria-label="Move down"
                      >
                        <ChevronRight className="h-3.5 w-3.5 rotate-90" />
                      </button>
                    </div>

                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-900">Question {index + 1}</div>
                        <button
                          type="button"
                          onClick={() => removeQuestion(question.id)}
                          className="inline-flex items-center gap-2 rounded-[8px] px-3 py-2 text-xs font-semibold text-[#E24B4A] hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>

                      <input
                        value={question.text}
                        onChange={(event) => updateQuestion(question.id, { text: event.target.value })}
                        placeholder="Enter question text"
                        className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
                      />

                      <div className="grid gap-3 md:grid-cols-[minmax(0,220px)_1fr_auto] md:items-center">
                        <select
                          value={question.type}
                          onChange={(event) => updateQuestion(question.id, { type: event.target.value as QuestionType })}
                          className="rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
                        >
                          {questionTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>

                        <div className="text-xs text-slate-500">
                          {question.required ? 'Required question' : 'Optional question'}
                        </div>

                        <button
                          type="button"
                          onClick={() => updateQuestion(question.id, { required: !question.required })}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-white"
                        >
                          <span
                            className={[
                              'h-2.5 w-2.5 rounded-full',
                              question.required ? 'bg-[#1D9E75]' : 'bg-slate-300',
                            ].join(' ')}
                          />
                          {question.required ? 'Required' : 'Optional'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-[#003580] hover:underline">
                <Sparkles className="h-4 w-4" />
                Save as Draft
              </button>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setPreviewOpen(true)} className="rounded-[8px] border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  Preview
                </button>
                <button type="button" className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110">
                  <Send className="h-4 w-4" />
                  Schedule &amp; Send
                </button>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid gap-4 xl:grid-cols-2">
          <SectionCard title="Survey Analytics" subtitle="Completion, response, and outcome distributions from survey responses.">
            <div className="grid gap-4 lg:grid-cols-2">
              <ChartCard title="Overall Completion" subtitle="Survey response completion">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={overallCompletionData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105} paddingAngle={3}>
                        {overallCompletionData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                        <Label value={`${overallCompletion}%`} position="center" className="text-2xl font-semibold fill-slate-900" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Response Rate Over Time" subtitle="Monthly survey response trend">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={responseRateData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                      <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="rate" stroke="#003580" strokeWidth={3} dot={{ r: 4, fill: '#003580' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Employment Status Breakdown" subtitle="Distribution of respondent employment outcomes">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={employmentStatusData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={88}>
                        {employmentStatusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Average Salary Range" subtitle="Average salary distribution among respondents">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salaryRangeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                      <XAxis dataKey="range" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#E8A020" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <div className="lg:col-span-2">
                <ChartCard title="Industry Distribution" subtitle="Where respondents are currently working">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={industryData} layout="vertical" margin={{ left: 10, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" horizontal={false} />
                        <XAxis type="number" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="industry" width={140} tick={{ fill: '#334155', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#1D9E75" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === 'waves' && (
        <SectionCard title="Scheduled Waves" subtitle="Upcoming automated survey sends and delivery states.">
          <div className="space-y-4">
            {waves.map((wave, index) => (
              <div key={wave.id} className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#003580]/10 text-[#003580]">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900">Batch {wave.batchYear}</h3>
                        <AdminBadge variant="neutral">{wave.surveyType}</AdminBadge>
                        <AdminBadge variant={badgeVariant(wave.status)} className={statusClass(wave.status)}>
                          {wave.status}
                        </AdminBadge>
                      </div>
                      <div className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                        <div>
                          <span className="block text-[11px] uppercase tracking-[0.14em] text-slate-400">Scheduled date</span>
                          {wave.scheduledDate}
                        </div>
                        <div>
                          <span className="block text-[11px] uppercase tracking-[0.14em] text-slate-400">Estimated recipients</span>
                          {wave.estimatedRecipients.toLocaleString()}
                        </div>
                        <div>
                          <span className="block text-[11px] uppercase tracking-[0.14em] text-slate-400">Wave</span>
                          #{index + 1}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="rounded-[8px] border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                      Cancel
                    </button>
                    <button type="button" className="rounded-[8px] border border-[#003580]/20 px-4 py-2.5 text-sm font-semibold text-[#003580] hover:bg-[#003580]/5">
                      Reschedule
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <AdminModal
        open={previewOpen}
        title="Survey Preview"
        onClose={() => setPreviewOpen(false)}
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              Close Preview
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Title</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{surveyTitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminBadge variant="default">{selectedSurveyType}</AdminBadge>
            <AdminBadge variant="neutral">Batches: {selectedBatches.join(', ')}</AdminBadge>
            <AdminBadge variant="success">Send: {sendDate}</AdminBadge>
            <AdminBadge variant="warning">Deadline: {deadline}</AdminBadge>
          </div>
          <div className="space-y-3">
            {questions.map((question, index) => (
              <div key={question.id} className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Question {index + 1}</p>
                    <p className="mt-1 text-sm text-slate-700">{question.text || 'Untitled question'}</p>
                  </div>
                  <AdminBadge variant={question.required ? 'success' : 'neutral'}>
                    {question.required ? 'Required' : 'Optional'}
                  </AdminBadge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminModal>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
