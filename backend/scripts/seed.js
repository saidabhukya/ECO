const mongoose = require('mongoose');
require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');

const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Designation = require('../models/Designation');
const Shift = require('../models/Shift');
const Holiday = require('../models/Holiday');
const LeaveType = require('../models/LeaveType');
const LeaveBalance = require('../models/LeaveBalance');
const LeaveRequest = require('../models/LeaveRequest');
const Attendance = require('../models/Attendance');
const SalaryStructure = require('../models/SalaryStructure');
const PayrollRecord = require('../models/PayrollRecord');
const Goal = require('../models/Goal');
const PerformanceReview = require('../models/PerformanceReview');
const Asset = require('../models/Asset');
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const Setting = require('../models/Setting');
const AuditLog = require('../models/AuditLog');

const seedData = async (isStandalone = true) => {
  try {
    if (isStandalone) {
      await connectDB();
    }
    console.log('[Seed] Seeding demo data for ECO TRACK...');

    // Clear existing collections safely
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Department.deleteMany({});
    await Designation.deleteMany({});
    await Shift.deleteMany({});
    await Holiday.deleteMany({});
    await LeaveType.deleteMany({});
    await LeaveBalance.deleteMany({});
    await LeaveRequest.deleteMany({});
    await Attendance.deleteMany({});
    await SalaryStructure.deleteMany({});
    await PayrollRecord.deleteMany({});
    await Goal.deleteMany({});
    await PerformanceReview.deleteMany({});
    await Asset.deleteMany({});
    await Announcement.deleteMany({});
    await Notification.deleteMany({});
    await Setting.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('[Seed] Cleared existing records.');

    // 1. Settings
    const setting = await Setting.create({
      key: 'global',
      companyName: 'ECO TRACK',
      tagline: 'Track Employees. Manage Work. Drive Performance.',
      companyEmail: 'admin@ecotrack.internal',
      companyPhone: '+1 (800) 555-0199',
      companyAddress: '100 Silicon Boulevard, Suite 500, San Francisco, CA',
      currency: 'USD',
      timezone: 'UTC',
      workHoursPerDay: 8,
      gracePeriodMinutes: 15,
      allowOvertime: true,
      theme: {
        primaryColor: '#DC2626',
        darkModeDefault: false
      }
    });

    // 2. Shifts
    const morningShift = await Shift.create({
      name: 'General Morning Shift',
      startTime: '09:00',
      endTime: '18:00',
      breakDuration: 60,
      gracePeriod: 15,
      applicableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      isOvernight: false
    });

    const eveningShift = await Shift.create({
      name: 'Evening Shift',
      startTime: '14:00',
      endTime: '22:00',
      breakDuration: 45,
      gracePeriod: 15,
      applicableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      isOvernight: false
    });

    // 3. Holidays
    const currentYear = new Date().getFullYear();
    await Holiday.create([
      { name: "New Year's Day", date: new Date(currentYear, 0, 1), description: 'Celebration of the New Year', holidayType: 'Public' },
      { name: 'Memorial Day', date: new Date(currentYear, 4, 25), description: 'National Memorial Day', holidayType: 'National' },
      { name: 'Independence Day', date: new Date(currentYear, 6, 4), description: 'US Independence Day', holidayType: 'National' },
      { name: 'Labor Day', date: new Date(currentYear, 8, 7), description: 'Celebration of the American Labor Movement', holidayType: 'Public' },
      { name: 'Thanksgiving', date: new Date(currentYear, 10, 26), description: 'National Thanksgiving Holiday', holidayType: 'National' },
      { name: 'Christmas Day', date: new Date(currentYear, 11, 25), description: 'Christmas Day Celebration', holidayType: 'Public' }
    ]);

    // 4. Leave Types
    const casualLeave = await LeaveType.create({
      name: 'Casual Leave',
      code: 'CL',
      description: 'Paid casual personal time off',
      daysPerYear: 12,
      isPaid: true,
      color: '#3B82F6'
    });

    const sickLeave = await LeaveType.create({
      name: 'Sick Leave',
      code: 'SL',
      description: 'Medical and health recovery leave',
      daysPerYear: 10,
      isPaid: true,
      requiresProof: true,
      color: '#EF4444'
    });

    const paidLeave = await LeaveType.create({
      name: 'Earned / Annual Leave',
      code: 'AL',
      description: 'Accrued annual vacation leave',
      daysPerYear: 15,
      isPaid: true,
      color: '#10B981'
    });

    const emergencyLeave = await LeaveType.create({
      name: 'Emergency Leave',
      code: 'EL',
      description: 'Urgent family or unforeseen emergencies',
      daysPerYear: 5,
      isPaid: true,
      color: '#F59E0B'
    });

    // 5. Departments
    const engineeringDept = await Department.create({
      name: 'Engineering',
      code: 'ENG',
      description: 'Software development, cloud architecture, and infrastructure'
    });

    const hrDept = await Department.create({
      name: 'Human Resources',
      code: 'HR',
      description: 'Talent acquisition, employee welfare, and people operations'
    });

    const financeDept = await Department.create({
      name: 'Finance & Accounts',
      code: 'FIN',
      description: 'Payroll management, auditing, and corporate budgeting'
    });

    const operationsDept = await Department.create({
      name: 'Operations',
      code: 'OPS',
      description: 'Business process optimization and facilities'
    });

    // 6. Designations
    const desLeadEngineer = await Designation.create({
      title: 'Principal Software Engineer',
      department: engineeringDept._id,
      level: 'Lead'
    });

    const desSeniorEngineer = await Designation.create({
      title: 'Senior Full-Stack Engineer',
      department: engineeringDept._id,
      level: 'Senior'
    });

    const desHrManager = await Designation.create({
      title: 'Human Resources Director',
      department: hrDept._id,
      level: 'Manager'
    });

    const desHrSpecialist = await Designation.create({
      title: 'HR People Partner',
      department: hrDept._id,
      level: 'Mid'
    });

    const desFinanceHead = await Designation.create({
      title: 'Finance & Payroll Specialist',
      department: financeDept._id,
      level: 'Lead'
    });

    // 7. Create Core Users & Employees
    // ADMIN
    const adminUser = await User.create({
      email: 'admin@ecotrack.internal',
      password: 'Admin@Eco2026',
      role: 'ADMIN',
      employeeId: 'ECO-1001',
      isActive: true
    });

    const adminEmployee = await Employee.create({
      employeeId: 'ECO-1001',
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'admin@ecotrack.internal',
      contactNumber: '+1 (555) 010-1001',
      gender: 'Male',
      department: operationsDept._id,
      designation: desLeadEngineer._id,
      joiningDate: new Date(2023, 0, 15),
      employmentType: 'Full-time',
      employmentStatus: 'Active',
      workLocation: 'San Francisco HQ',
      shift: morningShift._id,
      user: adminUser._id,
      address: { street: '124 Market St', city: 'San Francisco', state: 'CA', postalCode: '94103', country: 'USA' },
      bankDetails: { accountHolderName: 'Marcus Vance', bankName: 'Chase Bank', accountNumber: '****6789', ifscOrRoutingCode: '121000358' }
    });

    adminUser.employeeRef = adminEmployee._id;
    await adminUser.save();

    // HR
    const hrUser = await User.create({
      email: 'hr@ecotrack.internal',
      password: 'Hr@Eco2026',
      role: 'HR',
      employeeId: 'ECO-1002',
      isActive: true
    });

    const hrEmployee = await Employee.create({
      employeeId: 'ECO-1002',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'hr@ecotrack.internal',
      contactNumber: '+1 (555) 010-1002',
      gender: 'Female',
      department: hrDept._id,
      designation: desHrManager._id,
      reportingManager: adminEmployee._id,
      joiningDate: new Date(2023, 3, 1),
      employmentType: 'Full-time',
      employmentStatus: 'Active',
      workLocation: 'San Francisco HQ',
      shift: morningShift._id,
      user: hrUser._id,
      address: { street: '450 Montgomery St', city: 'San Francisco', state: 'CA', postalCode: '94104', country: 'USA' },
      bankDetails: { accountHolderName: 'Sarah Jenkins', bankName: 'Bank of America', accountNumber: '****4412', ifscOrRoutingCode: '121000358' }
    });

    hrUser.employeeRef = hrEmployee._id;
    await hrUser.save();
    hrDept.headOfDepartment = hrEmployee._id;
    await hrDept.save();

    // MANAGER
    const managerUser = await User.create({
      email: 'manager@ecotrack.internal',
      password: 'Manager@Eco2026',
      role: 'MANAGER',
      employeeId: 'ECO-1003',
      isActive: true
    });

    const managerEmployee = await Employee.create({
      employeeId: 'ECO-1003',
      firstName: 'David',
      lastName: 'Chen',
      email: 'manager@ecotrack.internal',
      contactNumber: '+1 (555) 010-1003',
      gender: 'Male',
      department: engineeringDept._id,
      designation: desLeadEngineer._id,
      reportingManager: adminEmployee._id,
      joiningDate: new Date(2023, 5, 10),
      employmentType: 'Full-time',
      employmentStatus: 'Active',
      workLocation: 'San Francisco HQ',
      shift: morningShift._id,
      user: managerUser._id,
      address: { street: '789 Mission St', city: 'San Francisco', state: 'CA', postalCode: '94103', country: 'USA' },
      bankDetails: { accountHolderName: 'David Chen', bankName: 'Wells Fargo', accountNumber: '****9981', ifscOrRoutingCode: '121000248' }
    });

    managerUser.employeeRef = managerEmployee._id;
    await managerUser.save();
    engineeringDept.headOfDepartment = managerEmployee._id;
    await engineeringDept.save();

    // EMPLOYEE (Alex Rivera)
    const employeeUser = await User.create({
      email: 'alex@ecotrack.internal',
      password: 'Employee@Eco2026',
      role: 'EMPLOYEE',
      employeeId: 'ECO-1004',
      isActive: true
    });

    const alexEmployee = await Employee.create({
      employeeId: 'ECO-1004',
      firstName: 'Alex',
      lastName: 'Rivera',
      email: 'alex@ecotrack.internal',
      contactNumber: '+1 (555) 010-1004',
      gender: 'Non-Binary',
      department: engineeringDept._id,
      designation: desSeniorEngineer._id,
      reportingManager: managerEmployee._id,
      joiningDate: new Date(2024, 1, 15),
      employmentType: 'Full-time',
      employmentStatus: 'Active',
      workLocation: 'San Francisco HQ',
      shift: morningShift._id,
      user: employeeUser._id,
      address: { street: '300 Howard St', city: 'San Francisco', state: 'CA', postalCode: '94105', country: 'USA' },
      bankDetails: { accountHolderName: 'Alex Rivera', bankName: 'Chase Bank', accountNumber: '****1234', ifscOrRoutingCode: '121000358' }
    });

    employeeUser.employeeRef = alexEmployee._id;
    await employeeUser.save();

    // Employee 5: Priya Sharma (Finance)
    const priyaUser = await User.create({
      email: 'priya@ecotrack.internal',
      password: 'Employee@Eco2026',
      role: 'EMPLOYEE',
      employeeId: 'ECO-1005',
      isActive: true
    });

    const priyaEmployee = await Employee.create({
      employeeId: 'ECO-1005',
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya@ecotrack.internal',
      contactNumber: '+1 (555) 010-1005',
      gender: 'Female',
      department: financeDept._id,
      designation: desFinanceHead._id,
      reportingManager: adminEmployee._id,
      joiningDate: new Date(2024, 2, 20),
      employmentType: 'Full-time',
      employmentStatus: 'Active',
      workLocation: 'San Francisco HQ',
      shift: morningShift._id,
      user: priyaUser._id,
      address: { street: '55 4th St', city: 'San Francisco', state: 'CA', postalCode: '94103', country: 'USA' }
    });

    priyaUser.employeeRef = priyaEmployee._id;
    await priyaUser.save();
    financeDept.headOfDepartment = priyaEmployee._id;
    await financeDept.save();

    const allEmployees = [adminEmployee, hrEmployee, managerEmployee, alexEmployee, priyaEmployee];

    // 8. Leave Balances for all employees
    const allLeaveTypes = [casualLeave, sickLeave, paidLeave, emergencyLeave];
    for (const emp of allEmployees) {
      for (const lt of allLeaveTypes) {
        await LeaveBalance.create({
          employee: emp._id,
          leaveType: lt._id,
          year: currentYear,
          allocated: lt.daysPerYear,
          used: emp.employeeId === 'ECO-1004' ? 2 : 0,
          pending: 0,
          history: [{
            action: 'ALLOCATED',
            days: lt.daysPerYear,
            reason: 'Annual allocation',
            date: new Date(currentYear, 0, 1)
          }]
        });
      }
    }

    // 9. Leave Requests
    await LeaveRequest.create([
      {
        employee: alexEmployee._id,
        leaveType: paidLeave._id,
        startDate: new Date(currentYear, 9, 10),
        endDate: new Date(currentYear, 9, 11),
        days: 2,
        reason: 'Personal family trip',
        status: 'Approved',
        approvalWorkflow: {
          managerApproval: { status: 'Approved', approvedBy: managerUser._id, approvedAt: new Date(currentYear, 9, 8) },
          hrApproval: { status: 'Approved', approvedBy: hrUser._id, approvedAt: new Date(currentYear, 9, 9) }
        }
      },
      {
        employee: priyaEmployee._id,
        leaveType: casualLeave._id,
        startDate: new Date(currentYear, 10, 5),
        endDate: new Date(currentYear, 10, 6),
        days: 2,
        reason: 'Attending financial summit conference',
        status: 'Pending'
      }
    ]);

    // 10. Attendance Records for past 7 days & Today
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      for (const emp of allEmployees) {
        const isLate = (i === 1 && emp.employeeId === 'ECO-1004'); // Alex was late yesterday
        const checkIn = new Date(d);
        checkIn.setHours(isLate ? 9 : 8, isLate ? 35 : 55, 0);

        const checkOut = new Date(d);
        checkOut.setHours(18, 5, 0);

        await Attendance.create({
          employee: emp._id,
          workDate: dateStr,
          shift: morningShift._id,
          checkIn,
          checkOut: i === 0 ? undefined : checkOut, // Today check-in open
          workingHours: i === 0 ? 0 : 8.2,
          lateMinutes: isLate ? 20 : 0,
          status: isLate ? 'Late' : 'Present'
        });
      }
    }

    // 11. Salary Structures
    const alexSalaryStructure = await SalaryStructure.create({
      name: 'Senior Engineer Standard Structure',
      employee: alexEmployee._id,
      basicSalary: 6500,
      hra: 2200,
      conveyanceAllowance: 500,
      medicalAllowance: 400,
      specialAllowance: 600,
      providentFund: 650,
      taxDeduction: 750,
      insuranceDeduction: 200,
      currency: 'USD'
    });
    alexEmployee.salaryStructure = alexSalaryStructure._id;
    await alexEmployee.save();

    for (const emp of [adminEmployee, hrEmployee, managerEmployee, priyaEmployee]) {
      const struct = await SalaryStructure.create({
        name: `${emp.fullName} Structure`,
        employee: emp._id,
        basicSalary: 7000,
        hra: 2400,
        conveyanceAllowance: 600,
        medicalAllowance: 500,
        specialAllowance: 700,
        providentFund: 700,
        taxDeduction: 800,
        insuranceDeduction: 250,
        currency: 'USD'
      });
      emp.salaryStructure = struct._id;
      await emp.save();
    }

    // 12. Payroll Records
    const lastMonth = today.getMonth() === 0 ? 12 : today.getMonth();
    const lastMonthYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
    const payPeriod = `${lastMonthYear}-${String(lastMonth).padStart(2, '0')}`;

    for (const emp of allEmployees) {
      await PayrollRecord.create({
        employee: emp._id,
        month: lastMonth,
        year: lastMonthYear,
        payPeriod,
        earnings: {
          basicSalary: 6500,
          hra: 2200,
          conveyanceAllowance: 500,
          medicalAllowance: 400,
          specialAllowance: 600,
          overtimePay: 150,
          bonus: 500,
          otherEarnings: 0
        },
        deductions: {
          providentFund: 650,
          taxDeduction: 750,
          insuranceDeduction: 200,
          unpaidLeaveDeductions: 0,
          otherDeductions: 0
        },
        attendanceSummary: {
          totalCalendarDays: 30,
          workingDays: 22,
          presentDays: 22,
          paidLeaveDays: 0,
          unpaidLeaveDays: 0,
          overtimeHours: 4
        },
        grossEarnings: 10350,
        totalDeductions: 1600,
        netPay: 8750,
        currency: 'USD',
        status: 'Finalized',
        paymentStatus: 'Paid',
        paymentDate: new Date(lastMonthYear, lastMonth, 1),
        paymentMethod: 'Direct Deposit',
        generatedBy: adminUser._id,
        approvedBy: hrUser._id,
        finalizedBy: adminUser._id
      });
    }

    // 13. Goals and Performance Reviews
    await Goal.create([
      {
        employee: alexEmployee._id,
        assignedBy: managerUser._id,
        title: 'Migrate REST APIs to Microservices Architecture',
        description: 'Refactor high-throughput core endpoints and optimize database queries for low latency.',
        targetMetric: 'Achieve sub-50ms p95 latency on auth and payroll routes',
        deadline: new Date(currentYear, 11, 15),
        progress: 75,
        status: 'In Progress',
        comments: [{ author: managerUser._id, comment: 'Great job completing phase 1 early!', date: new Date() }]
      },
      {
        employee: alexEmployee._id,
        assignedBy: managerUser._id,
        title: 'Complete AWS Certified Solutions Architect',
        description: 'Complete the professional certification training course and pass the exam.',
        targetMetric: 'Pass examination score >= 800',
        deadline: new Date(currentYear, 10, 30),
        progress: 40,
        status: 'In Progress'
      }
    ]);

    await PerformanceReview.create({
      employee: alexEmployee._id,
      reviewer: managerUser._id,
      reviewPeriod: 'Mid-Year 2026',
      year: currentYear,
      ratings: {
        productivity: 5,
        technicalSkills: 5,
        communication: 4,
        teamwork: 5,
        qualityOfWork: 5,
        leadership: 4
      },
      strengths: 'Exceptional problem solving, clean and secure coding, reliable team contributor.',
      areasForImprovement: 'Take on more cross-department technical presentations and mentoring.',
      reviewerFeedback: 'Alex consistently exceeds engineering expectations.',
      status: 'Submitted'
    });

    // 14. Assets
    await Asset.create([
      {
        assetId: 'AST-101',
        name: 'Apple MacBook Pro 16" M3 Max',
        category: 'Laptop',
        serialNumber: 'MBP-2024-99812',
        purchaseDate: new Date(2024, 0, 10),
        purchaseCost: 3499,
        status: 'Assigned',
        assignedEmployee: alexEmployee._id,
        assignedDate: new Date(2024, 1, 15),
        notes: 'Includes 140W USB-C power brick and sleeve'
      },
      {
        assetId: 'AST-102',
        name: 'Dell UltraSharp 32" 4K USB-C Hub Monitor',
        category: 'Peripherals',
        serialNumber: 'DEL-U3223QE-551',
        purchaseDate: new Date(2024, 0, 15),
        purchaseCost: 899,
        status: 'Assigned',
        assignedEmployee: alexEmployee._id,
        assignedDate: new Date(2024, 1, 15)
      },
      {
        assetId: 'AST-103',
        name: 'Lenovo ThinkPad X1 Carbon Gen 11',
        category: 'Laptop',
        serialNumber: 'LEN-X1C-88741',
        purchaseDate: new Date(2024, 2, 5),
        purchaseCost: 1999,
        status: 'Available',
        notes: 'In stock at IT room rack 3'
      },
      {
        assetId: 'AST-104',
        name: 'Smart Access RFID Keycard',
        category: 'Access Card',
        serialNumber: 'RFID-KEY-00441',
        purchaseDate: new Date(2023, 0, 1),
        purchaseCost: 25,
        status: 'Assigned',
        assignedEmployee: hrEmployee._id,
        assignedDate: new Date(2023, 3, 1)
      }
    ]);

    // 15. Announcements
    await Announcement.create([
      {
        title: 'Welcome to ECO TRACK 2026 Platform',
        content: 'We are thrilled to roll out our centralized ECO TRACK Employee Management System. Please verify your profile and contact information.',
        priority: 'Important',
        targetAudience: 'All',
        publishedBy: hrUser._id
      },
      {
        title: 'Upcoming Annual Health & Wellness Week',
        content: 'Complimentary health checkups and wellness webinars will take place next month. Book your slots with People Operations.',
        priority: 'Normal',
        targetAudience: 'All',
        publishedBy: hrUser._id
      }
    ]);

    // 16. Audit Logs
    await AuditLog.create([
      {
        actor: { userId: adminUser._id, email: adminUser.email, role: 'ADMIN' },
        action: 'SYSTEM_BOOTSTRAP',
        module: 'Settings',
        description: 'ECO TRACK system initialized with production security configurations.'
      },
      {
        actor: { userId: hrUser._id, email: hrUser.email, role: 'HR' },
        action: 'EMPLOYEE_CREATE',
        module: 'Employee',
        targetId: alexEmployee._id.toString(),
        description: 'Onboarded Senior Full-Stack Engineer Alex Rivera.'
      },
      {
        actor: { userId: adminUser._id, email: adminUser.email, role: 'ADMIN' },
        action: 'PAYROLL_FINALIZE',
        module: 'Payroll',
        description: `Finalized and locked monthly payroll for pay period ${payPeriod}.`
      }
    ]);

    console.log('=======================================================');
    console.log('✅ ECO TRACK Database Seeding Completed Successfully!');
    console.log('-------------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('👑 ADMIN:    admin@ecotrack.internal    / Admin@Eco2026');
    console.log('👥 HR:       hr@ecotrack.internal       / Hr@Eco2026');
    console.log('👔 MANAGER:  manager@ecotrack.internal  / Manager@Eco2026');
    console.log('💻 EMPLOYEE: alex@ecotrack.internal     / Employee@Eco2026');
    console.log('=======================================================');

    if (isStandalone) {
      await disconnectDB();
      process.exit(0);
    }
    return true;
  } catch (err) {
    console.error('[Seed Error]', err);
    if (isStandalone) {
      process.exit(1);
    }
    throw err;
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = { seedData };
