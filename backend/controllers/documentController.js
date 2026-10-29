const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const Employee = require('../models/Employee');
const { logAction } = require('../middleware/auditLogger');

/**
 * @desc    Upload document
 * @route   POST /api/documents/upload
 * @access  Private
 */
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a file to upload' });
    }

    const { title, category, employeeId, accessRole, description } = req.body;

    const targetEmpId = employeeId || req.userEmployee?._id;
    if (!targetEmpId) {
      return res.status(400).json({ success: false, message: 'Employee reference is required' });
    }

    const document = await Document.create({
      title: title || req.file.originalname,
      category: category || 'Other',
      employee: targetEmpId,
      uploadedBy: req.user._id,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      accessRole: accessRole || 'EMPLOYEE_AND_HR',
      description
    });

    await logAction({
      req,
      action: 'DOCUMENT_UPLOAD',
      module: 'Document',
      targetId: document._id,
      description: `Uploaded document "${document.title}" (${document.category})`
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get documents with filters
 * @route   GET /api/documents
 * @access  Private
 */
const getDocuments = async (req, res, next) => {
  try {
    const { employeeId, category } = req.query;
    const query = {};

    if (category) query.category = category;

    if (req.user.role === 'EMPLOYEE') {
      query.employee = req.userEmployee?._id;
      query.accessRole = { $ne: 'ADMIN_ONLY' };
    } else if (employeeId) {
      query.employee = employeeId;
    }

    const documents = await Document.find(query)
      .populate('employee', 'firstName lastName employeeId department')
      .populate('uploadedBy', 'email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authorized document download
 * @route   GET /api/documents/:id/download
 * @access  Private (Owner or privileged)
 */
const downloadDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Role access check
    const isOwner = req.userEmployee?._id?.toString() === doc.employee.toString();
    const isPrivileged = ['ADMIN', 'HR'].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ success: false, message: 'Access denied: You do not have permission to download this document.' });
    }

    if (!fs.existsSync(doc.filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on storage server.' });
    }

    await logAction({
      req,
      action: 'DOCUMENT_DOWNLOAD',
      module: 'Document',
      targetId: doc._id,
      description: `Downloaded document: ${doc.title}`
    });

    res.download(doc.filePath, doc.originalName);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete document
 * @route   DELETE /api/documents/:id
 * @access  Private (ADMIN, HR, or Owner)
 */
const deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    const isOwner = req.userEmployee?._id?.toString() === doc.employee.toString();
    const isPrivileged = ['ADMIN', 'HR'].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this document' });
    }

    // Remove file from disk
    if (fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath);
    }

    await Document.findByIdAndDelete(req.params.id);

    await logAction({
      req,
      action: 'DOCUMENT_DELETE',
      module: 'Document',
      targetId: req.params.id,
      description: `Deleted document: ${doc.title}`
    });

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  downloadDocument,
  deleteDocument
};
