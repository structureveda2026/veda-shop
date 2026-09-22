/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vedic: {
          primary: "#E9A331",
          gold: "#F5B041",
          accent: "#F4B843",
          bg: "#FAF6F0",
          card: "#FFF5DE",
          ivory: "#FAF6F0",
          offwhite: "#FFF5DE",
          beige: "#FFF5DE",
          charcoal: "#2C2C2C",
          dark: "#1A1A1A",
          brown: "#4D1217",
          maroon: "#6B1C23",
          maroonDark: "#3D0C10",
          goldLight: "#FFF5DE",
          goldDark: "#E9A331",
          muted: "#666666",
          sand: "#F4EFE6",
          goldDeep: "#9A6B14",
        }
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "DM Sans", "sans-serif"],
      },
      boxShadow: {
        'gold': '0 4px 20px -2px rgba(243, 208, 83, 0.35)',
        'card': '0 4px 15px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 12px 30px rgba(107, 28, 35, 0.12)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}