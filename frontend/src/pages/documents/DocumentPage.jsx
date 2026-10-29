import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { FileText, Upload, Download, Trash2, Shield, Folder } from 'lucide-react';

export const DocumentPage = () => {
  const { role, user } = useAuth();
  const { addToast } = useNotification();

  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('Resume');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadEmployee, setUploadEmployee] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [deleteDoc, setDeleteDoc] = useState(null);

  const fetchDocs = async () => {
    try {
      setIsLoading(true);
      const [docRes, empRes] = await Promise.all([
        api.get(`/documents?category=${categoryFilter}`),
        api.get('/employees?limit=100')
      ]);
      if (docRes.data?.success) setDocuments(docRes.data.data);
      if (empRes.data?.success) setEmployees(empRes.data.data);
    } catch (e) {
      addToast('Failed to load documents', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [categoryFilter]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      addToast('Please select a file to upload', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle || uploadFile.name);
    formData.append('category', uploadCategory);
    formData.append('employeeId', uploadEmployee || user?.employeeRef || '');

    setIsUploading(true);
    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      addToast('Document safely uploaded into encrypted storage', 'success');
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      fetchDocs();
    } catch (err) {
      addToast(err.response?.data?.message || 'Upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDoc) return;
    try {
      await api.delete(`/documents/${deleteDoc._id}`);
      addToast('Document permanently removed', 'success');
      fetchDocs();
    } catch (err) {
      addToast('Failed to delete document', 'error');
    } finally {
      setDeleteDoc(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Document Repository
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Encrypted document management, identity proofs, employment agreements, and salary slips.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {['', 'Resume', 'Offer Letter', 'Appointment Letter', 'Certificate', 'Experience Letter', 'Employment Document', 'ID Proof', 'Salary Slip'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              categoryFilter === cat ? 'bg-rose-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {cat || 'All Categories'}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div
            key={doc._id}
            className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={`/api/documents/${doc._id}/download`}
                    title="Download"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  {['ADMIN', 'HR'].includes(role) && (
                    <button
                      onClick={() => setDeleteDoc(doc)}
                      title="Delete"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-3 truncate">
                {doc.title}
              </h4>
              <span className="text-[11px] font-semibold text-rose-500 block mt-0.5">
                {doc.category}
              </span>
              <p className="text-[10px] text-slate-400 mt-1">
                Owner: {doc.employee?.firstName} {doc.employee?.lastName} ({doc.employee?.employeeId})
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>Size: {(doc.fileSize / 1024).toFixed(1)} KB</span>
              <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Document"
        subtitle="Safe storage with role access control"
        maxWidth="max-w-md"
        footer={
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-sm"
          >
            {isUploading ? 'Uploading...' : 'Save Document'}
          </button>
        }
      >
        <form onSubmit={handleUpload} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Document Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master Services Agreement"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category *
            </label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="Resume">Resume</option>
              <option value="Offer Letter">Offer Letter</option>
              <option value="Appointment Letter">Appointment Letter</option>
              <option value="Certificate">Certificate</option>
              <option value="Experience Letter">Experience Letter</option>
              <option value="Employment Document">Employment Document</option>
              <option value="ID Proof">ID Proof</option>
              <option value="Salary Slip">Salary Slip</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {['ADMIN', 'HR'].includes(role) && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Owner Employee *
              </label>
              <select
                value={uploadEmployee}
                onChange={(e) => setUploadEmployee(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select File (PDF, DOCX, Images up to 10MB) *
            </label>
            <input
              type="file"
              required
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteDoc}
        onClose={() => setDeleteDoc(null)}
        onConfirm={handleDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${deleteDoc?.title}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default DocumentPage;
