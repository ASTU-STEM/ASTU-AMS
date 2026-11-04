import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CandidatePipelineKanban, CandidateItem } from './CandidatePipelineKanban';
import { VacancyPostingModal } from '../modals/VacancyPostingModal';
import { PartnerMoUDirectory } from './PartnerMoUDirectory';

describe('Employer Candidate Pipeline & Portal Suite', () => {
  const mockCandidates: CandidateItem[] = [
    {
      id: 'cand-1',
      name: 'Kalkidan Bekele',
      studentId: 'ETS/0412/12',
      department: 'Computer Science and Engineering',
      cgpa: '3.88',
      roleApplied: 'Junior Backend Software Engineer',
      stage: 'Applied',
      matchScore: 94,
    },
    {
      id: 'cand-2',
      name: 'Yared Tadesse',
      studentId: 'ETS/0819/12',
      department: 'Electrical & Electronics Engineering',
      cgpa: '3.75',
      roleApplied: 'IoT Embedded Systems Specialist',
      stage: 'Interview',
      matchScore: 89,
    },
  ];

  it('renders all 5 candidate kanban stages with candidate cards', () => {
    const onStageChange = vi.fn();
    render(<CandidatePipelineKanban candidates={mockCandidates} onStageChange={onStageChange} />);

    expect(screen.getByText(/Talent Acquisition Pipeline/i)).toBeInTheDocument();
    expect(screen.getByText('Applied')).toBeInTheDocument();
    expect(screen.getByText('Screening')).toBeInTheDocument();
    expect(screen.getByText('Interview')).toBeInTheDocument();
    expect(screen.getByText('Offer Extended')).toBeInTheDocument();
    expect(screen.getByText('Hired')).toBeInTheDocument();

    expect(screen.getByText('Kalkidan Bekele')).toBeInTheDocument();
    expect(screen.getByText('Yared Tadesse')).toBeInTheDocument();
    expect(screen.getByText(/CGPA: 3.88/i)).toBeInTheDocument();
  });

  it('advances a candidate to the next stage when clicking advance button', () => {
    const onStageChange = vi.fn();
    render(<CandidatePipelineKanban candidates={mockCandidates} onStageChange={onStageChange} />);

    // In 'Applied', find Advance button
    const advanceButtons = screen.getAllByRole('button', { name: /Advance/i });
    expect(advanceButtons.length).toBeGreaterThan(0);

    fireEvent.click(advanceButtons[0]);
    expect(onStageChange).toHaveBeenCalledWith('cand-1', 'Screening');
  });

  it('validates required fields across steps in VacancyPostingModal', () => {
    const onClose = vi.fn();
    const onSubmitVacancy = vi.fn();

    render(
      <VacancyPostingModal
        isOpen={true}
        onClose={onClose}
        onSubmitVacancy={onSubmitVacancy}
      />
    );

    expect(screen.getByText(/Post Graduate Career Vacancy/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();

    // Advancing with empty title should not proceed
    const titleInput = screen.getByPlaceholderText(/e.g. Junior Embedded Systems Engineer/i);
    fireEvent.change(titleInput, { target: { value: '' } });
    fireEvent.click(screen.getByText(/Continue/i));
    expect(onSubmitVacancy).not.toHaveBeenCalled();

    // Fill title and proceed
    fireEvent.change(titleInput, { target: { value: 'Senior DevOps Architect' } });
    fireEvent.click(screen.getByText(/Continue/i));

    // Now in Step 2
    expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument();
  });

  it('renders PartnerMoUDirectory and filters by accreditation tier', () => {
    render(<PartnerMoUDirectory />);

    expect(screen.getByText(/Active MoUs/i)).toBeInTheDocument();
    expect(screen.getByText(/Ethio Telecom Innovation Labs/i)).toBeInTheDocument();

    // Click Research tier filter
    const researchFilterBtn = screen.getByRole('button', { name: /^Research$/i });
    fireEvent.click(researchFilterBtn);

    expect(screen.getByText(/Ethiopian Artificial Intelligence Institute/i)).toBeInTheDocument();
    expect(screen.queryByText(/Commercial Bank of Ethiopia/i)).not.toBeInTheDocument();
  });
});
