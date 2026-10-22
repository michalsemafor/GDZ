import React, { useState } from 'react';
import {
  PlacedSign,
  AssemblySettings,
  SignData
} from '../types/signs';
import {
  calculateSignDimensions,
  POLE_DIAMETER_MM,
  POLE_GROUND_CLEARANCE_MM
} from '../utils/dimensionRules';
import {
  ZoomIn,
  ZoomOut,
  Sparkles,
  Layers
} from 'lucide-react';

interface AssemblyCanvasProps {
  assembly: PlacedSign[];
  settings: AssemblySettings;
  onAddSign: (sign: SignData) => void;
  svgRef: React.Ref<SVGSVGElement>;
}

export const AssemblyCanvas: React.FC<AssemblyCanvasProps> = ({
  assembly,
  settings,
  onAddSign,
  svgRef
}) => {
  const [zoom, setZoom] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);

  // Calculate layout of signs in mm (Size 2 baseline scaled by settings)
  const layout = React.useMemo(() => {
    let currentY = 0;
    const items = assembly.map((placed, index) => {
      const { width, height, gap } = calculateSignDimensions(
        placed.sign,
        settings.sizePreset
      );
      const y = currentY;
      currentY += height;
      const isLast = index === assembly.length - 1;
      if (!isLast) {
        currentY += gap;
      }
      return {
        ...placed,
        computedWidth: width,
        computedHeight: height,
        computedGap: gap,
        y
      };
    });

    const totalSignsHeight = currentY;
    const maxSignWidth = items.length > 0
      ? Math.max(...items.map((i) => i.computedWidth))
      : 700;

    const poleDiameter = settings.sizePreset === 'size1'
      ? Math.round(POLE_DIAMETER_MM * 0.7)
      : settings.sizePreset === 'size3'
      ? Math.round(POLE_DIAMETER_MM * 1.25)
      : POLE_DIAMETER_MM;

    const poleLength = totalSignsHeight + POLE_GROUND_CLEARANCE_MM;

    return {
      items,
      totalSignsHeight,
      maxSignWidth,
      poleDiameter,
      poleLength
    };
  }, [assembly, settings.sizePreset]);

  // Dimensions of the overall SVG viewport
  const paddingX = settings.showDimensions ? 280 : 160;
  const labelsWidth = settings.showLabels ? 420 : 0;
  const paddingY = 80;

  const contentWidth = Math.max(layout.maxSignWidth + paddingX * 2 + labelsWidth, 900);
  const contentHeight = settings.showPole
    ? layout.poleLength + paddingY * 2
    : layout.totalSignsHeight + paddingY * 2;

  const centerX = paddingX + layout.maxSignWidth / 2;
  const startY = paddingY;

  // Handle Drag & Drop on Canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const sign = JSON.parse(dataStr) as SignData;
        if (sign && sign.code) {
          onAddSign(sign);
        }
      }
    } catch (err) {
      console.error('Chyba pri pustení položky na plátno:', err);
    }
  };

  // Helper to extract inner SVG body and viewBox from raw string
  const parseSvgString = (rawSvg?: string) => {
    if (!rawSvg) return null;
    const viewBoxMatch = rawSvg.match(/viewBox=["']([^"']+)["']/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 700 700';
    // Remove outer <svg ...> and </svg>
    const innerContent = rawSvg
      .replace(/<svg[^>]*>/, '')
      .replace(/<\/svg>/, '');
    return { viewBox, innerContent };
  };

  return (
    <div
      className={`relative flex-1 bg-slate-100 flex flex-col h-full overflow-hidden transition-colors ${
        isDragOver ? 'bg-blue-50/70 ring-2 ring-blue-500 ring-inset' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Zoom / View Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur border border-slate-300 shadow-md rounded-xl p-1 text-slate-700">
        <button
          onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.15).toFixed(2))))}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          title="Oddialiť"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono font-medium px-2 select-none min-w-[3.5rem] text-center">
          {Math.round(zoom * 100)} %
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.15).toFixed(2))))}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          title="Priblížiť"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="h-4 w-px bg-slate-200 mx-0.5" />
        <button
          onClick={() => setZoom(1)}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-xs font-medium px-2"
          title="Resetovať mierku (100%)"
        >
          1:1
        </button>
      </div>

      {/* Assembly Canvas Scrollable Viewport */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-6 sm:p-10 select-none">
        {assembly.length === 0 ? (
          /* Empty State */
          <div className="max-w-md w-full bg-white/80 backdrop-blur border border-slate-300/80 rounded-2xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-4 shadow-xs">
              <Layers className="w-8 h-8 text-blue-600 stroke-[1.75]" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Zostava je prázdna
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Vyberte značku z katalógu vľavo kliknutím alebo ju jednoducho potiahnite sem myšou.
            </p>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-3">
                Populárne kombinácie (kliknite na pridanie):
              </span>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    // Zakaz zastavenia (270) + Okrem zasobovania (506-100)
                    const s270 = {
                      id: 'demo-270',
                      code: '270',
                      number: '270',
                      name: 'Zákaz zastavenia',
                      alt: 'Zákaz státia aj zastavenia, modrý kruh, červený kríž X',
                      svgPath: 'signs/270.svg',
                      shape: 'circle' as const,
                      width: 700,
                      height: 700,
                      category: 'Zákazové'
                    };
                    const s506 = {
                      id: 'demo-506-100',
                      code: '506-100',
                      number: '506',
                      name: 'Okrem zásobovania',
                      alt: 'Zásobovanie povolené, vjazd zásobovania',
                      svgPath: 'signs/506-100.svg',
                      shape: 'plate' as const,
                      width: 500,
                      height: 200,
                      category: 'Dodatkové tabuľky'
                    };
                    onAddSign(s270);
                    onAddSign(s506);
                  }}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-between group bg-white shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      270 + 506-100
                    </span>
                    <span className="text-xs font-medium text-slate-800">
                      Zákaz zastavenia + Okrem zásobovania
                    </span>
                  </div>
                  <Sparkles className="w-4 h-4 text-blue-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => {
                    // Hlavna cesta (203) + Vzdialenost 100m (501-10)
                    const s203 = {
                      id: 'demo-203',
                      code: '203',
                      number: '203',
                      name: 'Hlavná cesta',
                      alt: 'Kosoštvorec, prednosť, žltý kosoštvorec',
                      svgPath: 'signs/203.svg',
                      shape: 'diamond' as const,
                      width: 707,
                      height: 707,
                      category: 'Prednosť'
                    };
                    const s501 = {
                      id: 'demo-501-10',
                      code: '501-10',
                      number: '501',
                      name: 'Vzdialenosť (100 m)',
                      alt: 'O 100 m, vzdialenosť k značke',
                      svgPath: 'signs/501-10.svg',
                      shape: 'plate' as const,
                      width: 500,
                      height: 200,
                      category: 'Dodatkové tabuľky'
                    };
                    onAddSign(s203);
                    onAddSign(s501);
                  }}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-between group bg-white shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                      203 + 501-10
                    </span>
                    <span className="text-xs font-medium text-slate-800">
                      Hlavná cesta + Vzdialenosť (100 m)
                    </span>
                  </div>
                  <Sparkles className="w-4 h-4 text-blue-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Rendered SVG Assembly */
          <div
            className="transition-transform duration-150 origin-center"
            style={{ transform: `scale(${zoom})` }}
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${contentWidth} ${contentHeight}`}
              width={contentWidth * 0.4}
              height={contentHeight * 0.4}
              className="overflow-visible drop-shadow-md select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Realistické galvanické zinkovanie stĺpika (kovový valcový lesk) */}
                <linearGradient id="galvanizedPoleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="25%" stopColor="#cbd5e1" />
                  <stop offset="60%" stopColor="#f1f5f9" />
                  <stop offset="85%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>

                <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="50%" stopColor="#64748b" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>

                {/* Šípka pre technické kóty */}
                <marker
                  id="dimArrowStart"
                  viewBox="0 0 10 10"
                  refX="0"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <polygon points="10,0 0,5 10,10" fill="#64748b" />
                </marker>
                <marker
                  id="dimArrowEnd"
                  viewBox="0 0 10 10"
                  refX="10"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <polygon points="0,0 10,5 0,10" fill="#64748b" />
                </marker>
              </defs>

              {/* 1. STĹPIK (vykreslený za značkami, začína na hornej hrane najvyššej značky a končí presne 2,0 m pod najnižšou) */}
              {settings.showPole && (
                <g id="pole-group">
                  {/* Telo stĺpika */}
                  <rect
                    x={centerX - layout.poleDiameter / 2}
                    y={startY}
                    width={layout.poleDiameter}
                    height={layout.poleLength}
                    fill="url(#galvanizedPoleGrad)"
                    stroke="#64748b"
                    strokeWidth="1.5"
                  />
                  {/* Horná ochranná zátka / krytka */}
                  <rect
                    x={centerX - layout.poleDiameter / 2 - 3}
                    y={startY - 12}
                    width={layout.poleDiameter + 6}
                    height="12"
                    rx="3"
                    fill="url(#capGrad)"
                    stroke="#1e293b"
                    strokeWidth="1.5"
                  />
                </g>
              )}

              {/* 2. ZNAČKY NA STĹPIKU (vycentrované na stred stĺpika) */}
              <g id="signs-group">
                {layout.items.map((item, idx) => {
                  const signX = centerX - item.computedWidth / 2;
                  const signY = startY + item.y;
                  const parsed = parseSvgString(item.sign.customSvgContent || item.sign.svgContent);

                  return (
                    <g key={item.instanceId} id={`sign-item-${idx}`}>
                      {/* Sub-SVG pre značku s presným viewBoxom */}
                      {parsed ? (
                        <svg
                          x={signX}
                          y={signY}
                          width={item.computedWidth}
                          height={item.computedHeight}
                          viewBox={parsed.viewBox}
                          dangerouslySetInnerHTML={{ __html: parsed.innerContent }}
                        />
                      ) : (
                        <image
                          href={`./signs/${item.sign.code}.svg`}
                          x={signX}
                          y={signY}
                          width={item.computedWidth}
                          height={item.computedHeight}
                        />
                      )}

                      {/* Voliteľné popisy a kódy značiek */}
                      {settings.showLabels && (
                        <g transform={`translate(${centerX + layout.maxSignWidth / 2 + 35}, ${signY + item.computedHeight / 2})`}>
                          {/* Spojovacia čiara */}
                          <line
                            x1={-(layout.maxSignWidth / 2 - item.computedWidth / 2 + 25)}
                            y1="0"
                            x2="0"
                            y2="0"
                            stroke="#94a3b8"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                          />
                          <circle cx="0" cy="0" r="4" fill="#3b82f6" />
                          <line x1="0" y1="0" x2="30" y2="0" stroke="#3b82f6" strokeWidth="2.5" />
                          
                          {/* Kód a názov */}
                          <text
                            x="40"
                            y="-6"
                            fontFamily="'JetBrains Mono', 'Inter', monospace"
                            fontWeight="800"
                            fontSize="24"
                            fill="#0f172a"
                          >
                            {item.sign.code}
                          </text>
                          <text
                            x="40"
                            y="18"
                            fontFamily="'Inter', sans-serif"
                            fontWeight="600"
                            fontSize="18"
                            fill="#475569"
                          >
                            {item.sign.name}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* 3. TECHNICKÉ KÓTY A ROZMERY (ak je povolené) */}
              {settings.showDimensions && (
                <g id="dimensions-group" className="text-slate-500 text-xs">
                  {/* Kóta vzdialenosti od zeme (2,0 m) */}
                  {settings.showPole && (
                    <g>
                      <line
                        x1={centerX - layout.maxSignWidth / 2 - 80}
                        y1={startY + layout.totalSignsHeight}
                        x2={centerX - layout.maxSignWidth / 2 - 80}
                        y2={startY + layout.poleLength}
                        stroke="#64748b"
                        strokeWidth="2"
                        markerStart="url(#dimArrowStart)"
                        markerEnd="url(#dimArrowEnd)"
                      />
                      {/* Vynášacie čiary */}
                      <line
                        x1={centerX - layout.poleDiameter / 2 - 10}
                        y1={startY + layout.totalSignsHeight}
                        x2={centerX - layout.maxSignWidth / 2 - 100}
                        y2={startY + layout.totalSignsHeight}
                        stroke="#cbd5e1"
                        strokeWidth="1.5"
                      />
                      <line
                        x1={centerX - layout.poleDiameter / 2 - 10}
                        y1={startY + layout.poleLength}
                        x2={centerX - layout.maxSignWidth / 2 - 100}
                        y2={startY + layout.poleLength}
                        stroke="#cbd5e1"
                        strokeWidth="1.5"
                      />
                      {/* Text 2 000 mm */}
                      <text
                        x={centerX - layout.maxSignWidth / 2 - 95}
                        y={startY + layout.totalSignsHeight + POLE_GROUND_CLEARANCE_MM / 2}
                        transform={`rotate(-90, ${centerX - layout.maxSignWidth / 2 - 95}, ${startY + layout.totalSignsHeight + POLE_GROUND_CLEARANCE_MM / 2})`}
                        fontFamily="'JetBrains Mono', monospace"
                        fontWeight="700"
                        fontSize="20"
                        fill="#475569"
                        textAnchor="middle"
                      >
                        2 000 mm (TP 117)
                      </text>
                    </g>
                  )}

                  {/* Kóta medzery medzi značkami */}
                  {layout.items.length > 1 &&
                    layout.items.slice(0, -1).map((item, idx) => {
                      const nextItem = layout.items[idx + 1];
                      const gapY1 = startY + item.y + item.computedHeight;
                      const gapY2 = startY + nextItem.y;
                      const dimGapX = centerX + layout.maxSignWidth / 2 + 15;

                      return (
                        <g key={`gap-dim-${idx}`}>
                          <line
                            x1={dimGapX}
                            y1={gapY1}
                            x2={dimGapX}
                            y2={gapY2}
                            stroke="#3b82f6"
                            strokeWidth="2"
                            markerStart="url(#dimArrowStart)"
                            markerEnd="url(#dimArrowEnd)"
                          />
                          <text
                            x={dimGapX + 10}
                            y={(gapY1 + gapY2) / 2 + 5}
                            fontFamily="'JetBrains Mono', monospace"
                            fontWeight="700"
                            fontSize="14"
                            fill="#2563eb"
                          >
                            {Math.round(item.computedGap)} mm
                          </text>
                        </g>
                      );
                    })}
                </g>
              )}

            </svg>
          </div>
        )}
      </div>

      {/* Bottom Status / Tip Bar */}
      {assembly.length > 0 && (
        <div className="bg-white/90 backdrop-blur border-t border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-4">
            <span>
              Počet značiek: <strong className="text-slate-800">{assembly.length}</strong>
            </span>
            <span>
              Výška značenia: <strong className="text-slate-800">{Math.round(layout.totalSignsHeight)} mm</strong>
            </span>
            {settings.showPole && (
              <span>
                Celková dĺžka stĺpika: <strong className="text-slate-800">{Math.round(layout.poleLength)} mm</strong> (2,0 m k terénu)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span>Medzera: {settings.sizePreset === 'size1' ? '35' : settings.sizePreset === 'size3' ? '62.5' : '50'} mm</span>
            <span>•</span>
            <span>Stĺpik: Ø {layout.poleDiameter} mm pozink</span>
          </div>
        </div>
      )}

    </div>
  );
};
