const test = require('node:test');
const assert = require('node:assert');

test('Payroll Service - Salary Calculation Logic', () => {
  const basicSalary = 5000;
  const hra = 1500;
  const allowances = 500 + 400 + 300; // 1200
  const overtimePay = 300;
  const bonus = 1000;

  const grossEarnings = basicSalary + hra + allowances + overtimePay + bonus;
  assert.strictEqual(grossEarnings, 9000);

  const pf = 500;
  const tax = 600;
  const insurance = 150;
  const totalDeductions = pf + tax + insurance;
  assert.strictEqual(totalDeductions, 1250);

  const netPay = grossEarnings - totalDeductions;
  assert.strictEqual(netPay, 7750);
});

test('Leave Service - Date Overlap Check Algorithm', () => {
  const existingStart = new Date('2026-11-10');
  const existingEnd = new Date('2026-11-15');

  // Overlapping requested range
  const reqStart = new Date('2026-11-12');
  const reqEnd = new Date('2026-11-18');

  const isOverlapping = (reqStart <= existingEnd && reqEnd >= existingStart);
  assert.strictEqual(isOverlapping, true);

  // Non-overlapping range
  const nonOverlapStart = new Date('2026-11-16');
  const nonOverlapEnd = new Date('2026-11-20');
  const isNonOverlapping = (nonOverlapStart <= existingEnd && nonOverlapEnd >= existingStart);
  assert.strictEqual(isNonOverlapping, false);
});
