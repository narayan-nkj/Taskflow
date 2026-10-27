import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Sparkline } from '../src/components/common/Sparkline';

describe('Sparkline Component', () => {
  it('renders flat baseline when data has 0 or 1 point without crashing or inventing fake variation', () => {
    const { container, rerender } = render(<Sparkline data={[]} />);
    expect(container.querySelector('line')).toBeInTheDocument();
    expect(container.querySelector('circle')).toBeInTheDocument();

    rerender(<Sparkline data={[5]} color="#eb642e" />);
    expect(container.querySelector('line')).toBeInTheDocument();
    expect(container.querySelector('text')?.textContent).toBe('5');
  });

  it('renders polyline and area path when multiple data points are supplied', () => {
    const { container } = render(<Sparkline data={[2, 4, 3, 7, 5]} color="#10b981" />);
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThanOrEqual(2); // area fill and stroke path
    expect(container.querySelector('circle')).toBeInTheDocument();
  });
});
