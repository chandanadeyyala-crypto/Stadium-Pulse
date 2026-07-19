import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FoodDrinksPage from '../pages/FoodDrinksPage';
import * as api from '../utils/api';

vi.mock('../utils/api', () => ({
  getFacilities: vi.fn(),
}));

const stableT = (str) => str;
vi.mock('../utils/useTranslation', () => ({
  useTranslation: () => ({
    t: stableT,
  }),
}));

vi.mock('../context/AccessibilityContext', () => ({
  useAccessibility: () => ({
    highContrast: false,
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      state: {},
    }),
  };
});

const mockFacilities = [
  {
    id: 'Food1',
    name: 'Burger Joint',
    category: 'Meals',
    description: 'Juicy beef burgers and fries.',
    zone: 'East Stand',
    dietary: ['Halal'],
    status: 'open',
    isAccessible: true,
    accessibility: 'wheelchair accessible',
  },
  {
    id: 'Food2',
    name: 'Vegan Salad Bar',
    category: 'Vegan',
    description: 'Fresh organic greens.',
    zone: 'West Concourse',
    dietary: ['Vegan', 'Vegetarian'],
    status: 'closed',
    isAccessible: false,
    accessibility: 'none',
  }
];

describe('FoodDrinksPage options, search and filter capabilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading skeleton while fetching facilities', () => {
    vi.mocked(api.getFacilities).mockReturnValue(new Promise(() => {})); // pending promise
    render(
      <MemoryRouter>
        <FoodDrinksPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('food-cards-skeleton')).toBeInTheDocument();
  });

  it('displays error state and retries fetching when retry is clicked', async () => {
    let shouldFail = true;
    vi.mocked(api.getFacilities).mockImplementation(() => {
      if (shouldFail) {
        return Promise.reject(new Error('Network failure'));
      }
      return Promise.resolve({ data: mockFacilities });
    });

    render(
      <MemoryRouter>
        <FoodDrinksPage />
      </MemoryRouter>
    );

    // Wait for the error message
    const errorMsg = await screen.findByText(/Failed to load menu options/i);
    expect(errorMsg).toBeInTheDocument();

    shouldFail = false;

    // Click retry
    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    await act(async () => {
      fireEvent.click(retryBtn);
    });

    // Verify it loads cards
    expect(await screen.findByText('Burger Joint')).toBeInTheDocument();
    expect(screen.getByText('Vegan Salad Bar')).toBeInTheDocument();
  });

  it('filters by search input text', async () => {
    vi.mocked(api.getFacilities).mockResolvedValue({ data: mockFacilities });

    render(
      <MemoryRouter>
        <FoodDrinksPage />
      </MemoryRouter>
    );

    // Wait for load
    expect(await screen.findByText('Burger Joint')).toBeInTheDocument();
    expect(screen.getByText('Vegan Salad Bar')).toBeInTheDocument();

    const searchInput = screen.getByLabelText(/Search food and drink options/i);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'vegan' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Vegan Salad Bar')).toBeInTheDocument();
      expect(screen.queryByText('Burger Joint')).not.toBeInTheDocument();
    });
  });

  it('filters by category selection button', async () => {
    vi.mocked(api.getFacilities).mockResolvedValue({ data: mockFacilities });

    render(
      <MemoryRouter>
        <FoodDrinksPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Burger Joint')).toBeInTheDocument();

    const categoryBtn = screen.getByRole('button', { name: 'Meals' });
    await act(async () => {
      fireEvent.click(categoryBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Burger Joint')).toBeInTheDocument();
      expect(screen.queryByText('Vegan Salad Bar')).not.toBeInTheDocument();
    });
  });

  it('filters by dietary preferences', async () => {
    vi.mocked(api.getFacilities).mockResolvedValue({ data: mockFacilities });

    render(
      <MemoryRouter>
        <FoodDrinksPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Burger Joint')).toBeInTheDocument();

    // The first one is the category button, the second is the dietary checkbox
    const halalBtn = screen.getAllByRole('button', { name: 'Halal' })[1];
    await act(async () => {
      fireEvent.click(halalBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Burger Joint')).toBeInTheDocument();
      expect(screen.queryByText('Vegan Salad Bar')).not.toBeInTheDocument();
    });
  });

  it('filters by accessibility preference button', async () => {
    vi.mocked(api.getFacilities).mockResolvedValue({ data: mockFacilities });

    render(
      <MemoryRouter>
        <FoodDrinksPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Burger Joint')).toBeInTheDocument();

    const accessibleBtn = screen.getByRole('button', { name: /Accessible Only/i });
    await act(async () => {
      fireEvent.click(accessibleBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Burger Joint')).toBeInTheDocument();
      expect(screen.queryByText('Vegan Salad Bar')).not.toBeInTheDocument();
    });
  });

  it('filters by open status button', async () => {
    vi.mocked(api.getFacilities).mockResolvedValue({ data: mockFacilities });

    render(
      <MemoryRouter>
        <FoodDrinksPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Burger Joint')).toBeInTheDocument();

    const openNowBtn = screen.getByRole('button', { name: /Open Now/i });
    await act(async () => {
      fireEvent.click(openNowBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Burger Joint')).toBeInTheDocument();
      expect(screen.queryByText('Vegan Salad Bar')).not.toBeInTheDocument();
    });
  });
});
