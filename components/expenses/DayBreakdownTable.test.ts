import { buildBreakdownRows } from './DayBreakdownTable';

describe('buildBreakdownRows', () => {
  it('accumulates a running balance: daily budget added, spent subtracted', () => {
    const spentByDay = new Map([
      ['2026-02-01', 20],
      ['2026-02-04', 155],
      ['2026-02-05', 10],
    ]);
    const rows = buildBreakdownRows(spentByDay, 26.79, 2, 2026);
    expect(rows.length).toBe(28);
    // Day 1: 0 + 26.79 − 20.
    expect(rows[0]).toMatchObject({ day: 1, budget: 26.79, spent: 20, left: 6.79, negative: false });
    // Days 2–3 untouched: balance keeps growing by the daily allotment.
    expect(rows[1].left).toBe(33.58);
    expect(rows[2].left).toBe(60.37);
    // Day 4 overshoot drags the balance negative: 60.37 + 26.79 − 155.
    expect(rows[3]).toMatchObject({ spent: 155, left: -67.84, negative: true });
    // Day 5 stays negative: −67.84 + 26.79 − 10.
    expect(rows[4]).toMatchObject({ left: -51.05, negative: true });
    // Recovery: each clean day adds 26.79 (−24.26, then +2.53).
    expect(rows[5]).toMatchObject({ left: -24.26, negative: true });
    expect(rows[6]).toMatchObject({ left: 2.53, negative: false });
  });

  it('stays non-negative without overshoot and flags exact zero as recovered', () => {
    const rows = buildBreakdownRows(new Map(), 100, 9, 2026);
    expect(rows.length).toBe(30);
    expect(rows[0]).toMatchObject({ left: 100, negative: false });
    expect(rows[29].left).toBe(3000);
  });
});
