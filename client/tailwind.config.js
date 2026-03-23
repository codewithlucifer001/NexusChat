/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        discord: {
          bg: "#36393f",
          sidebar: "#2f3136",
          dark: "#202225",
          purple: "#5865f2",
          green: "#3ba55d",
          text: "#dcddde", // Primary text
          muted: "#72767d",
          input: "#40444b", // Input background
          hover: "#32353b", // Hover background for messages/buttons
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'gradient-xy': 'gradientXY 15s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        gradientXY: {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
      }
    },
  },
  plugins: [], // No custom plugins needed for now
}
