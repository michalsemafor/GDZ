const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// 1. Definovanie dát číselníka značiek (podľa Vyhlášky 30/2020 Z.z. a TP 117 / VL 6.1)
const catalogData = [
  // Výstražné značky (100)
  {
    OZNACENIE: "101",
    CISLO: "101",
    TEXT: "Zákruta (vpravo)",
    "ALT TEXT": "Zatáčka vpravo, ohyb cesty doprava, nebezpečná zákruta"
  },
  {
    OZNACENIE: "102",
    CISLO: "102",
    TEXT: "Zákruta (vľavo)",
    "ALT TEXT": "Zatáčka vľavo, ohyb cesty doľava, nebezpečná zákruta"
  },
  {
    OZNACENIE: "110-10",
    CISLO: "110",
    TEXT: "Dvojitá zákruta (prvá vpravo)",
    "ALT TEXT": "Dvojitá zatáčka, prvá vpravo, kľukatá cesta, esíčko"
  },
  {
    OZNACENIE: "110-20",
    CISLO: "110",
    TEXT: "Dvojitá zákruta (prvá vľavo)",
    "ALT TEXT": "Dvojitá zatáčka, prvá vľavo, kľukatá cesta, esíčko"
  },
  {
    OZNACENIE: "120",
    CISLO: "120",
    TEXT: "Nebezpečné klesanie",
    "ALT TEXT": "Klesanie, strmý kopec dole, zjazd, padák"
  },
  {
    OZNACENIE: "121",
    CISLO: "121",
    TEXT: "Nebezpečné stúpanie",
    "ALT TEXT": "Stúpanie, strmý kopec hore, výstup"
  },
  {
    OZNACENIE: "131",
    CISLO: "131",
    TEXT: "Zúžená vozovka (z oboch strán)",
    "ALT TEXT": "Zúženie cesty, zúžená vozovka, lievik"
  },
  {
    OZNACENIE: "140",
    CISLO: "140",
    TEXT: "Nerovnosť vozovky",
    "ALT TEXT": "Hrbole, výtlky, retardér, spomaľovací prah, jama"
  },
  {
    OZNACENIE: "142",
    CISLO: "142",
    TEXT: "Práca na ceste",
    "ALT TEXT": "Práca, stavba, cestári, rozkopávka"
  },
  {
    OZNACENIE: "150",
    CISLO: "150",
    TEXT: "Chodci",
    "ALT TEXT": "Pozor chodci, ľudia, prechod, peší"
  },
  {
    OZNACENIE: "151",
    CISLO: "151",
    TEXT: "Deti",
    "ALT TEXT": "Pozor deti, škola, škôlka, ihrisko"
  },
  {
    OZNACENIE: "152",
    CISLO: "152",
    TEXT: "Cyklisti",
    "ALT TEXT": "Pozor bicykle, cyklisti na ceste"
  },
  {
    OZNACENIE: "153",
    CISLO: "153",
    TEXT: "Zver",
    "ALT TEXT": "Lesná zver, jelene, srnky, diviaky"
  },
  {
    OZNACENIE: "160",
    CISLO: "160",
    TEXT: "Svetelné signály",
    "ALT TEXT": "Semafor, semafory, svetelná križovatka"
  },
  {
    OZNACENIE: "170",
    CISLO: "170",
    TEXT: "Iné nebezpečenstvo",
    "ALT TEXT": "Výkričník, všeobecné nebezpečenstvo, pozor"
  },

  // Značky upravujúce prednosť (200)
  {
    OZNACENIE: "201",
    CISLO: "201",
    TEXT: "Daj prednosť v jazde!",
    "ALT TEXT": "Prednosť v jazde, trojuholník dole, vedľajšia cesta"
  },
  {
    OZNACENIE: "202",
    CISLO: "202",
    TEXT: "Stoj, daj prednosť v jazde!",
    "ALT TEXT": "STOP, stopka, oktagon, zastav, daj prednosť"
  },
  {
    OZNACENIE: "203",
    CISLO: "203",
    TEXT: "Hlavná cesta",
    "ALT TEXT": "Kosoštvorec, prednosť, žltý kosoštvorec"
  },
  {
    OZNACENIE: "204",
    CISLO: "204",
    TEXT: "Koniec hlavnej cesty",
    "ALT TEXT": "Preškrtnutá hlavná cesta, koniec prednosti"
  },
  {
    OZNACENIE: "210",
    CISLO: "210",
    TEXT: "Prednosť protiidúcich vozidiel",
    "ALT TEXT": "Prednosť protismeru, červená šípka, úzky prejazd"
  },
  {
    OZNACENIE: "211",
    CISLO: "211",
    TEXT: "Prednosť pred protiidúcimi vozidlami",
    "ALT TEXT": "Máš prednosť v zúžení, modrý štvorec s bielou šípkou"
  },

  // Zákazové značky (230-279)
  {
    OZNACENIE: "230",
    CISLO: "230",
    TEXT: "Zákaz vjazdu všetkých vozidiel v oboch smeroch",
    "ALT TEXT": "Zákaz vjazdu obojsmerne, biely kruh s červeným okrajom"
  },
  {
    OZNACENIE: "231",
    CISLO: "231",
    TEXT: "Zákaz vjazdu všetkých vozidiel",
    "ALT TEXT": "Jednosmerka, tehla, zákaz vjazdu v jednom smere"
  },
  {
    OZNACENIE: "232",
    CISLO: "232",
    TEXT: "Zákaz odbočovania vpravo",
    "ALT TEXT": "Zákaz odbočiť doprava"
  },
  {
    OZNACENIE: "233",
    CISLO: "233",
    TEXT: "Zákaz odbočovania vľavo",
    "ALT TEXT": "Zákaz odbočiť doľava"
  },
  {
    OZNACENIE: "234",
    CISLO: "234",
    TEXT: "Zákaz otáčania",
    "ALT TEXT": "Zákaz otočiť sa, zákaz otočenia do protismeru"
  },
  {
    OZNACENIE: "240",
    CISLO: "240",
    TEXT: "Zákaz vjazdu všetkých motorových vozidiel",
    "ALT TEXT": "Zákaz motoriek a áut, len peší a cyklisti"
  },
  {
    OZNACENIE: "241-10",
    CISLO: "241",
    TEXT: "Zákaz vjazdu nákladných automobilov",
    "ALT TEXT": "Zákaz kamiónov, nákladiakov, TIR"
  },
  {
    OZNACENIE: "242-10",
    CISLO: "242",
    TEXT: "Zákaz vjazdu bicyklov",
    "ALT TEXT": "Zákaz bicyklovania, zákaz cyklistov"
  },
  {
    OZNACENIE: "242-20",
    CISLO: "242",
    TEXT: "Zákaz vstupu chodcov",
    "ALT TEXT": "Zákaz peších, zákaz chodenia"
  },
  {
    OZNACENIE: "253-30",
    CISLO: "253",
    TEXT: "Najvyššia dovolená rýchlosť (30 km/h)",
    "ALT TEXT": "Rýchlosť 30, tridsiatka, obmedzenie rýchlosti 30"
  },
  {
    OZNACENIE: "253-50",
    CISLO: "253",
    TEXT: "Najvyššia dovolená rýchlosť (50 km/h)",
    "ALT TEXT": "Rýchlosť 50, päťdesiatka, obmedzenie rýchlosti 50"
  },
  {
    OZNACENIE: "253-70",
    CISLO: "253",
    TEXT: "Najvyššia dovolená rýchlosť (70 km/h)",
    "ALT TEXT": "Rýchlosť 70, sedemdesiatka, obmedzenie rýchlosti 70"
  },
  {
    OZNACENIE: "254",
    CISLO: "254",
    TEXT: "Koniec najvyššej dovolenej rýchlosti",
    "ALT TEXT": "Koniec obmedzenia rýchlosti, preškrtnutá rýchlosť"
  },
  {
    OZNACENIE: "260",
    CISLO: "260",
    TEXT: "Zákaz predchádzania",
    "ALT TEXT": "Zákaz predbiehania, červené a čierne auto"
  },
  {
    OZNACENIE: "270",
    CISLO: "270",
    TEXT: "Zákaz zastavenia",
    "ALT TEXT": "Zákaz státia aj zastavenia, modrý kruh, červený kríž X"
  },
  {
    OZNACENIE: "271",
    CISLO: "271",
    TEXT: "Zákaz státia",
    "ALT TEXT": "Zákaz parkovania, modrý kruh, červená šikmá čiara"
  },

  // Príkazové značky (300)
  {
    OZNACENIE: "301",
    CISLO: "301",
    TEXT: "Prikázaný smer jazdy priamo",
    "ALT TEXT": "Šípka rovno, len priamo, smer priamo"
  },
  {
    OZNACENIE: "302",
    CISLO: "302",
    TEXT: "Prikázaný smer jazdy vpravo",
    "ALT TEXT": "Šípka doprava, prikázané odbočenie vpravo"
  },
  {
    OZNACENIE: "303",
    CISLO: "303",
    TEXT: "Prikázaný smer jazdy vľavo",
    "ALT TEXT": "Šípka doľava, prikázané odbočenie vľavo"
  },
  {
    OZNACENIE: "305",
    CISLO: "305",
    TEXT: "Kruhový objazd",
    "ALT TEXT": "Kruháč, rondo, kruhový obeh"
  },
  {
    OZNACENIE: "311",
    CISLO: "311",
    TEXT: "Cestička pre chodcov",
    "ALT TEXT": "Chodník, pešia zóna, chodci"
  },
  {
    OZNACENIE: "312",
    CISLO: "312",
    TEXT: "Cestička pre cyklistov",
    "ALT TEXT": "Cyklotrasa, bicykel, cyklochodník"
  },
  {
    OZNACENIE: "313",
    CISLO: "313",
    TEXT: "Cestička pre chodcov a cyklistov",
    "ALT TEXT": "Zmiešaný pohyb chodcov a cyklistov"
  },

  // Informatívne značky (400)
  {
    OZNACENIE: "401",
    CISLO: "401",
    TEXT: "Parkovisko",
    "ALT TEXT": "Parkovanie, P, státie, parkovacie miesto"
  },
  {
    OZNACENIE: "411",
    CISLO: "411",
    TEXT: "Priechod pre chodcov",
    "ALT TEXT": "Prechod, zebra, chodec na zebre"
  },
  {
    OZNACENIE: "412",
    CISLO: "412",
    TEXT: "Priechod pre cyklistov",
    "ALT TEXT": "Cyklopriechod, bicyklový prechod"
  },
  {
    OZNACENIE: "420",
    CISLO: "420",
    TEXT: "Jednosmerná premávka",
    "ALT TEXT": "Jednosmerka, šípka rovno v modrom obdĺžniku"
  },
  {
    OZNACENIE: "430",
    CISLO: "430",
    TEXT: "Slepá cesta",
    "ALT TEXT": "Slepá ulica, neprejazdná cesta"
  },

  // Dodatkové tabuľky (500)
  {
    OZNACENIE: "501-10",
    CISLO: "501",
    TEXT: "Vzdialenosť (100 m)",
    "ALT TEXT": "O 100 m, vzdialenosť k značke, o 100 metrov"
  },
  {
    OZNACENIE: "502-10",
    CISLO: "502",
    TEXT: "Smerová šípka vpravo",
    "ALT TEXT": "Šípka doprava, platí vpravo, smer platnosti vpravo"
  },
  {
    OZNACENIE: "502-20",
    CISLO: "502",
    TEXT: "Smerová šípka vľavo",
    "ALT TEXT": "Šípka doľava, platí vľavo, smer platnosti vľavo"
  },
  {
    OZNACENIE: "503-10",
    CISLO: "503",
    TEXT: "Dĺžka úseku platnosti (500 m)",
    "ALT TEXT": "Úsek platnosti 500 m, v dĺžke 500m, šípky hore"
  },
  {
    OZNACENIE: "503-20",
    CISLO: "503",
    TEXT: "Začiatok úseku platnosti",
    "ALT TEXT": "Šípka hore, začiatok zákazu, odtiaľto"
  },
  {
    OZNACENIE: "503-21",
    CISLO: "503",
    TEXT: "Priebeh úseku platnosti",
    "ALT TEXT": "Obojstranná šípka, v priebehu, platí ďalej"
  },
  {
    OZNACENIE: "503-22",
    CISLO: "503",
    TEXT: "Koniec úseku platnosti",
    "ALT TEXT": "Šípka dole, koniec zákazu, potiaľto"
  },
  {
    OZNACENIE: "506-10",
    CISLO: "506",
    TEXT: "Okrem dopravnej obsluhy",
    "ALT TEXT": "Dopravná obsluha povolená, vjazd dopravnej obsluhy"
  },
  {
    OZNACENIE: "506-100",
    CISLO: "506",
    TEXT: "Okrem zásobovania",
    "ALT TEXT": "Zásobovanie povolené, vjazd zásobovania, okrem dovozu tovaru"
  },
  {
    OZNACENIE: "506-101",
    CISLO: "506",
    TEXT: "Len zásobovanie",
    "ALT TEXT": "Vyhradené pre zásobovanie, výhradne zásobovanie"
  },
  {
    OZNACENIE: "506-110",
    CISLO: "506",
    TEXT: "Okrem bicyklov",
    "ALT TEXT": "Cyklisti vjazd povolený, bicykle môžu, výnimka pre cyklistov"
  },
  {
    OZNACENIE: "506-120",
    CISLO: "506",
    TEXT: "Časové obmedzenie (7:00 – 17:00 h)",
    "ALT TEXT": "V čase od 7 do 17, pracovná doba, hodiny"
  },
  {
    OZNACENIE: "507-10",
    CISLO: "507",
    TEXT: "Odtiahnutie vozidla",
    "ALT TEXT": "Odťahová služba, auto na odťahovke, odťah"
  }
];

