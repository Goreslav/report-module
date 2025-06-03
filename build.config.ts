import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/module'
  ],
  declaration: false,
  clean: true,
  externals: [
    '@nuxt/kit',
    '@nuxt/schema',
    'nuxt',
    'vue',
    '#app',
    '#imports',
    'jiti'
  ],
  rollup: {
    emitCJS: true,
    inlineDependencies: false,
    esbuild: {
      target: 'node18'
    }
  },
  failOnWarn: false
})
