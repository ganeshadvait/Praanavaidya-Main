import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,ts,json,md}',
    // classes toggled at runtime by the theme scripts
    './public/assets/**/*.js',
  ],
  // WordPress block classes used inside blog posts, which are fetched from WordPress at build
  // time (src/lib/wordpress.ts) and so are not in any file Tailwind scans.
  safelist: [
    'aligncenter', 'alignleft', 'alignright', 'is-layout-flow', 'wp-block-image', 'wp-block-quote',
    'wp-block-separator', 'wp-block-table', 'has-fixed-layout', 'has-palette-color-1-color', 'has-palette-color-2-color',
  ],
  theme: {
    // the old theme centred .container (margin: 0 auto)
    container: { center: true },
    extend: {
      fontFamily: {
        // DMSans is self-hosted (see @font-face in src/styles/tailwind.css)
        sans: ['DMSans', 'sans-serif'],
        // the old theme's system stack, still used by labels, forms buttons and post meta
        system: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"'],
      },
      colors: {
        brand: {
          DEFAULT: '#0595C4',
          light: '#5AD6FF',
          footer: '#0097c4',
        },
        cream: '#FFF7F1',
        // old Blocksy palette, still referenced by post content and base styles
        palette: {
          1: '#2872fa',
          2: '#1559ed',
          3: '#3A4F66',
          4: '#192a3d',
          5: '#e1e8ed',
        },
      },
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-out': { from: { opacity: '1' }, to: { opacity: '0' } },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pop-out': {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.5)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
        'fade-in-up-slow': 'fade-in-up 0.5s ease forwards',
        marquee: 'marquee 18s linear infinite',
        'fade-in': 'fade-in 0.4s ease forwards',
        'fade-out': 'fade-out 0.4s ease forwards',
        'pop-in': 'pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'pop-out': 'pop-out 0.35s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'back-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        // hide scrollbars on horizontal scrollers
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      });
    }),
  ],
};
