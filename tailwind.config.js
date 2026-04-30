/** @type {import('tailwindcss').Config} */
export default {
  content: ['./resources/views/**/*.blade.php', './resources/js/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        packrs: {
          navy: '#0A1B3D',
          ink: '#06112A',
          midnight: '#040A1A',
          yellow: '#F1FF29',
          teal: '#29FFCA',
          glow: '#F8FF82',
          orange: '#29FFCA',
          ember: '#F1FF29',
          haze: 'rgba(255,255,255,0.06)',
        },
      },
      fontFamily: {
        display: ['"DM Sans"', 'ui-sans-serif', 'system-ui'],
        body: ['"DM Sans"', 'ui-sans-serif', 'system-ui'],
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        wider2: '0.18em',
        wider3: '0.32em',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glow: '0 0 60px rgba(41,255,202,0.35)',
        glowSoft: '0 0 32px rgba(41,255,202,0.22)',
        glowYellow: '0 0 60px rgba(241,255,41,0.30)',
        glass: '0 8px 32px rgba(0,0,0,0.4)',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0.6)', opacity: '0.8' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseTrail: {
          '0%,100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        ripple: 'ripple 1.6s ease-out infinite',
        floaty: 'floaty 4s ease-in-out infinite',
        pulseTrail: 'pulseTrail 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
