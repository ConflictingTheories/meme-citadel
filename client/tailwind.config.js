/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom AEGIS theme colors
        'aegis-purple': '#9333ea',
        'aegis-blue': '#3b82f6',
        'aegis-dark': '#0f172a',
      },
    },
  },
  plugins: [],
};
