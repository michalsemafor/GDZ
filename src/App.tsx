import { useState, useRef } from 'react';
import initialSignsData from './data/signs.json';
import { SignData, PlacedSign, AssemblySettings } from './types/signs';
import { Header } from './components/Header';
import { CatalogPanel } from './components/CatalogPanel';
import { AssemblyCanvas } from './components/AssemblyCanvas';
import { AssemblyList } from './components/AssemblyList';
import { Toast, ToastMessage } from './components/Toast';
import {
  renderSvgToCanvas,
  canvasToPngBlob,
  downloadPngFile,
  copyPngToClipboard
} from './utils/exportImage';

export function App() {
  // Signs catalog (loaded directly from public/signs/ and signs.json)
  const [signs] = useState<SignData[]>(initialSignsData as SignData[]);

  // Assembly starts clean on each reload (as per requirement: no localStorage persistence)
  const [assembly, setAssembly] = useState<PlacedSign[]>([]);

  // Assembly view & size settings (defaults to Veľkosť 2, pole ON, labels ON)
  const [settings, setSettings] = useState<AssemblySettings>({
    sizePreset: 'size2',
    showPole: true,
    showLabels: true,
    showDimensions: false
  });

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // SVG ref for exporting to high-res canvas
  const svgRef = useRef<SVGSVGElement | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    setToast({
      id: `${Date.now()}-${Math.random()}`,
      type,
      title,
      description
    });
  };

  // Add sign to the bottom of the assembly
  const handleAddSign = (sign: SignData) => {
    const newPlaced: PlacedSign = {
      instanceId: `${sign.code}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sign
    };
    setAssembly((prev) => [...prev, newPlaced]);
    showToast('info', `Pridaná značka: ${sign.code}`, sign.name);
  };

  // Move sign up in hierarchy
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setAssembly((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Move sign down in hierarchy
  const handleMoveDown = (index: number) => {
    setAssembly((prev) => {
      if (index >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Remove individual sign
  const handleRemove = (instanceId: string) => {
    setAssembly((prev) => prev.filter((item) => item.instanceId !== instanceId));
  };

  // Reorder signs via drag and drop
  const handleReorder = (startIndex: number, endIndex: number) => {
    setAssembly((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(startIndex, 1);
      copy.splice(endIndex, 0, removed);
      return copy;
    });
  };

  // Clear entire assembly
  const handleClearAssembly = () => {
    setAssembly([]);
    showToast('info', 'Zostava bola vyčistená');
  };

  // Update settings
  const handleUpdateSettings = (newSettings: Partial<AssemblySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Export assembly to PNG file
  const handleExportPng = async () => {
    if (!svgRef.current || assembly.length === 0) return;
    setIsExporting(true);
    try {
      const canvas = await renderSvgToCanvas(svgRef.current, 2);
      const blob = await canvasToPngBlob(canvas);
      downloadPngFile(blob, 'dopravne-znacenie-2026.png');
      showToast(
        'success',
        'PNG súbor stiahnutý',
        'Zostava bola vyexportovaná v ostrom 2× Retina rozlíšení s priehľadným pozadím.'
      );
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Chyba pri exporte', err?.message || 'Nepodarilo sa vytvoriť PNG.');
    } finally {
      setIsExporting(false);
    }
  };

  // Copy assembly image to system clipboard
  const handleCopyToClipboard = async () => {
    if (!svgRef.current || assembly.length === 0) return;
    setIsExporting(true);
    try {
      const canvas = await renderSvgToCanvas(svgRef.current, 2);
      const blob = await canvasToPngBlob(canvas);
      await copyPngToClipboard(blob);
      showToast(
        'success',
        'Skopírované do schránky',
        'Obrázok PNG je v schránke. Môžete ho priamo vložiť do Wordu, Excelu alebo grafického editora (Ctrl + V).'
      );
    } catch (err: any) {
      console.error(err);
      showToast(
        'error',
        'Kopírovanie zlyhalo',
        err?.message || 'Váš prehliadač nepodporuje priamy zápis obrázkov do schránky. Použite tlačidlo Stiahnuť PNG.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100">
      
      {/* 1. Global Navigation Bar */}
      <Header
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onExportPng={handleExportPng}
        onCopyToClipboard={handleCopyToClipboard}
        onClearAssembly={handleClearAssembly}
        signCount={assembly.length}
        isExporting={isExporting}
      />

      {/* 2. Main Workspace (Split layout: Catalog on left, Canvas and Assembly list on right) */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Panel: Search & Catalog */}
        <CatalogPanel signs={signs} onAddSign={handleAddSign} />

        {/* Right Area: Interactive Canvas & Assembly List */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* Live Assembly Canvas */}
          <AssemblyCanvas
            assembly={assembly}
            settings={settings}
            onAddSign={handleAddSign}
            svgRef={svgRef}
          />

          {/* Assembly Manager List */}
          <AssemblyList
            assembly={assembly}
            settings={settings}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onRemove={handleRemove}
            onReorder={handleReorder}
          />

        </div>

      </main>

      {/* Feedback Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}

export default App;
