import { defineNuxtModule, createResolver, addImports, addComponent } from '@nuxt/kit'
import { defu } from 'defu'

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
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // DEBUG: Úplne všetko
    console.log('=== MODULE SETUP DEBUG ===')
    console.log('🔧 typeof options:', typeof options)
    console.log('🔧 options keys:', Object.keys(options || {}))
    console.log('🔧 Raw options:', JSON.stringify(options, null, 2))
    console.log('===========================')

    // Použiť priamo options (bez defaults kým nevyriešime problém)
    const moduleOptions = options || {}

    console.log('🔧 Using moduleOptions:', moduleOptions)

    // Pridáme konfiguráciu do runtime config
    nuxt.options.runtimeConfig.public.reportModule = moduleOptions

    // Registrácia komponentov
    addComponent({
      name: 'ModalContent',
      filePath: resolver.resolve('./runtime/components/ModalContent.vue')
    })

    addComponent({
      name: 'ReportModal',
      filePath: resolver.resolve('./runtime/components/ReportModal.vue')
    })

    addComponent({
      name: 'FileUpload',
      filePath: resolver.resolve('./runtime/components/FileUpload.vue')
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
