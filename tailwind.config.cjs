const withAlpha = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: withAlpha('--c-base'),
        panel: withAlpha('--c-panel'),
        panel2: withAlpha('--c-panel2'),
        well: withAlpha('--c-well'),
        line: withAlpha('--c-line'),
        bone: withAlpha('--c-bone'),
        mute: withAlpha('--c-mute'),
        amber: withAlpha('--c-amber'),
        teal: withAlpha('--c-teal'),
        coral: withAlpha('--c-coral'),
        sky: withAlpha('--c-sky'),
      },
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
