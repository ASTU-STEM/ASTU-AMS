import { GetDepartmentDashboardOverview } from '../backend/src/modules/department/application/use-cases/GetDepartmentDashboardOverview';

const useCase = new GetDepartmentDashboardOverview();

async function run() {
  const result = await useCase.execute({ userId: 'user-head-swe', department: 'Software Engineering', academicYear: '2024' });
  console.log('employmentTrendData:', JSON.stringify(result.employmentTrendData, null, 2));
  console.log('tracerCompletionData:', JSON.stringify(result.tracerCompletionData, null, 2));
  console.log('topHiringCompanies:', JSON.stringify(result.topHiringCompanies, null, 2));
  console.log('topIndustries:', JSON.stringify(result.topIndustries, null, 2));
}

run().catch(err => {
  console.error(err);
});
