import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CareerJobsTab } from './CareerJobsTab';
import { DocumentServicesTrackerTab } from './DocumentServicesTrackerTab';
import { JobMatch, DocumentRequest } from '../../types/alumni.types';

describe('Alumni Workspace Job & Document Pipeline Suite', () => {
  const mockJobs: JobMatch[] = [
    {
      id: 'job-1',
      title: 'Junior Backend Software Engineer',
      company: 'Ethio Telecom Innovation Labs',
      location: 'Addis Ababa / Hybrid',
      matchScore: 95,
      type: 'Full-time',
      salary: '32,000 ETB / Mo',
      description: 'Design distributed microservices on AWS and Kubernetes.',
      skills: ['Go', 'TypeScript', 'Docker'],
      department: 'Computer Science & Engineering',
      applied: false,
    },
    {
      id: 'job-2',
      title: 'Structural Systems Engineer',
      company: 'MIDROC Construction Group',
      location: 'Hawassa / On-site',
      matchScore: 88,
      type: 'Full-time',
      salary: '28,000 ETB / Mo',
      description: 'Seismic stress simulation and concrete structural designs.',
      skills: ['AutoCAD', 'Structural Analysis'],
      department: 'Civil & Environmental Engineering',
      applied: false,
    },
  ];

  it('renders open jobs with department and company titles', () => {
    const onApply = vi.fn();
    render(<CareerJobsTab jobs={mockJobs} onApply={onApply} />);

    expect(screen.getByText(/ASTU Verified Career & Job Board/i)).toBeInTheDocument();
    expect(screen.getByText('Junior Backend Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Structural Systems Engineer')).toBeInTheDocument();
  });

  it('filters vacancies by engineering department', () => {
    const onApply = vi.fn();
    render(<CareerJobsTab jobs={mockJobs} onApply={onApply} />);

    // Select Civil & Environmental Engineering
    const deptSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(deptSelect, { target: { value: 'Civil & Environmental Engineering' } });

    expect(screen.getByText('Structural Systems Engineer')).toBeInTheDocument();
    expect(screen.queryByText('Junior Backend Software Engineer')).not.toBeInTheDocument();
  });

  it('executes 1-Click Apply callback when application button is clicked', () => {
    const onApply = vi.fn();
    render(<CareerJobsTab jobs={mockJobs} onApply={onApply} />);

    const applyButtons = screen.getAllByText(/1-Click Apply/i);
    expect(applyButtons.length).toBe(2);

    fireEvent.click(applyButtons[0]);
    expect(onApply).toHaveBeenCalledWith('job-1');
  });

  it('renders Document Services Tracker with 4 lifecycle stages', () => {
    const mockRequests: DocumentRequest[] = [
      {
        id: 101,
        type: 'Official Academic Transcript',
        status: 'Under Registrar Review',
        requestDate: '2026-11-02',
      },
      {
        id: 102,
        type: 'Degree Certificate Attestation',
        status: 'Ready for Collection',
        requestDate: '2026-10-25',
      },
    ];

    const onRequestNew = vi.fn();
    render(<DocumentServicesTrackerTab documentRequests={mockRequests} onRequestNew={onRequestNew} />);

    expect(screen.getByText(/University Document Lifecycle Tracker/i)).toBeInTheDocument();
    expect(screen.getByText(/ASTU-DOC-0101/i)).toBeInTheDocument();
    expect(screen.getByText(/ASTU-DOC-0102/i)).toBeInTheDocument();

    // Verify presence of lifecycle stages
    expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Under Registrar Review').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Issued').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ready for Collection').length).toBeGreaterThan(0);

    // Click request new
    fireEvent.click(screen.getByText(/Request Document/i));
    expect(onRequestNew).toHaveBeenCalledTimes(1);
  });
});
