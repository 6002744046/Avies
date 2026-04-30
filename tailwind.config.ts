import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#09111f",
        night: "#0e1728",
        mist: "#f5f7fb",
        aqua: "#44d7c6",
        coral: "#ff7d64",
        saffron: "#f7c86f",
        leaf: "#74d680"
      },
      boxShadow: {
        glow: "0 0 42px rgba(68, 215, 198, 0.22)",
        panel: "0 24px 80px rgba(9, 17, 31, 0.16)"
      },
      backgroundImage: {
        "scan-grid":
          "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
