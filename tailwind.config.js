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

const exportedColorsLearnEVM = [
  {
    "paletteName": "LearnEVM",
    "swatches": [
      {
        "name": "zinc-950",
        "color": "121315"
      },
      {
        "name": "zinc-900",
        "color": "18191C"
      },
      {
        "name": "zinc-800",
        "color": "202225"
      },
      {
        "name": "zinc-700",
        "color": "292B2F"
      },
      {
        "name": "zinc-600",
        "color": "2F3237"
      },
      {
        "name": "zinc-550",
        "color": "35373F"
      },
      {
        "name": "zinc-500",
        "color": "40444B"
      },
      {
        "name": "zinc-400",
        "color": "5A5E65"
      },
      {
        "name": "zinc-300",
        "color": "8E9299"
      },
      {
        "name": "zinc-200",
        "color": "B9BBBE"
      },
      {
        "name": "zinc-100",
        "color": "DCDDDE"
      },
      {
        "name": "zinc-50",
        "color": "F0F1F3"
      }
    ]
  }
]

function expandJsExtensions(path) {
  return [
    `${path}.js`,
    `${path}.jsx`,
    `${path}.ts`,
    `${path}.tsx`,
    `${path}.mjs`,
    `${path}.cjs`,
  ]
}

module.exports = {
  mode: 'jit',
  darkMode: 'media',
  purge: [
    './client/**/*.html',
    ...expandJsExtensions('./client/_lib/**/*'),
    ...expandJsExtensions('./client/learn_evm/**/*'),
    ...expandJsExtensions('./client/library/**/*'),
    ...expandJsExtensions('./lib/**/*'),
    ...expandJsExtensions('./scripts/**/*'),
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
        gray: {
          ...colors.trueGray,
          850: '#1f1f1f',
        },
        light: '#fafafa',
        primary1: '#f7657e',
        primary2: '#3cdbc6',

        // Backported from v3 https://github.com/tailwindlabs/tailwindcss/blob/master/src/public/colors.js
        zinc: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },

        ...exportedColors.concat(exportedColorsLearnEVM).map(c => c.swatches).reduce((a,b) => a.concat(b)).reduce((out, row) => {
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
        // Shift all others down a size
        'xl': defaultTheme.fontSize['lg'],
        '2xl': defaultTheme.fontSize['xl'],
        '3xl': defaultTheme.fontSize['2xl'],
        '4xl': defaultTheme.fontSize['3xl'],
        '5xl': defaultTheme.fontSize['4xl'],
        '6xl': defaultTheme.fontSize['5xl'],
        '7xl': defaultTheme.fontSize['6xl'],
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
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/typography'),
  ],
}
