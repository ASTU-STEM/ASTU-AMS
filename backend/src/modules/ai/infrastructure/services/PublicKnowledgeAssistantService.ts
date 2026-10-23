import { OpenRouterService } from './OpenRouterService';
import { AnalyticsContextProvider } from '../../application/context/AnalyticsContextProvider';

export class PublicKnowledgeAssistantService {
  private static cachedContext = '';
  private static lastContextFetch = 0;

  private static SENSITIVE_PATTERNS = [
    'password',
    'hash',
    'audit log',
    'database schema',
    'all user',
    'user emails',
    'api key',
    'secret token',
    'db dump',
    'delete user',
    'suspend user',
    'reset password for',
    'admin credentials',
    'superadmin',
  ];

  private static async getCachedContext(): Promise<string> {
    const now = Date.now();
    if (this.cachedContext && now - this.lastContextFetch < 120000) {
      return this.cachedContext;
    }
    try {
      const dbTelemetry = await AnalyticsContextProvider.getContextForIntent('general');
      this.cachedContext = `${dbTelemetry}\n\nINSTITUTIONAL DIRECTORY & OPERATIONAL POLICIES:
- University: Adama Science & Technology University (ASTU)
- Location: Adama (Nazret), Oromia, Ethiopia (100km southeast of Addis Ababa)
- Campus Complexes: Main Administration Campus, Advanced Engineering & Robotics Labs, Convocation Hall, Research & Innovation Pavilion
- Official Portals: Alumni Portal, Employer Partner Portal, Department Analytics Portal, Registrar Portal
- Registrar SLAs: Official Transcripts and English Medium of Instruction issued within 24-48 business hours
- Contact Channels: alumni@astu.edu.et, registrar@astu.edu.et, Phone +251 22 110 0001
- Active Directives: ASTU Engineering Innovation Summit 2026, Semester Break Campus Safety Guidelines, Wave 3 Graduate Tracer Study`;
      this.lastContextFetch = now;
    } catch {
      this.cachedContext = 'ASTU Employment Rate: 55.0%, Top Employers: Safaricom Ethiopia, Ethio Telecom, Sunshine Construction, INSA, Wabi Tena. Active Departments: Computer Science (CSE), Electrical Engineering (ECE), Mechanical Engineering (ME), Civil Engineering (CE). Transcripts: 24-48h SLA.';
    }
    return this.cachedContext;
  }

