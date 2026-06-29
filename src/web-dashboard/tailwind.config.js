/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crowd_bg: '#121212',
        crowd_panel: 'rgba(20, 20, 20, 0.7)',
        crowd_green: '#4ade80',
        crowd_red: '#f87171',
        crowd_yellow: '#facc15'
      }
    },
  },
  plugins: [],
}
