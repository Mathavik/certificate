import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export interface StudentRow {
  id: string;
  name: string;
  college: string;
}

type ExcelUploadProps = {
  onRowsLoaded: (rows: StudentRow[]) => void;
};

const sanitizeText = (value: unknown) => String(value ?? '').trim();

const createUniqueId = (name: string, college: string, index: number) => {
  const safeName = name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
  const safeCollege = college.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
  return `${safeName || 'student'}-${safeCollege || 'college'}-${index}-${Math.random().toString(36).slice(2, 8)}`;
};

const ExcelUpload: React.FC<ExcelUploadProps> = ({ onRowsLoaded }) => {
  const [fileName, setFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setFileName(file.name);
    setErrorMessage('');

    if (!file.name.endsWith('.xlsx')) {
      setErrorMessage('Please upload an Excel .xlsx file.');
      onRowsLoaded([]);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result;
        if (!arrayBuffer || !(arrayBuffer instanceof ArrayBuffer)) {
          throw new Error('Unable to read file content');
        }

        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        const sheetData = XLSX.utils.sheet_to_json<string[]>(firstSheet, {
          header: 1,
          defval: '',
          raw: false,
        });

        const normalizeHeader = (value: string) =>
          value
            .toString()
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');

        const isNameHeader = (value: string) => {
          const normalized = normalizeHeader(value);
          return [
            'name',
            'studentname',
            'fullname',
            'student',
            'candidate',
            'participant',
          ].includes(normalized);
        };

        const isCollegeHeader = (value: string) => {
          const normalized = normalizeHeader(value);
          return [
            'college',
            'collegename',
            'institution',
            'school',
            'university',
            'institute',
            'organization',
            'organisation',
          ].includes(normalized);
        };

        const headerRow = Array.isArray(sheetData[0]) ? sheetData[0] : [];
        let nameColumnIndex = -1;
        let collegeColumnIndex = -1;

        if (Array.isArray(headerRow)) {
          nameColumnIndex = headerRow.findIndex((cell) => isNameHeader(String(cell)));
          collegeColumnIndex = headerRow.findIndex((cell) => isCollegeHeader(String(cell)));
        }

        const startRow = nameColumnIndex !== -1 && collegeColumnIndex !== -1 ? 1 : 0;

        const rows = sheetData
          .slice(startRow)
          .map((row, index) => {
            if (!Array.isArray(row)) {
              return null;
            }

            const values = row.map((cell) => sanitizeText(cell));
            const name = sanitizeText(
              nameColumnIndex !== -1 ? values[nameColumnIndex] : values[0]
            );
            const college = sanitizeText(
              collegeColumnIndex !== -1 ? values[collegeColumnIndex] : values[1]
            );

            if (!name || !college) {
              return null;
            }

            return {
              id: createUniqueId(name, college, index),
              name,
              college,
            };
          })
          .filter(Boolean) as StudentRow[];

        if (!rows.length) {
          setErrorMessage('No valid rows found. Ensure the file contains Name and College columns.');
          onRowsLoaded([]);
          return;
        }

        onRowsLoaded(rows);
      } catch (error) {
        setErrorMessage('Failed to parse Excel file. Please upload a valid .xlsx document.');
        onRowsLoaded([]);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <section className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Upload Excel</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Import student data from Excel</h2>
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-300 bg-slate-50 px-5 py-4 text-slate-700 transition hover:border-slate-400 hover:bg-slate-100">
          <span>{fileName || 'Choose certificate roster (.xlsx)'}</span>
          <input type="file" accept=".xlsx" className="hidden" onChange={handleFile} />
        </label>

        <p className="text-sm text-slate-500">The first two columns should contain Name and College. Empty rows are ignored automatically.</p>

        {errorMessage && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}
      </div>
    </section>
  );
};

export default ExcelUpload;
