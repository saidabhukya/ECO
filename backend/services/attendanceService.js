const Shift = require('../models/Shift');

/**
 * Parses "HH:mm" time string into minutes from midnight
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

/**
 * Calculates late minutes, early departure, working hours and overtime
 */
const calculateAttendanceMetrics = ({ checkIn, checkOut, shift, breakDurationMinutes = 0 }) => {
  if (!checkIn || !shift) {
    return {
      workingHours: 0,
      lateMinutes: 0,
      earlyDepartureMinutes: 0,
      overtimeMinutes: 0
    };
  }

  const checkInDate = new Date(checkIn);
  const checkInMinutes = checkInDate.getHours() * 60 + checkInDate.getMinutes();

  const shiftStartMinutes = timeToMinutes(shift.startTime);
  const shiftEndMinutes = timeToMinutes(shift.endTime);
  const graceMinutes = shift.gracePeriod || 15;

  // Calculate late arrival
  let lateMinutes = 0;
  if (checkInMinutes > (shiftStartMinutes + graceMinutes)) {
    lateMinutes = checkInMinutes - shiftStartMinutes;
  }

  let workingHours = 0;
  let earlyDepartureMinutes = 0;
  let overtimeMinutes = 0;

  if (checkOut) {
    const checkOutDate = new Date(checkOut);
    const durationMs = checkOutDate.getTime() - checkInDate.getTime();
    const durationMinutes = Math.max(0, Math.floor(durationMs / (1000 * 60)));

    const effectiveMinutes = Math.max(0, durationMinutes - (breakDurationMinutes || shift.breakDuration || 0));
    workingHours = Number((effectiveMinutes / 60).toFixed(2));

    const checkOutMinutes = checkOutDate.getHours() * 60 + checkOutDate.getMinutes();

    // Check early departure
    if (!shift.isOvernight && checkOutMinutes < shiftEndMinutes) {
      earlyDepartureMinutes = shiftEndMinutes - checkOutMinutes;
    }

    // Expected standard shift duration
    let expectedShiftMinutes = shiftEndMinutes - shiftStartMinutes;
    if (shift.isOvernight && expectedShiftMinutes < 0) {
      expectedShiftMinutes += 24 * 60;
    }
    const expectedWorkMinutes = Math.max(0, expectedShiftMinutes - (shift.breakDuration || 0));

    if (effectiveMinutes > expectedWorkMinutes) {
      overtimeMinutes = effectiveMinutes - expectedWorkMinutes;
    }
  }

  return {
    workingHours,
    lateMinutes,
    earlyDepartureMinutes,
    overtimeMinutes
  };
};

module.exports = {
  timeToMinutes,
  calculateAttendanceMetrics
};
