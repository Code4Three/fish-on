/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"]
      },
      colors: {
        hull: {
          950: "#070B13",
          900: "#0B1220",
          800: "#111A2C",
          700: "#1A2740",
          600: "#26375A",
          500: "#33456A"
        },
        tide: {
          400: "#4ADE9C",
          500: "#22C58A",
          600: "#189669"
        }
      }
    }
  },
  plugins: []
};
