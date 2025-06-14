import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: [
    {
      input: 'src/module',
      name: 'module',
    },
    {
      input: 'src/runtime/',
      outDir: 'dist/runtime',
      declaration: false,
    },
  ],
  declaration: true,
  clean: true,
  externals: [
    '@nuxt/kit',
    '@nuxt/schema',
    'nuxt',
    'vue',
    '#app',
    '#imports',
    'ofetch',
    'html2canvas',
  ],
  rollup: {
    emitCJS: true,
    inlineDependencies: false,
    esbuild: {
      target: 'esnext',
      minify: false,
    },
  },
  failOnWarn: false,
  stub: false,
});
