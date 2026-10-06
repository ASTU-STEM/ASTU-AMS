import { GetDepartmentDashboardOverview } from '../backend/src/modules/department/application/use-cases/GetDepartmentDashboardOverview';

const useCase = new GetDepartmentDashboardOverview();

async function run() {
  const result = await useCase.execute({ userId: 'user-head-swe', department: 'Software Engineering', academicYear: '2024' });
  console.log('=== skillGapItems ===');
  console.log(JSON.stringify(result.skillGapItems, null, 2));
}

run().catch(err => {
  console.error(err);
});
