import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { ProtectedRoute } from '../App';
import * as AuthContext from '../context/AuthContext';

// Mock useAuth hook
vi.mock('../context/AuthContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe('ProtectedRoute Guard', () => {
  it('renders loading session message when loading is true', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Authenticating session...')).toBeInTheDocument();
  });

  it('redirects to /login when user is not logged in', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children when user is logged in and role is allowed', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { role: 'fan', uid: '123' },
      loading: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['fan']}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects staff users to /staff-dashboard when role is not allowed', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { role: 'staff', uid: '123' },
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute allowedRoles={['fan']}>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/staff-dashboard" element={<div>Staff Dashboard</div>} />
          <Route path="/fan-home" element={<div>Fan Home</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Staff Dashboard')).toBeInTheDocument();
  });

  it('redirects fan users to /fan-home when role is not allowed', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { role: 'fan', uid: '123' },
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/staff-dashboard" element={<div>Staff Dashboard</div>} />
          <Route path="/fan-home" element={<div>Fan Home</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Fan Home')).toBeInTheDocument();
  });
});
