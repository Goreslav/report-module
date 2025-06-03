import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/module'
  ],
  clean: true,
  stub: true,
  externals: [
    '@nuxt/kit'
  ]
})
