import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { getCategoryConfig } from '../src/utils/categoryIcons';
import { CategoryIcon } from '../src/components/common/CategoryIcon';

describe('categoryIcons utility', () => {
  it('returns distinct configurations for GDG, Academics, and Personal', () => {
    const gdg = getCategoryConfig('GDG');
    const academics = getCategoryConfig('Academics');
    const personal = getCategoryConfig('Personal');

    expect(gdg.label).toBe('GDG');
    expect(gdg.colorClass).toContain('brand');

    expect(academics.label).toBe('Academics');
    expect(academics.colorClass).toContain('sky');

    expect(personal.label).toBe('Personal');
    expect(personal.colorClass).toContain('emerald');

    expect(gdg.icon).not.toBe(academics.icon);
    expect(gdg.icon).not.toBe(personal.icon);
    expect(academics.icon).not.toBe(personal.icon);
  });

  it('supports extended categories (Work, Creative, Health, Finance, Shopping)', () => {
    const work = getCategoryConfig('Work');
    const creative = getCategoryConfig('Creative');
    const health = getCategoryConfig('Health');
    const finance = getCategoryConfig('Finance');
    const shopping = getCategoryConfig('Shopping');

    expect(work.label).toBe('Work');
    expect(creative.label).toBe('Creative');
    expect(health.label).toBe('Health');
    expect(finance.label).toBe('Finance');
    expect(shopping.label).toBe('Shopping');
  });

  it('provides a stable fallback icon for unrecognized or missing category', () => {
    const fallbackNull = getCategoryConfig(null);
    const fallbackEmpty = getCategoryConfig('');
    const fallbackUnknown = getCategoryConfig('RandomUnknown');

    expect(fallbackNull.icon).toBeDefined();
    expect(fallbackEmpty.icon).toBeDefined();
    expect(fallbackUnknown.icon).toBeDefined();
    expect(fallbackUnknown.label).toBe('RandomUnknown');
  });

  it('renders CategoryIcon component with aria-hidden attribute', () => {
    const { container } = render(<CategoryIcon category="Academics" className="w-5 h-5" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });
});
