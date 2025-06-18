/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        black: '#000000',
        slate: {
          900: '#181924',
          800: '#23263a',
          700: '#2d3146',
          600: '#3a3e5a',
        },
        purple: {
          500: '#a78bfa', // muted purple
          700: '#7c3aed',
        },
        neon: {
          pink: '#ff7ce5',
          blue: '#5eead4',
          yellow: '#f9d423',
        },
        accent: {
          sunset: '#f472b6',
          ocean: '#38bdf8',
          forest: '#34d399',
          night: '#a78bfa',
          peach: '#fdba74',
        },
      },
      borderColor: {
        sunset: '#f472b6',
        ocean: '#38bdf8',
        forest: '#34d399',
        night: '#a78bfa',
        peach: '#fdba74',
      },
    },
  },
  plugins: [],
} 