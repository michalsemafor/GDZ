import React from 'react';
import {
  Download,
  Copy,
  Trash2,
  Upload,
  Ruler
} from 'lucide-react';
import { AssemblySettings, SignSizePreset } from '../types/signs';

interface HeaderProps {
  settings: AssemblySettings;
  onUpdateSettings: (newSettings: Partial<AssemblySettings>) => void;
  onExportPng: () => void;
  onCopyToClipboard: () => void;
  onClearAssembly: () => void;
  onOpenUploadModal: () => void;
  signCount: number;
  isExporting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  onExportPng,
  onCopyToClipboard,
  onClearAssembly,
  onOpenUploadModal,
  signCount,
  isExporting
}) => {
  const sizePresets: { id: SignSizePreset; label: string; sub: string }[] = [
    { id: 'size1', label: 'Veľkosť 1', sub: 'Malý (70 %)' },
    { id: 'size2', label: 'Veľkosť 2', sub: 'Stredný (100 %)' },
    { id: 'size3', label: 'Veľkosť 3', sub: 'Veľký (125/140 %)' }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3 gap-3">
          
          {/* Logo & App Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                <span className="text-xl leading-none">⚠️</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none">
                    Generátor dopravného značenia
                  </h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                    TP 117 & VL 6.1
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Skladanie zostáv zvislého značenia na stĺpiku s exportom do PNG
                </p>
              </div>
            </div>

            {/* Custom Upload Button on Mobile */}
            <button
              onClick={onOpenUploadModal}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1.5 transition-colors border border-slate-200"
              title="Nahrať vlastné značky alebo Excel"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Import</span>
            </button>
          </div>

          {/* Controls & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Size Selector Switch */}
            <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs">
              {sizePresets.map((preset) => {
                const isActive = settings.sizePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onUpdateSettings({ sizePreset: preset.id })}
                    className={`px-2.5 py-1.5 rounded-md font-medium transition-all ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title={`${preset.label} – ${preset.sub}`}
                  >
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Toggles Dropdown or Inline Chips */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs">
              <label className="flex items-center gap-1.5 px-2 py-1 cursor-pointer select-none rounded hover:bg-slate-200/60 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.showPole}
                  onChange={(e) => onUpdateSettings({ showPole: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span className="text-slate-700 font-medium">Stĺpik</span>
              </label>

              <label className="flex items-center gap-1.5 px-2 py-1 cursor-pointer select-none rounded hover:bg-slate-200/60 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.showLabels}
                  onChange={(e) => onUpdateSettings({ showLabels: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span className="text-slate-700 font-medium">Popisy / Kódy</span>
              </label>

              <label className="flex items-center gap-1.5 px-2 py-1 cursor-pointer select-none rounded hover:bg-slate-200/60 transition-colors" title="Zobraziť technické kóty a vzdialenosti v mm">
                <input
                  type="checkbox"
                  checked={settings.showDimensions}
                  onChange={(e) => onUpdateSettings({ showDimensions: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span className="text-slate-700 font-medium flex items-center gap-1">
                  <Ruler className="w-3 h-3 text-slate-500" /> Kóty
                </span>
              </label>
            </div>

            {/* Custom Upload on Desktop */}
            <button
              onClick={onOpenUploadModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs"
              title="Nahrať vlastné SVG značky alebo nový Excel číselník"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Nahrať značky</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={onClearAssembly}
              disabled={signCount === 0}
              className={`p-1.5 text-xs rounded-lg border transition-colors flex items-center gap-1 ${
                signCount === 0
                  ? 'text-slate-300 border-slate-200 cursor-not-allowed'
                  : 'text-slate-600 border-slate-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
              }`}
              title="Vyčistiť celú zostavu"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Vyčistiť</span>
            </button>

            {/* Export Buttons */}
            <button
              onClick={onCopyToClipboard}
              disabled={signCount === 0 || isExporting}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 shadow-2xs ${
                signCount === 0 || isExporting
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 hover:border-slate-400 active:scale-98'
              }`}
              title="Skopírovať vygenerovaný PNG obrázok priamo do schránky (pre Word/CAD)"
            >
              <Copy className="w-3.5 h-3.5 text-slate-600" />
              <span>Kopírovať</span>
            </button>

            <button
              onClick={onExportPng}
              disabled={signCount === 0 || isExporting}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-sm ${
                signCount === 0 || isExporting
                  ? 'bg-blue-300 text-white cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-98'
              }`}
              title="Stiahnuť celú zostavu ako 2x Retina PNG s priehľadným pozadím"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Stiahnuť PNG</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
