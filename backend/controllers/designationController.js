const Designation = require('../models/Designation');
const Employee = require('../models/Employee');
const { logAction } = require('../middleware/auditLogger');

const getDesignations = async (req, res, next) => {
  try {
    const { department } = req.query;
    const query = {};
    if (department) query.department = department;

    const designations = await Designation.find(query)
      .populate('department', 'name code')
      .sort({ title: 1 });

    res.json({ success: true, data: designations });
  } catch (error) {
    next(error);
  }
};

const createDesignation = async (req, res, next) => {
  try {
    const designation = await Designation.create(req.body);
    await logAction({
      req,
      action: 'DESIGNATION_CREATE',
      module: 'Department',
      targetId: designation._id,
      description: `Created designation: ${designation.title}`
    });
    res.status(201).json({ success: true, data: designation });
  } catch (error) {
    next(error);
  }
};

const updateDesignation = async (req, res, next) => {
  try {
    const designation = await Designation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('department', 'name code');
    if (!designation) {
      return res.status(404).json({ success: false, message: 'Designation not found' });
    }
    res.json({ success: true, data: designation });
  } catch (error) {
    next(error);
  }
};

const deleteDesignation = async (req, res, next) => {
  try {
    const count = await Employee.countDocuments({ designation: req.params.id });
    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${count} employee(s) have this designation.`
      });
    }
    await Designation.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Designation deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation
};
