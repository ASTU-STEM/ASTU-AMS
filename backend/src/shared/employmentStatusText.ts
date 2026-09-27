/**
 * Maps free-text survey answers onto EmploymentStatus.
 *
 * Order matters and is not cosmetic: "unemployed" and "not employed" both
 * contain the substring "employed", so a naive `includes('employed')` check
 * classifies graduates who said they are UNEMPLOYED as EMPLOYED. That silently
 * inflated every employment rate derived from survey responses.
 *
 * Anything we cannot confidently classify is reported as UNSPECIFIED rather
 * than being coerced into UNEMPLOYED.
 */
export type MappedEmploymentStatus = 'EMPLOYED' | 'SELF_EMPLOYED' | 'UNEMPLOYED' | 'UNSPECIFIED';

const NEGATIVE = [
  'unemployed',
  'not employed',
  'no job',
  'without a job',
  'jobless',
  'seeking',
  'looking for work',
  'looking for a job',
  'currently not',
  'not currently',
];

// Neither employed nor seeking work. Counting these as unemployed would still
// overstate job-seeking graduates, so they stay UNSPECIFIED.
const NOT_IN_LABOUR_FORCE = ['retired', 'student', 'on sabbatical', 'studying'];

const SELF = ['self-employed', 'self employed', 'selfemployed', 'freelance', 'own business', 'entrepreneur'];

const POSITIVE = [
  'employed',
  'working',
  'full-time',
  'full time',
  'fulltime',
  'part-time',
  'part time',
  'parttime',
  'salaried',
  'permanent',
];

const has = (haystack: string, needles: string[]): boolean => needles.some((n) => haystack.includes(n));

/**
 * @param answerText raw graduate response, e.g. "I am self-employed"
 * @param fallback value to use when the question is blank/unrecognised
 */
export const mapEmploymentStatusAnswer = (
  answerText: string | null | undefined,
  fallback: MappedEmploymentStatus = 'UNSPECIFIED'
): MappedEmploymentStatus => {
  const val = (answerText ?? '').toLowerCase().trim();
  if (!val) return fallback;

  // Negative first: these embed the substring "employed".
  if (has(val, NOT_IN_LABOUR_FORCE)) return 'UNSPECIFIED';
  if (has(val, NEGATIVE)) return 'UNEMPLOYED';
  if (has(val, SELF)) return 'SELF_EMPLOYED';
  if (has(val, POSITIVE)) return 'EMPLOYED';
  return fallback;
};
