import React, { lazy, Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// Mock required contexts and hooks used by AIAssistantPage
const mockT = (str) => str;
vi.mock('../utils/useTranslation', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

vi.mock('../context/AccessibilityContext', () => ({
  useAccessibility: () => ({
    language: 'English',
    setLanguage: vi.fn(),
    speakText: vi.fn(),
    stopSpeaking: vi.fn(),
  }),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { role: 'fan', uid: '123' },
  }),
}));

describe('Lazy Loaded Route rendering', () => {
  it('renders lazy loaded page after suspense resolves', async () => {
    // Resolve import dynamically in test thread first
    const AIAssistantModule = await import('../pages/AIAssistantPage');
    const LazyAIAssistantPage = lazy(() => Promise.resolve(AIAssistantModule));

    render(
      <MemoryRouter>
        <Suspense fallback={<div data-testid="fallback">Loading page...</div>}>
          <LazyAIAssistantPage />
        </Suspense>
      </MemoryRouter>
    );

    // Verify fallback is initially shown or resolves immediately in subsequent tick
    expect(screen.getByTestId('fallback')).toBeInTheDocument();

    // After resolving, the actual component contents should appear
    await waitFor(() => {
      expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/I am StadiumPulse AI, your verified assistant/i)).toBeInTheDocument();
  });
});
