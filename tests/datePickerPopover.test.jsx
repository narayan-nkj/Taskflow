import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DatePickerPopover } from '../src/components/common/DatePickerPopover';
import { formatLocalYmd } from '../src/utils/dates';

describe('DatePickerPopover Component', () => {
  it('renders default placeholder when value is empty', () => {
    render(<DatePickerPopover value="" onChange={vi.fn()} />);
    expect(screen.getByText('Select due date...')).toBeInTheDocument();
  });

  it('renders formatted display date when value is provided', () => {
    render(<DatePickerPopover value="2026-10-27" onChange={vi.fn()} />);
    expect(screen.getByText(/Oct 27|Today/)).toBeInTheDocument();
  });

  it('opens custom calendar popover on click and allows month navigation', () => {
    render(<DatePickerPopover value="2026-10-15" onChange={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: /due date picker/i });

    // Open popover
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: /calendar date picker/i })).toBeInTheDocument();
    expect(screen.getByText(/October 2026/i)).toBeInTheDocument();

    // Navigate to next month
    const nextBtn = screen.getByRole('button', { name: /next month/i });
    fireEvent.click(nextBtn);
    expect(screen.getByText(/November 2026/i)).toBeInTheDocument();

    // Navigate to previous month
    const prevBtn = screen.getByRole('button', { name: /previous month/i });
    fireEvent.click(prevBtn);
    expect(screen.getByText(/October 2026/i)).toBeInTheDocument();
  });

  it('calls onChange with selected date when a date cell is clicked', () => {
    const onChange = vi.fn();
    render(<DatePickerPopover value="2026-10-15" onChange={onChange} />);

    const trigger = screen.getByRole('button', { name: /due date picker/i });
    fireEvent.click(trigger);

    // Click on 20th of the month
    const cellBtn = screen.getByRole('button', { name: '2026-10-20' });
    fireEvent.click(cellBtn);

    expect(onChange).toHaveBeenCalledWith('2026-10-20');
  });

  it('allows setting Today via quick action button', () => {
    const onChange = vi.fn();
    render(<DatePickerPopover value="" onChange={onChange} />);

    const trigger = screen.getByRole('button', { name: /due date picker/i });
    fireEvent.click(trigger);

    const todayBtn = screen.getByRole('button', { name: 'Today' });
    fireEvent.click(todayBtn);

    const expectedToday = formatLocalYmd(new Date());
    expect(onChange).toHaveBeenCalledWith(expectedToday);
  });

  it('clears date when clear button is clicked', () => {
    const onChange = vi.fn();
    render(<DatePickerPopover value="2026-10-25" onChange={onChange} />);

    // Clear button on trigger
    const clearBtn = screen.getByRole('button', { name: 'Clear due date' });
    fireEvent.click(clearBtn);

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('allows setting Yesterday via quick action button for past-date scheduling', () => {
    const onChange = vi.fn();
    render(<DatePickerPopover value="" onChange={onChange} />);

    const trigger = screen.getByRole('button', { name: /due date picker/i });
    fireEvent.click(trigger);

    const yesterdayBtn = screen.getByRole('button', { name: 'Yesterday' });
    fireEvent.click(yesterdayBtn);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const expectedYesterday = formatLocalYmd(yesterday);
    expect(onChange).toHaveBeenCalledWith(expectedYesterday);
  });

  it('allows selecting past dates and ensures they are not disabled', () => {
    const onChange = vi.fn();
    render(<DatePickerPopover value="2026-10-15" onChange={onChange} />);

    const trigger = screen.getByRole('button', { name: /due date picker/i });
    fireEvent.click(trigger);

    // Day 5 in October 2026 (a past date relative to Oct 15)
    const pastCellBtn = screen.getByRole('button', { name: '2026-10-05' });
    expect(pastCellBtn).not.toBeDisabled();

    fireEvent.click(pastCellBtn);
    expect(onChange).toHaveBeenCalledWith('2026-10-05');
  });

  it('allows navigating to previous year and selecting historical date', () => {
    const onChange = vi.fn();
    render(<DatePickerPopover value="2026-01-15" onChange={onChange} />);

    const trigger = screen.getByRole('button', { name: /due date picker/i });
    fireEvent.click(trigger);

    // Navigating back from Jan 2026 goes to Dec 2025
    const prevBtn = screen.getByRole('button', { name: /previous month/i });
    fireEvent.click(prevBtn);

    expect(screen.getByText(/December 2025/i)).toBeInTheDocument();

    const decDate = screen.getByRole('button', { name: '2025-12-25' });
    expect(decDate).not.toBeDisabled();
    fireEvent.click(decDate);

    expect(onChange).toHaveBeenCalledWith('2025-12-25');
  });
});
