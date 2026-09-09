import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        carnect: {
          DEFAULT: "#0f3d2e",
          light: "#15533e",
          accent: "#d9a441",
        },
        navy: {
          bg: "#0a0e1a",
          surface: "#121829",
          surface2: "#181f35",
          border: "#232c44",
          text: "#f2f4f8",
          muted: "#8b93a7",
        },
        plate: {
          DEFAULT: "#f2b705",
          text: "#1a1305",
        },
      },
    },
  },
  plugins: [],
};

export default config;
