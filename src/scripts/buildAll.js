// Build source artifacts for development; the app composes runtime conditions in the browser.
await import("./buildTides.js");
await import("./buildSunMoon.js");
await import("./buildSolunar.js");
await import("./buildWeather.js");
await import("./buildUnified.js");
