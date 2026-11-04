import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import IctUniversalLogsPage from './IctUniversalLogsPage';

describe('ICT Universal Security & Audit Stream Suite', () => {
  it('renders the universal logs page with telemetry summary and initial log items', () => {
    render(<IctUniversalLogsPage />);

    expect(screen.getByText(/ICT Universal System & Security Logs/i)).toBeInTheDocument();
    expect(screen.getByText('STUDENT_RECORDS_IMPORT')).toBeInTheDocument();
    expect(screen.getByText('FAILED_2FA_ATTEMPT')).toBeInTheDocument();
  });

  it('filters log stream by severity level (CRITICAL)', () => {
    render(<IctUniversalLogsPage />);

    // Click CRITICAL severity button
    const criticalBtn = screen.getByRole('button', { name: 'CRITICAL' });
    fireEvent.click(criticalBtn);

    expect(screen.getByText('FAILED_2FA_ATTEMPT')).toBeInTheDocument();
    expect(screen.queryByText('STUDENT_RECORDS_IMPORT')).not.toBeInTheDocument();
  });

  it('filters log stream by IP address query', () => {
    render(<IctUniversalLogsPage />);

    const searchInput = screen.getByPlaceholderText(/Search by action, actor ID, IP address/i);
    fireEvent.change(searchInput, { target: { value: '197.156.102.44' } });

    expect(screen.getByText('FAILED_2FA_ATTEMPT')).toBeInTheDocument();
    expect(screen.getByText('SEC-ACTOR-991')).toBeInTheDocument();
    expect(screen.queryByText('STUDENT_RECORDS_IMPORT')).not.toBeInTheDocument();
  });

  it('filters log stream by actor ID or name query', () => {
    render(<IctUniversalLogsPage />);

    const searchInput = screen.getByPlaceholderText(/Search by action, actor ID, IP address/i);
    fireEvent.change(searchInput, { target: { value: 'Sara Worku' } });

    expect(screen.getByText('STUDENT_RECORDS_IMPORT')).toBeInTheDocument();
    expect(screen.queryByText('FAILED_2FA_ATTEMPT')).not.toBeInTheDocument();
  });

  it('opens and closes mutation state diff modal for mutation log events', () => {
    render(<IctUniversalLogsPage />);

    // Find and click Diff button on STUDENT_RECORDS_IMPORT
    const diffButtons = screen.getAllByRole('button', { name: /Diff/i });
    expect(diffButtons.length).toBeGreaterThan(0);

    fireEvent.click(diffButtons[0]);

    expect(screen.getByText(/Mutation Diff/i)).toBeInTheDocument();
    expect(screen.getByText(/Before State/i)).toBeInTheDocument();
    expect(screen.getByText(/After State/i)).toBeInTheDocument();

    // Close diff inspector
    fireEvent.click(screen.getByText(/Close Diff Inspector/i));
    expect(screen.queryByText(/Close Diff Inspector/i)).not.toBeInTheDocument();
  });
});
