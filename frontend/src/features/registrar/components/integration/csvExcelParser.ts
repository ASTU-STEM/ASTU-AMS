export interface ColumnMapping {
  studentId: string;
  fullName: string;
  department: string;
  cgpa: string;
  graduationYear: string;
  email?: string;
  phone?: string;
}

export interface ParseError {
  row: number;
  column: string;
  value: string;
  message: string;
}

export interface ParsedGradRecord {
  rowNum: number;
  studentId: string;
  fullName: string;
  department: string;
  cgpa: number;
  graduationYear: number;
  email?: string;
  phone?: string;
  isValid: boolean;
  errors: string[];
}

export interface ParseResult {
  headers: string[];
  records: ParsedGradRecord[];
  errors: ParseError[];
  validCount: number;
  invalidCount: number;
}

const ALIAS_MAP: Record<keyof ColumnMapping, string[]> = {
  studentId: ['studentid', 'student_id', 'id', 'regno', 'reg_no', 'matric', 'student id'],
  fullName: ['fullname', 'full_name', 'name', 'student_name', 'studentname', 'full name'],
  department: ['department', 'dept', 'program', 'faculty', 'field_of_study', 'field of study'],
  cgpa: ['cgpa', 'gpa', 'cumulative_gpa', 'grade', 'score'],
  graduationYear: ['graduationyear', 'graduation_year', 'gradyear', 'grad_year', 'year', 'batch', 'class'],
  email: ['email', 'email_address', 'mail'],
  phone: ['phone', 'mobile', 'telephone', 'tel'],
};

export function autoDetectMapping(headers: string[]): ColumnMapping {
  const normHeaders = headers.map((h) => ({ raw: h, norm: h.trim().toLowerCase().replace(/[\s_-]+/g, '') }));
  const mapping: ColumnMapping = {
    studentId: '',
    fullName: '',
    department: '',
    cgpa: '',
    graduationYear: '',
  };

  (Object.keys(ALIAS_MAP) as Array<keyof ColumnMapping>).forEach((field) => {
    const aliases = ALIAS_MAP[field];
    const match = normHeaders.find((h) => aliases.some((a) => a.replace(/[\s_-]+/g, '') === h.norm));
    if (match) {
      mapping[field] = match.raw;
    }
  });

  return mapping;
}

export function parseCsvText(csvText: string, mapping?: Partial<ColumnMapping>): ParseResult {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { headers: [], records: [], errors: [], validCount: 0, invalidCount: 0 };
  }

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const activeMapping: ColumnMapping = {
    ...autoDetectMapping(headers),
    ...mapping,
  };

  const headerIdx = (headerName: string) => headers.findIndex((h) => h.toLowerCase() === headerName.toLowerCase());

  const idCol = headerIdx(activeMapping.studentId);
  const nameCol = headerIdx(activeMapping.fullName);
  const deptCol = headerIdx(activeMapping.department);
  const cgpaCol = headerIdx(activeMapping.cgpa);
  const yearCol = headerIdx(activeMapping.graduationYear);
  const emailCol = activeMapping.email ? headerIdx(activeMapping.email) : -1;
  const phoneCol = activeMapping.phone ? headerIdx(activeMapping.phone) : -1;

  const records: ParsedGradRecord[] = [];
  const errors: ParseError[] = [];
  const seenIds = new Set<string>();

  for (let r = 1; r < lines.length; r++) {
    const cols = parseLine(lines[r]);
    const rowNum = r + 1;
    const rowErrors: string[] = [];

    const studentId = idCol >= 0 ? cols[idCol] || '' : '';
    const fullName = nameCol >= 0 ? cols[nameCol] || '' : '';
    const department = deptCol >= 0 ? cols[deptCol] || '' : '';
    const rawCgpa = cgpaCol >= 0 ? cols[cgpaCol] || '' : '';
    const rawYear = yearCol >= 0 ? cols[yearCol] || '' : '';
    const email = emailCol >= 0 ? cols[emailCol] : undefined;
    const phone = phoneCol >= 0 ? cols[phoneCol] : undefined;

    if (!studentId) {
      errors.push({ row: rowNum, column: 'Student ID', value: '', message: 'Student ID is missing' });
      rowErrors.push('Missing Student ID');
    } else if (seenIds.has(studentId)) {
      errors.push({ row: rowNum, column: 'Student ID', value: studentId, message: 'Duplicate Student ID in file' });
      rowErrors.push('Duplicate Student ID');
    } else {
      seenIds.add(studentId);
    }

    if (!fullName) {
      errors.push({ row: rowNum, column: 'Full Name', value: '', message: 'Full name is required' });
      rowErrors.push('Missing Full Name');
    }

    if (!department) {
      errors.push({ row: rowNum, column: 'Department', value: '', message: 'Department is required' });
      rowErrors.push('Missing Department');
    }

    const cgpaNum = parseFloat(rawCgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 4.0) {
      errors.push({ row: rowNum, column: 'CGPA', value: rawCgpa, message: 'CGPA must be a valid number between 0.0 and 4.0' });
      rowErrors.push('Invalid CGPA');
    }

    const yearNum = parseInt(rawYear, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(yearNum) || yearNum < 1980 || yearNum > currentYear + 2) {
      errors.push({ row: rowNum, column: 'Grad Year', value: rawYear, message: `Grad Year must be between 1980 and ${currentYear + 2}` });
      rowErrors.push('Invalid Grad Year');
    }

    records.push({
      rowNum,
      studentId,
      fullName,
      department,
      cgpa: isNaN(cgpaNum) ? 0 : cgpaNum,
      graduationYear: isNaN(yearNum) ? 0 : yearNum,
      email,
      phone,
      isValid: rowErrors.length === 0,
      errors: rowErrors,
    });
  }

  const validCount = records.filter((r) => r.isValid).length;
  return {
    headers,
    records,
    errors,
    validCount,
    invalidCount: records.length - validCount,
  };
}
