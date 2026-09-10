import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          950: "#060F1E",
          900: "#0B1F3B",
          800: "#0D2847",
          700: "#123A63",
          600: "#1A4D7A",
          500: "#2F5D8C",
          400: "#4A78A8",
          100: "#C9D6E5",
          50: "#F2F5F8"
        },
        accent: {
          900: "#064E3B",
          700: "#0F766E",
          500: "#10B981",
          300: "#34D399",
          100: "#A7F3D0",
          50: "#ECFDF5"
        },
        warn: {
          700: "#B45309",
          600: "#D97706",
          100: "#FEF3C7",
          50: "#FFFBEB"
        },
        danger: {
          700: "#B91C1C",
          600: "#DC2626",
          100: "#FEE2E2",
          50: "#FFF5F5"
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#E8EEF4",
          page: "#F7F9FB"
        },
        ink: {
          DEFAULT: "#0B1F3B",
          muted: "#64748B",
          border: "#D9E1EA"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"]
      },
      boxShadow: {
        soft: "0 20px 60px -32px rgba(11, 31, 59, 0.32)",
        card: "0 12px 32px -20px rgba(11, 31, 59, 0.24)"
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at 78% 20%, rgba(16,185,129,.16), transparent 34%), radial-gradient(circle at 8% 30%, rgba(74,120,168,.12), transparent 28%)"
      }
    }
  },
  plugins: []
};

export default config;
