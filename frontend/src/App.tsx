import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import CertificatePreview from './components/CertificatePreview';
import CollegeDropdown from './components/CollegeDropdown';
import DownloadButtons from './components/DownloadButtons';
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
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [canvas.width, canvas.height],
  });
  pdf.addImage(image, 'PNG', 0, 0, canvas.width, canvas.height);
  return pdf;
};

const App: React.FC = () => {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [saveToBackend, setSaveToBackend] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Upload an Excel file to begin.');
  const [hiddenStudent, setHiddenStudent] = useState<StudentRow | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const hiddenCertificateRef = useRef<HTMLDivElement>(null);

  const collegeOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.college.trim()).filter(Boolean))).sort(),
    [rows]
  );

  const selectedRows = useMemo(
    () => (selectedCollege ? rows.filter((row) => row.college === selectedCollege) : []),
    [rows, selectedCollege]
  );

  useEffect(() => {
    if (selectedCollege && !collegeOptions.includes(selectedCollege)) {
      setSelectedCollege('');
      setCurrentIndex(0);
    }
  }, [collegeOptions, selectedCollege]);

  useEffect(() => {
    if (selectedRows.length === 0) {
      setCurrentIndex(0);
      return;
    }

    if (currentIndex >= selectedRows.length) {
      setCurrentIndex(selectedRows.length - 1);
    }
  }, [currentIndex, selectedRows.length]);

  useEffect(() => {
    if (!saveToBackend || !rows.length) {
      return;
    }

    const saveAllRows = async () => {
      try {
        await axios.post(`${apiBaseUrl}/api/certificates`, {
          records: rows.map((row) => ({
            name: row.name,
            college: row.college,
            generatedDate: new Date().toISOString(),
          })),
        });
        setStatusMessage('Uploaded Excel rows to the backend successfully.');
      } catch (error) {
        console.warn('Backend save failed:', error);
        setStatusMessage('Failed to save rows to backend.');
      }
    };

    saveAllRows();
  }, [saveToBackend, rows]);

  const currentStudent = selectedRows[currentIndex] ?? null;

  const handleRowsLoaded = (newRows: StudentRow[]) => {
    setRows(newRows);
    setSelectedCollege('');
    setCurrentIndex(0);
    setProgress(0);
    setCurrentStep(0);
    setStatusMessage(`${newRows.length} rows loaded. Select a college to filter.`);
    setHiddenStudent(null);
  };

  const handleCollegeChange = (college: string) => {
    setSelectedCollege(college);
    setCurrentIndex(0);
    setStatusMessage(college ? `Viewing ${college} certificates.` : 'Select a college to preview.');
  };

  const downloadCurrentCertificate = async () => {
    if (!currentStudent || !previewRef.current) {
      setStatusMessage('No certificate available to download.');
      return;
    }

    setIsDownloading(true);
    setStatusMessage('Rendering current certificate...');

    try {
      const pdf = await createPdfFromElement(previewRef.current);
      const filename = `${sanitizeFileName(currentStudent.name)}.pdf`;
      pdf.save(filename);
      setStatusMessage('Current certificate downloaded successfully.');
    } catch (error) {
      console.error(error);
      setStatusMessage('Unable to generate current certificate.');
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadSelectedCollegeCertificates = async () => {
    if (!selectedCollege) {
      setStatusMessage('Select a college before exporting certificates.');
      return;
    }

    if (selectedRows.length === 0) {
      setStatusMessage('No students found for the selected college.');
      return;
    }

    if (!hiddenCertificateRef.current) {
      return;
    }

    setIsDownloading(true);
    setProgress(0);
    setCurrentStep(0);
    setStatusMessage(`Rendering ${selectedRows.length} certificates for ${selectedCollege}...`);

    const zip = new JSZip();
    const folder = zip.folder(sanitizeFileName(selectedCollege) || 'Selected College') ?? zip;
    const seenNames = new Map<string, number>();
    const total = selectedRows.length;
    let step = 0;

    try {
      for (const student of selectedRows) {
        step += 1;
        setCurrentStep(step);
        setProgress(Math.round((step / total) * 100));
        setStatusMessage(`Rendering ${student.name} (${step}/${total})`);

        setHiddenStudent(student);
        await waitForRender();

        if (!hiddenCertificateRef.current) {
          continue;
        }

        const pdf = await createPdfFromElement(hiddenCertificateRef.current);
        let safeFileName = `${sanitizeFileName(student.name)}.pdf`;
        const key = `${safeFileName}`;
        const duplicates = seenNames.get(key) ?? 0;
        if (duplicates > 0) {
          safeFileName = `${sanitizeFileName(student.name)}-${duplicates + 1}.pdf`;
        }
        seenNames.set(key, duplicates + 1);

        folder.file(safeFileName, pdf.output('arraybuffer'));
      }

      setStatusMessage('Creating ZIP package...');
      const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        if (typeof metadata.percent === 'number') {
          setProgress(Math.round(metadata.percent));
        }
      });

      saveAs(zipBlob, `${sanitizeFileName(selectedCollege)}.zip`);
      setStatusMessage('Selected college certificates downloaded as ZIP.');
    } catch (error) {
      console.error(error);
      setStatusMessage('Failed to export selected college certificates.');
    } finally {
      setIsDownloading(false);
      setProgress(100);
      setHiddenStudent(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10">
        <header className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Certificate generation system</p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl">Excel to premium certificates</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            Upload an Excel file, select a college, preview certificates, and export only the college you choose.
          </p>
        </header>

        <ExcelUpload onRowsLoaded={handleRowsLoaded} />

        <CollegeDropdown
          colleges={collegeOptions}
          selectedCollege={selectedCollege}
          onCollegeChange={handleCollegeChange}
        />

        <DownloadButtons
          currentIndex={currentIndex}
          selectedCollege={selectedCollege}
          selectedCount={selectedRows.length}
          onPrevious={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
          onNext={() => setCurrentIndex((prev) => Math.min(prev + 1, selectedRows.length - 1))}
          onDownloadCurrent={downloadCurrentCertificate}
          onDownloadSelectedCollege={downloadSelectedCollegeCertificates}
          isDownloading={isDownloading}
          progress={progress}
          currentStep={currentStep}
          saveToBackend={saveToBackend}
          onToggleSaveToBackend={setSaveToBackend}
        />

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Student selection</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Selected student preview</h2>
              <p className="mt-2 text-sm text-slate-600">
                {selectedRows.length > 0
                  ? `Showing student ${currentIndex + 1} of ${selectedRows.length}`
                  : 'Select a college to preview students.'}
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
              {currentStudent ? `${currentStudent.name}` : 'No student selected'}
            </div>
          </div>

          {selectedRows.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedRows.slice(0, 12).map((student, index) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    index === currentIndex
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {index + 1}. {student.name}
                </button>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <CertificatePreview
            student={currentStudent}
            previewRef={previewRef}
            selectedCollege={selectedCollege}
            selectedCount={selectedRows.length}
          />

          {/* <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-slate-900">Status</h2>
              <p className="mt-3 text-sm text-slate-600">{statusMessage}</p>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-slate-900">Notes</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>Upload an Excel file with Student Name and College Name columns.</li>
                <li>Select a college from the dropdown to preview only that group.</li>
                <li>Use Next / Previous to move through the filtered students.</li>
                <li>Download a single PDF or export the selected college as a ZIP.</li>
              </ul>
            </div>
          </div> */}
        </div>
      </div>

      <div
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
        <CertificatePreview
          student={hiddenStudent ?? currentStudent}
          previewRef={hiddenCertificateRef}
          selectedCollege={selectedCollege}
          selectedCount={selectedRows.length}
          plain // Only the certificate, no padding/border
        />
      </div>
    </div>
  );
};

export default App;

