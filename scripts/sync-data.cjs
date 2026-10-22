const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const XLSX = require('xlsx');

const excelPath = path.resolve(__dirname, '../data/ciselnik_znaciek.xlsx');
const outputPath = path.resolve(__dirname, '../src/data/signs.json');
const signsDir = path.resolve(__dirname, '../public/signs');
const publicDir = path.resolve(__dirname, '../public');
const rootDir = path.resolve(__dirname, '..');

// 1. Automatické rozbalenie znacky.zip ak existuje
fs.mkdirSync(signsDir, { recursive: true });

const possibleZips = [
  path.join(publicDir, 'znacky.zip'),
  path.join(publicDir, 'signs.zip'),
  path.join(rootDir, 'znacky.zip'),
  path.join(rootDir, 'signs.zip'),
  path.join(signsDir, 'znacky.zip'),
  path.join(signsDir, 'signs.zip')
];

for (const zipPath of possibleZips) {
  if (fs.existsSync(zipPath)) {
    console.log(`Nájdený ZIP archív ${zipPath}, rozbaľujem do ${signsDir}...`);
    try {
      // Rozbaliť súbory bez vnorených priečinkov priamo do signsDir
      execSync(`unzip -o -j "${zipPath}" "*.svg" -d "${signsDir}"`, { stdio: 'inherit' });
    } catch {
      try {
        execSync(`unzip -o "${zipPath}" -d "${signsDir}"`, { stdio: 'inherit' });
      } catch (err) {
        console.error(`Chyba pri rozbaľovaní ${zipPath}:`, err.message);
      }
    }
  }
}

// 2. Načítanie Excel číselníka (ak existuje a obsahuje riadky)
let excelMap = new Map();
if (fs.existsSync(excelPath)) {
  try {
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames.includes('data') ? 'data' : workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(sheet);
    console.log(`Načítaných ${rawRows.length} riadkov z Excel listu "${sheetName}"...`);

    for (const row of rawRows) {
      const code = String(row['OZNACENIE'] || row['oznacenie'] || '').trim();
      if (code) {
        excelMap.set(code, {
          code,
          number: String(row['CISLO'] || row['cislo'] || code.split('-')[0]).trim(),
          name: String(row['TEXT'] || row['text'] || '').trim(),
          alt: String(row['ALT TEXT'] || row['alt text'] || row['ALT_TEXT'] || '').trim()
        });
      }
    }
  } catch (err) {
    console.warn(`Nepodarilo sa načítať Excel súbor:`, err.message);
  }
}

// 3. Helper pre tvary a rozmery
function getSignShapeAndSize(code, num) {
  if (num >= 501 && num <= 599) {
    if (code === '507-10') return { shape: 'plate', width: 500, height: 250 };
    return { shape: 'plate', width: 500, height: 200 };
  }
  if (code === '210' || (num >= 230 && num <= 279) || (num >= 301 && num <= 315)) {
    return { shape: 'circle', width: 700, height: 700 };
  }
  if (code === '201') return { shape: 'triangle_inverted', width: 900, height: 780 };
  if (code === '202') return { shape: 'octagon', width: 900, height: 900 };
  if (code === '203' || code === '204') return { shape: 'diamond', width: 707, height: 707 };
  if (num >= 101 && num <= 199) return { shape: 'triangle', width: 900, height: 780 };
  if (code === '211' || (num >= 401 && num <= 499)) return { shape: 'square', width: 500, height: 500 };
  return { shape: 'other', width: 600, height: 600 };
}

function getCategory(num, code) {
  if (num >= 100 && num <= 199) return 'Výstražné';
  if (num >= 201 && num <= 215) return 'Prednosť';
  if (num >= 216 && num <= 299) return 'Zákazové';
  if (num >= 300 && num <= 399) return 'Príkazové';
  if (num >= 400 && num <= 499) return 'Informatívne';
  if (num >= 500 && num <= 599) return 'Dodatkové tabuľky';
  return 'Ostatné';
}

// 4. Prehľadanie reálnych súborov v public/signs/
const foundSvgFiles = fs.readdirSync(signsDir).filter((f) => f.toLowerCase().endsWith('.svg'));
console.log(`Nájdených ${foundSvgFiles.length} SVG súborov v ${signsDir}...`);

// Zoznam kódov: buď z Excelu alebo zo zoznamu existujúcich SVG súborov
const allCodes = new Set();
// Najskôr pridáme kódy z existujúcich SVG súborov
for (const svgFile of foundSvgFiles) {
  allCodes.add(svgFile.replace(/\.svg$/i, '').trim());
}
// Potom pridáme kódy z Excelu
for (const code of excelMap.keys()) {
  allCodes.add(code);
}

const signs = [];
let index = 0;

for (const code of Array.from(allCodes).sort()) {
  index++;
  const excelData = excelMap.get(code);
  const numStr = excelData?.number || code.split('-')[0] || '';
  const num = parseInt(numStr, 10);
  const name = excelData?.name || `Značka ${code}`;
  const alt = excelData?.alt || '';
  const svgFileName = `${code}.svg`;
  const svgPath = `signs/${svgFileName}`;
  const svgFilePath = path.join(signsDir, svgFileName);

  let svgContent = '';
  if (fs.existsSync(svgFilePath)) {
    svgContent = fs.readFileSync(svgFilePath, 'utf-8');
  }

  const { shape, width, height } = getSignShapeAndSize(code, num);
  const category = getCategory(num, code);

  signs.push({
    id: `sign-${index}-${code}`,
    code,
    number: numStr,
    name,
    alt,
    svgPath,
    shape,
    width,
    height,
    category,
    svgContent
  });
}

// Zápis do src/data/signs.json
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(signs, null, 2), 'utf-8');
console.log(`Dátový index úspešne vygenerovaný: ${outputPath} (${signs.length} značiek)`);
