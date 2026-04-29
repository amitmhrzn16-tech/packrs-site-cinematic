/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        packrs: {
          // Cyber-Logistics palette — Deep Navy + electric yellow & teal
          navy:     '#0A1B3D',  // brand primary — deep navy
          ink:      '#06112A',  // background base
          midnight: '#040A1A',

          // New brand pair
          yellow:   '#F1FF29',  // primary CTA, GPS pings, "PING!" markers
          teal:     '#29FFCA',  // accent text, hover states, link color
          glow:     '#F8FF82',  // emissive / soft highlight (paler yellow)

          // Back-compat aliases — primary is now teal, secondary is yellow.
          // Existing components keep their class names (packrs-orange / packrs-ember)
          // and resolve to the new brand pair.
          orange:   '#29FFCA',  // primary
          ember:    '#F1FF29',  // secondary / accent

          haze:     'rgba(255,255,255,0.06)',
        },
      },
      fontFamily: {
        // DM Sans across the board — clean, modern geometric sans.
        display: ['"DM Sans"', 'ui-sans-serif', 'system-ui'],
        body:    ['"DM Sans"', 'ui-sans-serif', 'system-ui'],
        sans:    ['"DM Sans"', 'ui-sans-serif', 'system-ui'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        wider2: '0.18em',
        wider3: '0.32em',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        // Primary glow is now teal, secondary glow is yellow.
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
