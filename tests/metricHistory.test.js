import { describe, it, expect, beforeEach } from 'vitest';
import { loadMetricHistory, recordMetricSnapshot } from '../src/utils/metricHistory';

describe('metricHistory utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const sampleStats = {
    total: 5,
    completed: 2,
    pending: 3,
    inProgress: 0,
    completionRate: 40,
    completionRateFormatted: '40%',
  };

  it('loads empty history when nothing is stored', () => {
    const history = loadMetricHistory();
    expect(history).toEqual([]);
  });

  it('records an initial snapshot', () => {
    const history = recordMetricSnapshot(sampleStats, '2026-10-27');
    expect(history).toHaveLength(1);
    expect(history[0].total).toBe(5);
    expect(history[0].completed).toBe(2);
    expect(history[0].pending).toBe(3);
    expect(history[0].date).toBe('2026-10-27');
  });

  it('updates today snapshot if counts change on the same date', () => {
    recordMetricSnapshot(sampleStats, '2026-10-27');
    const updatedStats = {
      ...sampleStats,
      completed: 3,
      pending: 2,
    };
    const history = recordMetricSnapshot(updatedStats, '2026-10-27');
    expect(history).toHaveLength(1);
    expect(history[0].completed).toBe(3);
    expect(history[0].pending).toBe(2);
  });

  it('appends snapshots across different dates', () => {
    recordMetricSnapshot(sampleStats, '2026-10-26');
    const nextDayStats = {
      ...sampleStats,
      total: 6,
      pending: 4,
    };
    const history = recordMetricSnapshot(nextDayStats, '2026-10-27');
    expect(history).toHaveLength(2);
    expect(history[0].date).toBe('2026-10-26');
    expect(history[1].date).toBe('2026-10-27');
    expect(history[1].total).toBe(6);
  });

  it('safely recovers from corrupted localStorage data', () => {
    localStorage.setItem('taskflow_metrics_history_v1', 'not valid json{{{{');
    const history = loadMetricHistory();
    expect(history).toEqual([]);
  });

  it('defensively filters out malformed snapshot entries', () => {
    localStorage.setItem(
      'taskflow_metrics_history_v1',
      JSON.stringify([
        { date: '2026-10-20', total: 5 }, // missing timestamp, completed, pending
        null,
        'string',
        { timestamp: 123, date: '2026-10-21', total: 4, completed: 2, pending: 2 },
      ])
    );
    const history = loadMetricHistory();
    expect(history).toHaveLength(1);
    expect(history[0].date).toBe('2026-10-21');
  });

  it('bounds retention window to maximum 14 snapshots', () => {
    for (let i = 1; i <= 20; i++) {
      const dayStr = i < 10 ? `2026-10-0${i}` : `2026-10-${i}`;
      recordMetricSnapshot(
        {
          ...sampleStats,
          total: i,
        },
        dayStr
      );
    }
    const history = loadMetricHistory();
    expect(history.length).toBeLessThanOrEqual(14);
    expect(history[history.length - 1].total).toBe(20);
  });
});
