import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';

export default {
  input: 'src/index.tsx',
  output: [
    {
      file: 'dist/bundle.js',
      format: 'iife',
      name: 'CryptoChess',
      sourcemap: true,
    },
    {
      file: 'dist/bundle.min.js',
      format: 'iife',
      name: 'CryptoChess',
      plugins: [terser()],
    },
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    postcss({
      plugins: [autoprefixer()],
      extract: true,
    }),
  ],
  external: ['react', 'react-dom'],
  globals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
};
