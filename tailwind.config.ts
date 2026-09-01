import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { cream: "#F4EADC", paper: "#F5F2ED", orange: "#E57A3A", mustard: "#F0B23E", leaf: "#7BA45B", brown: "#8C5A32", ink: "#3D3530", raspberry: "#C94A46" },
      fontFamily: { brand: ["var(--font-brand)"], display: ["var(--font-display)"], subtitle: ["var(--font-subtitle)"] },
    },
  },
  plugins: [],
};

export default config;
