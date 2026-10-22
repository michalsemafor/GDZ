export type SignCategory =
  | 'warning'      // Výstražné (trojuholníky)
  | 'priority'     // Upravujúce prednosť (STOP, Daj prednosť, Hlavná cesta)
  | 'prohibitory'  // Zákazové (červené kruhy)
  | 'mandatory'    // Príkazové (modré kruhy)
  | 'informative'  // Informatívne (štvorce / obdĺžniky)
  | 'additional'   // Dodatkové tabuľky
  | 'direction';   // Smerové tabule

export type SignSizeType = 'mini' | 'standard' | 'oversized';

export type RetroreflectionClass = 'RA1' | 'RA2' | 'RA3';

export type SignSubstrate = 'permanent' | 'temporary'; // Trvalé (biela) vs Prenosné/Dočasné (žltá)

export type SignShape =
  | 'triangle-up'
  | 'triangle-down'
  | 'circle'
  | 'octagon'
  | 'diamond'
  | 'square'
  | 'rectangle-horizontal'
  | 'rectangle-vertical'
  | 'arrow-sign';

export interface TrafficSignDefinition {
  id: string;
  code: string; // napr. 101, 215, 301, 401, 501...
  oldCode?: string; // staré označenie napr. A1a, B20a, C1...
  name: string;
  category: SignCategory;
  shape: SignShape;
  description: string;
  recommendedFoil?: RetroreflectionClass;
  hasCustomValue?: boolean;
  customValueLabel?: string;
  defaultValue?: string | number;
  valueUnit?: string;
  valueOptions?: (string | number)[];
  hasCustomText?: boolean;
  defaultText?: string;
  hasSecondaryText?: boolean;
  defaultSecondaryText?: string;
  standardDimensionsMm?: {
    mini: number;
    standard: number;
    oversized: number;
  };
}

export interface ConfiguredSign {
  instanceId: string;
  signId: string;
  code: string;
  name: string;
  category: SignCategory;
  shape: SignShape;
  size: SignSizeType;
  foil: RetroreflectionClass;
  substrate: SignSubstrate; // permanent | temporary
  customValue?: string | number;
  customText?: string;
  customSecondaryText?: string;
  customColorVariant?: string;
  customArrowAngle?: number;
  notes?: string;
}

export interface DirectionDestination {
  id: string;
  city: string;
  distanceKm?: number;
  roadNumber?: string; // napr. D1, I/61, II/502
  roadClass?: 'highway' | 'first-class' | 'second-class' | 'local';
  arrowDirection: 'straight' | 'left' | 'right' | 'slight-left' | 'slight-right';
}

export interface DirectionSignConfig {
  id: string;
  title: string;
  substrate: 'permanent' | 'temporary';
  backgroundTheme: 'blue' | 'green' | 'yellow' | 'white';
  destinations: DirectionDestination[];
}

export interface SignAssembly {
  id: string;
  title: string;
  locationKm: string; // napr. "km 14.250"
  locationDesc: string; // napr. "Pravá strana, pred križovatkou s III/1024"
  poleHeight: number; // v metroch napr. 3.2m
  clearanceHeight: number; // svetlá výška napr. 2.20m
  foundation: 'concrete' | 'ground-socket' | 'portable-base'; // Betónová pätka, zemná skrutka, prenosný stojan
  signs: ConfiguredSign[];
}

export interface GDZProject {
  id: string;
  name: string;
  roadName: string;
  investor: string;
  designer: string;
  date: string;
  standardNorm: string; // napr. "Vyhláška MV SR č. 30/2020 Z.z. a TP 01/2020"
  assemblies: SignAssembly[];
}
