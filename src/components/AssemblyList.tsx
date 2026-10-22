import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  GripVertical,
  Layers
} from 'lucide-react';
import { PlacedSign, AssemblySettings } from '../types/signs';
import { calculateSignDimensions } from '../utils/dimensionRules';
import { SignSvgPreview } from './SignSvgPreview';

interface AssemblyListProps {
  assembly: PlacedSign[];
  settings: AssemblySettings;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onRemove: (instanceId: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
}

export const AssemblyList: React.FC<AssemblyListProps> = ({
  assembly,
  settings,
  onMoveUp,
  onMoveDown,
  onRemove,
  onReorder
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  if (assembly.length === 0) return null;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      onReorder(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
  };

  return (
    <div className="w-full lg:w-80 bg-white border-l border-slate-200 flex flex-col h-full shrink-0 shadow-xs">
      
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Značky v zostave ({assembly.length})
          </h2>
        </div>
        <span className="text-[11px] text-slate-400">
          Zhora nadol
        </span>
      </div>

      {/* Signs List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {assembly.map((placed, index) => {
          const dims = calculateSignDimensions(placed.sign, settings.sizePreset);
          const isFirst = index === 0;
          const isLast = index === assembly.length - 1;

          return (
            <div
              key={placed.instanceId}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`group flex items-center gap-2.5 p-2.5 bg-slate-50 border rounded-xl transition-all ${
                draggedIndex === index
                  ? 'opacity-40 border-dashed border-blue-400'
                  : 'border-slate-200 hover:border-blue-300 hover:bg-white hover:shadow-xs'
              }`}
            >
              {/* Drag Handle */}
              <button
                className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-0.5 rounded touch-none"
                title="Potiahnite pre zmenu poradia"
              >
                <GripVertical className="w-4 h-4" />
              </button>

              {/* Order number */}
              <span className="w-5 text-center text-xs font-mono font-bold text-slate-400">
                {index + 1}.
              </span>

              {/* Thumbnail */}
              <div className="w-12 h-12 shrink-0 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center">
                <SignSvgPreview sign={placed.sign} maxHeight={40} className="w-full h-full" />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {placed.sign.code}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {dims.width} × {dims.height} mm
                  </span>
                </div>
                <p className="text-xs text-slate-600 truncate font-medium mt-0.5" title={placed.sign.name}>
                  {placed.sign.name}
                </p>
              </div>

              {/* Order buttons */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => onMoveUp(index)}
                  disabled={isFirst}
                  className={`p-1 rounded transition-colors ${
                    isFirst
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                  title="Posunúť vyššie (nahor)"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onMoveDown(index)}
                  disabled={isLast}
                  className={`p-1 rounded transition-colors ${
                    isLast
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                  title="Posunúť nižšie (nadol)"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Delete button */}
              <button
                onClick={() => onRemove(placed.instanceId)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                title="Odstrániť zo zostavy"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Assembly info summary */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 space-y-1">
        <div className="flex justify-between">
          <span>Spôsob radenia:</span>
          <span className="font-semibold text-slate-700">Strikná vertikálna os</span>
        </div>
        <div className="flex justify-between">
          <span>Voľná výška k terénu:</span>
          <span className="font-semibold text-slate-700">2,00 m (TP 117)</span>
        </div>
      </div>

    </div>
  );
};
