import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  SkeletonLine,
  AlertsSkeleton,
  FoodCardsSkeleton,
  VenueStatusSkeleton,
  AIAssistantSkeleton,
  ReportsSkeleton
} from '../components/Skeleton';

describe('Skeleton Components', () => {
  it('renders SkeletonLine correctly', () => {
    const { container } = render(<SkeletonLine className="test-class" />);
    expect(container.firstChild).toHaveClass('animate-pulse');
    expect(container.firstChild).toHaveClass('test-class');
  });

  it('renders AlertsSkeleton with accessible skeleton container', () => {
    render(<AlertsSkeleton />);
    expect(screen.getByTestId('alerts-skeleton')).toBeInTheDocument();
  });

  it('renders FoodCardsSkeleton with accessible skeleton container', () => {
    render(<FoodCardsSkeleton />);
    expect(screen.getByTestId('food-cards-skeleton')).toBeInTheDocument();
  });

  it('renders VenueStatusSkeleton with accessible skeleton container', () => {
    render(<VenueStatusSkeleton />);
    expect(screen.getByTestId('venue-status-skeleton')).toBeInTheDocument();
  });

  it('renders AIAssistantSkeleton with accessible skeleton container', () => {
    render(<AIAssistantSkeleton />);
    expect(screen.getByTestId('ai-assistant-skeleton')).toBeInTheDocument();
  });

  it('renders ReportsSkeleton with accessible skeleton container', () => {
    render(<ReportsSkeleton />);
    expect(screen.getByTestId('reports-skeleton')).toBeInTheDocument();
  });
});
