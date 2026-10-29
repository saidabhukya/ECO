const readline = require('readline');
const mongoose = require('mongoose');
require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

const createAdmin = async () => {
  try {
    await connectDB();
    console.log('====================================================');
    console.log('🛡️  ECO TRACK — Secure Initial Administrator Setup');
    console.log('====================================================');

    const email = (await question('Enter Admin Email (e.g. admin@yourdomain.com): ')).trim().toLowerCase();
    if (!email || !email.includes('@')) {
      console.error('Invalid email address.');
      process.exit(1);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error(`User with email "${email}" already exists.`);
      process.exit(1);
    }

    const password = await question('Enter Admin Password (min 8 chars, mixed case, numbers): ');
    if (!password || password.length < 8) {
      console.error('Password must be at least 8 characters long.');
      process.exit(1);
    }

    const firstName = (await question('Admin First Name: ')).trim() || 'System';
    const lastName = (await question('Admin Last Name: ')).trim() || 'Administrator';
    const employeeId = (await question('Admin Employee ID (e.g. ECO-0001): ')).trim().toUpperCase() || 'ECO-0001';

    let dept = await Department.findOne({ code: 'ADMIN' });
    if (!dept) {
      dept = await Department.create({
        name: 'Executive Administration',
        code: 'ADMIN',
        description: 'Executive management and administration'
      });
    }

    const adminUser = await User.create({
      email,
      password,
      role: 'ADMIN',
      employeeId,
      isActive: true
    });

    const adminEmp = await Employee.create({
      employeeId,
      firstName,
      lastName,
      email,
      contactNumber: '+1 (000) 000-0000',
      department: dept._id,
      joiningDate: new Date(),
      employmentType: 'Full-time',
      employmentStatus: 'Active',
      workLocation: 'Headquarters',
      user: adminUser._id
    });

    adminUser.employeeRef = adminEmp._id;
    await adminUser.save();

    console.log('----------------------------------------------------');
    console.log(`✅ Administrator "${email}" successfully created!`);
    console.log(`Employee ID: ${employeeId}`);
    console.log('You can now log in securely via the ECO TRACK portal.');
    console.log('====================================================');

    rl.close();
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('Failed to create admin:', error.message);
    rl.close();
    process.exit(1);
  }
};

createAdmin();
