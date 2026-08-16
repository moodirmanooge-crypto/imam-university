/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B1F3A",
          50: "#EEF1F6",
          100: "#D3DAE8",
          200: "#A7B5D1",
          300: "#7A8FBA",
          400: "#4E6AA3",
          500: "#2A4680",
          600: "#193263",
          700: "#0B1F3A",
          800: "#08172C",
          900: "#050F1D",
          950: "#030A13",
        },
        gold: {
          DEFAULT: "#C9A24B",
          50: "#FBF6EA",
          100: "#F5EACB",
          200: "#EBD59B",
          300: "#E0BF6C",
          400: "#D5AC50",
          500: "#C9A24B",
          600: "#A67F35",
          700: "#7D5F28",
          800: "#54401B",
          900: "#2B200E",
        },
        parchment: "#F7F4EC",
        ink: "#1A1D23",
        sage: "#7A9A7E",
        rose: "#B5545A",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      backgroundImage: {
        "seal-radial":
          "radial-gradient(circle at 50% 50%, rgba(201,162,75,0.15) 0%, rgba(201,162,75,0) 70%)",
      },
    },
  },
  plugins: [],
};
