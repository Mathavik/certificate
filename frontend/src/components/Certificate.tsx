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

// Certificate.tsx change panniye code:

const Certificate: React.FC<CertificateProps> = ({
  student,
  containerRef,
  className = ''
}) => {

  const pdfUrl = "/certificate1.pdf";

  return (
    <div
      ref={containerRef}
      // H-793px remove pannittu h-auto potta border correct-ah PDF-a suththi varum
      className={`relative w-[1140px] h-[813px] max-w-full border border-slate-200 bg-white ${className}`}
      style={{ aspectRatio: '1120 / 792' }} // Aspect ratio maintain panna ithu helpful
    >

      {/* ✅ PDF Background */}
      <Document
        file={pdfUrl}
        onLoadError={(error: any) => console.error("PDF load error:", error)}
      >
        <Page 
          pageNumber={1} 
          width={1120} 
          renderAnnotationLayer={false} // Extra spacing avoid panna
          renderTextLayer={false}       // Extra spacing avoid panna
        />
      </Document>

      {/* ✅ Student Name Overlay */}
      {student && (
        <div
          style={{
            position: 'absolute',
            top: '48.9%', // Percentage use panna accurate-ah irukkum
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '840px',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
        <p
  style={{
    fontSize: '26px',
    fontWeight: 'bold',
    color: '#0f172a',
    fontFamily: "'Cormorant Upright', serif",
    letterSpacing: '0.1em',
    textTransform: 'uppercase' // 👈 Intha line-ai add pannunga
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