import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { parseCsvText } from './csvExcelParser';
import { ValidationErrorPanel } from './ValidationErrorPanel';
import { ColumnMappingModal } from './ColumnMappingModal';
import { DataIntegrationTab } from '../DataIntegrationTab';

describe('Registrar Data Integration Suite', () => {
  it('correctly maps CSV columns with standard headers and validates records', () => {
    const csvData = `Student ID,Full Name,Department,CGPA,Grad Year
ETS/0123/12,Abebe Bikila,Software Engineering,3.85,2024
ETS/0456/12,Almaz Ayana,Civil Engineering,3.92,2023`;

    const result = parseCsvText(csvData);
    expect(result.headers).toEqual(['Student ID', 'Full Name', 'Department', 'CGPA', 'Grad Year']);
    expect(result.validCount).toBe(2);
    expect(result.errors.length).toBe(0);
    expect(result.records[0].studentId).toBe('ETS/0123/12');
    expect(result.records[0].fullName).toBe('Abebe Bikila');
    expect(result.records[0].cgpa).toBe(3.85);
  });

  it('detects invalid CGPA and captures error with row/column marker', () => {
    const csvDataWithBadCgpa = `Student ID,Full Name,Department,CGPA,Graduation Year
ETS/0999/12,Invalid Student,Software Engineering,4.85,2024`;

    const result = parseCsvText(csvDataWithBadCgpa);
    expect(result.validCount).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].row).toBe(2);
    expect(result.errors[0].column.toLowerCase()).toBe('cgpa');
  });

  it('renders ValidationErrorPanel with dark error background styling #3B1A22', () => {
    const mockErrors = [
      { row: 2, column: 'cgpa', message: 'CGPA 4.5 exceeds maximum 4.0 scale', value: '4.5' }
    ];
    const onRetry = vi.fn();
    const onRemap = vi.fn();

    const { container } = render(
      <ValidationErrorPanel errors={mockErrors} onRetry={onRetry} onRemapColumns={onRemap} />
    );

    // Verify dark warning error background class
    const errorPanel = container.querySelector('[data-testid="validation-error-panel"]');
    expect(errorPanel).toBeInTheDocument();
    expect(errorPanel?.className).toContain('bg-[#3B1A22]');
    expect(screen.getByText(/Data Validation Failed/i)).toBeInTheDocument();
    expect(screen.getByText(/CGPA 4.5 exceeds maximum 4.0 scale/i)).toBeInTheDocument();

    // Trigger retry
    fireEvent.click(screen.getByText(/Retry Upload/i));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('allows column re-mapping via ColumnMappingModal', () => {
    const onApply = vi.fn();
    const onClose = vi.fn();

    render(
      <ColumnMappingModal
        isOpen={true}
        headers={['sid', 'student_name', 'dept_name', 'score_gpa', 'grad_date']}
        initialMapping={{
          studentId: 'sid',
          fullName: 'student_name',
          department: 'dept_name',
          cgpa: 'score_gpa',
          graduationYear: 'grad_date',
        }}
        onApplyMapping={onApply}
        onClose={onClose}
      />
    );

    expect(screen.getByText(/Map Spreadsheet Columns/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Apply Mapping/i));
    expect(onApply).toHaveBeenCalled();
  });

  it('renders DataIntegrationTab and presents upload dropzone', () => {
    render(<DataIntegrationTab />);
    expect(screen.getByText(/SIS Batch Data Integration/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload Graduating Class Spreadsheet/i)).toBeInTheDocument();
    expect(screen.getByTestId('dropzone')).toBeInTheDocument();
  });
});
