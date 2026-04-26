import { useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';

const labelClass = 'block text-sm font-semibold text-brand-navy mb-1';
const fieldClass = 'w-full px-3 py-2 border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40';

const Documen = () => {
  const [name, setName] = useState('');
  const [studentNid, setStudentNid] = useState('');
  const [branch, setBranch] = useState('');
  const [markSheetSSC, setMarkSheetSSC] = useState(null);
  const [markSheetHSC, setMarkSheetHSC] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const api = axiosInterceptor();

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !studentNid.trim() || !branch.trim()) {
      setMessage({ kind: 'error', text: 'Name, NID and branch are required.' });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('studentNid', studentNid);
      formData.append('branch', branch);
      if (markSheetSSC) formData.append('markSheetSSC', markSheetSSC);
      if (markSheetHSC) formData.append('markSheetHSC', markSheetHSC);

      await api.post('/uploadDocumentstudent', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage({ kind: 'ok', text: 'Documents uploaded successfully.' });
      setName('');
      setStudentNid('');
      setBranch('');
      setMarkSheetSSC(null);
      setMarkSheetHSC(null);
    } catch (err) {
      console.error('Error:', err);
      setMessage({ kind: 'error', text: 'Failed to upload documents.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-brand-tealLight/40 p-6 sm:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold text-brand-navy text-center mb-6">Upload Student Documents</h1>

      {message && (
        <p className={`text-sm rounded px-3 py-2 mb-4 ${
          message.kind === 'ok'
            ? 'bg-brand-tealLight/30 text-brand-navy border border-brand-teal/40'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </p>
      )}

      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <label className={labelClass}>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter student name" className={fieldClass} required />
        </div>
        <div>
          <label className={labelClass}>Student NID</label>
          <input type="text" value={studentNid} onChange={(e) => setStudentNid(e.target.value)} placeholder="Enter NID" className={fieldClass} required />
        </div>
        <div>
          <label className={labelClass}>Branch</label>
          <input type="text" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="Branch name" className={fieldClass} required />
        </div>
        <div>
          <label className={labelClass}>Mark Sheet — SSC</label>
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setMarkSheetSSC(e.target.files[0])}
            className="block w-full text-sm text-brand-slate file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-brand-tealLight/30 file:text-brand-navy file:font-semibold hover:file:bg-brand-tealLight/50"
          />
        </div>
        <div>
          <label className={labelClass}>Mark Sheet — HSC</label>
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setMarkSheetHSC(e.target.files[0])}
            className="block w-full text-sm text-brand-slate file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-brand-tealLight/30 file:text-brand-navy file:font-semibold hover:file:bg-brand-tealLight/50"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-brand-teal hover:bg-brand-navy text-white font-semibold px-6 py-2 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Uploading…' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default Documen;
