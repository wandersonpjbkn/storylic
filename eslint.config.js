import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import sonarjs, { configs as sonarjsConfigs } from 'eslint-plugin-sonarjs'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

// import.meta.env.VITE_ENV === 'production'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,

  {
    name: 'app/vite-config-overrides',
    files: ['vite.config.{js,ts,mjs,mts}'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },

  {
    name: 'app/rules',
    plugins: { sonarjs },
    rules: {
      ...sonarjsConfigs.recommended.rules,

      // SonarJS — relaxamentos justificados (não silenciar em massa):
      // o shuffle das cartas não é contexto de segurança (não precisa de CSPRNG).
      'sonarjs/pseudo-random': 'off',
      // o modo LAN (feature) conecta em http://IP na rede local, que não tem https.
      'sonarjs/no-clear-text-protocols': 'off',

      // Vue specific rules
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/prop-name-casing': 'off',
      'vue/no-template-shadow': 'off',

      // Console and debugging
      'no-console': 'off',
      'no-debugger': 'warn',

      // Bitwise and syntax
      'no-bitwise': 'off',
      'no-restricted-syntax': 'off',

      // Naming conventions
      'no-underscore-dangle': 'off',
      camelcase: 'off',

      // Function and parameter rules
      'no-param-reassign': 'off',
      'no-shadow': 'off',
      'consistent-return': 'off',
      'array-callback-return': 'off',

      // Loop and flow control
      'no-await-in-loop': 'off',
      'no-continue': 'off',
      'no-nested-ternary': 'off',
      'no-plusplus': [
        'error',
        {
          allowForLoopAfterthoughts: true,
        },
      ],

      // Global and require
      'no-restricted-globals': 'off',
      'global-require': 'off',

      // Operators and templates
      'operator-assignment': 'off',
      'template-curly-spacing': 'off',

      // Import/Export rules
      'import/prefer-default-export': 'off',

      // TypeScript specific overrides
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  globalIgnores([
    '**/dist/**',
    '**/dist-ssr/**',
    '**/dev-dist/**',
    '**/coverage/**',
    '**/src/assets/icons/*',
    '**/src/assets/svg/*',
    '**/src/components/_**/*',
    '**/src/views/_**/*',
  ]),

  skipFormatting,
)
