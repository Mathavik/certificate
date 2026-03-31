import React from 'react';

type DownloadButtonsProps = {
  currentIndex: number;
  selectedCollege: string;
  selectedCount: number;
  onPrevious: () => void;
  onNext: () => void;
  onDownloadCurrent: () => Promise<void>;
  onDownloadSelectedCollege: () => Promise<void>;
  isDownloading: boolean;
  progress: number;
  currentStep: number;
  saveToBackend: boolean;
  onToggleSaveToBackend: (value: boolean) => void;
};

const DownloadButtons: React.FC<DownloadButtonsProps> = ({
  currentIndex,
  selectedCollege,
  selectedCount,
  onPrevious,
  onNext,
  onDownloadCurrent,
  onDownloadSelectedCollege,
  isDownloading,
  progress,
  currentStep,
  saveToBackend,
  onToggleSaveToBackend,
}) => {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Certificate controls</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Navigate and export</h2>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentIndex <= 0 || isDownloading}
          className="rounded-2xl border border-slate-300 bg-slate-50 px-5 py-3 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={currentIndex >= selectedCount - 1 || selectedCount === 0 || isDownloading}
          className="rounded-2xl border border-slate-300 bg-slate-50 px-5 py-3 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Next
        </button>
        <button
          type="button"
          onClick={onDownloadCurrent}
          disabled={selectedCount === 0 || isDownloading}
          className="rounded-2xl border border-slate-300 bg-amber-500 px-5 py-3 text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Download Current PDF
        </button>
        <button
          type="button"
          onClick={onDownloadSelectedCollege}
          disabled={!selectedCollege || selectedCount === 0 || isDownloading}
          className="rounded-2xl border border-slate-300 bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Download Selected College Certificates
        </button>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-600">
              Selected college: <span className="font-semibold text-slate-900">{selectedCollege || 'None'}</span>
            </p>
            <p className="text-sm text-slate-600">
              Students in selection: <span className="font-semibold text-slate-900">{selectedCount}</span>
            </p>
          </div>
          {/* <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={saveToBackend}
              disabled={isDownloading}
              onChange={(event) => onToggleSaveToBackend(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900"
            />
            Save uploaded rows to backend
          </label> */}
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
          <p>{isDownloading ? `Generating ${currentStep} of ${selectedCount}` : 'Ready to export certificates.'}</p>
          <p>{progress}%</p>
        </div>
      </div>
    </section>
  );
};

export default DownloadButtons;
