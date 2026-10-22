import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, FolderArchive } from 'lucide-react';
import * as XLSX from 'xlsx';
import { SignData } from '../types/signs';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomSignsLoaded: (newSigns: SignData[], replaceAll: boolean) => void;
  currentCount: number;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onCustomSignsLoaded,
  currentCount
}) => {
  const [uploadedSvgs, setUploadedSvgs] = useState<Map<string, string>>(new Map());
  const [uploadedExcelSigns, setUploadedExcelSigns] = useState<Partial<SignData>[]>([]);
  const [replaceAll, setReplaceAll] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle SVG files drop / selection
  const handleSvgFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newMap = new Map(uploadedSvgs);
    let count = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.endsWith('.svg')) {
        const text = await file.text();
        const code = file.name.replace(/\.svg$/i, '').trim();
        newMap.set(code, text);
        count++;
      }
    }

    setUploadedSvgs(newMap);
    setStatusMessage(`Úspešne načítaných ${count} vektorových SVG súborov značiek.`);
  };

  // Handle Excel file upload and parsing
  const handleExcelFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames.includes('data') ? 'data' : workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json<any>(sheet);

      const parsed: Partial<SignData>[] = rawRows.map((row, idx) => {
        const code = String(row['OZNACENIE'] || row['oznacenie'] || '').trim();
        const number = String(row['CISLO'] || row['cislo'] || code.split('-')[0]).trim();
        const name = String(row['TEXT'] || row['text'] || '').trim();
        const alt = String(row['ALT TEXT'] || row['alt text'] || row['ALT_TEXT'] || '').trim();

        const num = parseInt(number, 10);
        let shape: SignData['shape'] = 'other';
        let width = 700;
        let height = 700;

        if (num >= 501 && num <= 599) {
          shape = 'plate';
          width = 500;
          height = code === '507-10' ? 250 : 200;
        } else if (code === '210' || (num >= 230 && num <= 279) || (num >= 301 && num <= 315)) {
          shape = 'circle';
          width = 700;
          height = 700;
        } else if (code === '201') {
          shape = 'triangle_inverted';
          width = 900;
          height = 780;
        } else if (code === '202') {
          shape = 'octagon';
          width = 900;
          height = 900;
        } else if (code === '203' || code === '204') {
          shape = 'diamond';
          width = 707;
          height = 707;
        } else if (num >= 101 && num <= 199) {
          shape = 'triangle';
          width = 900;
          height = 780;
        } else {
          shape = 'square';
          width = 500;
          height = 500;
        }

        return {
          id: `custom-${idx + 1}-${code}`,
          code,
          number,
          name,
          alt,
          svgPath: `signs/${code}.svg`,
          shape,
          width,
          height,
          category: num >= 500 ? 'Dodatkové tabuľky' : num >= 400 ? 'Informatívne' : num >= 300 ? 'Príkazové' : num >= 200 ? 'Zákazové' : 'Výstražné'
        };
      });

      setUploadedExcelSigns(parsed);
      setStatusMessage(`Úspešne načítaných ${parsed.length} záznamov z Excel číselníka (${file.name}).`);
    } catch (err) {
      console.error(err);
      setStatusMessage('Chyba pri spracovaní Excel súboru. Skontrolujte formát stĺpcov.');
    }
  };

  // Apply custom data
  const handleApply = () => {
    const finalSigns: SignData[] = [];

    // If Excel rows are loaded, pair with SVGs
    if (uploadedExcelSigns.length > 0) {
      for (const row of uploadedExcelSigns) {
        if (!row.code) continue;
        const customSvg = uploadedSvgs.get(row.code);
        finalSigns.push({
          id: row.id || `sign-${row.code}`,
          code: row.code,
          number: row.number || row.code.split('-')[0],
          name: row.name || row.code,
          alt: row.alt || '',
          svgPath: `signs/${row.code}.svg`,
          shape: row.shape || 'circle',
          width: row.width || 700,
          height: row.height || 700,
          category: row.category || 'Vlastné',
          customSvgContent: customSvg
        });
      }
    } else if (uploadedSvgs.size > 0) {
      // Just SVGs uploaded without custom Excel
      let idx = 0;
      for (const [code, svgText] of uploadedSvgs.entries()) {
        idx++;
        finalSigns.push({
          id: `custom-svg-${idx}-${code}`,
          code,
          number: code.split('-')[0],
          name: `Značka ${code}`,
          alt: '',
          svgPath: `signs/${code}.svg`,
          shape: code.startsWith('5') ? 'plate' : 'circle',
          width: code.startsWith('5') ? 500 : 700,
          height: code.startsWith('5') ? 200 : 700,
          category: code.startsWith('5') ? 'Dodatkové tabuľky' : 'Vlastné',
          customSvgContent: svgText
        });
      }
    }

    if (finalSigns.length > 0) {
      onCustomSignsLoaded(finalSigns, replaceAll);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Nahrať vlastné značky a číselník
              </h2>
              <p className="text-xs text-slate-500">
                Aktuálne načítaných {currentCount} značiek. Vložte vlastné SVG alebo nový Excel číselník.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-700">
          
          {/* Status Message */}
          {statusMessage && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* 1. Upload Excel File */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider mb-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              1. Excel číselník značiek (.xlsx)
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              List <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">data</code> so stĺpcami: <code>OZNACENIE</code>, <code>CISLO</code>, <code>TEXT</code>, <code>ALT TEXT</code>.
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelFile}
              className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
            />
            {uploadedExcelSigns.length > 0 && (
              <span className="block mt-2 text-xs font-semibold text-emerald-700">
                ✓ Pripravených {uploadedExcelSigns.length} značiek z Excelu
              </span>
            )}
          </div>

          {/* 2. Upload SVG Files */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider mb-2">
              <FolderArchive className="w-4 h-4 text-blue-600" />
              2. Vektorové SVG grafiky značiek (.svg)
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Vyberte jeden alebo viac .svg súborov pomenovaných podľa označenia (napr. <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">110-10.svg</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">270.svg</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">506-100.svg</code>).
            </p>
            <input
              type="file"
              accept=".svg"
              multiple
              onChange={handleSvgFiles}
              className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            {uploadedSvgs.size > 0 && (
              <span className="block mt-2 text-xs font-semibold text-blue-700">
                ✓ Nahraných {uploadedSvgs.size} vektorových SVG grafík
              </span>
            )}
          </div>

          {/* Options */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={replaceAll}
                onChange={(e) => setReplaceAll(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-700 font-medium">
                Nahradiť existujúci katalóg a ponechať <strong>LEN</strong> mnou nahrané značky
              </span>
            </label>
          </div>

          {/* Note on persistent git repo */}
          <div className="text-[11px] text-slate-500 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2 text-amber-800 font-semibold mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>Trvalé nasadenie cez GitHub:</span>
            </div>
            Súbory môžete tiež natrvalo pridať do repozitára do priečinkov <code className="text-amber-900 font-mono">data/ciselnik_znaciek.xlsx</code> a <code className="text-amber-900 font-mono">public/signs/*.svg</code>. Skript <code className="text-amber-900 font-mono">npm run sync-data</code> ich automaticky zosynchronizuje.
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Zrušiť
          </button>
          <button
            onClick={handleApply}
            disabled={uploadedExcelSigns.length === 0 && uploadedSvgs.size === 0}
            className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all ${
              uploadedExcelSigns.length === 0 && uploadedSvgs.size === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-98'
            }`}
          >
            Použiť a aktualizovať katalóg
          </button>
        </div>

      </div>
    </div>
  );
};
