import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LandingPage from '../pages/LandingPage';
import * as AuthContext from '../context/AuthContext';
import * as api from '../utils/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockSignInAsDemoRole = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    signInAsDemoRole: mockSignInAsDemoRole,
  }),
}));

vi.mock('../utils/api', () => ({
  healthCheck: vi.fn(() => Promise.resolve({ data: { success: true } })),
}));

const mockT = (str) => str;
vi.mock('../utils/useTranslation', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

describe('LandingPage rendering and actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders landing page navigation and features', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Header logo text
    expect(screen.getAllByText(/StadiumPulse/i)[0]).toBeInTheDocument();
    
    // Sign In button link
    expect(screen.getByRole('link', { name: /Sign In/i })).toBeInTheDocument();

    // Features list
    expect(screen.getByText('Smart Routing')).toBeInTheDocument();
    expect(screen.getByText('AI Translation')).toBeInTheDocument();
    expect(screen.getByText('Accessibility')).toBeInTheDocument();
  });

  it('calls healthCheck on render', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    expect(api.healthCheck).toHaveBeenCalled();
  });

  it('signs in as fan demo role and navigates to fan home', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const fanButton = screen.getByText('Fan Experience');
    fireEvent.click(fanButton);

    expect(mockSignInAsDemoRole).toHaveBeenCalledWith('fan');
    expect(mockNavigate).toHaveBeenCalledWith('/fan-home');
  });

  it('signs in as staff demo role and navigates to staff dashboard', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const staffButton = screen.getByText('Venue operations');
    fireEvent.click(staffButton);

    expect(mockSignInAsDemoRole).toHaveBeenCalledWith('staff');
    expect(mockNavigate).toHaveBeenCalledWith('/staff-dashboard');
  });
});
