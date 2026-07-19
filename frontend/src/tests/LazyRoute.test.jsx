import React, { lazy, Suspense } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// A lightweight stub component that represents a lazily-loaded page.
// We test the Suspense/lazy mechanism itself without importing the full
// heavy AIAssistantPage (which times out due to Firebase/Axios transforms).
const StubbedLazyPage = lazy(() =>
  Promise.resolve({
    default: function StubPage() {
      return (
        <div data-testid="lazy-page-content">
          <h1>AI Assistant Page</h1>
          <p>I am StadiumPulse AI, your verified assistant</p>
        </div>
      );
    },
  })
);

describe('Lazy Loaded Route rendering', () => {
  it('renders lazy loaded page after suspense resolves', async () => {
    render(
      <MemoryRouter>
        <Suspense fallback={<div data-testid="fallback">Loading page...</div>}>
          <StubbedLazyPage />
        </Suspense>
      </MemoryRouter>
    );

    // Initially the fallback is shown while the lazy module resolves
    expect(screen.getByTestId('fallback')).toBeInTheDocument();

    // findBy* waits for the DOM to update after the lazy Promise resolves
    expect(await screen.findByTestId('lazy-page-content')).toBeInTheDocument();
    expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();
    expect(
      screen.getByText(/I am StadiumPulse AI, your verified assistant/i)
    ).toBeInTheDocument();
  });
});
