import { defineNuxtModule, createResolver, addImports, addComponent } from '@nuxt/kit'

export interface ReportModuleOptions {
  apiUrl?: string
  debug?: boolean
}

export default defineNuxtModule<ReportModuleOptions>({
  meta: {
    name: 'report-module',
    configKey: 'reportModule',
    compatibility: {
      nuxt: '^3.0.0'
    }
  },
  defaults: {
    apiUrl: '/api',
    debug: false
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Pridáme konfiguráciu do runtime config
    nuxt.options.runtimeConfig.public.reportModule = options

    // Registrácia komponentov
    addComponent({
      name: 'ModalContent',
      filePath: resolver.resolve('./runtime/components/ModalContent.vue')
    })

    addComponent({
      name: 'ReportModal',
      filePath: resolver.resolve('./runtime/components/ReportModal.vue')
    })

    // Registrácia composables
    addImports([
      {
        name: 'useReportModal',
        as: 'useReportModal',
        from: resolver.resolve('./runtime/composables/useReportModal')
      }
    ])

    if (options.debug) {
      console.log('Report Module Options:', options)
    }
  }
})
