import React, { useState, useMemo } from 'react';
import { Search, X, Plus, Filter } from 'lucide-react';
import { SignData } from '../types/signs';
import { SignSvgPreview } from './SignSvgPreview';
import { normalizeSearchString } from '../utils/dimensionRules';

interface CatalogPanelProps {
  signs: SignData[];
  onAddSign: (sign: SignData) => void;
}

const CATEGORIES = [
  'Všetky',
  'Výstražné',
  'Prednosť',
  'Zákazové',
  'Príkazové',
  'Informatívne',
  'Dodatkové tabuľky'
] as const;

export const CatalogPanel: React.FC<CatalogPanelProps> = ({ signs, onAddSign }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Všetky');

  // Filtered signs using accent-insensitive, case-insensitive search across code, number, text, alt
  const filteredSigns = useMemo(() => {
    const query = normalizeSearchString(searchTerm);

    return signs.filter((sign) => {
      // Category filter
      if (selectedCategory !== 'Všetky' && sign.category !== selectedCategory) {
        return false;
      }

      // If no query, match all in category
      if (!query) return true;

      const codeNorm = normalizeSearchString(sign.code);
      const numNorm = normalizeSearchString(sign.number);
      const nameNorm = normalizeSearchString(sign.name);
      const altNorm = normalizeSearchString(sign.alt || '');

      return (
        codeNorm.includes(query) ||
        numNorm.includes(query) ||
        nameNorm.includes(query) ||
        altNorm.includes(query)
      );
    });
  }, [signs, searchTerm, selectedCategory]);

  const handleDragStart = (e: React.DragEvent, sign: SignData) => {
    e.dataTransfer.setData('application/json', JSON.stringify(sign));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside className="w-full lg:w-[420px] xl:w-[460px] bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden shrink-0">
      
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Hľadať podľa čísla, názvu alebo synoným..."
            className="w-full pl-9 pr-9 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors font-medium ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Status Count */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
          <span>
            Nájdených značiek: <strong className="text-slate-700">{filteredSigns.length}</strong>
          </span>
          <span className="text-[11px] text-slate-400">
            Kliknutím pridáte na stĺpik
          </span>
        </div>
      </div>

      {/* Grid of Signs */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        {filteredSigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-slate-500">
            <Filter className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">Žiadne značky sa nenašli</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Skúste zmeniť hľadaný výraz alebo vybrať inú kategóriu. Hľadať môžete napr. "270", "Zákaz", "Zásobovanie" alebo "Zákruta".
            </p>
            {(searchTerm || selectedCategory !== 'Všetky') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('Všetky');
                }}
                className="mt-4 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                Resetovať filtre
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            {filteredSigns.map((sign) => (
              <div
                key={sign.id}
                draggable
                onDragStart={(e) => handleDragStart(e, sign)}
                onClick={() => onAddSign(sign)}
                className="group relative flex flex-col items-center justify-between p-3 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md rounded-xl transition-all cursor-pointer text-left select-none overflow-hidden"
              >
                {/* Plus Overlay Badge */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white rounded-full p-1 shadow-sm">
                  <Plus className="w-3.5 h-3.5" />
                </div>

                {/* SVG Visual */}
                <div className="w-full h-28 flex items-center justify-center p-2 mb-2 bg-slate-50/60 rounded-lg group-hover:bg-blue-50/30 transition-colors">
                  <SignSvgPreview sign={sign} className="w-full h-full" maxHeight={90} />
                </div>

                {/* Info Text */}
                <div className="w-full">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {sign.code}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {sign.shape === 'circle' ? 'Ø 700' : `${sign.width}×${sign.height}`}
                    </span>
                  </div>
                  <h3
                    className="text-xs font-semibold text-slate-800 line-clamp-2 group-hover:text-blue-700 leading-snug"
                    title={sign.name}
                  >
                    {sign.name}
                  </h3>
                  {sign.alt && (
                    <p
                      className="text-[10px] text-slate-400 truncate mt-0.5"
                      title={sign.alt}
                    >
                      {sign.alt}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </aside>
  );
};