  static async processPublicMessage(query: string): Promise<string> {
    const q = (query || '').toLowerCase().trim();

    // 1. Security Check: Block sensitive internal administrative leaks
    if (this.SENSITIVE_PATTERNS.some((pattern) => q.includes(pattern))) {
      return `🔒 Data Security Guardrail: As the public ASTU AI assistant, I cannot reveal private user accounts, password credentials, security audit logs, or internal administrative data. Please sign in as an authorized user to access your personal dashboard.`;
    }

    // 2. Ultra-Fast Sub-20ms Intent Engine
    if (q === 'hi' || q === 'hello' || q === 'hey' || q.startsWith('hi ') || q.startsWith('hello ') || q.startsWith('hey ') || q.includes('good morning') || q.includes('good afternoon')) {
      return `Hello! 👋 I am ASTU AI, your assistant for Adama Science & Technology University. How can I assist you with ASTU portal features, registration, transcript requests, or job placements today?`;
    }

    if (q.includes('who are you') || q.includes('who are u') || q.includes('who r u') || q.includes('who r you') || q.includes('what is your name') || q.includes('what is ur name') || q.includes('what are you') || q.includes('what r u')) {
      return `I am ASTU AI 🤖, the official public AI assistant for Adama Science & Technology University (ASTU) Alumni Management & Placement Portal.\n\nI can answer your questions about ASTU, campus services, academic departments, and provide step-by-step guides for registration, transcript requests, job applications, and tracer surveys!`;
    }

    if (q.includes('what is astu') || q.includes('tell me about astu') || q.includes('about astu') || q.includes('adama science') || q.includes('what is this system') || q.includes('what is this portal')) {
      return `🏛️ About Adama Science and Technology University (ASTU):\nASTU is a premier center of excellence in Ethiopia dedicated to Science, Technology, Engineering, and Mathematics (STEM). Located in Adama, Ethiopia, ASTU trains high-calibre engineers and researchers across Computer Science (CSE), Electrical & Computer Engineering (ECE), Mechanical Engineering (ME), Civil Engineering (CE), and Applied Sciences.`;
    }

    if (q.includes('can u do') || q.includes('can you do') || q.includes('what do you do') || q.includes('what do u do') || q.includes('what u do') || q.includes('what can u') || q.includes('what can you') || q.includes('help') || q.includes('features') || q.includes('capabilities') || q.includes('options')) {
      return `💡 Here is what I can help you with:\n• 📋 Registration Guide: How to sign up as Alumni, Student, or Employer.\n• 📄 Academic Transcripts: How to request official transcripts and certificates.\n• 💼 Job Placements: How to browse job vacancies or post hiring opportunities.\n• 📊 Tracer Surveys: How to complete Wave 3 post-graduation tracer studies.\n• 🤝 Mentorship: How to connect with verified alumni mentors.`;
    }

    if (q.includes('employment') || q.includes('placement rate') || q.includes('job stats') || q.includes('hire rate')) {
      return `📊 ASTU Employment & Placement Telemetry:\n• Overall Employment Rate: 55.0%\n• Electrical & Computer Engineering Placement: 75.0%\n• Software Engineering Placement: 63.0%\n• Average Time to Hire: 16.3 months\n• Top Employers: Safaricom Ethiopia, Ethio Telecom, Sunshine Construction, INSA, Wabi Tena.`;
    }

    if (q.includes('salary') || q.includes('salaries') || q.includes('pay') || q.includes('income')) {
      return `💰 Salary Telemetry (ASTU Graduates):\n• Average Starting Salary: ETB 19,185 / month\n• Top Earning Department: Software Engineering (Avg ETB 23,400 / month)\n• Computer Science & ECE: Avg ETB 22,000 / month`;
    }

    if (q.includes('company') || q.includes('companies') || q.includes('employer') || q.includes('top employer')) {
      return `🏢 Top Employers Hiring ASTU Graduates:\n• Safaricom Ethiopia\n• Ethio Telecom\n• Sunshine Construction\n• INSA (Information Network Security Administration)\n• Wabi Tena`;
    }

    if (q.includes('department') || q.includes('programs') || q.includes('courses') || q.includes('major')) {
      return `🎓 ASTU Core Academic Programs & Departments:\n• Computer Science & Engineering (CSE)\n• Electrical & Computer Engineering (ECE)\n• Mechanical Engineering (ME)\n• Civil Engineering (CE)\n• Applied Sciences`;
    }

    if (q.includes('update profile') || q.includes('change profile') || q.includes('edit profile')) {
      return `👤 How to Update Your Profile:\n1. Sign in to your account and go to Dashboard → Profile.\n2. Update your work experience, education, portfolio links, and technical skills.\n3. Click Save Changes to increase your career match rate.`;
    }

    if (q.includes('register') || q.includes('create account') || q.includes('sign up') || q.includes('join network')) {
      return `📋 How to Register on ASTU Portal:\n1. Click the 'Register' button on the top right navigation bar.\n2. Choose your role: Alumni, Student, or Partner Employer.\n3. Fill in your name, email, student ID / graduation year, or company details.\n4. Create a password and click Submit.\n5. Verify your email to activate your account.`;
    }

    if (q.includes('transcript') || q.includes('request document') || q.includes('degree certificate') || q.includes('medium of instruction')) {
      return `📄 How to Request Official Academic Transcripts or Degrees:\n1. Sign in to your Alumni Dashboard.\n2. Go to Document Services → Request Document.\n3. Select your document type (Official Transcript, Degree Certificate, English Medium of Instruction).\n4. Submit your request for Registrar processing (24–48 hours SLA target).\n5. Track request status under My Document Requests.`;
    }

    if (q.includes('tracer survey') || q.includes('wave 3') || q.includes('survey deadline')) {
      return `📋 How to Complete the Graduate Tracer Survey:\n1. Sign in to your Alumni Dashboard.\n2. Open the Surveys tab.\n3. Select the active Wave 3 Graduate Tracer Study.\n4. Answer the questions regarding your current employment status, salary range, and department feedback.\n5. Click Submit Survey to update university telemetry.`;
    }

    if (q.includes('find job') || q.includes('apply for job') || q.includes('search job') || q.includes('career opportunities') || q.includes('vacancy')) {
      return `💼 How to Find Jobs & Apply:\n1. Sign in to the Alumni Portal.\n2. Navigate to Career Center / Jobs.\n3. Filter vacancies by Department (CSE, ECE, ME, CE), Location, or Employer (Safaricom, Ethio Telecom, INSA, Sunshine Construction).\n4. Click Apply Now to submit your resume directly to the employer.`;
    }

    if (q.includes('post job') || q.includes('employer partner') || q.includes('company registration')) {
      return `🏢 How Employers Partner & Post Jobs:\n1. Click Register → Partner Employer on the homepage.\n2. Enter company contact details and industry type for verification.\n3. Once approved, sign in to the Employer Portal.\n4. Navigate to Manage Vacancies → Post Job.\n5. Enter job requirements to publish directly to ASTU graduates.`;
    }

    if (q.includes('mentor') || q.includes('find mentor') || q.includes('mentorship')) {
      return `🤝 How to Connect with Alumni Mentors:\n1. Sign in to your dashboard and open the Mentorship tab.\n2. Browse verified alumni mentors filtered by industry or department.\n3. Click Connect on a mentor profile to send a direct guidance request.`;
    }

    if (q.includes('where is astu') || q.includes('location') || q.includes('where located') || q.includes('campus address') || q.includes('in which city')) {
      return `📍 ASTU Campus Location:\nAdama Science and Technology University is located in Adama (Nazret), Oromia Region, Ethiopia, approximately 100 kilometers southeast of Addis Ababa along the expressway.\n\n• Main Campus: Central administration, academic faculties, and student services.\n• Research Complex: Advanced computing, robotics, and electrical engineering labs.\n• Convocation Center: Graduation hall, career fairs, and innovation symposiums.`;
    }

    if (q.includes('announcement') || q.includes('latest notice') || q.includes('official notice') || q.includes('circular') || q.includes('news')) {
      return `📢 Recent ASTU Official Announcements:\n• ASTU Engineering Innovation Summit 2026 (Sep 9, 2026)\n• Semester Break: Campus Safety Notice & Lab Guidelines (Aug 20, 2026)\n• ASTU Hosts 5-Day DAAD Alumni Workshop on Sustainable Water Supply\n• Annual Alumni & Career Fair Registrations Open\n\nTo view all official notices, visit the Announcements section on the homepage or open /announcements.`;
    }

    if (q.includes('event') || q.includes('workshop') || q.includes('seminar') || q.includes('hackathon') || q.includes('fair')) {
      return `📅 Upcoming ASTU Events & Workshops:\n• ASTU Alumni Carnival 2026 (Main Campus)\n• AI for Engineering Research Workshop (120 seats)\n• CV Builder & Interview Lab (Career Center)\n• Startup Finance for Alumni Innovators\n\nAlumni and students can RSVP or register directly from the Events & Workshops section on the homepage.`;
    }

    if (q.includes('login') || q.includes('sign in') || q.includes('forgot password') || q.includes('reset password')) {
      return `🔐 ASTU-AMS Account & Sign-In Assistance:\n1. Click 'Login' on the top right navigation bar.\n2. Enter your registered email address and password.\n3. If you forgot your password, click 'Forgot Password?' on the login screen to receive a secure recovery OTP.\n4. Complete the 6-digit verification code to set a new password.`;
    }

    if (q.includes('admission') || q.includes('how to join') || q.includes('apply to astu') || q.includes('entrance')) {
      return `🎓 ASTU Admissions & University Entry:\nASTU is a public national center of excellence in STEM. Undergraduate admissions are administered through the Ministry of Education (MoE) entrance examinations and national university placement for top-ranking natural science students.\n\nFor postgraduate (MSc/PhD) programs, admissions are coordinated directly by ASTU Graduate Studies Directorate.`;
    }

    if (q.includes('tuition') || q.includes('fee') || q.includes('cost') || q.includes('how much')) {
      return `💵 Tuition & Fees Information:\n• Regular Ethiopian Government-sponsored undergraduate students are admitted under the national university cost-sharing scheme.\n• Continuing education, summer programs, and postgraduate degree fees vary by department.\n• Digital services on ASTU-AMS (profile creation, job searching, tracer studies, mentorship) are 100% free of charge for verified alumni and employers.`;
    }

    if (q.includes('contact support') || q.includes('help desk') || q.includes('contact alumni') || q.includes('phone') || q.includes('email') || q.includes('call')) {
      return `🎧 How to Contact Support & Campus Offices:\n• Alumni Relations: alumni@astu.edu.et\n• Registrar Directorate: registrar@astu.edu.et\n• Main Campus Telephone: +251 22 110 0001\n• Postal Address: P.O. Box 1888, Adama, Ethiopia\n• Or open a ticket in your dashboard under Help & Support after signing in.`;
    }

    // 3. Fast LLM Execution with 6.0s race timeout
    const liveContext = await this.getCachedContext();
    const systemPrompt = `You are ASTU AI, the official public AI assistant for Adama Science & Technology University.

LIVE ASTU DATABASE CONTEXT:
${liveContext}

DIRECTIVES:
1. Provide dynamic, intelligent, structured answers regarding ASTU academic programs, research, departments, career placement, and system manual steps.
2. CRITICAL FORMATTING RULE: Do NOT use Markdown asterisks like **bold**. Do NOT output ** anywhere in your text. Use clean plain text title lines, clean bullet points (•), and clean numbered steps (1. 2. 3.).
3. Maintain strict security: Never reveal user passwords, private emails, or audit logs.`;

    try {
      const timeoutPromise = new Promise<string>((res) => setTimeout(() => res(''), 6000));
      const llmPromise = OpenRouterService.generateText(query, systemPrompt);
      const rawRes = await Promise.race([llmPromise, timeoutPromise]);
      if (rawRes && rawRes.trim().length > 5) {
        return rawRes.replace(/\*\*/g, '').replace(/\*/g, '').trim();
      }
    } catch {
      /* ignore */
    }

    // 4. Dynamic Context-Aware Fallback (No repetitive welcome loops)
    if (q.includes('job') || q.includes('career') || q.includes('vacancy') || q.includes('work') || q.includes('apply')) {
      return `💼 ASTU Career & Job Placement Guidance:\n1. Sign in to your ASTU Alumni Portal account.\n2. Go to Career Center / Jobs to browse verified employer vacancies.\n3. Filter by department (CSE, ECE, ME, CE) or employer.\n4. Click Apply Now to submit your profile directly.`;
    }

    if (q.includes('transcript') || q.includes('degree') || q.includes('document') || q.includes('certificate')) {
      return `📄 ASTU Official Document & Transcript Guidance:\n1. Sign in to your dashboard.\n2. Open Document Services → Request Document.\n3. Choose Official Transcript, Degree Certificate, or Medium of Instruction.\n4. Submit request for Registrar processing (24–48h SLA).`;
    }

    if (q.includes('register') || q.includes('account') || q.includes('sign up') || q.includes('login')) {
      return `📋 ASTU Portal Registration Steps:\n1. Click Register on the top navigation bar.\n2. Select Alumni, Student, or Partner Employer.\n3. Enter your details and student/alumni ID.\n4. Verify your email to activate account.`;
    }

    return `🤖 ASTU AI Assistant:\nI am here to guide you on Adama Science & Technology University (ASTU) programs, placement statistics, document requests, tracer surveys, and portal navigation.\n\nYou can ask me specific questions such as:\n• "How do I request my transcript?"\n• "What is the average salary of Software Engineering graduates?"\n• "Which companies hire ASTU alumni?"\n• "How do I update my profile?"`;
  }
}