// Vytvorenie Excelu
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(catalogData);
XLSX.utils.book_append_sheet(wb, ws, "data");

const excelDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(excelDir)) fs.mkdirSync(excelDir, { recursive: true });
const excelPath = path.join(excelDir, 'ciselnik_znaciek.xlsx');
XLSX.writeFile(wb, excelPath);
console.log(`Excel vytvorený na: ${excelPath}`);

// 2. Vytvorenie vysoko kvalitných vektorových SVG v mierke 1:1 Veľkosť 2 (VL 6.1)
const signsDir = path.resolve(__dirname, '../public/signs');
if (!fs.existsSync(signsDir)) fs.mkdirSync(signsDir, { recursive: true });

// Paleta farieb STN / VL 6.1
const RED = "#D8232A";
const BLUE = "#00539B";
const YELLOW = "#FFD100";
const WHITE = "#FFFFFF";
const BLACK = "#1A1A1A";
const BORDER_BLACK = "#1A1A1A";

// Generátor SVG reťazcov
const svgs = {
  // 101 Zákruta vpravo (trojuholník 900x780 mm)
  "101": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 780" width="900" height="780">
  <path d="M 450 30 L 860 740 L 40 740 Z" fill="${WHITE}" stroke="${RED}" stroke-width="80" stroke-linejoin="round"/>
  <path d="M 410 630 L 410 460 Q 410 390 490 390 L 530 390 M 500 340 L 600 390 L 500 440 Z" fill="${BLACK}" stroke="${BLACK}" stroke-width="46" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

  // 102 Zákruta vľavo
  "102": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 780" width="900" height="780">
  <path d="M 450 30 L 860 740 L 40 740 Z" fill="${WHITE}" stroke="${RED}" stroke-width="80" stroke-linejoin="round"/>
  <path d="M 490 630 L 490 460 Q 490 390 410 390 L 370 390 M 400 340 L 300 390 L 400 440 Z" fill="${BLACK}" stroke="${BLACK}" stroke-width="46" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

  // 110-10 Dvojitá zákruta prvá vpravo
  "110-10": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 780" width="900" height="780">
  <path d="M 450 30 L 860 740 L 40 740 Z" fill="${WHITE}" stroke="${RED}" stroke-width="80" stroke-linejoin="round"/>
  <path d="M 370 630 L 370 540 Q 370 480 470 480 Q 550 480 550 420 L 550 360 M 500 380 L 550 310 L 600 380 Z" fill="${BLACK}" stroke="${BLACK}" stroke-width="42" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

  // 110-20 Dvojitá zákruta prvá vľavo
  "110-20": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 780" width="900" height="780">
  <path d="M 450 30 L 860 740 L 40 740 Z" fill="${WHITE}" stroke="${RED}" stroke-width="80" stroke-linejoin="round"/>
  <path d="M 530 630 L 530 540 Q 530 480 430 480 Q 350 480 350 420 L 350 360 M 400 380 L 350 310 L 300 380 Z" fill="${BLACK}" stroke="${BLACK}" stroke-width="42" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

  // 120 Nebezpečné klesanie
  "120": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 780" width="900" height="780">
  <path d="M 450 30 L 860 740 L 40 740 Z" fill="${WHITE}" stroke="${RED}" stroke-width="80" stroke-linejoin="round"/>
  <polygon points="250,560 650,650 250,650" fill="${BLACK}"/>
  <text x="360" y="520" font-family="'Inter', sans-serif" font-weight="900" font-size="70" fill="${BLACK}">10 %</text>
</svg>`,

  // 121 Nebezpečné stúpanie
  "121": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 780" width="900" height="780">
  <path d="M 450 30 L 860 740 L 40 740 Z" fill="${WHITE}" stroke="${RED}" stroke-width="80" stroke-linejoin="round"/>
  <polygon points="250,650 650,560 650,650" fill="${BLACK}"/>
  <text x="360" y="520" font-family="'Inter', sans-serif" font-weight="900" font-size="70" fill="${BLACK}">10 %</text>
</svg>`,

  // 131 Zúžená vozovka
  "131": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 780" width="900" height="780">
  <path d="M 450 30 L 860 740 L 40 740 Z" fill="${WHITE}" stroke="${RED}" stroke-width="80" stroke-linejoin="round"/>
  <path d="M 330 640 L 330 520 L 400 420 L 400 320" stroke="${BLACK}" stroke-width="40" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M 570 640 L 570 520 L 500 420 L 500 320" stroke="${BLACK}" stroke-width="40" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`,

  // 140 Nerovnosť vozovky
  "140": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 780" width="900" height="780">
  <path d="M 450 30 L 860 740 L 40 740 Z" fill="${WHITE}" stroke="${RED}" stroke-width="80" stroke-linejoin="round"/>
  <path d="M 230 580 C 290 580, 310 470, 380 470 C 440 470, 460 580, 520 580 C 580 580, 600 470, 670 470" fill="none" stroke="${BLACK}" stroke-width="38" stroke-linecap="round"/>
</svg>`,

  // 142 Práca na ceste
  "142": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 780" width="900" height="780">
  <path d="M 450 30 L 860 740 L 40 740 Z" fill="${WHITE}" stroke="${RED}" stroke-width="80" stroke-linejoin="round"/>
  <circle cx="490" cy="380" r="32" fill="${BLACK}"/>
  <line x1="490" y1="410" x2="450" y2="540" stroke="${BLACK}" stroke-width="30" stroke-linecap="round"/>
  <line x1="450" y1="540" x2="380" y2="650" stroke="${BLACK}" stroke-width="28" stroke-linecap="round"/>
  <line x1="450" y1="540" x2="520" y2="650" stroke="${BLACK}" stroke-width="28" stroke-linecap="round"/>
  <line x1="480" y1="450" x2="370" y2="550" stroke="${BLACK}" stroke-width="24" stroke-linecap="round"/>
  <line x1="370" y1="550" x2="330" y2="640" stroke="${BLACK}" stroke-width="18" stroke-linecap="round"/>
  <polygon points="310,640 350,640 330,670" fill="${BLACK}"/>
  <path d="M 270 660 Q 300 620 330 660 Z" fill="${BLACK}"/>
</svg>`,

  // 150 Chodci
  "150": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 780" width="900" height="780">
  <path d="M 450 30 L 860 740 L 40 740 Z" fill="${WHITE}" stroke="${RED}" stroke-width="80" stroke-linejoin="round"/>
  <circle cx="480" cy="340" r="36" fill="${BLACK}"/>
  <path d="M 470 380 L 430 490 L 360 540" stroke="${BLACK}" stroke-width="32" stroke-linecap="round" fill="none"/>
  <path d="M 445 450 L 520 530" stroke="${BLACK}" stroke-width="30" stroke-linecap="round" fill="none"/>
  <path d="M 430 490 L 470 650" stroke="${BLACK}" stroke-width="32" stroke-linecap="round" fill="none"/>
  <path d="M 430 490 L 380 650" stroke="${BLACK}" stroke-width="32" stroke-linecap="round" fill="none"/>
</svg>`,

  // 151 Deti
  "151": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 780" width="900" height="780">
  <path d="M 450 30 L 860 740 L 40 740 Z" fill="${WHITE}" stroke="${RED}" stroke-width="80" stroke-linejoin="round"/>
  <circle cx="390" cy="360" r="32" fill="${BLACK}"/>
  <path d="M 390 400 L 380 500 L 330 630" stroke="${BLACK}" stroke-width="26" stroke-linecap="round" fill="none"/>
  <path d="M 380 500 L 420 630" stroke="${BLACK}" stroke-width="26" stroke-linecap="round" fill="none"/>
  <circle cx="530" cy="420" r="26" fill="${BLACK}"/>
  <path d="M 530 450 L 520 540 L 490 640" stroke="${BLACK}" stroke-width="22" stroke-linecap="round" fill="none"/>
  <path d="M 520 540 L 550 640" stroke="${BLACK}" stroke-width="22" stroke-linecap="round" fill="none"/>
  <path d="M 390 440 L 460 480 L 525 470" stroke="${BLACK}" stroke-width="20" stroke-linecap="round" fill="none"/>
</svg>`,

  // 152 Cyklisti
  "152": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 780" width="900" height="780">
  <path d="M 450 30 L 860 740 L 40 740 Z" fill="${WHITE}" stroke="${RED}" stroke-width="80" stroke-linejoin="round"/>
  <circle cx="330" cy="560" r="65" stroke="${BLACK}" stroke-width="22" fill="none"/>
  <circle cx="570" cy="560" r="65" stroke="${BLACK}" stroke-width="22" fill="none"/>
  <circle cx="480" cy="380" r="25" fill="${BLACK}"/>
  <path d="M 330 560 L 430 560 L 510 470 L 420 470 Z" stroke="${BLACK}" stroke-width="18" fill="none"/>
  <path d="M 430 560 L 400 430 M 370 430 L 430 430" stroke="${BLACK}" stroke-width="18" stroke-linecap="round" fill="none"/>
  <path d="M 570 560 L 510 470 L 480 430 M 470 410 L 530 410" stroke="${BLACK}" stroke-width="18" stroke-linecap="round" fill="none"/>
</svg>`,

  // 153 Zver
  "153": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 780" width="900" height="780">
  <path d="M 450 30 L 860 740 L 40 740 Z" fill="${WHITE}" stroke="${RED}" stroke-width="80" stroke-linejoin="round"/>
  <path d="M 310 630 L 360 520 L 440 480 L 560 440 L 630 360 L 610 320 M 610 320 L 650 280 M 610 320 L 580 270 M 630 360 L 580 470 L 590 630 M 440 480 L 410 630" stroke="${BLACK}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`,

  // 160 Svetelné signály (semafor)
  "160": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 780" width="900" height="780">
  <path d="M 450 30 L 860 740 L 40 740 Z" fill="${WHITE}" stroke="${RED}" stroke-width="80" stroke-linejoin="round"/>
  <rect x="380" y="320" width="140" height="340" rx="30" fill="${BLACK}"/>
  <circle cx="450" cy="380" r="40" fill="${RED}"/>
  <circle cx="450" cy="490" r="40" fill="${YELLOW}"/>
  <circle cx="450" cy="600" r="40" fill="#00A859"/>
</svg>`,

  // 170 Iné nebezpečenstvo (výkričník)
  "170": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 780" width="900" height="780">
  <path d="M 450 30 L 860 740 L 40 740 Z" fill="${WHITE}" stroke="${RED}" stroke-width="80" stroke-linejoin="round"/>
  <rect x="420" y="330" width="60" height="200" rx="20" fill="${BLACK}"/>
  <circle cx="450" cy="590" r="32" fill="${BLACK}"/>
</svg>`,

  // 201 Daj prednosť v jazde! (trojuholník dole 900x780 mm)
  "201": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 780" width="900" height="780">
  <path d="M 40 40 L 860 40 L 450 750 Z" fill="${WHITE}" stroke="${RED}" stroke-width="80" stroke-linejoin="round"/>
</svg>`,

  // 202 Stoj, daj prednosť v jazde! (STOP oktagon 900x900 mm)
  "202": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900" width="900" height="900">
  <polygon points="263,25 637,25 875,263 875,637 637,875 263,875 25,637 25,263" fill="${RED}" stroke="${WHITE}" stroke-width="30"/>
  <text x="450" y="525" font-family="'Inter', 'Arial Black', sans-serif" font-weight="900" font-size="210" fill="${WHITE}" text-anchor="middle" letter-spacing="4">STOP</text>
</svg>`,

  // 203 Hlavná cesta (kosoštvorec 707x707 mm, vnútorný štvorec 500x500 pootočený)
  "203": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 707 707" width="707" height="707">
  <polygon points="353.5,20 687,353.5 353.5,687 20,353.5" fill="${WHITE}" stroke="${BORDER_BLACK}" stroke-width="12"/>
  <polygon points="353.5,120 587,353.5 353.5,587 120,353.5" fill="${YELLOW}"/>
</svg>`,

  // 204 Koniec hlavnej cesty
  "204": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 707 707" width="707" height="707">
  <polygon points="353.5,20 687,353.5 353.5,687 20,353.5" fill="${WHITE}" stroke="${BORDER_BLACK}" stroke-width="12"/>
  <polygon points="353.5,120 587,353.5 353.5,587 120,353.5" fill="${YELLOW}"/>
  <line x1="160" y1="547" x2="547" y2="160" stroke="${BLACK}" stroke-width="36"/>
</svg>`,

  // 210 Prednosť protiidúcich vozidiel (kruh 700x700 mm)
  "210": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="320" fill="${WHITE}" stroke="${RED}" stroke-width="60"/>
  <!-- Šípka vpravo (červená hore) -->
  <path d="M 430 500 L 430 250 M 370 300 L 430 220 L 490 300 Z" fill="${RED}" stroke="${RED}" stroke-width="26" stroke-linejoin="round"/>
  <!-- Šípka vľavo (čierna dole) -->
  <path d="M 270 220 L 270 470 M 210 420 L 270 500 L 330 420 Z" fill="${BLACK}" stroke="${BLACK}" stroke-width="34" stroke-linejoin="round"/>
</svg>`,

  // 211 Prednosť pred protiidúcimi vozidlami (štvorec 500x500 mm)
  "211": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <rect x="15" y="15" width="470" height="470" rx="40" fill="${BLUE}" stroke="${WHITE}" stroke-width="15"/>
  <!-- Biela šípka hore -->
  <path d="M 200 370 L 200 170 M 140 210 L 200 130 L 260 210 Z" fill="${WHITE}" stroke="${WHITE}" stroke-width="28" stroke-linejoin="round"/>
  <!-- Červená šípka dole -->
  <path d="M 310 160 L 310 320 M 265 285 L 310 350 L 355 285 Z" fill="${RED}" stroke="${RED}" stroke-width="22" stroke-linejoin="round"/>
</svg>`,

  // 230 Zákaz vjazdu všetkých vozidiel (kruh 700x700 mm)
  "230": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="320" fill="${WHITE}" stroke="${RED}" stroke-width="70"/>
</svg>`,

  // 231 Zákaz vjazdu (jednosmerka / no entry)
  "231": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="330" fill="${RED}"/>
  <rect x="110" y="300" width="480" height="100" rx="10" fill="${WHITE}"/>
</svg>`,

  // 232 Zákaz odbočovania vpravo
  "232": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="320" fill="${WHITE}" stroke="${RED}" stroke-width="70"/>
  <path d="M 300 480 L 300 340 Q 300 270 380 270 L 450 270 M 420 220 L 500 270 L 420 320 Z" fill="${BLACK}" stroke="${BLACK}" stroke-width="36" stroke-linejoin="round"/>
  <line x1="150" y1="550" x2="550" y2="150" stroke="${RED}" stroke-width="50"/>
</svg>`,

  // 233 Zákaz odbočovania vľavo
  "233": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="320" fill="${WHITE}" stroke="${RED}" stroke-width="70"/>
  <path d="M 400 480 L 400 340 Q 400 270 320 270 L 250 270 M 280 220 L 200 270 L 280 320 Z" fill="${BLACK}" stroke="${BLACK}" stroke-width="36" stroke-linejoin="round"/>
  <line x1="150" y1="550" x2="550" y2="150" stroke="${RED}" stroke-width="50"/>
</svg>`,

  // 234 Zákaz otáčania
  "234": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="320" fill="${WHITE}" stroke="${RED}" stroke-width="70"/>
  <path d="M 440 480 L 440 330 A 100 100 0 0 0 240 330 L 240 450 M 180 400 L 240 480 L 300 400 Z" fill="${BLACK}" stroke="${BLACK}" stroke-width="32" stroke-linejoin="round"/>
  <line x1="150" y1="550" x2="550" y2="150" stroke="${RED}" stroke-width="50"/>
</svg>`,

  // 240 Zákaz vjazdu motorových vozidiel
  "240": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="320" fill="${WHITE}" stroke="${RED}" stroke-width="70"/>
  <path d="M 240 440 L 460 440 L 430 360 L 270 360 Z" fill="${BLACK}"/>
  <circle cx="280" cy="460" r="32" fill="${BLACK}"/>
  <circle cx="420" cy="460" r="32" fill="${BLACK}"/>
</svg>`,

  // 241-10 Zákaz vjazdu nákladných automobilov
  "241-10": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="320" fill="${WHITE}" stroke="${RED}" stroke-width="70"/>
  <rect x="210" y="300" width="180" height="120" rx="8" fill="${BLACK}"/>
  <path d="M 390 340 L 460 340 L 470 380 L 470 420 L 390 420 Z" fill="${BLACK}"/>
  <circle cx="260" cy="440" r="30" fill="${BLACK}"/>
  <circle cx="430" cy="440" r="30" fill="${BLACK}"/>
</svg>`,

  // 242-10 Zákaz vjazdu bicyklov
  "242-10": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="320" fill="${WHITE}" stroke="${RED}" stroke-width="70"/>
  <circle cx="250" cy="380" r="55" stroke="${BLACK}" stroke-width="18" fill="none"/>
  <circle cx="450" cy="380" r="55" stroke="${BLACK}" stroke-width="18" fill="none"/>
  <path d="M 250 380 L 330 380 L 400 300 L 320 300 Z" stroke="${BLACK}" stroke-width="16" fill="none"/>
  <path d="M 330 380 L 310 270 M 285 270 L 335 270" stroke="${BLACK}" stroke-width="16" stroke-linecap="round" fill="none"/>
  <path d="M 450 380 L 400 300 L 380 260 M 365 250 L 415 250" stroke="${BLACK}" stroke-width="16" stroke-linecap="round" fill="none"/>
</svg>`,

  // 242-20 Zákaz vstupu chodcov
  "242-20": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="320" fill="${WHITE}" stroke="${RED}" stroke-width="70"/>
  <circle cx="370" cy="240" r="34" fill="${BLACK}"/>
  <path d="M 360 280 L 330 380 L 270 430" stroke="${BLACK}" stroke-width="28" stroke-linecap="round" fill="none"/>
  <path d="M 340 350 L 410 420" stroke="${BLACK}" stroke-width="26" stroke-linecap="round" fill="none"/>
  <path d="M 330 380 L 370 510" stroke="${BLACK}" stroke-width="28" stroke-linecap="round" fill="none"/>
  <path d="M 330 380 L 290 510" stroke="${BLACK}" stroke-width="28" stroke-linecap="round" fill="none"/>
  <line x1="150" y1="550" x2="550" y2="150" stroke="${RED}" stroke-width="50"/>
</svg>`,

  // 253-30 Rýchlosť 30 km/h
  "253-30": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="320" fill="${WHITE}" stroke="${RED}" stroke-width="70"/>
  <text x="350" y="445" font-family="'Inter', sans-serif" font-weight="900" font-size="270" fill="${BLACK}" text-anchor="middle" letter-spacing="-6">30</text>
</svg>`,

  // 253-50 Rýchlosť 50 km/h
  "253-50": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="320" fill="${WHITE}" stroke="${RED}" stroke-width="70"/>
  <text x="350" y="445" font-family="'Inter', sans-serif" font-weight="900" font-size="270" fill="${BLACK}" text-anchor="middle" letter-spacing="-6">50</text>
</svg>`,

  // 253-70 Rýchlosť 70 km/h
  "253-70": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="320" fill="${WHITE}" stroke="${RED}" stroke-width="70"/>
  <text x="350" y="445" font-family="'Inter', sans-serif" font-weight="900" font-size="270" fill="${BLACK}" text-anchor="middle" letter-spacing="-6">70</text>
</svg>`,

  // 254 Koniec najvyššej dovolenej rýchlosti
  "254": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="320" fill="${WHITE}" stroke="${BLACK}" stroke-width="20"/>
  <text x="350" y="445" font-family="'Inter', sans-serif" font-weight="900" font-size="270" fill="#888888" text-anchor="middle" letter-spacing="-6">50</text>
  <line x1="160" y1="540" x2="540" y2="160" stroke="${BLACK}" stroke-width="22"/>
  <line x1="180" y1="560" x2="560" y2="180" stroke="${BLACK}" stroke-width="22"/>
  <line x1="140" y1="520" x2="520" y2="140" stroke="${BLACK}" stroke-width="22"/>
</svg>`,

  // 260 Zákaz predchádzania
  "260": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="320" fill="${WHITE}" stroke="${RED}" stroke-width="70"/>
  <!-- Ľavé auto (červené) -->
  <path d="M 220 400 L 320 400 L 305 340 L 235 340 Z" fill="${RED}"/>
  <circle cx="245" cy="415" r="16" fill="${RED}"/>
  <circle cx="295" cy="415" r="16" fill="${RED}"/>
  <!-- Pravé auto (čierne) -->
  <path d="M 380 400 L 480 400 L 465 340 L 395 340 Z" fill="${BLACK}"/>
  <circle cx="405" cy="415" r="16" fill="${BLACK}"/>
  <circle cx="455" cy="415" r="16" fill="${BLACK}"/>
</svg>`,

  // 270 Zákaz zastavenia (kruh 700x700 mm)
  "270": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="320" fill="${BLUE}" stroke="${RED}" stroke-width="70"/>
  <line x1="124" y1="124" x2="576" y2="576" stroke="${RED}" stroke-width="70"/>
  <line x1="124" y1="576" x2="576" y2="124" stroke="${RED}" stroke-width="70"/>
</svg>`,

  // 271 Zákaz státia (kruh 700x700 mm)
  "271": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="320" fill="${BLUE}" stroke="${RED}" stroke-width="70"/>
  <line x1="124" y1="576" x2="576" y2="124" stroke="${RED}" stroke-width="70"/>
</svg>`,

  // 301 Prikázaný smer priamo (kruh 700x700 mm)
  "301": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="330" fill="${BLUE}" stroke="${WHITE}" stroke-width="12"/>
  <path d="M 350 540 L 350 250 M 240 310 L 350 170 L 460 310 Z" fill="${WHITE}" stroke="${WHITE}" stroke-width="36" stroke-linejoin="round"/>
</svg>`,

  // 302 Prikázaný smer vpravo
  "302": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="330" fill="${BLUE}" stroke="${WHITE}" stroke-width="12"/>
  <path d="M 260 480 L 260 380 Q 260 280 360 280 L 450 280 M 410 210 L 520 280 L 410 350 Z" fill="${WHITE}" stroke="${WHITE}" stroke-width="34" stroke-linejoin="round"/>
</svg>`,

  // 303 Prikázaný smer vľavo
  "303": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="330" fill="${BLUE}" stroke="${WHITE}" stroke-width="12"/>
  <path d="M 440 480 L 440 380 Q 440 280 340 280 L 250 280 M 290 210 L 180 280 L 290 350 Z" fill="${WHITE}" stroke="${WHITE}" stroke-width="34" stroke-linejoin="round"/>
</svg>`,

  // 305 Kruhový objazd
  "305": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="330" fill="${BLUE}" stroke="${WHITE}" stroke-width="12"/>
  <!-- 3 šípky v kruhu -->
  <g transform="translate(350,350)">
    <g transform="rotate(0)">
      <path d="M 0,-180 A 180 180 0 0 1 155,-90" fill="none" stroke="${WHITE}" stroke-width="30" stroke-linecap="round"/>
      <polygon points="175,-115 175,-65 130,-80" fill="${WHITE}"/>
    </g>
    <g transform="rotate(120)">
      <path d="M 0,-180 A 180 180 0 0 1 155,-90" fill="none" stroke="${WHITE}" stroke-width="30" stroke-linecap="round"/>
      <polygon points="175,-115 175,-65 130,-80" fill="${WHITE}"/>
    </g>
    <g transform="rotate(240)">
      <path d="M 0,-180 A 180 180 0 0 1 155,-90" fill="none" stroke="${WHITE}" stroke-width="30" stroke-linecap="round"/>
      <polygon points="175,-115 175,-65 130,-80" fill="${WHITE}"/>
    </g>
  </g>
</svg>`,

  // 311 Cestička pre chodcov
  "311": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="330" fill="${BLUE}" stroke="${WHITE}" stroke-width="12"/>
  <circle cx="370" cy="220" r="40" fill="${WHITE}"/>
  <path d="M 360 270 L 325 390 L 260 450" stroke="${WHITE}" stroke-width="36" stroke-linecap="round" fill="none"/>
  <path d="M 335 350 L 415 435" stroke="${WHITE}" stroke-width="32" stroke-linecap="round" fill="none"/>
  <path d="M 325 390 L 375 550" stroke="${WHITE}" stroke-width="36" stroke-linecap="round" fill="none"/>
  <path d="M 325 390 L 275 550" stroke="${WHITE}" stroke-width="36" stroke-linecap="round" fill="none"/>
</svg>`,

  // 312 Cestička pre cyklistov
  "312": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="330" fill="${BLUE}" stroke="${WHITE}" stroke-width="12"/>
  <circle cx="230" cy="380" r="65" stroke="${WHITE}" stroke-width="22" fill="none"/>
  <circle cx="470" cy="380" r="65" stroke="${WHITE}" stroke-width="22" fill="none"/>
  <path d="M 230 380 L 330 380 L 410 290 L 320 290 Z" stroke="${WHITE}" stroke-width="18" fill="none"/>
  <path d="M 330 380 L 300 250 M 270 250 L 330 250" stroke="${WHITE}" stroke-width="18" stroke-linecap="round" fill="none"/>
  <path d="M 470 380 L 410 290 L 380 240 M 365 230 L 425 230" stroke="${WHITE}" stroke-width="18" stroke-linecap="round" fill="none"/>
</svg>`,

  // 313 Cestička pre chodcov a cyklistov
  "313": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">
  <circle cx="350" cy="350" r="330" fill="${BLUE}" stroke="${WHITE}" stroke-width="12"/>
  <line x1="100" y1="350" x2="600" y2="350" stroke="${WHITE}" stroke-width="16"/>
  <!-- Hore chodec -->
  <circle cx="370" cy="180" r="26" fill="${WHITE}"/>
  <path d="M 360 210 L 340 270 L 300 310" stroke="${WHITE}" stroke-width="22" stroke-linecap="round" fill="none"/>
  <path d="M 340 270 L 370 340" stroke="${WHITE}" stroke-width="22" stroke-linecap="round" fill="none"/>
  <!-- Dole bicykel -->
  <circle cx="260" cy="520" r="46" stroke="${WHITE}" stroke-width="16" fill="none"/>
  <circle cx="440" cy="520" r="46" stroke="${WHITE}" stroke-width="16" fill="none"/>
  <path d="M 260 520 L 330 520 L 390 460 L 320 460 Z" stroke="${WHITE}" stroke-width="14" fill="none"/>
</svg>`,

  // 401 Parkovisko (štvorec 500x500 mm)
  "401": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <rect x="15" y="15" width="470" height="470" rx="40" fill="${BLUE}" stroke="${WHITE}" stroke-width="16"/>
  <text x="250" y="365" font-family="'Inter', sans-serif" font-weight="900" font-size="340" fill="${WHITE}" text-anchor="middle">P</text>
</svg>`,

  // 411 Priechod pre chodcov
  "411": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <rect x="15" y="15" width="470" height="470" rx="40" fill="${BLUE}" stroke="${WHITE}" stroke-width="16"/>
  <polygon points="250,55 435,420 65,420" fill="${WHITE}"/>
  <!-- Zebra pruhy -->
  <line x1="140" y1="390" x2="360" y2="390" stroke="${BLACK}" stroke-width="12" stroke-dasharray="24 16"/>
  <circle cx="270" cy="180" r="28" fill="${BLACK}"/>
  <path d="M 265 215 L 235 305 L 185 350" stroke="${BLACK}" stroke-width="24" stroke-linecap="round" fill="none"/>
  <path d="M 245 270 L 305 330" stroke="${BLACK}" stroke-width="22" stroke-linecap="round" fill="none"/>
  <path d="M 235 305 L 275 410" stroke="${BLACK}" stroke-width="24" stroke-linecap="round" fill="none"/>
  <path d="M 235 305 L 195 410" stroke="${BLACK}" stroke-width="24" stroke-linecap="round" fill="none"/>
</svg>`,

  // 412 Priechod pre cyklistov
  "412": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <rect x="15" y="15" width="470" height="470" rx="40" fill="${BLUE}" stroke="${WHITE}" stroke-width="16"/>
  <!-- Zebra štvorce -->
  <line x1="80" y1="390" x2="420" y2="390" stroke="${WHITE}" stroke-width="20" stroke-dasharray="30 20"/>
  <circle cx="170" cy="270" r="48" stroke="${WHITE}" stroke-width="16" fill="none"/>
  <circle cx="330" cy="270" r="48" stroke="${WHITE}" stroke-width="16" fill="none"/>
  <path d="M 170 270 L 240 270 L 290 200 L 225 200 Z" stroke="${WHITE}" stroke-width="14" fill="none"/>
</svg>`,

  // 420 Jednosmerná premávka (štvorec 500x500 mm)
  "420": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <rect x="15" y="15" width="470" height="470" rx="40" fill="${BLUE}" stroke="${WHITE}" stroke-width="16"/>
  <path d="M 250 400 L 250 180 M 160 230 L 250 110 L 340 230 Z" fill="${WHITE}" stroke="${WHITE}" stroke-width="28" stroke-linejoin="round"/>
</svg>`,

  // 430 Slepá cesta
  "430": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <rect x="15" y="15" width="470" height="470" rx="40" fill="${BLUE}" stroke="${WHITE}" stroke-width="16"/>
  <rect x="220" y="190" width="60" height="230" fill="${WHITE}"/>
  <rect x="140" y="130" width="220" height="60" fill="${RED}"/>
</svg>`,

  // 501-10 Dodatková tabuľka: Vzdialenosť (100 m) (500x200 mm)
  "501-10": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="500" height="200">
  <rect x="6" y="6" width="488" height="188" rx="20" fill="${WHITE}" stroke="${BLACK}" stroke-width="10"/>
  <text x="250" y="132" font-family="'Inter', sans-serif" font-weight="800" font-size="82" fill="${BLACK}" text-anchor="middle" letter-spacing="1">100 m</text>
</svg>`,

  // 502-10 Smerová šípka vpravo
  "502-10": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="500" height="200">
  <rect x="6" y="6" width="488" height="188" rx="20" fill="${WHITE}" stroke="${BLACK}" stroke-width="10"/>
  <path d="M 120 100 L 330 100 M 290 60 L 380 100 L 290 140 Z" fill="${BLACK}" stroke="${BLACK}" stroke-width="18" stroke-linejoin="round"/>
</svg>`,

  // 502-20 Smerová šípka vľavo
  "502-20": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="500" height="200">
  <rect x="6" y="6" width="488" height="188" rx="20" fill="${WHITE}" stroke="${BLACK}" stroke-width="10"/>
  <path d="M 380 100 L 170 100 M 210 60 L 120 100 L 210 140 Z" fill="${BLACK}" stroke="${BLACK}" stroke-width="18" stroke-linejoin="round"/>
</svg>`,

  // 503-10 Úsek platnosti (500 m so šípkami)
  "503-10": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="500" height="200">
  <rect x="6" y="6" width="488" height="188" rx="20" fill="${WHITE}" stroke="${BLACK}" stroke-width="10"/>
  <path d="M 60 140 L 60 70 M 45 85 L 60 55 L 75 85 Z" fill="${BLACK}" stroke="${BLACK}" stroke-width="6" stroke-linejoin="round"/>
  <text x="250" y="130" font-family="'Inter', sans-serif" font-weight="800" font-size="76" fill="${BLACK}" text-anchor="middle">500 m</text>
  <path d="M 440 140 L 440 70 M 425 85 L 440 55 L 455 85 Z" fill="${BLACK}" stroke="${BLACK}" stroke-width="6" stroke-linejoin="round"/>
</svg>`,

  // 503-20 Začiatok úseku platnosti (šípka hore)
  "503-20": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="500" height="200">
  <rect x="6" y="6" width="488" height="188" rx="20" fill="${WHITE}" stroke="${BLACK}" stroke-width="10"/>
  <path d="M 250 155 L 250 65 M 205 95 L 250 45 L 295 95 Z" fill="${BLACK}" stroke="${BLACK}" stroke-width="18" stroke-linejoin="round"/>
</svg>`,

  // 503-21 Priebeh úseku platnosti (obojstranná šípka hore aj dole)
  "503-21": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="500" height="200">
  <rect x="6" y="6" width="488" height="188" rx="20" fill="${WHITE}" stroke="${BLACK}" stroke-width="10"/>
  <path d="M 250 145 L 250 55 M 215 80 L 250 45 L 285 80 Z M 215 120 L 250 155 L 285 120 Z" fill="${BLACK}" stroke="${BLACK}" stroke-width="16" stroke-linejoin="round"/>
</svg>`,

  // 503-22 Koniec úseku platnosti (šípka dole)
  "503-22": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="500" height="200">
  <rect x="6" y="6" width="488" height="188" rx="20" fill="${WHITE}" stroke="${BLACK}" stroke-width="10"/>
  <path d="M 250 45 L 250 135 M 205 105 L 250 155 L 295 105 Z" fill="${BLACK}" stroke="${BLACK}" stroke-width="18" stroke-linejoin="round"/>
</svg>`,

  // 506-10 Okrem dopravnej obsluhy
  "506-10": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="500" height="200">
  <rect x="6" y="6" width="488" height="188" rx="20" fill="${WHITE}" stroke="${BLACK}" stroke-width="10"/>
  <text x="250" y="85" font-family="'Inter', sans-serif" font-weight="700" font-size="44" fill="${BLACK}" text-anchor="middle">Okrem</text>
  <text x="250" y="145" font-family="'Inter', sans-serif" font-weight="700" font-size="44" fill="${BLACK}" text-anchor="middle">dopravnej obsluhy</text>
</svg>`,

  // 506-100 Okrem zásobovania
  "506-100": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="500" height="200">
  <rect x="6" y="6" width="488" height="188" rx="20" fill="${WHITE}" stroke="${BLACK}" stroke-width="10"/>
  <text x="250" y="85" font-family="'Inter', sans-serif" font-weight="700" font-size="44" fill="${BLACK}" text-anchor="middle">Okrem</text>
  <text x="250" y="145" font-family="'Inter', sans-serif" font-weight="700" font-size="44" fill="${BLACK}" text-anchor="middle">zásobovania</text>
</svg>`,

  // 506-101 Len zásobovanie
  "506-101": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="500" height="200">
  <rect x="6" y="6" width="488" height="188" rx="20" fill="${WHITE}" stroke="${BLACK}" stroke-width="10"/>
  <text x="250" y="85" font-family="'Inter', sans-serif" font-weight="700" font-size="44" fill="${BLACK}" text-anchor="middle">Len</text>
  <text x="250" y="145" font-family="'Inter', sans-serif" font-weight="700" font-size="44" fill="${BLACK}" text-anchor="middle">zásobovanie</text>
</svg>`,

  // 506-110 Okrem bicyklov
  "506-110": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="500" height="200">
  <rect x="6" y="6" width="488" height="188" rx="20" fill="${WHITE}" stroke="${BLACK}" stroke-width="10"/>
  <text x="180" y="118" font-family="'Inter', sans-serif" font-weight="700" font-size="48" fill="${BLACK}" text-anchor="middle">Okrem</text>
  <g transform="translate(290, 45) scale(0.65)">
    <circle cx="50" cy="80" r="38" stroke="${BLACK}" stroke-width="12" fill="none"/>
    <circle cx="170" cy="80" r="38" stroke="${BLACK}" stroke-width="12" fill="none"/>
    <path d="M 50 80 L 105 80 L 145 35 L 90 35 Z" stroke="${BLACK}" stroke-width="10" fill="none"/>
    <path d="M 105 80 L 85 15 M 70 15 L 100 15" stroke="${BLACK}" stroke-width="10" stroke-linecap="round" fill="none"/>
    <path d="M 170 80 L 145 35 L 130 5 M 118 0 L 152 0" stroke="${BLACK}" stroke-width="10" stroke-linecap="round" fill="none"/>
  </g>
</svg>`,

  // 506-120 Časové obmedzenie (7:00 – 17:00 h)
  "506-120": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="500" height="200">
  <rect x="6" y="6" width="488" height="188" rx="20" fill="${WHITE}" stroke="${BLACK}" stroke-width="10"/>
  <text x="250" y="85" font-family="'Inter', sans-serif" font-weight="700" font-size="38" fill="${BLACK}" text-anchor="middle">v pracovných dňoch</text>
  <text x="250" y="145" font-family="'Inter', sans-serif" font-weight="800" font-size="48" fill="${BLACK}" text-anchor="middle">7:00 – 17:00 h</text>
</svg>`,

  // 507-10 Odtiahnutie vozidla (500x250 mm)
  "507-10": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 250" width="500" height="250">
  <rect x="6" y="6" width="488" height="238" rx="20" fill="${WHITE}" stroke="${BLACK}" stroke-width="10"/>
  <!-- Odťahovka -->
  <path d="M 60 170 L 160 170 L 190 120 L 260 120 L 270 170 L 440 170" stroke="${BLACK}" stroke-width="12" fill="none"/>
  <rect x="70" y="120" width="80" height="50" fill="${BLACK}"/>
  <circle cx="100" cy="180" r="20" fill="${BLACK}"/>
  <circle cx="230" cy="180" r="20" fill="${BLACK}"/>
  <!-- Rameno žeriavu s autom -->
  <line x1="260" y1="120" x2="340" y2="70" stroke="${BLACK}" stroke-width="14"/>
  <line x1="340" y1="70" x2="360" y2="100" stroke="${BLACK}" stroke-width="6"/>
  <!-- Zavesené auto -->
  <path d="M 330 140 L 410 140 L 395 110 L 345 110 Z" fill="${BLACK}"/>
  <circle cx="345" cy="148" r="10" fill="${BLACK}"/>
  <circle cx="395" cy="148" r="10" fill="${BLACK}"/>
</svg>`
};

// Zápis SVG súborov
let writtenCount = 0;
for (const [code, svgContent] of Object.entries(svgs)) {
  const filePath = path.join(signsDir, `${code}.svg`);
  fs.writeFileSync(filePath, svgContent.trim(), 'utf-8');
  writtenCount++;
}

console.log(`Vytvorených ${writtenCount} SVG súborov v: ${signsDir}`);
