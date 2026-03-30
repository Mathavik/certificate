import React from 'react';
import type { StudentRow } from './ExcelUpload';

type CertificateProps = {
  student: StudentRow | null;
  containerRef?: React.RefObject<HTMLDivElement>;
  className?: string;
};

const Certificate: React.FC<CertificateProps> = ({ student, containerRef, className = '' }) => {
  const backgroundUrl = `${process.env.PUBLIC_URL}/certificate.jpeg`;

  return (
    <div
      ref={containerRef}
      className={`relative w-[1120px] h-[793px] max-w-full overflow-hidden rounded-3xl border border-slate-200 bg-white ${className}`}
      style={{ minWidth: 1120, minHeight: 793 }}
    >
      <img
        src={backgroundUrl}
        alt="Certificate background"
        className="absolute inset-0 h-full w-full object-cover"
        crossOrigin="anonymous"
      />

      <div className="absolute inset-0 flex items-center justify-start">
        <div className="mx-auto w-full max-w-[920px] px-8" style={{ position: 'relative', top: '38%' }}>
          {student ? (
            <div className="text-center">
              <p
                className="text-[3.4rem] font-semibold leading-none text-slate-950"
                style={{ fontFamily: "'Cormorant Upright', serif", letterSpacing: '0.22em' }}
              >
                {student.name}
              </p>
              <div className="mx-auto mt-6 h-px w-60 bg-slate-300"></div>
              <p
                className="mt-5 text-[1.15rem] uppercase tracking-[0.22em] text-slate-700"
                style={{ fontFamily: "'Cormorant Upright', serif" }}
              >
                {student.college}
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-8 py-10 text-center text-slate-600">
              <p className="text-xl font-semibold">Certificate preview will appear here</p>
              <p className="mt-2 text-sm">Upload your Excel file and choose a student to preview the certificate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Certificate;
