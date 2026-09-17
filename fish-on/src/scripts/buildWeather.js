import fs from "fs";
import path from "path";
import { buildWeatherData } from "../builders/weather.js";

const weather = await buildWeatherData();
const outputPath = path.join("src", "data", "weather.json");
fs.writeFileSync(outputPath, JSON.stringify(weather, null, 2));
console.log("Weather data written → src/data/weather.json");
