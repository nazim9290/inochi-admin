import { useState } from 'react';
import BranchA from '../components/BranchA';
import BranchB from '../components/BranchB';

const tabClass = (active) =>
  `px-5 py-2 rounded font-semibold transition-colors ${
    active
      ? 'bg-brand-teal text-white'
      : 'bg-white text-brand-navy border border-brand-tealLight/60 hover:bg-brand-tealLight/20'
  }`;

const Account = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  return (
    <div>
      <h1 className="text-center text-2xl font-extrabold text-brand-navy mb-6">Account</h1>
      <div className="flex justify-center gap-3 mb-8">
        <button
          type="button"
          onClick={() => setSelectedOption('paid')}
          className={tabClass(selectedOption === 'paid')}
        >
          Branch A
        </button>
        <button
          type="button"
          onClick={() => setSelectedOption('free')}
          className={tabClass(selectedOption === 'free')}
        >
          Branch B
        </button>
      </div>

      {selectedOption === 'paid' && <BranchA />}
      {selectedOption === 'free' && <BranchB />}
    </div>
  );
};

export default Account;
