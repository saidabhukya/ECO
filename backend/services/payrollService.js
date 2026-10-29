const Employee = require('../models/Employee');
const SalaryStructure = require('../models/SalaryStructure');
const Attendance = require('../models/Attendance');
const PayrollRecord = require('../models/PayrollRecord');

/**
 * Calculates payroll for a single employee for a specific month and year
 */
const calculateEmployeePayroll = async (employeeId, month, year, generatedByUserId) => {
  const employee = await Employee.findById(employeeId).populate('department designation shift');
  if (!employee) {
    throw new Error('Employee not found');
  }

  // Find assigned salary structure, or fallback to default based on designation or standard
  let salaryStructure = await SalaryStructure.findOne({ employee: employeeId, isActive: true });
  if (!salaryStructure) {
    // Generate standard default salary structure if not configured
    salaryStructure = {
      basicSalary: 4500,
      hra: 1500,
      conveyanceAllowance: 400,
      medicalAllowance: 300,
      specialAllowance: 300,
      providentFund: 450,
      taxDeduction: 350,
      insuranceDeduction: 150,
      currency: 'USD'
    };
  }

  const payPeriod = `${year}-${String(month).padStart(2, '0')}`;

  // Query attendance for this employee in this month
  const startDateStr = `${payPeriod}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDateStr = `${payPeriod}-${String(lastDay).padStart(2, '0')}`;

  const attendances = await Attendance.find({
    employee: employeeId,
    workDate: { $gte: startDateStr, $lte: endDateStr }
  });

  const presentDays = attendances.filter(a => ['Present', 'Late'].includes(a.status)).length;
  const halfDays = attendances.filter(a => a.status === 'Half Day').length;
  const effectivePresentDays = presentDays + (halfDays * 0.5);

  const paidLeaveDays = attendances.filter(a => a.status === 'On Approved Leave').length;
  const totalOvertimeMinutes = attendances.reduce((acc, curr) => acc + (curr.overtimeMinutes || 0), 0);
  const overtimeHours = Number((totalOvertimeMinutes / 60).toFixed(2));

  // Overtime rate: 1.5x hourly rate (assuming 160 standard working hours/month)
  const hourlyRate = (salaryStructure.basicSalary || 4000) / 160;
  const overtimePay = Number((overtimeHours * hourlyRate * 1.5).toFixed(2));

  const earnings = {
    basicSalary: salaryStructure.basicSalary || 0,
    hra: salaryStructure.hra || 0,
    conveyanceAllowance: salaryStructure.conveyanceAllowance || 0,
    medicalAllowance: salaryStructure.medicalAllowance || 0,
    specialAllowance: salaryStructure.specialAllowance || 0,
    overtimePay: overtimePay,
    bonus: 0,
    otherEarnings: 0
  };

  const grossEarnings = Number(
    (
      earnings.basicSalary +
      earnings.hra +
      earnings.conveyanceAllowance +
      earnings.medicalAllowance +
      earnings.specialAllowance +
      earnings.overtimePay +
      earnings.bonus +
      earnings.otherEarnings
    ).toFixed(2)
  );

  const deductions = {
    providentFund: salaryStructure.providentFund || 0,
    taxDeduction: salaryStructure.taxDeduction || 0,
    insuranceDeduction: salaryStructure.insuranceDeduction || 0,
    unpaidLeaveDeductions: 0,
    otherDeductions: 0
  };

  const totalDeductions = Number(
    (
      deductions.providentFund +
      deductions.taxDeduction +
      deductions.insuranceDeduction +
      deductions.unpaidLeaveDeductions +
      deductions.otherDeductions
    ).toFixed(2)
  );

  const netPay = Math.max(0, Number((grossEarnings - totalDeductions).toFixed(2)));

  const attendanceSummary = {
    totalCalendarDays: lastDay,
    workingDays: 22,
    presentDays: effectivePresentDays,
    paidLeaveDays: paidLeaveDays,
    unpaidLeaveDays: 0,
    overtimeHours: overtimeHours
  };

  // Upsert payroll record if draft exists, or create new
  let record = await PayrollRecord.findOne({ employee: employeeId, payPeriod });
  if (record && record.status === 'Finalized') {
    throw new Error(`Payroll for period ${payPeriod} is already finalized and locked.`);
  }

  if (record) {
    record.earnings = earnings;
    record.deductions = deductions;
    record.attendanceSummary = attendanceSummary;
    record.grossEarnings = grossEarnings;
    record.totalDeductions = totalDeductions;
    record.netPay = netPay;
    record.currency = salaryStructure.currency || 'USD';
    await record.save();
  } else {
    record = await PayrollRecord.create({
      employee: employeeId,
      month,
      year,
      payPeriod,
      earnings,
      deductions,
      attendanceSummary,
      grossEarnings,
      totalDeductions,
      netPay,
      currency: salaryStructure.currency || 'USD',
      status: 'Draft',
      generatedBy: generatedByUserId
    });
  }

  return record;
};

module.exports = {
  calculateEmployeePayroll
};
