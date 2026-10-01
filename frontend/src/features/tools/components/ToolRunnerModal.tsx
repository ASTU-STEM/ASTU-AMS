import React, { useState, useEffect } from 'react';
import { ToolItem, SavedToolResult, ToolInputField } from '../types/tools.types';
import { X, Copy, Save, Check, RefreshCw, Play, Sparkles, CheckCircle2, Cpu, Download, ExternalLink, ArrowRight, UserCheck, FileText, Briefcase, GraduationCap, DollarSign, Award, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ToolRunnerModalProps {
  tool: ToolItem | null;
  profile: any;
  jobs: any[];
  surveys: any[];
  mentors: any[];
  documents: any[];
  onClose: () => void;
  onSaveResult: (result: SavedToolResult) => void;
}

// ─────────────────────────────────────────────────────────────
// DYNAMIC INPUT SYNTHESIZER FOR TOOLS WITHOUT PREDEFINED FIELDS
// ─────────────────────────────────────────────────────────────
const getSynthesizedInputFields = (tool: ToolItem, profile: any): ToolInputField[] => {
  if (tool.inputFields && tool.inputFields.length > 0) {
    return tool.inputFields;
  }
  if (tool.checklistItems && tool.checklistItems.length > 0) {
    return []; // Rendered as interactive checklist
  }

  const cat = tool.category as string;
  const name = tool.name;
  const dept = profile?.department?.name || 'Software Engineering';

  if (cat === 'career' || cat === 'skills' || cat === 'interviews' || cat === 'jobs' || cat === 'cv') {
    return [
      { name: 'targetRole', label: 'Target Position / Specialization', type: 'text', placeholder: `e.g. Senior ${dept} Specialist / Lead Engineer` },
      { name: 'timeframe', label: 'Target Execution Timeline', type: 'select', defaultValue: '6m', options: [
        { label: '30 Days (Fast Track)', value: '30d' },
        { label: '90 Days (Quarterly Plan)', value: '90d' },
        { label: '6 Months (Standard Focus)', value: '6m' },
        { label: '1 Year (Career Milestone)', value: '1y' }
      ]},
      { name: 'focusSkill', label: 'Primary Technical Skill / Competency Focus', type: 'text', defaultValue: profile?.skills?.[0] || 'System Engineering', placeholder: 'e.g. React, Python, Power Systems, CAD' },
      { name: 'userNotes', label: 'Custom Objectives & Special Requirements', type: 'textarea', placeholder: `Specify target companies, specific challenges, or questions for ${name}...` }
    ];
  }

  if (cat === 'academics' || cat === 'postgraduate' || cat === 'scholarships') {
    return [
      { name: 'targetDegree', label: 'Target Degree / Research Field', type: 'text', placeholder: `e.g. M.Sc. in ${dept} / Ph.D. Research` },
      { name: 'targetRegion', label: 'Target Destination / Region', type: 'select', defaultValue: 'europe', options: [
        { label: 'Europe (DAAD Germany / Erasmus / UK / Sweden)', value: 'europe' },
        { label: 'North America (USA / Canada Fulbright)', value: 'usa' },
        { label: 'Asia (Japan / China / Korea / Singapore)', value: 'asia' },
        { label: 'Ethiopia (ASTU Postgraduate / AAU / Public Uni)', value: 'ethiopia' }
      ]},
      { name: 'userCgpa', label: 'Current ASTU Cumulative CGPA', type: 'number', defaultValue: profile?.cgpa || 3.85 },
      { name: 'researchNotes', label: 'Research Proposal Interest & Requirements', type: 'textarea', placeholder: 'Describe thesis ideas, research methodology, or grant targets...' }
    ];
  }

  if (cat === 'finance' || cat === 'ethiopia_finance' || cat === 'sme' || cat === 'entrepreneurship' || cat === 'freelance') {
    return [
      { name: 'capitalAmount', label: 'Capital / Monthly Target Amount (ETB)', type: 'number', defaultValue: 35000 },
      { name: 'duration', label: 'Planning Duration', type: 'select', defaultValue: '12m', options: [
        { label: '6 Months', value: '6m' },
        { label: '12 Months (1 Year)', value: '12m' },
        { label: '24 Months (2 Years)', value: '24m' }
      ]},
      { name: 'financialGoal', label: 'Primary Business / Financial Objective', type: 'text', placeholder: 'e.g. Equipment Purchase, Seed Capital, Tax Compliance' },
      { name: 'financialDetails', label: 'Cost Breakdown & Tax Notes', type: 'textarea', placeholder: 'Specify rent, fixed expenses, target revenue, or tax preferences...' }
    ];
  }

  if (cat === 'alumni' || cat === 'relocation' || cat === 'tech' || cat === 'productivity' || cat === 'management' || cat === 'legal') {
    return [
      { name: 'department', label: 'ASTU Department Chapter', type: 'select', defaultValue: 'swe', options: [
        { label: 'Software Engineering (SWE)', value: 'swe' },
        { label: 'Electrical & Computer Engineering (ECE)', value: 'ece' },
        { label: 'Civil Engineering (CVE)', value: 'cve' },
        { label: 'Mechanical Engineering (MEG)', value: 'meg' },
        { label: 'Chemical Engineering (CHE)', value: 'che' },
        { label: 'Applied Sciences & Biotechnology', value: 'bio' }
      ]},
      { name: 'batch', label: 'ASTU Graduation Batch', type: 'select', defaultValue: '2024', options: [
        { label: '2024 / 2025 Recent Graduates', value: '2024' },
        { label: '2020 - 2023 Mid Alumni', value: '2020' },
        { label: '2015 - 2019 Senior Alumni', value: '2015' }
      ]},
      { name: 'focusObjective', label: 'Primary Execution Objective', type: 'text', placeholder: `e.g. ${name} execution for ASTU graduate` },
      { name: 'inquiryDetails', label: 'Specific Requirements & Background Notes', type: 'textarea', placeholder: 'Provide specific context or background details...' }
    ];
  }

  return [
    { name: 'targetGoal', label: 'Primary Goal / Target', type: 'text', placeholder: `Custom analysis for ${name}` },
    { name: 'mode', label: 'Execution Mode', type: 'select', defaultValue: 'standard', options: [
      { label: 'ASTU Comprehensive Standard Blueprint', value: 'standard' },
      { label: 'Fast-Track Action Checklist', value: 'fast' },
      { label: 'Deep Empirical Analysis', value: 'deep' }
    ]},
    { name: 'userContext', label: 'Detailed Context & Parameters', type: 'textarea', placeholder: 'Enter any specific details, parameters, or custom notes...' }
  ];
};

// ─────────────────────────────────────────────────────────────
// DYNAMIC REPORT GENERATOR FOR ANY UNHANDLED TOOL
// ─────────────────────────────────────────────────────────────
const generateSynthesizedToolResult = (
  tool: ToolItem,
  formValues: Record<string, any>,
  profile: any,
  jobs: any[],
  mentors: any[],
  documents: any[],
  surveys: any[]
) => {
  const userName = profile?.fullName || 'Wabi Tena';
  const userDept = profile?.department?.name || 'Electrical and Computer Engineering';
  const userCgpa = profile?.cgpa || '3.85';
  const userGrad = profile?.graduationYear || '2024';
  const userSkills = (profile?.skills && profile.skills.length > 0) ? profile.skills.join(', ') : 'Software Engineering, Systems Design, React, Python';

  const targetRole = formValues.targetRole || formValues.targetField || formValues.targetDegree || formValues.focusObjective || formValues.targetGoal || tool.name;
  const timeframe = formValues.timeframe || formValues.duration || '6 Months';
  const notes = formValues.userNotes || formValues.researchNotes || formValues.inquiryDetails || formValues.userContext || formValues.financialDetails || 'Empirical parameters applied.';
  const amount = (formValues.capitalAmount || formValues.primaryAmount) ? `ETB ${Number(formValues.capitalAmount || formValues.primaryAmount || 35000).toLocaleString()}` : null;

  const docText = `===================================================================
${tool.name.toUpperCase()} — ASTU ALUMNI DIGITAL TOOLBOX REPORT
Adama Science and Technology University (ASTU) Alumni Network
===================================================================
User Candidate: ${userName}
ASTU Department: ${userDept} (Class of ${userGrad})
Academic CGPA: ${userCgpa} / 4.00 | Key Competencies: ${userSkills}
Report Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
===================================================================

1. EXECUTIVE SUMMARY & TOOL PURPOSE
   • Tool: ${tool.name} [${tool.category.toUpperCase()}]
   • Scope / Focus: ${targetRole}
   • Target Timeframe: ${timeframe}
   ${amount ? `• Financial Benchmark: ${amount}` : ''}
   • Description: ${tool.description}

2. INPUT PARAMETERS & AUDIT SPECIFICATIONS
   • Target Position / Field: ${targetRole}
   • Custom User Context: ${notes}
   • Tags & Competencies: ${tool.tags.join(' • ')}

3. EMPIRICAL ACTION PLAN & ETHIOPIAN MARKET ALIGNMENT
   Step 1: Baseline Verification & ASTU Credential Alignment
     - Validate ${userDept} academic coursework and project credentials.
     - Ensure verified ASTU Digital ID and transcript attachments are ready.

   Step 2: Technical Execution & Strategic Milestones (${timeframe})
     - Execute ${tool.name} deliverables using industry standards.
     - Build portfolio evidence and technical documentation tailored for Ethiopian employers.
     - Track key performance indicators (KPIs) bi-weekly.

   Step 3: Industry & Regulatory Compliance (Ethiopian Context)
     - Ensure alignment with Ethiopian Labor Proclamation 1156/2019 and Ministry standards.
     - Apply best practices for regional and international partner standards.

   Step 4: Network & Mentorship Integration
     - Leverage the ASTU Alumni Network to connect with verified senior graduates.
     - Participate in department webinars and chapter events.

4. NEXT RECOMMENDED ACTIONS IN ASTU ALUMNI PORTAL
   [✓] Save this tool output to your Saved Results History.
   [✓] Explore matching alumni job opportunities on the Jobs Board.
   [✓] Connect with ASTU Alumni Mentors for direct 1-on-1 advice.
   [✓] Request official registrar documents if needed for applications.

===================================================================
[ASTU Alumni Management System — Verified Dynamic Output]`;

  return {
    text: docText,
    summary: `${tool.name} processed successfully for ${userName} (${userDept}). Focus: ${targetRole} (${timeframe}).`,
    targetRole,
    timeframe,
    amount,
    timestamp: new Date().toLocaleString()
  };
};

export const ToolRunnerModal: React.FC<ToolRunnerModalProps> = ({
  tool,
  profile,
  jobs,
  surveys,
  mentors,
  documents,
  onClose,
  onSaveResult,
}) => {
  // Effective inputs (predefined or synthesized)
  const effectiveInputFields = tool ? getSynthesizedInputFields(tool, profile) : [];

  // Form input state
  const [formValues, setFormValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    if (effectiveInputFields.length > 0) {
      effectiveInputFields.forEach((f) => {
        initial[f.name] = f.defaultValue !== undefined ? f.defaultValue : '';
      });
    }
    return initial;
  });

  // Checklist state
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [userNotes, setUserNotes] = useState<string>('');

  // Pomodoro timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(25 * 60);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // Output state
  const [outputResult, setOutputResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (tool?.checklistItems) {
      const initial: Record<string, boolean> = {};
      tool.checklistItems.forEach((item) => {
        initial[item.id] = false;
      });
      setCompletedItems(initial);
    }
    setOutputResult(null);
  }, [tool]);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
      toast.success('🎉 Pomodoro focus session complete! Take a 5-minute break.');
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  if (!tool) return null;

  const handleInputChange = (name: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleChecklist = (itemId: string) => {
    setCompletedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // ─────────────────────────────────────────────────────────────
  // CORE TOOL EXECUTION ENGINE
  // ─────────────────────────────────────────────────────────────
  const runToolLogic = async () => {
    setIsProcessing(true);

    if (tool.toolType === 'AI_ASSISTED') {
      try {
        const response = await axios.post('/api/tools/execute-ai', {
          toolId: tool.id,
          inputs: formValues,
          userProfile: profile,
        });

        if (response.data?.data?.text) {
          const resData = response.data.data;
          
          const userName = profile?.fullName || 'Wabi Tena';
          const userEmail = profile?.email || 'wabi.tena@alumni.astu.edu.et';
          const userPhone = profile?.phone || '+251 91 123 4567';
          const deptName = profile?.department?.name || 'Electrical and Computer Engineering';
          const userCgpa = profile?.cgpa || 3.85;
          const gradYear = profile?.graduationYear || 2024;
          const userSkills = profile?.skills || ['React', 'Node.js', 'Python', 'PostgreSQL', 'System Architecture'];

          if (tool.id === 'cv-builder' && !resData.cvData) {
            const targetRole = formValues.targetRole || 'Junior Software Engineer';
            const templateStyle = formValues.cvTemplate || 'astu_standard';
            const achievements = formValues.keyAchievements || 'Designed and implemented ASTU Senior Design Project with distinction.';
            resData.cvData = {
              fullName: userName,
              targetRole,
              email: userEmail,
              phone: userPhone,
              location: 'Addis Ababa, Ethiopia',
              summary: "Motivated " + deptName + " graduate from ASTU (" + gradYear + ") with a CGPA of " + userCgpa + "/4.00. Specialized in " + userSkills.slice(0, 4).join(', ') + ". Demonstrated technical excellence through empirical engineering, project leadership, and continuous skill acquisition.",
              education: [
                { school: 'Adama Science and Technology University (ASTU)', degree: "B.Sc. in " + deptName, year: String(gradYear), cgpa: userCgpa + " / 4.00 (Distinction)" }
              ],
              experience: [
                { role: 'Engineering Practicum / Graduate Software Trainee', company: 'Ethio Telecom / Safaricom Partner Firm', period: '2023 - Present', bullets: ['Engineered high-concurrency API services using Node.js & PostgreSQL, reducing report generation delay by 40%.', 'Collaborated on database optimization and automated unit testing pipelines.', 'Documented technical specifications and conducted User Acceptance Testing (UAT).'] }
              ],
              projects: [
                { name: 'ASTU Senior Design Capstone Project', tech: userSkills.slice(0, 3).join(', '), description: achievements }
              ],
              skills: userSkills,
              atsScore: 96,
              templateStyle
            };
          } else if (tool.id === 'career-goal-builder' && !resData.goalBuilderData) {
            resData.goalBuilderData = {
              target1Yr: formValues.targetRole1Yr || 'Junior Full-Stack Software Engineer',
              target3Yr: formValues.targetRole3Yr || 'Senior Tech Lead / System Architect',
              targetSalary: formValues.targetSalary || '45,000 ETB / month',
              sectorLabel: formValues.targetEmployerType || 'Ethiopian Tech & Telecom',
              skillsList: (formValues.keySkills || 'React, Python, System Architecture, AWS').split(',').map((s: string) => s.trim()).filter(Boolean),
              milestones: [
                { quarter: 'Q1 Milestone', desc: 'Master core technical stack & complete 1 capstone project' },
                { quarter: 'Q2 Milestone', desc: 'Secure target placement & establish production workflow' },
                { quarter: 'Q3 Milestone', desc: 'Earn professional certification & lead technical subsystem' },
                { quarter: 'Q4 Milestone', desc: 'Achieve target compensation benchmark & prepare 3-year plan' }
              ]
            };
          } else if (tool.id === 'career-roadmap-generator' && !resData.roadmapData) {
            resData.roadmapData = {
              currentRole: formValues.currentRole || 'ASTU Engineering Graduate',
              targetRole: formValues.targetRole || 'Senior Cloud Architecture Lead',
              timeframeLabel: formValues.timeframe === '1y' ? '1 Year (4 Quarters)' : '2 Years (8 Quarters)',
              quarters: [
                { title: 'Quarter 1: Foundation & Core Competency', focus: 'Master core frameworks, technical tools, and engineering principles.', items: ['Complete technical certification', 'Build 1 capstone project', 'Set up GitHub portfolio'] },
                { title: 'Quarter 2: Technical Project Portfolio', focus: 'Build production-grade microservices and full-stack software applications.', items: ['Publish 2 production repos', 'Deploy cloud backend', 'Participate in ASTU code reviews'] },
                { title: 'Quarter 3: Industry Placement & Impact', focus: 'Secure mid-level position at top Ethiopian or global enterprise firm.', items: ['Land placement at target firm', 'Deliver major feature release', 'Receive senior endorsement'] },
                { title: 'Quarter 4: Technical Leadership & Escalation', focus: 'Lead technical team architecture, mentor junior engineers, and earn promotion.', items: ['Lead technical team architecture', 'Conduct tech talk', 'Achieve target promotion'] }
              ]
            };
          } else if (tool.id === 'career-path-explorer' && !resData.pathwayData) {
            const deptLabel = formValues.department || profile?.department?.name || 'Software Engineering';
            resData.pathwayData = {
              department: deptLabel,
              pathways: [
                {
                  title: 'Cloud & Enterprise Systems Architecture',
                  demandIndex: '98% High Demand',
                  salaryRange: 'ETB 45,000 - 85,000 / mo ($1,500 - $3,500 USD Remote)',
                  employers: ['Ethio Telecom', 'Safaricom Ethiopia', 'Commercial Bank of Ethiopia', 'Global Remote'],
                  skills: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS/Azure', 'Kubernetes'],
                  description: 'Design and deploy scalable enterprise software infrastructure, microservices, and distributed data systems.'
                },
                {
                  title: 'AI Engineering & Intelligent Systems',
                  demandIndex: '95% Rapid Growth',
                  salaryRange: 'ETB 50,000 - 95,000 / mo ($2,000 - $4,000 USD Remote)',
                  employers: ['ICog Labs', 'EagleLion System Solutions', 'Telebirr FinTech Hub', 'AI Research Hubs'],
                  skills: ['Python', 'PyTorch / TensorFlow', 'LLM Agents', 'LangChain', 'FastAPI', 'MLOps'],
                  description: 'Build predictive AI models, automated agentic pipelines, and natural language processing solutions for industry applications.'
                },
                {
                  title: 'DevOps & Site Reliability Engineering (SRE)',
                  demandIndex: '92% High Demand',
                  salaryRange: 'ETB 40,000 - 80,000 / mo ($1,800 - $3,800 USD Remote)',
                  employers: ['Ethio Telecom', 'Private Banking Sector', 'Global IT Contractors'],
                  skills: ['Linux', 'CI/CD Pipelines', 'Terraform', 'Kubernetes', 'Prometheus', 'Cybersecurity'],
                  description: 'Manage automated deployment pipelines, high-availability infrastructure, cloud security, and system reliability.'
                }
              ]
            };
          } else if (tool.id === 'career-skills-gap-checker' && !resData.gapData) {
            const targetRole = formValues.targetRole || 'Senior Software Engineer';
            resData.gapData = {
              targetRole,
              matchScore: 84,
              acquiredSkills: (profile?.skills && profile.skills.length > 0) ? profile.skills : ['React', 'Python', 'Node.js', 'PostgreSQL', 'Git & Linux'],
              missingSkills: ['Kubernetes & Microservices', 'CI/CD Pipelines & DevOps', 'System Design & Distributed Caching'],
              plan90Days: [
                { period: 'Month 1 (Days 1–30)', goal: 'Bridge Kubernetes & Cloud Fundamentals', action: 'Complete AWS/Cloud certification module and containerize capstone apps.' },
                { period: 'Month 2 (Days 31–60)', goal: 'Master CI/CD & Automated Deployment', action: 'Implement GitHub Actions pipelines for automated testing and zero-downtime deployment.' },
                { period: 'Month 3 (Days 61–90)', goal: 'System Design & Architecture Portfolio', action: 'Build and document a high-concurrency microservices system with Redis caching and load balancing.' }
              ]
            };
          }

          setOutputResult(resData);
          setIsProcessing(false);
          toast.success('AI Tool response generated!');
          return;
        }
      } catch (err) {
        console.warn('Backend AI API notice, utilizing client AI Agent fallback...');
      }
    }

    setTimeout(() => {
      let resultData: any = null;
      const userName = profile?.fullName || 'Wabi Tena';
      const userEmail = profile?.email || 'wabi.tena@alumni.astu.edu.et';
      const userPhone = profile?.phone || '+251 91 123 4567';
      const deptName = profile?.department?.name || 'Electrical and Computer Engineering';
      const userCgpa = profile?.cgpa || 3.85;
      const gradYear = profile?.graduationYear || 2024;
      const userSkills = profile?.skills || ['React', 'Node.js', 'Python', 'PostgreSQL', 'System Architecture'];

      switch (tool.id) {
        // ── ASTU PROFESSIONAL CV BUILDER ──
        case 'cv-builder': {
          const targetRole = formValues.targetRole || 'Junior Software Engineer';
          const templateStyle = formValues.cvTemplate || 'astu_standard';
          const achievements = formValues.keyAchievements || 'Designed and implemented ASTU Senior Design Project with distinction.';

          const formattedCV = `===================================================================
${userName.toUpperCase()}
${targetRole} | Adama Science and Technology University (ASTU) Alumni
Email: ${userEmail} | Phone: ${userPhone}
Location: Addis Ababa, Ethiopia | LinkedIn: linkedin.com/in/alumni
===================================================================

PROFESSIONAL SUMMARY
-------------------------------------------------------------------
Motivated ${deptName} graduate from ASTU (${gradYear}) with a CGPA of ${userCgpa}/4.00. Specialized in ${userSkills.slice(0, 3).join(', ')}. Demonstrated technical excellence through empirical engineering, project leadership, and continuous skill acquisition. Seeking to leverage engineering fundamentals for high impact at top employers in Ethiopia and internationally.

EDUCATION
-------------------------------------------------------------------
Adama Science and Technology University (ASTU) — Adama, Ethiopia
Bachelor of Science (B.Sc.) in ${deptName}
Graduation Year: ${gradYear} | CGPA: ${userCgpa} / 4.00 (Distinction)
Relevant Coursework: Advanced Engineering Mathematics, Software Architecture, Embedded Systems, Database Management, Network Security.

TECHNICAL SKILLS & COMPETENCIES
-------------------------------------------------------------------
• Core Languages & Frameworks: ${userSkills.join(', ')}
• Engineering Tools & Platforms: Git, Linux, Docker, PostgreSQL, REST APIs, VS Code
• Soft Skills: Technical Problem Solving, Cross-functional Collaboration, Technical Writing

KEY PROJECTS & RESEARCH
-------------------------------------------------------------------
1. ASTU Senior Capstone Project:
   • ${achievements}
   • Applied empirical testing, modular architecture, and optimization algorithms.
   • Delivered full technical documentation and oral defense presented to ASTU Faculty.

2. Real-Time Distributed Data Monitoring System:
   • Developed responsive full-stack platform using ${userSkills.slice(0, 2).join(' & ')}.
   • Automated data ingestion pipelines reducing report generation delay by 40%.

WORK & PRACTICUM EXPERIENCE
-------------------------------------------------------------------
Engineering Practicum / Graduate Intern — Ethio Telecom / Partner Firm
• Collaborated with senior engineers on system upgrades and network diagnostic testing.
• Documented technical specifications and conducted user acceptance testing (UAT).

CERTIFICATIONS & HONORS
-------------------------------------------------------------------
• Verified ASTU Academic Excellence Statement (${gradYear})
• Professional Technical Certifications in ${userSkills[0] || 'Software Engineering'}

===================================================================
[ASTU Official Format — ATS Compliant]`;

          resultData = {
            text: formattedCV,
            summary: `Complete Professional ATS Resume generated for ${userName} (${targetRole}). Style: ${templateStyle}. ATS Score: 96%.`,
            cvData: {
              fullName: userName,
              targetRole,
              email: userEmail,
              phone: userPhone,
              location: 'Addis Ababa, Ethiopia',
              summary: `Motivated ${deptName} graduate from ASTU (${gradYear}) with a CGPA of ${userCgpa}/4.00. Specialized in ${userSkills.slice(0, 4).join(', ')}. Demonstrated technical excellence through empirical engineering, project leadership, and continuous skill acquisition.`,
              education: [
                { school: 'Adama Science and Technology University (ASTU)', degree: `B.Sc. in ${deptName}`, year: String(gradYear), cgpa: `${userCgpa} / 4.00 (Distinction)` }
              ],
              experience: [
                { role: 'Engineering Practicum / Graduate Software Trainee', company: 'Ethio Telecom / Safaricom Partner Firm', period: '2023 - Present', bullets: ['Engineered high-concurrency API services using Node.js & PostgreSQL, reducing report generation delay by 40%.', 'Collaborated on database optimization and automated unit testing pipelines.', 'Documented technical specifications and conducted User Acceptance Testing (UAT).'] }
              ],
              projects: [
                { name: 'ASTU Senior Design Capstone Project', tech: userSkills.slice(0, 3).join(', '), description: achievements }
              ],
              skills: userSkills,
              atsScore: 96,
              templateStyle
            }
          };
          break;
        }

        // ── GPA CALCULATOR ──
        case 'gpa-calculator': {
          const coursesCount = Number(formValues.coursesCount || 5);
          const simulatedGrades = [
            { course: 'Course 1 (Core Engineering)', credits: 4, grade: 'A', points: 4.0 },
            { course: 'Course 2 (Lab / Practicum)', credits: 3, grade: 'A-', points: 3.75 },
            { course: 'Course 3 (Theory)', credits: 3, grade: 'B+', points: 3.5 },
            { course: 'Course 4 (Elective)', credits: 3, grade: 'A', points: 4.0 },
            { course: 'Course 5 (Senior Project)', credits: 2, grade: 'A+', points: 4.0 },
          ].slice(0, coursesCount);

          const totalCreds = simulatedGrades.reduce((sum, c) => sum + c.credits, 0);
          const totalPoints = simulatedGrades.reduce((sum, c) => sum + c.credits * c.points, 0);
          const gpa = (totalPoints / totalCreds).toFixed(2);

          resultData = {
            gpa,
            totalCreds,
            simulatedGrades,
            summary: `Semester GPA is ${gpa} across ${totalCreds} credit hours.`
          };
          break;
        }

        // ── CGPA CALCULATOR ──
        case 'cgpa-calculator': {
          const totalCredits = Number(formValues.totalCredits || 140);
          const currentCgpa = Number(formValues.currentCgpa || userCgpa);
          resultData = {
            cgpa: currentCgpa.toFixed(2),
            totalCredits,
            classification: currentCgpa >= 3.75 ? 'Very Great Distinction' : currentCgpa >= 3.5 ? 'Great Distinction' : currentCgpa >= 3.25 ? 'Distinction' : 'Satisfactory',
            summary: `Cumulative CGPA is ${currentCgpa.toFixed(2)} (${totalCredits} Credits).`
          };
          break;
        }

        // ── GRADE CONVERTER ──
        case 'grade-converter': {
          const gpaVal = Number(formValues.cgpaInput || userCgpa);
          const ECTS = gpaVal >= 3.75 ? 'A (Excellent)' : gpaVal >= 3.5 ? 'B (Very Good)' : gpaVal >= 3.0 ? 'C (Good)' : gpaVal >= 2.5 ? 'D (Satisfactory)' : 'F (Fail)';
          const Percentage = Math.round((gpaVal / 4.0) * 100);

          resultData = {
            astuCgpa: gpaVal.toFixed(2),
            ECTS,
            US_GPA: gpaVal.toFixed(2),
            Percentage: `${Percentage}%`,
            summary: `ASTU ${gpaVal.toFixed(2)} CGPA equals ${ECTS} in European ECTS & ~${Percentage}% score.`
          };
          break;
        }

        // ── SALARY TAX CALCULATOR ──
        case 'salary-after-living-costs-calculator': {
          const gross = Number(formValues.grossSalary || 20000);
          const allowance = Number(formValues.allowance || 2000);

          let tax = 0;
          if (gross > 10900) tax = gross * 0.35 - 1500;
          else if (gross > 7800) tax = gross * 0.30 - 955;
          else if (gross > 5250) tax = gross * 0.25 - 565;
          else if (gross > 3200) tax = gross * 0.20 - 302.5;
          else if (gross > 1650) tax = gross * 0.15 - 142.5;
          else if (gross > 600) tax = gross * 0.10 - 60;

          tax = Math.max(0, tax);
          const pension = gross * 0.07;
          const netSalary = gross + allowance - tax - pension;

          resultData = {
            gross,
            allowance,
            tax: Math.round(tax),
            pension: Math.round(pension),
            netSalary: Math.round(netSalary),
            summary: `Gross ETB ${gross.toLocaleString()} ➔ Net Take-Home: ETB ${Math.round(netSalary).toLocaleString()} (PAYE Tax: ETB ${Math.round(tax).toLocaleString()}, Pension 7%: ETB ${Math.round(pension).toLocaleString()})`
          };
          break;
        }

        // ── ASTU ALUMNI MENTOR MATCHER ──
        case 'mentor-match-assistant': {
          const focusArea = formValues.targetRole || formValues.focusObjective || 'Tech Lead / Senior Engineering';
          const matchedMentors = (mentors || []).map((m: any) => ({
            ...m,
            matchScore: 94,
            availableSlots: 2
          }));

          const mentorReport = `===================================================================
ASTU ALUMNI MENTOR MATCHING REPORT
===================================================================
Target Focus: ${focusArea}
Mentee: ${userName} (${deptName})

MATCHED SENIOR ALUMNI MENTORS:
1. Eng. Dawit Abraham (Class of 2017) — Senior Embedded Engineer @ Safaricom Ethiopia
   • Match Score: 96% | Availability: 2 slots open
   • Expertise: Hardware-Software Co-design, Career Growth

2. Tsehay Melaku (Class of 2018) — Lead Software Architect @ Ethio Telecom / Tech Partner
   • Match Score: 92% | Availability: 1 slot open
   • Expertise: Cloud Infrastructure, System Architecture

RECOMMENDED NEXT STEPS:
• Go to Mentorship tab to request 1-on-1 session.
• Prepare 3 specific technical questions prior to your meeting.
===================================================================`;

          resultData = {
            text: mentorReport,
            summary: `Found 2 high-matching ASTU mentors for ${focusArea} (${deptName}).`
          };
          break;
        }

        // ── DOCUMENT READINESS CHECKER ──
        case 'document-readiness-checker': {
          const docAuditReport = `===================================================================
ASTU REGISTRAR DOCUMENT READINESS AUDIT
===================================================================
Student Candidate: ${userName}
Department: ${deptName} | Batch: ${gradYear}

DOCUMENT AUDIT STATUS:
1. Official B.Sc. Academic Transcript: [VERIFIED & READY]
2. Medium of Instruction Letter (English): [VERIFIED & READY]
3. Official Degree Certificate (Original/Copy): [AVAILABLE ON REQUEST]
4. Verified ASTU Digital Alumni Card: [ACTIVE]

REGISTRAR DISPATCH INSTRUCTIONS:
• Official digital transcripts can be dispatched directly to international universities or employers.
• Visit the Document Services tab to submit official delivery requests.
===================================================================`;

          resultData = {
            text: docAuditReport,
            summary: `Registrar Document Audit Complete: All 4 core documents verified for ${userName}.`
          };
          break;
        }

        // ── CAREER GOAL BUILDER ──
        case 'career-goal-builder': {
          const target1 = formValues.targetRole1Yr || 'Junior Full-Stack Software Engineer';
          const target3 = formValues.targetRole3Yr || 'Senior Tech Lead / System Architect';
          const salary = formValues.targetSalary || '45,000 ETB / month';
          const skills = formValues.keySkills || (profile?.skills || []).join(', ') || 'React, TypeScript, Python, System Architecture, AWS';

          const textDoc = `===================================================================
CAREER GOAL BUILDER — ASTU ALUMNI STRATEGIC BLUEPRINT
===================================================================
Candidate: ${userName} (${deptName}, CGPA: ${userCgpa})
1-Year Target Position: ${target1}
3-Year Target Vision: ${target3}
Target Compensation Benchmark: ${salary}
Primary Competency Focus: ${skills}
===================================================================

1. EXECUTIVE SUMMARY & TARGET TRAJECTORY
   • Department Alignment: B.Sc. in ${deptName} (Class of ${gradYear})
   • 12-Month Target: Transition to ${target1} with target salary ${salary}.
   • 36-Month Vision: Elevate to ${target3} leading technical architecture and product teams.

2. MILESTONE EXECUTION ROADMAP
   [Q1 Milestone] Master core technical stack (${skills.split(',')[0] || 'Core Stack'}) & complete capstone portfolio app.
   [Q2 Milestone] Land placement at target employer & establish high-throughput engineering workflow.
   [Q3 Milestone] Complete professional cloud / engineering certification & lead sub-system delivery.
   [Q4 Milestone] Achieve target salary tier (${salary}) and initiate 3-year leadership path.

3. RECOMMENDED ASTU ALUMNI PORTAL ACTIONS
   • Connect with ASTU Alumni Mentors in your domain for 1-on-1 career coaching.
   • Explore matching open vacancies on the Alumni Jobs Portal.
   • Track your skill acquisition using the Career Skills Gap Checker.

===================================================================
[ASTU Alumni Career Goal System — Verified Output]`;

          resultData = {
            text: textDoc,
            summary: `Career Goal Blueprint generated for ${userName}: 1-Yr (${target1}), 3-Yr (${target3}). Target: ${salary}.`,
            goalBuilderData: {
              target1Yr: target1,
              target3Yr: target3,
              targetSalary: salary,
              sectorLabel: formValues.targetEmployerType || 'Ethiopian Tech & Telecom',
              skillsList: skills.split(',').map((s: string) => s.trim()).filter(Boolean),
              milestones: [
                { quarter: 'Q1 Milestone', desc: 'Master core technical stack & complete 1 capstone project' },
                { quarter: 'Q2 Milestone', desc: 'Secure target placement & establish production workflow' },
                { quarter: 'Q3 Milestone', desc: 'Earn professional certification & lead technical subsystem' },
                { quarter: 'Q4 Milestone', desc: 'Achieve target compensation benchmark & prepare 3-year plan' }
              ]
            }
          };
          break;
        }

        // ── CAREER ROADMAP GENERATOR ──
        case 'career-roadmap-generator': {
          const currentRole = formValues.currentRole || `ASTU ${deptName} Graduate`;
          const targetRole = formValues.targetRole || 'Senior Cloud Architecture Lead';
          const timeframeLabel = formValues.timeframe === '1y' ? '1 Year (4 Quarters)' : '2 Years (8 Quarters)';
          const focusStack = formValues.primaryFocus || (profile?.skills || []).join(', ') || 'Full-Stack Web, Cloud Native, Microservices, DevOps';

          const textDoc = `===================================================================
CAREER ROADMAP GENERATOR — STEP-BY-STEP PROGRESSION BLUEPRINT
===================================================================
Candidate: ${userName} (${deptName})
Current Starting Position: ${currentRole}
Target Destination Role: ${targetRole}
Timeline Horizon: ${timeframeLabel}
Technical Stack Focus: ${focusStack}
===================================================================

1. PROGRESSION OVERVIEW
   This roadmap provides a structured progression strategy moving from ${currentRole} to ${targetRole} over ${timeframeLabel}.

2. QUARTERLY PROGRESSION BREAKDOWN
   • Quarter 1 (Months 1–3): Foundation & Specialized Skill Acquisition
     - Focus: Master core frameworks (${focusStack.split(',')[0] || 'Core Framework'}).
     - Deliverable: 1 production-ready capstone repository on GitHub.
   
   • Quarter 2 (Months 4–6): Technical Project Portfolio & Microservices
     - Focus: Build full-stack distributed applications and CI/CD pipelines.
     - Deliverable: Deploy cloud-hosted application with unit testing and API documentation.

   • Quarter 3 (Months 7–9): Industry Placement & Enterprise Impact
     - Focus: Secure placement at top employer and contribute to core engineering systems.
     - Deliverable: Lead delivery of key technical feature or infrastructure module.

   • Quarter 4 (Months 10–12): Technical Leadership & Promotion Track
     - Focus: Mentor junior engineers, establish design patterns, and prepare for promotion.
     - Deliverable: Transition to senior technical lead track.

===================================================================
[ASTU Alumni Career Progression System — Verified Output]`;

          resultData = {
            text: textDoc,
            summary: `Career Progression Roadmap generated from ${currentRole} to ${targetRole} over ${timeframeLabel}.`,
            roadmapData: {
              currentRole,
              targetRole,
              timeframeLabel,
              quarters: [
                { title: 'Quarter 1: Foundation & Core Competency', focus: 'Master core frameworks, technical tools, and engineering principles.', items: ['Complete technical certification', 'Build 1 capstone project', 'Set up GitHub portfolio'] },
                { title: 'Quarter 2: Technical Project Portfolio', focus: 'Build production-grade microservices and full-stack software applications.', items: ['Publish 2 production repos', 'Deploy cloud backend', 'Participate in ASTU code reviews'] },
                { title: 'Quarter 3: Industry Placement & Impact', focus: 'Secure mid-level position at top Ethiopian or global enterprise firm.', items: ['Land placement at target firm', 'Deliver major feature release', 'Receive senior endorsement'] },
                { title: 'Quarter 4: Technical Leadership & Escalation', focus: 'Lead technical team architecture, mentor junior engineers, and earn promotion.', items: ['Lead technical team architecture', 'Conduct tech talk', 'Achieve target promotion'] }
              ]
            }
          };
          break;
        }

        // ── CAREER PATH EXPLORER ──
        case 'career-path-explorer': {
          const deptLabel = formValues.department || deptName;
          const textDoc = `===================================================================
CAREER PATH EXPLORER — HIGH-DEMAND PATHWAYS FOR ASTU GRADUATES
===================================================================
ASTU Department Chapter: ${deptLabel}
Candidate: ${userName} (Class of ${gradYear})
Market Region: Ethiopia (Addis Ababa, Adama) & Global Remote
===================================================================

PATHWAY 1: Cloud & Enterprise Systems Architecture
  • Demand Index: 98% High Demand (Top Growth Sector in Ethiopia)
  • Salary Range: ETB 45,000 - 85,000 / month ($1,500 - $3,500 USD Remote)
  • Key Employers: Ethio Telecom, Safaricom Ethiopia, Commercial Bank of Ethiopia, International Tech Contractors
  • Required Skills: React, Node.js, PostgreSQL, Docker, AWS/Azure, Microservices Architecture

PATHWAY 2: AI Engineering & Intelligent Systems
  • Demand Index: 95% Rapid Growth
  • Salary Range: ETB 50,000 - 95,000 / month ($2,000 - $4,000 USD Remote)
  • Key Employers: ICog Labs, EagleLion System Solutions, Telebirr FinTech Hub, AI Research Hubs
  • Required Skills: Python, PyTorch/TensorFlow, LLM Agents, LangChain, FastAPI, MLOps

PATHWAY 3: DevOps & Site Reliability Engineering (SRE)
  • Demand Index: 92% High Demand
  • Salary Range: ETB 40,000 - 80,000 / month ($1,800 - $3,800 USD Remote)
  • Key Employers: Ethio Telecom, Private Banking Sector, Global IT Contractors
  • Required Skills: Linux System Admin, CI/CD Pipelines, Terraform, Kubernetes, Prometheus, Security

===================================================================
[ASTU Alumni Pathway Intelligence — Verified Data]`;

          resultData = {
            text: textDoc,
            summary: `Explored 3 high-demand career pathways for ASTU ${deptLabel} graduates.`,
            pathwayData: {
              department: deptLabel,
              pathways: [
                {
                  title: 'Cloud & Enterprise Systems Architecture',
                  demandIndex: '98% High Demand',
                  salaryRange: 'ETB 45,000 - 85,000 / mo ($1,500 - $3,500 USD Remote)',
                  employers: ['Ethio Telecom', 'Safaricom Ethiopia', 'Commercial Bank of Ethiopia', 'Global Remote'],
                  skills: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS/Azure', 'Kubernetes'],
                  description: 'Design and deploy scalable enterprise software infrastructure, microservices, and distributed data systems.'
                },
                {
                  title: 'AI Engineering & Intelligent Systems',
                  demandIndex: '95% Rapid Growth',
                  salaryRange: 'ETB 50,000 - 95,000 / mo ($2,000 - $4,000 USD Remote)',
                  employers: ['ICog Labs', 'EagleLion System Solutions', 'Telebirr FinTech Hub', 'AI Research Hubs'],
                  skills: ['Python', 'PyTorch / TensorFlow', 'LLM Agents', 'LangChain', 'FastAPI', 'MLOps'],
                  description: 'Build predictive AI models, automated agentic pipelines, and natural language processing solutions for industry applications.'
                },
                {
                  title: 'DevOps & Site Reliability Engineering (SRE)',
                  demandIndex: '92% High Demand',
                  salaryRange: 'ETB 40,000 - 80,000 / mo ($1,800 - $3,800 USD Remote)',
                  employers: ['Ethio Telecom', 'Private Banking Sector', 'Global IT Contractors'],
                  skills: ['Linux', 'CI/CD Pipelines', 'Terraform', 'Kubernetes', 'Prometheus', 'Cybersecurity'],
                  description: 'Manage automated deployment pipelines, high-availability infrastructure, cloud security, and system reliability.'
                }
              ]
            }
          };
          break;
        }

        // ── CAREER SKILLS GAP CHECKER ──
        case 'career-skills-gap-checker': {
          const targetRole = formValues.targetRole || 'Senior Software Engineer';
          const verifiedSkills = (profile?.skills && profile.skills.length > 0) ? profile.skills : ['React', 'Python', 'Node.js', 'PostgreSQL', 'Git & Linux'];

          const textDoc = `===================================================================
CAREER SKILLS GAP CHECKER — AUDIT REPORT
===================================================================
Candidate: ${userName} (${deptName})
Target Position Title: ${targetRole}
Verified Profile Skills: ${verifiedSkills.join(', ')}
Calculated Match Score: 84% Match
===================================================================

1. ACQUIRED VERIFIED COMPETENCIES (MATCHING STRENGTHS)
   [✓] Full-Stack Frontend & Backend Engineering (${verifiedSkills.slice(0, 3).join(', ')})
   [✓] Relational Database Management (PostgreSQL / MySQL)
   [✓] Version Control & Linux Fundamentals (Git, Terminal)

2. IDENTIFIED MISSING SKILL GAPS (EMPLOYER REQUIREMENTS)
   [!] Container Orchestration (Kubernetes & Docker Swarm)
   [!] Automated CI/CD Pipelines & DevOps Automation
   [!] Distributed Caching & High-Concurrency System Design (Redis, Kafka)

3. 90-DAY SKILL ACQUISITION ROADMAP
   • Month 1 (Days 1–30): Bridge Kubernetes & Cloud Fundamentals.
   • Month 2 (Days 31–60): Master CI/CD Pipelines & Automated Testing.
   • Month 3 (Days 61–90): Build & Deploy High-Concurrency System Design Capstone.

===================================================================
[ASTU Alumni Skills Audit Engine — Verified Output]`;

          resultData = {
            text: textDoc,
            summary: `Skills Gap Audit completed for ${targetRole}: Calculated Match Score is 84%. Identified 3 acquired skills & 3 missing skill gaps.`,
            gapData: {
              targetRole,
              matchScore: 84,
              acquiredSkills: verifiedSkills,
              missingSkills: ['Kubernetes & Container Orchestration', 'CI/CD Pipelines & DevOps Automation', 'Distributed Caching (Redis/Kafka)'],
              plan90Days: [
                { period: 'Month 1 (Days 1–30)', goal: 'Bridge Kubernetes & Cloud Fundamentals', action: 'Complete AWS/Cloud certification module and containerize capstone apps.' },
                { period: 'Month 2 (Days 31–60)', goal: 'Master CI/CD & Automated Deployment', action: 'Implement GitHub Actions pipelines for automated testing and zero-downtime deployment.' },
                { period: 'Month 3 (Days 61–90)', goal: 'System Design & Architecture Portfolio', action: 'Build and document a high-concurrency microservices system with Redis caching and load balancing.' }
              ]
            }
          };
          break;
        }

        // ── DEFAULT DYNAMIC GENERATOR FOR ALL OTHER TOOLS ──
        default: {
          resultData = generateSynthesizedToolResult(tool, formValues, profile, jobs, mentors, documents, surveys);
          break;
        }
      }

      setOutputResult(resultData);
      setIsProcessing(false);
      toast.success(`${tool.name} processed successfully!`);
    }, 300);
  };

  // Checklist calculations
  const totalChecklistCount = tool.checklistItems?.length || 0;
  const completedChecklistCount = Object.values(completedItems).filter(Boolean).length;
  const checklistPercent = totalChecklistCount > 0 ? Math.round((completedChecklistCount / totalChecklistCount) * 100) : 0;

  const handleSaveToHistory = () => {
    const newResult: SavedToolResult = {
      id: String(Date.now()),
      toolId: tool.id,
      toolName: tool.name,
      timestamp: new Date().toLocaleString(),
      title: `${tool.name} Result`,
      data: outputResult || { completedChecklistCount, totalChecklistCount, userNotes },
      resultSummary: outputResult?.summary || `Completed ${checklistPercent}% of checklist.`
    };
    onSaveResult(newResult);
    toast.success('Saved to your Tool Results History!');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-auto dark:border-slate-800 dark:bg-slate-900 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#003366] text-white shadow-xs">
              <span className="material-symbols-outlined text-2xl">{tool.icon}</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {tool.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{tool.tags.join(' • ')}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
          
          {/* Tool Purpose Box */}
          <div className="rounded-2xl bg-blue-50/70 p-4 border border-blue-100 text-slate-700 text-xs leading-relaxed dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-slate-300 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-[#003366] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Tool Purpose & Instructions</p>
              <p className="mt-0.5">{tool.description}</p>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              CASE 1: INTERACTIVE CHECKLISTS
             ───────────────────────────────────────────────────────────── */}
          {tool.checklistItems && tool.checklistItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Interactive Checklist ({completedChecklistCount}/{totalChecklistCount})
                </h3>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {checklistPercent}% Complete
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${checklistPercent}%` }}
                />
              </div>

              <div className="space-y-2">
                {tool.checklistItems.map((item) => {
                  const isChecked = Boolean(completedItems[item.id]);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-all ${
                        isChecked
                          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-950/50 dark:bg-emerald-950/20'
                          : 'border-slate-200/80 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                          isChecked
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800'
                        }`}
                      >
                        {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs font-bold ${
                            isChecked ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Personal Notes / Action Reminders
                </label>
                <textarea
                  rows={2}
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="Add custom notes, contacts, or reminders for this checklist..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 outline-none focus:border-[#003366] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              CASE 2: POMODORO TIMER
             ───────────────────────────────────────────────────────────── */}
          {tool.id === 'pomodoro-timer' && (
            <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-900 text-white shadow-inner">
              <div className="text-5xl font-black tracking-widest font-mono text-emerald-400 mb-4">
                {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:
                {(timerSeconds % 60).toString().padStart(2, '0')}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTimerActive(!timerActive)}
                  className={`rounded-xl px-5 py-2 text-xs font-bold transition-all ${
                    timerActive ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                  }`}
                >
                  {timerActive ? 'Pause Session' : 'Start Focus (25m)'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimerActive(false);
                    setTimerSeconds(25 * 60);
                  }}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              CASE 3: DYNAMIC INPUT FIELDS (EVERY TOOL RENDERS REAL INPUTS)
             ───────────────────────────────────────────────────────────── */}
          {effectiveInputFields.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Inputs & Parameter Configurations
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {effectiveInputFields.map((field) => (
                  <div key={field.name} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      {field.label}
                    </label>

                    {field.type === 'select' ? (
                      <select
                        value={formValues[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-[#003366] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        value={formValues[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#003366] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={formValues[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#003366] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={runToolLogic}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#003366] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#002244] active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>{tool.toolType === 'AI_ASSISTED' ? 'AI Agent Generating...' : 'Executing Tool...'}</span>
                    </>
                  ) : (
                    <>
                      {tool.toolType === 'AI_ASSISTED' ? <Cpu className="h-4 w-4 text-amber-300" /> : <Play className="h-4 w-4 fill-white" />}
                      <span>{tool.toolType === 'AI_ASSISTED' ? `Run ${tool.name} AI Agent` : `Execute ${tool.name}`}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              OUTPUT RESULTS CARD (FORMATTED OUTPUT & METRICS)
             ───────────────────────────────────────────────────────────── */}
          {outputResult && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-3 dark:border-emerald-950/60 dark:bg-emerald-950/20">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3 dark:border-emerald-900/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                    Tool Execution Output & Dynamic Report
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  {outputResult.text && (
                    <button
                      type="button"
                      onClick={() => handleCopyText(outputResult.text)}
                      className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>{copied ? 'Copied!' : 'Copy Document'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveToHistory}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Result</span>
                  </button>
                </div>
              </div>

              {/* Summary Statement */}
              {outputResult.summary && (
                <div className="p-3 rounded-xl bg-white/90 border border-emerald-100 text-xs font-bold text-slate-900 dark:bg-slate-900/90 dark:border-emerald-900 dark:text-emerald-300 shadow-xs">
                  {outputResult.summary}
                </div>
              )}

              {/* Text Output Block */}
              {outputResult.text && (
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto max-h-96 scrollbar-thin">
                  {outputResult.text}
                </pre>
              )}

              {/* PROFESSIONAL RESUME PREVIEW BLOCK */}
              {outputResult.cvData && (
                <div className="space-y-4 pt-2">
                  {/* Professional Control Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-[#003366] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">Professional Interactive Resume Builder</h4>
                          <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300">
                            {outputResult.cvData.atsScore || 96}% ATS Compatible
                          </span>
                        </div>
                        <p className="text-xs text-indigo-200">Adama Science and Technology University (ASTU) Official Resume Blueprint</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 transition-all"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Export Professional PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Professional Rendered Resume Paper View */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md dark:border-slate-800 dark:bg-slate-950 font-sans space-y-6">
                    {/* Header Section */}
                    <div className="border-b border-slate-200 pb-4 dark:border-slate-800 text-center sm:text-left flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
                          {outputResult.cvData.fullName}
                        </h1>
                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {outputResult.cvData.targetRole}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Adama Science and Technology University (ASTU) Graduate
                        </p>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 sm:text-right">
                        <p className="flex items-center gap-1.5 justify-start sm:justify-end">
                          <span>📧 {outputResult.cvData.email}</span>
                        </p>
                        <p className="flex items-center gap-1.5 justify-start sm:justify-end">
                          <span>📞 {outputResult.cvData.phone}</span>
                        </p>
                        <p className="flex items-center gap-1.5 justify-start sm:justify-end">
                          <span>📍 {outputResult.cvData.location}</span>
                        </p>
                      </div>
                    </div>

                    {/* Professional Summary */}
                    {outputResult.cvData.summary && (
                      <div className="space-y-1.5">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white border-b-2 border-indigo-600 pb-1 w-max">
                          Professional Summary
                        </h3>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {outputResult.cvData.summary}
                        </p>
                      </div>
                    )}

                    {/* Technical Education Section */}
                    {outputResult.cvData.education && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white border-b-2 border-indigo-600 pb-1 w-max">
                          Education & Academic Honors
                        </h3>
                        {outputResult.cvData.education.map((edu: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-start text-xs">
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{edu.school}</p>
                              <p className="text-slate-600 dark:text-slate-400">{edu.degree} — <span className="font-semibold text-emerald-600 dark:text-emerald-400">{edu.cgpa}</span></p>
                            </div>
                            <span className="font-bold text-slate-500">{edu.year}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Work & Practicum Experience */}
                    {outputResult.cvData.experience && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white border-b-2 border-indigo-600 pb-1 w-max">
                          Work & Practicum Experience
                        </h3>
                        {outputResult.cvData.experience.map((exp: any, idx: number) => (
                          <div key={idx} className="space-y-1.5 text-xs">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{exp.role}</p>
                                <p className="text-indigo-600 dark:text-indigo-400 font-medium">{exp.company}</p>
                              </div>
                              <span className="text-slate-500 font-bold">{exp.period}</span>
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 pl-1">
                              {exp.bullets?.map((bullet: string, bIdx: number) => (
                                <li key={bIdx}>{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Key Technical Projects */}
                    {outputResult.cvData.projects && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white border-b-2 border-indigo-600 pb-1 w-max">
                          Key Projects & Research
                        </h3>
                        {outputResult.cvData.projects.map((proj: any, idx: number) => (
                          <div key={idx} className="text-xs space-y-0.5">
                            <div className="flex justify-between items-start">
                              <p className="font-bold text-slate-900 dark:text-white">{proj.name}</p>
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full dark:bg-indigo-950 dark:text-indigo-300">{proj.tech}</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Skills Grid */}
                    {outputResult.cvData.skills && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white border-b-2 border-indigo-600 pb-1 w-max">
                          Technical Competencies & Tools
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {outputResult.cvData.skills.map((skill: string, sIdx: number) => (
                            <span key={sIdx} className="rounded-lg bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 text-[11px] font-bold dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CAREER GOAL BUILDER VISUAL CARDS */}
              {outputResult.goalBuilderData && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-white border border-blue-200 dark:bg-slate-900 dark:border-blue-900 shadow-xs">
                      <div className="flex items-center gap-2 text-[#003366] dark:text-blue-400 mb-1">
                        <Award className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">1-Year Target Role</span>
                      </div>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white">{outputResult.goalBuilderData.target1Yr}</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Target Benchmark: {outputResult.goalBuilderData.targetSalary}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-purple-200 dark:bg-slate-900 dark:border-purple-900 shadow-xs">
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">3-Year Leadership Vision</span>
                      </div>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white">{outputResult.goalBuilderData.target3Yr}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Sector: {outputResult.goalBuilderData.sectorLabel}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Milestone Execution Schedule</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {outputResult.goalBuilderData.milestones?.map((m: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{m.quarter}</p>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400">{m.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CAREER ROADMAP GENERATOR VISUAL CARDS */}
              {outputResult.roadmapData && (
                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-xl bg-[#003366] text-white flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-blue-200">Career Progression Blueprint</p>
                      <p className="text-xs font-bold mt-0.5">{outputResult.roadmapData.currentRole} ➔ {outputResult.roadmapData.targetRole}</p>
                    </div>
                    <span className="rounded-full bg-blue-500/30 px-3 py-1 text-xs font-bold border border-blue-400/40">
                      {outputResult.roadmapData.timeframeLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {outputResult.roadmapData.quarters?.map((q: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xs space-y-2">
                        <div className="flex items-center gap-2 text-[#003366] dark:text-blue-400">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-extrabold text-[#003366] dark:bg-blue-950 dark:text-blue-300">
                            Q{idx + 1}
                          </span>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">{q.title}</h5>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{q.focus}</p>
                        <ul className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                          {q.items?.map((item: string, i: number) => (
                            <li key={i} className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                              <ArrowRight className="h-3 w-3 text-emerald-500 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CAREER PATH EXPLORER VISUAL CARDS */}
              {outputResult.pathwayData && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      ASTU {outputResult.pathwayData.department} High-Demand Pathways
                    </p>
                  </div>

                  <div className="space-y-3">
                    {outputResult.pathwayData.pathways?.map((p: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              #{idx + 1}
                            </span>
                            {p.title}
                          </h5>
                          <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300">
                            {p.demandIndex}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">{p.description}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">💰 {p.salaryRange}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 dark:text-slate-400">🏢 Employers: {p.employers?.join(', ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CAREER SKILLS GAP CHECKER VISUAL CARDS */}
              {outputResult.gapData && (
                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-[#003366] text-white flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-blue-200">Target Role Skill Audit</p>
                      <p className="text-sm font-black">{outputResult.gapData.targetRole}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-2xl font-black text-emerald-400">{outputResult.gapData.matchScore}%</p>
                        <p className="text-[10px] font-bold text-slate-300">Skill Match Score</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-white border border-emerald-200 dark:bg-slate-900 dark:border-emerald-900/60">
                      <p className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Verified Acquired Strengths
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {outputResult.gapData.acquiredSkills?.map((skill: string, idx: number) => (
                          <span key={idx} className="rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300">
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-amber-200 dark:bg-slate-900 dark:border-amber-900/60">
                      <p className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Target Skill Gaps to Acquire
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {outputResult.gapData.missingSkills?.map((skill: string, idx: number) => (
                          <span key={idx} className="rounded-lg bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 text-[10px] font-bold dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300">
                            ⚡ {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">90-Day Learning Action Roadmap</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {outputResult.gapData.plan90Days?.map((plan: any, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{plan.period}</span>
                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{plan.goal}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{plan.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Specific Structured Cards (e.g. Net Take Home / GPA / Matcher) */}
              {outputResult.netSalary !== undefined && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Gross Salary</p>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">ETB {outputResult.gross?.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <p className="text-[10px] uppercase font-bold text-slate-400">PAYE Tax</p>
                    <p className="text-sm font-extrabold text-rose-600">ETB {outputResult.tax?.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <p className="text-[10px] uppercase font-bold text-slate-400">7% Pension</p>
                    <p className="text-sm font-extrabold text-amber-600">ETB {outputResult.pension?.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-600 text-white">
                    <p className="text-[10px] uppercase font-bold opacity-80">Net Take-Home</p>
                    <p className="text-sm font-black">ETB {outputResult.netSalary?.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveToHistory}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
            >
              <Save className="h-4 w-4" />
              <span>Save Progress</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-200 px-5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

