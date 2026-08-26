export interface QuestionDef {
  questionText: string;
  questionType: 'TEXT' | 'TEXTAREA' | 'SELECT' | 'RADIO' | 'CHECKBOX' | 'RATING' | 'NUMBER' | 'DATE';
  required: boolean;
  options?: string[];
  order: number;
}

export interface MilestoneTemplateDef {
  type: 'SIX_MONTH' | 'TWELVE_MONTH' | 'EIGHTEEN_MONTH' | 'TWENTY_FOUR_MONTH';
  title: string;
  description: string;
  milestoneMonths: number;
  questions: QuestionDef[];
}

export const MILESTONE_TEMPLATES: MilestoneTemplateDef[] = [
  // ─── 6-MONTH TRACER STUDY ─────────────────────────────────────────────────
  {
    type: 'SIX_MONTH',
    title: '6-Month Graduate Transition & Initial Employment Survey',
    description: 'Evaluates initial career transition, job search duration, entry-level salary, and ASTU curriculum alignment within 6 months after graduation.',
    milestoneMonths: 6,
    questions: [
      { order: 1, questionText: 'Current Primary Employment Status', questionType: 'RADIO', required: true, options: ['Employed Full-time', 'Employed Part-time', 'Self-Employed / Entrepreneur', 'Pursuing Higher Studies', 'Unemployed & Seeking Work', 'Not Seeking Work'] },
      { order: 2, questionText: 'How many months did it take to secure your first job after graduation from ASTU?', questionType: 'SELECT', required: true, options: ['Employed before graduation', 'Less than 1 month', '1 - 3 months', '4 - 6 months', 'Still seeking'] },
      { order: 3, questionText: 'Current Job Title / Position', questionType: 'TEXT', required: true },
      { order: 4, questionText: 'Name of Employer / Organization / Company', questionType: 'TEXT', required: true },
      { order: 5, questionText: 'Work Location City / Region', questionType: 'TEXT', required: false },
      { order: 6, questionText: 'Employment Sector', questionType: 'SELECT', required: true, options: ['Public / Government Sector', 'Private Corporate Sector', 'NGO / Non-Profit', 'Academic / Research Institution', 'Self-Employed / Freelance'] },
      { order: 7, questionText: 'Current Monthly Gross Salary (ETB)', questionType: 'SELECT', required: true, options: ['Under 10,000 ETB', '10,000 - 20,000 ETB', '20,001 - 35,000 ETB', '35,001 - 50,000 ETB', 'Above 50,000 ETB'] },
      { order: 8, questionText: 'Is your current employment directly related to your ASTU field of study?', questionType: 'RADIO', required: true, options: ['Directly Related', 'Partially Related', 'Not Related'] },
      { order: 9, questionText: 'Primary channel through which you secured your first job', questionType: 'SELECT', required: true, options: ['ASTU Career Center & Job Fair', 'Online Job Portal (LinkedIn, Telegram, etc.)', 'Personal / Family Network', 'Direct University Internship Conversion', 'Competitive Examination / Civil Service'] },
      { order: 10, questionText: 'Rate how well ASTU core courses prepared you for technical entry-level tasks', questionType: 'RATING', required: true },
      { order: 11, questionText: 'Rate the relevance of ASTU practical laboratory and project sessions to your work', questionType: 'RATING', required: true },
      { order: 12, questionText: 'Which technical skills were most beneficial in your first 6 months of employment?', questionType: 'CHECKBOX', required: true, options: ['Programming & Software Development', 'Engineering Design & CAD', 'Data Analysis & Research Methods', 'Project Management', 'Technical Writing & Documentation'] },
      { order: 13, questionText: 'Which soft skills did you find most challenging during transition to workplace?', questionType: 'CHECKBOX', required: false, options: ['Workplace Communication', 'Teamwork & Collaboration', 'Time Management', 'Client Presentation', 'Problem Solving under Pressure'] },
      { order: 14, questionText: 'Have you participated in any professional training or certification since graduating?', questionType: 'RADIO', required: true, options: ['Yes, completed', 'Currently enrolled', 'No'] },
      { order: 15, questionText: 'If certified or enrolled, specify the certification name', questionType: 'TEXT', required: false },
      { order: 16, questionText: 'Rate your overall satisfaction with your current entry-level position', questionType: 'RATING', required: true },
      { order: 17, questionText: 'What major obstacle did you face when searching for your first job?', questionType: 'SELECT', required: false, options: ['Lack of work experience requirement', 'Limited entry-level job openings', 'Skill gap in practical technologies', 'Salary expectations mismatch', 'Geographic mobility limitations'] },
      { order: 18, questionText: 'Do you plan to stay with your current employer for the next 12 months?', questionType: 'RADIO', required: true, options: ['Yes', 'Uncertain', 'No, actively looking for new opportunities'] },
      { order: 19, questionText: 'Would you recommend ASTU engineering/technology programs to prospective students?', questionType: 'RADIO', required: true, options: ['Highly Recommend', 'Recommend with Reservations', 'Do Not Recommend'] },
      { order: 20, questionText: 'Suggestions for ASTU to improve job readiness for graduating seniors', questionType: 'TEXTAREA', required: false }
    ]
  },

  // ─── 12-MONTH TRACER STUDY ────────────────────────────────────────────────
  {
    type: 'TWELVE_MONTH',
    title: '12-Month Career Stability & Professional Skills Development Survey',
    description: 'Measures 1-year job stability, career progression, salary growth, workplace skill application, and post-graduate professional development.',
    milestoneMonths: 12,
    questions: [
      { order: 1, questionText: 'Current Employment Status at 1-Year Mark', questionType: 'RADIO', required: true, options: ['Employed Full-time', 'Employed Part-time', 'Self-Employed / Business Owner', 'Post-Graduate Student (MSc/PhD)', 'Unemployed & Seeking Work'] },
      { order: 2, questionText: 'Have you changed employers or roles within your first year after graduation?', questionType: 'RADIO', required: true, options: ['Same employer and role', 'Promoted at same employer', 'Changed to a new employer', 'Started own business'] },
      { order: 3, questionText: 'Current Job Title / Designation', questionType: 'TEXT', required: true },
      { order: 4, questionText: 'Current Employer Name', questionType: 'TEXT', required: true },
      { order: 5, questionText: 'Current Monthly Gross Salary Range (ETB)', questionType: 'SELECT', required: true, options: ['Under 15,000 ETB', '15,000 - 25,000 ETB', '25,001 - 40,000 ETB', '40,001 - 60,000 ETB', 'Above 60,000 ETB'] },
      { order: 6, questionText: 'Has your monthly salary increased compared to your entry-level starting salary?', questionType: 'RADIO', required: true, options: ['Increased significantly (>30%)', 'Increased moderately (10-30%)', 'Remained the same', 'Decreased'] },
      { order: 7, questionText: 'Degree of match between ASTU specialization and current day-to-day responsibilities', questionType: 'RADIO', required: true, options: ['High Match', 'Moderate Match', 'Low Match', 'No Match'] },
      { order: 8, questionText: 'Rate your level of independence in handling complex engineering/technical projects at work', questionType: 'RATING', required: true },
      { order: 9, questionText: 'Which advanced tools or software do you use regularly in your profession?', questionType: 'TEXT', required: false },
      { order: 10, questionText: 'Rate how effectively ASTU research and thesis projects prepared you for independent problem-solving', questionType: 'RATING', required: true },
      { order: 11, questionText: 'Have you received any employer-sponsored training or skill development programs?', questionType: 'RADIO', required: true, options: ['Yes, local training', 'Yes, international/online training', 'No training received'] },
      { order: 12, questionText: 'Which area of ASTU curriculum requires the most urgent practical modernization?', questionType: 'SELECT', required: true, options: ['AI & Modern Computing Stack', 'Industrial Automation & Robotics', 'Sustainable Infrastructure & Green Tech', 'Entrepreneurship & Business Management', 'Advanced Laboratory Equipment'] },
      { order: 13, questionText: 'Have you mentored or supervised junior staff/interns in your organization?', questionType: 'RADIO', required: true, options: ['Yes', 'No'] },
      { order: 14, questionText: 'Rate your satisfaction with your current career trajectory', questionType: 'RATING', required: true },
      { order: 15, questionText: 'Are you enrolled in or planning to pursue MSc/MTech or PhD studies within 6 months?', questionType: 'RADIO', required: true, options: ['Enrolled at ASTU', 'Enrolled at another Ethiopian University', 'Enrolled Abroad', 'Planning to apply soon', 'No plans for post-graduate study'] },
      { order: 16, questionText: 'How would you rate your workplace work-life balance and job satisfaction?', questionType: 'RATING', required: true },
      { order: 17, questionText: 'Key professional achievement accomplished in your first year', questionType: 'TEXTAREA', required: false },
      { order: 18, questionText: 'Are you a registered member of any professional engineering or technology association?', questionType: 'RADIO', required: true, options: ['Yes (e.g. EAEA, IEEE, etc.)', 'In process', 'No'] },
      { order: 19, questionText: 'How frequently do you interact with the ASTU Alumni Network or alumni events?', questionType: 'SELECT', required: true, options: ['Frequently (Monthly)', 'Occasionally (Quarterly)', 'Rarely (Annual)', 'Never'] },
      { order: 20, questionText: 'Feedback for ASTU faculty on updating course syllabi for 1-year graduate expectations', questionType: 'TEXTAREA', required: false }
    ]
  },

  // ─── 18-MONTH TRACER STUDY ────────────────────────────────────────────────
  {
    type: 'EIGHTEEN_MONTH',
    title: '18-Month Career Advancement & Employer Alignment Survey',
    description: 'Evaluates mid-career advancement, leadership roles, professional certifications, employer alignment, and entrepreneurial activity 1.5 years post-graduation.',
    milestoneMonths: 18,
    questions: [
      { order: 1, questionText: 'Current Professional Status at 18-Month Mark', questionType: 'RADIO', required: true, options: ['Employed Senior/Specialist Role', 'Employed Mid-level Role', 'Founder / Business Partner', 'Full-time Graduate Researcher', 'Career Transition / Seeking New Opportunities'] },
      { order: 2, questionText: 'Total number of promotions or title advancements earned since graduation', questionType: 'SELECT', required: true, options: ['0 (Same position)', '1 promotion', '2 promotions', '3 or more promotions'] },
      { order: 3, questionText: 'Current Job Title & Department', questionType: 'TEXT', required: true },
      { order: 4, questionText: 'Current Organization Name', questionType: 'TEXT', required: true },
      { order: 5, questionText: 'Monthly Gross Earnings Tier (ETB)', questionType: 'SELECT', required: true, options: ['Under 20,000 ETB', '20,000 - 35,000 ETB', '35,001 - 55,000 ETB', '55,001 - 80,000 ETB', 'Above 80,000 ETB'] },
      { order: 6, questionText: 'Do you hold supervisory or team leadership responsibilities?', questionType: 'RADIO', required: true, options: ['Yes, managing a team of 5+ people', 'Yes, managing a small team (1-4 people)', 'No supervisory responsibilities'] },
      { order: 7, questionText: 'If you started a business/startup, how many employees do you employ?', questionType: 'SELECT', required: false, options: ['Not a business founder', '1 - 3 employees', '4 - 10 employees', 'More than 10 employees'] },
      { order: 8, questionText: 'Rate how well your ASTU education equipped you for leadership and project coordination', questionType: 'RATING', required: true },
      { order: 9, questionText: 'Have you acquired any international or recognized professional certifications?', questionType: 'CHECKBOX', required: false, options: ['PMP / Project Management', 'AWS / Cloud / DevOps', 'Cisco / Networking (CCNA/CCNP)', 'PE / Professional Engineer License', 'Scrum / Agile Master', 'Data Science / Machine Learning'] },
      { order: 10, questionText: 'Has your employer provided formal performance feedback regarding your ASTU training?', questionType: 'RADIO', required: true, options: ['Exceeds Expectations', 'Meets Expectations', 'Needs Improvement in Practical Areas'] },
      { order: 11, questionText: 'How frequently do you apply multidisciplinary knowledge gained at ASTU?', questionType: 'RATING', required: true },
      { order: 12, questionText: 'Rate ASTU’s contribution to developing your professional ethics and social responsibility', questionType: 'RATING', required: true },
      { order: 13, questionText: 'Have you authored research publications, patents, or technical whitepapers?', questionType: 'RADIO', required: true, options: ['Yes, published in journal/conference', 'Patented an innovation', 'In preparation', 'No'] },
      { order: 14, questionText: 'Are you interested in collaborating with ASTU for joint industry-academic research projects?', questionType: 'RADIO', required: true, options: ['Very Interested', 'Somewhat Interested', 'Not Interested'] },
      { order: 15, questionText: 'Would your company be willing to offer internship slots for current ASTU students?', questionType: 'RADIO', required: true, options: ['Yes, definitely', 'Needs administrative review', 'Unlikely'] },
      { order: 16, questionText: 'Rate your overall satisfaction with your 18-month career progression', questionType: 'RATING', required: true },
      { order: 17, questionText: 'What critical technical competency do you wish had been taught more intensely at ASTU?', questionType: 'TEXT', required: false },
      { order: 18, questionText: 'Estimate your professional career growth outlook for the next 2 years', questionType: 'SELECT', required: true, options: ['Rapid Advancement / High Growth', 'Steady Growth', 'Stagnant', 'Planning Career Change'] },
      { order: 19, questionText: 'Would you be willing to deliver guest lectures or workshops at ASTU?', questionType: 'RADIO', required: true, options: ['Yes, in-person at Adama', 'Yes, virtual/online', 'No'] },
      { order: 20, questionText: 'General recommendations for ASTU administration regarding industry linkage', questionType: 'TEXTAREA', required: false }
    ]
  },

  // ─── 24-MONTH TRACER STUDY ────────────────────────────────────────────────
  {
    type: 'TWENTY_FOUR_MONTH',
    title: '24-Month Long-Term Impact & ABET Accreditation Assessment Survey',
    description: '2-year comprehensive assessment evaluating long-term career trajectory, cumulative salary growth, ABET/ETA accreditation standards, and alumni mentorship contributions.',
    milestoneMonths: 24,
    questions: [
      { order: 1, questionText: 'Current Status at 2-Year Milestone', questionType: 'RADIO', required: true, options: ['Employed - Senior Management / Lead Engineer', 'Employed - Mid Level', 'Successful Entrepreneur / Business Owner', 'Full-time Academic / PhD Candidate', 'Other / Transitioning'] },
      { order: 2, questionText: 'Total Cumulative Salary Increase (%) since your first post-ASTU job', questionType: 'SELECT', required: true, options: ['0 - 25% increase', '26 - 50% increase', '51 - 100% increase', 'More than 100% increase (Doubled +)'] },
      { order: 3, questionText: 'Current Monthly Gross Salary Range (ETB)', questionType: 'SELECT', required: true, options: ['Under 25,000 ETB', '25,000 - 45,000 ETB', '45,001 - 70,000 ETB', '70,001 - 100,000 ETB', 'Above 100,000 ETB'] },
      { order: 4, questionText: 'Current Company Name & Industry Sector', questionType: 'TEXT', required: true },
      { order: 5, questionText: 'Current Job Title & Seniority Level', questionType: 'TEXT', required: true },
      { order: 6, questionText: 'ABET Criterion: Rate ASTU program effectiveness in complex engineering problem-solving', questionType: 'RATING', required: true },
      { order: 7, questionText: 'ABET Criterion: Rate ASTU program effectiveness in engineering design meeting societal & safety needs', questionType: 'RATING', required: true },
      { order: 8, questionText: 'ABET Criterion: Rate ASTU program effectiveness in clear technical communication with diverse audiences', questionType: 'RATING', required: true },
      { order: 9, questionText: 'ABET Criterion: Rate ASTU program effectiveness in ethical and professional decision-making', questionType: 'RATING', required: true },
      { order: 10, questionText: 'ABET Criterion: Rate ASTU program effectiveness in functioning on collaborative multidisciplinary teams', questionType: 'RATING', required: true },
      { order: 11, questionText: 'ABET Criterion: Rate ASTU program effectiveness in conducting experimentation and data analysis', questionType: 'RATING', required: true },
      { order: 12, questionText: 'ABET Criterion: Rate ASTU program effectiveness in acquiring and applying new knowledge as needed (Lifelong Learning)', questionType: 'RATING', required: true },
      { order: 13, questionText: 'Are you currently participating in the ASTU Alumni Mentorship Program for current students?', questionType: 'RADIO', required: true, options: ['Active Mentor', 'Interested in joining as Mentor', 'Not interested'] },
      { order: 14, questionText: 'Has your organization hired other ASTU graduates based on your recommendation?', questionType: 'RADIO', required: true, options: ['Yes (Multiple graduates)', 'Yes (1 graduate)', 'No'] },
      { order: 15, questionText: 'How would you rate the reputation of ASTU graduates in your industry sector?', questionType: 'RADIO', required: true, options: ['Top Tier / Industry Standard', 'Above Average', 'Average', 'Below Average'] },
      { order: 16, questionText: 'Highest level of education completed or currently in progress', questionType: 'SELECT', required: true, options: ['Bachelor Degree (BSc/BTech)', 'Master Degree (MSc/MTech/MBA)', 'Doctorate (PhD)', 'Post-Doctoral / Specialized Fellowship'] },
      { order: 17, questionText: 'Are you willing to contribute to the ASTU Alumni Endowment / Innovation Fund?', questionType: 'RADIO', required: true, options: ['Yes', 'Maybe in the future', 'No'] },
      { order: 18, questionText: 'Rate your overall satisfaction with your 2-year post-graduation career journey', questionType: 'RATING', required: true },
      { order: 19, questionText: 'What single strategic change should ASTU implement to maintain global ABET/ETA accreditation?', questionType: 'TEXTAREA', required: false },
      { order: 20, questionText: 'Final messages or testimonial for incoming ASTU freshers', questionType: 'TEXTAREA', required: false }
    ]
  }
];
