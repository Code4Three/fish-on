import fs from "fs";
import path from "path";

import { buildSolunarDays } from "../builders/solunar.js";

const outputPath = path.join("src", "data", "solunar.json");
const days = buildSolunarDays();

fs.writeFileSync(
  outputPath,
  JSON.stringify({ days }, null, 2)
);

console.log("Solunar data written → src/data/solunar.json");