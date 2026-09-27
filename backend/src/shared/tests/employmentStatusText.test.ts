import { mapEmploymentStatusAnswer } from '../employmentStatusText';

describe('mapEmploymentStatusAnswer', () => {
  it('does not read "unemployed" as employed', () => {
    // Regression: "unemployed".includes("employed") === true, so the previous
    // `includes` chain recorded every unemployed survey answer as EMPLOYED.
    for (const answer of ['unemployed', 'Unemployed', 'I am currently unemployed', 'UNEMPLOYED']) {
      expect(mapEmploymentStatusAnswer(answer)).toBe('UNEMPLOYED');
    }
  });

  it('does not read "not employed" as employed', () => {
    expect(mapEmploymentStatusAnswer('not employed')).toBe('UNEMPLOYED');
    expect(mapEmploymentStatusAnswer('Not currently employed')).toBe('UNEMPLOYED');
  });

  it('recognises self-employment before plain employment', () => {
    expect(mapEmploymentStatusAnswer('self-employed')).toBe('SELF_EMPLOYED');
    expect(mapEmploymentStatusAnswer('Self Employed')).toBe('SELF_EMPLOYED');
    expect(mapEmploymentStatusAnswer('freelance')).toBe('SELF_EMPLOYED');
  });

  it('recognises genuine employment', () => {
    expect(mapEmploymentStatusAnswer('Employed')).toBe('EMPLOYED');
    expect(mapEmploymentStatusAnswer('Working full-time')).toBe('EMPLOYED');
    expect(mapEmploymentStatusAnswer('part time')).toBe('EMPLOYED');
  });

  it('reports unrecognised answers as unspecified rather than unemployed', () => {
    for (const answer of ['student', 'retired', 'on sabbatical', 'maybe', '']) {
      expect(mapEmploymentStatusAnswer(answer)).toBe('UNSPECIFIED');
    }
    expect(mapEmploymentStatusAnswer(null)).toBe('UNSPECIFIED');
    expect(mapEmploymentStatusAnswer(undefined)).toBe('UNSPECIFIED');
  });

  it('honours an explicit caller fallback', () => {
    expect(mapEmploymentStatusAnswer('something else', 'UNEMPLOYED')).toBe('UNEMPLOYED');
  });
});
