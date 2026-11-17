/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,ts,json,md}',
    // classes toggled at runtime by the theme scripts
    './public/assets/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
