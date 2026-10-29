const test = require('node:test');
const assert = require('node:assert');
const { timeToMinutes, calculateAttendanceMetrics } = require('../services/attendanceService');

test('Attendance Service - timeToMinutes', () => {
  assert.strictEqual(timeToMinutes('09:00'), 540);
  assert.strictEqual(timeToMinutes('18:30'), 1110);
  assert.strictEqual(timeToMinutes('00:00'), 0);
  assert.strictEqual(timeToMinutes(''), 0);
});

test('Attendance Service - On-time Check In within Grace Period', () => {
  const shift = {
    startTime: '09:00',
    endTime: '18:00',
    gracePeriod: 15,
    breakDuration: 60,
    isOvernight: false
  };

  // Check in at 09:10 (within 15 min grace period)
  const checkIn = new Date('2026-10-30T09:10:00');
  const checkOut = new Date('2026-10-30T18:10:00');

  const metrics = calculateAttendanceMetrics({ checkIn, checkOut, shift });

  assert.strictEqual(metrics.lateMinutes, 0, 'Should not be marked late within grace period');
  assert.strictEqual(metrics.earlyDepartureMinutes, 0, 'Check out at 18:10 is not early');
  // 9 hours total - 1 hour break = 8 hours
  assert.strictEqual(metrics.workingHours, 8);
});

test('Attendance Service - Late Arrival Detection', () => {
  const shift = {
    startTime: '09:00',
    endTime: '18:00',
    gracePeriod: 15,
    breakDuration: 60,
    isOvernight: false
  };

  // Check in at 09:35 (35 mins after start time, exceeding 15 min grace)
  const checkIn = new Date('2026-10-30T09:35:00');
  const metrics = calculateAttendanceMetrics({ checkIn, shift });

  assert.strictEqual(metrics.lateMinutes, 35, 'Should calculate exact late minutes from start time');
});

test('Attendance Service - Early Departure & Overtime Calculation', () => {
  const shift = {
    startTime: '09:00',
    endTime: '18:00',
    gracePeriod: 15,
    breakDuration: 60,
    isOvernight: false
  };

  // Checked out early at 17:00 (1 hour early)
  const checkIn = new Date('2026-10-30T09:00:00');
  const earlyCheckOut = new Date('2026-10-30T17:00:00');
  const earlyMetrics = calculateAttendanceMetrics({ checkIn, checkOut: earlyCheckOut, shift });

  assert.strictEqual(earlyMetrics.earlyDepartureMinutes, 60);

  // Worked overtime: checked out at 20:00 (2 hours overtime)
  const lateCheckOut = new Date('2026-10-30T20:00:00');
  const overtimeMetrics = calculateAttendanceMetrics({ checkIn, checkOut: lateCheckOut, shift });

  assert.strictEqual(overtimeMetrics.earlyDepartureMinutes, 0);
  assert.strictEqual(overtimeMetrics.overtimeMinutes, 120);
});
