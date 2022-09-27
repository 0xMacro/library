const colors = require('tailwindcss/colors')
const defaultTheme = require('tailwindcss/defaultTheme')

//
// Exported from https://palettte.app
// You can also copy/paste to import and edit
//
// 1AACEB
const exportedColors = [
  {
    "paletteName": "Primary",
    "swatches": [
      {
        "name": "blue-900",
        "color": "1C5D7B"
      },
      {
        "name": "blue-800",
        "color": "1B79A3"
      },
      {
        "name": "blue-700",
        "color": "1B92C5"
      },
      {
        "name": "blue-600",
        "color": "1AA1DC"
      },
      {
        "name": "blue-500",
        "color": "1AACEB"
      },
      {
        "name": "blue-400",
        "color": "66C9F3"
      },
      {
        "name": "blue-300",
        "color": "A9E0F7"
      },
      {
        "name": "blue-200",
        "color": "D4EEF9"
      },
      {
        "name": "blue-100",
        "color": "F5F8F9"
      }
    ]
  },
  {
    "paletteName": "Teals",
    "swatches": [
      {
        "name": "teal-900",
        "color": "3B8F84"
      },
      {
        "name": "teal-800",
        "color": "3BA99B"
      },
      {
        "name": "teal-700",
        "color": "3BBFAD"
      },
      {
        "name": "teal-600",
        "color": "3BD2BE"
      },
      {
        "name": "teal-500",
        "color": "3DE0CB"
      },
      {
        "name": "teal-400",
        "color": "51EDD8"
      },
      {
        "name": "teal-300",
        "color": "73F4E3"
      },
      {
        "name": "teal-200",
        "color": "AAF8EE"
      },
      {
        "name": "teal-100",
        "color": "F8FFFE"
      },
      {
        "name": "teal-50",
        "color": "FCFFFF"
      }
    ]
  },
  {
    "paletteName": "Reds",
    "swatches": [
      {
        "name": "red-900",
        "color": "6F3747"
      },
      {
        "name": "red-800",
        "color": "A74761"
      },
      {
        "name": "red-700",
        "color": "C64C6A"
      },
      {
        "name": "red-600",
        "color": "DE4E70"
      },
      {
        "name": "red-500",
        "color": "EE5677"
      },
      {
        "name": "red-400",
        "color": "F7657E"
      },
      {
        "name": "red-300",
        "color": "F78397"
      },
      {
        "name": "red-200",
        "color": "F8AAB7"
      },
      {
        "name": "red-100",
        "color": "FFF8F9"
      }
    ]
  },
  {
    "paletteName": "Cool Grays",
    "swatches": [
      {
        "name": "cool-gray-900",
        "color": "1E2329"
      },
      {
        "name": "cool-gray-800",
        "color": "22272E"
      },
      {
        "name": "cool-gray-700",
        "color": "2D333B"
      },
      {
        "name": "cool-gray-600",
        "color": "373E47"
      },
      {
        "name": "cool-gray-500",
        "color": "444C56"
      },
      {
        "name": "cool-gray-400",
        "color": "59646F"
      },
      {
        "name": "cool-gray-300",
        "color": "768390"
      },
      {
        "name": "cool-gray-200",
        "color": "ADBAC7"
      },
      {
        "name": "cool-gray-150",
        "color": "CCD6E0"
      },
      {
        "name": "cool-gray-100",
        "color": "F1F8FF"
      }
    ]
  }
]

module.exports = {
  mode: 'jit',
  darkMode: 'media',
  purge: [
    './client/**/*.html',
    './client/**/*.js',
    './client/**/*.jsx',
    './client/**/*.ts',
    './client/**/*.tsx',
    './lib/**/*.js',
    './lib/**/*.jsx',
    './lib/**/*.ts',
    './lib/**/*.tsx',
  ],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      screens: {
        'print': {'raw': 'print'}, // @media print { ... }
      },
      colors: {
        gray: colors.trueGray,
        light: '#fafafa',
        primary1: '#f7657e',
        primary2: '#3cdbc6',

        ...exportedColors.map(c => c.swatches).reduce((a,b) => a.concat(b)).reduce((out, row) => {
          const pieces = row.name.split('-')
          const colorName = pieces.slice(0, pieces.length-1).join('-')
          const shade = pieces[pieces.length-1]
          out[colorName] = out[colorName] || {}
          out[colorName][shade] = `#${row.color}`
          return out
        }, {}),
      },
      fontFamily: {
        'ui': `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`.split(', '),
        'sans': [`"Informative"`, 'sans-serif'],
        'serif': `Constantia, "Lucida Bright", Lucidabright, "Lucida Serif", Lucida, "DejaVu Serif", "Bitstream Vera Serif", "Liberation Serif", Georgia, serif`.split(', '),
        'brand': [`'AllRoundGothic-Thick.otf'`, 'monospace'],
        'mono-brand': [`'Cutive Mono'`, 'monospace'],
      },
      fontSize: {
        'lg': ['1.0625rem', '1.75'], // 17px instead of 18px
      },

      // https://github.com/tailwindlabs/tailwindcss-typography#customization
      typography: {
        DEFAULT: {
          css: {
            h1: { fontWeight: '500' },
            h2: { fontWeight: '500' },
            h3: { fontWeight: '500' },
            h4: { fontWeight: '500' },
            h5: { fontWeight: '500' },
            h6: { fontWeight: '500' },
            p: { fontWeight: '300' },
            ul: { fontWeight: '300' },
            ol: { fontWeight: '300' },
            strong: { fontWeight: '500' },
          }
        },
      },
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
