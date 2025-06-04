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
    '#imports'
  ],
  rollup: {
    emitCJS: true,
    inlineDependencies: false
  },
  failOnWarn: false
})
