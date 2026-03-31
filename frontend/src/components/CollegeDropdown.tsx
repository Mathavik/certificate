import React from 'react';

type CollegeDropdownProps = {
  colleges: string[];
  selectedCollege: string;
  onCollegeChange: (college: string) => void;
};

const CollegeDropdown: React.FC<CollegeDropdownProps> = ({ colleges, selectedCollege, onCollegeChange }) => {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">College filter</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Select college</h2>
      </div>

      <div className="mt-5">
        <label className="text-sm font-medium text-slate-700" htmlFor="college-select">
          Choose a college to preview certificates
        </label>
        <select
          id="college-select"
          value={selectedCollege}
          onChange={(event) => onCollegeChange(event.target.value)}
          className="mt-3 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        >
          <option value="">Select College</option>
          {colleges.map((college) => (
            <option key={college} value={college}>
              {college}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
};

export default CollegeDropdown;
