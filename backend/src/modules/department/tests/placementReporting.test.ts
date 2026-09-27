import {
  GetDepartmentStats,
  GetDepartmentAnalytics,
} from '../application/use-cases/DepartmentLookups';
import { IDepartmentHeadRepository } from '../application/ports/IDepartmentHeadRepository';
import { IAlumniDepartmentRepository } from '../application/ports/IAlumniDepartmentRepository';
import { AlumniBasicInfo } from '../application/ports/IAlumniDepartmentRepository';

/**
 * The department dashboard feeds accreditation reporting, so its placement
 * numbers must never be flattering by accident.
 *
 * The previous implementation derived unemployment as
 * `total - employed - selfEmployed`, which silently reclassified any graduate
 * who had not yet set a status as unemployed. These tests pin the corrected
 * behaviour: only an explicit UNEMPLOYED counts as unemployed, and everything
 * else is reported as unspecified.
 */

const alumniRepo = (records: Partial<AlumniBasicInfo>[]): IAlumniDepartmentRepository =>
  ({
    findByDepartmentId: jest.fn().mockResolvedValue(records),
  }) as unknown as IAlumniDepartmentRepository;

const headRepo = (): IDepartmentHeadRepository =>
  ({
    findByUserId: jest.fn().mockResolvedValue({ departmentId: 'dept-swe' }),
  }) as unknown as IDepartmentHeadRepository;

const grad = (
  employmentStatus: string | null | undefined,
  extra: Partial<AlumniBasicInfo> = {}
): Partial<AlumniBasicInfo> => ({
  id: Math.random().toString(36).slice(2),
  employmentStatus: employmentStatus as AlumniBasicInfo['employmentStatus'],
  ...extra,
});

describe('department placement reporting (regression)', () => {
  it('does not count a graduate with no status as unemployed', async () => {
    const list = [
      grad('EMPLOYED'),
      grad('EMPLOYED'),
      grad('UNEMPLOYED'),
      grad('SELF_EMPLOYED'),
      grad(null), // never reported
    ];
    const uc = new GetDepartmentAnalytics(headRepo(), alumniRepo(list));
    const result = await uc.execute('user-1');

    expect(result.totalAlumni).toBe(5);
    expect(result.employed).toBe(2);
    expect(result.unemployed).toBe(1);
    expect(result.selfEmployed).toBe(1);
    expect(result.unspecified).toBe(1);
  });

  it('keeps the three figures reconciling to the department total', async () => {
    const list = [grad('EMPLOYED'), grad('UNEMPLOYED'), grad(null), grad('RETIRED')];
    const uc = new GetDepartmentAnalytics(headRepo(), alumniRepo(list));
    const { totalAlumni, employed, selfEmployed, unemployed, unspecified } = await uc.execute('u');

    expect(employed + selfEmployed + unemployed + unspecified).toBe(totalAlumni);
  });

  it('excludes unspecified graduates from the unemployment denominator', async () => {
    // 1 unemployed out of 2 who actually reported = 50%, not 1/4 = 25%.
    const list = [grad('EMPLOYED'), grad('UNEMPLOYED'), grad(null), grad(null)];
    const uc = new GetDepartmentAnalytics(headRepo(), alumniRepo(list));
    const result = await uc.execute('u');

    expect(result.unemploymentRate).toBeCloseTo(50, 5);
  });

  it('reports unspecified as its own status bucket rather than hiding it', async () => {
    const list = [grad('EMPLOYED'), grad('EMPLOYED'), grad(null)];
    const uc = new GetDepartmentAnalytics(headRepo(), alumniRepo(list));
    const { employmentStatusDistribution } = await uc.execute('u');

    const unspecified = employmentStatusDistribution.find((s) => s.status === 'Unspecified');
    expect(unspecified).toBeDefined();
    expect(unspecified!.count).toBe(1);
  });

  it('applies the same rule to the summary stats endpoint', async () => {
    const list = [grad('EMPLOYED'), grad('EMPLOYED'), grad('UNEMPLOYED'), grad(null)];
    const uc = new GetDepartmentStats(headRepo(), alumniRepo(list));
    const result = await uc.execute('u');

    expect(result.totalAlumni).toBe(4);
    expect(result.employedAlumni).toBe(2);
    // The old code reported 1 unemployed here by coincidence; assert the
    // denominator case that used to be wrong: 3 placed, 1 unknown.
    expect(result.unemployedAlumni).toBe(1);
  });

  it('does not report a negative unemployment count on empty data', async () => {
    const uc = new GetDepartmentAnalytics(headRepo(), alumniRepo([]));
    const result = await uc.execute('u');

    expect(result.totalAlumni).toBe(0);
    expect(result.unemployed).toBe(0);
    expect(result.unspecified).toBe(0);
    expect(result.employmentRate).toBe(0);
    expect(Number.isNaN(result.employmentRate)).toBe(false);
  });

  it('reports median alongside mean and states the reporting coverage', async () => {
    const list = [
      grad('EMPLOYED', { salary: 10 }),
      grad('EMPLOYED', { salary: 20 }),
      grad('EMPLOYED', { salary: 30 }),
      grad('EMPLOYED', { salary: 1000 }), // outlier
      grad('UNEMPLOYED'),
    ];
    const uc = new GetDepartmentAnalytics(headRepo(), alumniRepo(list));
    const result = await uc.execute('u');

    expect(result.averageSalary).toBe(265); // skewed by the outlier
    expect(result.medianSalary).toBe(25); // representative
    expect(result.salaryCount).toBe(4);
    expect(result.salaryCoverage).toBeCloseTo(80, 5);
  });

  it('leaves salary figures null when nobody has reported one', async () => {
    const uc = new GetDepartmentAnalytics(headRepo(), alumniRepo([grad('EMPLOYED')]));
    const result = await uc.execute('u');

    expect(result.averageSalary).toBeNull();
    expect(result.medianSalary).toBeNull();
    expect(result.salaryCoverage).toBe(0);
  });

  it('ignores nonsensical salary values instead of skewing the average', async () => {
    const list = [
      grad('EMPLOYED', { salary: 100 }),
      grad('EMPLOYED', { salary: 0 }),
      grad('EMPLOYED', { salary: -50 }),
      grad('EMPLOYED', { salary: NaN }),
    ];
    const uc = new GetDepartmentAnalytics(headRepo(), alumniRepo(list));
    const result = await uc.execute('u');

    expect(result.averageSalary).toBe(100);
    expect(result.salaryCount).toBe(1);
  });
});
