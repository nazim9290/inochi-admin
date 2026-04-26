import { useState } from 'react';

const labelClass = 'block text-xs font-semibold text-brand-navy mb-1';
const fieldClass = 'w-full px-2.5 py-1.5 text-sm border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40';

const FIELDS = [
  ['recipientName', 'Student name'],
  ['sl', 'SL'],
  ['birth', 'Date of birth'],
  ['grade', 'Grade'],
  ['fatherName', "Father's name"],
  ['motherName', "Mother's name"],
  ['courseName', 'Course name'],
  ['completionDate', 'Completion date'],
  ['referanceof', 'Reference'],
  ['studentId', 'Student ID'],
  ['startDate', 'Start date'],
  ['endDate', 'End date'],
  ['levelOfLanguageLearning', 'Level of language learning'],
  ['referenceBook', 'Total hours'],
  ['totalNumberOfClasses', 'Total number of classes'],
  ['totalNumberOfClassesPerDay', 'Classes per day'],
  ['totalDurationOfClassPerWeek', 'Class duration per week'],
  ['classTime', 'Class time'],
  ['applicantAttendanceRate', 'Attendance rate'],
  ['classTestParticipationRate', 'Class test participation rate'],
  ['listening', 'Listening'],
  ['speaking', 'Speaking'],
  ['reading', 'Reading'],
  ['writing', 'Writing'],
];

const initial = Object.fromEntries(FIELDS.map(([k]) => [k, '']));

const CertificateForm = ({ onGenerate }) => {
  const [formData, setFormData] = useState(initial);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-brand-tealLight/40 p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-extrabold text-brand-navy text-center mb-4">Certificate Details</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {FIELDS.map(([name, label]) => (
          <div key={name}>
            <label htmlFor={name} className={labelClass}>{label}</label>
            <input
              id={name}
              type="text"
              name={name}
              value={formData[name]}
              onChange={handleChange}
              className={fieldClass}
            />
          </div>
        ))}
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={() => onGenerate(formData)}
          className="bg-brand-teal hover:bg-brand-navy text-white font-semibold px-6 py-2 rounded transition-colors"
        >
          Generate Certificate
        </button>
      </div>
    </div>
  );
};

export default CertificateForm;
