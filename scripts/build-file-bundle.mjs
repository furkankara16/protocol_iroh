import { build } from 'esbuild';

await build({
  entryPoints: ['src/app.js'],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['chrome110', 'firefox110', 'safari15'],
  outfile: 'app.bundle.js',
  sourcemap: false,
  logLevel: 'info'
});
