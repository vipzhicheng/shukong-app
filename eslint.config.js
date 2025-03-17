import js from '@eslint/js'
import globals from 'globals'
import vueParser from 'vue-eslint-parser'
import vuePlugin from 'eslint-plugin-vue'

export default [
  {
    ignores: ['dist/*', 'node_modules/*']
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser
      }
    },
    plugins: {
      vue: vuePlugin
    },
    rules: {
      'no-irregular-whitespace': 'off',
      'vue/no-parsing-error': [
        'error',
        {
          'x-invalid-end-tag': false,
          'invalid-first-character-of-tag-name': false
        }
      ]
    }
  }
]
