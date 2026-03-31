import React from 'react';
import type { StudentRow } from './ExcelUpload';
import { Document, Page, pdfjs } from 'react-pdf';

// ✅ Worker setup (IMPORTANT)
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type CertificateProps = {
  student: StudentRow | null;
  containerRef?: React.RefObject<HTMLDivElement>;
  className?: string;
};

const Certificate: React.FC<CertificateProps> = ({
  student,
  containerRef,
  className = ''
}) => {

  // ✅ simple path use pannunga
  const pdfUrl = "/certificate1.pdf";

  return (
    <div
      ref={containerRef}
      className={`relative w-[1120px] h-[793px] max-w-full overflow-hidden border border-slate-200 bg-white ${className}`}
    >

      {/* ✅ PDF Background */}
      <Document
        file={pdfUrl}
        onLoadError={(error: any) => console.error("PDF load error:", error)}
      >
        <Page pageNumber={1} width={1120} />
      </Document>

      {/* ✅ Student Name Overlay */}
      {student && (
        <div
          style={{
            position: 'absolute',
            top: 395,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '840px',
            textAlign: 'center',
            pointerEvents: 'none' // click block aagatha
          }}
        >
          <p
            style={{
              fontSize: '26px',
              fontWeight: 'bold',
              color: '#0f172a',
              fontFamily: "'Cormorant Upright', serif",
              letterSpacing: '0.1em'
            }}
          >
            {student.name}
          </p>
        </div>
      )}

    </div>
  );
};

export default Certificate;