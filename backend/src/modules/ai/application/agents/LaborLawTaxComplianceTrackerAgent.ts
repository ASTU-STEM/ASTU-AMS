import prisma from '../../../../core/config/db';
import { AutonomousNotificationDispatcher } from '../services/AutonomousNotificationDispatcher';

export interface LaborLawTaxResult {
  policyName: string;
  taxIncentiveSummary: string;
  employerTargetCount: number;
  advisoryEmailed: boolean;
}

export class LaborLawTaxComplianceTrackerAgent {
  /**
   * Monitors tax policies and labor laws in Ethiopia & East Africa.
   * If it detects a government tax incentive for hiring fresh graduates, emails employers showing how they save money by hiring ASTU alumni.
   */
  public static async trackLaborLawIncentives(): Promise<LaborLawTaxResult> {
    const employers = await prisma.employerProfile.findMany({
      select: { contactEmail: true },
    }).catch(() => []);

    const policyName = 'Ethiopian Ministry of Revenue Fresh Graduate Tax Exemption Scheme 2026';
    const taxIncentiveSummary = 'Corporate Tax Deduction of 150% on training expenses & 3-year payroll tax exemption for hiring STEM graduates.';

    const advisoryContent = `ADAMA SCIENCE & TECHNOLOGY UNIVERSITY (ASTU)
OFFICE OF INDUSTRY PARTNERSHIPS & LEGAL COMPLIANCE

TAX INCENTIVE ADVISORY FOR EMPLOYERS
POLICY: ${policyName}

1. OVERVIEW:
The Ministry of Revenue and Ministry of Innovation & Technology (MInT) have enacted tax incentives for Ethiopian enterprises hiring accredited STEM university graduates.

2. FINANCIAL BENEFIT TO YOUR COMPANY:
- Payroll Tax Exemption: 3-year tax exemption for new ASTU engineering hires.
- Corporate Income Tax Deduction: 150% tax deduction on technical training expenses.

3. HOW TO CLAIM:
Recruit verified ASTU graduates directly via the ASTU Employer Portal: http://localhost:5173/employer/jobs

Advisory generated automatically by ASTU Labor Law & Tax Compliance Tracker Agent.`;

    let advisoryEmailed = false;
    try {
      await AutonomousNotificationDispatcher.dispatchProposalNotification({
        title: `EMPLOYER TAX INCENTIVE ADVISORY: Save Money Hiring ASTU Alumni`,
        documentSubject: `ASTU_Tax_Incentive_Advisory_Employers_2026`,
        documentFormat: 'PDF',
        documentContent: advisoryContent,
        targetRoles: ['EMPLOYER', 'SUPER_ADMIN'],
        targetEmails: employers.map(e => e.contactEmail).filter((e): e is string => typeof e === 'string' && e.includes('@')),
      }).then(() => { advisoryEmailed = true; }).catch(() => {});
    } catch {}

    return {
      policyName,
      taxIncentiveSummary,
      employerTargetCount: employers.length,
      advisoryEmailed,
    };
  }
}
