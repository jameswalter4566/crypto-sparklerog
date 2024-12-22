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
          DEFAULT: "#9945FF",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#14F195",
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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
            boxShadow: "0 0 25px rgba(153,69,255,0.5)"
          },
          "50%": { 
            boxShadow: "0 0 50px rgba(153,69,255,0.9)"
          }
        },
        "text-glow": {
          "0%, 100%": {
            textShadow: "0 0 10px rgba(153,69,255,0.5)",
            color: "white"
          },
          "50%": {
            textShadow: "0 0 20px rgba(153,69,255,0.9)",
            color: "#9945FF"
          }
        },
        "laser-border": {
          "0%, 100%": {
            borderColor: "#9945FF",
            boxShadow: "0 0 10px #9945FF, inset 0 0 5px #9945FF"
          },
          "50%": {
            borderColor: "#8B5CF6",
            boxShadow: "0 0 20px #8B5CF6, inset 0 0 10px #8B5CF6"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-pulse": "glow-pulse 1.5s ease-in-out infinite",
        "text-glow": "text-glow 2s ease-in-out infinite",
        "laser-border": "laser-border 2s ease-in-out infinite"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        menu: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;