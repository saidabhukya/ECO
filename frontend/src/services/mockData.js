// Realistic Mock Data & Storage Handler for Static Demo & GitHub Pages

const STORAGE_KEY_PREFIX = 'eco_track_mock_';

const initialMockData = {
  users: [
    {
      _id: 'usr_admin',
      email: 'admin@ecotrack.internal',
      role: 'ADMIN',
      employeeId: 'ECO-1001',
      isActive: true,
      employeeRef: 'emp_admin'
    },
    {
      _id: 'usr_hr',
      email: 'hr@ecotrack.internal',
      role: 'HR',
      employeeId: 'ECO-1002',
      isActive: true,
      employeeRef: 'emp_hr'
    },
    {
      _id: 'usr_manager',
      email: 'manager@ecotrack.internal',
      role: 'MANAGER',
      employeeId: 'ECO-1003',
      isActive: true,
      employeeRef: 'emp_manager'
    },
    {
      _id: 'usr_employee',
      email: 'alex@ecotrack.internal',
      role: 'EMPLOYEE',
      employeeId: 'ECO-1004',
      isActive: true,
      employeeRef: 'emp_alex'
    }
  ],
  departments: [
    { _id: 'dept_eng', name: 'Engineering', code: 'ENG', description: 'Core software development and IT infrastructure', budget: 450000, isActive: true },
    { _id: 'dept_hr', name: 'Human Resources', code: 'HR', description: 'People operations, talent acquisition, and compliance', budget: 180000, isActive: true },
    { _id: 'dept_fin', name: 'Finance & Payroll', code: 'FIN', description: 'Financial accounting, audits, and compensation', budget: 220000, isActive: true },
    { _id: 'dept_ops', name: 'Operations', code: 'OPS', description: 'Daily business logistics and workplace operations', budget: 310000, isActive: true },
    { _id: 'dept_qa', name: 'Quality Assurance', code: 'QA', description: 'Product verification, testing and compliance', budget: 140000, isActive: true }
  ],
  shifts: [
    { _id: 'shf_morn', name: 'General Morning Shift', startTime: '09:00', endTime: '18:00', breakDuration: 60, gracePeriod: 15, isOvernight: false, applicableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], status: 'Active' },
    { _id: 'shf_eve', name: 'Evening Shift', startTime: '14:00', endTime: '22:00', breakDuration: 45, gracePeriod: 15, isOvernight: false, applicableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], status: 'Active' }
  ],
  holidays: [
    { _id: 'hol_1', name: "New Year's Day", date: '2026-01-01', description: 'Celebration of the New Year', holidayType: 'Public' },
    { _id: 'hol_2', name: 'Memorial Day', date: '2026-05-25', description: 'National Memorial Day', holidayType: 'National' },
    { _id: 'hol_3', name: 'Independence Day', date: '2026-07-04', description: 'US Independence Day', holidayType: 'National' },
    { _id: 'hol_4', name: 'Labor Day', date: '2026-09-07', description: 'Labor Day Holiday', holidayType: 'Public' },
    { _id: 'hol_5', name: 'Thanksgiving', date: '2026-11-26', description: 'Thanksgiving Day', holidayType: 'National' },
    { _id: 'hol_6', name: 'Christmas Day', date: '2026-12-25', description: 'Christmas Celebration', holidayType: 'Public' }
  ],
  employees: [
    {
      _id: 'emp_admin',
      employeeId: 'ECO-1001',
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'admin@ecotrack.internal',
      contactNumber: '+1 (555) 010-1001',
      gender: 'Male',
      department: { _id: 'dept_ops', name: 'Operations', code: 'OPS' },
      designation: { _id: 'des_admin', title: 'Director of Technology & Operations', level: 'Director' },
      joiningDate: '2023-01-15',
      employmentType: 'Full-time',
      employmentStatus: 'Active',
      workLocation: 'San Francisco HQ',
      shift: { _id: 'shf_morn', name: 'General Morning Shift', startTime: '09:00', endTime: '18:00' },
      address: { street: '124 Market St', city: 'San Francisco', state: 'CA', postalCode: '94103', country: 'USA' },
      bankDetails: { accountHolderName: 'Marcus Vance', bankName: 'Chase Bank', accountNumber: '****6789', ifscOrRoutingCode: '121000358' },
      emergencyContact: { name: 'Elena Vance', relation: 'Spouse', phone: '+1 (555) 010-9999' },
      salary: { basicSalary: 12000, allowances: 2500, deductions: 1800, netSalary: 12700 }
    },
    {
      _id: 'emp_hr',
      employeeId: 'ECO-1002',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'hr@ecotrack.internal',
      contactNumber: '+1 (555) 010-1002',
      gender: 'Female',
      department: { _id: 'dept_hr', name: 'Human Resources', code: 'HR' },
      designation: { _id: 'des_hr', title: 'HR Operations Manager', level: 'Manager' },
      joiningDate: '2023-04-01',
      employmentType: 'Full-time',
      employmentStatus: 'Active',
      workLocation: 'San Francisco HQ',
      shift: { _id: 'shf_morn', name: 'General Morning Shift', startTime: '09:00', endTime: '18:00' },
      address: { street: '450 Montgomery St', city: 'San Francisco', state: 'CA', postalCode: '94104', country: 'USA' },
      bankDetails: { accountHolderName: 'Sarah Jenkins', bankName: 'Bank of America', accountNumber: '****4412', ifscOrRoutingCode: '121000358' },
      emergencyContact: { name: 'Mark Jenkins', relation: 'Spouse', phone: '+1 (555) 010-8888' },
      salary: { basicSalary: 8500, allowances: 1200, deductions: 1100, netSalary: 8600 }
    },
    {
      _id: 'emp_manager',
      employeeId: 'ECO-1003',
      firstName: 'David',
      lastName: 'Chen',
      email: 'manager@ecotrack.internal',
      contactNumber: '+1 (555) 010-1003',
      gender: 'Male',
      department: { _id: 'dept_eng', name: 'Engineering', code: 'ENG' },
      designation: { _id: 'des_eng_mgr', title: 'Lead Software Architect', level: 'Lead' },
      joiningDate: '2023-06-10',
      employmentType: 'Full-time',
      employmentStatus: 'Active',
      workLocation: 'San Francisco HQ',
      shift: { _id: 'shf_morn', name: 'General Morning Shift', startTime: '09:00', endTime: '18:00' },
      address: { street: '789 Mission St', city: 'San Francisco', state: 'CA', postalCode: '94103', country: 'USA' },
      bankDetails: { accountHolderName: 'David Chen', bankName: 'Wells Fargo', accountNumber: '****9981', ifscOrRoutingCode: '121000248' },
      emergencyContact: { name: 'Grace Chen', relation: 'Sister', phone: '+1 (555) 010-7777' },
      salary: { basicSalary: 10500, allowances: 2000, deductions: 1600, netSalary: 10900 }
    },
    {
      _id: 'emp_alex',
      employeeId: 'ECO-1004',
      firstName: 'Alex',
      lastName: 'Rivera',
      email: 'alex@ecotrack.internal',
      contactNumber: '+1 (555) 010-1004',
      gender: 'Non-Binary',
      department: { _id: 'dept_eng', name: 'Engineering', code: 'ENG' },
      designation: { _id: 'des_eng_sr', title: 'Senior Full Stack Engineer', level: 'Senior' },
      reportingManager: { _id: 'emp_manager', firstName: 'David', lastName: 'Chen' },
      joiningDate: '2024-02-15',
      employmentType: 'Full-time',
      employmentStatus: 'Active',
      workLocation: 'San Francisco HQ',
      shift: { _id: 'shf_morn', name: 'General Morning Shift', startTime: '09:00', endTime: '18:00' },
      address: { street: '300 Howard St', city: 'San Francisco', state: 'CA', postalCode: '94105', country: 'USA' },
      bankDetails: { accountHolderName: 'Alex Rivera', bankName: 'Chase Bank', accountNumber: '****1234', ifscOrRoutingCode: '121000358' },
      emergencyContact: { name: 'Carla Rivera', relation: 'Mother', phone: '+1 (555) 010-6666' },
      salary: { basicSalary: 7500, allowances: 1000, deductions: 950, netSalary: 7550 }
    },
    {
      _id: 'emp_priya',
      employeeId: 'ECO-1005',
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya@ecotrack.internal',
      contactNumber: '+1 (555) 010-1005',
      gender: 'Female',
      department: { _id: 'dept_fin', name: 'Finance & Payroll', code: 'FIN' },
      designation: { _id: 'des_fin_spc', title: 'Senior Financial Analyst', level: 'Senior' },
      joiningDate: '2024-05-01',
      employmentType: 'Full-time',
      employmentStatus: 'Active',
      workLocation: 'San Francisco HQ',
      shift: { _id: 'shf_morn', name: 'General Morning Shift', startTime: '09:00', endTime: '18:00' },
      address: { street: '55 4th St', city: 'San Francisco', state: 'CA', postalCode: '94103', country: 'USA' },
      bankDetails: { accountHolderName: 'Priya Sharma', bankName: 'Citibank', accountNumber: '****8823', ifscOrRoutingCode: '021000089' },
      emergencyContact: { name: 'Rohan Sharma', relation: 'Brother', phone: '+1 (555) 010-5555' },
      salary: { basicSalary: 7200, allowances: 950, deductions: 890, netSalary: 7260 }
    }
  ],
  attendance: [
    { _id: 'att_1', employee: 'emp_admin', workDate: new Date().toISOString().split('T')[0], checkInTime: '08:52', checkOutTime: '18:05', calculatedWorkingHours: 8.2, status: 'Present', lateMinutes: 0 },
    { _id: 'att_2', employee: 'emp_hr', workDate: new Date().toISOString().split('T')[0], checkInTime: '08:58', checkOutTime: '18:02', calculatedWorkingHours: 8.0, status: 'Present', lateMinutes: 0 },
    { _id: 'att_3', employee: 'emp_manager', workDate: new Date().toISOString().split('T')[0], checkInTime: '09:18', checkOutTime: null, calculatedWorkingHours: 7.5, status: 'Late', lateMinutes: 18 },
    { _id: 'att_4', employee: 'emp_alex', workDate: new Date().toISOString().split('T')[0], checkInTime: '09:02', checkOutTime: null, calculatedWorkingHours: 7.8, status: 'Present', lateMinutes: 2 },
    { _id: 'att_5', employee: 'emp_priya', workDate: new Date().toISOString().split('T')[0], checkInTime: null, checkOutTime: null, calculatedWorkingHours: 0, status: 'On Approved Leave', lateMinutes: 0 }
  ],
  leaves: [
    { _id: 'lv_1', employee: { _id: 'emp_priya', firstName: 'Priya', lastName: 'Sharma', employeeId: 'ECO-1005' }, leaveType: 'Casual Leave', startDate: '2026-10-29', endDate: '2026-10-30', numberOfDays: 2, reason: 'Family celebration', status: 'Approved' },
    { _id: 'lv_2', employee: { _id: 'emp_alex', firstName: 'Alex', lastName: 'Rivera', employeeId: 'ECO-1004' }, leaveType: 'Earned / Annual Leave', startDate: '2026-11-12', endDate: '2026-11-16', numberOfDays: 3, reason: 'Vacation travel', status: 'Pending' }
  ],
  payroll: [
    { _id: 'pr_1', month: 'October', year: 2026, employee: { _id: 'emp_admin', firstName: 'Marcus', lastName: 'Vance', employeeId: 'ECO-1001', designation: { title: 'Director' }, department: { name: 'Operations' } }, basicSalary: 12000, allowances: 2500, deductions: 1800, netSalary: 12700, paymentStatus: 'Paid', paymentDate: '2026-10-28' },
    { _id: 'pr_2', month: 'October', year: 2026, employee: { _id: 'emp_hr', firstName: 'Sarah', lastName: 'Jenkins', employeeId: 'ECO-1002', designation: { title: 'HR Manager' }, department: { name: 'Human Resources' } }, basicSalary: 8500, allowances: 1200, deductions: 1100, netSalary: 8600, paymentStatus: 'Paid', paymentDate: '2026-10-28' },
    { _id: 'pr_3', month: 'October', year: 2026, employee: { _id: 'emp_manager', firstName: 'David', lastName: 'Chen', employeeId: 'ECO-1003', designation: { title: 'Lead Architect' }, department: { name: 'Engineering' } }, basicSalary: 10500, allowances: 2000, deductions: 1600, netSalary: 10900, paymentStatus: 'Paid', paymentDate: '2026-10-28' },
    { _id: 'pr_4', month: 'October', year: 2026, employee: { _id: 'emp_alex', firstName: 'Alex', lastName: 'Rivera', employeeId: 'ECO-1004', designation: { title: 'Senior Engineer' }, department: { name: 'Engineering' } }, basicSalary: 7500, allowances: 1000, deductions: 950, netSalary: 7550, paymentStatus: 'Paid', paymentDate: '2026-10-28' },
    { _id: 'pr_5', month: 'October', year: 2026, employee: { _id: 'emp_priya', firstName: 'Priya', lastName: 'Sharma', employeeId: 'ECO-1005', designation: { title: 'Financial Analyst' }, department: { name: 'Finance' } }, basicSalary: 7200, allowances: 950, deductions: 890, netSalary: 7260, paymentStatus: 'Paid', paymentDate: '2026-10-28' }
  ],
  assets: [
    { _id: 'ast_1', assetTag: 'AST-2026-001', name: 'MacBook Pro 16" M2 Max', category: 'Laptop', serialNumber: 'C02G1234MD6R', assignedTo: { _id: 'emp_admin', firstName: 'Marcus', lastName: 'Vance' }, status: 'Assigned', purchaseCost: 3499 },
    { _id: 'ast_2', assetTag: 'AST-2026-002', name: 'ThinkPad X1 Carbon Gen 11', category: 'Laptop', serialNumber: 'PF3Z8819', assignedTo: { _id: 'emp_hr', firstName: 'Sarah', lastName: 'Jenkins' }, status: 'Assigned', purchaseCost: 1899 },
    { _id: 'ast_3', assetTag: 'AST-2026-003', name: 'Dell UltraSharp 32" 4K Monitor', category: 'Monitor', serialNumber: 'CN0887612', assignedTo: { _id: 'emp_manager', firstName: 'David', lastName: 'Chen' }, status: 'Assigned', purchaseCost: 799 },
    { _id: 'ast_4', assetTag: 'AST-2026-004', name: 'MacBook Pro 14" M3 Pro', category: 'Laptop', serialNumber: 'C02K9876QW4R', assignedTo: { _id: 'emp_alex', firstName: 'Alex', lastName: 'Rivera' }, status: 'Assigned', purchaseCost: 2399 }
  ],
  announcements: [
    { _id: 'ann_1', title: 'Q4 All-Hands Meeting & Recognition', content: 'Join us this Friday at 3:00 PM PST for the global quarterly company review and employee milestone recognitions.', priority: 'High', createdAt: '2026-10-25' },
    { _id: 'ann_2', title: 'Open Enrollment for Health Insurance Benefits', content: 'Annual benefits selection begins next Monday. Please review plans in the HR portal.', priority: 'Medium', createdAt: '2026-10-22' }
  ],
  notifications: [
    { _id: 'not_1', title: 'Leave Request Approved', message: 'Your casual leave request for Oct 29-30 has been approved.', isRead: false, createdAt: '2026-10-28' },
    { _id: 'not_2', title: 'October Payroll Released', message: 'Salary slip for October 2026 is now available for download.', isRead: true, createdAt: '2026-10-28' }
  ],
  auditLogs: [
    { _id: 'aud_1', userEmail: 'admin@ecotrack.internal', role: 'ADMIN', action: 'LOGIN', details: 'Successful sign-in to ECO TRACK portal', ipAddress: '192.168.1.100', timestamp: new Date().toISOString() },
    { _id: 'aud_2', userEmail: 'hr@ecotrack.internal', role: 'HR', action: 'LEAVE_APPROVAL', details: 'Approved leave request for Priya Sharma', ipAddress: '192.168.1.105', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { _id: 'aud_3', userEmail: 'admin@ecotrack.internal', role: 'ADMIN', action: 'PAYROLL_GENERATION', details: 'Generated payroll batch for period October 2026', ipAddress: '192.168.1.100', timestamp: new Date(Date.now() - 7200000).toISOString() }
  ],
  settings: {
    companyName: 'ECO TRACK',
    tagline: 'Track Employees. Manage Work. Drive Performance.',
    companyEmail: 'admin@ecotrack.internal',
    companyPhone: '+1 (800) 555-0199',
    companyAddress: '100 Silicon Boulevard, Suite 500, San Francisco, CA',
    currency: 'USD',
    timezone: 'UTC',
    workHoursPerDay: 8,
    gracePeriodMinutes: 15,
    allowOvertime: true
  }
};

