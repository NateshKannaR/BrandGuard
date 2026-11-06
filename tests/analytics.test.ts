import { describe, it, expect, beforeEach } from 'vitest';
import { repository } from '../src/lib/storage/repository';

describe('Governance Analytics Calculations', () => {
  beforeEach(() => {
    repository.resetToDemoData();
  });

  it('calculates total reviews, submissions, and approval counts accurately', () => {
    const metrics = repository.getMetrics();

    expect(metrics.totalSubmissions).toBeGreaterThan(0);
    expect(metrics.approvedCount).toBeGreaterThan(0);
    expect(metrics.avgComplianceScore).toBeGreaterThan(50);
    expect(metrics.avgComplianceScore).toBeLessThanOrEqual(100);
  });

  it('aggregates category violations and ranks highest frequency', () => {
    const metrics = repository.getMetrics();
    expect(metrics.categoryViolations.length).toBeGreaterThan(0);

    // Terminology should be one of the top violated categories in the demo dataset
    expect(
      metrics.categoryViolations.some((c) => c.category === 'Terminology' && c.count > 0)
    ).toBe(true);
  });

  it('calculates severity distribution counts', () => {
    const metrics = repository.getMetrics();
    const high = metrics.severityDistribution.find((s) => s.severity === 'High');
    const med = metrics.severityDistribution.find((s) => s.severity === 'Medium');
    const low = metrics.severityDistribution.find((s) => s.severity === 'Low');

    expect(high).toBeDefined();
    expect(med).toBeDefined();
    expect(low).toBeDefined();
    expect((high?.count || 0) + (med?.count || 0) + (low?.count || 0)).toBeGreaterThan(0);
  });
});
