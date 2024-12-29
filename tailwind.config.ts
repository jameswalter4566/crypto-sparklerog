import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#F97316",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#FEC6A1",
          foreground: "#000000",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "#1C1C1C",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        launch: {
          "0%": { transform: "translateY(0) scale(1)" },
          "100%": { transform: "translateY(-1000px) scale(0.5)" },
        },
        flame: {
          "0%": { transform: "scaleY(1)" },
          "100%": { transform: "scaleY(1.5)" },
        },
        "glow-pulse": {
          "0%, 100%": { 
            boxShadow: "0 0 20px rgba(249,115,22,0.4), 0 0 40px rgba(249,115,22,0.2)"
          },
          "50%": { 
            boxShadow: "0 0 30px rgba(249,115,22,0.6), 0 0 60px rgba(249,115,22,0.3)"
          }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "price-glow-green": {
          "0%, 100%": { boxShadow: "0 0 15px rgba(34, 197, 94, 0.2)" },
          "50%": { boxShadow: "0 0 30px rgba(34, 197, 94, 0.4)" },
        },
        "price-glow-red": {
          "0%, 100%": { boxShadow: "0 0 15px rgba(239, 68, 68, 0.2)" },
          "50%": { boxShadow: "0 0 30px rgba(239, 68, 68, 0.4)" },
        },
        "logo-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "slide-left": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "slide-right": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "flash-yellow": {
          "0%, 100%": { backgroundColor: "transparent" },
          "50%": { backgroundColor: "rgba(234, 179, 8, 0.2)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "laser-glow": "laser-glow 2s ease-in-out infinite",
        "float": "float 10s ease-in-out infinite",
        "price-glow-green": "price-glow-green 2s ease-in-out infinite",
        "price-glow-red": "price-glow-red 2s ease-in-out infinite",
        "logo-spin": "logo-spin 1s ease-in-out",
        "flash-yellow": "flash-yellow 1s ease-in-out",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        menu: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
