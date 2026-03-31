import React from 'react';
import type { StudentRow } from './ExcelUpload';
import Certificate from './Certificate';

type CertificatePreviewProps = {
  student: StudentRow | null;
  previewRef: React.RefObject<HTMLDivElement>;
  selectedCollege: string;
  selectedCount: number;
};

const CertificatePreview: React.FC<CertificatePreviewProps> = ({ student, previewRef, selectedCollege, selectedCount }) => {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Certificate preview</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Preview current certificate</h2>
          <p className="mt-2 text-sm text-slate-600">
            {selectedCollege
              ? `Showing ${selectedCount} certificate${selectedCount === 1 ? '' : 's'} for ${selectedCollege}`
              : 'Select a college to preview its student certificates.'}
          </p>
        </div>
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
          {selectedCollege || 'No college selected'}
        </div>
      </div>

      <div className="flex justify-center overflow-x-auto">
        <Certificate student={student} containerRef={previewRef} />
      </div>
    </section>
  );
};

export default CertificatePreview;
