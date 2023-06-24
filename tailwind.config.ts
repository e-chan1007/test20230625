import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./app.vue",
    "./**/*.vue",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ]
} as Config;
