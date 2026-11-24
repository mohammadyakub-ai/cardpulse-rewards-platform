/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F5F0E6",
        surface: "#FFFDF8",
        ink: "#14211C",
        muted: "#6B756E",
        line: "#E4DCCB",
        brand: {
          DEFAULT: "#0F5132",
          deep: "#0B3B25",
          soft: "#E7F0E9",
        },
        amber: "#C07A2C",
        coral: "#C4553B",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 33, 28, 0.04)",
        lift: "0 18px 40px -24px rgba(20, 33, 28, 0.35)",
        glow: "0 0 0 1px rgba(15, 81, 50, 0.08), 0 20px 50px -30px rgba(15, 81, 50, 0.45)",
      },
      keyframes: {
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.82)" },
        },
      },
      animation: {
        "rise-in": "rise-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
