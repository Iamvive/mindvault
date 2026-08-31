import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateTotalYearsExperience } from '../../src/core/linkedin-auditor.js';

describe('LinkedIn Experience Timeline & YoE Calculator', () => {
  it('should calculate total years from multiple experience date intervals', () => {
    const experiences = [
      { role: 'Staff Backend Engineer', company: 'Razorpay', dateRange: 'Jun 2021 - Present · 3 yrs 3 mos' },
      { role: 'Senior Software Engineer', company: 'InMobi', dateRange: 'Jan 2018 - May 2021 · 3 yrs 5 mos' }
    ];
    const yoe = calculateTotalYearsExperience(experiences);
    assert.ok(yoe >= 6.5, `Expected >= 6.5 years, got ${yoe}`);
  });

  it('should fallback gracefully when date intervals are formatted differently', () => {
    const experiences = [
      { role: 'Software Engineer', company: 'Startup A', dateRange: '2020 - 2022 · 2 yrs' },
      { role: 'Junior Dev', company: 'Startup B', dateRange: '2019 - 2020 · 1 yr' }
    ];
    const yoe = calculateTotalYearsExperience(experiences);
    assert.equal(yoe, 3.0);
  });
});
