/** @type {import('tailwindcss').Config} */
export default {
  // 1. Enable 'class' strategy for dark mode
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // You can add custom theme colors here
    },
  },
  plugins: [
    // 2. Add the line-clamp plugin (used in your ComplaintCard)
    require('@tailwindcss/line-clamp'),
  ],
}