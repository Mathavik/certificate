import React from 'react';

type BulkDownloadProps = {
  currentIndex: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  onDownloadCurrent: () => Promise<void>;
  onDownloadAll: () => Promise<void>;
  isDownloading: boolean;
  progress: number;
  currentStep: number;
  saveToBackend: boolean;
  onToggleSaveToBackend: (value: boolean) => void;
};

const BulkDownload: React.FC<BulkDownloadProps> = ({
  currentIndex,
  total,
  onPrevious,
  onNext,
  onDownloadCurrent,
  onDownloadAll,
  isDownloading,
  progress,
  currentStep,
  saveToBackend,
  onToggleSaveToBackend,
}) => {
  return (
    <section className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Certificate controls</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Navigate and export</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
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
            disabled={currentIndex >= total - 1 || total === 0 || isDownloading}
            className="rounded-2xl border border-slate-300 bg-slate-50 px-5 py-3 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
          </button>
          <button
            type="button"
            onClick={onDownloadCurrent}
            disabled={total === 0 || isDownloading}
            className="rounded-2xl border border-slate-300 bg-amber-500 px-5 py-3 text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Download Current PDF
          </button>
          <button
            type="button"
            onClick={onDownloadAll}
            disabled={total === 0 || isDownloading}
            className="rounded-2xl border border-slate-300 bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Download All as ZIP
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-600">
                Student preview: <span className="font-semibold text-slate-900">{total ? currentIndex + 1 : 0}</span> /{' '}
                <span className="font-semibold text-slate-900">{total}</span>
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={saveToBackend}
                disabled={isDownloading}
                onChange={(e) => onToggleSaveToBackend(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900"
              />
              Save records to backend
            </label>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${progress}%` }} />
          </div>

          <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
            <p>{isDownloading ? `Generating ${currentStep} of ${total}` : 'Ready to export certificates.'}</p>
            <p>{progress}%</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BulkDownload;
