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
      },
    },
  },
  plugins: [],
};

export default config;
