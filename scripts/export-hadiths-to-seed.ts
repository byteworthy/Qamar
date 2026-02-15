import * as fs from "fs";
import * as path from "path";

import {
  collectionsData,
  bukhariHadiths,
  muslimHadiths,
} from "../server/scripts/seed-hadiths";

import {
  abuDawudHadiths,
  tirmidhiHadiths,
  nasaiHadiths,
  ibnMajahHadiths,
} from "../server/scripts/hadith-data-part2";

const allHadiths = [
  ...bukhariHadiths,
  ...muslimHadiths,
  ...abuDawudHadiths,
  ...tirmidhiHadiths,
  ...nasaiHadiths,
  ...ibnMajahHadiths,
];

const output = {
  collections: collectionsData,
  hadiths: allHadiths,
};

const outputPath = path.resolve(__dirname, "../shared/seed-data/hadiths.json");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");

console.log(`Exported ${collectionsData.length} collections and ${allHadiths.length} hadiths to ${outputPath}`);