// Retrieve stored state or fallback to default
export const getMockStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + 'data');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse mock store from localStorage, using initial');
  }
  localStorage.setItem(STORAGE_KEY_PREFIX + 'data', JSON.stringify(initialMockData));
  return initialMockData;
};

export const saveMockStore = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'data', JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save mock store', e);
  }
};

// Handler for mock requests
export const handleMockRequest = async (method, url, data) => {
  const store = getMockStore();
  const cleanUrl = url.split('?')[0];

  // Simulated latency
  await new Promise((resolve) => setTimeout(resolve, 80));

  // --- AUTH ---
  if (cleanUrl.endsWith('/auth/login') && method === 'post') {
    const email = (data?.email || '').trim().toLowerCase();
    const password = (data?.password || '').trim();

    // Support predefined credentials
    const roleMap = {
      'admin@ecotrack.internal': { role: 'ADMIN', pass: 'Admin@Eco2026', user: store.users[0] },
      'hr@ecotrack.internal': { role: 'HR', pass: 'Hr@Eco2026', user: store.users[1] },
      'manager@ecotrack.internal': { role: 'MANAGER', pass: 'Manager@Eco2026', user: store.users[2] },
      'alex@ecotrack.internal': { role: 'EMPLOYEE', pass: 'Employee@Eco2026', user: store.users[3] }
    };

    const target = roleMap[email];
    if (target && (target.pass === password || password === 'Demo@2026' || password.length > 3)) {
      const matchedEmp = store.employees.find((e) => e.email === email) || store.employees[0];
      const payloadUser = {
        ...target.user,
        employee: matchedEmp
      };
      return {
        data: {
          success: true,
          message: 'Login successful (Offline Demo Mode)',
          token: 'mock_jwt_token_' + Date.now(),
          user: payloadUser
        }
      };
    }
    // Generic fallback for any user in store
    const userFound = store.users.find((u) => u.email.toLowerCase() === email);
    if (userFound) {
      const emp = store.employees.find((e) => e.email.toLowerCase() === email) || store.employees[0];
      return {
        data: {
          success: true,
          message: 'Login successful',
          token: 'mock_jwt_token_' + Date.now(),
          user: { ...userFound, employee: emp }
        }
      };
    }
    const err = new Error('Invalid email or password');
    err.response = { status: 401, data: { success: false, message: 'Invalid email or password' } };
    throw err;
  }

  if (cleanUrl.endsWith('/auth/me') && method === 'get') {
    const currentUser = JSON.parse(localStorage.getItem('eco_track_user') || 'null') || store.users[0];
    return { data: { success: true, user: currentUser } };
  }

  if (cleanUrl.endsWith('/auth/logout') && method === 'post') {
    return { data: { success: true, message: 'Logged out successfully' } };
  }

  if (cleanUrl.endsWith('/auth/forgot-password')) {
    return { data: { success: true, message: 'Password reset link sent to registered email' } };
  }

  // --- DASHBOARD ---
  if (cleanUrl.includes('/dashboard/summary') || cleanUrl.includes('/dashboard/admin')) {
    return {
      data: {
        success: true,
        stats: {
          totalEmployees: store.employees.length,
          activeEmployees: store.employees.filter((e) => e.employmentStatus === 'Active').length,
          inactiveEmployees: store.employees.filter((e) => e.employmentStatus !== 'Active').length,
          presentToday: 4,
          absentToday: 1,
          onLeaveToday: 1,
          lateToday: 1,
          departmentCount: store.departments.length,
          monthlyPayrollTotal: store.payroll.reduce((acc, p) => acc + (p.netSalary || 0), 0),
          pendingLeavesCount: store.leaves.filter((l) => l.status === 'Pending').length,
          recentHiresCount: 2
        },
        charts: {
          departmentDistribution: store.departments.map((d) => ({
            name: d.name,
            count: store.employees.filter((e) => e.department?.name === d.name || e.department?.code === d.code).length || 1
          })),
          monthlyAttendanceTrends: [
            { month: 'Jun', present: 94, absent: 3, late: 3 },
            { month: 'Jul', present: 95, absent: 2, late: 3 },
            { month: 'Aug', present: 92, absent: 5, late: 3 },
            { month: 'Sep', present: 96, absent: 2, late: 2 },
            { month: 'Oct', present: 97, absent: 1, late: 2 }
          ],
          employeeGrowth: [
            { month: 'Jun', total: 3 },
            { month: 'Jul', total: 4 },
            { month: 'Aug', total: 4 },
            { month: 'Sep', total: 5 },
            { month: 'Oct', total: 5 }
          ]
        },
        recentActivities: store.auditLogs.slice(0, 5),
        upcomingHolidays: store.holidays.slice(0, 3)
      }
    };
  }

  // --- EMPLOYEES ---
  if (cleanUrl.endsWith('/employees') && method === 'get') {
    return {
      data: {
        success: true,
        count: store.employees.length,
        total: store.employees.length,
        totalPages: 1,
        currentPage: 1,
        employees: store.employees
      }
    };
  }

  if (cleanUrl.match(/\/employees\/[a-zA-Z0-9_-]+$/) && method === 'get') {
    const id = cleanUrl.split('/').pop();
    const emp = store.employees.find((e) => e._id === id || e.employeeId === id) || store.employees[0];
    return { data: { success: true, employee: emp } };
  }

  if (cleanUrl.endsWith('/employees') && method === 'post') {
    const newEmp = {
      _id: 'emp_' + Date.now(),
      employeeId: data.employeeId || 'ECO-' + (1000 + store.employees.length + 1),
      firstName: data.firstName || 'New',
      lastName: data.lastName || 'Employee',
      email: data.email || 'employee' + (store.employees.length + 1) + '@ecotrack.internal',
      contactNumber: data.contactNumber || '+1 (555) 010-9999',
      gender: data.gender || 'Other',
      department: store.departments.find((d) => d._id === data.department) || store.departments[0],
      designation: { title: data.designation || 'Specialist', level: 'Mid' },
      joiningDate: data.joiningDate || new Date().toISOString().split('T')[0],
      employmentType: data.employmentType || 'Full-time',
      employmentStatus: 'Active',
      workLocation: data.workLocation || 'San Francisco HQ',
      salary: { basicSalary: Number(data.basicSalary) || 6000, allowances: 800, deductions: 600, netSalary: 6200 }
    };
    store.employees.push(newEmp);
    saveMockStore(store);
    return { data: { success: true, message: 'Employee created successfully', employee: newEmp } };
  }

  if (cleanUrl.match(/\/employees\/[a-zA-Z0-9_-]+$/) && method === 'put') {
    const id = cleanUrl.split('/').pop();
    const idx = store.employees.findIndex((e) => e._id === id || e.employeeId === id);
    if (idx !== -1) {
      store.employees[idx] = { ...store.employees[idx], ...data };
      saveMockStore(store);
      return { data: { success: true, message: 'Employee updated successfully', employee: store.employees[idx] } };
    }
  }

  if (cleanUrl.match(/\/employees\/[a-zA-Z0-9_-]+$/) && method === 'delete') {
    const id = cleanUrl.split('/').pop();
    const idx = store.employees.findIndex((e) => e._id === id || e.employeeId === id);
    if (idx !== -1) {
      store.employees[idx].employmentStatus = 'Inactive';
      saveMockStore(store);
      return { data: { success: true, message: 'Employee deactivated successfully' } };
    }
  }

  // --- DEPARTMENTS ---
  if (cleanUrl.includes('/departments')) {
    if (method === 'get') {
      return { data: { success: true, count: store.departments.length, departments: store.departments } };
    }
    if (method === 'post') {
      const newDept = { _id: 'dept_' + Date.now(), ...data, isActive: true };
      store.departments.push(newDept);
      saveMockStore(store);
      return { data: { success: true, department: newDept } };
    }
  }

  // --- ATTENDANCE ---
  if (cleanUrl.includes('/attendance')) {
    if (cleanUrl.endsWith('/checkin') && method === 'post') {
      const today = new Date().toISOString().split('T')[0];
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        data: {
          success: true,
          message: 'Punched in successfully at ' + timeStr,
          attendance: { workDate: today, checkInTime: timeStr, status: 'Present' }
        }
      };
    }
    if (cleanUrl.endsWith('/checkout') && method === 'post') {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        data: {
          success: true,
          message: 'Punched out successfully at ' + timeStr,
          attendance: { checkOutTime: timeStr, calculatedWorkingHours: 8.5 }
        }
      };
    }
    return { data: { success: true, count: store.attendance.length, records: store.attendance, attendance: store.attendance } };
  }

  // --- LEAVES ---
  if (cleanUrl.includes('/leaves')) {
    if (method === 'get') {
      return {
        data: {
          success: true,
          count: store.leaves.length,
          leaves: store.leaves,
          balances: [
            { leaveType: { name: 'Casual Leave', code: 'CL' }, totalCredited: 12, used: 2, balance: 10 },
            { leaveType: { name: 'Sick Leave', code: 'SL' }, totalCredited: 10, used: 1, balance: 9 },
            { leaveType: { name: 'Annual Leave', code: 'AL' }, totalCredited: 15, used: 3, balance: 12 }
          ]
        }
      };
    }
    if (method === 'post') {
      const newLeave = {
        _id: 'lv_' + Date.now(),
        employee: store.employees[0],
        leaveType: data.leaveType || 'Casual Leave',
        startDate: data.startDate,
        endDate: data.endDate,
        numberOfDays: 1,
        reason: data.reason || 'Personal time',
        status: 'Pending'
      };
      store.leaves.unshift(newLeave);
      saveMockStore(store);
      return { data: { success: true, message: 'Leave request submitted', leave: newLeave } };
    }
    if (method === 'put') {
      return { data: { success: true, message: 'Leave status updated successfully' } };
    }
  }

  // --- PAYROLL ---
  if (cleanUrl.includes('/payroll')) {
    return { data: { success: true, count: store.payroll.length, records: store.payroll, payroll: store.payroll } };
  }

  // --- SHIFTS & HOLIDAYS ---
  if (cleanUrl.includes('/shifts')) {
    return { data: { success: true, shifts: store.shifts } };
  }
  if (cleanUrl.includes('/holidays')) {
    return { data: { success: true, holidays: store.holidays } };
  }

  // --- ASSETS ---
  if (cleanUrl.includes('/assets')) {
    if (method === 'post') {
      const newAsset = { _id: 'ast_' + Date.now(), assetTag: 'AST-' + Date.now().toString().slice(-4), ...data };
      store.assets.push(newAsset);
      saveMockStore(store);
      return { data: { success: true, asset: newAsset } };
    }
    return { data: { success: true, count: store.assets.length, assets: store.assets } };
  }

  // --- ANNOUNCEMENTS & NOTIFICATIONS ---
  if (cleanUrl.includes('/announcements')) {
    return { data: { success: true, announcements: store.announcements } };
  }
  if (cleanUrl.includes('/notifications')) {
    return { data: { success: true, notifications: store.notifications, unreadCount: 1 } };
  }

  // --- AUDIT LOGS ---
  if (cleanUrl.includes('/audit-logs') || cleanUrl.includes('/audit')) {
    return { data: { success: true, count: store.auditLogs.length, logs: store.auditLogs } };
  }

  // --- SETTINGS ---
  if (cleanUrl.includes('/settings')) {
    if (method === 'put' || method === 'post') {
      store.settings = { ...store.settings, ...data };
      saveMockStore(store);
      return { data: { success: true, message: 'Settings saved', settings: store.settings } };
    }
    return { data: { success: true, settings: store.settings } };
  }

  // Fallback generic success response
  return {
    data: {
      success: true,
      message: 'Demo action completed',
      items: [],
      records: []
    }
  };
};
