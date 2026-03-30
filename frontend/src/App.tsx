import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import BulkDownload from './components/BulkDownload';
import Certificate from './components/Certificate';
import ExcelUpload, { StudentRow } from './components/ExcelUpload';
import './App.css';

const apiBaseUrl = process.env.REACT_APP_API_URL ?? 'http://localhost:5000';

const sanitizeFileName = (value: string) =>
  value
    .trim()
    .replace(/[/\\?%*:|\"<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim() || 'Unknown';

const waitForRender = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => setTimeout(() => resolve(), 100));
  });

const createPdfFromElement = async (element: HTMLElement) => {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
  });

  const image = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ unit: 'px', format: [canvas.width, canvas.height] });
  pdf.addImage(image, 'PNG', 0, 0, canvas.width, canvas.height);
  return pdf;
};


const App: React.FC = () => {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [saveToBackend, setSaveToBackend] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Upload an Excel file to begin.');
  const previewRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLDivElement>(null);
  const [hiddenStudent, setHiddenStudent] = useState<StudentRow | null>(null);

  useEffect(() => {
    if (currentIndex >= rows.length && rows.length > 0) {
      setCurrentIndex(rows.length - 1);
    }
  }, [currentIndex, rows.length]);

  const currentStudent = rows[currentIndex] ?? null;

  const handleRowsLoaded = (newRows: StudentRow[]) => {
    setRows(newRows);
    setCurrentIndex(0);
    setProgress(0);
    setCurrentStep(0);
    setStatusMessage(`${newRows.length} student rows loaded.`);
  };

  const saveCertificateRecord = async (student: StudentRow) => {
    try {
      await axios.post(`${apiBaseUrl}/api/certificates`, {
        name: student.name,
        college: student.college,
        generatedDate: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('Backend save failed:', error);
    }
  };

  const downloadCurrentCertificate = async () => {
    if (!currentStudent || !previewRef.current) {
      return;
    }

    setIsDownloading(true);
    setStatusMessage('Rendering current certificate...');

    try {
      const pdf = await createPdfFromElement(previewRef.current);
      const filename = `${sanitizeFileName(currentStudent.name)}.pdf`;
      pdf.save(filename);
      setStatusMessage('Current certificate ready to download.');
    } catch (error) {
      console.error(error);
      setStatusMessage('Unable to generate current certificate.');
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadAllCertificates = async () => {
    if (!rows.length || !hiddenRef.current) {
      return;
    }

    setIsDownloading(true);
    setProgress(0);
    setCurrentStep(0);
    setStatusMessage('Preparing bulk export...');

    const grouped = rows.reduce((acc, row) => {
      const folderName = sanitizeFileName(row.college) || 'Unknown College';
      acc[folderName] = acc[folderName] ?? [];
      acc[folderName].push(row);
      return acc;
    }, {} as Record<string, StudentRow[]>);

    const zip = new JSZip();
    const seenNames = new Map<string, number>();
    const total = rows.length;
    let step = 0;

    try {
      for (const folderName of Object.keys(grouped)) {
        const folder = zip.folder(folderName) ?? zip;

        for (const student of grouped[folderName]) {
          step += 1;
          setCurrentStep(step);
          setProgress(Math.round((step / total) * 100));
          setStatusMessage(`Rendering ${student.name} (${step}/${total})`);

          setHiddenStudent(student);
          await waitForRender();

          if (!hiddenRef.current) {
            continue;
          }

          const pdf = await createPdfFromElement(hiddenRef.current);
          let safeFileName = `${sanitizeFileName(student.name)}.pdf`;
          const key = `${folderName}/${safeFileName}`;
          const duplicates = seenNames.get(key) ?? 0;
          if (duplicates > 0) {
            safeFileName = `${sanitizeFileName(student.name)}-${duplicates + 1}.pdf`;
          }
          seenNames.set(key, duplicates + 1);

          folder.file(safeFileName, pdf.output('arraybuffer'));

          if (saveToBackend) {
            await saveCertificateRecord(student);
          }
        }
      }

      setStatusMessage('Creating ZIP package...');
      const zipBlob = await zip.generateAsync(
        { type: 'blob' },
        (metadata: { percent?: number }) => {
          if (typeof metadata.percent === 'number') {
            setProgress(Math.round(metadata.percent));
          }
        }
      );

      saveAs(zipBlob, 'certificates.zip');
      setStatusMessage('Bulk certificates ZIP ready.');
    } catch (error) {
      console.error(error);
      setStatusMessage('Bulk generation failed.');
    } finally {
      setIsDownloading(false);
      setProgress(100);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10">
        <header className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Certificate generation system</p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl">Excel to premium certificates</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            Upload an Excel file, preview certificates, download individual PDFs, and export grouped ZIP files per college.
          </p>
        </header>

        <ExcelUpload onRowsLoaded={handleRowsLoaded} />

        <BulkDownload
          currentIndex={currentIndex}
          total={rows.length}
          onPrevious={() => setCurrentIndex((value) => Math.max(value - 1, 0))}
          onNext={() => setCurrentIndex((value) => Math.min(value + 1, rows.length - 1))}
          onDownloadCurrent={downloadCurrentCertificate}
          onDownloadAll={downloadAllCertificates}
          isDownloading={isDownloading}
          progress={progress}
          currentStep={currentStep}
          saveToBackend={saveToBackend}
          onToggleSaveToBackend={setSaveToBackend}
        />

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Certificate preview</h2>
                <p className="mt-2 text-sm text-slate-600">Preview the currently selected student certificate.</p>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{rows.length} students loaded</div>
            </div>
            <div className="flex justify-center overflow-x-auto">
              <Certificate student={currentStudent} containerRef={previewRef} />
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-slate-900">Progress</h2>
              <p className="mt-3 text-sm text-slate-600">{statusMessage}</p>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-slate-900">Instructions</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>1. Place your certificate PNG in <code className="rounded bg-slate-100 px-1 py-0.5">public/certificate-template.png</code>.</li>
                <li>2. Upload an Excel (.xlsx) file with Name and College columns.</li>
                <li>3. Use Next / Previous to preview each certificate.</li>
                <li>4. Download a single PDF or export all certificates as a ZIP grouped by college.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={hiddenRef}
        style={{
          position: 'fixed',
          left: -9999,
          top: -9999,
          opacity: 0,
          pointerEvents: 'none',
          width: 1120,
          height: 793,
        }}
      >
        <Certificate student={hiddenStudent ?? currentStudent} />
      </div>
    </div>
  );
};

export default App;

