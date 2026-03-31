import React from 'react';
import type { StudentRow } from './ExcelUpload';

type CertificateProps = {
  student: StudentRow | null;
  containerRef?: React.RefObject<HTMLDivElement>;
  className?: string;
};

const Certificate: React.FC<CertificateProps> = ({ student, containerRef, className = '' }) => {
  const backgroundUrl = `${process.env.PUBLIC_URL}/certificate1.png`;

  return (
    <div
      ref={containerRef}
      className={`relative w-[1120px] h-[793px] max-w-full overflow-hidden rounded-none border border-slate-200 bg-white ${className}`}
      style={{ minWidth: 1120, minHeight: 793 }}
    >
      <img
        src={backgroundUrl}
        alt="Certificate background"
        className="absolute inset-0 h-full w-full object-cover"
        crossOrigin="anonymous"
      />

      <div className="absolute inset-0 flex items-center justify-center text-center">
        {student ? (
          <div
            className="absolute"
            style={{
              top: 345,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '840px'
            }}
          >
            <p
              className="text-[1.6rem] font-bold leading-tight text-slate-950"
              style={{
                fontFamily: "'Cormorant Upright', serif",
                letterSpacing: '0.1em'
              }}
            >
              {student.name}
            </p>
          </div>
        ) : (
          <div className="rounded-none border border-dashed border-slate-300 bg-slate-50 px-8 py-10 text-center text-slate-600">
            <p className="text-xl font-semibold">Certificate preview will appear here</p>
            <p className="mt-2 text-sm">
              Upload your Excel file and choose a student to preview the certificate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificate;
