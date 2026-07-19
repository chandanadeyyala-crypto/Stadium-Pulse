import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import AccessibilityPage from '../pages/AccessibilityPage';

describe('Accessibility Center and Context', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('renders accessibility controls and displays default values', () => {
    render(
      <AccessibilityProvider>
        <MemoryRouter>
          <AccessibilityPage />
        </MemoryRouter>
      </AccessibilityProvider>
    );

    // Verify page header is rendered
    expect(screen.getByRole('heading', { name: /Accessibility Center/i })).toBeInTheDocument();

    // Verify switches are in the document
    const highContrastSwitch = screen.getByRole('switch', { name: /High Contrast Mode/i });
    expect(highContrastSwitch).toHaveAttribute('aria-checked', 'false');

    const voiceSwitch = screen.getByRole('switch', { name: /Voice Assistance/i });
    expect(voiceSwitch).toHaveAttribute('aria-checked', 'false');
  });

  it('toggles high contrast mode and updates documentElement and localStorage', () => {
    render(
      <AccessibilityProvider>
        <MemoryRouter>
          <AccessibilityPage />
        </MemoryRouter>
      </AccessibilityProvider>
    );

    const highContrastSwitch = screen.getByRole('switch', { name: /High Contrast Mode/i });
    expect(document.documentElement.classList.contains('high-contrast')).toBe(false);

    // Toggle high contrast on
    fireEvent.click(highContrastSwitch);
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    expect(localStorage.getItem('accessibility_high_contrast')).toBe('true');

    // Toggle high contrast off
    fireEvent.click(highContrastSwitch);
    expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
    expect(localStorage.getItem('accessibility_high_contrast')).toBe('false');
  });

  it('changes text font size and updates documentElement and localStorage', () => {
    render(
      <AccessibilityProvider>
        <MemoryRouter>
          <AccessibilityPage />
        </MemoryRouter>
      </AccessibilityProvider>
    );

    const largeBtn = screen.getByRole('button', { name: /Large \(115%\)/i });
    const extraBtn = screen.getByRole('button', { name: /Extra \(130%\)/i });
    const normalBtn = screen.getByRole('button', { name: /Normal \(100%\)/i });

    // Click Large
    fireEvent.click(largeBtn);
    expect(document.documentElement.classList.contains('large-text')).toBe(true);
    expect(localStorage.getItem('accessibility_text_scale')).toBe('large');

    // Click Extra
    fireEvent.click(extraBtn);
    expect(document.documentElement.classList.contains('large-text-extra')).toBe(true);
    expect(document.documentElement.classList.contains('large-text')).toBe(false);
    expect(localStorage.getItem('accessibility_text_scale')).toBe('extra');

    // Click Normal
    fireEvent.click(normalBtn);
    expect(document.documentElement.classList.contains('large-text')).toBe(false);
    expect(document.documentElement.classList.contains('large-text-extra')).toBe(false);
    expect(localStorage.getItem('accessibility_text_scale')).toBe('normal');
  });

  it('toggles speech voice assistance', () => {
    render(
      <AccessibilityProvider>
        <MemoryRouter>
          <AccessibilityPage />
        </MemoryRouter>
      </AccessibilityProvider>
    );

    const voiceSwitch = screen.getByRole('switch', { name: /Voice Assistance/i });
    expect(voiceSwitch).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(voiceSwitch);
    expect(voiceSwitch).toHaveAttribute('aria-checked', 'true');
    expect(localStorage.getItem('accessibility_speech_enabled')).toBe('true');
  });
});
