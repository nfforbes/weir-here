import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyJobsList from '../../components/jobs/MyJobsList';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: jest.fn(),
}));

jest.mock('../../store', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('../../store/slices/jobsSlice', () => ({
  fetchJobs: jest.fn(),
}));

import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAppDispatch, useAppSelector } from '../../store';

describe('MyJobsList Routing Logic', () => {
  const mockPush = jest.fn();
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, replace: jest.fn() });
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    
    // Simulate logged in user
    (useUser as jest.Mock).mockReturnValue({
      user: { sub: 'auth0|123', name: 'Test User' },
      isLoading: false,
    });
    
    // Provide a mocked job to test clicking on it
    (useAppSelector as jest.Mock).mockReturnValue({
      jobs: [
        {
          _id: 'job123',
          title: 'Software Engineer',
          location: 'Remote',
          employmentType: 'full-time',
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }
      ],
      loading: false,
      error: null,
    });
  });

  it('routes correctly when inside the standard user view', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard/my-jobs');
    
    render(<MyJobsList />);
    
    // Click "Add Job"
    const addJobBtn = screen.getByRole('button', { name: /add job/i });
    fireEvent.click(addJobBtn);
    expect(mockPush).toHaveBeenCalledWith('/dashboard/post-job');
    mockPush.mockClear();

    // Click on the job card
    // The card area contains the text "Software Engineer"
    const jobCard = screen.getByText('Software Engineer');
    fireEvent.click(jobCard);
    expect(mockPush).toHaveBeenCalledWith('/dashboard/my-jobs/job123');
  });

  it('routes correctly when inside the admin portal view', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard/admin/portal/my-jobs');
    
    render(<MyJobsList />);
    
    // Click "Add Job"
    const addJobBtn = screen.getByRole('button', { name: /add job/i });
    fireEvent.click(addJobBtn);
    expect(mockPush).toHaveBeenCalledWith('/dashboard/admin/portal/post-job');
    mockPush.mockClear();

    // Click on the job card
    const jobCard = screen.getByText('Software Engineer');
    fireEvent.click(jobCard);
    expect(mockPush).toHaveBeenCalledWith('/dashboard/admin/portal/my-jobs/job123');
  });
});
