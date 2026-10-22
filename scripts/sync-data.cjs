const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const excelPath = path.resolve(__dirname, '../data/ciselnik_znaciek.xlsx');
const outputPath = path.resolve(__dirname, '../src/data/signs.json');
const signsDir = path.resolve(__dirname, '../public/signs');

if (!fs.existsSync(excelPath)) {
  console.error(`Excel súbor nebol nájdený na ceste: ${excelPath}`);
  process.exit(1);
}

const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames.includes('data') ? 'data' : workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rawRows = XLSX.utils.sheet_to_json(sheet);

console.log(`Načítaných ${rawRows.length} riadkov z listu "${sheetName}"...`);

// Helper to determine shape and default mm dimensions for Size 2 (Veľkosť 2)
function getSignShapeAndSize(oznacenie, cislo) {
  const code = String(oznacenie).trim();
  const num = parseInt(cislo, 10);

  // Dodatkové tabuľky 501 - 599
  if (num >= 501 && num <= 599) {
    if (code === '507-10') return { shape: 'plate', width: 500, height: 250 };
    return { shape: 'plate', width: 500, height: 200 };
  }

  // Kruhové značky: zákazové 210, 230-272 a príkazové 301-314
  if (code === '210' || (num >= 230 && num <= 279) || (num >= 301 && num <= 315)) {
    return { shape: 'circle', width: 700, height: 700 };
  }

  // 201 Daj prednosť v jazde (trojuholník dole)
  if (code === '201') {
    return { shape: 'triangle_inverted', width: 900, height: 780 };
  }

  // 202 STOP (oktagon)
  if (code === '202') {
    return { shape: 'octagon', width: 900, height: 900 };
  }

  // 203 Hlavná cesta (kosoštvorec) & 204 Koniec hlavnej cesty
  if (code === '203' || code === '204') {
    return { shape: 'diamond', width: 707, height: 707 };
  }

  // 100-199 Výstražné (trojuholník hore)
  if (num >= 101 && num <= 199) {
    return { shape: 'triangle', width: 900, height: 780 };
  }

  // 211, 401-499 Informatívne (štvorec / obdĺžnik)
  if (code === '211' || (num >= 401 && num <= 499)) {
    return { shape: 'square', width: 500, height: 500 };
  }

  return { shape: 'other', width: 600, height: 600 };
}

// Category helper
function getCategory(num) {
  if (num >= 100 && num <= 199) return 'Výstražné';
  if (num >= 201 && num <= 215) return 'Prednosť';
  if (num >= 216 && num <= 299) return 'Zákazové';
  if (num >= 300 && num <= 399) return 'Príkazové';
  if (num >= 400 && num <= 499) return 'Informatívne';
  if (num >= 500 && num <= 599) return 'Dodatkové tabuľky';
  return 'Ostatné';
}

const signs = rawRows.map((row, index) => {
  const code = String(row['OZNACENIE'] || row['oznacenie'] || '').trim();
  const cislo = String(row['CISLO'] || row['cislo'] || code.split('-')[0]).trim();
  const name = String(row['TEXT'] || row['text'] || '').trim();
  const alt = String(row['ALT TEXT'] || row['alt text'] || row['ALT_TEXT'] || '').trim();
  const svgFileName = `${code}.svg`;
  const svgPath = `signs/${svgFileName}`;
  const num = parseInt(cislo, 10);
  const { shape, width, height } = getSignShapeAndSize(code, num);
  const category = getCategory(num);

  // Check if SVG exists in public/signs
  let svgContent = '';
  const svgFilePath = path.join(signsDir, svgFileName);
  if (fs.existsSync(svgFilePath)) {
    svgContent = fs.readFileSync(svgFilePath, 'utf-8');
  }

  return {
    id: `sign-${index + 1}-${code}`,
    code,
    number: cislo,
    name,
    alt,
    svgPath,
    shape,
    width,
    height,
    category,
    svgContent
  };
});

// Ensure directory exists
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

fs.writeFileSync(outputPath, JSON.stringify(signs, null, 2), 'utf-8');
console.log(`Dátový index úspešne vygenerovaný: ${outputPath} (${signs.length} značiek)`);

