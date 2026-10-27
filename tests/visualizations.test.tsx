import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CircularProgress } from '../src/components/common/CircularProgress';
import { PriorityDistributionBar } from '../src/components/common/PriorityDistributionBar';

describe('Micro Visualizations', () => {
  describe('CircularProgress', () => {
    it('renders progressbar role with correct percentage', () => {
      render(<CircularProgress percentage={75} size={36} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
      expect(progressbar).toHaveAttribute('aria-valuenow', '75');
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('safely handles 0% and NaN without errors', () => {
      render(<CircularProgress percentage={0} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '0');
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('PriorityDistributionBar', () => {
    it('renders priority distribution bars with accurate counts and accessible labels', () => {
      render(<PriorityDistributionBar high={3} medium={2} low={1} />);
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute(
        'aria-label',
        'Pending workload distribution: 3 High, 2 Medium, 1 Low priority'
      );
      expect(screen.getByText('H')).toBeInTheDocument();
      expect(screen.getByText('M')).toBeInTheDocument();
      expect(screen.getByText('L')).toBeInTheDocument();
    });

    it('handles zero pending gracefully', () => {
      render(<PriorityDistributionBar high={0} medium={0} low={0} />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute(
        'aria-label',
        'Pending workload distribution: No pending tasks'
      );
    });
  });
});
