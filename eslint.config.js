import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([
    '.next/**',
    'coverage/**',
    'out/**',
    'dist/**',
    'node_modules/**',
    'src/generated/prisma/**',
    'next-env.d.ts',
  ]),
  {
    files: ['src/template/**/*.{js,jsx,ts,tsx}'],
    rules: {
      '@next/next/no-img-element': 'off',
    },
  },
  {
    files: [
      'src/app/(cafe)/**/*.{js,jsx,ts,tsx}',
      'src/components/**/*.{js,jsx,ts,tsx}',
      'src/features/**/*.{js,jsx,ts,tsx}',
      'src/lib/**/*.{js,jsx,ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/template',
                '@/template/*',
                '**/template',
                '**/template/*',
              ],
              message:
                'O template é somente uma referência. Copie e adapte o componente para o código do produto.',
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
